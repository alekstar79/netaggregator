<?php /** @noinspection PhpUnused */

declare(strict_types=1);

namespace App\Service\Research;

use RuntimeException;

/**
* Class NanoImage
* @package App\Service\Research
*/
class ResizeImage
{
    public const JPEG = '.jpeg', JPG = '.jpg', PNG = '.png', GIF = '.gif', WEBP = '.webp';

    /** @var string|null */
	private ?string $image_url;

    /** @var resource */
	private $image_data;

    /** @var int */
	private int $new_height;

    /** @var int */
	private int $new_width;

    /**  @var int */
    private int $crop_height;

    /** @var int */
    private int $crop_width;

    /** @var int */
	private int $height;

    /** @var int */
	private int $width;

    /** @var string|null */
	private ?string $extension;

    /**
    * Open image from url or path
    * @param string $url The string image url
    * @return ResizeImage class instance
    */
    public function open(string $url): self
    {
        $this->image_url = $url;

        $info = pathinfo( $this->image_url);
        $this->extension = strtolower($info['extension']);
        [$width, $height] = getimagesize($this->image_url);

        $this->height = $height;
        $this->width = $width;

        $this->new_height = $height;
        $this->new_width = $width;

        if ($this->extension === 'jpeg' || $this->extension === 'jpg') {
            $this->image_data = @imagecreatefromjpeg($this->image_url);
        } else if ($this->extension === 'gif') {
            $this->image_data = @imagecreatefromgif($this->image_url);
        } else if ($this->extension === 'png') {
            $this->image_data = @imagecreatefrompng($this->image_url);
        } else if ($this->extension === 'webp') {
            $this->image_data = @imagecreatefromwebp($this->image_url);
        }

        return $this;
    }

    /**
    * Load image from string
    * @param string $image_data The string image data
    * @return ResizeImage class instance
    */
    public function load(string $image_data): self
    {
        $this->image_data = imagecreatefromstring($image_data);

        $this->height = @imagesy($this->image_data);
        $this->width = @imagesx($this->image_data);

        $this->new_height = $this->height;
        $this->new_width = $this->width;

        return $this;
    }

    /**
    * Set image height
    * @param int $height The original height of image
    * @return ResizeImage class instance
    */
    public function setHeight(int $height): self
    {
        $this->new_height = $height;
        $this->height = $height;

        return $this;
    }

    /**
    * Set image width
    * @param int $width The original width of image
    * @return ResizeImage class instance
    */
    public function setWidth(int $width): self
    {
        $this->new_width = $width;
        $this->width = $width;

        return $this;
    }

    /**
    * Resize image algorithm
    * @param int $width The request width to set image
    * @param int $height The request height to set image
    * @param bool $ratio Auto calculate image ratio
    * @return ResizeImage class instance
    */
    public function resize(int $width, int $height, bool $ratio = true): self
    {
        if ($ratio) {
            if ($this->width > $this->height) {
                $newHeight = $height;
                $newWidth = ($width / $this->height) * $this->width;
            } else {
                $newWidth = $width;
                $newHeight = ($height / $this->width) * $this->height;
            }

            $this->new_height = $newHeight;
            $this->new_width = $newWidth;

        } else {
            $this->new_height = $height;
            $this->new_width = $width;
        }

        $this->crop_height = $height;
        $this->crop_width = $width;

        return $this;
    }

    private function localPath(): string
    {
        return __DIR__ . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'img-resize' . self::JPEG;
    }

    /**
    * Build image in browser
    * @param string|null $path Optional path, set to null to ignore saving image or supply path to save a copy
    * @param int $quality The require quality to set image
    * @return resource|bool resource identifier on success, false on errors.
    */
    private function build(?string $path, int $quality)
    {
        $createImage = @imagecreatetruecolor($this->new_width, $this->new_height);
        $white = @imagecolorallocate($createImage, 255, 255, 255);

        @imagefilledrectangle($createImage, 0, 0, $this->new_width, $this->new_height, $white);

        @imagecopyresampled($createImage, $this->image_data, 0, 0, 0, 0, $this->new_width, $this->new_height, $this->width, $this->height);
        @imagejpeg($createImage, $path, $quality);
        @imagedestroy($createImage);

        return $createImage;
    }

    /**
    * Display image in browser
    * @param int $quality The require quality to set image
    * @return resource|bool resource identifier on success, false on errors.
    */
    public function display(int $quality)
    {
        return $this->build(null, $quality);
    }

    /**
     * Save image to directory
     * @param string $to Full directory to save image
     * @param string|null $copy_algo Specify how image should be saved NULL will delete existing image from directory
     *               While passing thumbnail will rename image using height and width
     * @param int $quality The require quality to set image
     */
    public function save(string $to, ?string $copy_algo = null, int $quality = 90): void
    {
        $info = pathinfo(($to ?: $this->localPath()));
        $extension = strtolower($info['extension']);
        $dirname = $info['dirname'] ?? null;
        $filename = $info['filename'] ?? null;
        $full_path = $dirname . DIRECTORY_SEPARATOR . $filename . '.' . $extension;

        if (!mkdir($dirname, 0777, true) && !is_dir($dirname)) {
            throw new RuntimeException(sprintf('Directory "%s" was not created', $dirname));
        }

        chmod($dirname, 0755);

        if (file_exists($full_path)) {
            if (!empty($copy_algo)) {
                if ($copy_algo === 'thumbnail') {
                    $full_path = $dirname . DIRECTORY_SEPARATOR . $filename . '-' . $this->crop_width . 'x' . $this->crop_height . '.' . $extension;

                    if (file_exists($full_path)) {
                        unlink($full_path);
                    }

                } else {
                    $full_path = $dirname . DIRECTORY_SEPARATOR . $filename . '-' . date('d-m-y h:m:s') . '.' . $extension;
                }

            } else {
                unlink($full_path);
            }
        }

        $this->build($full_path, $quality);
    }

    public function free(): void
    {
        $this->image_data = null;
        $this->image_url = null;
        $this->extension = null;

        $this->height = 0;
        $this->width = 0;

        $this->new_height = 0;
        $this->new_width = 0;

        $this->crop_height = 0;
        $this->crop_width = 0;
    }
}
