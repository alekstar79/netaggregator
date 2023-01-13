<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Service\VkCopier;

use Psr\Http\Message\ResponseInterface;

use App\Model\JsonRepoInterface;
use App\VkApi\TransportInterface;
use App\VkApi\RejectInterface;
use App\VkApi\APIClient;

use Generator;

use Throwable;

/**
* Class Photos
* @package App\Service\VkCopier
*/
class Photos extends APIClient implements PhotoCopierInterface
{
    /** @var JsonRepoInterface */
    private JsonRepoInterface $repo;

    /** @var array */
    private array $ratio;

    public function __construct(TransportInterface $http, JsonRepoInterface $repo, array $tokens = [])
    {
        parent::__construct($http, $tokens);
        // $this->setCurrentTokens(self::PERM);

        $this->ratio = ['s' => 1,'o' => 2,'m' => 3,'p' => 4,'q' => 5,'x' => 6,'y' => 7,'z' => 8,'w' => 9];
        $this->repo = $repo;
    }

    private function getLargest(array $photos): array
    {
        $sizes = array_map(function($s) {
            $s['type'] = $this->ratio[$s['type']] ?? 0;
            return $s;
        }, $photos['sizes']);

        usort($sizes, static function($a, $b): int {
            return $b['type'] <=> $a['type'];
        });

        return array_shift($sizes);
    }

    /**
     * @param int $oid
     * @param $aid
     * @return Generator
     */
    private function photoGenerator(int $oid, $aid): Generator
    {
        $this->repo->dir('albums' . $oid . '/' . $aid);
        $list = $this->photosSourceList($oid, $aid);

        if (empty($list)) {
            return;
        }

        $list = array_chunk($list, 5);

        do {

            yield array_filter(
                array_map(static function(array $item) {
                    if ($item['state'] !== 'fulfilled') {
                        return null;
                    }
                    If ($item['value'] instanceof ResponseInterface) {
                        $ret = $item['value']->getBody()->getContents();
                    } else {
                        $ret = $item['value'];
                    }

                    return $ret;

                }, $this->http->wait(
                    array_map(function(array $photo) {
                        return $this->http->async('GET', $photo['url']);
                    }, current($list))
                ))
            );

        } while (next($list));
    }

    private function query(array $data): array
    {
        $set = [];

        foreach ($data as $i => $photo) {
            $set['multipart'][] = [
                'name'     => 'file' . ++$i,
                'filename' => 'photo' . $i . '.jpg',
                'contents' => $photo
            ];
        }

        return $set;
    }

    /**
     * @param int $gid
     * @return array
     * @throws RejectInterface
     */
    private function destination(int $gid): array
    {
        return array_column($this->photos->getAlbums($gid)['items'] ?? [], 'id', 'title');
    }

    /**
     * @param int $oid
     * @param $aid
     * @return array
     */
    private function photosSourceList(int $oid, $aid): array
    {
        $this->repo->dir('albums' . $oid . '/' . $aid);
        $list = $this->repo->read('photos');

        if (!$list && $this->generatePhotos($oid, $aid)) {
            return $this->repo->read('photos');
        }

        return $list;
    }

    /**
     * @param int $oid
     * @return array
     * @throws RejectInterface
     */
    private function albumsSourceList(int $oid): array
    {
        $list = $this->repo->read('list');

        if (!$list && $this->generateAlbums($oid)) {
            return $this->repo->read('list');
        }

        return $list;
    }

    private function error(RejectInterface $e, string $token = null): void
    {
        echo sprintf("%d %s\n%s\n", $e->getCode(), $e->getMessage(), $token);
    }

    /**
     * @param int $oid
     * @return bool
     * @throws RejectInterface
     */
    public function generateAlbums(int $oid): bool
    {
        if ($albums = $this->photos->getAlbums($oid)) {
            return $this->repo->save('list', $albums);
        }

        return false;
    }

    /**
     * @param int $oid
     * @param $aid
     * @return bool
     */
    public function generatePhotos(int $oid, $aid): bool
    {
        if ($photos = $this->photos->get($oid, $aid)) {
            $this->repo->dir('albums' . $oid . '/' . $aid);

            return $this->repo->save(
                'photos',
                array_map([$this,'getLargest'], $photos)
            );
        }

        return false;
    }

