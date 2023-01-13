<?php

declare(strict_types=1);

namespace App\Entity\Token;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="fbtokens")
 */
class FbToken extends BaseToken
{
}
