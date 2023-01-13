<?php declare(strict_types=1);

namespace App\VkApi;

/**
* Interface ExecuteInterface
* @package App\VkApi
*
* @property array requests
* @property string method
* @property array params
*/
interface ExecuteInterface
{
    public const MAX_API_CALLS  = 25, CODE = '/{{code}}/i';

    public function countRequests(): int;

    public function getMethod(): string;

    public function getCode(string $g = ','): array;

    public function setWrapper(string $wrap): Execute;

    public function append(Execute $exe): Execute;

    public function addCode(array $params, string $fields = ''): Execute;

    public function repeat(array $set): Execute;

    public function dynamic(int $count): int;

    public static function multiple(string $method, array $data, string $field = ''): Execute;
}