    public function upload(string $url, array $set): array
    {
        try {

            $ret = $this->http->request('POST', $url, $this->query($set));
            $ret = json_decode($ret, true, 512, JSON_THROW_ON_ERROR);

            if (json_last_error() === 0) {
                return $ret;
            }

        } catch (Throwable $e) {
        }

        return [];
    }

    /**
     * @param int $from
     * @param int $to
     * @return bool
     * @throws RejectInterface
     */
    public function run(int $from, int $to): bool
    {
        $this->repo->dir('albums' . $from);

        $list = $this->albumsSourceList($from);
        $dest = $this->destination($to);

        while ($album = array_shift($list['items'])) {
            $token = null;
            $server = [];

            /** @var int $dest_id */
            if (!$dest_id = $dest[$album['title']] ?? null) {
                $dest_id = $this->photos->createAlbum($album['title'], '', $to)['id'];
            }
            if (!$server) {
                $token = $this->nextToken();
                $server = $this->photos->getUploadServer($dest_id, $to, $token);
            }
            if (!isset($server['upload_url'])) {
                return false;
            }

            foreach ($this->photoGenerator($album['owner_id'], $album['id']) as $set) {
                $ret = $this->upload($server['upload_url'], $set);

                try {
                    $this->photos->save($ret, $token);
                } catch (RejectInterface $e) {
                    $this->error($e, $token);
                    $token = $this->nextToken();
                    $server = $this->photos->getUploadServer($dest_id, $to, $token);
                }
            }

            echo sprintf("Album - %s\n", $album['title']);
        }

        return true;
    }

    /**
     * @param int $from
     * @param int $to
     * @return bool
     * @throws RejectInterface
     */
    public function wallCopy(int $from, int $to): bool
    {
        $dest = $this->destination($to);
        $token = null;
        $server = [];

        /** @var int $dest_id */
        if (!$dest_id = $dest['Wall ' . $from] ?? null) {
            $dest_id = $this->photos->createAlbum('Wall ' . $from, '', $to)['id'];
        }
        if (!$server) {
            $token = $this->nextToken();
            $server = $this->photos->getUploadServer($dest_id, $to, $token);
        }
        if (!isset($server['upload_url'])) {
            return false;
        }

        foreach ($this->photoGenerator($from, 'wall') as $set) {
            $ret = $this->upload($server['upload_url'], $set);

            try {
                $this->photos->save($ret, $token);
            } catch (RejectInterface $e) {
                $this->error($e, $token);
                $token = $this->nextToken();
                $server = $this->photos->getUploadServer($dest_id, $to, $token);
            }
        }

        return true;
    }

    /**
     * @param int $from
     * @param int $to
     * @return bool
     * @throws RejectInterface
     */
    public function wallCopyToUserOnce(int $from, int $to): bool
    {
        $dest = $this->destination($to);
        // $token = null;
        $server = [];

        /** @var int $dest_id */
        if (!$dest_id = $dest['Wall ' . $from] ?? null) {
            $dest_id = $this->photos->createAlbum('Wall ' . $from)['id'];
        }
        if (!$server) {
            $server = $this->photos->getUploadServer($dest_id);
        }
        if (!isset($server['upload_url'])) {
            return false;
        }

        foreach ($this->photoGenerator($from, 'wall') as $set) {
            $ret = $this->upload($server['upload_url'], $set);

            try {
                $this->photos->save($ret);
            } catch (RejectInterface $e) {
                $this->error($e);
                $server = $this->photos->getUploadServer($dest_id);
            }
        }

        return true;
    }

    /**
     * @param int $oid
     * @param $aid
     * @return array
     */
    public function links(int $oid, $aid): array
    {
        $ret = [];

        if ($list = $this->photosSourceList($oid, $aid)) {
            $dir = $this->repo->dir('links' . $oid)->dir;
            $ret = array_column($list, 'url');

            file_put_contents(
                $dir . '/list-' . $aid,
                implode("\n", $ret)
            );
        }

        return $ret;
    }
}
