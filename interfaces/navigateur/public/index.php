<?php
use IGO\Modules;

error_reporting(E_ALL);

try {
    
    $config = include __DIR__ . "/../app/config/config.php";
    include __DIR__ . "/../app/config/loader.php";
    include __DIR__ . "/../app/config/services.php";
    $application = new \Phalcon\Mvc\Application($di);
 
 	$application->registerModules($di->get('chargeurModules')->obtenirDefinitionModules());
    echo $application->handle()->getContent();

} catch (\Exception $e) {
    echo $e->getMessage();    
}
 
 
