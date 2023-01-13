<?php declare(strict_types=1);

namespace App\Service\Chat;

/**
* Class Photo
* @package App\Service\Chat
*/
class Photo extends Chooser
{
    /** @var ChatbotInterface */
    private ChatbotInterface $client;

    public function __construct(ChatbotInterface $client)
    {
        $this->mark = self::PHOTO;
        $this->client = $client;
    }

    private function get(int $gid): array
    {
        $this->client->vk->setToken($this->client->accessToken);

        return array_map(
            static fn($item): array => ['owner_id' => $item['owner_id'], 'id' => $item['id']],
            $this->client->vk->photos->getAll($gid, 1500)
        );
    }

    /** @noinspection PhpUndefinedFieldInspection */
    public function list(): array
    {
        $gid = $this->client->gid;

        $c = $this->client->db->photos->findOne(['gid' => $gid], Chatbot::MAP) ?: [];

        if (!$list = $c['list'] ?? []) {
            $list = $this->get(-$gid);
            $this->client->db->photos->insertOne(compact('gid','list'));
        }

        /* $list = $this->client->vk->photos->getAlbums($gid);
        $album = isset($list['items']) && ($c = $list['count']) > 0
            ? $list['items'][random_int(0, $c - 1)]
            : [];

        return isset($album['id'])
            ? $this->client->vk->photos->get($gid, $album['id'])
            : $this->client->vk->photos->getAll($gid); */

        return $list;
    }
}
