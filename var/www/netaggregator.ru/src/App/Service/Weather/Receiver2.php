<?php /** @noinspection PhpUndefinedFieldInspection */

declare(strict_types=1);

namespace App\Service\Weather;

use MongoDB\Collection;
use MongoDB\Client;

use Throwable;

/**
* Class Receiver
* @package App\Service\Weather
*/
class Receiver2 implements ReceiverInterface
{
    /** @var OpenWeatherInterface */
    private OpenWeatherInterface $client;

    /** @var Collection */
    private Collection $dcover;

    /** @var Collection */
    private Collection $store;

    private array $weather;

    public function __construct(OpenWeatherInterface $weather, Client $mongo)
    {
        $this->map = $mongo->app->weathermap;

        $this->dcover = $mongo->app->dcover;
        $this->store = $mongo->app->weather;

        $this->client = $weather;
    }

    private function store(): void
    {
        try {

            $this->store->drop([]);

            if ($this->store->insertMany($this->weather)->isAcknowledged()) {
                $this->store->createIndex(['city' => 'text']);

                $this->dcover->updateMany(
                    ['weather' => ['$exists' => true, '$ne' => false]],
                    ['$set' => ['changed' => true]]
                );
            }

        } catch (Throwable $e) {
        }
    }

    private function compute(array $set): self
    {
        $this->weather = [];

        /* $stub = [
            ['weather_id' => 524894, 'city' => 'Moskva'],
            ['weather_id' => 536203, 'city' => 'Sankt-Peterburg'],
            ['weather_id' => 569223, 'city' => 'Cherepovets']
        ]; */

        while ($cities = array_splice($set/* $stub */, 0, 20)) {
            if ($weather = $this->client->adapt($this->client->fetch($cities))) {
                array_push($this->weather, ...OpenWeatherClient::packKeys($weather));
            }
            if ($set) {
                sleep(20);
            }
        }

        return $this;
    }

    public function fetch(): void
    {
        $this->compute(Cities::$list)->store();

        $this->client->clear();
    }
}
