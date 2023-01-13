<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\VkApi;

use InvalidArgumentException;
use JsonException;

/**
* Class Execute
* @package App\VkApi
*/
class Execute implements ExecuteInterface
{
    /** @var array */
    public array $requests = [];

    /** @var string */
    public string $method;

    /** @var array */
    public array $params;

    /** @var string */
    private string $code;

    /** @var string */
    private string $wrap;

    /**
     * @throws JsonException
     */
    public function __construct(string $method, array $params = [], string $field = '')
    {
        if (!$method) {
            return;
        }

        $this->method = trim($method, '/');
        $this->params = $params;
        $this->code = $this->code(
            $this->method,
            $this->params,
            $field
        );

        $this->wrap = '';
    }

    /**
     * @throws JsonException
     */
    private function code(string $method, array $params, string $field): string
    {
        $json = $params ? json_encode($params, JSON_THROW_ON_ERROR | 256) : '';

        if ($field) {
            $field = '.'. $field;
        }

        return sprintf('API.%s(%s)%s', $method, $json, $field);
    }

    private function wrapper(string $code): string
    {
        if (!preg_match(self::CODE, $this->wrap)) {
            throw new InvalidArgumentException('Missing code mark');
        }

        return preg_replace(self::CODE, $code, $this->wrap);
    }

    private function calc(int $all): int
    {
        $calls = (int) ceil(($all - $this->params['offset']) / $this->params['count']);
        return $calls > self::MAX_API_CALLS ? self::MAX_API_CALLS : $calls;
    }

    public function countRequests(): int
    {
        return count($this->requests);
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getCode(string $g = ',', ?string $token = null): array
    {
        if ($this->countRequests() > 24) {
            throw new ExecuteException('Exceeded the limit on the number of requests');
        }

        $execute = $this->code;
        $params = [];

        if ($this->requests) {
            foreach ($this->requests as $request) {
                $execute .= ($execute ? $g : '') . $request->code;
            }
        }
        if ($this->wrap) {
            $params['code'] = $this->wrapper($execute);
        } else {
            $params['code'] = "return [$execute];";
        }
        if ($token) {
            $params['access_token'] = $token;
        }

        return ['/execute', $params, 'POST'];
    }

    public function setWrapper(string $wrap): self
    {
        $this->wrap = $wrap;
        return $this;
    }

    public function append(Execute $exe): self
    {
        $this->requests[] = $exe;
        return $this;
    }

    /**
     * @throws JsonException
     */
    public function addCode(array $params, string $fields = ''): self
    {
        $code = $this->code($this->method, $params, $fields);

        if (!$this->params) {
            $this->params = $params;
            $this->code = $code;
            return $this;
        }

        $new = clone $this;

        $new->requests = [];
        $new->code = $code;

        return $this->append($new);
    }

    /**
     * @throws JsonException
     */
    public function repeat(array $set): self
    {
        return $this->addCode($set);
    }

    /**
     * @throws JsonException
     */
    public function dynamic(int $count): int
    {
        $stop = $this->calc($count);
        $step = 1;

        while ($step < $stop) {
            $this->params['offset'] += $this->params['count'];
            $this->addCode($this->params);
            $step++;
        }

        return $this->params['offset'];
    }

    public static function multiple(string $method, array $data, string $field = ''): self
    {
        return array_reduce(
            $data, /** @throws JsonException */ static function($q, $set) use ($method, $field) {
            return $q instanceof self ? $q->addCode($set, $field) : new self($method, $set, $field);
        });
    }
}
