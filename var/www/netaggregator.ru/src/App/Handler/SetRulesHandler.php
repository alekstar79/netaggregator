<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use App\Service\Stream\HttpClientInterface;
use App\Service\Stream\PackageInterface;
use App\Service\Stream\Package;

use App\Model\StreamRepositoryInterface;

/**
* Class SetRulesHandler
* @package App\Handler
*/
class SetRulesHandler implements RequestHandlerInterface
{
    /** @var HttpClientInterface */
    private HttpClientInterface $stream;

    /** @var StreamRepositoryInterface */
    private StreamRepositoryInterface $repo;

    /** @var bool */
    private bool $tags = false;

    public function __construct(HttpClientInterface $stream, StreamRepositoryInterface $repo)
    {
        $this->stream = $stream;
        $this->repo = $repo;
    }

    private function compose(array $tags): array
    {
        $ret = [];

        foreach ($tags as $tag => $set) {
            $ret[] = [
                'tag' => $set['tag'] ?? $tag,
                'mark' => $set['mark'],
                'count' => $set['stat']
            ];
        }

        return $ret;
    }

    private function buildRules(array $rules): array
    {
        return array_map(static fn($r): string => $r['mark'], $rules);
    }

    private function extract(array $set): array
    {
        $tags = array_filter(array_column($set, 'tags'));

        return array_unique(array_merge(...array_map([$this, 'buildRules'], $tags)));
    }

    private function toNull(array $data): array
    {
        return array_map(function($v) {
            if (is_array($v)) {
                $v = $this->toNull($v);

                if (count($v) < 1) {
                    $v = null;
                }
            }

            return $v;

        }, $data);
    }

    private function updateStream(PackageInterface $p): bool
    {
        $del = true;
        $add = true;

        if ($p->isSomethingDel()) {
            $del = $this->stream->del($p);
        }
        if ($p->isSomethingAdd()) {
            $add = $this->stream->add($p);
        }
        if (!$del || !$add) {
            return $p->presence($this->stream->get());
        }

        return true;
    }

    private function updateDb(int $userId, array $data): bool
    {
        $data = $this->toNull($data);

        if (!$ret = $this->repo->update($userId, $data)) {
            $ret = $this->repo->save(array_merge(compact('userId'), $data)); // the save method is just a stub
        }

        return (bool) $ret;
    }

    private function prepare(array $marks): PackageInterface
    {
        return new Package(array_filter($marks, static function($v) {
            return !preg_match('~[^A-zА-я "]~ui', $v);
        }));
    }

    private function tagToKey(array $data): array
    {
        return array_combine(array_column($data, 'tag'), $data);
    }

    private function plainKey(array $data): array
    {
        $tags = [];

        foreach ($data as $tag => $v) {
            $tags[] = array_merge(compact('tag'), $v);
        }

        return $tags;
    }

    private function set(int $uid, array $marks): array
    {
        $new = $this->prepare($marks);
        $all = $this->repo->all();
        $tags = [];

        if (isset($all[$uid])) {
            $tags = $all[$uid]['tags'] ?: [];
            unset($all[$uid]);
        }

        $tags = $this->tagToKey($tags);
        $all = array_map(fn($u) => array_merge($u, ['tags' => $this->tagToKey($u['tags'])]), $all);

        $new->generate($this->buildRules($tags), $this->extract($all));

        if (!$this->updateStream($new)) {
            return [];
        }

        $tags = $this->plainKey($new->getRules());

        $this->tags = true;

        if (!$this->updateDb($uid, compact('tags'))) {
            $this->updateStream($new->reverse());
            $this->tags = false;
            $tags = [];
        }

        return $tags;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $body = $request->getParsedBody();
        $set = false;

        if (!$uid = (int)($socials['vk'] ?? $body['uid'] ?? 0)) {
            return new JsonResponse(compact('set'));
        }

        $stop = ['list' => [], 'swear' => 0];
        $query = [];
        $tags = [];

        $SM = true;
        $SS = true;
        $SQ = true;

        if (isset($body['marks'])) {
            $tags = $this->set($uid, $body['marks']);
            $SM = $this->tags;
        }
        if (isset($body['stop'])) {
            $stop = $body['stop'];
            $SS = $this->updateDb($uid, compact('stop'));
        }
        if (isset($body['query'])) {
            $query = $body['query'];
            $SQ = $this->updateDb($uid, compact('query'));
        }

        return new JsonResponse([
            'set' => $SM && $SS && $SQ,
            'marks' => array_column($tags, 'mark'),
            'stats' => $this->compose($tags),
            'query' => $query,
            'stop' => $stop
        ]);
    }
}
