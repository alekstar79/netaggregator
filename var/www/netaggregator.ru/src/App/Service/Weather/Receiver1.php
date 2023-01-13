<?php

/**
* @noinspection PhpUndefinedFieldInspection
*/

declare(strict_types=1);

namespace App\Service\Weather;

use MongoDB\Collection;
use MongoDB\Client;

/**
* Class Receiver
* @package App\Service\Weather
*/
class Receiver1 implements ReceiverInterface
{
    /** @var OpenWeatherInterface */
    private OpenWeatherInterface $weather;

    /** @var Collection */
    private Collection $dcover;

    /** @var Collection */
    private Collection $xcover;

    /** @var array */
    private array $queue;

    public function __construct(OpenWeatherInterface $weather, Client $mongo)
    {
        $this->dcover = $mongo->app->dcover;
        $this->xcover = $mongo->app->xcover;

        $this->weather = $weather;
    }

    private function store(int $gid, array $set): void
    {
        $weather = $this->dcover->findOne(['_id' => $gid], self::MAP)['weather'];
        $mset = ['weather' => $set];
        $opts = ['upsert' => true];

        if ($weather && $weather !== $set) {
            $mset['changed'] = true;
        }

        $this->dcover->updateOne(['_id' => $gid], ['$set' => $mset], $opts);
    }

    private function compute(string $country, array $set): void
    {
        while ($cities = array_splice($set, 0, 20)) {
            $weather = $this->weather->adapt($this->weather->cities($cities, $country)->fetch());

            foreach ($this->queue[$country] as $gid => $city) {
                if (isset($weather[$city])) {
                    $this->store($gid, $weather[$city]);
                    unset($this->queue[$country][$gid]);
                }
            }
            if ($set) {
                sleep(20);
            }
        }
    }

    private function list(array $set): self
    {
        $this->queue = [];

        foreach ($set as $gid => $item) {
            $this->queue[$item['country']][$gid] = $item['city'];
        }

        return $this;
    }

    private function perform(): void
    {
        foreach ($this->queue as $country => $set) {
            $this->compute($country, array_unique($set));
        }
    }

    public function fetch(): void
    {
        $sample = $this->xcover->find(
            [
                'weather' => ['$exists' => true, '$ne' => null],
                'connections' => ['$ne' => []]
            ],
            self::MAP
        )->toArray();

        $connections = array_column($sample, 'connections');
        $weather = array_column($sample, 'weather');
        $list = [];

        foreach ($connections as $i => $ids) {
            foreach ($ids as $gid) {
                $list[$gid] = $weather[$i];
            }
        }

        if ($list) {
            $this->list($list)->perform();
            $this->weather->clear();
            $this->queue = [];
        }
    }
}
