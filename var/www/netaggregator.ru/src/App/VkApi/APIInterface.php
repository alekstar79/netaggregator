<?php declare(strict_types=1);

namespace App\VkApi;

/**
* Interface APIInterface
* @package App\VkApi
*/
interface APIInterface extends TransportInterface
{
    public function modify($data): ?string;

    /**
     * Executes an API request
     * @param string $point
     * @param array $params
     * @param string $method
     * @return mixed
     * @throws RejectInterface
     */
    public function api(string $point, array $params = [], string $method = 'GET');
}
