<?php declare(strict_types=1);

namespace App\Service\Dcover;

use MongoDB\{Collection, Client};

use RecursiveIteratorIterator;
use RecursiveArrayIterator;

use App\Auxiliary\VkEvents\EventInterface;
use App\VkApi\APIClientInterface;
use App\VkApi\APIClientFactory;
use App\VkApi\TransportFactory;

use Throwable;

/**
* Class Repost
* @package App\Service\Dcover
* @property APIClientInterface vk
* @property Collection reposts
* @property Collection filter
* @property Collection dcover
*/
class Repost implements EventInterface
{
    use ExtendsTrait;

    /** @var APIClientInterface */
    private APIClientInterface $vk;

    /** @var Collection */
    private Collection $reposts;

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

        $this->reposts = $mongo->app->reposts;
        $this->dcover = $mongo->app->dcover;
        $this->filter = $mongo->app->filter;

        $this->utoken = $c['access_token'] ?? $c['accessToken'];
        $this->gtoken = $c['group_token'];
        $this->gid = (int) $c['group_id'];

        $this->vk = $vk;
    }

    private function transform(array $reposts): array
    {
        return array_values(array_filter(array_column($reposts, 'to_id'), static fn($id): bool => abs($id) === $id));
    }

    private function calculate(int $owner): array
    {
        $this->vk->setToken($this->utoken);
        $ids = [];

        if ($posts = array_column($this->vk->wall->get($owner, 200), 'id')) {
            $ids = $this->transform($this->vk->wall->getLast200Reposts($owner, $posts));
        }

        $this->vk->setToken($this->gtoken);

        return $ids;
    }

    public function perform(): void
    {
        $type = $this->extract('type');
        $ret = ['uids' => []];

        try {

            $this->whoIsNow('topReposter');

            if ($type === 'wall_repost') {
                $oid = $this->extract('owner_id');
                $fid = $this->extract('from_id');
                $tid = $this->extract('to_id');
                $uid = $tid ?: $oid ?: $fid;

                $this->last('lastReposter', (int) $uid);

                $ret = $this->reposts->findOneAndUpdate(
                    ['_id' => $this->gid],
                    ['$push' => ['uids' => ['$each' => [$uid], '$slice' => -1500]]],
                    [
                        'typeMap' => ['root' => 'array', 'document' => 'array'],
                        'projection' => ['_id' => 0],
                        'returnDocument' => 2,
                        'upsert' => true,
                    ]
                );
            }
            if ($ret && count($ret['uids']) < 5) {
                $ret['uids'] = $this->calculate(-$this->gid);

                if (count($ret['uids'])) {
                    $this->reposts->updateOne(['_id' => $this->gid], ['$push' => ['uids' => ['$each' => $ret['uids']]]]);
                }
            }

            $filter = $this->filter->findOne(['_id' => $this->gid], self::MAP);

            if ($filter && count($filter['exclude'])) {
                $ret['uids'] = $this->exclude($ret['uids'], $filter['exclude']);
            }

            $this->compute = ['topReposter' => $ret['uids']];
            $this->top('topReposter');

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
