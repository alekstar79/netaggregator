<?php declare(strict_types=1);

namespace App\Factories;

use Monolog\Logger;

/**
* Class LoggerFactory
* @package App\Factories
*/
class LoggerFactory
{
    public function __invoke(): Logger
    {
        return new Logger('app.log');
    }
}
