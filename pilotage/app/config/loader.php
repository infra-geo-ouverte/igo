<?php

$loader = new \Phalcon\Loader();

/**
 * We're a registering a set of directories taken from the configuration file
 */
$loader->registerDirs(
    array(
    	$config->application->pilotage->controllersDir."MapfileParser/",
        $config->application->pilotage->controllersDir,
        $config->application->pilotage->controllersDir."CRUD/",
        $config->application->pilotage->pluginsDir,
        $config->application->pilotage->modelsDir,
        $config->application->pilotage->helpersDir,
        $config->application->pilotage->formsDir,
        $config->application->pilotage->validatorsDir,
        $config->application->services->controllersDir,
        $config->application->navigateur->libraryDir,
        $config->application->services->viewsDir
    )
)->register();
