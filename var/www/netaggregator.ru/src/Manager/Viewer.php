<?php

declare(strict_types=1);

namespace Manager;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

/**
 * Class Viewer
 * @package app\manager
 */
class Viewer implements RequestHandlerInterface
{
    use ExtendsTrait;

    private const ROOT = '/var/www/netaggregator.ru/';

    private function isFile(array $query, string $r = ''): ?string
    {
        $file = null;

        if (isset($query['f'])) {
            $f = "$r{$query['f']}";

            if (!is_file($f)) {
                $file = $this->isFile($query, self::ROOT);
            } else {
                $file = $f;
            }
        }

        return $file;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $query = $request->getQueryParams();

        if (!($file = $this->isFile($query)) || !$this->read($file)) {
            $this->send([sprintf('Location: %s', $this->location())]);
        }

        exit();
    }
}
