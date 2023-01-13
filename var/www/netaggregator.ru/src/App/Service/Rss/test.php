<?php

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Rss/test.php
# php /var/www/netaggregator.ru/src/App/Service/Rss/test.php

declare(strict_types=1);

namespace App\Service\Rss;

use Throwable;

chdir(dirname(__DIR__, 4));

try {

    exec(sprintf(
        'nohup php %s %s > /dev/null 2>&1 &',
        '/var/www/netaggregator.ru/src/App/Service/Rss/update.php',
        base64_encode(json_encode([141729661], JSON_THROW_ON_ERROR))
    ));

} catch (Throwable $e) {
    echo $e->getMessage(), "\n";
}
