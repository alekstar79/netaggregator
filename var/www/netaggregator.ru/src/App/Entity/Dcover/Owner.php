<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Entity\Dcover;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
* @ORM\Entity
* @ORM\Table(name="owners")
*/
class Owner
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private int $id;
    /**
     * @var int
     * @ORM\Column(type="integer", name="user_id", unique=true)
     */
    private int $userId;
    /**
     * @var ArrayCollection|Cover[]
     * @ORM\OneToMany(targetEntity="Cover", mappedBy="owner", orphanRemoval=true, cascade={"persist"})
     * @ORM\OrderBy({"id" = "ASC"})
     */
    private $covers;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
        $this->covers = new ArrayCollection();
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

    public function getCovers(): array
    {
        return $this->covers->toArray();
    }

    public function getCoversCount(): int
    {
        return $this->covers->count();
    }

    public function addCover(int $gid, array $cover): self
    {
        $this->covers->add(new Cover($this, $gid, $cover));
        return $this;
    }

    public function removeCover(int $gid): self
    {
        foreach ($this->covers as $cover) {
            if ($cover->getGroupId() === $gid) {
                $this->covers->removeElement($cover);
                break;
            }
        }

        return $this;
    }

    public function update(array $dataset): self
    {
        $set = $dataset['cover'];
        $gid = $dataset['gid'];

        foreach ($this->covers as $cover) {
            if ($cover->getGroupId() === $gid) {
                $cover->update($set);
            }
        }

        return $this;
    }
}
