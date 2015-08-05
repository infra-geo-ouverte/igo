<?php
use Phalcon\Db\Column as Column;
/**
* Represents a field.
* @abstract
*/
abstract class Field{
    /**
    * @var string 
    */
    public $propriete;
    /**
    * @var string 
    */	
    public $titre;
    /**
    * @var string 
    */	
    public $type;
    /**
    * @var boolean
    */	
    public $editable;
    /**
    * @var boolean
    */		
    public $obligatoire;

    public $messageErreurInvalide;
    
    public $visible;

    /**
    * @param string $name the name of the data field.
    * @param string $title the title of the data field. Will display in the client user interface.
    * @param string $type the type of data, Will be used by the client user interface to use the best control for the type.
    * @param boolean $editable Determines wether the field is editable or not.
    * @param boolean $mandatory Determines wether the field is mandatory or not.
    */
    function __construct($name, $title, $type, $editable, $mandatory, $visible = true) {
        $this->propriete = $name;
        $this->titre = $title;
        $this->type = $type;
        $this->editable = $editable;
        $this->obligatoire = $mandatory;		
        $this->visible = $visible;
    }

    abstract function Escape($connection, $value);

    public function IsValid($value, $fkId){
        return true;
    }

    public function GetInvalidErrorMessage(){
        if($this->messageErreurInvalide !== null)
            return $this->messageErreurInvalide;
        else
            return "Erreur avec le champ: {$this->titre}";
    }
    
    function getType(){
        return Column::TYPE_VARCHAR;
    }
}