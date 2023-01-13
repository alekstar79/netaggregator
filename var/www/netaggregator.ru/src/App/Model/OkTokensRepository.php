<?php declare(strict_types=1);

namespace App\Model;

use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Token\OkToken;

/**
* Class OkTokensRepository
* @package App\Model
*/
class OkTokensRepository extends TokensRepository
{
    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct(OkToken::class, $em);
    }
}
