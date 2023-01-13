<?php declare(strict_types=1);

namespace App\VkApi;

/**
* Class TokenManager (multiple tokens management)
* @package App\VkApi
*/
class TokenManager implements TokenManagerInterface
{
    /** @var array */
    protected array $tokens;

    /** @var string|null */
    protected ?string $passed;

    /** @var int|null */
    protected ?int $current;

    /** @var int */
    protected int $tries;

    /** @var RejectInterface|null */
    protected ?RejectInterface $error;

    public function __construct(array $tokens)
    {
        $this->setTokens($tokens);

        $this->error = null;
        $this->tries = 0;
    }

    private function count(): int
    {
        return $this->passed ? 1 : count($this->tokens);
    }

    private function timeout(int $c): int
    {
        return $c > 1 ? (int)ceil(self::TIMEOUT / ($c ** 3)) : self::TIMEOUT;
    }

    private function reindexNotValidTokens(): void
    {
        if (!$this->current || !array_key_exists($this->current, $this->tokens)) {
            reset($this->tokens);
            $this->sleep(true);
        }
    }

    private function next(): string
    {
        $this->reindexNotValidTokens();

        $this->current = key($this->tokens);
        $token = current($this->tokens);

        if (!next($this->tokens)) {
            reset($this->tokens);
        }

        return $token;
    }

    private function passedTokenDetermine(array $params): void
    {
        $this->passed = $params['access_token'] ?? null;
    }

    private function isFired(): bool
    {
        return $this->tries > $this->count();
    }

    private function exclude(): void
    {
        if (!$this->passed) {
            unset($this->tokens[$this->current]);
            sort($this->tokens);
        }
    }

    private function correct(RejectInterface $e): void
    {
        switch ($e->getCode())
        {
            case Reject::REQUEST_ERROR: # 502
            case Reject::LIMIT_REACHED: # 29
            case Reject::MANY_REQUESTS: # 6
                $this->sleep(true);
                break;
            case Reject::ACCESS_DENIED: # 15
            case Reject::ACTION_DENIED: # 7
            case Reject::FLOOD_CONTROL: # 9
            case Reject::AUTH_FAILED:   # 5
                $this->exclude();
        }
    }

    private function sleep(bool $penalty = false): void
    {
        $count = $this->count();

        if (self::ZERRO_TIMEOUT_LIMIT > $count) {
            usleep($this->timeout($count));
        }
        if ($penalty) {
            usleep(self::TIMEOUT);
        }

    }

    private function reset():? RejectInterface
    {
        $dump = $this->error;

        $this->error = null;
        $this->tries = 0;

        return $dump;
    }

    private function failResponse(RejectInterface $e): void
    {
        $this->error = $e;
        $this->tries++;
    }

    private function failure($data, $depth = 0): bool
    {
        if (!is_array($data) || count($data) > 1) {
            return !$data;
        }

        $elem = current($data);

        return is_array($elem)
            ? $this->failure($elem, ++$depth)
            : !$elem;
    }

    public function setTokens(array $tokens = []): self
    {
        $this->tokens = array_values($tokens);
        $this->current = 0;

        return $this;
    }

    /**
     * @param array $params
     * @return string|null
     * @throws RejectInterface
     */
    public function perform(array $params): ?string
    {
        $this->passedTokenDetermine($params);

        if ($this->isFired()) {
            throw $this->reset();
        }
        if ($this->error) {
            $this->correct($this->error);
        }
        if (!$this->passed && $this->tokens) {
            return $this->next();
        }

        return null;
    }

    public function success(array $r): bool
    {
        $success = isset($r['response']);
        $e = Reject::errors($r);
        $this->sleep();

        if ($success && $e) {
            $success = !$this->failure(true);
        }

        if (!$success) {
            $e && $this->failResponse($e);
            return false;
        }

        $this->reset();

        return true;
    }
}
