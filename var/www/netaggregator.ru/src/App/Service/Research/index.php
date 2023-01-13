<?php # php /var/www/netaggregator.ru/src/App/Service/Research/index.php
/**
* @noinspection PhpUnusedLocalVariableInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpIncludeInspection
*/

declare(strict_types=1);

namespace App\Service\Research;

use Psr\Container\ContainerInterface;

use Helpers\{ TDifferentUtility, TJsonUtility };
use Manager\ManagerInterface;

use Throwable;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

class Json
{
    use TJsonUtility, TDifferentUtility;
}

/** @var ContainerInterface $c */
$c = require 'config/container.php';

$index = new Json();

$start = microtime(true);

/** @var ManagerInterface $manager */
$manager = $c->get(ManagerInterface::class);
$ret = $manager->tree(['uid' => 466483621]);

try {

    $json = $index->jsonEncode($ret);
    $byte = strlen($json);
    $kB = $index->format($byte);

    var_dump(compact('json','byte','kB'));

} catch (Throwable $e) {
}

echo " \e[32mTIME\e[0m " . (microtime(true) - $start) . "\n";
