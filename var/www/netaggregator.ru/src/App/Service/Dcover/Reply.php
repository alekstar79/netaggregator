<?php declare(strict_types=1);

namespace App\Service\Dcover;

use MongoDB\{BulkWriteResult, Collection, Client};
use MongoDB\Operation\BulkWrite;

use RecursiveIteratorIterator;
use RecursiveArrayIterator;

use App\Auxiliary\VkEvents\EventInterface;
use App\VkApi\APIClientInterface;
use App\VkApi\APIClientFactory;
use App\VkApi\TransportFactory;

use Throwable;

/**
* Class Reply
* @package App\Service\Dcover
* @property APIClientInterface vk
* @property Collection comments
* @property Collection filter
* @property Collection dcover
*/
class Reply implements EventInterface
{
    use ExtendsTrait;

    /** @var APIClientInterface */
    private APIClientInterface $vk;

    /** @var Collection */
    private Collection $comments;

    /** @var Collection */
    private Collection $dcover;

    /** @var Collection */
    private Collection $filter;

    /** @var string  */
    private $utoken;

    /** @var string  */
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

        $this->comments = $mongo->app->comments;
        $this->filter = $mongo->app->filter;
        $this->dcover = $mongo->app->dcover;

        $this->utoken = $c['access_token'] ?? $c['accessToken'];
        $this->gtoken = $c['group_token'];
        $this->gid = (int) $c['group_id'];

        $this->vk = $vk;
    }

    private function remove(int $uid): BulkWriteResult
    {
        return $this->comments->bulkWrite([
            [BulkWrite::UPDATE_ONE => [['_id' => $this->gid, 'uids' => $uid], ['$unset' => [ 'uids.$' => 1 ]]]],
            [BulkWrite::UPDATE_ONE => [['_id' => $this->gid], ['$pull' => ['uids' => null]]]]
        ]);
    }

    private function filter(array $comments): array
    {
        return array_values(array_filter(array_column($comments, 'from_id'), static fn($id): bool => abs($id) === $id));
    }

    private function calculate(int $owner): array
    {
        $this->vk->setToken($this->utoken);
        $ids = [];

        if ($posts = array_column($this->vk->wall->get($owner, 100), 'id')) {
            $ids = $this->filter($this->vk->wall->getLast100($owner, $posts));
        }

        $this->vk->setToken($this->gtoken);

        return $ids;
    }

    public function perform(): void
    {
        $ret = ['uids' => []];

        try {

            $this->whoIsNow('topCommentor');

            switch ($this->extract('type'))
            {
                case 'wall_reply_new':
                    $uid = $this->extract('from_id');

                    $this->last('lastCommentor', (int) $uid);

                    $ret = $this->comments->findOneAndUpdate(
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

                case 'wall_reply_delete':
                    $uid = $this->extract('deleter_id');
                    $this->remove((int) $uid);

                    $ret = $this->comments->findOne(
                        ['_id' => $this->gid], [
                            'typeMap' => ['root' => 'array', 'document' => 'array'],
                            'projection' => ['_id' => 0]
                        ]
                    );
            }

            if ($ret && count($ret['uids']) < 5) {
                $ret['uids'] = $this->calculate(-$this->gid);

                if (count($ret['uids'])) {
                    $this->comments->updateOne(
                        ['_id' => $this->gid],
                        ['$push' => ['uids' => ['$each' => $ret['uids']]]]
                    );
                }
            }

            $filter = $this->filter->findOne(['_id' => $this->gid], [
                'typeMap' => ['root' => 'array', 'document' => 'array']
            ]);

            if ($filter && count($filter['exclude'])) {
                $ret['uids'] = $this->exclude($ret['uids'], $filter['exclude']);
            }

            $this->compute = ['topCommentor' => $ret['uids']];
            $this->top('topCommentor');

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
