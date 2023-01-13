<?php declare(strict_types=1);

namespace App\Service\Groups;

/**
* Interface CallbackApiTunerInterface
* @package App\Service\Groups
*/
interface CallbackApiTunerInterface
{
    public const

        GETSERVERS   = '/groups.getCallbackServers',
        GETCONFIRM   = '/groups.getCallbackConfirmationCode',
        GETSETTINGS  = '/groups.getCallbackSettings',
        SETSETTINGS  = '/groups.setCallbackSettings',
        ADDSERVER    = '/groups.addCallbackServer',
        EDITSERVER   = '/groups.editCallbackServer',
        DELETESERVER = '/groups.deleteCallbackServer',

        TITLE = 'Netaggregator',
        URL   = 'https://netaggregator.ru/vk/events',
        KEY   = 'NetXBot';

    /**
     * @param string $token
     */
    public function setToken(string $token): void;

    /**
     * @param int $group_id
     * @param array $settings
     * @return array
     */
    public function configure(int $group_id, array $settings): array;

    /**
     * @param int $group_id
     * @param int $sid
     * @return string|null
     */
    public function status(int $group_id, int $sid): ?string;

    public function getCallbackServers(int $group_id, $server_ids = null): array;

    public function getCallbackConfirmationCode(int $group_id): ?string;

    public function getCallbackSettings(int $group_id, $server_id): array;

    public function setCallbackSettings(int $group_id, $server_id, array $set): int;

    public function addCallbackServer(int $group_id, array $set): ?int;

    public function editCallbackServer(int $group_id, $server_id, array $set): int;

    public function deleteCallbackServer(int $group_id, $server_id): int;
}
