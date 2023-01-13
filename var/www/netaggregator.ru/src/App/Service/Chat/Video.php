<?php declare(strict_types=1);

namespace App\Service\Chat;

/**
* Class Video
* @package App\Service\Chat
*/
class Video extends Chooser
{
    /** @var ChatbotInterface */
    private ChatbotInterface $client;

    public function __construct(ChatbotInterface $client)
    {
        $this->mark = self::VIDEO;
        $this->client = $client;
    }

    private function get(int $gid): array
    {
        $this->client->vk->setToken($this->client->accessToken);

        return array_map(
            static fn($item): array => ['owner_id' => $item['owner_id'], 'id' => $item['id']],
            $this->client->vk->video->get($gid, null, 1500)
        );
    }

    /** @noinspection PhpUndefinedFieldInspection */
    public function list(): array
    {
        $gid = $this->client->gid;

        $c = $this->client->db->videos->findOne(['gid' => $gid], Chatbot::MAP) ?: [];

        if ($list = $c['list'] ?? []) {
            return $list;
        }
        if ($list = $this->get(-$gid)) {
            $this->client->db->videos->insertOne(compact('gid','list'));
        }

        return $list;
    }
}
