<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Entity\Stream;

use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;

/**
* @ORM\Entity
* @ORM\Table(name="rules")
*/
class Rules implements JsonSerializable
{
    private const JSON = ['tags','stop','query'], INT = ['id','userId'];

    /**
     * @var int
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private int $id;
    /**
     * @var int
     * @ORM\Column(type="integer", name="user_id", unique=true)
     */
    private int $userId;
    /**
     * @var ?array
     * @ORM\Column(type="json", nullable=true, options={"jsonb": true})
     */
    private ?array $tags;
    /**
     * @var ?array
     * @ORM\Column(type="json", nullable=true, options={"jsonb": true})
     */
    private ?array $stop;
    /**
     * @var ?array
     * @ORM\Column(type="json", nullable=true, options={"jsonb": true})
     */
    private ?array $query;

    public function __construct($userId, array $tags = null, array $stop = null, array $query = null)
    {
        $this->query = $query ?: null;
        $this->stop = $stop ?: null;
        $this->tags = $tags ?: null;

        if (is_numeric($userId)) {
            $this->userId = (int) $userId;
        }
    }

    private function isMutable(string $prop): bool
    {
        return property_exists($this, $prop) && !in_array($prop, self::INT, false);
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

    /** @noinspection JsonEncodingApiUsageInspection */
    private static function decoder(array $set): callable
    {
        return static function(string $field) use($set) {
            $decoded = null;

            if (!isset($set[$field])) {
                return null;
            }
            if (in_array($field, self::INT, false)) {
                return (int) $set[$field];
            }
            if (in_array($field, self::JSON, false)) {
                $decoded = is_string($set[$field])
                    ? json_decode($set[$field], true)
                    : $set[$field];
            }

            return json_last_error() === 0
                ? $decoded
                : null;
        };
    }

    public static function init(array $set): self
    {
        $d = self::decoder($set);
        $id = $set['id'] ?? null;

        $rules = new self($d('userId'), $d('tags'), $d('stop'), $d('query'));

        if (is_numeric($id)) {
            $rules->id = (int) $id;
        }

        return $rules;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function getTags(): ?array
    {
        return $this->tags;
    }

    public function getStop(): ?array
    {
        return $this->stop;
    }

    public function getQuery(): ?array
    {
        return $this->query;
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
            $dump[$this->convert($prop)] = $value;
        }

        return $dump;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
