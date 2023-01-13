<?php declare(strict_types=1);

namespace App\Service\Chat;

use MongoDB\Database;

use App\Auxiliary\VkEvents\EventInterface;
use App\VkApi\APIClientInterface;

/**
 * Interface ChatbotInterface
 * @package App\Service\Chat
 * @property APIClientInterface vk
 * @property Database db
 */
interface ChatbotInterface extends EventInterface
{
    public const MUSIC = 1, PHOTO = 2, SIGNA = 3, VIDEO = 4;

    public function getUser(int $uid = null): array;

    public function extract(string $key);
}
