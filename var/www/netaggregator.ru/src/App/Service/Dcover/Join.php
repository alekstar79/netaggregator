<?php declare(strict_types=1);

namespace App\Service\Dcover;

use MongoDB\{ Collection, Client };

use RecursiveIteratorIterator;
use RecursiveArrayIterator;

use App\Auxiliary\VkEvents\EventInterface;
use App\VkApi\APIClientInterface;
use App\VkApi\APIClientFactory;
use App\VkApi\TransportFactory;

use Throwable;

/**
* Class Join
* @package App\Service\Dcover
* @property APIClientInterface vk
* @property Collection dcover
*/
class Join implements EventInterface
{
    use ExtendsTrait;

    /** @var APIClientInterface */
    private APIClientInterface $vk;

    /** @var Collection */
    private Collection $dcover;

    /** @var string */
    private $token;

    /** @var int */
    private int $gid;

    /** @var int */
    private int $uid;

    /** @var array */
    private $evt;

    /** @var array */
    private array $old;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(APIClientInterface $vk, Client $mongo, array $c, array $e)
    {
        $this->evt = new RecursiveIteratorIterator(new RecursiveArrayIterator($e));

        $this->uid = (int) $this->extract('user_id');
        $this->gid = (int) $c['group_id'];

        $this->token = getenv('STANDALONE_TOKEN');
        $this->dcover = $mongo->app->dcover;

        $this->vk = $vk;
    }

    private function getUser(): array
    {
        return $this->vk->api('/users.get', ['fields' => 'photo_100,photo_200', 'user_id' => $this->uid]);
    }

    private function isRequest(): bool
    {
        return $this->gid === 169906699 && $this->extract('join_type') !== 'approved';
    }

    // Only for my group
    private function approve(): void
    {
        $this->vk->api('/groups.approveRequest', [
            'access_token' => $this->token,
            'group_id' => $this->gid,
            'user_id' => $this->uid
        ]);
    }

    public function perform(): void
    {
        try {

            $user = $this->getUser()['response'] ?? [];

            if ($user[0]) {
                $this->whoIsNow('lastSubscriber');
                $this->store('lastSubscriber', $user[0]);
            }
            if ($this->isRequest()) {
                $this->approve();
            }

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
        $http = TransportFactory::create($data['credential']['group_token']);

        return new self(
            APIClientFactory::create($http),
            new Client(),
            $data['credential'],
            $data['event']
        );
    }
}
