<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\Service\Chat;

use JsonException;

/**
 * Class Message
 * @package App\Service\Chat
 */
class Message implements MessageInterface
{
    /** @var string */
    public string $text;

    /** @var array */
    public array $attachments;

    /** @var array */
    public array $keyboard;

    /** @var array */
    public array $forwardMessages;

    /** @var int|null */
    public ?int $receiver;

    /** @var int|null */
    public ?int $replyTo;

    /** @var array */
    public static array $colors = [
        '#5181b8' => self::PRIMARY,
        '#e5ebf1' => self::SECONDARY,
        '#4bb34b' => self::POSITIVE,
        '#e64646' => self::NEGATIVE
    ];

    public function __construct()
    {
        $this->receiver = null;
        $this->replyTo = null;

        $this->forwardMessages = [];
        $this->attachments = [];
        $this->keyboard = [];
    }

    public function forward(int $mid): MessageInterface
    {
        $this->forwardMessages[] = $mid;

        return $this;
    }

    public function reply(int $mid): MessageInterface
    {
        $this->replyTo = $mid;

        return $this;
    }

    public function receive(int $uid): MessageInterface
    {
        $this->receiver = $uid;

        return $this;
    }

    public function setText(string $text): MessageInterface
    {
        $this->text = $text;

        return $this;
    }

    public function addAttachments(string $type, string $oId, string $id = ''): MessageInterface
    {
        $both = strpos($oId, '_') === false;

        if ($both && !$id) {
            throw new MessageException('Invalid attachment ID');
        }

        $this->attachments[] = $both ? $type . $oId . '_' . $id : $oId;

        return $this;
    }

    public function addPhoto(string $oId, string $id = ''): MessageInterface
    {
        return $this->addAttachments('photo', $oId, $id);
    }

    public function addVideo(string $oId, string $id = ''): MessageInterface
    {
        return $this->addAttachments('video', $oId, $id);
    }

    public function addAudio(string $oId, string $id = ''): MessageInterface
    {
        return $this->addAttachments('audio', $oId, $id);
    }

    public function addDoc(string $oId, string $id = ''): MessageInterface
    {
        return $this->addAttachments('doc', $oId, $id);
    }

    public function addWall(string $oId, ?string $id = ''): MessageInterface
    {
        return $this->addAttachments('wall', $oId, $id);
    }

    public function setKeyboard(array $keyboard): MessageInterface
    {
        $this->keyboard = $keyboard;

        return $this;
    }

    public static function button(string $label, array $payload, string $color = self::PRIMARY, string $type = 'text'): array
    {
        $label = mb_strimwidth($label, 0, 35, '…');

        if (strpos($color, '#') === 0) {
            $color = self::$colors[$color];
        }
        if (!in_array($color, self::$colors, false)) {
            $color = self::PRIMARY;
        }

        return [
            'action' => compact('type', 'payload', 'label'),
            'color' => $color
        ];
    }

    public static function keyboard(array $buttons, bool $one_time = false): array
    {
        return compact('buttons', 'one_time');
    }

    public static function buildKeyboard(array $set): array
    {
        $buttons = [];

        if (!$children = $set['children'] ?? []) {
            return self::keyboard([], true);
        }

        foreach ($children as $i => $row) {
            if (!$row['children']) {
                continue;
            }

            $buttons[$i] = [];

            foreach ($row['children'] as $key) {
                $buttons[$i][] = self::button(
                    (string) $key['props']['text'],
                    (array) $key['props']['payload'],
                    (string) $key['props']['background']
                );
            }
        }

        return self::keyboard($buttons);
    }

    public function toJson(): string
    {
        try {

            $json = json_encode([
                'text' => $this->text,
                'attachments' => $this->attachments,
                'keyboard' => $this->keyboard,
                'forwardMessages' => $this->forwardMessages,
                'receiver' => $this->receiver,
                'replyTo' => $this->replyTo
            ], JSON_THROW_ON_ERROR | 64 | 128 | 256);

            if (json_last_error() === JSON_ERROR_NONE) {
                return $json ?: '';
            }

        } catch (JsonException $e) {
        }

        return '';
    }

    public function __toString()
    {
        return $this->toJson();
    }

    public static function create(string $text, array $attachments = [], array $keyboard = []): MessageInterface
    {
        $msg = new self();

        $msg->setText($text);
        $msg->attachments = $attachments;
        $msg->keyboard = $keyboard;

        return $msg;
    }
}
