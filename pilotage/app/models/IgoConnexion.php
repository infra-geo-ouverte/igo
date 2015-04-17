<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoConnexion extends \Phalcon\Mvc\Model {

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
    public $connexion;

    /**
     *
     * @var string
     */
    public $connexion_type_id;

    /**
     *
     * @var string
     */
    public $date_modif;

    public function save($saveMapFile = true, $data = NULL, $whiteList = NULL){
        $retour=parent::save($data, $whiteList);
        if($saveMapFile && $this->IgoGeometrie->acces=="L"){
            foreach ($this->IgoGeometrie->IgoCouche as $couche){
                 $couche->saveMapFile();
            }
        }
        return $retour;
    }
    
    
    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->belongsTo("connexion_type_id", "IgoConnexionType", "id",  array(
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
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Nom',
            'field' => 'nom',
            'max' => 50,
            'min' => 0
        )));
        
                
        $this->validate(new IgoStringLength(array(
            'label' => 'Connexion',
            'field' => 'connexion',
            'max' => 2000,
            'min' => 0
        )));
        
        $this->validate(new PresenceOf(array(
            'field' => 'connexion_type_id',
            'message' => 'Vous devez choisir le type de connexion.'
        )));
 
        return !$this->validationHasFailed();
    }

    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema.'.igo_connexion_id_seq';
    }

}
