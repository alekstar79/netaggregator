<?php /** @noinspection DuplicatedCode */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Rss/pie_demo.php
# php /var/www/netaggregator.ru/src/App/Service/Rss/pie_demo.php

declare(strict_types=1);

namespace App\Service\Rss;

use SimplePie;

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
    // 'http://www.rubaltic.ru/rss/',                                   This does not appear to be a valid RSS or Atom feed
    // 'http://www.russkiymir.ru/russkiymir/ru/news/common/rss.html',   This does not appear to be a valid RSS or Atom feed
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
* @see https://github.com/simplepie/simplepie
*/
$feed = new SimplePie();
$feed->set_feed_url($list[0]);
$feed->set_input_encoding('utf-8');
$feed->enable_cache(false);

// $feed->enable_order_by_date(false);
// $feed->force_feed(true);

if (!$feed->init() || $feed->error()) {
    return;
}

echo "\n\n========== FEED =========\n";
echo $feed->get_title() . "\n";
echo $feed->get_description() . "\n";
echo $feed->get_link() . "\n";
echo "-------------------------\n\n";

foreach ($feed->get_items(0, 5) as $item) {
    echo $item->get_title() . "\n";
    echo $item->get_content() . "\n";
    echo $item->get_date('j M Y, g:i') . "\n";

    if ($item->get_permalink()) {
        echo $item->get_permalink() . "\n";
    }
    if ($enclosure = $item->get_enclosure()) {
        if ($enclosure->get_link() && $enclosure->get_type()) {
            echo $enclosure->get_type() . "\n";

            if ($size = $enclosure->get_size()) {
                echo $size . " MB\n";
            }
        }
        if ($thumb = $enclosure->get_thumbnail()) {
            echo $thumb . "\n";
        }
    }

    echo "\n\n";
}
