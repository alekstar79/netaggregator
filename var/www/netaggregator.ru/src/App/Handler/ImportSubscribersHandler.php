<?php /** @noinspection PhpUndefinedFieldInspection */

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

// use App\VkApi\APIClientInterface;
use MongoDB\{ Client, Database };
use GearmanClient;
use ParseCsv\Csv;

use RuntimeException;
use Throwable;

/**
 * Class ImportSubscribersHandler
 * @package App\Handler
 */
class ImportSubscribersHandler implements RequestHandlerInterface
{
    public const

        // FIELDS = ['sex','bdate','country','city','military','personal','relation'],
        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var Csv */
    private Csv $parser;

    /** @var GearmanClient */
    protected GearmanClient $gClient;

    /** @var Database */
    private Database $db;

    //** @var APIClientInterface */
    // private APIClientInterface $vk;

    public function __construct(Csv $parser, Client $mongo/* , APIClientInterface $vk */)
    {
        $this->gCommunication();

        $this->parser = $parser;

        $this->db = $mongo->app;
        // $this->vk = $vk;
    }

    private function gCommunication(): void
    {
        $client = new GearmanClient;

        if (!$client->addServer()) {
            throw new RuntimeException($client->error());
        }

        $this->gClient = $client;
    }

    private function grab(array $user): int
    {
        return (int) $user[preg_grep('/(u|user_)?id(\sпользов|\suser)?/ui', array_keys($user))[0]];
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

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $files = $request->getUploadedFiles();
        $params = $request->getQueryParams();
        $body = $request->getParsedBody();

        $response = ['import' => false];

        try {

            if (!$uid = $this->uid(array_merge($params, $body), $socials)) {
                throw new RuntimeException('Authorize error');
            }

            $gid = (int) $body['gid'];
            $file = $files['data'];

            if (!$this->fileTransferSuccess($file)) {
                $f = $file->getClientFilename();
                $e = $file->getError();

                throw new RuntimeException("File $f transfer error: $e");
            }

            $_raw = trim((string) $file->getStream());
            $type = $file->getClientMediaType();
            $data = [];

            // $ext = 'text/plain' === $type ? 'txt' : 'csv';
            // $file->moveTo(__DIR__ . "/data.$ext");

            switch ($type) {
                case 'text/csv':
                    if ($this->parser->loadDataString($_raw) && $this->parser->parse($this->parser->file_data)) {
                        $data = array_map([$this, 'grab'], $this->parser->data);
                    }
                    break;
                case 'text/plain':
                    $data = array_filter(array_map('intval', explode("\r\n", $_raw)));
                    break;
            }

            if ($t = $this->db->gtokens->findOne(['group_id' => $gid], self::MAP)) {
                // $this->vk->setToken($t['group_token']);

                $this->gClient->doBackground(
                    'perform',

                    json_encode(
                        [
                            'action' => 'import',
                            'token' => $t['group_token'],
                            'data' => $data,
                            'gid' => $gid,
                            'uid' => $uid
                        ],

                        JSON_THROW_ON_ERROR
                    )
                );

                /* foreach ($this->vk->users->gen($data, self::FIELDS) as $u) {
                    $this->db->mailing->updateOne(['gid' => $gid], [
                        '$push' => ['subscribers' => ['$each' => $u]]
                    ]);
                }

                $this->db->mailing->updateOne(['gid' => $gid], [
                    '$set' => ['handled' => true, 'count' => count($data)]
                ]); */
            }

            $response = ['import' => true];

        } catch (Throwable $e) {
            $response['error'] = $e->getMessage();
        }

        return new JsonResponse($response);
    }
}
