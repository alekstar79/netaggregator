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

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, BSON\UTCDateTime };
use App\Middleware\PaymentMiddleware;

use YooKassa\Request\Payments\CreatePaymentResponse;
use YooKassa\Client as YooClient;

use Throwable;

/**
* Class YKPaymentHandler
* @package App\Handler
*/
class YKPaymentHandler implements RequestHandlerInterface
{
    private const

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        OWNERS = [25520481, 465174119, 466483621, 486939909],

        /** @see https://yookassa.ru/my/agreement */
        // COMM = ['ym' => .035, 'tm' => .035, 'bc' => .035, 'wm' => .06, 'qw' => .06, 'tb' => .04],
        COMPONENTS = ['chatbot' => 100, 'stream' => 80, 'widget' => 80, 'cover' => 80, 'designer' => 60],
        DISCOUNTS = [2 => 3, 3 => 5, 10 => 7, 20 => 10, 30 => 15, 40 => 20, 100 => 25],
        PERIODS = [3 => .05, 6 => .1, 9 => .16, 12 => .2],
        MONTH = 2592000;

    /** @var Client */
    private Client $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    private function uid(array $params, array $socials): int
    {
        return (int) ($socials['vk'] ?? $params['uid'] ?? 0);
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
        $services = array_intersect_key($array, self::COMPONENTS);

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

    private function getPrice(array $features, ?array $u): array
    {
        $confirmation = $features['confirmation'];
        $pack = $features['pack'];

        $features = array_filter($features, static fn($k) => !in_array($k, ['pack','amount','confirmation','total','raw','ref']), 2);
        $periods = array_reverse(self::PERIODS, true);
        $ref = $u ? $u['available'] : 0;
        $amount = 0;
        $raw = 0;

        foreach ($features as $service => $data) {
            if ($service === 'designer' || $service === 'stream') {
                $pk = $data;

                $raw += self::COMPONENTS[$service] * $pk;
                $features[$service] = $pk;

                foreach ($periods as $p => $v) {
                    if ($pk >= $p) {
                        $pk *= (1 - $v);
                        break;
                    }
                }

                $amount += round(self::COMPONENTS[$service] * $pk);

            } else {
                $data = array_filter($data, static fn($k) => $k !== 'amount', 2);
                $c = count($data);

                $pk = round(array_sum($data) / $c);
                $raw += self::COMPONENTS[$service] * $c * $pk;

                foreach ($periods as $p => $v) {
                    if ($pk >= $p) {
                        $pk *= (1 - $v);
                        break;
                    }
                }

                $discount = 0;
                foreach (self::DISCOUNTS as $k => $v) {
                    if ($c >= $k) {
                        $discount = $v;
                    } else {
                        break;
                    }
                }

                $features[$service]['amount'] = self::COMPONENTS[$service] * $c * $pk;
                $features[$service]['amount'] *= (1 - ($discount / 100));
                $features[$service]['amount'] = round($features[$service]['amount']);

                $amount += $features[$service]['amount'];
            }
        }

        $total = $amount;

        switch (true) {
            case $ref >= $amount:
                $total = 0;
                break;
            case $ref < $amount:
                $total -= $ref;
                break;
        }

        return array_merge($features, compact('confirmation','pack','amount','total','raw','ref'));
    }

    /**
    * @throws Throwable
    */
    private function makeLink(YooClient $yookassa, array $features, int $user): ?CreatePaymentResponse
    {
        /**
        * db.payments.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600 })
        * db.payments.dropIndex("createdAt_1")
        * db.payments.getIndexes()
        */
        $features['createdAt'] = new UTCDateTime();

        $id = $this->client->app->payments->insertOne($features)->getInsertedId();
        $ref = $features['ref'] - ($features['amount'] - $features['total']);
        $total = in_array($user, self::OWNERS) ? 20.0 : $features['total'];

        return $yookassa->createPayment([
            'description' => 'Оплата функционала на сайте Netaggregator',
            'confirmation' => (array) $features['confirmation'],
            'capture' => true,

            'amount' => [
                'currency' => 'RUB',
                'value' => $total
            ],
            'metadata' => [
                'ref' => (float) $ref,
                'id' => (string) $id,
                'user' => $user
            ]
        ]);
    }

    private function makeZero(array $features, int $user): array
    {
        $available = $features['ref'] - ($features['amount'] - $features['total']);

        $this->client->app->utokens->updateOne(['userId' => $user], ['$set' => compact('available')]);
        if (!$doc = $this->client->app->subscribe->findOne(['uid' => $user], self::MAP)) {
            $doc = [];
        }

        $set = $this->union($doc, $this->extract($features));
        $set['amount'] = $features['total'];
        $set['uid'] = $user;

        $confirmation = [
            'acknowledged' => $this->client->app->subscribe
                ->updateOne(['uid' => $user], ['$set' => $set], ['upsert' => true])
                ->isAcknowledged()
        ];

        return compact('confirmation');
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $params = $request->getQueryParams();
        $body = $request->getParsedBody();
        $payment = (object) [];

        if (!isset($body['payment'])) {
            new JsonResponse($payment);
        }

        try {

            $array = array_filter(preg_split('/[a-z]+/', substr($body['payment'], 0, -2)));
            $json = implode(array_map(static fn($v) => chr($v ^ 3), $array));
            $features = json_decode($json, true, 512, JSON_THROW_ON_ERROR);

            if (($user = $this->uid(array_merge($params, $features), $socials))) {
                $u = $this->client->app->utokens->findOne(['userId' => $user], self::MAP);

                switch ($features['pack']) {
                    case 'custom':
                    case 'basic':
                        $payment = $this->makeLink(
                            $request->getAttribute(PaymentMiddleware::PAYMENT_PROVIDER)(in_array($user, self::OWNERS)),
                            $this->getPrice($features, $u),
                            $user
                        );
                        break;

                    case 'zero':
                        $payment = (object) $this->makeZero(
                            $this->getPrice($features, $u),
                            $user
                        );
                }
            }

        } catch (Throwable $e) {
            $payment = (object) [
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ];
        }

        return new JsonResponse($payment);
    }
}
