<?php

/**
* Represents a string field.
* @see Field
*/
class StringField extends Field{
	
    /**
    * Defines the maximum length for the string field.
    * 
    * @var int 
    */
    public $maxLength;

    /**
    * @param string $name the name of the data field.
    * @param string $title the title of the data field. Will display in the client user interface.
    * @param boolean $editable Determines wether the field is editable or not.
    * @param boolean $mandatory Determines wether the field is mandatory or not.
    */
    function __construct($name, $title, $editable, $mandatory, $visible = true) {
        parent::__construct($name, $title, "string", $editable, $mandatory, $visible); 
    }	

    function Escape($connection, $value){
        $value = $connection->escapeString($value);  

//        if($value == "''"){
//                $value = "null";
//                return $value;
//        }
        if ($value== 'N.D.'){
            $value = "''";
        }

        return "{$value}";
    }
}