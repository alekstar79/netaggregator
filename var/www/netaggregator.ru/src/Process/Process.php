<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace Process;

use Evenement\EventEmitter;

use RuntimeException;
use JsonException;

/**
 * Class Process
 * @compability UNIX-like OS (*nix)
 * @package Process
 */
class Process extends EventEmitter implements ProcessInterface
{
    /** @var string */
    public string $name;

    /** @var array */
    public array $args;

    /** @var string */
    public string $cmd;

    /** @var ?int */
    public ?int $run;

    /** @var ?int */
    public ?int $pid;

    /** @var callable|null */
    public $handler;

    /** @var array */
    private array $payload;

    public function __construct(array $ps = [])
    {
        $this->name = $this->pname($ps);
        $this->run = $this->ptime($ps);

        $this->cmd = (string) $ps['cmd'];
        $this->pid = (int) $ps['pid'];

        if (!$this->isRunning()) {
            $this->run = null;
            $this->pid = null;
        }
    }

    private function pname(array $process): string
    {
        return $process['name'] ?? uniqid('', false);
    }

    private function ptime(array $process): ?int
    {
        return $process['run'] ?? null;
    }

    /**
     * @throws JsonException
     */
    private function line(): string
    {
        $line = 'nohup %s > /dev/null 2>&1 & echo $!';

        if ($args = $this->args ? PM2::encode($this->args) : '') {
            $line = 'nohup %s %s > /dev/null 2>&1 & echo $!';
        }

        return sprintf($line, $this->cmd, $args);
    }

    public function isTerminated(): bool
    {
        return !$this->isRunning();
    }

    public function isRunning(): bool
    {
        if (!$this->pid) {
            return false;
        }

        $op = [];
        exec('ps -p ' . $this->pid, $op);

        return isset($op[1]);
    }

    public function get(string $prop)
    {
        return property_exists($this, $prop) ? $this->{$prop} : $this->payload[$prop];
    }

    public function set(string $prop, $value): ProcessInterface
    {
        if (!property_exists($this, $prop)) {
            $this->payload[$prop] = $value;
            return $this;
        }

        $this->{$prop} = $value;

        return $this;
    }

    /**
     * @throws JsonException
     */
    public function start(): bool
    {
        if (!$this->cmd) {
            throw new RuntimeException('Command line is missing');
        }

        $command = $this->line();
        $process = [];

        exec($command, $process);
        $pid = (int) $process[0];

        if (0 < $pid) {
            $this->run = time();
            $this->pid = $pid;
            $this->emit('run', [$this]);
        }

        return (bool) $pid;
    }

    public function stop(): bool
    {
        if (!$this->pid) {
            return false;
        }

        exec('kill '. $this->pid);
        while ($this->isRunning()) {
            usleep(50000);
        }

        $this->pid = null;
        $this->run = null;

        $this->emit('kill', [$this]);

        return true;
    }

    public function execute(...$args): void
    {
        if (is_callable($this->handler)) {
            call_user_func($this->handler, $this, ...$args);
        }
    }

    public function setHandler(callable $fn): void
    {
        $this->handler = $fn;
    }

    public static function create(string $cmd): ProcessInterface
    {
        return (new self)->set('cmd', $cmd);
    }
}
