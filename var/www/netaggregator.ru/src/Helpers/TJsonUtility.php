<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace Helpers;

use JsonException;
use Throwable;

/**
 * Trait TJsonUtility
 * @package Helpers
 */
trait TJsonUtility
{
	public function isJson($data): bool
    {
        try {

            if (is_string($data) && $data !== '') {
                $entity = json_decode($data, true, 512, JSON_THROW_ON_ERROR);
                return json_last_error() === 0 && is_array($entity);
            }

        } catch (Throwable $e) {
        }

        return false;
	}

    /**
     * @throws JsonException
     */
    public function jsonDecode(string $json, bool $assoc = false, int $depth = 512, int $options = 0)
    {
		$data = json_decode($json, $assoc, $depth, JSON_THROW_ON_ERROR | $options);

		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new JsonException('JSON decode error: ' . json_last_error_msg());
		}

		return $data;
	}

    /**
     * @throws JsonException
     */
    public function jsonEncode($content, int $options = 0, int $depth = 512): string
    {
		$json = json_encode($content, JSON_THROW_ON_ERROR | $options, $depth);

		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new JsonException('JSON encode error: ' . json_last_error_msg());
		}

		return $json;
	}

    public function jsonStore(string $path, $data): bool
    {
        try {

            return (bool) file_put_contents($path, $this->jsonEncode($data, 64|128|256));

        } catch (JsonException $ex) {
        }

        return false;
    }

    public function jsonRead(string $path, $default = [])
    {
        try {

            return is_file($path) ? $this->jsonDecode(file_get_contents($path), true) : $default;

        } catch (JsonException $e) {
        }

        return $default;
    }
}
