<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

/**
 * Trait TArrayUtility
 * @package Helpers
 */
trait TImageConverterUtility
{
    public function convertToWebp(string $src, int $quality = 100): string
    {
        $dir = pathinfo($src, PATHINFO_DIRNAME);
        $name = pathinfo($src, PATHINFO_FILENAME);
        $ext = pathinfo($src, PATHINFO_EXTENSION);

        $dest = "$dir/{$name}_$ext.webp";
        $is_alpha = false;

        switch (mime_content_type($src)) {
            case 'image/png':
                $img = imagecreatefrompng($src);
                $is_alpha = true;
                break;
            case 'image/jpeg':
                $img = imagecreatefromjpeg($src);
                break;

            default:
                return $src;
        }

        if ($is_alpha) {
            imagepalettetotruecolor($img);
            imagealphablending($img, true);
            imagesavealpha($img, true);
        }

        imagewebp($img, $dest, $quality);

        return $dest;
    }
}
