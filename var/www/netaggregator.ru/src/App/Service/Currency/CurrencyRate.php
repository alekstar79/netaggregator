<?php declare(strict_types=1);

namespace App\Service\Currency;

use MongoDB\{ Client, Collection, Operation\BulkWrite };

use Throwable;

/**
* Class CurrencyRate
* @package App\Service\Currency
*/
class CurrencyRate
{
    public const CBR = 'https://cbr.ru/scripts/XML_daily.asp',

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]],
        CACHE = '/var/cache/cbr/XML_daily.xml',
        TIMER = 180; // 28800 [8hours]

    /** @var Collection */
    private Collection $currency;

    /** @var Collection */
    private Collection $xcover;

    /** @var Collection */
    private Collection $dcover;

    /** @var array */
    private array $list;

    /** @var string */
    private $date;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo)
    {
        $this->currency = $mongo->app->currency;
        $this->xcover = $mongo->app->xcover;
        $this->dcover = $mongo->app->dcover;

        $this->date = date('d/m/Y');
        $this->list = [];
    }

    private function float(string $value): float
    {
        return (float) str_replace(',', '.', $value);
    }

    private function rate(array $data): float
    {
        return $data['value'] / $data['nominal'];
    }

    private function store(array $data): void
    {
        if ($data) {
            $this->currency->deleteMany([]);
            $this->currency->insertOne($data);
        }
    }

    public function load(): self
    {
        try {

            if (// !($raw = file_get_contents(self::CACHE)) ||
                !($raw = file_get_contents(self::CBR .'?date_req='. $this->date)) ||
                !($xml = simplexml_load_string($raw, 'SimpleXMLElement', LIBXML_NOCDATA))) {
                return $this;
            }

            foreach ($xml->xpath('//Valute') as $valute) {
                $this->list[(string) $valute->CharCode] = [
                    'name' => (string) $valute->Name,
                    'nominal' => (int) $valute->Nominal,
                    'value' => $this->float((string) $valute->Value)
                ];
            }

            $this->store($this->list);

        } catch (Throwable $e) {
        }

        return $this;
    }

    public function get(): array
    {
        // return $this->currency->findOne([], self::MAP) ?: [];

        $this->load();

        return $this->list;
    }

    public function convert(string $curr, string $rate): float
    {
        $ret = 1.0;

        if ($curr === $rate) {
            return $ret;
        }

        switch (true) {
            case $rate === 'RUB' && isset($this->list[$curr]):
                $ret = round($this->list[$curr]['value'] / $this->list[$curr]['nominal'], 2, 2);
                break;
            case $curr === 'RUB' && isset($this->list[$rate]):
                $ret = round($this->list[$rate]['nominal'] / $this->list[$rate]['value'], 2, 2);
                break;
            case isset($this->list[$curr], $this->list[$rate]):
                $ret = round($this->rate($this->list[$curr]) / $this->rate($this->list[$rate]), 2, 2);
                break;
        }

        return $ret;
    }

    public function update(): bool
    {
        try {

            if ($needed = $this->xcover->find(['currency' => ['$exists' => true]], self::MAP)->toArray())
            {
                $this->list || $this->load();

                $rates = [];

                return $this->dcover->bulkWrite(
                    array_map(function($cover) use($rates) {
                        if (!isset($rates[$key = $cover['currency']['curr'] . '_' . $cover['currency']['rate']])) {
                            $rates[$key] = $this->convert($cover['currency']['curr'], $cover['currency']['rate']);
                        }

                        $short = (bool) ($cover['currency']['short'] ?? false);

                        return [BulkWrite::UPDATE_MANY => [
                            ['_id' => ['$in' => $cover['connections']]],
                            ['$set' => [
                                'changed' => true,
                                'currency' => [
                                    'rate' => $key,
                                    'value' => $rates[$key],
                                    'short' => $short
                                ]
                            ]]
                        ]];

                    }, $needed)

                )->isAcknowledged();
            }

        } catch (Throwable $e) {
        }

        return false;
    }
}
