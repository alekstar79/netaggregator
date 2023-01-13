<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\Service\Chat;

use App\VkApi\{ APIClientInterface, TransportFactory, APIClientFactory };

use JsonException;

/**
 * Class Mailer
 * @package App\Service\Chat
 */
class Mailer implements MailerInterface
{
    /** @var APIClientInterface */
    public APIClientInterface $vk;

    /** @var MessageInterface */
    private MessageInterface $msg;

    /** @var string */
    private string $token;

    /** @var array */
    private array $ids;

    public function __construct(APIClientInterface $vk)
    {
        $this->vk = $vk;
    }

    private function safeEncode(): ?string
    {
        try {

            return json_encode($this->msg->keyboard, JSON_THROW_ON_ERROR);

        } catch (JsonException $e) {
        }

        return null;
    }

    public function send(int $random_id): array
    {
        if (!$this->ids) {
            throw new MailerException('The necessary data is missing');
        }
        if ($this->token) {
            $this->vk->setToken($this->token);
        }

        return $this->vk->messages->send([
            self::FORWARD_MESSAGES => implode(',', $this->msg->forwardMessages),
            self::ATTACHMENT => implode(',', $this->msg->attachments),
            self::KEYBOARD => $this->safeEncode(),
            self::MESSAGE => $this->msg->text,
            self::RECEIVER => $this->ids,
            self::RANDOM_ID => $random_id
        ]);
    }

    public function setToken(string $token): void
    {
        $this->token = $token;
    }

    public function setIds(array $ids): void
    {
        $this->ids = $ids;
    }

    public function setMessage(MessageInterface $msg): void
    {
        $this->msg = $msg;
    }

    public static function create(APIClientInterface $vk = null): self
    {
        return new self($vk ?: APIClientFactory::create(TransportFactory::create()));
    }
}
