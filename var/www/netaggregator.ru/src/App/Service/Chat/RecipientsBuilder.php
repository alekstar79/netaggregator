<?php
/**
* @noinspection PhpMultipleClassDeclarationsInspection
* @noinspection PhpUndefinedFieldInspection
*/

declare(strict_types=1);

namespace App\Service\Chat;

use MongoDB\{ Client, Database, UpdateResult };
use MongoDB\Driver\Cursor;

use GearmanClient;
use DateTime;
use stdClass;

use Process\{ ProducerInterface, IMPDaemon };
use App\VkApi\APIClientInterface;

use RuntimeException;
use Exception;
use Throwable;

/**
* Class RecipientsBuilder
* @package App\Service\Chat
*/
class RecipientsBuilder implements RecipientsBuilderInterface
{
    /** @var APIClientInterface */
    private APIClientInterface $vk;

    /** @var GearmanClient */
    private GearmanClient $gearman;

    /** @var Database */
    private Database $db;

    /** @var Mailer */
    private Mailer $mailer;

    /** @var bool|int */
    private $connection = false;

    public function __construct(APIClientInterface $vk, IMPDaemon $demon, ProducerInterface $producer, Client $mongo)
    {
        register_shutdown_function(static fn() => exec('service gearman-job-server restart'));

        $this->gCommunication();

        $this->mailer = Mailer::create($vk);
        $this->db = $mongo->app;
        $this->vk = $vk;

        $producer->consumer([$demon, 'fork'], 'perform');

        $demon->setTimer(1, [$this, 'shedule']);
        $demon->setWorker([$this, 'perform']);
        $demon->start($producer);
    }

    private function gCommunication(): void
    {
        $this->gearman = new GearmanClient();

        if (!$this->gearman->addServer()) {
            throw new RuntimeException($this->gearman->error());
        }
    }

    private function testMongo(): void
    {
        $pid = getmypid();

        if ($this->connection !== $pid) { try {
            $res = $this->db->command(['dbstats' => 1], self::MAP);

            $stats = current($res->toArray());

            if ($stats['ok'] ?? false) {
                $this->connection = $pid;
            }

        } catch (Throwable $e) {
            sleep(3);
        } }
    }

    private function read(array $set): ?array
    {
        try {
            return $this->db->mailing->findOne(['gid' => $set['gid']], self::MAP);
        } catch (Throwable $e) {
            return null;
        }
    }

    private function update(int $gid, array $set): ?UpdateResult
    {
        try {
            return $this->db->mailing->updateOne(['gid' => $gid], ['$set' => $set]);
        } catch (Throwable $e) {
            return null;
        }
    }

    private function count(int $gid): int
    {
        $c = null;

        try {

            $c = $this->db->mailing->aggregate([
                ['$match' => compact('gid')],
                ['$project' => [
                    'count' => [
                        '$cond' => [
                            'if' => ['$isArray' => '$subscribers'],
                            'then' => ['$size' => '$subscribers'],
                            'else' => 0
                        ]
                    ]
                ]],
            ]);

        } catch (Throwable $e) {
        }

        return $c instanceof Cursor
            ? $c->toArray()[0]['count']
            : 0;
    }

    private function milliseconds(): int
    {
        $mt = explode(' ', microtime());

        return ((int) $mt[1]) * 1000 + ((int) round($mt[0] * 1000));
    }

    private function extract(array $list): array
    {
        return array_map(
            static fn($c) => $c['peer']['id'],
            array_filter(
                array_column($list, 'conversation'),
                static fn($c) => $c['peer']['type'] === 'user' && $c['can_write']['allowed']
            )
        );
    }

    private function response(array $result, array $set): string
    {
        $ret = '{"status": "Internal Error"}';

        try {

            $ret = json_encode(
                array_merge($result, ['gid' => $set['gid'] ?? null, 'uid' => $set['uid'] ?? null]),
                JSON_THROW_ON_ERROR
            );

        } catch (Throwable $e) {
        }

        return $ret;
    }

    private function inRange(array $u, ?int $from, ?int $to): bool
    {
        $bdt = explode('.', $u['bdate']);

        if (count($bdt) !== 3) {
            return true;
        }

        try {
            $age = (new DateTime())->diff(new DateTime($u['bdate']))->y;
        } catch (Exception $e) {
            return true;
        }

        $to = $to ?: PHP_INT_MAX;
        $from = $from ?: 0;

        return $from < $age && $to > $age;
    }

