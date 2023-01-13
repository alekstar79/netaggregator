<?php declare(strict_types=1);

namespace App\Service\Stream;

/**
* Interface DataPack
* @package App\Service\Stream
*/
interface PackageInterface
{
    public function presence(array $rules): bool;

    public function isSomethingAdd(): bool;

    public function isSomethingDel(): bool;

    public function addRequest(): array;

    public function delRequest(): array;

    public function setAddPack(array $data): void;

    public function setDelPack(array $data): void;

    public function getRules(): array;

    public function generate(array $current, array $rest): PackageInterface;

    public function reverse(): PackageInterface;
}
