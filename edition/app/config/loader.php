<?php

$loader = new \Phalcon\Loader();


/**
 * We're a registering a set of directories taken from the configuration file
 */
$loader->registerDirs(
    array(
        $config->application->edition->fieldsDir,
        $config->application->edition->utilDir,        
        $config->application->edition->servicesDir,        
        $config->application->edition->exemplesServicesDir,
        $config->application->edition->customServicesDir,
        $config->application->services->controllersDir
    )
)->register();
