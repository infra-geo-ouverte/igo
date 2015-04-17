<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;
use Phalcon\Mvc\Model\Validator\Regex;

class IgoGeometrieType extends \Phalcon\Mvc\Model {

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
    public $layer_type;
    
    /**
     *
     * @var string
     */
    public $geometrie_type;
    
    /**
     *
     * @var integer
     */
    public $mf_layer_meta_z_order;

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
        $this->hasMany("id", "IgoGeometrie", "geometrie_type_id",  array(
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
            'message' => 'Veuillez indiquer le nom'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Code LayerType',
            'field' => 'layer_type',
            'max' => 50,
            'min' => 0
        )));
        
        $this->validate(new Regex(array(
            'field' => 'geometrie_type',
            'pattern' => '/^[A-Z]$/',
            'message' => 'Vous devez choisir le type de géométrie.'
        )));
      
        
        $this->validate(new IgoEntier(array(
            'label' => 'Ordre Z',
            'field' => 'mf_layer_meta_z_order'
        )));   
      
        return !$this->validationHasFailed();
    
    }
    
    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema.'.igo_geometrie_type_id_seq';
    }
}
