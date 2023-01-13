<?php

declare(strict_types=1);

namespace Manager;

use Psr\Http\Message\UploadedFileInterface;

/**
 * Class Uploader
 * @package Manager
 */
class Uploader implements UploaderInterface
{
	use ExtendsTrait;

	private function rawUpload(string $path, array $files): array
	{
		$c = count($files['name']);
		$ret = [];

		for($i = 0; $i < $c; $i++) {
			if ($files['error'][$i]) {
                continue;
            }

			$temp = $files['tmp_name'][$i];
			$name = $files['name'][$i];
			$full = $this->mpath($path, $name);

			if ($temp && move_uploaded_file($temp, $full)) {
				$ret[] = $name;
			}
		}

		return $ret;
	}

	private function uploadedFile(string $path, array $files): array
	{
		$ret = [];

		foreach ($files as $file) {
			if ($file instanceof UploadedFileInterface &&
                $file->getError() === UPLOAD_ERR_OK) {

				$name = $file->getClientFilename();
				$file->moveTo($this->mpath($path, $name));
				$ret[] = $name;
			}
		}

		return $ret;
	}

	public function perform(string $path, array $files): array
	{
		return !isset($files['name']) ? $this->uploadedFile($path, $files) : $this->rawUpload($path, $files);
	}
}
