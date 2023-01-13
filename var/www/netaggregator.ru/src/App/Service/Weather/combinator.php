<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Weather/combinator.php
# php /var/www/netaggregator.ru/src/App/Service/Weather/combinator.php

declare(strict_types=1);

namespace App\Service\Weather;

use App\Model\JsonRepoInterface;
use App\Model\JsonRepo;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/**
* @cities http://bulk.openweathermap.org/sample/
* @tool https://www.convertsimple.com/convert-json-to-javascript
* @tool https://www.browserling.com/tools/strip-slashes
* @tool https://wtools.io/ru/convert-json-to-php-array
* @tool https://jsoneditoronline.org
*/
function init(): CombinatorInterface
{
    return new class implements CombinatorInterface
    {
        use ExtendsTrait;

        private JsonRepoInterface $repo1, $repo2;

        private array $list1, $list2;

        public function __construct()
        {
            $path = realpath(dirname(__DIR__, 4) . '/nuxt/assets/cities');

            $this->repo1 = JsonRepo::init(__DIR__ . '/json');
            $this->repo2 = JsonRepo::init($path);

            $this->read();
        }

        private function read(): void
        {
            $this->list1 = $this->repo1->read('city.list-1');
            $this->list2 = $this->repo2->read('cities');
        }

        private function map(): array
        {
            return array_map(function($item) {
                $item['translit'] = $this->translit($item['title']);

                return $item;

            }, $this->list2);
        }

        private function check(array $input): array
        {
            echo "\n\e[32m=== LIST ===\e[0m\n\n";

            $filter = static fn($c) => $c['country'] === 'RU';
            $mapper = static fn($c) => $c['name'];

            $list = array_map($mapper, array_filter($input, $filter));
            $output = [];
            $count = 0;

            foreach ($this->map() as $city) {
                $closest = $city['translit'];
                $lev = 1;

                $count++;

                if (!in_array($city['translit'], $list, true)) {
                    $shortest = -1;

                    foreach ($list as $name) {
                        $lev = levenshtein($city['translit'], $name);

                        if ($lev <= $shortest || $shortest < 0) {
                            $closest = $name;
                            $shortest = $lev;
                        }
                    }
                }

                if (($ln = strlen($closest) / $lev) < 1) {
                    echo " \e[32mEXCLUDE\e[0m " .  "$count {$city['title']} - {$city['translit']} - $closest LN/LV: $ln \n";
                    continue;
                }

                echo "$count {$city['title']} - {$city['translit']} - $closest LN/LV: $ln \n";

                $city['translit'] = $closest;
                $output[] = $city;
            }

            return $output;
        }

        public function combine(string $file = 'translit'): void
        {
            if ($output = $this->check($this->list1)) {
                // save to assets/cities/translit.json
                $this->repo2->save($file, $output);
            }

            echo "\nCombine accomplished\n";
        }

        public function transform(string $file = 'list-ru'): void
        {
            // save to json/list-ru.json
            $this->repo1->save($file, array_column(
                array_filter($this->list1, static fn($c) => $c['country'] === 'RU'),
                'name',
                'id'
            ));

            echo "\nTransform accomplished\n";
        }

        public function buildList($file = 'short-list'): void
        {
            $needle = array_column($this->check($this->list1), 'translit');

            $haystack = array_column(
                array_filter($this->list1, static fn($c) => $c['country'] === 'RU'),
                'name',
                'id'
            );

            // save to json/short-list.json
            $this->repo1->save($file, array_map(static function($city) use($haystack) {
                $weather_id = array_search($city, $haystack, false);

                return compact('weather_id', 'city');

            }, $needle));

            echo "\nConversion accomplished\n";
        }
    };
}

init()->buildList();
