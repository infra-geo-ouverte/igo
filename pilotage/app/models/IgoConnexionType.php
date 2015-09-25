<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\Regex;

class IgoConnexionType extends \Phalcon\Mvc\Model {

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
    public $connexion_type;
    public $ind_vue;
    public $ind_data;
    public $ind_projection;
      /**
     *
     * @var string
     */
    public $geometrie_type;
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
        $this->hasMany("id", "IgoConnexion", "connexion_type_id",  array(
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
            'label' => 'Code LayerType??',
            'field' => 'connexion_type',
            'max' => 50,
            'min' => 0
        )));
        
        $this->validate(new Regex(array(
            'field' => 'geometrie_type',
            'pattern' => '/^[A-Z]$/',
            'message' => 'Vous devez choisir le type de géométrie.'
        )));
        
 
        return !$this->validationHasFailed();
    }
    
    
    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema.'.igo_connexion_type_id_seq';
    }
}
