<?php

use Phalcon\Mvc\Model\Validator\StringLength;

class IgoStringLength extends StringLength{
    
    /**
     * 
     * @param array $params {label, field, max, min}
     */
    function __construct($params){
        
        $max = $params['max'];
        $min = $params['min'];
        $messageMaximum = '';
        $messageMinimum = '';
        
        $label = isset($params['label']) ? $params['label'] : "champ";
        
        if($max){
            $messageMaximum = '&laquo; ' . $label . ' &raquo; dois faire '.  number_format($max, 0,',', ' ') . ' caractères au maximum.';
            
        }
        
        if($min){
            $messageMinimum = '&laquo; ' .$label . ' &raquo; dois faire '.  number_format($min, 0,',', ' ') . ' caractères au minimum.';
            
        }
       
        parent::__construct(array(
                'field' => $params['field'],
                'max' => $max,
                'min' => $min,
                'messageMaximum' => $messageMaximum,
                'messageMinimum' => $messageMinimum
            ));
        
    }
    
}
