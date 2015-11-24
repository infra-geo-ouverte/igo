<?php

namespace IGO\Modules;
use Phalcon\Logger\Adapter\File as FileAdapter;

class Logger extends \Phalcon\Di\Injectable {

	private $logFile;

    public function __construct($pathLogFile, $debug) {
        if((file_exists($pathLogFile) && is_writable($pathLogFile)) || (!file_exists($pathLogFile) && is_writable(dirname($pathLogFile)))){
    		$this->logFile = new FileAdapter($pathLogFile);
    	} else if($debug){
    		http_response_code(500);
            die("Le chemin vers le log n'existe pas ou n'est pas accessible en &eacute;criture.");
    	}
  	}

    public function logException($exception) {
    	if(isset($this->logFile)){
    		$this->logFile->error($exception->getMessage() . PHP_EOL . $exception->getTraceAsString());
    	}
    }

    public function logMessage($message) {
    	if(isset($this->logFile)){
        	$this->logFile->log($message);
        }
    }

    public function logErreur($erreur) {
        if(isset($this->logFile)){
        	$this->logFile->error($erreur);
        }
    }
}
