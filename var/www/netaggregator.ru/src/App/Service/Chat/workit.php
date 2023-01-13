<?php

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Chat/workit.php
# php /var/www/netaggregator.ru/src/App/Service/Chat/workit.php

/**
* @noinspection PhpUnusedLocalVariableInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpUndefinedFieldInspection
* @noinspection PhpIncludeInspection
*/

declare(strict_types=1);

namespace App\Service\Chat;

use Psr\Container\ContainerInterface;
use stdClass;

use MongoDB\Operation\BulkWrite;
use MongoDB\BulkWriteResult;
use MongoDB\BSON\ObjectId;
use MongoDB\Collection;
use MongoDB\Client;

// use App\VkApi\APIClientFactory;
// use App\VkApi\TransportFactory;

chdir(dirname(__DIR__, 4));

require 'vendor/autoload.php';

/**
* @var ContainerInterface $c
* @var Collection $tasks
*/
// $c = require 'config/container.php';

const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]];

// $utoken = '5b730a84c24de4966d2da0e2a3c42f3bb96fcfd80abffca4a6516c5653f8c13a1442f6405d91f86c0193b';
// $gtoken = 'cd6787488519a710d51cd4ce7bed91795b2b9007bd49e92632e1e86c11e506fade6050eb79cbe088bb065';

/* $text = <<<EOT
Ты меня еще помнишь?
Счастья, добра и всего самого наилучшего вам.
Берегите себя!
EOT; */

// $vk = APIClientFactory::create(TransportFactory::create());

// $mailer = new Mailer($vk);
// $mailer->setMessage(Message::create($text));
// $mailer->setIds([25520481]);
// $mailer->send();

function shedule(): ?BulkWriteResult
{
    $mongo = new Client();

    if ($docs = $mongo->app->mailing->find(['shedule.action' => 'defer', 'shedule.time' => ['$lte' => time() + 3]], MAP)->toArray())
    {
        foreach ($docs as $task) {
            /** @noinspection JsonEncodingApiUsageInspection */
            var_dump('start', json_encode($task['shedule']));
        }

        return $mongo->app->mailing->bulkWrite(
            array_map(static function(ObjectId $_id) {
                return [BulkWrite::UPDATE_ONE => [compact('_id'), ['$set' => ['shedule' => new stdClass]]]];
            }, array_column($docs, '_id'))
        );
    }

    return null;
}

$mongo = new Client();
$drop = $mongo->app->test->drop();
var_dump($drop);

$time = microtime(true);
/* if (count($result = $mongo->app->cache->find([], MAP)->toArray()) === 115) {
    $drop = $mongo->app->test->drop();
    $create = $mongo->app->createCollection('test', ['capped' => true, 'size' => 524288]);
    $counter = 0;

    var_dump(compact('create'));
    echo "\n";

    for ($i = 0; $i < 50; $i++) {
        foreach ($result as $n => $doc) {
            echo $n . ' ' . $mongo->app->test->insertOne($doc)->getInsertedId() . "\n";
            $counter++;
        }
    }

    echo "Data inserted...\n";
    echo 'count docs: ' . $mongo->app->test->countDocuments([]) . "\n";
    echo 'counter: ' . $counter . "\n";
} */

// $result = shedule();

/* if ($result instanceof BulkWriteResult) {
    var_dump($result->getModifiedCount(), $result->isAcknowledged());
} */

echo "\e[32mTIME\e[0m " . (microtime(true) - $time) . "\n";
