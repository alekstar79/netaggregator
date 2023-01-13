<?php
/**
* @noinspection UnusedConstructorDependenciesInspection
* @noinspection PhpDocSignatureInspection
* @noinspection PhpUnusedAliasInspection
*/

declare(strict_types=1);

namespace App\Session;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\MessageInterface;

use Zend\Expressive\Session\SessionPersistenceInterface;
use Zend\Expressive\Session\SessionInterface;
use Zend\Expressive\Session\Session;

use Dflydev\FigCookies\{ FigResponseCookies, SetCookie, Modifier\SameSite };

use App\Middleware\MobileDetectMiddleware;
use Helpers\MobileDetect;

/**
* Class SessionPersistence
* @package App\Session
*
* @basic_session_handling
*  session_set_cookie_params(0, '/; SameSite=None', $this->domain, true, false);
*  session.save_path /var/lib/php/sessions
*
* @note Deleting session files by CRON
* @see https://www.alexgur.ru/articles/5027
*/
class SessionPersistence implements SessionPersistenceInterface
{
    /** @var MobileDetect */
    private MobileDetect $detector;

    /** @var string */
    private string $action;

    /** @var string */
    private string $name;

    /** @var string */
    private string $id;

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    private function start(): array
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_name($this->name);

            if ($this->id) {
                session_id($this->id);
                session_start();
            } else {
                session_start();
                $this->id = session_id();
            }

        } else {
            session_regenerate_id(true);
            $this->id = session_id();
        }

        return array_slice($_SESSION, 0);
    }

    /**
    * @param ResponseInterface $response
    * @param bool $not
    * @return ResponseInterface
    */
    private function setCookie(ResponseInterface $response, bool $not = false): ResponseInterface
    {
        if ($not) {
            return $response;
        }

        $cookie = preg_match('~^/logout/~', $this->action)
            ? SetCookie::createExpired($this->name)->withSecure(true)->withPath('/')
            : SetCookie::create($this->name, $this->id)->withSecure(true)->withPath('/');

        if (!$this->detector->isiOS() || $this->detector->version('iPhone', 'float') > 13.0) {
            $cookie = $cookie->withSameSite(SameSite::none());
        }

        return FigResponseCookies::set($response, $cookie);
    }

    public function initializeSessionFromRequest(ServerRequestInterface $request): SessionInterface
    {
        $this->detector = $request->getAttribute(MobileDetectMiddleware::DEVICE_ID);
        // $this->ios = $detector->isiOS() && $detector->version('iPhone', 'float') < 13;

        $this->id = $request->getCookieParams()[$this->name] ?? '';
        $this->action = $request->getUri()->getPath();

        $sess = $this->start();

        session_write_close();

        return new Session($sess, $this->id);
    }

    public function persistSession(SessionInterface $session, ResponseInterface $response): ResponseInterface
    {
        // todo: deleting session files by cron, see above
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        $_SESSION = $session->toArray();
        $empty = !count($_SESSION);

        header_remove('Set-Cookie');
        session_write_close();

        return $this->setCookie($response, $empty);
    }
}
