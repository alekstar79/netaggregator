<?php declare(strict_types=1);

namespace App\Service\Dcover;

use MongoDB\{ BSON\ObjectId, Collection, Operation\FindOneAndUpdate };
use stdClass;

use App\VkApi\APIClientInterface;
use Helpers\TJsonUtility;

use RuntimeException;
use Throwable;

/**
* Trait ExtendsTrait
* @package App\Service\Dcover
* @property Collection dcover
* @property Collection subscribe
* @property APIClientInterface vk
*/
trait ExtendsTrait
{
    use TJsonUtility;

    public function issetPhoto(array $user): bool
    {
        return isset($user['photo_200']) && $user['photo_200'];
    }

    public function exclude(array $uids, array $e): array
    {
        return array_filter($uids, static fn($uid) => !in_array($uid, $e, false));
    }

    public function store(string $id, array $user, bool $changed = false): void
    {
        $set = [$id => $user];

        if ($changed || !$this->old || $this->old['id'] !== $user['id']) {
            $set['changed'] = true;
        }

        $this->dcover->updateOne(
            ['_id' => $this->gid],
            ['$set' => $set],
            ['upsert' => true]
        );
    }

    public function whoIsNow(string $type): void
    {
        $map = ['typeMap' => ['root' => 'array', 'document' => 'array']];

        if ($cover = $this->dcover->findOne(['_id' => $this->gid], $map)) {
            $this->old = $cover[$type] ?? [];
        }
    }

    public function top(string $id, bool $last = true): void
    {
        if (($data = array_count_values($this->compute[$id])) &&
            ($uids = array_keys($data, max($data), false))) {

            try {

                $user = $this->vk->users->get($last ? $uids[count($uids) - 1] : $uids[0], 'photo_200')[0];

                if (isset($user['deactivated'])) {
                    $user['photo_200'] = 'banned';
                } elseif (!$this->issetPhoto($user)) {
                    $user['photo_200'] = 'default';
                }

                $this->store($id, $user);

            } catch (Throwable $e) {
            }
        }
    }

    public function last(string $id, int $uid): void
    {
        try {

            $user = $this->vk->users->get($uid, 'photo_200')[0];

            if (isset($user['deactivated'])) {
                $user['photo_200'] = 'banned';
            } elseif (!$this->issetPhoto($user)) {
                $user['photo_200'] = 'default';
            }

            $this->store($id, $user, true);

        } catch (Throwable $e) {
        }
    }

    /* public function dataTransform(array $objects, array $exclude = []): array
    {
        $exclude || ($exclude = array_fill_keys(['custom','track','version'], true));

        $doc = array_filter($objects, static function($o) {
            return strpos($o['type'], 'widget') !== false;
        });

        $filter = static function(array $o) use($exclude) {
            return array_filter($o, static function($k) use($exclude) {
                return !isset($exclude[$k]);
            }, 2);
        };

        return array_combine(
            array_map(static function($o) {
                $k = str_replace('widget-', '', $o['type']);

                if ($k === 'profile') {
                    $k = $o['profile'];
                }

                return $k;

            }, $doc),
            array_map(static function($o) use ($filter) {
                $o['objects'] = array_map($filter, $o['objects']);
                return $filter($o);

            }, $doc)
        );
    } */

    public function run(string $worker, array $params = []): void
    {
        try {

            $data = base64_encode(json_encode($params, JSON_THROW_ON_ERROR));

            exec(sprintf(
                'nohup php %s %s > /dev/null 2>&1 &',
                $worker,
                $data
            ));

        } catch (Throwable $e) {
        }
    }

