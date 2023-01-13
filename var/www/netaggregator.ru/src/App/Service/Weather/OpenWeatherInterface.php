<?php declare(strict_types=1);

namespace App\Service\Weather;

/**
* Interface OpenWeatherInterface
* @package App\Service\Weather
* @link http://bulk.openweathermap.org/sample/
*/
interface OpenWeatherInterface
{
    public const

        API   = 'https://api.openweathermap.org/data/2.5/group',
        ICO   = 'https://openweathermap.org/img/wn/%s@2x.png',
        JSON  = __DIR__ . '/json/list-ru.json',
        HPA   = 0.75006375541921,

        N  = 'N',  // north
        E  = 'E',  // east
        S  = 'S',  // south
        W  = 'W',  // west
        NE = 'NE', // north east
        SE = 'SE', // south east
        SW = 'SW', // south west
        NW = 'NW', // north west

        FIELDS = [
            'temp',
            'pressure',
            'humidity',
            'speed',
            'deg',
            'icon',
            'id'
        ];

    // public function cities($names, string $country = null): OpenWeatherClient;

    public static function icon(string $ico): string;

    public function fetch(array $cities = []): array;

    public function adapt(array $json): array;
}
