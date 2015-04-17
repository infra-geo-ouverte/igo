<?php
use Phalcon\Db\Column as Column;
/**
* Represents a text field.
* @see Field
*/
class TextField extends Field{
    /**
    * @param string $name the name of the data field.
    * @param string $title the title of the data field. Will display in the client user interface.
    * @param boolean $editable Determines wether the field is editable or not.
    * @param boolean $mandatory Determines wether the field is mandatory or not.
    */
    function __construct($name, $title, $editable, $mandatory) {
        parent::__construct($name, $title, "texte", $editable, $mandatory); 
    }

    function Escape($connection, $value){
        $value = $connection->escapeString($value);
        return "{$value}";
    }
    
    function getType(){
        return Column::TYPE_TEXT;
    }
}