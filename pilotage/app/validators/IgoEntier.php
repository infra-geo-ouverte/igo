<?php

use Phalcon\Mvc\Model\Validator\Regex as Regex;

class IgoEntier extends Regex{
    
    /**
     * 
     * @param array $params {label, field}
     */
    function __construct($params){
        
        $message = '&laquo ' . $params['label'] . ' &raquo; doit être un entier.';
        
        parent::__construct(array(
            'field' => $params['field'],
            'pattern' => '/^\d{0,}$/',
            'message' => $message
        ));
    }
}
