<?php

declare(strict_types=1);

namespace App\Entity\Token;

/**
 * Interface BaseTokenInterface
 * @package App\Entity\Token
 */
interface BaseTokenInterface
{
    public function getId(): int;

    public function getUserId(): int;

    public function getAccessToken(): string;

    public function update(iterable $dataset);

    public function toArray(): array;

    public function jsonSerialize();
}
