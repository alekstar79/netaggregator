<?php

/**
* @noinspection DuplicatedCode
* @noinspection PhpUndefinedFieldInspection
*/

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\EmptyResponse;

use MongoDB\{ Client, BSON\ObjectId, Operation\FindOneAndUpdate };
use DateTime;

use Throwable;

/**
* Class YKPaymentNotificationsHandler
* @package App\Handler
*/
class YKPaymentNotificationsHandler implements RequestHandlerInterface
{
    private const

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        COMPONENTS = ['chatbot', 'stream', 'widget', 'cover', 'designer'],
        MONTH = 2592000;

    /** @var Client */
    private Client $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    private function union(array $doc, array $pay): array
    {
        foreach ($pay as $srv => $data) {
            $not_array = in_array($srv, ['designer','stream']);

            if (!isset($doc[$srv])) {
                $doc[$srv] = $not_array ? 0 : [];
            }
            if ($not_array) {
                $doc[$srv] = $data;
                continue;
            }

            foreach ($data as $k => $v) {
                $doc[$srv][$k] = $v;
            }
        }

        return $doc;
    }

    private function extract(array $array): array
    {
        $services = array_intersect_key($array, array_flip(self::COMPONENTS));

        return array_merge(
            array_map([$this, 'convert1'], array_filter($services, static fn($s) => !in_array($s, ['designer','stream']), 2)),
            $this->convert2(array_filter($services, static fn($s) => in_array($s, ['designer','stream']), 2))
        );
    }

    private function convert1(array $data): array
    {
        $now = time();

        foreach ($data as $k => $v) {
            if ($k !== 'amount') {
                $data[$k] = $now + (self::MONTH * $v);
            }
        }

        return $data;
    }

    private function convert2(array $data): array
    {
        $now = time();

        foreach ($data as $k => $v) {
            $data[$k] = $now + (self::MONTH * $v);
        }

        return $data;
    }

    /**
     * @throws Throwable
     */
    private function notFoundLog(array $data): void
    {
        $dt = new DateTime();
        $t = $dt->format('Y-m-d H:i:s');

        file_put_contents(
            __DIR__ . "/not-found-$t.json",
            json_encode($data, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $body = $request->getParsedBody();

        if (!isset($body['type'], $body['event'], $body['object'])) {
            return new EmptyResponse(200);
        }

        try {

            if ($body['event'] === 'payment.succeeded') {
                $metadata = $body['object']['metadata'];

                if ($features = $this->client->app->payments->findOneAndDelete(
                    ['_id' => new ObjectId($metadata['id'])],
                    ['returnDocument' => FindOneAndUpdate::RETURN_DOCUMENT_BEFORE] + self::MAP
                ))
                {
                    $amount = (float) $body['object']['income_amount']['value'];
                    $available = (float) $metadata['ref'];
                    $uid = (int) $metadata['user'];

                    $this->client->app->payments->insertOne($body);
                    if (($doc = $this->client->app->utokens->findOneAndUpdate(
                        ['userId' => $uid],
                        ['$set' => compact('available')],
                        ['returnDocument' => FindOneAndUpdate::RETURN_DOCUMENT_BEFORE] + self::MAP
                    )) && $doc['ref'] > 0) {
                        $this->utokens->updateOne(
                            ['userId' => $doc['ref']],
                            ['$inc' => ['available' => round(.07 * $amount)]]
                        );
                    }
                    if (!$doc = $this->client->app->subscribe->findOne(['uid' => $uid], self::MAP)) {
                        $doc = [];
                    }

                    $set = $this->union($doc, $this->extract($features));
                    $set['amount'] = $features['amount'];
                    $set['uid'] = $uid;

                    $this->client->app->subscribe->updateOne(
                        ['uid' => $uid],
                        ['$set' => $set],
                        ['upsert' => true]
                    );

                } else {
                    $this->notFoundLog($body);
                }
            }

        } catch (Throwable $e) {
        }

        return new EmptyResponse(200);
    }
}
