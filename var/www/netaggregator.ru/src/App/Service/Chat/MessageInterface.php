<?php declare(strict_types=1);

namespace App\Service\Chat;

/**
* Class Message
* @package App\Service\Chat
* @property string text
* @property array forwardMessages
* @property int replyToMid
* @property array attachments
* @property array keyboard
*/
interface MessageInterface
{
    public const

        PRIMARY   = 'primary',
        SECONDARY = 'secondary',
        NEGATIVE  = 'negative',
        POSITIVE  = 'positive';

    public function forward(int $mid): self;

    public function reply(int $mid): self;

    public function receive(int $uid): self;

    public function setText(string $text): self;

    public function addAttachments(string $type, string $oId, string $id = ''): self;

    public function addPhoto(string $oId, string $id = ''): self;

    public function addVideo(string $oId, string $id = ''): self;

    public function addAudio(string $oId, string $id = ''): self;

    public function addDoc(string $oId, string $id = ''): self;

    public function addWall(string $oId, string $id = ''): self;

    public function setKeyboard(array $keyboard): self;

    public static function buildKeyboard(array $set): array;

    public static function keyboard(array $buttons, bool $one_time = false): array;

    public static function button(string $label, array $payload, string $color = self::PRIMARY, string $type = 'text'): array;

    public function toJson(): string;
}
