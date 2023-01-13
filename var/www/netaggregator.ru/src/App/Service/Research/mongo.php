<?php # php /var/www/netaggregator.ru/src/App/Service/Research/mongo.php

/**
* @noinspection PhpMultipleClassDeclarationsInspection
* @noinspection PhpUnusedLocalVariableInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection UnknownInspectionInspection
* @noinspection PhpIncludeInspection
*/

declare(strict_types=1);

namespace App\Service\Research;

use Psr\Container\ContainerInterface;

use MongoDB\{ BSON\ObjectId, Client, Collection /*, Operation\BulkWrite */ };
// use Predis\ClientInterface;
// use Traversable;

use JsonException;
use Throwable;

// use App\Model\DcoverRepositoryInterface;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/** @var ContainerInterface $c */
$c = require 'config/container.php';

//** @var ClientInterface $predis */
// $predis = $c->get(ClientInterface::class);

//** @var DcoverRepositoryInterface $dcover */
// $dcover = $c->get(\App\Model\DcoverRepositoryInterface::class);

/**
* @var Client $client
* @see https://docs.mongodb.com/php-library/current/tutorial/crud/#query-documents
*/
$mongo = $c->get(Client::class);

// var_dump($mongo->listDatabases());

const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
    HKEYS = ['topCommentor', 'lastSubscriber', 'topLiker', 'weather'],
    GROUP = [125629607, 141729661, 169905893, 169906699];

/**
* @throws JsonException
*/
function read(string $path): array
{
    return is_file($path) ? json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR) : [];
}

function merge($src, $mod, $_id): array
{
    return array_merge($src, $mod, compact('_id'));
}

function reassign($dialogs): array
{
    return array_map(static function($d) {
        $d['id'] = (new ObjectID())->__toString();
        $d['children'] = reassign($d['children']);
        return $d;

    }, $dialogs);
}

function rename($dialogs): array
{
    return array_map(static function($d) {
        if (isset($d['dialogs'])) {
            $d['children'] = rename($d['dialogs']);
            unset($d['dialogs']);
        }

        return $d;

    }, $dialogs);
}

function insertOne(Collection $collection, array $data)
{
    try {

        $result = $collection->insertOne($data);
        echo "ID {$result->getInsertedId()}\n";

    } catch (Throwable $e) {
        echo "E {$e->getMessage()}\n";
    }
}

$gid = 125629607;
$uid = 25520481;

//** @var Collection $currency */
/* $currency = $mongo->app->currency;

$data = $predis->hgetall('currency');
$data = array_map(static function($item) {
    return json_decode($item, true);
}, $data);

$currency->deleteMany([]); */

// insertOne($currency, $data);
// var_dump($currency->findOne([], MAP + ['projection' => ['_id' => 0]]) ?: []);

// ------------------------------------------------------

//** @var Collection $appkeys */
// $appkeys = $mongo->app->appkeys;

// $result = $appkeys->updateOne([], ['$set' => ['service_token' => 753968]]);
// $result = $appkeys->updateOne([], ['$set' => ['stream_key' => null]]);
// var_dump($result->getModifiedCount());

// $keys = $predis->hgetall('extra');
// $appkeys->deleteMany([]);

/* try {
    $appkeys->updateOne([], ['$set' => $keys], ['upsert' => true]);
} catch (Throwable $e) {
} */

// var_dump($appkeys->findOne([], MAP + ['projection' => ['_id' => 0]]));

//** @var Collection $dcover */
// $dcover = $mongo->app->dcover;

/* foreach (GROUP as $_id) {
    $cover = $predis->hgetall('dcover:' . $_id);
    $json = array_intersect_key($cover, array_flip(HKEYS));
    $hmap = array_map('json_decode', $json);
    $cover = merge($cover, $hmap, $_id);
    insertOne($dcover, $cover);
} */

// ------------------------------------------------------

//** @var Collection $cache */
// $cache = $mongo->app->cache;

/* $users = $predis->hgetall(sprintf('userscache:%d', $gid));
$users = array_values(array_map('json_decode', $users));

$cache = [];
$cache['_id'] = $gid;
$cache['users'] = $users;

insertOne($usercache, $cache); */

// $user = $cache->findOne(['id' => 25520481], MAP);
// var_dump($user);

// $dcover->updateMany(['changed' => true], ['$set' => ['changed' => false]]);

/* $alex = [
    'id' => 25520481,
    'first_name' => 'Алексей',
    'last_name' => 'Тарасенко',
    'photo_200' => 'https://sun9-23.userapi.com/c856120/v856120252/75742/JL3cTrlaXzI.jpg?ava=1'
];

$sheller = [
    'id' => 465174119,
    'first_name' => 'Оксана',
    'last_name' => 'Шеллер',
    'photo_200' => 'https://sun9-49.userapi.com/c855136/v855136651/192a61/euPYnQ-Spd8.jpg?ava=1'
];

$user = [
    'id' => 337596076,
    'first_name' => 'Fenasi',
    'last_name' => 'Kerim',
    'photo_200' => 'https://vk.com/images/camera_200.png?ava=1'
]; */

// $lastSubscriber = $user;
// $ret = $dcover->updateOne($id, ['$set' => compact('lastSubscriber')]);
// $set = (bool) $ret->getMatchedCount();

