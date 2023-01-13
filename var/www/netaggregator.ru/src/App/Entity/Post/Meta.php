<?php

declare(strict_types=1);

namespace App\Entity\Post;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Embeddable
 */
class Meta
{
    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string $title;
    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private string $description;

    public function __construct(string $title, string $description)
    {
        $this->title = $title;
        $this->description = $description;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getDescription(): string
    {
        return $this->description;
    }
}