    public function updateDcover(int $uid, array $state): void
    {
        $profiles = isset($state['profiles']) ? array_fill_keys(
            array_filter($state['profiles'], static fn($p): bool => !str_starts_with($p, 'user')),
            self::DEFAULT
        ) : [];

        $set = [
            'weather' => (bool) ($state['weather'] ?? false),
            'time' => (bool) ($state['time'] ?? false),
            'changed' => true
        ];

        if (!isset($state['connections'])) {
            $state['connections'] = [];
        }
        if (isset($state['traffic'])) {
            $set['traffic'] = true;
        }
        if (isset($state['json'])) {
            $set['json'] = $state['json'];
        }
        if (isset($state['rss'])) {
            $set['rss'] = $state['rss'];
        }
        if (isset($state['manual'])) {
            $set['manual'] = true;
        }

        foreach ($state['connections'] as $_id) { try {
            if ($doc = $this->dcover->findOneAndUpdate(
                $filter = compact('_id'),
                [
                    '$setOnInsert' => array_merge(['info' => new stdClass], $profiles),
                    '$set' => $set
                ],
                [
                    'returnDocument' => FindOneAndUpdate::RETURN_DOCUMENT_BEFORE,
                    'typeMap' => ['root' => 'array', 'document' => 'array'],
                    'upsert' => true,
                ]
            ))
            {
                $this->dcover->bulkWrite(
                    array_values(array_filter(array_merge(
                        [['updateOne' => [$filter, ['$unset' => ['birthday' => '']]]]],

                        array_map(
                            static function(array $v, string $p) use($doc, $filter) {
                                return isset($doc[$p])
                                    ? ['updateOne' => [$filter, ['$set' => [$p => $doc[$p]]]]]
                                    : ['updateOne' => [$filter, ['$set' => [$p => $v]]]];
                            },
                            array_values($profiles),
                            array_keys($profiles)
                        )

                    )))
                );
            }

        } catch (Throwable $e) {
        } }

        $this->subscribe->updateOne(
            ['uid' => $uid],
            [
                '$setOnInsert' => [
                    'chatbot' => (object) [],
                    'cover' => (object) [],
                    'designer' => false,
                    'stream' => false,
                    'widget' => (object) []
                ]
            ],
            ['upsert' => true]
        );

        if (isset($state['rss'])) {
            $this->run('/var/www/netaggregator.ru/src/App/Service/Rss/update.php', $state['connections']);
        }
        if (isset($state['currency'])) {
            $this->run('/var/www/netaggregator.ru/src/App/Service/Currency/load.php');
        }
        if (isset($state['info'])) {
            $this->run('/var/www/netaggregator.ru/src/App/Service/Info/update.php');
        }
    }

    public function prepareDbSet(int $uid, array $data): array
    {
        return array_filter(array_merge($data, [
            'uid' => $uid,
            'timezone' => $data['timezone'] ?? 'Europe/Moscow',
            'background' => $data['background'] ?? true,
            'weather' => $data['weather'] ?? null,
            'widgets' => $data['widgets'] ?? [],
            'name' => $data['name'] ?? time(),
            'time' => $data['time'] ?? false,
            'manual' => null,
            'info' => null,
            'json' => null,
            'rss' => null
        ]));
    }

    /**
     * @param int $uid
     * @param array $data
     * @param Collection $collection
     * @return string
     * @see https://github.com/mongodb/mongo-php-library/blob/21e7ecde42e45d98ced06c6818495289c1e2e916/src/Operation/FindOneAndUpdate.php#L37
     */
    public function saveToDb(int $uid, array $data, Collection $collection): string
    {
        if ($hash = $data['hash'] ?? null) {
            unset($data['hash']);
        }

        $set = $this->prepareDbSet($uid, $data);

        if (!isset($set['connections'])) {
            $set['connections'] = [];
        }

        if (!isset(($ret = $collection->findOneAndUpdate(
            ['_id' => new ObjectId($hash)],
            ['$set' => $set],
            [
                'typeMap' => ['root' => 'array', 'document' => 'array'],
                'returnDocument' => 2,
                'upsert' => true,
            ]

        ))['_id']))
        {
            throw new RuntimeException('Save error');
        }

        $_id = $ret['_id']->__toString();

        try {

            /**
             * @see https://losst.ru/nastrojka-sudo-v-linux
             * visudo www-data ALL=(ALL) NOPASSWD: ALL
             * ln -s "$(which node)" /usr/bin/node
             * add a user to the sudo group
             * usermod -aG sudo www-data
             */
            if (isset($set['weather'])) {
                $root = dirname(__DIR__, 4);
                $file = $root . '/src/App/Service/Weather/ya-fetch.php';
                // $file = $root . '/nuxt/server/weather-update.mjs';
                // $pwu = posix_getpwuid(posix_geteuid());
                $out = null;
                $err = null;

                exec("nohup php $file $_id > /dev/null 2>&1 &", $out, $err); // sudo $file ...

                /* file_put_contents(
                    __DIR__ . '/exec.json',

                    json_encode(
                        compact('_id', 'file', 'out', 'exe', 'err'),
                        JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE
                    )
                ); */
            }

        } catch (Throwable $e) {
            file_put_contents(__DIR__ . '/exec-error.txt', $e->getMessage());
        }

        return $_id;
    }
}
