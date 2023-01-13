<?php declare(strict_types=1);

namespace App\Service\Chat;

/**
* Class Music
* @package App\Service\Chat
*/
class Music implements MakerInterface
{
    /** @var array */
    private array $list;

    public function make(): string
    {
        return $this->list[array_rand($this->list)];
    }

    /** @noinspection PhpUnusedParameterInspection */
    public function __construct(ChatbotInterface $client)
    {
        /** @noinspection PhpUndefinedFieldInspection */
        $this->mark = self::AUDIO;

        $this->list = [
            'audio-125629607_456239017',
            'audio-125629607_456239018',
            'audio-125629607_456239019',
            'audio-125629607_456239020',
            'audio-125629607_456239021',
            'audio-125629607_456239022',
            'audio-125629607_456239023',
            'audio-125629607_456239024',
            'audio-125629607_456239025',
            'audio-125629607_456239026',
            'audio-125629607_456239027',
            'audio-125629607_456239028',
            'audio-125629607_456239029',
            'audio-125629607_456239030',
            'audio-125629607_456239031',
            'audio-125629607_456239032',
            'audio-125629607_456239033',
            'audio-125629607_456239034',
            'audio-125629607_456239035',
            'audio-125629607_456239036',
            'audio-125629607_456239037',
            'audio-125629607_456239038'
        ];
    }
}
