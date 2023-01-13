<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\Service\TrafficJams;

// use Psr\Http\Message\{ RequestInterface, ResponseInterface, UriInterface };
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\ClientInterface;

use SimpleXMLElement;
use Throwable;

/**
* Class Yatraffic
* @package App\Service\TrafficJams
*/
class Yatraffic implements YatrafficInterface
{
    public const LINK = 'https://export.yandex.ru/bar/reginfo.xml';

    /** @var ClientInterface */
    private ClientInterface $guzzle;

    /** @var CookieJar */
    private CookieJar $cookies;

    /** @var array */
    private array $userAgents;

    /** @var array|string[] */
    private array $titles = ['балл', 'балла', 'баллов'];

    public function __construct(ClientInterface $guzzle, array $userAgents)
    {
        $this->cookies = new CookieJar();
        $this->userAgents = $userAgents;
        $this->guzzle = $guzzle;
    }

    private function declination(int $n): string
    {
        $i = 2;

        switch (true) {
            case $n % 10 === 1 && $n % 100 !== 11:
                $i = 0;
                break;
            case $n % 10 >= 2 && $n % 10 <= 4 && ($n % 100 < 10 || $n % 100 >= 20):
                $i = 1;
                break;
        }

        return $this->titles[$i];
    }

    private function xmlToArray(SimpleXMLElement $xml): array
    {
        $parser = static function(SimpleXMLElement $xml, array $collection = []) use(&$parser) {
            $nodes = $xml->children();
            $attributes = $xml->attributes();

            if (0 !== count($attributes)) {
                foreach ($attributes as $attrName => $attrValue) {
                    $collection['attributes'][$attrName] = (string) $attrValue;
                }
            }

            if (0 === $nodes->count()) {
                $collection['value'] = (string) $xml;
                return $collection;
            }

            foreach ($nodes as $nodeName => $nodeValue) {
                if (count($nodeValue->xpath('../' . $nodeName)) < 2) {
                    $collection[$nodeName] = $parser($nodeValue);
                    continue;
                }

                $collection[$nodeName][] = $parser($nodeValue);
            }

            return $collection;
        };

        return [
            $xml->getName() => $parser($xml)
        ];
    }

    /**
     * @throws Throwable
     */
    private function request(int $id): string
    {
        $ret = $this->guzzle->request('GET', self::LINK, [
            'cookies' => $this->cookies,
            'query' => ['region' => $id],
            'headers' => [
                'User-Agent' => $this->userAgents[random_int(0, count($this->userAgents) - 1)],
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Encoding' => 'gzip, deflate, br',
                'Cache-Control' => 'no-cache',
                'Connection' => 'keep-alive'
            ]
        ]);

        return $ret->getBody()->getContents();
    }

    public function load(array $city): array
    {
        $ret = [];

        try {

            // echo "Try load city: {$city['city']}, code: {$city['code']}\n";

            if (!($raw = $this->request($city['code'])) ||
                !($xml = simplexml_load_string($raw, 'SimpleXMLElement', LIBXML_NOCDATA))) {
                return $ret;
            }

            if (($traffic = $this->xmlToArray($xml->xpath('//traffic')[0])['traffic']) && isset($traffic['region'])) {
                $region = $traffic['region'];
                $level = $region['level']['value'];

                $ret = [
                    'code' => $city['code'],
                    'city' => $traffic['title']['value'],
                    'level' => "$level {$this->declination((int) $level)}",
                    'icon' => $region['icon']['value'],
                    'time' => $region['time']['value'],
                    'hint' => $region['hint'][0]['value'],
                    'tend' => $region['tend']['value']
                ];

                // echo "Success level: {$region['level']['value']}\n";
            }

        } catch (Throwable $e) {
            // echo "\nERROR: " . $e->getMessage() . "\n";
        }

        sleep(1);

        return $ret;
    }

    public function get(array $cities): array
    {
        return array_values(array_filter(array_map([$this, 'load'], $cities)));
    }
}
