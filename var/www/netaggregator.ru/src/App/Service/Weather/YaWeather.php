<?php
/**
* @noinspection PhpUnusedLocalVariableInspection
* @noinspection DuplicatedCode
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Service\Weather;

use Throwable;

/**
 * Class YaWeather
 * @package App\Service\Weather
 */
class YaWeather
{
    public static array $wdir = [
        'n'  => '↓ с',
        'e'  => '← в',
        's'  => '↑ ю',
        'w'  => '→ з',
        'ne' => '↙ св',
        'se' => '↖ юв',
        'sw' => '↗ юз',
        'nw' => '↘ сз'
    ];

    // https://github.com/ASMfreaK/yandex_weather_api/blob/d58ad80f7389dc3b58c721bb42c2441e9ff3e351/yandex_weather_api/types.py#L96
    public static array $dir = [
        'n'  => 'северный',
        'e'  => 'восточный',
        's'  => 'южный',
        'w'  => 'западный',
        'ne' => 'северо-восточный',
        'se' => 'юго-восточный',
        'sw' => 'юго-западный',
        'nw' => 'северо-западный'
    ];

    // https://github.com/ASMfreaK/yandex_weather_api/blob/d58ad80f7389dc3b58c721bb42c2441e9ff3e351/yandex_weather_api/types.py#L72
    public static array $cond = [
        'clear' => 'Ясно',

        'cloudy' => 'Облачно',
        'cloudy-and-light-rain' => 'Облачно, небольшой дождь',
        'cloudy-and-light-snow' => 'Облачно, небольшой снег',
        'cloudy-and-rain' => 'Облачно, дождь',
        'cloudy-and-snow' => 'Облачно, снег',

        'partly-cloudy' => 'Переменная облачность',
        'partly-cloudy-and-light-rain' => 'Переменная облачность, небольшой дождь',
        'partly-cloudy-and-light-snow' => 'Переменная облачность, небольшой снег',
        'partly-cloudy-and-rain' => 'Переменная облачность, дождь',
        'partly-cloudy-and-snow' => 'Переменная облачность, снег',

        'overcast' => 'Пасмурно',
        'overcast-thunderstorms-with-rain' => 'Cильный дождь, гроза',
        'overcast-and-light-rain' => 'Пасмурно, небольшой дождь',
        'overcast-and-light-snow' => 'Пасмурно, небольшой снег',
        'overcast-and-wet-snow' => 'Дождь со снегом',
        'overcast-and-rain' => 'Пасмурно, дождь',
        'overcast-and-snow' => 'Пасмурно, снег',

        'light-rain' => 'Небольшой дождь',
        'light-snow' => 'Небольшой снег',
        'rain-and-snow' => 'Дождь со снегом'
    ];

    public static function parse($data): array
    {
        try {

            $raw = json_decode($data, false, 512, JSON_THROW_ON_ERROR);

            // $geo = $raw->geo_object;
            // $city = $geo->locality->name;

            $data_fact = (array) $raw->fact;
            $cur_temp = $data_fact['temp'];                                       // Текущая температура
            $icon_fact = $data_fact['icon'];                                      // Иконка текущего состояния погоды

            $wind_speed = $data_fact['wind_speed'];                               // Скорость ветра
            $wind_dir = $data_fact['wind_dir'];                                   // Направление ветра
            $humidity = $data_fact['humidity'];                                   // Влажность (%)
            $pressure = $data_fact['pressure_mm'];                                // Атмосферное давление (мм рт.ст.)
            $cond = $data_fact['condition'];                                      // Условия

            $data_forecasts0 = (array) $raw->forecasts[0];
            $sunrise = $data_forecasts0['sunrise'];                               // Рассвет
            $sunset = $data_forecasts0['sunset'];                                 // Закат

            // We find the temperature for every hour of the day
            $hour_array1 = [];
            for ($h = 0; $h < 24; $h++) {
                $hour_array1[$h] = (int) $raw->forecasts[0]->hours[$h]->temp;
            }

            $min_temp = min($hour_array1);                                        // Находим из них минимальную
            $max_temp = max($hour_array1);                                        // И максимальную температуру

            // We find the temperature for every hour for the next day
            // $hour_array2 = [];
            /* for ($h = 0; $h < 24; $h++) {
                $hour_array2[$h] = (int) $raw->forecasts[1]->hours[$h]->temp;
            } */

         // $min_temp_next = min($hour_array2);                                   // Находим из них минимальную
         // $max_temp_next = max($hour_array2);                                   // И максимальную температуру

            $data_forecasts2 = (array) $raw->forecasts[0]->parts->day;
            $avg_day = $data_forecasts2['temp_avg'];                              // Находим среднюю температуру днем
         // $icon_day = $data_forecasts2['icon'];                                 // Иконка осредненого состояния погоды днем

            $data_forecasts3 = (array) $raw->forecasts[0]->parts->night;
            $avg_night = $data_forecasts3['temp_avg'];                            // Находим среднюю температуру ночью
         // $icon_night = $data_forecasts3['icon'];                               // Иконка осредненого состояния погоды ночью

         // $data_forecasts4 = (array) $raw->forecasts[1]->parts->day;
         // $avg_day_next = $data_forecasts4['temp_avg'];                         // Находим среднюю температуру завтра днем
         // $icon_day_next = $data_forecasts4['icon'];                            // Иконка осредненого состояния погоды завтра днем

         // $data_forecasts5 = (array) $raw->forecasts[1]->parts->night;
         // $avg_night_next = $data_forecasts5['temp_avg'];                       // Находим среднюю температуру завтра ночью
         // $icon_night_next = $data_forecasts5['icon'];                          // Иконка осредненого состояния погоды завтра ночью

            // If the temperature value is positive, add "+" for clarity
            if ($cur_temp > 0) {
                $cur_temp = '+' . $cur_temp;
            }
            if ($min_temp > 0) {
                $min_temp = '+' . $min_temp;
            }
            if ($max_temp > 0) {
                $max_temp = '+' . $max_temp;
            }
            /* if ($min_temp_next > 0) {
                $min_temp_next = '+' . $min_temp_next;
            } */
            /* if ($max_temp_next > 0) {
                $max_temp_next = '+' . $max_temp_next;
            } */
            if ($avg_day > 0) {
                $avg_day = '+' . $avg_day;
            }
            if ($avg_night > 0) {
                $avg_night = '+' . $avg_night;
            }
            /* if ($avg_day_next > 0) {
                $avg_day_next = '+' . $avg_day_next;
            } */
            /* if ($avg_night_next > 0) {
                $avg_night_next = '+' . $avg_night_next;
            } */

            $humidity = 'Влажность: ' . $humidity . '%';
            $pressure = 'Давление: ' . $pressure . ' мм рт.ст.';
            $wind = 'Ветер: ' . $wind_speed . ' м/с, ' . self::$dir[$wind_dir];
            $cond = self::$cond[$cond];
            $temp = $cur_temp . ' °C';
            $icon = $icon_fact;

            return compact(
                'temp',
                'icon',
                'cond',
                'wind',
                'humidity',
                'pressure',
                'cur_temp',
                'min_temp',
                'max_temp',
                // 'min_temp_next',
                // 'max_temp_next',
                'wind_speed',
                'wind_dir',
                'sunrise',
                'sunset',
                'avg_day',
                'avg_night',
                // 'avg_day_next',
                // 'avg_night_next',
                'icon_fact'
                // 'icon_day',
                // 'icon_night'
            );

        } catch (Throwable $e) {
        }

        return [];
    }
}
