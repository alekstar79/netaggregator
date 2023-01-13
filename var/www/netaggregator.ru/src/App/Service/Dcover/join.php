<?php /** @noinspection PhpIncludeInspection */

declare(strict_types=1);

namespace App\Service\Dcover;

chdir(dirname(__DIR__, 4));

require 'vendor/autoload.php';

/** @var array $argv */
array_shift($argv);

if ($data = base64_decode(implode($argv))) {
    /** @noinspection JsonEncodingApiUsageInspection */
    Join::create(json_decode($data, true))->perform();
}