// $cover = $dcover->findOne($id, MAP); // ['lastSubscriber'];
// var_dump($cover);


// $uid = 466483621;

/* $default = require __DIR__ . "/../Chat/group/{$gid}/default.php";
$help = require __DIR__ . "/../Chat/group/{$gid}/help.php";

$dialogs = [
    ['id' => 1, 'exact' => true, 'reply' => ['Привет, {name}!','Здравствуй'], 'keywords' => ['привет']],
    ['id' => 2, 'exact' => true, 'reply' => [], 'keywords' => ['картинка','фото']],
    ['id' => 3, 'exact' => true, 'reply' => ['Рад за тебя!'], 'keywords' => ['здорово','круто','лучше всех','нормально','прекрасно']],
    ['id' => 4, 'exact' => true, 'reply' => ['Отлично, а у тебя?'], 'keywords' => ['как дела']]
]; */

// -------------------------------------------------

//** @var Collection $chat */
// $chat = $mongo->app->chat;

/* $docs = $chat->find(['uid' => 466483621], MAP + ['projection' => ['_id' => 0]])->toArray();
$docs = array_map(static function($item) {
    $item['_id'] = (new ObjectID())->__toString();
    $item['dialogs'] = reassign($item['dialogs']);
    $item['uid'] = 25520481;
    return $item;

}, $docs); */

// var_dump($docs);

/* try {
    $result = $chat->insertMany($docs);
    var_dump($result->getInsertedIds());
} catch (Throwable $e) {
    echo "E {$e->getMessage()}\n";
} */

// ---------------------------------------------------

/* $dialogs = array_map(static function($item) {
    $item['dialogs'] = rename($item['dialogs']);
    return $item;

}, $dialogs); */

/* $chat->bulkWrite(
    array_map(static function($d) {
        return ['updateOne' => [['_id' => $d['_id']], ['$set' => $d]]];
    }, $dialogs)
); */

// file_put_contents(__DIR__ . '/dialogs.json', json_encode($docs, 64|128|256));

// $dialogs = $chat->findOne(['connections' => 25267591], MAP);
// var_dump($dialogs);

/* $dialogs = array_map(static function($item) use($uid) {
    unset($item['_id']);
    $item['uid'] = $uid;

    return reassign($item);

}, $dialogs); */

/* foreach ($dialogs as $dialog) {
    insertOne($chat, $dialog);
} */

//** @var Traversable $cursor */
// $cursor = $chat->find(compact('uid'), MAP);

// var_dump(iterator_to_array($cursor));

/* foreach ($cursor as $dialog) {
    var_dump($dialog);
} */

// -----------------------------------------------

/* $all = array_map(static function($c) use($uid) {
    $c['owner'] = $uid;
    return $c;
}, $dcover->all()); */

//** @var Collection $scover */
// $scover = $mongo->app->scover;

// $all = $scover->find([], MAP)->toArray();

/* try {
    $result = $scover->insertMany($all);
    var_dump($result->getInsertedIds());
} catch (Throwable $e) {
    echo "E {$e->getMessage()}\n";
} */

// var_dump($all);

// -----------------------------------------------

//** @var Collection $filter */
// $filter = $mongo->app->filter;

/* $ret = $filter->updateOne(
    ['_id' => 169906699],
    ['$push' => ['exclude' => ['$each' => [466483621]]]],
    ['upsert' => true]
);

$id = $ret->getUpsertedId(); */

/* $array = $filter->findOne(['_id' => 169906699], [
    'typeMap' => ['root' => 'array', 'document' => 'array'],
    'projection' => ['_id' => 0]
]);

var_dump($array); */

/* $ret = $filter->updateOne(
    ['_id' => 169906699, 'exclude' => 466483621],
    ['$unset' => [ 'exclude.$' => 1 ]]
);

$md = $ret->getModifiedCount(); */

/* $ret = $filter->bulkWrite([
    [
        BulkWrite::UPDATE_ONE => [
            ['_id' => 169906699, 'exclude' => 466483621],
            ['$unset' => [ 'exclude.$' => 1 ]]
        ]
    ],
    [
        BulkWrite::UPDATE_ONE => [
            ['_id' => 169906699],
            ['$pull' => ['exclude' => null]]
        ]
    ]
]);

$md = $ret->getModifiedCount();

var_dump($md); */

// ----------------------------------------------

// /** @var Collection $gtokens */
// $gtokens = $mongo->app->gtokens;

// $all = $gtokens->find([], MAP)->toArray();

// ----------------------------------------------

/** @var Collection $news */
$news = $mongo->app->news;

$data = $news->find([], MAP + ['projection' => ['_id' => 0]])->toArray();
$docs = array_merge([
    [
        'thumb' => 'update-13.jpg',
        'name' => 'Как чат-боты помогают бизнесу в соцсети ВКонтакте?',
        'date' => '19.04.2022',
        'definition' => '',
        'disclosure' => '',
        'images' => []
    ]

], $data);

try {

    $news->deleteMany([]);

} catch (Throwable $e) {
    exit('Error delete');
}

try {

    $result = $news->insertMany($docs);
    var_dump($result->getInsertedIds());

} catch (Throwable $e) {
    echo "E {$e->getMessage()}\n";
    $news->insertMany($data);
}
