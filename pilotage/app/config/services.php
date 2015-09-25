<?php

use Phalcon\DI\FactoryDefault;
use Phalcon\Mvc\View;
use Phalcon\Text;
use Phalcon\Mvc\Url as UrlResolver;
use Phalcon\Mvc\View\Engine\Volt as VoltEngine;
use Phalcon\Session\Adapter\Files as SessionAdapter;


date_default_timezone_set("America/Montreal");
/**
 * The FactoryDefault Dependency Injector automatically register the right services providing a full stack framework
 */
$di = new FactoryDefault();

/**
 * The URL component is used to generate all kind of urls in the application
 */
$di->set('url', function () use ($config) {
    $url = new UrlResolver();
    $url->setBaseUri($config->uri->pilotage);

    return $url;
}, true);

$di->set('config', function () use ($config) {
    return $config;
});
/**
 * Setting up the view component
 */
$di->set('view', function () use ($config) {

    $view = new igoView();
    $view->config = $config;
    
    $view->host=$config->mapserver->host;
    $view->baseUri=$config->uri->pilotage;
    $view->host_alias=$config->mapserver->host;
    $view->mapserver_path=$config->mapserver->mapserver_path;
    $view->setViewsDir($config->application->pilotage->viewsDir);

    $view->registerEngines(array(
        '.volt' => function ($view, $di) use ($config) {
			$volt = new VoltEngine($view, $di);
			$volt->setOptions(array(
				'compiledPath' => $config->application->pilotage->cacheDir,
				'compiledSeparator' => '_',
                                'compileAlways' => (isset($config->application->debug) && $config->application->debug ? true : false)
			));

			return $volt;
	},
        '.phtml' => 'Phalcon\Mvc\View\Engine\Php'
    ));
    

    return $view;
  }, true);


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
    
    $securityPlugin = new SecurityPlugin($di);
    $eventsManager->attach("dispatch", $securityPlugin);

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
        'dbname' => $config->database->dbname
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

/*
 * Création d'un cache de données court.
 */
$di->setShared('cache', function() {
    $front = new Phalcon\Cache\Frontend\Data(array(
						'lifetime' => 300
						));
    $cache = new Phalcon\Cache\Backend\Apc($front, array(
							 'prefix' => 'app-data'
							 ));

    return $cache;
});

/**
 * Start the session the first time some component request the session service
 */
$di->setShared('session', function () use ($config) {
    $cookieName = 'sessionIGO';
    $session = new SessionAdapter();

    if (isset($_COOKIE[$cookieName])) {
        $sessid = $_COOKIE[$cookieName];
        if (!preg_match('/^[a-zA-Z0-9,\-]{22,40}$/', $sessid)) {
            unset($_COOKIE[$cookieName]);
            setcookie($cookieName, '', time() - 3600, '/');
        }     
    } 
    session_name($cookieName);
    $session->start();

    return $session;
});

/**
 * Start the session the first time some component request the session service
 */
$di->set('flash', function () {
    $flash = new \Phalcon\Flash\Session(array(
        'error' => 'alert alert-danger',
        'success' => 'alert alert-success',
        'notice' => 'alert alert-info'
    ));

    return $flash;
});


$di->set('igo_tag', function () {
    $igo_tag = new IgoTag();
    return $igo_tag;
  }, true);

if(isset($config->application->authentification->module)){
    $authentificationModule = new $config->application->authentification->module;
    if($authentificationModule instanceof AuthentificationController){
        $di->set("authentificationModule", $authentificationModule);
    }else{
        error_log("Le module d'authentificaiton n'est pas une instance d'AuthentificationController");
    }
}else{
    $di->set("authentificationModule", null);
}

class igoView extends Phalcon\Mvc\View {

    public $config = null;

    public function ajouterJavascript($chemin, $estExterne){
        if($estExterne === true){
            print('<script src="' . $chemin . '" type="text/javascript"></script>'. "\n");
        }else{
            print('<script src="'. $this->config->application->baseUri . $chemin . "?version=" . $this->config->application->version . '" type="text/javascript"></script>'. "\n");
        }
    }

    public function ajouterCss($chemin, $estExterne){        
        if($estExterne === true){
            print('<link rel="stylesheet" href="' . $chemin . '" type="text/css"/>'. "\n");
        }else{
            print('<link rel="stylesheet" href="'. $this->config->application->baseUri . $chemin . "?version=" . $this->config->application->version .  '" type="text/css"/>'. "\n");
        }
    }
    
    public function ajouterImage($source, $alt, $estExterne){   
        if($estExterne === true){
            print('<img src="' . $source . '" alt="'. $alt . '">'. "\n");        
        }else {
            print('<img src="' . $this->config->application->baseUri . $source . '" alt="'. $alt . '">'. "\n");        
        }
    }
    
    public function ajouterBaseUri(){
        print($this->config->application->baseUri);
    }

    public function includeFrame($ctlName, $action) {  
        print('<iframe id="iframe" name="iframe" src="'.$ctlName.'/'.$action.'"  frameborder="0" marginwidth="0" scrolling="no" frameborder="0" seamless ></iframe>');
        print('<script>');
        print('$(document).ready(function() {');
        print('    $("#iframe").load(function() {');
        print('            $(this).contents().find(".container").css("padding",0).css("margin",0);');
        print('            $(this).height( $(this).contents().find("body").height() );');
        print('            $(this).width( $(this).contents().find(".container").width()-20 );');
        print('            $(this).contents().find("#search_entete").css("width",1170);');       
        print('        });');
        print('});');
        print('</script>');
    }
    
    
    public function includeCTL($ctlName, $action, $r_controller=null, $render = true) {        
	
        if (is_null($r_controller)){
            $r_controller=$this->getControllerName();
        }
        $ctlClass = Text::camelize($ctlName) . "Controller";
        $ctl = new $ctlClass;
        $retour = call_user_func(array($ctl, "initialize"));

        $this->setVar("r_controller", $r_controller);

        if (strpos($action,"?")>0){  
            $t_action=explode("?",$action); 
            $action=$t_action[0];

            $retour = call_user_func(array($ctl, $action . "Action"), $t_action[1]);
        } else {
            $retour = call_user_func(array($ctl, $action . "Action"));
        }
      

        if ($render) {
            $this->setRenderLevel(View::LEVEL_ACTION_VIEW);
            $this->render($ctlName, $action);
            $this->setRenderLevel(View::LEVEL_MAIN_LAYOUT);
        } else {
            $this->pick($ctlName . "/" . $action);
        }
    }

}
