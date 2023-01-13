<?php
/**
* @noinspection PhpUndefinedFieldInspection
* @noinspection DuplicatedCode
*/

declare(strict_types=1);

namespace App\Service\Info;

use Psr\Http\Message\ResponseInterface;

use MongoDB\{ Database, Client };

use App\VkApi\TransportInterface;

use Throwable;

/**
* Class Informer
* @package App\Service\Info
*/
class Informer implements InformerInterface
{
    /** @var TransportInterface */
    private TransportInterface $vk;

    /** @var Database */
    private Database $db;

    /** @var array */
    private array $requests;

    /** @var int */
    private int $mark;

    public function __construct(Client $mongo, TransportInterface $vk)
    {
        $this->db = $mongo->app;
        $this->vk = $vk;

        $this->requests = [];
        $this->mark = 0;
    }

    private function await(array $promises): array
    {
        $result = $this->vk->wait($promises);

        return array_filter(array_map(static function(array $item) {
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

        }, $result));
    }

    private function update(int $gid): void
    {
        try {

            $this->db->dcover->updateOne(
                ['_id' => $gid],
                ['$set' => [
                    'changed' => true,
                    'info' => array_map(
                        static fn($set): int => $set['count'] ?? 0,
                        $this->await($this->requests)
                    )
                ]]
            );

        } catch (Throwable $e) {
        }

        sleep(1);
    }

    public function fetch(): void
    {
        foreach ($this->db->gtokens->aggregate([
            // ['$match' => ['group_id' => ['$in' => $this->db->dcover->distinct('_id', ['info' => true])]],],
            ['$lookup' => ['from' => 'utokens', 'localField' => 'user_id', 'foreignField' => 'userId', 'as' => 'user']],
            ['$unwind' => '$user'],
            ['$project' => self::PROJECT]
        ], self::MAP) as $data)
        {
            $gid = $data['group_id'];

            $this->requests['subscribers'] = $this->vk->asyncApi('/groups.getMembers', [
                'access_token' => $data['user']['accessToken'], // $data['group_token'],
                'group_id' => $gid
            ]);

            $this->requests['online'] = $this->vk->asyncApi('/users.search', [
                'access_token' => $data['user']['accessToken'],
                'group_id' => $gid,
                'online' => 1
            ]);

            $this->requests['female'] = $this->vk->asyncApi('/users.search', [
                'access_token' => $data['user']['accessToken'],
                'group_id' => $gid,
                'sex' => 1
            ]);

            $this->requests['male'] = $this->vk->asyncApi('/users.search', [
                'access_token' => $data['user']['accessToken'],
                'group_id' => $gid,
                'sex' => 2
            ]);

            $this->update($gid);
        }
    }

    public function next(): void
    {
        try {

            $this->mark = time() + self::TIMER;
            // echo date("H:i:s\n", $this->mark);
            $this->fetch();

        } catch (Throwable $e) {
        }

        $this->run();
    }

    public function run(): void
    {
        $time = time();

        if ($this->mark && $this->mark > $time) {
            sleep($this->mark - $time);
        }

        $this->next();
    }
}
