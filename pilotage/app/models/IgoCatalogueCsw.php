<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoCatalogueCsw extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $url;

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
        $this->hasMany("id", "IgoClasseEntite", "catalogue_csw_id",  array(
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
            'field' => 'url',
            'message' => 'Veuillez indiquer l\'URL'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'URL',
            'field' => 'url',
            'max' => 500,
            'min' => 0
        )));
                
        return !$this->validationHasFailed();
    
    }
    
}
