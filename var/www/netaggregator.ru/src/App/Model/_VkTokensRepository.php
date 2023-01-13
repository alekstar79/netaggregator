<?php declare(strict_types=1);

namespace App\Model;

use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Token\VkToken;

/**
 * Class VkTokensRepository
 * @package App\Model
 */
class _VkTokensRepository extends TokensRepository
{
    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct(VkToken::class, $em);
    }
}
