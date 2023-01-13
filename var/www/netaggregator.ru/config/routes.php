<?php declare(strict_types=1);

// use Psr\Container\ContainerInterface;
// use Zend\Expressive\MiddlewareFactory;
use Zend\Expressive\Application;

/**
* Setup routes with a single request method:
*
* $app->get('/', App\Handler\HomePageHandler::class, 'home');
* $app->post('/album', App\Handler\AlbumCreateHandler::class, 'album.create');
* $app->put('/album/{id}', App\Handler\AlbumUpdateHandler::class, 'album.put');
* $app->patch('/album/{id}', App\Handler\AlbumUpdateHandler::class, 'album.patch');
* $app->delete('/album/{id}', App\Handler\AlbumDeleteHandler::class, 'album.delete');
*
* Or with multiple request methods:
*
* $app->route(
*     '/contact',
*     App\Handler\ContactHandler::class,
*     ['GET', 'POST', ...],
*     'contact'
* );
*
* or:
*
* $app->route(
*     '/contact',
*     App\Handler\ContactHandler::class,
*     Zend\Expressive\Router\Route::HTTP_METHOD_ANY,
*     'contact'
* );
*
* Or handling all request methods:
*
* $app->route('/contact', App\Handler\ContactHandler::class)
*     ->setName('contact');
*/
return static function(Application $app /*, MiddlewareFactory $factory, ContainerInterface $c */): void
{
    // AUTHORIZE -----------------------------------------------------------

    $app->get('/vk/token',    App\Handler\StandaloneHandler::class, 'auth.std');
    $app->get('/auth/group',  App\Handler\GroupAuthHandler::class, 'auth.group');

    $app->get('/{act}/{srv}', App\Handler\UserAuthHandler::class, 'auth.user')
        ->setOptions(['tokens' => ['act' => 'login|logout','srv' => '\w{2}']]);

    $app->get('/ref/{id}', App\Handler\ReferralsHandler::class, 'set.ref')
        ->setOptions(['tokens' => ['id' => '\d+']]);

    // CSP-REPORTS ---------------------------------------------------------

    $app->any('/api/scp/reports', App\Handler\CspReportsHandler::class, 'csp.reports');

    // RSS-PROXY -----------------------------------------------------------

    $app->get('/api/get/channel', App\Handler\RssProxyHandler::class, 'rss.proxy');

    // CONTROLS ------------------------------------------------------------

    $app->post('/vk/events', App\Handler\EventsHandler::class, 'api.events');

    $app->post('/api/settings', App\Handler\SettingsHandler::class, 'api.settings');
    $app->post('/api/setrules', App\Handler\SetRulesHandler::class, 'api.setrules');

    $app->get('/api/currency', App\Handler\CurrencyHandler::class, 'api.currency');
    $app->get('/api/corsoutwit', App\Handler\CorsOutwitHandler::class, 'api.cors');
    $app->get('/api/traffic', App\Handler\TrafficHandler::class, 'api.traffic');
    $app->post('/api/transfer', App\Handler\TransferServerHandler::class, 'api.transfer');
    $app->post('/api/bypass', App\Handler\BypassApiHandler::class, 'api.bypass');

    $app->post('/api/remove/template', App\Handler\RemoveTemplateHandler::class, 'api.deltmpl');
    $app->post('/api/save/template', App\Handler\SaveTemplateHandler::class, 'api.savetmpl');
    $app->post('/api/get/templates', App\Handler\GetTemplatesHandler::class, 'api.gettmpl');
    $app->post('/api/mailing/state', App\Handler\MailingState::class, 'api.mailingstate');

    $app->post('/api/stream/reset', App\Handler\StatClearHandler::class, 'api.streamclear');

    // $app->post('/api/setquery', App\Handler\SetQueryHandler::class, 'api.setquery');
    // $app->post('/api/stoplist', App\Handler\StopListHandler::class, 'api.stoplist');
    // $app->post('/api/statclear', App\Handler\StatClearHandler::class, 'api.statclear');
    // $app->post('/api/get/gtokens', App\Handler\GroupTokensHandler::class, 'api.gtokens');

    $app->get('/api/get/news', App\Handler\GetNewsHandler::class, 'api.newslist');
    $app->post('/api/chat/save', App\Handler\ChatHandler::class, 'api.chatsave');
    $app->get('/api/chat/list', App\Handler\ChatHandler::class, 'api.chatlist');

    $app->delete('/api/cover', App\Handler\CoverHandler::class, 'api.coverremove');
    $app->put('/api/cover', App\Handler\CoverHandler::class, 'api.coversave');
    $app->get('/api/cover', App\Handler\CoverHandler::class, 'api.coverlist');

    $app->post('/api/import/subscribers', App\Handler\ImportSubscribersHandler::class, 'api.import');

    $app->get('/api/cover/templates', App\Handler\CoverTemplatesHandler::class, 'api.cover.templates');
    $app->post('/api/cover/timerange', App\Handler\TimeRangeHandler::class, 'api.cover.timerange');
    $app->post('/api/cover/install', App\Handler\CoverInstallHandler::class, 'api.coverinstall');
    $app->post('/api/cover/copy', App\Handler\CoverCopyHandler::class, 'api.covercopy');
    $app->post('/api/cover/json', App\Handler\CoverJsonHandler::class, 'api.coverjson');

    $app->post('/api/template/save', App\Handler\TemplateSaveHandler::class, 'api.templatesave');
    $app->post('/api/template/tags', App\Handler\TemplateTagsHandler::class, 'api.templatetags');
    // $app->get('/api/cover/template', App\Handler\CoverTemplateHandler::class, 'api.cover.template');
    // $app->get('/api/cover/struct', App\Handler\CoverStructsHandler::class, 'api.coverstruct');

    $app->get('/api/donat/accounts', App\Handler\DonatAccounts::class, 'api.donat');
    // $app->post('/api/donat/set', App\Handler\DonatSet::class, 'api.donat.set');

    // $app->get('/api/weather/cities', App\Handler\WeatherCitiesHandler::class, 'api.weather.cities');
    $app->post('/api/widget/update', App\Handler\WidgetUpdate::class, 'api.widget.upd');
    $app->post('/api/groups/get', App\Handler\GetGroupsHandler::class, 'api.getgroups');
    $app->post('/api/set/gtoken', App\Handler\SetGTokenHandler::class, 'api.gtoken');

    /* $app->post('/api/uploadcover/{id}', App\Handler\UploadCover::class, 'api.uploadcover')
        ->setOptions(['tokens' => ['id' => '\d+']]); */

    // COVID -------------------------------------------------------------

    // $app->any('/api/covid/update', App\Handler\CovidUpdate::class, 'api.covid.upd');

    // PAYMENT -------------------------------------------------------------

    $app->post('/api/payment/acknowledge', App\Handler\YKPaymentAcknowledgeHandler::class, 'payment.acknowledge');
    $app->post('/api/payment/trial', App\Handler\YKPaymentTrialHandler::class, 'payment.trial');
    $app->post('/api/payment/create', App\Handler\YKPaymentHandler::class, 'payment.create');

    $app->route(
        '/api/payment/notifications',
        App\Handler\YKPaymentNotificationsHandler::class,
        ['GET', 'POST'],
        'payment.notif'
    );
};
