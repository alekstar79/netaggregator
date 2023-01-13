<?php declare(strict_types=1);

namespace App\Service\Weather;

use RuntimeException;
use Throwable;

/**
* Class OpenWeatherClient
* @package App\Service\Weather
*/
class OpenWeatherClient implements OpenWeatherInterface
{
    use ExtendsTrait;

    /** @var string */
    private string $app;

    /** @var string */
    private string $lang;

    /** @var array */
    private array $list;

    /** @var array */
    private array $cities;

    public function __construct(string $appid, string $lang = 'RU')
    {
        $this->app = $appid;

        $this->lang = $lang;
    }

    /* private function transform(array $names): array
    {
        return array_map(function($item) {
            return $this->cyrillic($item) ? $this->translit($item) : $item;
        }, $names);
    } */

    /* private function load(): void
    {
        $this->list = [];

        try {

            if ($raw = file_get_contents(self::JSON)) {
                $list = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

                if (json_last_error() === 0) {
                    $this->list = $list;
                }
            }

        } catch (Throwable $e) {
        }
    } */

    private function wind(): array
    {
        return [
            self::N => [0, 360],
            self::E => [90 ],
            self::S => [180],
            self::W => [270],
            self::NE => range(1,    89),
            self::SE => range(91,  179),
            self::SW => range(181, 269),
            self::NW => range(271, 359)
        ];
    }

    private function extract(array $batch): array
    {
        return array_intersect_key($batch, array_flip(self::FIELDS));
    }

    private function builder(array $list): callable
    {
        return function(string $prop) use($list) {
            return array_map(function($item) {
                $item = $this->extract($item[0] ?? $item);

                if (isset($item['temp'])) {
                    $item['temp'] = round($item['temp']) .' °C';
                }
                if (isset($item['pressure'])) {
                    $item['pressure'] = round(self::HPA * $item['pressure']) .' mmHg';
                }
                if (isset($item['humidity'])) {
                    $item['humidity'] .= ' %';
                }
                if (isset($item['speed'])) {
                    $item['speed'] .= ' m/s';
                }
                if (isset($item['deg'])) {
                    $deg = (int) round($item['deg']);

                    foreach ($this->wind() as $direction => $range) {
                        if (in_array($deg, $range, true)) {
                            $item['deg'] = $direction;
                            break;
                        }
                    }
                }
                if (isset($item['id'])) {
                    $item['code'] = $item['id'];
                }

                return $item;
            }, array_column($list, $prop, 'name'));
        };
    }

    private function buildUrl(): string
    {
        if (!$this->app) {
            throw new RuntimeException('APPID is required');
        }

        return self::API . sprintf(
            '?id=%s&units=metric&lang=%s&APPID=%s',
            implode(',', $this->cities),
            $this->lang,
            $this->app
        );
    }

    private function setCities(array $cities): void
    {
        $this->cities = array_map(static fn($c) => $c['weather_id'] ?? $c['id'], $cities);
    }

    public static function packKeys(array $data, string $field = 'city'): array
    {
        return array_map(
            static fn(array $v, string $k): array => array_merge($v, [$field => $k]),
            array_values($data),
            array_keys($data)
        );
    }

    public static function icon(string $ico): string
    {
        return sprintf(self::ICO, $ico);
    }

    // for Receiver1.php
    /* public function cities($names, string $country = null): self
    {
        $this->cities = [];
        $this->load();

        $names = $this->transform((array) $names);

        foreach ($this->list as $id => $city) {
            if (in_array($city, $names, false)) {
                $this->cities[] = $id;
            }
        }

        return $this;
    } */

    public function fetch(array $cities = []): array
    {
        if ($cities) {
            $this->setCities($cities);
        }

        $url = $this->buildUrl();
        $ret = [];

        try {

            if ($raw = file_get_contents($url)) {
                $ret = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

                foreach ($ret['list'] as $i => &$w) {
                    $w['name'] = $cities[$i]['city'] ?? $cities[$i]['name'];
                }

                unset($w);
            }

        } catch (Throwable $e) {
        }

        return $ret;
    }

    public function adapt(array $json): array
    {
        return array_merge_recursive(...array_map($this->builder($json['list'] ?? []), ['main','wind','weather']));
    }

    public function clear(): void
    {
        $this->list = [];
    }
}
