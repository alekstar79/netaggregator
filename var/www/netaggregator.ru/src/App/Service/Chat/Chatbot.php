<?php

/**
* @noinspection PhpMultipleClassDeclarationsInspection
* @noinspection PhpUndefinedFieldInspection
*/

declare(strict_types=1);

namespace App\Service\Chat;

use RecursiveIteratorIterator;
use RecursiveArrayIterator;
use MongoDB\Database;
use MongoDB\Client;

use App\Auxiliary\VkEvents\EventInterface;

use App\VkApi\APIClientInterface;
use App\VkApi\APIClientFactory;
use App\VkApi\TransportFactory;
use App\VkApi\RejectInterface;

use JsonException;
use Throwable;

/**
 * Class Chatbot
 * @package App\Service\Chat
 */
class Chatbot implements ChatbotInterface
{
    private const FIELDS = ['sex','bdate','city','education'];

    /** @var RecursiveIteratorIterator */
    public RecursiveIteratorIterator $event;

    /** @var APIClientInterface */
    public APIClientInterface $vk;

    /** @var Database */
    public Database $db;

    /** @var string */
    public string $accessToken;

    /** @var string */
    public string $groupToken;

    /** @var int */
    public int $status;

    /** @var int */
    public int $gid;

    /** @var int */
    public int $uid;

    /** @var string|null */
    public ?string $sid;

    /** @var array */
    public array $dialog;

    /** @var array */
    public $defaultKeyboard;

    /** @var array */
    private array $extra;

    public function __construct(APIClientInterface $vk, Client $mongo, array $event)
    {
        $this->event = new RecursiveIteratorIterator(new RecursiveArrayIterator($event));

        $this->rid = (int) $this->extract('random_id');
        $this->gid = (int) $this->extract('group_id');
        $this->uid = (int) $this->extract('from_id');

        $this->db = $mongo->app;
        $this->vk = $vk;

        // $this->sid = null;

        /* try {

            $history = $vk->messages->getHistory($this->uid, 0, 1)['items'] ?? [];
            $hid = isset($history[0]) ? (int) $history[0]['from_id'] : $this->uid;

            if ($hid === -$this->gid) {
                exit();
            }

        } catch (Throwable $e) {
        } */

        $this->sid = $this->find(['uid' => $this->uid], 'story')['sid'] ?? null;
        $this->dialog = $this->find(['connections' => $this->gid]);

        $this->defaultKeyboard = $this->dialog['keyboard'] ?? [];

        if ($this->dialog) {
            $vk->messages->setActivity($this->uid);
        }
    }

    private function find(array $filter, string $c = 'chat'): array
    {
        return $this->db->{$c}->findOne($filter, self::MAP) ?: [];
    }

    private function store(Colloquial $c): void
    {
        if (!$c->continue) {
            $this->db->story->deleteOne(['uid' => $this->uid]);
            return;
        }

        /* try {

            file_put_contents(__DIR__ . '/store-update.json', json_encode([
                'continue' => $c->continue

            ], JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        } catch (Throwable $e) {
        } */

        $this->db->story->updateOne(
            ['uid' => $this->uid],
            ['$set' => ['sid' => $c->sid]],
            ['upsert' => true]
        );
    }

    /**
     * @throws JsonException
     */
    private function extractFromPayload(): ?string
    {
        $payload = [];

        if ($p = $this->extract('payload')) {
            $payload = json_decode($p, true, 512, JSON_THROW_ON_ERROR);
        }

        return $payload['cmd'] ?? null;
    }

    private function setStatus(string $cmd): bool
    {
        $commands = (array) ($this->extra['commands'] ?? []);

        foreach ($commands as $status => $mark) {
            if ($mark === $cmd) {
                $this->status = $status;
                return true;
            }
        }

        return false;
    }

    /**
     * @throws JsonException
     */
    private function isBuiltInCommand(): bool
    {
        $cmd = $this->extractFromPayload() ?: $this->extract('text');

        if (preg_match('/^#[a-z]+$/', $cmd, $m)) {
            return $this->setStatus($m[0]);
        }

        return false;
    }

    private function getLink(): ?MakerInterface
    {
        $lnk = null;

        switch ($this->status) {
            case self::MUSIC: $lnk = new Music($this); break;
            case self::PHOTO: $lnk = new Photo($this); break;
            case self::SIGNA: $lnk = new Signa($this); break;
            case self::VIDEO: $lnk = new Video($this); break;
        }

        return $lnk;
    }

    private function makeLink(MakerInterface $lnk): array
    {
        $set = ['Вот...','Держи...','Хватай...','Лови...'];
        $text = 'Упсс... кажется ничего нет';
        $attachments = [];
        $keyboard = [];

        if ($mark = $lnk->make()) {
            $attachments = [compact('mark')];
            $text = $set[array_rand($set)];
        }

        return compact('attachments','keyboard','text');
    }

    private function send(array $set, Colloquial $c): void
    {
        $attachments = (array) ($set['attachments'] ?? []);
        $keyboard = (array) ($set['keyboard'] ?? []);

        if (!$attachments) {
            $attachments = $c->attachments ?: [];
        }
        if (!$keyboard || !$keyboard['children']) {
            $keyboard = $c->keyboard;
        }
        if (!$keyboard || !$keyboard['children']) {
            $keyboard = $this->defaultKeyboard;
        }

        $mailer = new Mailer($this->vk);

        $mailer->setToken($this->groupToken);
        $mailer->setMessage(Message::create(
            $set['text'] ?? '',
            array_column($attachments, 'mark'),
            Message::buildKeyboard($keyboard)
        ));

        $mailer->setIds([$this->uid]);

        try {
            $mailer->send($this->rid);
        } catch (Throwable $e) {
        }
    }

    private function commandResponse(): array
    {
        $lnk = $this->getLink();
        $set = [];

        if ($lnk instanceof MakerInterface) {
            $set = $this->makeLink($lnk);
        }

        return $set;
    }

    public function getUser(int $uid = null): array
    {
        $uid || ($uid = $this->uid);

        // capped collection 512M
        if (!$user = $this->db->cache->findOne(['id' => $uid], self::MAP)) {
            try {

                $user = $this->vk->users->get($uid, self::FIELDS)[0];
                $this->db->cache->insertOne($user);

            } catch (RejectInterface $e) {
            }
        }

        return $user ?: [];
    }

    public function extract(string $key)
    {
        foreach($this->event as $k => $v) {
            if ($k === $key) {
                return $v;
            }
        }

        return null;
    }

    /**
     * @throws JsonException
     */
    public function perform(): void
    {
        $set = $this->isBuiltInCommand() ? $this->commandResponse() : [];
        $chat = Colloquial::create($this);

        if (!$set && $this->dialog) {
            $set = $chat->talk();
        }

        $this->send($set, $chat);
        $this->store($chat);
    }

    public static function create(array $data, array $extra = []): EventInterface
    {
        $c = $data['credential'];
        $e = $data['event'];

        $http = TransportFactory::create($c['group_token']);
        $vk   = APIClientFactory::create($http);

        $chat = new self($vk, new Client, $e);

        $chat->accessToken = $c['access_token'] ?? $c['accessToken'];
        $chat->groupToken = $c['group_token'] ?? $c['groupToken'];
        $chat->extra = $extra;

        return $chat;
    }
}
