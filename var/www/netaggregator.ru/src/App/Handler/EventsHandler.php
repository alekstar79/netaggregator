<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\HtmlResponse;

use App\Service\Chat\Chatbot;
use App\Service\Dcover\Reply;
use App\Service\Dcover\Like;
use App\Service\Dcover\Join;

use MongoDB\Collection;
use MongoDB\Client;

use RuntimeException;
use Throwable;

/**
 * Class EventsHandler
 * @package App\Handler
 *
 * message_new
 * message_reply
 * message_allow
 * message_deny
 *
 * photo_new
 * photo_comment_new
 * photo_comment_edit
 * photo_comment_restore
 * photo_comment_delete
 *
 * audio_new
 *
 * video_new
 * video_comment_new
 * video_comment_edit
 * video_comment_restore
 * video_comment_delete
 *
 * wall_post_new
 * wall_repost
 * wall_reply_new
 * wall_reply_edit
 * wall_reply_restore
 * wall_reply_delete
 *
 * board_post_new
 * board_post_edit
 * board_post_restore
 * board_post_delete
 *
 * market_comment_new
 * market_comment_edit
 * market_comment_restore
 * market_comment_delete
 *
 * group_join
 * group_leave
 * group_officers_edit
 * group_change_settings
 * group_change_photo
 *
 * user_block
 * user_unblock
 *
 * poll_vote_new
 */
class EventsHandler implements RequestHandlerInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],

        EXTRA = [
            'commands' => [
                Chatbot::MUSIC => '#music',
                Chatbot::PHOTO => '#photo',
                Chatbot::SIGNA => '#signa',
                Chatbot::VIDEO => '#video'
            ]
        ];

    /** @var Collection */
    private Collection $events;

    /** @var Collection */
    private Collection $groups;

    /** @var Collection */
    private Collection $tokens;

    /** @var string[] */
    private array $map;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo)
    {
        $servise = dirname(__DIR__) . '/Service';

        $this->tokens = $mongo->app->utokens;
        $this->groups = $mongo->app->gtokens;
        $this->events = $mongo->app->events;

        $this->map = [
            'wall_reply_delete' => $servise . '/Dcover/reply.php',
            'wall_reply_new' => $servise . '/Dcover/reply.php',
            'wall_repost' => $servise . '/Dcover/repost.php',
            'message_new' => $servise . '/Chat/worker.php',
            'like_remove' => $servise . '/Dcover/like.php',
            'like_add' => $servise . '/Dcover/like.php',
            'group_join' => $servise . '/Dcover/join.php'
        ];
    }

    private function milliseconds(): string
    {
        $mt = explode(' ', microtime());

        return (string) ($mt[1] * 1000 + round($mt[0] * 1000));
    }

    /**
     * @param array $event
     * @return bool
     */
    private function checkUnique(array $event): bool
    {
        $evt = $event['event_id'] ?? null;

        $hash = ['_id' => $event['group_id'] . '_' . ($evt ?: $this->milliseconds())];

        if (!$this->events->findOne($hash, self::MAP)) {
            return $this->events->insertOne($hash)->isAcknowledged();
        }

        return false;
    }

    /**
     * @param int $gid
     * @return array
     */
    private function find(int $gid): array
    {
        $groups = $this->groups->findOne(['group_id' => $gid], self::MAP);

        return array_merge(
            $this->tokens->findOne(['userId' => $groups['user_id']], self::MAP),
            $groups
        );
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $event = null;

        try {

            if ($json = $request->getBody()->getContents()) {
                $event = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
            }
            if (!$event) {
                throw new RuntimeException('Input data are required to process');
            }
            if (!$this->checkUnique($event)) {
                throw new RuntimeException('Event repeat');
            }
            if (!$credential = $this->find($event['group_id'])) {
                throw new RuntimeException('Credential are required to process');
            }
            if ($event['type'] === 'confirmation') {
                return new HtmlResponse($credential['confirmation_key']);
            }
            if ($path = $this->map[$event['type']] ?? null) {
                $data = base64_encode(json_encode(compact('credential', 'event'), JSON_THROW_ON_ERROR));
                exec(sprintf('nohup php %s %s > /dev/null 2>&1 &', $path, $data));
            }

        } catch (Throwable $e) {
        }

        return new HtmlResponse('ok');
    }

    /** @noinspection ForgottenDebugOutputInspection */
    public function workflow(array $event): string
    {
        try {

            if (!$credential = $this->find($event['group_id'])) {
                throw new RuntimeException('Credential are required to process');
            }
            if ($event['type'] === 'confirmation') {
                return $credential['confirmation_key'];
            }
            if ($event['type'] === 'message_new') {
                Chatbot::create(compact('credential','event'), self::EXTRA)
                    ->perform();
            }
            if ($event['type'] === 'group_join') {
                Join::create(compact('credential','event'))->perform();
            }
            if ($event['type'] === 'like_add') {
                Like::create(compact('credential','event'))->perform();
            }
            if ($event['type'] === 'wall_reply_new') {
                Reply::create(compact('credential','event'))->perform();
            }

        } catch (Throwable $e) {
            var_dump([
                'message' => $e->getMessage(),
                // 'trace' => $e->getTrace(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
        }

        return 'ok';
    }
}
