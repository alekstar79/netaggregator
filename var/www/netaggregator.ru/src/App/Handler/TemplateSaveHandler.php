<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ BSON\ObjectId, Client, Collection };

use App\Service\Dcover\ExtendsTrait;
// use Helpers\ResizeImage;

use RuntimeException;
use Throwable;

/**
* Class TemplateSavelHandler
* @package App\Handler
*/
class TemplateSaveHandler implements RequestHandlerInterface
{
    use ExtendsTrait;

    /** @var Collection */
    private Collection $covers;

    //** @var ResizeImage */
    // private ResizeImage $image;

    /** @var string */
    private string $root;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client /*, ResizeImage $image */)
    {
        $this->covers = $client->app->covers;
        // $this->image = $image;

        $this->root = dirname(__DIR__, 3);
    }

    private function uid(array $params, array $socials): int
    {
        return (int) ($socials['vk'] ?? $params['uid'] ?? 0);
    }

    private function fileTransferSuccess($file): bool
    {
        if ($file instanceof UploadedFileInterface) {
            return UPLOAD_ERR_OK === $file->getError();
        }

        return false;
    }

    public function updateDb(array $data): string
    {
        if ($hash = $data['hash'] ?? null) {
            unset($data['hash']);
        }

        if (!isset(($ret = $this->covers->findOneAndUpdate(
            ['_id' => new ObjectId($hash)],
            [
                '$set' => [
                    'version' => 4,
                    'widgets' => $data['widgets'] ?? []
                ]
            ],
            [
                'typeMap' => ['root' => 'array', 'document' => 'array'],
                'returnDocument' => 2,
                'upsert' => true,
            ]

        ))['_id']))
        {
            throw new RuntimeException('Save error');
        }

        return $ret['_id']->__toString();
    }

    // max_file_size=20M
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $files = $request->getUploadedFiles();
        $body = $request->getParsedBody();

        $ret = ['save' => true];

        try {

            if (!$this->uid($body, $socials)) {
                throw new RuntimeException('Authorization error');
            }

            $exec = "$this->root/src";
            $path = "$this->root/nuxt/static/dcover/default";
            $state = $this->jsonDecode($body['state'], true);
            $hash = $this->updateDb($state);

            foreach ($files as /* $name => */ $file) {
                if (!$this->fileTransferSuccess($file)) {
                    $f = $file->getClientFilename();
                    $e = $file->getError();

                    throw new RuntimeException("File $f transfer error: $e");
                }

                $ext = 'image/png' === $file->getClientMediaType() ? 'png' : 'wxg';

                switch ($ext) {
                    case 'png':
                        $file->moveTo("$path/template/$hash.png");
                        break;
                    case 'wxg':
                        $file->moveTo("$path/structs/$hash.wxg");
                        break;
                }
            }

            if (isset($body['json'])) {
                file_put_contents("$path/structs/$hash.json", $body['json']);
            }

            exec("/var/www/netaggregator.ru/thumb.sh $hash > /dev/null 2>&1 &");
            exec("$exec/App/Service/Dcover/imagehash.php $hash > /dev/null 2>&1 &");

            // $this->image->load($tmpl)->scale(42)->save($thumb);
            // shell_exec("sudo chown -R www-data:www-data $path");
            // shell_exec("/var/www/netaggregator.ru/webp-convert.sh $path");

        } catch (Throwable $e) {
            $ret = ['error' => $e->getMessage(), 'save' => false];
        }

        return new JsonResponse($ret);
    }
}
