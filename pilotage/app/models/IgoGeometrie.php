<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\Uniqueness as Uniqueness;
use Phalcon\Mvc\Model\Validator\Regex as Regex;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoGeometrie extends \Phalcon\Mvc\Model {
    
    const ACCES_LOCAL = 'L';
    const ACCES_DISTANT = 'D';
    
    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var integer
     */
    public $classe_entite_id;

    /**
     *
     * @var integer
     */
    public $geometrie_type_id;

    /**
     *
     * @var string
     */
    public $vue_defaut;

    /**
     *
     * @var string
     */
    public $date_chargement;
    
    /**
     *
     * @var integer
     */
    public $connexion_id;
    
    /**
     *
     * @var string
     */
    public $echelle_prod;
    
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
    
    public $ind_inclusion;
    
    /**
     *
     * @var string
     */
    public $mf_layer_data;
    
    /**
     *
     * @var string
     */
    public $mf_layer_projection;

    /**
     *
     * @var integer
     */
    public $mf_layer_meta_z_order;
    
    /**
     *
     * @var string
     */
    public $acces;

    public function save($saveMapFile = true, $data = NULL, $whiteList = NULL){
        $retour=parent::save($data, $whiteList);
        if($saveMapFile && $this->acces=="L"){
            foreach ($this->IgoCouche as $couche){
                 $couche->saveMapFile();
            }
        }
        return $retour;
    }
    
    
    public function delete(){
        foreach ($this->IgoCouche as $couche){
            $couche->delete();
        }
       foreach ($this->IgoAttribut as $attribut){
            $attribut->delete();
        }
        return parent::delete();
    }
    /**
     * Initialize method for model.
     */
    public function initialize() {
        
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        
        $this->hasMany("id", "IgoAttribut", "geometrie_id",  array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoCouche", "geometrie_id",  array(
            'reusable' => true
        ));
        $this->belongsTo("classe_entite_id", "IgoClasseEntite", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("connexion_id", "IgoConnexion", "id",  array(
            'reusable' => true
        ));
       
        $this->belongsTo("geometrie_type_id", "IgoGeometrieType", "id",  array(
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
            'field' => 'classe_entite_id',
            'message' => 'Vous devez choisir une classe d\'entiée.'
        )));

        $this->validate(new PresenceOf(array(
            'field' => 'geometrie_type_id',
            'message' => 'Vous devez choisir un type de géométrie.'
        )));
        
        $this->validate(new Regex(array(
            'field' => 'acces',
            'pattern' => '/^[D|L]$/',
            'message' => 'Vous devez choisir le point d\'accès.'
        )));
       
        /* Cette validation fait échouer la rétro... Trouver une meilleure validation...
       if(self::ACCES_LOCAL == $this->acces){

            $this->validate(new IgoStringLength(array(
                'field' => 'mf_layer_projection',
                'max' => 200,
                'min' => 1,
                'messageMaximum' => 'Le champ projectin doit faire 200 caractères au maximum.',
                'messageMinimum' => 'Vous devez spécifier la projection.'
            )));

        }
        */
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Projection',
            'field' => 'mf_layer_projection',
            'max' => 200,
            'min' => 0
         )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Vue',
            'field' => 'vue_defaut',
            'max' => 250,
            'min' => 0
         )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Échelle de production',
            'field' => 'echelle_prod',
            'max' => 50,
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
    
    public function validation(){
     
        return !$this->validationHasFailed();
    }
        
    

    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema.'.igo_geometrie_id_seq';
    }
    
  

}
