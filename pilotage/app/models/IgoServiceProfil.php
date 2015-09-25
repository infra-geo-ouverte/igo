<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoServiceProfil extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $profil_id;

    /**
     *
     * @var integer
     */
    public $service_id;

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
        $this->belongsTo("profil_id", "IgoProfil", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("service_id", "IgoService", "id",  array(
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
           'field' => 'profil_id',
           'message' => 'Veuillez indiquer le profil.'
        ))); 
        
        $this->validate(new PresenceOf(array(
           'field' => 'service_id',
           'message' => 'Veuillez indiquer le service.'
        )));
                
        return !$this->validationHasFailed();
    
    }
}
