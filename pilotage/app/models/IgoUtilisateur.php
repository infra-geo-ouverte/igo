<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;
use Phalcon\Mvc\Model\Validator\Uniqueness;

class IgoUtilisateur extends \Phalcon\Mvc\Model {

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
    public $date_modif;

    /**
     *
     * @var boolean
     */
    public $est_admin;

    /**
     *
     * @var boolean
     */
    public $est_pilote;

    /**
     *
     * @var array
     */
    //public $profils;

    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoUtilisateurProfil", "utilisateur_id",  array(
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
        
                
        $this->validate(new Uniqueness(array(
            "field"   => 'nom',
            "message" => "Le nom doit être unique."
        )));
        
        if($this->est_admin && $this->est_pilote){
            $this->appendMessage(new Phalcon\Mvc\Model\Message('Un utilisateur ne peut pas être administrateur et pilote.', ''));
        }

        return !$this->validationHasFailed();
    
    }
    
}
