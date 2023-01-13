<?php
/**
* @noinspection PhpUndefinedFieldInspection
* @noinspection PhpIncludeInspection
*/

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Dcover/imagehash.php
# php /var/www/netaggregator.ru/src/App/Service/Dcover/imagehash.php

declare(strict_types=1);

namespace App\Service\Dcover;

use Jenssegers\ImageHash\{ ImageHash, Implementations\DifferenceHash };
use MongoDB\{ Client };

use Throwable;
use Error;

chdir(dirname(__DIR__, 4));

require 'vendor/autoload.php';

$map = ['typeMap' => ['root' => 'array', 'document' => 'array']];
$covers = (new Client())->app->covers;

if ($old = $covers->find([], $map)->toArray()) {
    $hasher = new ImageHash(new DifferenceHash());

    $tmpl = 'nuxt/static/dcover/default/template';
    $root = dirname(__DIR__, 4);

    $id = is_string($argv[1] ?? false) ? $argv[1] : null;
    $exact = $id ? array_filter($old, static fn($t) => $id === $t['_id']->__toString()) : $old;

    foreach ($exact as $i => $_img) {
        $exact[$i]['imghash'] = $hasher->hash("$root/$tmpl/{$_img['_id']->__toString()}.png")->toHex();
    }

    $ids = array_column($exact, '_id');
    $list = array_merge($exact, array_filter($old, static function($t) use($ids) {
        return !in_array($t['_id'], $ids, false);
    }));

    $covers->deleteMany([]);

    try {

        if (count($list) < count($old)) {
            throw new Error('Missmatch');
        }

        $covers->insertMany($list);

    } catch (Throwable $e) {
        $covers->insertMany($old);
    }
}
