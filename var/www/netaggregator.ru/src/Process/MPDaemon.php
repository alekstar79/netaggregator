<?php /** @noinspection PhpMissingReturnTypeInspection */

declare(strict_types=1);

namespace Process;

/**
 * Class MPDaemon
 * An easy way to demonize and parallelize the process
 * @compability UNIX-like OS (*nix)
 * @package Process
 */
class MPDaemon implements IMPDaemon
{
    /** @var TimerInterface */
    private TimerInterface $timer;

    /** @var callable */
    private $destroyer;

    /** @var callable */
    private $worker;

    /** @var resource|bool */
    private $lock;

    /** @var int */
    private int $size;

    /** @var array */
    private array $pool;

    /** @var bool */
    private bool $loop;

    public function __construct(int $size, string $file)
    {
        $this->lock = $this->lock($file);
        $this->size = $size;
        $this->pool = [];

        $this->signals();
    }

    public function __destruct()
    {
        if (is_resource($this->lock)) {
            flock($this->lock, LOCK_UN);
        }
    }

    private function lock(string $file)
    {
        if (!(file_exists($file) || touch($file)) ||
            !(($f = fopen($file, 'cb')) && flock($f, LOCK_EX|LOCK_NB))) {
            die(self::LOCKING_ERROR);
        }

        return $f;
    }

    private function signals(): void
    {
        $signals = [SIGCHLD, SIGTSTP, SIGTERM, SIGHUP, SIGINT];
        $handler = $this->sigHandler();

        foreach ($signals as $sig) {
            if (!pcntl_signal($sig, $handler)) {
                die(self::SIGNALS_ERROR);
            }
        }
    }

    private function broadcast(int $sig): void
    {
        foreach ($this->pool as $pid) {
            posix_kill($pid, $sig);
        }
    }

    private function sync(): void
    {
        foreach ($this->pool as $i => $pid) {
            if (pcntl_waitpid($pid, $status, WNOHANG)) {
                unset($this->pool[$i]);
            }
        }
    }

    private function destroy(bool $callback = false): void
    {
        $this->loop = false;

        if ($this->timer) {
            $this->timer->stop();
        }
        if ($callback && $this->destroyer) {
            call_user_func($this->destroyer);
        }
    }

    private function sigHandler(): callable
    {
        return function(int $signo /*, array $info = [] */) {
            switch ($signo) {
                case SIGCHLD:
                    $this->sync();
                    break;

                case SIGTSTP:
                    $this->broadcast($signo);
                    break;

                default:
                    $this->broadcast($signo);
                    $this->destroy(true);
            }
        };
    }

    public function setTimer(int $timeout, callable $fn, ...$args): void
    {
        $this->timer = Timer::create($timeout, $fn, ...$args);
    }

    public function setDestroyer(callable $fn): void
    {
        $this->destroyer = $fn;
    }

    public function setWorker(callable $fn): void
    {
        $this->worker = $fn;
    }

    public function fork($set): bool
    {
        if (!is_callable($this->worker)) {
            die(self::CONSUMER_ERROR);
        }

        switch ($pid = pcntl_fork()) {
            case self::FORK_ERROR:
                return false;

            case self::FORK_CHILD:
                $this->destroy();
                call_user_func($this->worker, $set);
                posix_kill(getmypid(), SIGKILL);
                break;

            default:
                $this->pool[] = $pid;
        }

        return true;
    }

    public function run(array $data): void
    {
        $this->start(Producer::create($data)->consumer([$this, 'fork']));
    }

    public function start(ProducerInterface $producer): void
    {
        $this->loop = true;
        $this->pool = [];

        declare(ticks=1)
        {
            while ($this->loop || $this->pool) {
                pcntl_signal_dispatch();

                /** @noinspection PhpArrayIsAlwaysEmptyInspection */
                if (count($this->pool) > $this->size) {
                    continue;
                }
                if (!$producer->work()) {
                    $this->loop = false;
                }
            }
        }
    }

    public static function create(int $size = 8, string $file = null): IMPDaemon
    {
        return new self($size, $file ?: __DIR__ .'/daemon.pid');
    }
}
