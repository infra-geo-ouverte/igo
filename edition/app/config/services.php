<?php
use Phalcon\DI\FactoryDefault;
use Phalcon\Mvc\Url as UrlResolver;
use Phalcon\Session\Adapter\Files as SessionAdapter;

/**
 * The FactoryDefault Dependency Injector automatically register the right services providing a full stack framework
 */
$di = new FactoryDefault();

/**
 * The URL component is used to generate all kind of urls in the application
 */
$di->set('url', function () use ($config) {
    $url = new UrlResolver();
    $url->setBaseUri($config->application->baseUri);
    return $url;
}, true);

$di->set('config', function () use ($config) {
    return $config;
});


$di->set('dispatcher', function() use($di){

    //Create/Get an EventManager
    $eventsManager = new Phalcon\Events\Manager();

    //Attach a listener
    $eventsManager->attach("dispatch", function($event, $dispatcher, $exception) {
        //The controller exists but the action not
        if ($event->getType() == 'beforeNotFoundAction') {
            $dispatcher->forward(array(
                'controller' => 'error',
                'action' => 'error404'
            ));
            return false;
        }
        //Alternative way, controller or action doesn't exist
        if ($event->getType() == 'beforeException') {
            switch ($exception->getCode()) {
                case Phalcon\Dispatcher::EXCEPTION_HANDLER_NOT_FOUND:
                case Phalcon\Dispatcher::EXCEPTION_ACTION_NOT_FOUND:
                    $dispatcher->forward(array(
                        'controller' => 'error',
                        'action' => 'error404'
                    ));      
                    return false;
            }
        }
    });
    
    $dispatcher = new Phalcon\Mvc\Dispatcher();

    //Bind the EventsManager to the dispatcher
    $dispatcher->setEventsManager($eventsManager);

    return $dispatcher;

}, true);


/**
 * Database connection is created based in the parameters defined in the configuration file
 */
$di->set('db', function () use ($config) {

    $adapter = '\\Phalcon\\Db\\Adapter\\Pdo\\' . $config->database->adapter;
    if ( ! class_exists($adapter)){
        throw new \Phalcon\Exception('Invalid database Adapter!');
    }
    
    $connection= new $adapter(array(
        'host' => $config->database->host,
        'username' => $config->database->username,
        'password' => $config->database->password,
        'dbname' => $config->database->dbname,
        "options" => array(
            PDO::ATTR_CASE => PDO::CASE_LOWER
        )
    ));
    return $connection;
});


$di->set('connexion', function() use($config){
    $adapter = '\\Phalcon\\Db\\Adapter\\Pdo\\' . $config->data->adapter;
    if ( ! class_exists($adapter)){
        throw new \Phalcon\Exception('Invalid database Adapter!');
    }

    $connection = new $adapter(array(
        'host' => $config->data->host,
        'username' => $config->data->username,
        'password' => $config->data->password,
        'dbname' => $config->data->dbname,
        "options" => array(
            PDO::ATTR_CASE => PDO::CASE_LOWER
        )        
    ));
    return $connection;
});


if($config->database->modelsMetadata == 'Apc'){
    $di->set('modelsMetadata', function() {   
        // Create a meta-data manager with APC
        $metaData = new \Phalcon\Mvc\Model\MetaData\Apc(array(
            "lifetime" => 86400,
            "prefix"   => "igo"
        ));
        return $metaData;   
    });
}else if($config->database->modelsMetadata == 'Xcache'){
    $di->set('modelsMetadata', function() {       
        $metaData = new Phalcon\Mvc\Model\Metadata\Xcache(array(
        'prefix' => 'igo',
        'lifetime' => 86400 //24h
        ));
    return $metaData;   
    });    
}

/**
 * Start the session the first time some component request the session service
 */
$di->setShared('session', function () use ($config) {
    $session = new SessionAdapter();
    session_name('sessionIGO');
    $session->start();
    return $session;
});


if(isset($config->application->authentificationModule)){
    $authentificationModule = new $config->application->authentificationModule;
    if($authentificationModule instanceof AuthentificationController){
        $di->set("authentificationModule", $authentificationModule);
    }else{
        error_log("Le module d'authentificaiton n'est pas une instance d'AuthentificationController");
    }
}else{
    $di->set("authentificationModule", null);
}
