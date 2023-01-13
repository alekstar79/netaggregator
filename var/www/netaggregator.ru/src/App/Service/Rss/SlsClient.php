<?php declare(strict_types=1);

namespace App\Service\Rss;

use DateTimeImmutable;
use DateTimeInterface;

use IntlDateFormatter;
use IntlDateTimePatternGenerator;

use SimpleXMLElement;

use Throwable;

/**
* Class Client (RSS 2.0)
* @package App\Service\Rss
*/
class SlsClient
{
    /** @var string */
    private string $skeletone;

    /** @var string */
    private string $locale;

    /** @var string */
    private string $url;

    /** @var array */
    private array $feed;

    public function __construct(string $url, string $locale = 'ru_RU', string $skeletone = 'H:mm:ss dMMMMYYYY')
    {
        $this->skeletone = $skeletone;
        $this->locale = $locale;
        $this->url = $url;
    }

    public static function create(string $url, string $locale = 'ru_RU', string $skeletone = 'H:mm:ss dMMMMYYYY'): self
    {
        return (new self($url, $locale, $skeletone))->loadFeed();
    }

    private function load(): ?SimpleXMLElement
    {
        $xml = null;

        set_error_handler(static fn(): bool => true);

        try {

            $xml = simplexml_load_string(file_get_contents($this->url));
            // $xml = new SimpleXmlElement($this->url, 0, true);

        } catch (Throwable $e) {
        }

        restore_error_handler();

        return $xml;
    }

    private function date_time(string $date): ?DateTimeInterface
    {
        try {

            return new DateTimeImmutable($date);

        } catch (Throwable $e) {
        }

        return null;
    }

    private function dateTimeToString(DateTimeInterface $dt): string
    {
        $dtpg = new IntlDateTimePatternGenerator($this->locale);
        $bpat = $dtpg->findBestPattern($this->skeletone);

        try {

            return (new IntlDateFormatter($this->locale, 0, 0, $dt->getTimezone(), null, $bpat))
                ->format($dt);

        } catch (Throwable $e) {
        }

        return $dt->format('Y M D');
    }

    private function encode(string $str): string
    {
        $str = htmlspecialchars_decode(trim(strip_tags($str)), ENT_QUOTES);

        return preg_replace_callback(
            '/&#?x?[0-9a-zA-Z]+;/u',
            static fn($m): string => html_entity_decode($m[0]),
            $str
        );
    }

    private function summarize(string $text): string
    {
        $text = $this->encode($text);

        if (strlen($text) > 251) {
            $text = substr($text, 0, 251) . '...';
        }

        return $text;
    }

    private function sort(string $order): callable
    {
        $fn = static fn($v) => $v instanceof DateTimeInterface ? $v->getTimestamp() : (int) $v;

        return static function($a, $b) use($order, $fn): int {
            $a = $fn($a['date'] ?? $a);
            $b = $fn($b['date'] ?? $b);

            if ($a === $b) {
                return 0;
            }
            if ($order === 'desc') {
                $k = $a < $b ? 1 : -1;
            } else { // asc
                $k = $a > $b ? 1 : -1;
            }

            return $k;
        };
    }

    private function format(array $item): array
    {
        if ($item['date'] instanceof DateTimeInterface) {
            $item['date'] = $this->dateTimeToString($item['date']);
        }

        return $item;
    }

    public function setSkeletone(string $skeletone): self
    {
        $this->skeletone = $skeletone;

        return $this;
    }

    public function setLocale(string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }

    public function setUrl(string $url): self
    {
        $this->url = $url;

        return $this;
    }

    public function loadFeed(): self
    {
        $this->feed = [];

        if (($rss = $this->load()) && $rss->channel->item) {
            foreach ($rss->channel->item as $item) {
                $this->feed[] = [
                    'title' => (string) $item->title,
                    'description' => $this->summarize((string) $item->description),
                    'date' => $this->date_time((string) $item->pubDate),
                    'link' => (string) $item->link,
                ];
            }
        }

        return $this;
    }

    public function getFeed(int $offset = 0, int $length = 3, string $order = 'desc'): array
    {
        if (!$this->feed) {
            return [];
        }
        if (in_array($order, ['asc', 'desc'])) {
            usort($this->feed, $this->sort($order));
        }

        return array_slice(
            array_map([$this, 'format'], $this->feed),
            $offset,
            $length
        );
    }

    public function first(string $order = 'desc'): array
    {
        return $this->getFeed(0, 1, $order)[0] ?? [];
    }

    public function last(string $order = 'desc'): array
    {
        return $this->getFeed(-1, 1, $order)[0] ?? [];
    }

    public function nth(int $n, string $order = 'desc'): array
    {
        return $n <= $this->count()
            ? $this->getFeed($n - 1, 1, $order)[0] ?? []
            : [];
    }

    public function count(): int
    {
        return count($this->feed);
    }
}
