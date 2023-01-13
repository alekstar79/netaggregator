<?php declare(strict_types=1);

namespace App\Service\Chat;

use App\VkApi\APIClientInterface;

/**
* Interface MailerInterface
* @package App\Service\Chat
* @property APIClientInterface vk
*/
interface MailerInterface
{
    public const

        FORWARD_MESSAGES = 'forward_messages',
        RANDOM_ID = 'random_id',
        ATTACHMENT = 'attachment',
        KEYBOARD = 'keyboard',
        RECEIVER = 'receiver',
        MESSAGE = 'message';

    public function setMessage(MessageInterface $msg): void;

    public function setToken(string $token): void;

    public function setIds(array $ids): void;

    public function send(int $random_id): array;
}
