<?php
use Phalcon\Db\Column as Column;
class BooleanField extends Field{
    public $values = null;

    /**
    * @param string $name the name of the data field.
    * @param string $title the title of the data field. Will display in the client user interface.
    * @param boolean $editable Determines wether the field is editable or not.
    * @param boolean $mandatory Determines wether the field is mandatory or not.
    */
    function __construct($name, $title, $editable, $mandatory) {
        parent::__construct($name, $title, "enumeration", $editable, $mandatory); 
        $this->valeurs = $this->GetOuiNon();
    }

    private function GetOuiNon(){
        $values = array();
        $values[0] = array();
        $values[0]["id"] = true;
        $values[0]["value"] = "oui";
        $values[1] = array();
        $values[1]["id"] = false;
        $values[1]["value"] = "non";
        return $values;
    }

    function Escape($connection, $value){
       
        if($value === "oui" || $value === true){
            return 'true';
        }else if($value === false){
            return 'false';
        }
        
        
        $value = $connection->escapeString($value);
        if($value === ""){
            return "null";
        }
        
        return "{$value}";
    }    
    
    function getType(){
        return Column::TYPE_BOOLEAN;
    }
}
