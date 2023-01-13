<?php

declare(strict_types=1);

namespace App\Service\Weather;

$timestamp = time();
$token = md5('eternalsun' . $timestamp);
$deviceid = '315f0e802b0b49eb8404ea8056abeaaf';
$uuid = '8211637137c4408898aceb1097921872';

return <<<EOT
User-Agent: yandex-weather-android/4.2.1
X-Yandex-Weather-Client: YandexWeatherAndroid/4.2.1
X-Yandex-Weather-Device: os=null;os_version=21;manufacturer=chromium;model=App Runtime for Chrome Dev;device_id=$deviceid;uuid=$uuid;
X-Yandex-Weather-Token: $token
X-Yandex-Weather-Timestamp: $timestamp
X-Yandex-Weather-UUID: $uuid
X-Yandex-Weather-Device-ID: $deviceid
Accept-Encoding: gzip, deflate
Host: api.weather.yandex.ru
Connection: Keep-Alive \n
EOT;
