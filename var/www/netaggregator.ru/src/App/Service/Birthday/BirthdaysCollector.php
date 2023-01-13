<?php
/**
* @noinspection PhpUndefinedFieldInspection
* @noinspection DuplicatedCode
*/

declare(strict_types=1);

namespace App\Service\Birthday;

use MongoDB\{ Database, Client };

use App\VkApi\TransportInterface;

use Throwable;

/**
 * Class BirthdaysCollector
 * @package App\Service\Birthday
 */
class BirthdaysCollector implements BirthdaysCollectorInterface
{
    /** @var TransportInterface */
    private TransportInterface $vk;

    /** @var Database */
    private Database $db;

    /** @var array */
    private array $struct;

    /** @var array */
    private array $hash;

    /** @var int */
    private int $time;

    /** @var int */
    private int $mark;

    public function __construct(Client $mongo, TransportInterface $vk)
    {
        $this->db = $mongo->app;
        $this->vk = $vk;

        $this->struct = array_flip(['id','first_name','last_name','photo_100','photo_200']);
        $this->hash = [];
        $this->time = 0;
        $this->mark = 0;
    }

    private function fetch(): void
    {
        try {

            $time = time() % (3600 * 24) + date('Z');

            if ($this->time >= $time) {
                $this->hash = [];
            }

            $this->mark = $time + self::TIMER;
            $this->time = $time;

            $dump = [];

            foreach($this->db->gtokens->aggregate([
                ['$match' => ['group_id' => ['$in' => $this->db->dcover->distinct('_id', ['birthday' => ['$exists' => true]])]]],
                ['$lookup' => ['from' => 'utokens', 'localField' => 'user_id', 'foreignField' => 'userId', 'as' => 'user']],
                ['$unwind' => '$user'],
                ['$project' => self::PROJECT]
            ], self::MAP) as $data)
            {
                $gid = $data['group_id'];
                $dump[$gid] = true;

                if (isset($this->hash[$gid])) {
                    continue;
                }

                $this->hash[$gid] = true;

                $result = $this->vk->api('/users.search', [
                    'access_token' => $data['user']['accessToken'],
                    'fields' => 'photo_100,photo_200',
                    'birth_month' => date('n'),
                    'birth_day' => date('j'),
                    'group_id' => $gid
                ]);

                if (isset($result['response']['items'])) {
                    $struct = $this->struct;

                    $this->db->dcover->updateOne(
                        ['_id' => $gid],
                        ['$set' => [
                            'changed' => true,
                            'birthday' => array_map(
                                static fn($u) => (object) array_intersect_key($u ?: [], $struct),
                                (array) $result['response']['items']
                            )
                        ]]
                    );
                }

                usleep(700000);
            }

            $this->hash = array_intersect_key($dump, $this->hash);

        } catch (Throwable $e) {
        }

        $this->run();
    }

    public function run(): void
    {
        $time = time() % (3600 * 24) + date('Z');

        if ($this->mark && $this->mark > $time) {
            sleep($this->mark - $time);
        }

        $this->fetch();
    }
}
