<?php /** @noinspection DuplicatedCode */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Rss/sls_demo.php
# php /var/www/netaggregator.ru/src/App/Service/Rss/sls_demo.php

declare(strict_types=1);

namespace App\Service\Rss;

chdir(dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require_once 'vendor/autoload.php';

$list = [
    'https://news.yandex.ru/index.rss',
    'https://news.yandex.ru/culture.rss',
    'https://news.yandex.ru/sport.rss',
    'https://news.yandex.ru/music.rss',
    'https://news.yandex.ru/internet.rss',
    'https://news.yandex.ru/auto.rss',
    'https://news.yandex.ru/world.rss',
    'https://news.yandex.ru/science.rss',
    'http://news.yandex.ru/travels.rss',
    'http://www.e-kontur.ru/blog/rss',
    'https://news.mail.ru/rss',
    'https://hi-news.ru/feed',
    'http://www.svoboda.org/rss/',
    'http://feeds.feedburner.com/loveplanet/QJwn',
    'https://money.onliner.by/feed',
    'https://aussiedlerbote.de/rss',
    'http://www.ecology.md/rss/',
    'http://www.popmech.ru/out/public-all.xml',
    'http://rusvesna.su/rss.xml',
    'http://www.1prime.ru/export/rss2/index.xml',
    'http://mfiles.ucoz.ru/load/rss/',
    'http://niasam.ru/rss_1',
    'http://rock-n.ru/publ/rss/',
    'https://www.currenttime.tv/api/zg$ip_e_tpp_',
    'http://feeds.feedburner.com/filmz/video',
    'http://www.ixbt.com/export/utf8/hardnews.rss',
    'https://www.adme.ru/rss/',
    'http://www.roscosmos.ru/rss/102/',
    'https://www.yaplakal.com/news.xml',
    'http://www.rubaltic.ru/rss/',
    'http://www.russkiymir.ru/russkiymir/ru/news/common/rss.html',
    'https://meduza.io/feed/news',
    'http://lenta.ru/rss/news',
    'http://lenta.ru/rss/top7',
    'http://lenta.ru/rss/last24',
    'http://lenta.ru/rss/articles',
    'http://lenta.ru/rss/news/russia',
    'http://lenta.ru/rss/articles/russia',
    'http://lenta.ru/rss/photo',
    'http://lenta.ru/rss/photo/russia'
];

/**
* gismeteo city codes
* @see https://gist.github.com/ikenfin/85f15f42a6790a86d56b193cadc296ae
*/
// $rss = Client::create('http://informer.gismeteo.ru/rss/27786.xml');
// $rss = Client::create('https://meteoinfo.ru/rss/moscow');

$lnk = $list[30];
$rss = SlsClient::create($lnk);

echo "\n\n========== FEED =========\n$lnk\n-------------------------\n\n";

foreach ($rss->getFeed() as $item) {
    echo $item['title'] . "\n";
    echo $item['description'] . "\n";
    echo $item['date'] . "\n";
    echo $item['link'] . "\n";
    echo "\n";
}
