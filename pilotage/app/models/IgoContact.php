<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoContact extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var integer
     */
    public $organisme_responsable_id;

    /**
     *
     * @var string
     */
    public $prenom;

    /**
     *
     * @var string
     */
    public $nom;
    
    public $poste;

    /**
     *
     * @var string
     */
    public $no_telephone;

    /**
     *
     * @var string
     */
    public $courriel;

    /**
     *
     * @var string
     */
    public $est_membre_acrigeo;

    /**
     *
     * @var string
     */
    public $remarque;

    /**
     *
     * @var string
     */
    public $date_modif;

    /**
     * Initialize method for model.
     */
    public function initialize() {
        //$nomprenom=$this->nom.", ".$this->prenom;
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoClasseEntite", "contact_id", NULL);
        $this->hasMany("id", "IgoOrganismeResponsable", "contact_id", NULL);
        $this->belongsTo("organisme_responsable_id", "IgoOrganismeResponsable", "id", NULL);
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
            'field' => 'prenom',
            'message' => 'Veuillez indiquer le prénom.'
        )));
            
        $this->validate(new IgoStringLength(array(
            'label' => 'Prénom',
            'field' => 'prenom',
            'max' => 50,
            'min' => 0
        )));
        
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
            'label' => 'Poste occupé',
            'field' => 'poste',
            'max' => 70,
            'min' => 0
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Téléphone',
            'field' => 'no_telephone',
            'max' => 30,
            'min' => 0
        )));
        
        if($this->courriel){
                                
            $this->validate(new IgoStringLength(array(
                'label' => 'Courriel',
                'field' => 'courriel',
                'max' => 100,
                'min' => 0
            )));
        
            $this->validate(new EmailValidator(array(
                'field' => 'courriel'
            )));
            
        }
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Remarque',
            'field' => 'remarque',
            'max' => 2000,
            'min' => 0
        )));

        return !$this->validationHasFailed();
    
    }
    
}
