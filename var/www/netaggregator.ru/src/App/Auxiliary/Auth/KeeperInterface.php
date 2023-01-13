<?php declare(strict_types=1);

namespace App\Auxiliary\Auth;

use JsonSerializable;

use app\model\TokensRepositoryInterface;

/**
* Interface KeeperInterface
* @package App\Auxiliary\UserAuth
*/
interface KeeperInterface
{
    public function store(TokensRepositoryInterface $repository, JsonSerializable $token): int;
}
