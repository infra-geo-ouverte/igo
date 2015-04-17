<?php
use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoOrganismeResponsable extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $acronyme;

    /**
     *
     * @var string
     */
    public $nom;
    
    public function getOrganisme(){
        return $organisme;
}

    /**
     *
     * @var string
     */
    public $url;

    /**
     *
     * @var integer
     */
    public $contact_id;

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
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoClasseEntite", "organisme_responsable_id",  array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoContact", "organisme_responsable_id",  array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoSourceEntite", "organisme_responsable_id",  array(
            'reusable' => true
        ));
        $this->belongsTo("contact_id", "IgoContact", "id",  array(
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
            'message' => 'Veuillez indiquer l\'organisme'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Organisme',
            'field' => 'nom',
            'max' => 100,
            'min' => 0
        )));
        
        
        $this->validate(new PresenceOf(array(
            'field' => 'acronyme',
            'message' => 'Veuillez indiquer l\'acronyme'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Acronyme',
            'field' => 'acronyme',
            'max' => 10,
            'min' => 0
        )));

        
        $this->validate(new IgoStringLength(array(
            'label' => 'URL',
            'field' => 'url',
            'max' => 500,
            'min' => 0
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Remarque',
            'field' => 'remarque',
            'max' => 2000,
            'min' => 0
        )));
                
        return !$this->validationHasFailed();
    
    }
    
}
