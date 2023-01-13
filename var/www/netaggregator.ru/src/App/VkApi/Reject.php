<?php declare(strict_types=1);

namespace App\VkApi;

use Exception;

/**
* Class Reject
* @package App\VkApi
*/
class Reject extends Exception implements RejectInterface
{
    /** @var array */
    private $params;

    public function __construct(string $message, int $code, $params = [])
    {
        parent::__construct($message, $code);

        $this->params = $params ?: [];
    }

    public function getParams(): array
    {
        return $this->params;
    }

    public static function create(array $e): self
    {
        $request_params = [];
        $error_code = 0;
        $error_msg = '';

        extract($e, EXTR_OVERWRITE);

        return new self($error_msg, $error_code, $request_params);
    }

    public static function errors(array $r): ?self
    {
        foreach (['execute_errors', 'error'] as $e) {
            if ($error = $r[$e] ?? null) {
                return self::create($error[0] ?? $error);
            }
        }

        return null;
    }
}
