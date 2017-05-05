<?php

try {
    $config = include __DIR__ . "/../app/config/config.php";

    include __DIR__ . "/../app/config/loader.php";
    include __DIR__ . "/../app/config/services.php";

    include $config->application->services->dir . "fonctions.php";

    $app = new NavigateurApi();
    $app->setDI($di);

    $di->get('chargeurModules')->chargerApis($app);

    $app->get('/configuration/{configuration}', function ($configuration) use ($app){
        $app->configuration($configuration);
    });

    $app->get('/couche/{coucheId}', function ($coucheId) use ($app){
        $app->couche($coucheId);
    });

    $app->get('/contexteCode/{contexteCode}', function ($contexteCode) use ($app){
        $app->contexteCode($contexteCode);
    });

    $app->get('/contexte/{contexteId:[0-9]+}', function ($contexteId) use ($app) {
        $app->contexte($contexteId);
    });

    $app->map('/wms/{contexteId:[0-9]+}', function ($contexteId) use ($app){
        $app->wmsProxy($contexteId);
    })->via(['GET', 'POST']);

    $app->map('/service[/]?{service}', function ($service) use ($app) {
        $app->proxyNavigateur($service);
    })->via(['GET', 'POST']);

    $app->notFound(function () use ($app) {
        return $app->envoyerResponse(404, "Not Found", "Not Found");
    });

    $app->handle();

} catch (\Exception $e) {
    echo $e->getMessage();
}
