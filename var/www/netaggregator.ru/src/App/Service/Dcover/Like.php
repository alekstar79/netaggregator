<?php declare(strict_types=1);

namespace App\Service\Dcover;

use MongoDB\{BulkWriteResult, Collection, Client};
use MongoDB\Operation\BulkWrite;

use RecursiveIteratorIterator;
use RecursiveArrayIterator;

use App\Auxiliary\VkEvents\EventInterface;
use App\VkApi\APIClientInterface;
use App\VkApi\TransportFactory;
use App\VkApi\APIClientFactory;

use Throwable;

/**
* Class Like
* @package App\Service\Dcover
* @property APIClientInterface vk
* @property Collection filter
* @property Collection dcover
* @property Collection likes
*/
class Like implements EventInterface
{
    use ExtendsTrait;

    /** @var APIClientInterface */
    private APIClientInterface $vk;

    /** @var Collection */
    private Collection $filter;

    /** @var Collection */
    private Collection $dcover;

    /** @var Collection */
    private Collection $likes;

    /** @var string */
    private $utoken;

    /** @var string */
    private $gtoken;

    /** @var int */
    private int $gid;

    /** @var array */
    private $evt;

    /** @var array */
    private array $old;

    /** @var array */
    private array $compute;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(APIClientInterface $vk, Client $mongo, array $c, array $e)
    {
        $this->evt = new RecursiveIteratorIterator(new RecursiveArrayIterator($e));

        $this->filter = $mongo->app->filter;
        $this->dcover = $mongo->app->dcover;
        $this->likes = $mongo->app->likes;

        $this->utoken = $c['access_token'] ?? $c['accessToken'];
        $this->gtoken = $c['group_token'];
        $this->gid = (int) $c['group_id'];

        $this->vk = $vk;
    }

    private function remove(int $uid): BulkWriteResult
    {
        return $this->likes->bulkWrite([
            [BulkWrite::UPDATE_ONE => [['_id' => $this->gid, 'uids' => $uid], ['$unset' => [ 'uids.$' => 1 ]]]],
            [BulkWrite::UPDATE_ONE => [['_id' => $this->gid], ['$pull' => ['uids' => null]]]]
        ]);
    }

    private function calculate(int $owner): array
    {
        $this->vk->setToken($this->utoken);
        $ids = [];

        if ($posts = array_column($this->vk->wall->get($owner, 10), 'id')) {
            $ids = $this->vk->likes->getLast1000($owner, $posts);
        }

        $this->vk->setToken($this->gtoken);

        return $ids;
    }

    public function perform(): void
    {
        $uid = $this->extract('liker_id');
        $ret = ['uids' => []];

        try {

            $this->whoIsNow('topLiker');

            switch ($this->extract('type'))
            {
                case 'like_add':
                    $this->last('lastLiker', (int) $uid);

                    $ret = $this->likes->findOneAndUpdate(
                        ['_id' => $this->gid],
                        ['$push' => ['uids' => ['$each' => [$uid], '$slice' => -1500]]],
                        [
                            'typeMap' => ['root' => 'array', 'document' => 'array'],
                            'projection' => ['_id' => 0],
                            'returnDocument' => 2,
                            'upsert' => true,
                        ]
                    );
                    break;

                case 'like_remove':
                    $this->remove((int) $uid);

                    $ret = $this->likes->findOne(
                        ['_id' => $this->gid],
                        array_merge(self::MAP, self::PROJECTION)
                    );
            }

            if (count($ret['uids']) < 5) {
                $ret['uids'] = $this->calculate(-$this->gid);

                if (count($ret['uids'])) {
                    $this->likes->updateOne(['_id' => $this->gid], ['$push' => ['uids' => ['$each' => $ret['uids']]]]);
                }
            }

            $filter = $this->filter->findOne(['_id' => $this->gid], self::MAP);

            if ($filter && count($filter['exclude'])) {
                $ret['uids'] = $this->exclude($ret['uids'], $filter['exclude']);
            }

            $this->compute = ['topLiker' => $ret['uids']];
            $this->top('topLiker', false);

        } catch (Throwable $e) {
        }
    }

    public function extract(string $key)
    {
        foreach($this->evt as $k => $v) {
            if ($k === $key) {
                return $v;
            }
        }

        return null;
    }

    public static function create(array $data): EventInterface
    {
        $token = $data['credential']['group_token'];
        $http = TransportFactory::create($token);

        return new self(
            APIClientFactory::create($http),
            new Client(),
            $data['credential'],
            $data['event']
        );
    }
}
