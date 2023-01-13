<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Service\VkCopier;

use App\Model\JsonRepoInterface;
use App\VkApi\TransportInterface;
use App\VkApi\APIClient;

/**
* Class Videos
* @package App\Service\VkCopier
*/
class Videos extends APIClient implements VideoCopierInterface
{
    /** @var JsonRepoInterface */
    private JsonRepoInterface $repo;

    /** @var int */
    private int $aid;

    public function __construct(TransportInterface $http, JsonRepoInterface $repo, array $tokens)
    {
        parent::__construct($http, $tokens);
        // $this->setCurrentTokens(self::PERM);

        $this->repo = $repo;
        $this->aid = -1;
    }

    private function query(string $path): array
    {
        return ['multipart' => [['name' => 'video_file', 'contents' => fopen($path, 'rb')]]];
    }

    private function buildChunks(array $files, array $list, int $c): array
    {
        return array_map(function($f) use($list) {
            foreach ($list as $item) {
                $link = $item['files'];

                if (basename($f) === basename($link)) {
                    $item['query'] = $this->query($f);
                    $item['links'] = $link;
                    $item['files'] = $f;
                    return $item;
                }
            }

            return null;
        }, array_slice($files, 0, $c));
    }

    private function server(int $to): callable
    {
        return function(array $video) use($to) {
            $video['server'] = $this->video->save($to, $video['title']);
            return $video;
        };
    }

    /**
     * @param int $oid
     * @return array
     */
    private function videosSourceList(int $oid): array
    {
        $this->repo->dir('videos' . $oid);
        $list = $this->repo->read('loaded');

        if (!$list && $this->generateVideos($oid)) {
            return $this->repo->read('loaded');
        }

        return $list;
    }

    /**
     * @param int $oid
     * @return bool
     */
    public function generateVideos(int $oid): bool
    {
        if ($videos = $this->video->get($oid, $this->aid)) {
            return $this->repo->save('loaded', $videos);
        }

        return false;
    }

    /**
     * @param int $from
     * @param int $to
     * @param int $c
     * @return array
     */
    public function run(int $from, int $to, int $c = 3): array
    {
        $list = $this->videosSourceList($from);
        $files = glob($this->repo->dir . '/files/*');
        shuffle($files);

        // $this->unlinks($from, $chunks);
        $promises = array_map(function(array $video) {
            $url = $video['server']['upload_url'];
            $query = $video['query'];
            return $this->http->async('POST', $url, $query);
        }, $chunks = array_map(
            $this->server($to),
            $this->buildChunks($files, $list, $c)
        ));

        $ret = array_filter(
            array_map(static function(array $item) {
                return $item['state'] === 'fulfilled'
                    ? $item['value']->getBody()->getContents()
                    : null;
            }, $this->http->wait($promises))
        );

        $loaded = [];

        foreach ($ret as $json) {
            /** @noinspection JsonEncodingApiUsageInspection */
            $info = json_decode($json, true);

            if (isset($info['video_id'])) {
                $loaded[] = $info['video_id'];
            }
        }

        if (count($loaded) === count($chunks)) {
            foreach ($chunks as $video) {
                unlink($video['files']);
            }
        }

        return $loaded;
    }

    public function build(int $from): bool
    {
        $this->repo->dir('videos' . $from);
        $list = $this->repo->read('loaded');

        $links = array_map('trim', file($this->repo->dir . '/links'));
        $ret = [];

        foreach ($links as $i => $link) {
            $ret[] = [
                'id' => $list[$i]['id'],
                'owner_id' => $list[$i]['owner_id'],
                'title' => $list[$i]['title'],
                'files' => $link
            ];
        }

        return $this->repo->save('loaded', $ret);
    }

    public function mapLinks(int $from, string $path): bool
    {
        $this->repo->dir('videos' . $from);
        $list = [];

        $raw = array_filter(array_map(static function($row) {
            $p = explode(' ', trim($row));
            $p = explode('?', $p[0] ?: '');

            return preg_replace('/.*vk\\.com.*/i', '', $p[0]);
        }, file($path)), static function(string $lnk) {
            return !$lnk || false !== stripos($lnk, 'vkuservideo');
        });

        // Todo: проверить!!!
        foreach ($raw as $i => $lnk) {
            if (!$lnk) {
                $list[] = $raw[$i - 1];
            }
        }

        return (bool) file_put_contents(
            $this->repo->dir . '/links',
            implode("\n", $list)
        );
    }

    public function unlinks(int $from): bool
    {
        $this->repo->dir('videos' . $from);
        $dir = $this->repo->dir;

        $links = file($dir . '/links');
        $files = array_map('basename', glob($dir . '/files/*'));
        $links = array_filter($links, static function($lnk) use($files) {
            return !in_array(basename($lnk), $files, false);
        });

        return (bool) file_put_contents(
            $dir . '/links',
            implode("\n", $links)
        );
    }
}
