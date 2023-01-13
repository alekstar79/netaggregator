<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, Collection };

use App\Service\Dcover\ExtendsTrait;
use Helpers\TWriterUtility;

use RuntimeException;
use Throwable;

/**
* Class CoverInstallHandler
* @package App\Handler
* @property Collection dcover
* @property Collection xcover
*/
class CoverInstallHandler implements RequestHandlerInterface
{
    use TWriterUtility, ExtendsTrait;

    private const DEFAULT = ['first_name' => 'Вакантное', 'last_name' => 'место'];

    /** @var Collection */
    private Collection $xcover;

    /** @var Collection */
    private Collection $dcover;

    /** @var string */
    private string $root;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->subscribe = $client->app->subscribe;
        $this->dcover = $client->app->dcover;
        $this->xcover = $client->app->xcover;

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

    // max_file_size=20M
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $files = $request->getUploadedFiles();
        $body = $request->getParsedBody();

        $ret = ['install' => true];

        try {

            if (!$uid = $this->uid($body, $socials)) {
                throw new RuntimeException('Authorization error');
            }

            $state = $this->jsonDecode($body['state'], true);

            $dcov = "$this->root/nuxt/static/dcover/$uid";
            $hash = $this->saveToDb($uid, $state, $this->xcover);
            $path = "$dcov/$hash";

            if (!$this->mkdir($path)) {
                throw new RuntimeException('Internal error. Try again later.');
            }
            if (isset($body['json'])) {
                @file_put_contents("$path/struct.json", $body['json']);
            }

            $this->updateDcover($uid, $state);

            foreach ($files as $name => $file) {
                if (!$this->fileTransferSuccess($file)) {
                    $f = $file->getClientFilename();
                    $e = $file->getError();

                    throw new RuntimeException("File $f transfer error: $e");
                }

                $ext = 'image/png' === $file->getClientMediaType() ? 'png' : 'wxg';

                $file->moveTo("$path/$name.$ext");
            }

            shell_exec("sudo chown -R www-data:www-data $dcov");
            shell_exec("/var/www/netaggregator.ru/webp-convert.sh $dcov");

            $this->rmEmptyDir($dcov);

        } catch (Throwable $e) {
            $ret = ['error' => $e->getMessage(), 'install' => false];
        }

        return new JsonResponse($ret);
    }
}
