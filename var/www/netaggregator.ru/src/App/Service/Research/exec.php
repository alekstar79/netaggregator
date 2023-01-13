<?php # php /var/www/netaggregator.ru/src/App/Service/Research/exec.php

declare(strict_types=1);

namespace App\Service\Research;

chdir(dirname(__DIR__, 4));

function pid(int $port = 4433): ?int
{
    $out = [];

    exec("fuser $port/tcp 2> /dev/null", $out);

    if (isset($out[0])) {
        return (int) trim($out[0]);
    }

    return null;
}

if (($pid = pid()) !== null) {
    echo $pid . "\n";
}
