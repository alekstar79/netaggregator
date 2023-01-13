<?php declare(strict_types=1);

namespace App\Model;

/**
* Interface StoreInterface
* @package App\Model
*/
interface StoreInterface
{
    public function save($object, bool $flush = false);

    public function delete($object, bool $flush = false): bool;

    public function flush(): void;
}
