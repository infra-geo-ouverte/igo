<?php
$configArray = include dirname(__file__)."/../../../../specifique/config/config.php";
$config = new \Phalcon\Config($configArray);
$config->application->baseUri = $config->uri->navigateur;
return $config;
