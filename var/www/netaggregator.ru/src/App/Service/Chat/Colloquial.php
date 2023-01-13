<?php declare(strict_types=1);

namespace App\Service\Chat;

use Google\Cloud\Dialogflow\V2\SessionsClient;
use Google\Cloud\Dialogflow\V2\QueryInput;
use Google\Cloud\Dialogflow\V2\TextInput;

use Google\ApiCore\ApiException;
// use Throwable;

/**
* Class Colloquial
* @package App\Service\Chat
*/
class Colloquial
{
    public const

        GOOGLE_SMALLTALK_PROJECT = 'small-talk-gamrvl',
        GOOGLE_SMALLTALK_SESSION = 'NetXAIBot';

    /** @var array */
    private array $default = [];

    /** @var array */
    private array $dialogs = [];

    /** @var array */
    private array $context;

    /** @var string */
    private string $msg;

    /** @var string|null */
    public ?string $sid;

    /** @var bool */
    public bool $agent;

    /** @var bool */
    public bool $continue;

    /** @var array */
    public array $attachments;

    /** @var array */
    public array $keyboard;

    public function __construct(ChatbotInterface $client)
    {
        $this->continue = false;
        $this->agent = false;

        if ($client->dialog) {
            $this->default = (array) $client->dialog['default'];
            $this->dialogs = (array) $client->dialog['dialogs'];
            $this->agent = (bool) $client->dialog['smalltalk'];
        }

        $this->msg = $client->extract('text');
        $this->context = $client->getUser();
        $this->sid = $client->sid;

        $this->attachments = [];
        $this->keyboard = [];

        if ($this->sid && count($this->dialogs)) {
            $this->findCurrentDialog($this->dialogs);
        }
    }

    private function findCurrentDialog(array $dialogs = []): bool
    {
        $i = array_search($this->sid, array_column($dialogs, 'id'), false);

        if ($mark = ($i !== false)) {
            $this->dialogs = $dialogs[(int) $i]['children'];
            return true;
        }

        foreach ($dialogs as $d) {
            if (!count($d['children'])) {
                continue;
            }
            if ($this->findCurrentDialog($d['children'])) {
                $mark = true;
                break;
            }
        }

        return $mark;
    }

    private function setContinuation(array $dialog): void
    {
        $c = (bool) count($dialog['children']);

        $this->sid = $c ? $dialog['id'] : null;

        $this->attachments = $dialog['attachments'];
        $this->keyboard = $dialog['keyboard'];
        $this->continue = $c;

        /* try {

            file_put_contents(__DIR__ . '/dialog-set-continuation.json', json_encode(
                array_merge(['dialog' => $dialog, 'sid' => $this->sid, 'continue' => $c]),
                JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
            ));

        } catch (Throwable $e) {
        } */
    }

    private function build(string $response, array $m): ?string
    {
        $variable = '/\\$(\\d+)/ui';
        $mustache = '/{(\\w+)}/ui';

        if ($m && preg_match($variable, $response, $x)) {
            $response = str_replace($x[0], $m[$x[1]], $response);
        }
        if (preg_match($mustache, $response, $w)) {
            $var = $this->context[$w[1]] ?? null;

            switch (true) {
                case (bool) $var:
                    $response = str_replace($w[0], $var, $response);
                    break;

                case $w[1] === 'gen':
                    $response = Generator::get();
                    break;

                case $w[1] === 'joke':
                    $response = Joke::get();
                    break;
            }
        }

        return $response;
    }

    /* private function reply(array $dialog): string
    {
        $set = (array) $dialog['reply'];

        if ($dialog['random']) {
            return (string) $set[array_rand($set, 1)];
        }

        return '';
    } */

    private function chatMsgHandler(): array
    {
        $msg = $this->msg;

        $response = [];
        $text = null;

        foreach ($this->dialogs as $dialog) {
            $set = (array) $dialog['reply'];

            $temp = (array) $set[array_rand($set)];
            $keys = (array) $dialog['keywords'];

            /* try {

                file_put_contents(__DIR__ . '/pre-set-continuation.json', json_encode(
                    array_merge(['set' => $set, 'temp' => $temp, 'keys' => $keys, 'text' => $text, 'match' => preg_match('/'. implode('|', $keys) .'/ui', $msg, $m)]),
                    JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
                ));

            } catch (Throwable $e) {
            } */

            if ($dialog['exact']) {
                if (in_array($msg, $keys, false)) {
                    $text = $this->build($temp['text'], []);
                }
            } else if (preg_match('/'. implode('|', $keys) .'/ui', $msg, $m)) {
                $text = $this->build($temp['text'], $m);
            }
            if ($text) {
                $this->setContinuation($dialog);
                $temp['text'] = $text;
                $response = $temp;
                break;
            }
        }

        return $response;
    }

    private function smallTalk(): array
    {
        $sessionsClient = new SessionsClient();

        $session = SessionsClient::sessionName(
            self::GOOGLE_SMALLTALK_PROJECT,
            self::GOOGLE_SMALLTALK_SESSION
        );

        $tInput = new TextInput();
        $tInput->setLanguageCode('ru-RU');
        $tInput->setText($this->msg);

        $qInput = new QueryInput();
        $qInput->setText($tInput);

        $text = null;

        try {

            $response = $sessionsClient->detectIntent($session, $qInput);

            if ($queryResult = $response->getQueryResult()) {
                $text = $queryResult->getFulfillmentText();
            }

        } catch (ApiException $e) {
        }

        $sessionsClient->close();

        return $text ? compact('text') : [];
    }

    public function talk(): array
    {
        $response = [];
        $text = '???';

        if (count($this->default)) {
            $text = $this->default[array_rand($this->default)];
        }
        if (!$this->msg) {
            return $text ? compact('text') : [];
        }
        if ($this->dialogs) {
            $response = $this->chatMsgHandler();
        }
        if (!$response && $this->agent) {
            $response = $this->smallTalk();
        }
        if (!$response && $text) {
            $response = compact('text');
        }

        return $response;
    }

    public static function create(ChatbotInterface $client): self
    {
        return new self($client);
    }
}
