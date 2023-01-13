<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use App\Auxiliary\Auth\AssistantInterface;
use App\Auxiliary\Auth\KeeperInterface;

/**
 * Class UserAuthHandler
 * @package App\Handler
 */
class UserAuthHandler implements RequestHandlerInterface
{
    /** @var AssistantInterface */
    private AssistantInterface $assistant;

    /** @var KeeperInterface */
    private KeeperInterface $keeper;

    public function __construct(AssistantInterface $assistant, KeeperInterface $keeper)
    {
        $this->assistant = $assistant;
        $this->keeper = $keeper;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $this->assistant->setCallback($this->keeper);
        $this->assistant->setRequest($request);

        $action = $request->getAttribute('act');
        $params = $request->getQueryParams();

        if (isset($params['error']) || $action === 'logout') {
            return $this->assistant->setMark()->rehab(null);
        }

        return isset($params['code'])
            ? $this->assistant->handle($params)
            : $this->assistant->authorize();
    }
}
