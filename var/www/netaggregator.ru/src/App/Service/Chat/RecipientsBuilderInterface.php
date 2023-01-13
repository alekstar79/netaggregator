<?php declare(strict_types=1);

namespace App\Service\Chat;

/**
* Interface RecipientsBuilderInterface
* @package App\Service\Chat
*/
interface RecipientsBuilderInterface
{
    public const

        FIELDS = ['sex','bdate','country','city','military','personal','relation'],
        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    public function perform(array $set): void;
}
