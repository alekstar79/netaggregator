<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

/**
 * Trait TServerUtility
 * @package Helpers
 */
trait TServerUtility
{
    /**
     * @param string[] $args
     * @return array
     */
	public function server(...$args): array
    {
        $srv = filter_input_array(5);

		if ($args) {
            return array_map(static function($arg) use($srv) {
                return $srv[strtoupper($arg)] ?? null;
            }, $args);
		}

		return $srv;
	}

	/**
	 * @param string $prop
	 * @return mixed
	 */
	public function cookie(string $prop = '')
    {
		$cookie = filter_input_array(2);

		if ($prop) {
		    return $cookie[$prop] ?? null;
        }

		return $cookie;
	}

	/**
	 * Tries to detect if the server is running behind an SSL
	 * @return bool
	 */
	public function isBehindSSL(): bool
    {
		return (bool) array_intersect(
            $this->server('https','request_scheme','server_port'),
            ['https','on','1','ssl','443']
        );
	}

	/**
	 * @return string
	 */
	public function httpScheme(): string
    {
		return $this->isBehindSSL() ? 'https' : 'http';
	}

	/**
	 * Test correlation http with port
	 * @param string $port
	 * @param string $scheme
	 * @return string
	 */
	public function port(string $port = '', string $scheme = ''): string
    {
		$port = $port ?: $this->server('SERVER_PORT')[0];
		$scheme = $scheme ?: $this->httpScheme();

		$map = ['https' => '443','http' => '80'];

		return !isset($map[$scheme]) || $map[$scheme] !== $port ? ':' . $port : '';
	}

	/**
	 * @param bool $port
	 * @return string
	 */
	public function hostName(bool $port = null): string
    {
		if (!$host = $this->server('http_host')) {
			$host = $this->server('server_name');
		}

		$host = strtolower(preg_replace('/:\d+$/', '', trim($host[0])));

		return $host . ($port ? $this->port() : '');
	}

	/**
	 * Returns a URI consisting of the HTTP scheme and hostname
	 * @param bool $port
	 * @return string
	 */
	public function baseUri(bool $port = true): string
    {
		return $this->httpScheme() . '://' . $this->hostName($port);
	}

	/**
	 * Returns full URI
	 * @return string
	 */
	public function currentUri(): string
    {
		return $this->baseUri() . $this->server('request_uri')[0];
	}
}
