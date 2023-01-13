<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Service\Groups;

use MongoDB\Collection;
use MongoDB\Client;

use App\VkApi\TransportInterface;

/**
 * Class CallbackApiTuner
 * @package App\Service\Groups
 */
class CallbackApiTuner implements CallbackApiTunerInterface
{
    /** @var Collection */
    private Collection $repo;

    /** @var TransportInterface */
    private TransportInterface $http;

    /** @var array */
    private array $servers;

    public function __construct(Client $repo, TransportInterface $http)
    {
        /** @noinspection PhpUndefinedFieldInspection */
        $this->repo = $repo->app->gtokens;
        $this->http = $http;
        $this->servers = [];
    }

    /**
     * @param int $gid
     * @param array $data
     * @return void
     */
    private function update(int $gid, array $data): void
    {
        $this->repo->updateOne(['group_id' => $gid], ['$set' => $data], ['upsert' => true]);

    }

    /**
     * @param int $gid
     * @return string
     */
    private function hash(int $gid): string
    {
        return hash('tiger192,3', implode('&', [self::TITLE,self::URL,self::KEY,$gid]));
    }

    /**
     * @param array $ret
     * @param string $key
     * @param mixed $default
     * @return array|int|null
     */
    private function response(array $ret, $key = null, $default = null)
    {
        if ($response = $ret['response'] ?? []) {
            return $key ? $response[$key] ?? $default : $response;
        }

        return $default;
    }

    /**
     * @param string $hash
     * @return array
     */
    private function serverByHash(string $hash): array
    {
        if (($keys = array_column($this->servers, 'secret_key')) &&
            ($i = array_search($hash, $keys, false)) !== false) {
            return $this->servers[$i];
        }

        return [];
    }

    /**
     * @param string $token
     */
    public function setToken(string $token): void
    {
        $this->http->setToken($token);
    }

    /**
     * @param int $group_id
     * @param array $settings
     * @return array
     */
    public function configure(int $group_id, array $settings): array
    {
        $this->servers = $this->getCallbackServers($group_id);
        $code = $this->getCallbackConfirmationCode($group_id);
        $hash = $this->hash($group_id);

        $params = ['url' => self::URL, 'title' => self::TITLE, 'secret_key' => $hash];
        $installed = $this->serverByHash($hash);

        if (!isset($installed['id'])) {
            $this->update($group_id, ['confirmation_key' => $code]);
            $server_id = $this->addCallbackServer($group_id, $params);
        } else {
            $server_id = (int) $installed['id'];
        }
        if ($server_id) {
            $this->editCallbackServer($group_id, $server_id, $params);
            $this->setCallbackSettings($group_id, $server_id, $settings);
            $this->update($group_id, ['server_id' => $server_id]);

            $this->servers = $this->getCallbackServers(
                $group_id,
                $server_id
            );
        }

        return $this->serverByHash($hash);
    }

    /**
     * @param int $group_id
     * @param int $sid
     * @return string|null
     */
    public function status(int $group_id, int $sid): ?string
    {
        $c = 9;

        do {

            usleep(250000);

            $servers = array_column($this->getCallbackServers($group_id, $sid), 'status', 'id');
            $status = $servers[$sid] ?? null;

        } while ($status === 'wait' && $c--);

        return $status;
    }

    public function getCallbackServers(int $group_id, $server_ids = null): array
    {
        $r = $this->http->api(self::GETSERVERS, compact('group_id','server_ids'));

        return $this->response($r, 'items', []);
    }

    public function getCallbackConfirmationCode(int $group_id): ?string
    {
        $r = $this->http->api(self::GETCONFIRM, compact('group_id'));

        return $this->response($r, 'code');
    }

    public function getCallbackSettings(int $group_id, $server_id): array
    {
        $r = $this->http->api(self::GETSETTINGS, compact('group_id','server_id'));

        return $this->response($r, null, []);
    }

    public function setCallbackSettings(int $group_id, $server_id, array $set): int
    {
        $params = array_merge(compact('group_id','server_id'), $set);

        $r = $this->http->api(self::SETSETTINGS, $params);

        return $this->response($r, null, 0);
    }

    public function addCallbackServer(int $group_id, array $set): ?int
    {
        $r = $this->http->api(self::ADDSERVER, array_merge(compact('group_id'), $set));

        return $this->response($r, 'server_id');
    }

    public function editCallbackServer(int $group_id, $server_id, array $set): int
    {
        $params = array_merge(compact('group_id','server_id'), $set);

        $r = $this->http->api(self::EDITSERVER, $params);

        return $this->response($r, null, 0);
    }

    public function deleteCallbackServer(int $group_id, $server_id): int
    {
        $r = $this->http->api(self::DELETESERVER, compact('group_id','server_id'));

        return $this->response($r, null, 0);
    }
}
