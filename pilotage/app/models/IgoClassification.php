<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoClassification extends \Phalcon\Mvc\Model {


    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $nom;

    /**
     *
     * @var string
     */
    public $description;

    /**
     *
     * @var string
     */
    public $code_geonetwork;

    /**
     *
     * @var string
     */
    public $date_modif;

    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoClasseEntite", "classification_id",  array(
            'reusable' => true
        ));
         $this->addBehavior(new Timestampable(array(
            'beforeCreate' => array(
                'field' => 'date_modif',
                'format' => 'Y-m-d H:i:s'
            ),
             'beforeUpdate' => array(
                'field' => 'date_modif',
                'format' => 'Y-m-d H:i:s'
            )
        )));
    }
    
    
    public function beforeValidation(){
        
        $this->validate(new PresenceOf(array(
            'field' => 'nom',
            'message' => 'Veuillez indiquer le nom.'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Nom',
            'field' => 'nom',
            'max' => 50,
            'min' => 0
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Description cc',
            'field' => 'description',
            'max' => 2000,
            'min' => 0
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Code GeoNetwork',
            'field' => 'code_geonetwork',
            'max' => 50,
            'min' => 0
        )));
      
        return !$this->validationHasFailed();
    
    }
    
}