    private function bDate(array $u, int $v): bool
    {
        $bdt = explode('.', $u['bdate']);

        $year = date('Y') + ($bdt[1].$bdt[0] <= date('md'));
        $bdt = mktime(0, 0, 0, (int) $bdt[1], (int) $bdt[0], $year);

        return ceil(($bdt - time()) / 86400) < $v;

    }

    private function uids(array $set): array
    {
        if (!$m = $this->read($set)) {
            return [];
        }

        $message = $m['message'] ?? $m['text'] ?? '';
        $attachments = array_column($m['attachments'] ?? [], 'mark');
        $keyboard = $m['keyboard'] ?? [];
        $excluded = $m['excluded'] ?? [];
        $ids = [];

        if ($subscribers = $m['subscribers']) {
            $ids = array_column($subscribers, 'id');
        }
        if ($ids && $excluded) {
            $excluded = array_flip($excluded);

            $ids = array_filter(
                $ids,
                static function($id) use($excluded) {
                    return !isset($excluded[$id]);
                }
            );
        }

        return compact('ids','message','attachments','keyboard');
    }

    private function members(array $uids, int $gid, int $default): array
    {
        return $this->vk->groups->isMembers($uids, $gid) ?: $this->defaultMap($uids, $default);
    }

    private function defaultMap(array $uids, int $member): array
    {
        return array_map(static function(int $user_id) use ($member) {
            return compact('user_id', 'member');
        }, $uids);
    }

    private function startMarker(int $gid, string $progress): void
    {
        $extra = $progress === 'build' ? ['subscribers' => [], 'count' => 0] : [];

        $this->update($gid, array_merge(compact('progress'), $extra));
    }

    private function stopMarker(int $gid, int $c = null): void
    {
        $this->update($gid, array_merge(['progress' => '', 'handled' => true], $c !== null ? ['count' => $c] : []));
    }

    private function calculate(array $doc, array $set): array
    {
        $this->vk->setToken($set['token']);
        $excluded = [];

        $list = array_filter($doc['subscribers'], function($u) use($set, &$excluded) {
            $ret = true;

            foreach ($set['filters'] as $k => $v) {
                if ($k === 'firstname' || $k === 'lastname') {
                    $k = str_replace('name', '_name', $k);
                }
                if (!isset($u[$k === 'age' ? 'bdate' : $k])) {
                    continue;
                }

                switch ($k) {
                    case 'sex':
                        $ret = $u[$k] === $v;
                        break;
                    case 'first_name':
                    case 'last_name':
                    case 'relation':
                        $ret = in_array($u[$k], $v, false);
                        break;
                    case 'city';
                        $ret = in_array($u[$k]['id'], array_column($v, 'id'), false);
                        break;
                    case 'age':
                        $ret = $this->inRange($u, $v['from'], $v['to']);
                        break;
                    case 'bdate':
                        $ret = $this->bDate($u, $v);
                        break;
                    case 'member':
                        $ret = true;
                }

                if (!$ret) {
                    $excluded[] = $u['id'];
                    break;
                }
            }

            return $ret;

        }, 1);

        if (array_key_exists('member', $set['filters'])) {
            $f = $set['filters']['member'] === 2 ? 0 : 1;

            $list = array_filter(
                $this->members(array_column($list, 'id'), $set['gid'], $f),
                static function($u) use($f, &$excluded) {
                    if ($u['member'] !== $f) {
                        $excluded[] = $u['user_id'];
                        return false;
                    }

                    return true;
                }
            );
        }

        return [$list, $excluded];
    }

    private function import(array $set): array
    {
        $this->startMarker($set['gid'], 'build');
        $this->vk->setToken($set['token']);

        foreach ($this->vk->users->gen($set['data'], self::FIELDS) as $u) {
            $this->db->mailing->updateOne(['gid' => $set['gid']], [
                '$push' => ['subscribers' => ['$each' => $u]]
            ]);
        }

        $count = $this->count($set['gid']);
        $this->stopMarker($set['gid'], $count);

        return [
            'handled' => true,
            'action' => 'import',
            'count' => $count,
            'done' => true
        ];
    }

