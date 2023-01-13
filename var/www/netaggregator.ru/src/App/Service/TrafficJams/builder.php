<?php # php /var/www/netaggregator.ru/src/App/Service/TrafficJams/builder.php

declare(strict_types=1);

namespace App\Service\TrafficJams;

chdir(dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require_once 'vendor/autoload.php';

/**
* Yandex Codes
* @see https://pixelplus.ru/samostoyatelno/stati/prodvizhenie-saytov/geozavisimost-zaprosov.html
* @see https://promoexpert.pro/wp-content/uploads/2018/05/yandex.ru-yaca-geo.c2n.pdf
* @see https://promoexpert.pro/blog/yandex-ru-yaca-geo-c2n
*/

$exclude = '/автономн(ый|ая)|федеральный|округ|область|республика|ао|америка|япония|юг|эстония|штутгарт|швеция|швейцария|чимкент|чехия|черногория|черновцы|чернигов|центр|хмельницкий|херсон|урал|узбекистан|тирасполь|тернополь|талдыкорган|таджикистан|осетия|хорватия|харьков|хайфа|франция|франкфурт|майне|финляндия|украина|турция|туркмения|тель-авив|татарстан|таиланд|сша|страны балтии|край|снг|словения|словакия|сиэтл|сибирь|сербия|семей|северо-запад|кавказ|сан-франциско|россия|польша|полтава|поволжье|арабские|эмираты|общероссийские|нью-йорк|норвегия|зеландия|нидерланды|мюнхен|молдова|минск|мексика|мальта|львов|луцк|луганск|лос-анджелес|литва|латвия|крым|краматорск|корея|комрат|кокшетау|кишинев|китай|киргизия|кипр|киев|кельн|караганда|канада|кайеркан|казахстан|италия|испания|индия|израиль|иерусалим|ивано-франковск|запорожье|жодино|житомир|египет|европа|донецк|детройт|дания|грузия|гродно|греция|гомель|германия|гейдельберг|гамбург|витебск|винница|венгрия|великобритания|вашингтон|бразилия|бостон|болгария|ближний восток|берлин|бендеры|бельцы|бельгия|беларусь|беер-шева|африка|атланта|астана|армения|арктика|антарктика|аргентина|алматы|азия|азербайджан|австрия|австралия|океания|абхазия/ui';
$codes = file_get_contents(__DIR__ . '/yandex-codes.txt');

$combine = static function(string $line): array
{
    $data = array_combine(['code','city'], preg_split('/\s*—\s*/u', $line));

    $data['code'] = (int) $data['code'];

    return $data;
};

$lines = array_values(array_filter(
    array_map($combine, array_filter(explode("\n", $codes))),
    static fn(array $set): bool => !preg_match($exclude, $set['city'])
));

/** @noinspection PhpUnreachableStatementInspection */
if ($b = file_put_contents(__DIR__ . '/yandex-codes.php', "<?php declare(strict_types=1);\n\nreturn " . var_export($lines, true) . ";\n")) {
    echo "Saved successfully, $b bytes\n";
}
