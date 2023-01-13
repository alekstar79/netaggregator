<?php /** @noinspection PhpComposerExtensionStubsInspection */

declare(strict_types=1);

namespace App\Service\Research;

// use App\Service\Audio\SupportedClients;

use Throwable;

/**
* Class Requests
* @package App\Service\Research
*/
class Requests
{
    /** @var array */
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * @param string $url Request URL
     * @param array $postfields Request params
     * @param string $agent User-Agent header
     * @return array
     */
    public function request(string $url, array $postfields, string $agent = 'NetXBot/160279'): array
    {
        try {

            $ch = curl_init($url);

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, $agent);

            if ($postfields) {
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postfields));
            }

            $json = curl_exec($ch);
            curl_close($ch);

            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);

        } catch (Throwable $e) {
        }

        return [];
    }

    /**
     * Call VK API methods
     * @param string $method Method name
     * @param array $params Request params
     * @return array
     */
    public function call(string $method, array $params = []): array
    {
        if (!isset($params['access_token'])) {
            $params['access_token'] = $this->config['token'];
        }
        if (!isset($params['v'])) {
            $params['v'] = $this->config['v'];
        }

        $agent = ''; // SupportedClients::Kate()->getUserAgent();

        return $this->request(
            "https://api.vk.com/method/$method",
            $params,
            $agent
        );
    }

    public static function create(array $config = []): Requests
    {
        return new self($config);
    }
}
