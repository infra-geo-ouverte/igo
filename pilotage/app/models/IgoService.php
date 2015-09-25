<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;

class IgoService extends \Phalcon\Mvc\Model {

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
    public $wsdl;

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
        $this->hasMany("id", "IgoServiceProfil", "service_id",  array(
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
                 
        $validator->add('profil_id', new PresenceOf(array(
           'message' => 'Veuillez indiquer le profil.'
        ))); 
        
        $validator->add('service_id', new PresenceOf(array(
           'message' => 'Veuillez indiquer le service.'
        )));
                
        return !$this->validationHasFailed();
    
    }
}
