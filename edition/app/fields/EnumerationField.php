<?php

/**
* Represents an enumeration field.
* @see Field
*/
class EnumerationField extends Field{

    public $values = array();
    public $allowNew = false;
    public $newService = null;
    public $sameAs = null;
    public $sameAsText = null;

    /**
    * @param string $name the name of the data field.
    * @param string $title the title of the data field. Will display in the client user interface.
    * @param boolean $editable Determines wether the field is editable or not.
    * @param boolean $mandatory Determines wether the field is mandatory or not.
    */
    function __construct($name, $title, $editable, $mandatory) {
        parent::__construct($name, $title, "enumeration", $editable, $mandatory); 
    }

    function Escape($connection, $value){
        $value = $connection->escapeString($value);        
        
        if($value === ""){
            return "null";
        }
        return "{$value}";
    }

    public function IsValid($value){
        $valid = false;
        if(count($this->valeurs) === 0 && $value ===""){			
            return true;
        }		
        foreach($this->valeurs as $possible_value){
            if($possible_value['id'] == $value){
                $valid = true;
                break;
            }
        }
        return $valid;
    }
}