    private function build(array $set): array
    {
        $this->startMarker($set['gid'], 'build');
        $this->vk->setToken($set['token']);

        foreach ($this->vk->messages->getConversations() as $c) { try {
            foreach ($this->vk->users->gen($this->extract($c), self::FIELDS) as $u) {
                $this->db->mailing->updateOne(['gid' => $set['gid']], [
                    '$push' => ['subscribers' => ['$each' => $u]]
                ]);
            }

        } catch (Throwable $e) {
        } }

        $count = $this->count($set['gid']);
        $this->stopMarker($set['gid'], $count);

        return [
            'handled' => true,
            'action' => 'build',
            'count' => $count,
            'done' => true
        ];
    }

    private function filter(array $set): array
    {
        $this->startMarker($set['gid'], 'filter');

        $count = 0;

        if ($doc = $this->read($set)) {
            [$list, $excluded] = $this->calculate($doc, $set);
            $count = count($list);

            $this->update($set['gid'], [
                'filters' => $set['filters'],
                'excluded' => $excluded,
                'filtered' => $count
            ]);
        }

        $this->stopMarker($set['gid']);

        return [
            'handled' => true,
            'action' => 'filter',
            'filtered' => $count,
            'done' => true
        ];
    }

    private function start(array $set): array
    {
        $response = ['handled' => true, 'action' => 'start', 'done' => false];

        if ($d = $this->uids($set)) {
            $msg = Message::create(
                $d['message'],
                $d['attachments'],
                Message::buildKeyboard($d['keyboard'])
            );

            // todo: do not forget to remove this stub in production mode
            // $ids = array_filter($d['ids'], static fn($id): bool => $id === 25520481);
            $ids = $d['ids'];

            $this->mailer->setToken($set['token']);
            $this->mailer->setMessage($msg);
            $this->mailer->setIds($ids);

            try {

                if ($this->mailer->send($this->milliseconds())) {
                    $response['done'] = true;
                }

            } catch (Throwable $e) {
            }
        }

        return $response;
    }

    private function defer(array $shedule): array
    {
        $response = ['handled' => true, 'action' => 'defer', 'done' => false];

        $r = $this->update($shedule['gid'], compact('shedule'));

        if ($r && $r->isAcknowledged()) {
            $response['done'] = true;
        }

        return $response;
    }

    private function clear(array $shedule): void
    {
        $this->db->mailing->updateOne(['gid' => $shedule['gid']], ['$set' => ['shedule' => new stdClass]]);
    }

    public function shedule(): void
    {
        $this->testMongo();

        try {

            $now = $this->milliseconds() + 3e3;

            if ($docs = $this->db->mailing->find(['shedule.action' => 'defer', 'shedule.time' => ['$lte' => $now]], self::MAP)->toArray())
            {
                foreach ($docs as $task) { try {
                    $task['shedule']['action'] = 'start';
                    $this->gearman->doBackground('perform', json_encode($task['shedule'], JSON_THROW_ON_ERROR));

                } catch (Throwable $e) {
                } }

                $set = ['shedule' => new stdClass];

                $this->db->mailing->bulkWrite(
                    array_map(static function($_id) use($set) {
                        return ['updateOne' => [['_id' => $_id], ['$set' => $set]]];
                    }, array_column($docs, '_id'))
                );
            }

        } catch (Throwable $e) {
        }
    }

    public function perform(array $set): void
    {
        $result = ['error' => 'perform', 'done' => false];

        try {

            if (isset($set['action'], $set['gid'], $set['uid'])) {
                switch ($set['action']) {
                    case 'attach':
                        $this->update($set['gid'], ['attachments' => $set['attachments']]);
                        $result = null;
                        break;
                    case 'keyboard':
                        $this->update($set['gid'], ['keyboard' => $set['keyboard']]);
                        $result = null;
                        break;
                    case 'save':
                        $this->update($set['gid'], ['text' => $set['text']]);
                        $result = null;
                        break;
                    case 'import':
                        $result = $this->import($set);
                        break;
                    case 'filter':
                        $result = $this->filter($set);
                        break;
                    case 'build':
                        $result = $this->build($set);
                        break;
                    case 'start':
                        $result = $this->start($set);
                        break;
                    case 'defer':
                        $result = $this->defer($set);
                        break;
                    case 'clear':
                        $this->clear($set);
                        $result = null;
                }
            }

        } catch (Throwable $e) {
        }

        if (is_array($result)) {
            $this->gearman->doBackground('done', $this->response($result, $set));
        }
    }
}
