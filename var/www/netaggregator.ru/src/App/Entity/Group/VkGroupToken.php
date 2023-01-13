<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Entity\Group;

use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;

/**
* @ORM\Entity
* @ORM\Table(name="group_tokens")
*/
class VkGroupToken implements JsonSerializable
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private int $id;
    /**
     * @var int
     * @ORM\Column(type="integer", name="group_id", unique=true)
     */
    protected int $groupId;
    /**
     * @var int
     * @ORM\Column(type="integer", name="user_id")
     */
    protected int $userId;
    /**
     * @var string
     * @ORM\Column(type="string", name="group_token")
     */
    protected string $groupToken;
    /**
     * @var string|null
     * @ORM\Column(type="string", name="confirmation_key", nullable=true)
     */
    protected ?string $confirmationKey;
    /**
     * @var int
     * @ORM\Column(type="integer", name="server_id", nullable=true)
     */
    protected int $serverId;

    public function __construct(
        int $groupId,
        int $userId,
        string $groupToken,
        string $confirmationKey = null
    ) {

        $this->groupId = $groupId;
        $this->userId = $userId;
        $this->groupToken = $groupToken;
        $this->confirmationKey = $confirmationKey;
    }

    public function __toString()
    {
        return $this->groupToken;
    }

    private function isMutable(string $prop): bool
    {
        return property_exists($this, $prop) && !in_array($prop, ['id','groupId']);
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

    public function setId($id): void
    {
        $this->id = $id;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getGroupId(): int
    {
        return $this->groupId;
    }

    public function getGroupToken(): string
    {
        return $this->groupToken;
    }

    public function getConfirmationKey(): ?string
    {
        return $this->confirmationKey;
    }

    public function getServerId(): ?int
    {
        return $this->serverId;
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
