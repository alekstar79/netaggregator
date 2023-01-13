<?php

/**
 * @noinspection UnknownInspectionInspection
 * @noinspection PhpUnused
 */

declare(strict_types=1);

namespace App\Entity\Dcover;

use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;

/**
* @ORM\Entity
* @ORM\Table(name="covers")
*/
class Cover implements JsonSerializable
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private int $id;
    /**
     * @ORM\ManyToOne(targetEntity="Owner", inversedBy="covers")
     * @ORM\JoinColumn(name="owner", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private Owner $owner;
    /**
     * @ORM\Column(type="integer", name="group_id", unique=true)
     */
    private int $groupId;
    /**
     * @var array
     * @ORM\Column(type="json", name="last_subscriber", nullable=true, options={"jsonb": true})
     */
    private array $lastSubscriber;
    /**
     * @var array
     * @ORM\Column(type="json", name="top_commentor", nullable=true, options={"jsonb": true})
     */
    private array $topCommentor;
    /**
     * @var array
     * @ORM\Column(type="json", name="top_liker", nullable=true, options={"jsonb": true})
     */
    private array $topLiker;
    /**
     * @var array
     * @ORM\Column(type="json", name="time", nullable=true, options={"jsonb": true})
     */
    private array $time;
    /**
     * @var array
     * @ORM\Column(type="json", name="date", nullable=true, options={"jsonb": true})
     */
    private array $date;
    /**
     * @var string
     * @ORM\Column(type="string", name="time_zone", nullable=true)
     */
    private string $timeZone;
    /**
     * @var array
     * @ORM\Column(type="json", name="text", nullable=true, options={"jsonb": true})
     */
    private array $text;
    /**
     * @var array
     * @ORM\Column(type="json", name="shape", nullable=true, options={"jsonb": true})
     */
    private array $shape;
    /**
     * @var array
     * @ORM\Column(type="json", name="weather", nullable=true, options={"jsonb": true})
     */
    private array $weather;

    public function __construct(Owner $owner, int $groupId, array $cover)
    {
        $this->owner = $owner;
        $this->groupId = $groupId;

        foreach ($cover as $prop => $value) {
            if (property_exists($this, $prop)) {
                $this->{$prop} = $value;
            }
        }
    }

    private function isMutable(string $prop): bool
    {
        return property_exists($this, $prop) && !in_array($prop, ['id','owner']);
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

    public function getOwner(): Owner
    {
        return $this->owner;
    }

    public function getGroupId(): int
    {
        return $this->groupId;
    }

    public function getLastSubscriber(): array
    {
        return $this->lastSubscriber;
    }

    public function setLastSubscriber(array $lastSubscriber): void
    {
        $this->lastSubscriber = $lastSubscriber;
    }

    public function getTopCommentor(): array
    {
        return $this->topCommentor;
    }

    public function setTopCommentor(array $topCommentor): void
    {
        $this->topCommentor = $topCommentor;
    }

    public function getTopLiker(): array
    {
        return $this->topLiker;
    }

    public function setTopLiker(array $topLiker): void
    {
        $this->topLiker = $topLiker;
    }

    public function getTime(): array
    {
        return $this->time;
    }

    public function setTime(array $time): void
    {
        $this->time = $time;
    }

    public function getDate(): array
    {
        return $this->date;
    }

    public function setDate(array $date): void
    {
        $this->date = $date;
    }

    public function getTimeZone(): string
    {
        return $this->timeZone;
    }

    public function setTimeZone(string $timeZone): void
    {
        $this->timeZone = $timeZone;
    }

    public function getText(): array
    {
        return $this->text;
    }

    public function setText(array $text): void
    {
        $this->text = $text;
    }

    public function getShape(): array
    {
        return $this->shape;
    }

    public function setShape(array $shape): void
    {
        $this->shape = $shape;
    }

    public function getWeather(): array
    {
        return $this->weather;
    }

    public function setWeather(array $weather): void
    {
        $this->weather = $weather;
    }

    public function update(iterable $dataset): void
    {
        foreach ($dataset as $prop => $value) {
            if ($this->isMutable($prop)) {
                $this->{$prop} = $value;
            }
        }
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
