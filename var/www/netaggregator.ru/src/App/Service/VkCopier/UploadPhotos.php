<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Service\VkCopier;

use Psr\Http\Message\ResponseInterface;

use App\VkApi\TransportInterface;
use App\VkApi\APIClient;

use Helpers\TWriterUtility;

use Throwable;

/**
* Class UploadPhotos
* @package App\Service\VkCopier
*/
class UploadPhotos extends APIClient
{
    use TWriterUtility;

    /** @var int */
    private $album_id;

    /** @var int */
    private $group_id;

    /** @var array */
    private array $list;

    public function __construct(int $album_id, int $group_id, TransportInterface $http, array $tokens)
    {
        parent::__construct($http, array_values($tokens));

        $this->http->setToken($this->tokens[0]);

        $this->album_id = abs($album_id);
        $this->group_id = abs($group_id);

        $this->list = [];
    }

    /** @noinspection DuplicatedCode */
    private function await(array $promises): array
    {
        return array_filter(
            array_map(static function(array $item) {
                if ($item['state'] !== 'fulfilled') {
                    return null;
                }
                If ($item['value'] instanceof ResponseInterface) {
                    $ret = $item['value']->getBody()->getContents();
                } else {
                    $ret = $item['value'];
                }

                try {

                    $ret = json_decode($ret, true, 512, JSON_THROW_ON_ERROR);

                } catch (Throwable $e) {
                    $ret = ['response' => $item['value']];
                }

                return $ret['response'] ?? $ret;

            }, $this->http->wait($promises))
        );
    }

    private function query(int $n, array $data): array
    {
        $set = [];

        foreach ($data as $i => $photo) {
            $x = $i + 1;

            $set['multipart'][] = [
                'name'     => "file$x",
                'filename' => "photo$n$x.jpg",
                'contents' => fopen($photo, 'rb')
            ];
        }

        return $set;
    }

    private function save(int $i, array $list): array
    {
        $album_id = $this->album_id;
        $group_id = $this->group_id;
        $promises = [];

        foreach ($list as $s => $params) {
            if (isset($params['hash'], $params['server'])) {
                $this->http->setToken($this->list[$i][$s]['access_token']);

                $promises[$s] = $this->http->asyncApi(
                    '/photos.save',
                    array_merge(compact('album_id','group_id'), $params),
                    'POST'
                );
            }
        }

        return $this->await($promises);
    }

    private function upload(int $i, array $servers): array
    {
        $promises = [];

        foreach ($servers as $s => $params) {
            if (isset($params['upload_url'])) {
                $promises[$s] = $this->http->async(
                    'POST',
                    $params['upload_url'],
                    $this->query($i, $this->list[$i][$s]['files'])
                );
            }
        }

        return $this->await($promises);
    }

    private function getServers(array $list): array
    {
        $album_id = $this->album_id;
        $group_id = $this->group_id;
        $promises = [];

        foreach ($list as $i => $params) {
            $this->http->setToken($params['access_token']);
            $promises[$i] = $this->http->asyncApi('/photos.getUploadServer', compact('album_id','group_id'));
        }

        return $this->await($promises);
    }

    private function prepare(array $list): self
    {
        $c = count($this->tokens);

        foreach ($list as $i => $files) {
            $access_token = $this->tokens[$i % $c];
            $this->list[] = compact('access_token','files');
        }

        $this->list = array_chunk($this->list, $c);

        return $this;
    }

    private function readDir(string $path, string $needle): array
    {
        $iter = $this->getIterator($path);
        $list = [];

        foreach ($iter as $info) {
            if ($info->isDir() && $f = glob($iter->key() . $needle)) {
                array_push($list, ...$f);
            }
        }

        return $list;
    }

    private function writeFile(array $uploaded): void
    {
        $f = fopen(__DIR__ . '/uploaded.txt', 'wb');

        fwrite($f, implode("\n", $uploaded));
        fclose($f);
    }

    private function print(): string
    {
        return 'Count: ' . count($this->list) . " AID $this->album_id GID $this->group_id\n-------------------------\n";
    }

    public function run(string $dir): void
    {
        $list = array_chunk($this->readDir($dir, '/*.jpg'), 5);

        $this->prepare($list);

        echo $this->print();

        $uploaded = [];

        foreach ($this->list as $i => $set) {
            $this->save($i, $this->upload($i, $this->getServers($set)));
            array_push($uploaded, ...array_column($set, 'files'));
            echo $i . "\n";
            sleep(1);
        }

        $this->writeFile(array_merge(...$uploaded));
    }

    public function getAlbums(): array
    {
        $albums = $this->http->api('/photos.getAlbums', ['owner_id' => -$this->group_id]);

        return array_column($albums['response']['items'], 'id', 'title');
    }
}
