<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\RedirectResponse;

use MongoDB\{ Client, Collection };

use Throwable;

/**
* Class ReferralsHandler
* @package App\Handler
*/
class ReferralsHandler implements RequestHandlerInterface
{
    /** @var Collection */
    private Collection $utokens;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo)
    {
        $this->utokens = $mongo->app->utokens;
    }

    /**
    * @throws Throwable
    */
    /* private function log(array $data): void
    {
        file_put_contents(__DIR__ . '/ref.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
        file_put_contents(__DIR__ . '/ref.php', "<?php\n" . var_export($data, true) . ";\n");
    } */

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        try {

            if ($id = (int) array_slice(explode('/', $request->getUri()->getPath()), -1)[0]) {
                $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
                $socials = $session->get('socials') ?: [];
                $ref = $session->get('ref');

                // $this->log(compact('id','socials'));

                if (!$ref && !count($socials)) {
                    $this->utokens->updateOne(['userId' => $id], ['$inc' => ['clicked' => 1]]);
                    $session->set('ref', $id);
                }
            }

        } catch (Throwable $e) {
        }

        return new RedirectResponse('/');
    }
}
