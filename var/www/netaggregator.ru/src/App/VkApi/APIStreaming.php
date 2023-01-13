<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\VkApi;

/**
* Class APIStreaming
* @package App\VkApi
*/
class APIStreaming extends API
{
    private const

        GETSERVERURL = '/streaming.getServerUrl',
        GETSETTINGS  = '/streaming.getSettings',
        SETSETTINGS  = '/streaming.setSettings',
        GETSTATS     = '/streaming.getStats';

    /**
     * @param string $access_token Service token
     * @return array
     * @throws RejectInterface
     */
    public function getServerUrl(string $access_token): array
    {
        return $this->api(self::GETSERVERURL, compact('access_token'));
    }

    /**
     * @param string $access_token Service token
     * @return array
     * @throws RejectInterface
     */
    public function getSettings(string $access_token): array
    {
        return $this->api(self::GETSETTINGS, compact('access_token'));
    }

    /**
     * @param string $monthly_tier [tier_1,tier_2,tier_3,tier_4,tier_5,tier_6,unlimited]
     * @param string $access_token Service token
     * @return int
     * @throws RejectInterface
     */
    public function setSettings(string $monthly_tier, string $access_token): int
    {
        return $this->api(self::SETSETTINGS, compact('monthly_tier','access_token'));
    }

    /**
     * @param string $type [received, prepared]
     * @param string $access_token Service token
     * @param string $interval [5m, 1h, 24h]
     * @param int|null $start_time UnixTimestamp
     * @param int|null $end_time UnixTimestamp
     * @return array
     * @throws RejectInterface
     */
    public function getStats(
        string $type,
        string $access_token,
        string $interval = '5m',
        int $start_time = null,
        int $end_time = null
    ): array {

        $end_time = is_int($end_time) ? $end_time : time();

        if (!is_int($start_time)) {
            $one_day_ago = strtotime('-1 day', $end_time);

            $start_time = is_int($one_day_ago)
                ? $one_day_ago
                : $end_time;
        }

        return $this->api(
            self::GETSTATS,
            compact('type','interval','start_time','end_time','access_token')
        );
    }
}
