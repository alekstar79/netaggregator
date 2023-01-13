<?php /** @noinspection PhpUndefinedFieldInspection */

declare(strict_types=1);

namespace App\Service\Stream;

use React\EventLoop\LoopInterface;
use Ratchet\Client\{ WebSocket, function connect };
use Ratchet\RFC6455\Messaging\MessageInterface;
use Ratchet\ConnectionInterface;

use SplObjectStorage;
use MongoDB\Client;
use DateTime;

use ReflectionException;
use RuntimeException;
use Exception;
use Throwable;

use App\Model\StreamRepositoryInterface;

use Censure;

/**
* Class Retranslator
* @package App\Service\Stream
* @note A service token for the embedded app required, not the mini app
*/
class Retranslator implements RetranslatorInterface
{
    /** @var StreamRepositoryInterface */
    protected StreamRepositoryInterface $repository;

    /** @var SplObjectStorage */
    protected SplObjectStorage $clients;

    /** @var HttpClientInterface */
    protected HttpClientInterface $http;

    /** @var LoopInterface */
    protected LoopInterface $loop;

    /** @var int */
    protected int $empty;

    /** @var array */
    protected array $users;

    /** @var array */
    protected array $tags;

    /** @var string */
    protected $key;

    /** @var string */
    protected string $url;

    public function __construct(HttpClientInterface $http, StreamRepositoryInterface $repository, Client $mongo, LoopInterface $loop)
    {
        if (!$key = $mongo->app->appkeys->findOne([], self::MAP)['stream_key']) {
            $key = $http->key();
        }

        $this->clients = new SplObjectStorage;
        $this->repository = $repository;
        $this->empty = PHP_INT_MAX;
        $this->url = self::ADDR;
        $this->key = $key;

        $this->loop = $loop;
        $this->http = $http;

        $this->users = [];
        $this->tags = [];

        $this->refresh();
        $this->connect();
    }

    private function log(string $record): void
    {
        file_put_contents(__DIR__ . '/error.log', $record . "\n", 8);
    }

    private function verify($conn): int
    {
        $path = $conn->httpRequest->getUri()->getPath();

        /* if (preg_match('/^\/stream\/default$/', $path)) {
            return self::DEFAULT_USER;
        } */

        if (!preg_match('/^\/stream\/(\d+)$/', $path, $m)) {
            throw new RuntimeException('Auth failed', 511);
        }

        return (int) $m[1];
    }

    private function exist(string $text, array $list): bool
    {
        return (bool) preg_match('~\s?(' . implode('|', $list) . ')\s?~ui', $text);
    }

    private function decode(string $json): array
    {
        try {

            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);

        } catch (Throwable $e) {
        }

