<?php declare(strict_types=1);

namespace App\Model;

use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Token\FbToken;

/**
* Class FbTokensRepository
* @package App\Model
*/
class FbTokensRepository extends TokensRepository
{
    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct(FbToken::class, $em);
    }
}
