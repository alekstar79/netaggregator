<?php declare(strict_types=1);

namespace App\Auxiliary\Cover;

use App\VkApi\TransportInterface;

/**
* Class Loader - group cover uploader (no longer used in the project)
* @package App\Auxiliary\Cover
*/
abstract class Loader
{
    public const RATIO = 3;

    /** @var TransportInterface */
    protected TransportInterface $http;

    /** @var array */
    protected array $list;

    public function __construct(TransportInterface $http)
    {
        $this->http = $http;
        $this->list = [];
    }

    abstract public function dpath(int $gid, string $file): string;

    /** @noinspection JsonEncodingApiUsageInspection */
    private function await(array $promises): array
    {
        return array_filter(
            array_map(static function(array $item) {
                $ret = $item['state'] === 'fulfilled'
                    ? $item['value']->getBody()->getContents()
                    : '[]';

                $ret = json_decode($ret, true);
                return $ret['response'] ?? $ret;
            }, $this->http->wait($promises))
        );
    }

    private function save(array $list): array
    {
        $promises = [];

        foreach ($list as $gid => $params) {
            if (isset($params['hash'], $params['photo'])) {
                $this->http->setToken($this->list[$gid]['access_token']);
                $promises[$gid] = $this->http->asyncApi(
                    '/photos.saveOwnerCoverPhoto',
                    $params
                );
            }
        }

        return $this->await($promises);
    }

    private function upload(array $servers): array
    {
        $promises = [];

        foreach ($servers as $gid => $params) {
            if (isset($params['upload_url'])) {
                $promises[$gid] = $this->http->async(
                    'POST', $params['upload_url'], ['multipart' => [[
                        'contents' => fopen($this->list[$gid]['path'], 'rb'),
                        'name' => 'photo'
                    ]]]
                );
            }
        }

        return $this->await($promises);
    }

    private function getServers(): array
    {
        $promises = [];
        $crop_x = 0;
        $crop_y = 0;

        foreach ($this->list as $group_id => $params) {
            [$crop_x2, $crop_y2] = $params['size'];

            $this->http->setToken($params['access_token']);
            $promises[$group_id] = $this->http->asyncApi(
                '/photos.getOwnerCoverPhotoUploadServer',
                compact('group_id','crop_x','crop_y','crop_x2','crop_y2')
            );
        }

        return $this->await($promises);
    }

    private function prepare(array $list): void
    {
        $this->list = [];

        foreach ($list as $gid => $access_token) {
            $path = $this->dpath($gid, 'img.jpg');

            if (!file_exists($path)) {
                continue;
            }

            $size = getimagesize($path);

            if (($size[0] / $size[1]) === self::RATIO) {
                $this->list[$gid] = compact('access_token','path','size');
            }
        }
    }

    public function setup(array $list): array
    {
        $this->prepare($list);

        return $this->list
            ? $this->save($this->upload($this->getServers()))
            : [];
    }
}
