<?php
/**
* @noinspection PhpStatementHasEmptyBodyInspection
* @noinspection PhpRedundantCatchClauseInspection
* @noinspection PhpUnusedLocalVariableInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpUnusedAliasInspection
* @noinspection PhpIncludeInspection
*/

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/VkCopier/index.php
# php /var/www/netaggregator.ru/src/App/Service/VkCopier/index.php

declare(strict_types=1);

namespace App\Service\VkCopier;

use App\VkApi\TransportFactory;
use App\VkApi\APIClientFactory;
use App\VkApi\RejectInterface;
use App\Model\JsonRepo;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

$std = [
    'develop' => 'f4ece4c38b68cc9be90f845b003809e032568c10929127d4e9f916c10415870d51ee04bdcbee110c0d75e',
    'artemev' => '185b9d120ac8ac8ee2503f73b4edb4e9cd8f2c782badfbb27750e365c59ef629b4fc2a9532783f6bdc2fe',
    // 'sheller' => '090b3ff5551466f76a64555fb9f258417a3326fabd0ae4b619564e3795d589b9795c629f89df1a34334bf',

    'afan4sjewao' => '93e3951c6f57b92f09b8954f7245e9496b4c2ea13b7ad0acd5891fa9739053cd4d44f00aaafcb4e0da19f',
    'pogorelowa' => 'b03e0041509251b825d207d982572413bbe98a564dc9390ffbc53d8252901b29158c729ed5a116579b472',
    'natalijafisher' => '35d9dbdfb405e7e8579061fb5f7f34ac1983ab9b29da54dc9cc56fa1fea5bf69cece5aa6b6ca922d01126',
    'kuzn3tz0va' => '39a95f68941ee082583718bb8ad328c3f4f1e3b80a1284f0793d9dc9ad19a9a793cfaf3c96651aee924b0',
    'pimen0va' => '622d1e9f585552a87c2ce46d52bdaafd4756a062f198a11764c74d66032bb90f606b80fab0792a348efcf',
    'ilyin' => '2f7fa94ebea94c48c2c026433117973740511bab5984c271ac60f8675ce6d1f7e1028551a28ac90eb2fec',
    'sh3rbinaviktor' => '09d41b03f70ea3c58fb773d6899dd2b185c960750e079d0933f737f6ff248bc8a1e3caaf4676317e13281',
    'sher8ina' => '869d7bd7793e9088069348aa20cac69c81dbb92d13f330303acb15d58beaa489d3c7f9b6f80357fa2814a'
];

define('JPS', -125629607);
define('POS', -169906699);
define('P2S', -169905893);

/* $api = APIClientFactory::create();

// mask & 2
foreach ($std as $user => $token) {
    try {
        $mask = $api->account->getAppPermissions($token);
        echo 'User ' . $user . ' Mask: ' . $mask . ' Photos ' . ($mask & 2) . "\n";
    } catch (RejectInterface $e) {
        echo 'Error ' . $e->getMessage();
    }
} */

$transport = TransportFactory::create();
// $repo = new JsonRepo('app/temp/clone');
// $ret = null;

// $photos = new Photos($transport, $repo);
// $videos = new Videos($transport, $repo, $std);

// $photos->generatePhotos(JPS, 'wall');

try {
    // $ret = $photos->run(JPS, POS);
    // $ret = $photos->wallCopyToUserOnce(JPS, 438806195);
    // $ret = $photos->links(JPS, 'wall');
} catch (RejectInterface $e) {
}

// $ret = $videos->run(JPS, POS);
// $videos->unlinks(JPS);

$l = new UploadPhotos(273716815, POS, $transport, $std);
// $l->run(__DIR__ . '/content.coedcherry.com/emily-18');

// var_dump($l->getAlbums());
