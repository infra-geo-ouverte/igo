<?php
use Phalcon\Db\Column as Column;
/**
* Represents an integer field.
* @see Field
*/
class IntegerField extends Field{

    /**
    * Defines the maximum value for the integer field.
    * @var int 
    */
    public $maxValue;

    /**
    * @param string $name the name of the data field.
    * @param string $title the title of the data field. Will display in the client user interface.
    * @param boolean $editable Determines wether the field is editable or not.
    * @param boolean $mandatory Determines wether the field is mandatory or not.
    */
    function __construct($name, $title, $editable, $mandatory, $visible = true) {
        
        parent::__construct($name, $title, "integer", $editable, $mandatory, $visible); 
    }

    function Escape($connection, $value){
        $value = $connection->escapeString($value);
        if($value == ""){
                $value = "null";
        }
        return $value;
    }
    
    function getType(){
        return Column::BIND_PARAM_INT;
    }
}