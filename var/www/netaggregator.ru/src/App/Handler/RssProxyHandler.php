<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

// use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use SimplePie;
use Throwable;
use stdClass;

/**
* Class RssProxyHandler
* @package App\Handler
*/
class RssProxyHandler implements RequestHandlerInterface
{
    private const CLEAN = '/<([^>]+)>|ДАННОЕ СООБЩЕНИЕ \(МАТЕРИАЛ\) .+ ВЫПОЛНЯЮЩИМ ФУНКЦИИ ИНОСТРАННОГО АГЕНТА\.|Спасите «Медузу»\!|https:\/\/support\.meduza\.io/iu';

    /** @var SimplePie */
    private SimplePie $pie;

    public function __construct(SimplePie $pie)
    {
        $pie->enable_cache(false);

        $this->pie = $pie;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        // $socials = $session->get('socials') ?: [];

        // $uid = $socials['vk'] ?? $body['uid'] ?? $body['user_id'] ?? null;

        $params = $request->getQueryParams();
        $error = 'Rss parser error';
        $response = new stdClass();
        $feed = [];

        try {

            $this->pie->set_input_encoding($params['charset'] || 'utf-8');
            $this->pie->set_feed_url($params['src']);

            if ($this->pie->init() && !$this->pie->error()) {
                $response->title = $this->pie->get_title();
                $response->desc = $this->pie->get_description();
                $response->link = $this->pie->get_link();

                foreach ($this->pie->get_items(0, 5) as $i => $item) {
                    $feed[$i]['title'] = $item->get_title();
                    $feed[$i]['content'] = preg_replace(self::CLEAN, '', $item->get_content());
                    $feed[$i]['date'] = $item->get_date('j M Y, g:i');
                }

                $response->feed = $feed;
                $error = null;
            }

        } catch (Throwable $e) {
            $error = $e->getMessage();
        }

        return new JsonResponse(compact('error','response'));
    }
}
