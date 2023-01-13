<?php

declare(strict_types=1);

namespace App\Entity\Token;

use Doctrine\ORM\Mapping as ORM;

use JsonSerializable;

/**
 * Class BaseToken
 * @package App\Entity\Token
 */
abstract class BaseToken implements JsonSerializable, BaseTokenInterface
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected int $id;
    /**
     * @ORM\Column(type="integer", name="user_id", unique=true)
     */
    protected int $userId;
    /**
     * @var string
     * @ORM\Column(type="string", name="access_token")
     */
    protected string $accessToken;
    /**
     * @ORM\Column(type="integer", name="expires_in", nullable=true)
     */
    protected ?int $expiresIn;

    public function __construct(int $userId, string $accessToken, int $expiresIn = null)
    {
        $this->accessToken = $accessToken;
        $this->expiresIn = $expiresIn;
        $this->userId = $userId;
    }

    public function __toString(): string
    {
        return $this->accessToken;
    }

    private function isMutable(string $prop): bool
    {
        return property_exists($this, $prop) && !in_array($prop, ['id','userId']);
    }

    private function convert(?string $v): ?string
    {
        if (is_string($v)) {
            return strtolower(preg_replace(
                '/(?<=\d)(?=[A-Za-z])|(?<=[A-Za-z])(?=\d)|(?<=[a-z])(?=[A-Z])/',
                '_',
                $v
            ));
        }

        return $v;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    public function update(iterable $dataset): self
    {
        foreach ($dataset as $prop => $value) {
            if ($this->isMutable($prop)) {
                $this->{$prop} = $value;
            }
        }

        return $this;
    }

    public function toArray(): array
    {
        $dump = [];

        foreach ($this as $prop => $value) {
            if ($prop !== 'id') {
                $dump[$this->convert($prop)] = $value;
            }
        }

        return $dump;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
