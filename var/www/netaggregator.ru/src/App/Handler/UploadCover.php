<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use App\Service\Groups\AdmGroupsDetermine;
use App\VkApi\TransportInterface;
use App\Auxiliary\Cover\Loader;

/**
 * Class UploadCover
 * @package App\Handler
 */
class UploadCover extends Loader implements RequestHandlerInterface
{
    /** @var AdmGroupsDetermine */
    private AdmGroupsDetermine $groups;

    public function __construct(AdmGroupsDetermine $groups, TransportInterface $http)
    {
        parent::__construct($http);

        $this->groups = $groups;
    }

    public function dpath(int $gid, string $file = 'img.jpg'): string
    {
        return sprintf('%s/%d_%s', __DIR__, $gid, $file);
    }

    private function compliance(int $gid, array $list): bool
    {
        if ($gid && $list) {
            foreach ($list as $group) {
                if ($group['id'] === $gid) {
                    return true;
                }
            }
        }

        return false;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $gid = (int) $request->getAttribute('id');

        $list = isset($socials['vk'])
            ? $this->groups->get($socials['vk'])['items'] ?? []
            : [];

        if (!$this->compliance($gid, $list)) {
            return new JsonResponse(['upload' => false]);
        }

        /** @var UploadedFileInterface $cover */
        $cover = $request->getUploadedFiles()['photo'];
        $path = $this->dpath($gid);
        $cover->moveTo($path);

        $response = $this->setup([$gid => $this->groups->token]);

        if (is_file($path)) {
            unlink($path);
        }

        return new JsonResponse(['upload' => $response[$gid]['images']]);
    }
}