        return [];
    }

    /**
    * @throws ReflectionException
    */
    private function stop(string $text, array $params): bool
    {
        $swear = $words = false;

        if ($set = $params['stop']) {
            $swear = $set['swear'] ? Censure::parse($text) : false;

            if (!$swear && $set['list']) {
                $words = $this->exist($text, $set['list']);
            }
        }

        return $swear || $words;
    }

    private function http(array $q, array $data): void
    {
        $this->http->http->requestAsync(
            $q['method'],
            $q['url'],
            $q['method'] === 'POST'
                ? ['form_params' => $data]
                : ['json' => $data]
        )
            ->wait(false);
    }

    private function send(array $uids, string $msg): void
    {
        $this->clients->rewind();

        while ($this->clients->valid()) {
            if (isset($uids[$this->clients->getInfo()])) {
                $this->clients->current()->send($msg);
            }

            $this->clients->next();
        }
    }

    private function findByTags(array $tags): array
    {
        array_push($this->tags, ...$tags);

        $users = [];

        foreach ($this->users as $uid => $set) {
            if (array_intersect($set['tags'], $tags)) {
                $users[$uid] = $set;
            }
        }

        return $users;
    }

    private function checkRestart(): void
    {
        $empty = time();

        if ($this->empty === PHP_INT_MAX) {
            $this->empty = $empty + 180;
        }
        if ($this->empty < $empty) {
            $dt = new DateTime();
            $t = $dt->format('Y-m-d H:i:s');
            $this->log("Date: $t\nRetranslator restarted after exceeding the waiting limit\n");
            $this->loop->stop();
        }
    }

    public function refresh(): void
    {
        $users = $this->repository->all();

        foreach ($users as $uid => $user) {
            if ($user['tags']) {
                $users[$uid]['tags'] = array_column($user['tags'], 'tag');
            } else {
                unset($users[$uid]);
            }
        }

        if ($this->tags) {
            $tags = array_count_values($this->tags);
            $this->repository->increment($tags);
            $this->repository->updateLinesChart($tags);
            $this->empty = PHP_INT_MAX;
        } else {
            $this->checkRestart();
        }

        $this->users = $users;
        $this->tags = [];
    }

    public function slice(): void
    {
        $this->repository->sliceLineChart();
    }

    /**
    * @throws ReflectionException
    */
    public function handle(MessageInterface $msg): void
    {
        $data = $this->decode((string) $msg);

        if ($data && $data['code'] === 100) {
            $text = strip_tags($data['event']['text']);
            $tags = $data['event']['tags'];
            $uids = [];

            foreach($this->findByTags($tags) as $uid => $set) {
                if ($this->stop($text, $set)) {
                    continue;
                }
                if (($set['query'] ?? []) && $set['query']['url']) {
                    $this->http($set['query'], $data);
                }

                $uids[$uid] = true;
            }

            if ($uids && $this->clients->count()) {
                $this->send($uids, (string) $msg);
            }
        }
    }

    public function connect(): void
    {
        connect($this->url . "?key=$this->key", [], [], $this->loop)->then([$this, 'clientConnect'], [$this, 'clientError']);
    }

    public function regenerate(): void
    {
        try {

            $this->key = $this->http->key();
            $this->empty = PHP_INT_MAX;

            $this->loop->addTimer(30, [$this, 'connect']);

        } catch (Throwable $e) {
        }
    }

    public function clientConnect(WebSocket $conn): void
    {
        $conn->on('message', [$this, 'handle']);
        $conn->on('close', function() {
            $this->key = $this->http->key();
            $this->empty = PHP_INT_MAX;

            $this->loop->addTimer(30, [$this, 'connect']);
        });
    }

    public function clientError(Exception $e): void
    {
        $raw = $e->getMessage();

        $array = explode("\n", $raw);
        $json = array_pop($array);
        $msg = $this->decode($json);

        if (json_last_error() === JSON_ERROR_NONE) {
            $error = $msg['error'] ?? [];

            switch ($error['error_code'] ?? 0) {
                case 1004: // Неправильное значение параметра "key"
                case 1007: // Key was not found or it was expired
                    $this->regenerate();
                    break;

                case 1006: // Такое соединение уже установлено
                    break;

                case 1000: // Неверно переданы параметры для обновления соединения до WebSocket
                case 1001: // Неподдерживаемый HTTP-метод
                case 1002: // Ключ “Content-type” либо отсутствует, либо не равен ожидаемому значению
                case 1003: // Отсутствует параметр "key"
                case 1005: // Недопустимое значение параметра "stream_id" (для расширенной версии)
                case 2000: // Не удалось распарсить JSON в теле запроса
                case 2001: // Правило с таким tag уже присутствует в этом потоке
                case 2002: // Правило с таким tag отсутствует в этом потоке
                case 2003: // Не удалось распарсить содержимое rule
                case 2004: // Слишком много фильтров в одном правиле
                case 2005: // Непарные кавычки
                case 2006: // Слишком много правил в этом потоке
                case 2008: // Должно быть хотя бы одно ключевое слово без минуса
                    $this->log($raw);
            }
        }
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
    }
}
