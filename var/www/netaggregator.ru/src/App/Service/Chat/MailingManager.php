<?php
/**
* @noinspection PhpMultipleClassDeclarationsInspection
* @noinspection PhpUndefinedFieldInspection
*/

declare(strict_types=1);

namespace App\Service\Chat;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

use MongoDB\Collection;
use MongoDB\Client;

use GearmanClient;
use GearmanWorker;
use GearmanJob;

use SplObjectStorage;
use RuntimeException;
use JsonException;
use Exception;

/**
* Class MailingManager
* @package App\Service\Chat
*/
class MailingManager implements MessageComponentInterface
{
    public const

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        TIMER = 1;

    /** @var Collection */
    protected Collection $gtokens;

    /** @var SplObjectStorage */
    protected SplObjectStorage $clients;

    /** @var GearmanClient */
    protected GearmanClient $gClient;

    /** @var GearmanWorker */
    protected GearmanWorker $gWorker;

    public function __construct(Client $mongo)
    {
        $this->clients = new SplObjectStorage;
        $this->gtokens = $mongo->app->gtokens;

        $this->gCommunication();
    }

    private function gCommunication(): void
    {
        $client = new GearmanClient;
        $worker = new GearmanWorker;

        $worker->addOptions(GEARMAN_WORKER_NON_BLOCKING);
        $worker->addFunction('done', [$this, 'receive']);

        if (!$client->addServer()) {
            throw new RuntimeException($client->error());
        }
        if (!$worker->addServer()) {
            throw new RuntimeException($worker->error());
        }

        $this->gClient = $client;
        $this->gWorker = $worker;
    }

    private function verify($conn): int
    {
        $path = $conn->httpRequest->getUri()->getPath();

        if (!preg_match('/^\/mailing\/(\d+)$/', $path, $m)) {
            throw new RuntimeException('Auth failed', 511);
        }

        return (int) $m[1];
    }

    private function safeEncode(array $data): string
    {
        $ret = '{"status": "Internal Error"}';

        try {

            $ret = json_encode($data, JSON_THROW_ON_ERROR);

        } catch (JsonException $e) {
        }

        return $ret;
    }

    private function safeDecode(string $json): array
    {
        try {

            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);

        } catch (JsonException $e) {
        }

        return [];
    }

    private function send(array $uids, string $msg): void
    {
        if (!$this->clients->count()) {
            return;
        }

        $uids = array_flip($uids);

        $this->clients->rewind();

        while ($this->clients->valid()) {
            if (!$uids || isset($uids[$this->clients->getInfo()])) {
                $this->clients->current()->send($msg);
            }

            $this->clients->next();
        }
    }

    public function receive(GearmanJob $job): void
    {
        $raw = $job->workload();
        $set = $this->safeDecode($raw);

        if ($uid = $set['uid']) {
            $this->send([$uid], $this->safeEncode(array_merge($set, ['progress' => false])));
        }
    }

    public function listen(): void
    {
        $this->gWorker->work();
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        try {
            $this->clients->attach($conn, $this->verify($conn));
        } catch (RuntimeException $e) {
            $conn->close();
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, Exception $e): void
    {
        $this->onClose($conn);
        $conn->close();
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {
        $part = explode('/', $from->httpRequest->getUri()->getPath());
        $task = $this->safeDecode($msg);
        $uid  = (int) array_pop($part);

        if (isset($task['gid'], $task['action']) && (
            $t = $this->gtokens->findOne(['group_id' => $task['gid']], self::MAP)
        )) {

            $this->gClient->doBackground(
                'perform',
                $this->safeEncode(array_merge($task, [
                    'token' => $t['group_token'],
                    'uid' => $uid
                ]))
            );

            return;
        }

        $this->send([$uid], $this->safeEncode([
            'error' => 'Task parsing failed',
            'progress' => false,
            'done' => false
        ]));
    }
}
