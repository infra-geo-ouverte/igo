<?php
$configArray = include "../../config/config.php";
$config = new \Phalcon\Config($configArray);
$config->application->baseUri = $config->uri->pilotage;
$config->application->authentification->permettreAccesAnonyme = false;
$config->application->authentification->activerSelectionRole = false;
return $config;
