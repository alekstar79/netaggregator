<?php declare(strict_types=1);

namespace App\Service\Weather;

/**
* Interface CombinatorInterface
* @package App\Service\Weather
*/
interface CombinatorInterface
{
    public function transform(string $file = 'list-ru'): void;

    public function combine(string $file = 'translit'): void;

    public function buildList(): void;
}
