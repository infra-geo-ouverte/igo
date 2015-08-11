<?php

$loader = new \Phalcon\Loader();

/**
 * We're a registering a set of directories taken from the configuration file
 */

$dirs = array(
    $config->application->navigateur->controllersDir,
    $config->application->navigateur->modelsDir,
    $config->application->navigateur->libraryDir,
    $config->application->navigateur->pluginsDir
);
                
if(isset($config->application->pilotage)){
        array_push($dirs, $config->application->pilotage->controllersDir);
        array_push($dirs, $config->application->pilotage->controllersDir.'CRUD/');
        array_push($dirs, $config->application->pilotage->modelsDir);
        array_push($dirs, $config->application->pilotage->validatorsDir);
}

if(isset($config->application->services)){
        array_push($dirs, $config->application->services->controllersDir);
        array_push($dirs, $config->application->services->viewsDir);
}

$loader->registerNamespaces(
    array(
        'IGO\Modules' => $config->application->services->dir . '/modules/'
    )
);

$loader->registerDirs($dirs)->register();
