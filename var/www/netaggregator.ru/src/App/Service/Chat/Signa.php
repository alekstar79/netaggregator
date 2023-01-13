<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\Service\Chat;

use App\VkApi\APIClientInterface;

use ImagickPixel;
use ImagickDraw;
use Imagick;

use ImagickPixelException;
use ImagickDrawException;
use ImagickException;

use Throwable;

/**
* Class Signa
* @package App\Service\Chat
*/
class Signa implements MakerInterface
{
    /** @var APIClientInterface */
    private APIClientInterface $vk;

    /** @var array */
    private array $json;

    /** @var array */
    private array $user;

    public function __construct(ChatbotInterface $client)
    {
        /** @noinspection PhpUndefinedFieldInspection */
        $this->json = $client->db->signa->find([], Chatbot::MAP)->toArray();
        $this->user = $client->getUser();
        $this->vk   = $client->vk;
    }

    /**
     * @param string $file
     * @return string|null
     */
    private function upload(string $file): ?string
    {
        $upload = [];
        $photos = [];

        try {

            if ($server = $this->vk->photos->getMessagesUploadServer()) {
                $upload = json_decode($this->vk->http->request(
                    'POST', $server['upload_url'], ['multipart' => [[
                        'contents' => fopen($file, 'rb'),
                        'name' => 'photo'
                    ]]]
                ), true, 512, JSON_THROW_ON_ERROR);
            }
            if (isset($upload['server'])) {
                $photos = $this->vk->photos->saveMessagesPhoto(
                    $upload['server'],
                    $upload['photo'],
                    $upload['hash']
                );
            }

        } catch (Throwable $e) {
        }

        unlink($file);
        return ($p = $photos[0] ?? null)
            ? 'photo'. $p['owner_id'] .'_'. $p['id']
            : null;
    }

    /**
     * @param string $file
     * @return string|null
     * @throws ImagickException
     * @throws ImagickPixelException
     * @throws ImagickDrawException
     */
    public function make(string $file = 'out.png'): ?string
    {
        $s = $this->json[array_rand($this->json)];
        $text = $this->user['first_name'] . "\n" . $this->user['last_name'];
        $angle = (float) $s['angle'];
        $x = (float) $s['x'];
        $y = (float) $s['y'];

        $bg = new Imagick(__DIR__ . '/photo/' . $s['img']);
        $color = new ImagickPixel($s['font_color']);
        $daraw = new ImagickDraw();

        $daraw->setTextAlignment(Imagick::ALIGN_CENTER);
        $daraw->setFont(__DIR__ . '/fonts/' . $s['font']);
        $daraw->setFontSize((float) $s['font_size']);
        $daraw->setFillColor($color);

        $bg->annotateImage($daraw, $x, $y, $angle, $text);
        $bg->setImageFormat('png');
        $bg->writeImage($file);

        return file_exists($file) ? $this->upload($file) : null;
    }
}
