<?php declare(strict_types=1);

namespace App\Service\TrafficJams;

/**
 * Interface YatrafficInterface
 * @package App\Service\TrafficJams
 */
interface YatrafficInterface
{
    public const TIMER = 1800;

    public function load(array $city): array;

    public function get(array $cities): array;
}
