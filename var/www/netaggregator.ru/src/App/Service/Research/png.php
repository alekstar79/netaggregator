<?php # php /var/www/netaggregator.ru/src/App/Service/Research/png.php

declare(strict_types=1);

namespace App\Service\Research;

chdir(dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require_once 'vendor/autoload.php';

$script = '/var/www/netaggregator.ru/thumb.sh';
$hash = 'reduced';

// exec("pngcrush -s -reduce -brute $dir/demo.png $dir/output.png;");
exec("$script $hash > /dev/null 2>&1 &");

