<?php declare(strict_types=1);

namespace App\Service\Chat;

/**
* Class Chooser
* @package App\Service\Chat
*/
abstract class Chooser implements MakerInterface
{
    /** @var string */
    protected string $mark;

    abstract public function list(): array;

    public function make(): string
    {
        $tmp = [];

        if ($list = $this->list()) {
            $tmp = $list[array_rand($list)] ?: [];
        }

        return isset($tmp['id'])
            ? $this->mark . $tmp['owner_id'] .'_'. $tmp['id']
            : '';
    }
}
