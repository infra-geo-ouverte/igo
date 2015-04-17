<?php
        apache_setenv('no-gzip', 1);
        ini_set('zlib.output_compression', 0);
        ini_set('implicit_flush', 1);
        ini_set('output_buffering', "off");
error_reporting(E_ALL);
try {    
    $config = include __DIR__ . "/../app/config/config.php";
    include __DIR__ . "/../app/config/loader.php";
    include __DIR__ . "/../app/config/services.php";
    $application = new \Phalcon\Mvc\Application($di);
    echo $application->handle()->getContent();


} catch (\Exception $e) {
    echo $e->getMessage();
}
