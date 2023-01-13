<?php
/**
* @noinspection PhpUnused
* @noinspection UnknownInspectionInspection
*/

declare(strict_types=1);

namespace Helpers;

/**
* Class ResizeImage
* @package Helpers
* Author: Simon Jarvis
* Copyright: 2006 Simon Jarvis
* Date: 08/11/06
* @see http://www.white-hat-web-design.co.uk/articles/php-image-resizing.php
*/
class ResizeImage
{
    /** @var resource */
    private $image;

    public function load(string $filename): self
    {
        $image_info = getimagesize($filename);
        $image_type = $image_info[2];

        if ($image_type === IMAGETYPE_JPEG) {
            $this->image = imagecreatefromjpeg($filename);
        } elseif ($image_type === IMAGETYPE_GIF) {
            $this->image = imagecreatefromgif($filename);
        } elseif ($image_type === IMAGETYPE_PNG) {
            $this->image = imagecreatefrompng($filename);
        }

        return $this;
    }

    public function save(string $filename, int $image_type = IMAGETYPE_PNG, int $compression = 75, int $permissions = null): self
    {
        if ($image_type === IMAGETYPE_JPEG) {
            imagejpeg($this->image, $filename, $compression);
        } elseif( $image_type === IMAGETYPE_GIF ) {
            imagegif($this->image, $filename);
        } elseif( $image_type === IMAGETYPE_PNG ) {
            imagepng($this->image, $filename);
        }
        if ($permissions !== null) {
            chmod($filename, $permissions);
        }

        return $this;
    }

    public function getWidth(): int
    {
        return imagesx($this->image);
    }

    public function getHeight(): int
    {
        return imagesy($this->image);
    }

    public function resizeToHeight(int $height): self
    {
        $ratio = $height / $this->getHeight();
        $width = ceil($this->getWidth() * $ratio);

        $this->resize((int) $width, $height);

        return $this;
    }

    public function resizeToWidth(int $width): self
    {
        $ratio = $width / $this->getWidth();
        $height = ceil($this->getheight() * $ratio);

        $this->resize($width, (int) $height);

        return $this;
    }

    public function scale(int $scale): self
    {
        $height = ceil($this->getheight() * $scale / 100);
        $width = ceil($this->getWidth() * $scale / 100);

        $this->resize((int) $width, (int) $height);

        return $this;
    }

    public function resize(int $width, int $height): self
    {
        $new_image = imagecreatetruecolor($width, $height);

        imagecopyresampled($new_image, $this->image, 0, 0, 0, 0, $width, $height, $this->getWidth(), $this->getHeight());

        $this->image = $new_image;

        return $this;
    }
}
