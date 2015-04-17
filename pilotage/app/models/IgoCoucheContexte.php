<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;
use Phalcon\Mvc\Model\Validator\Regex;
use Phalcon\Mvc\Model\Validator\Uniqueness;

class IgoCoucheContexte extends \Phalcon\Mvc\Model {
   public $id;

   
    public $contexte_id;
    public $couche_id;
    public $groupe_id;
    public $arbre_id;
    public $attribut_id;
    public $est_visible;
    public $est_active;
    public $est_exclu;
    public $ind_fond_de_carte;
    public $mf_layer_meta_name;
    public $mf_layer_meta_title;
    public $mf_layer_meta_group_title;
    public $mf_layer_meta_z_order;
    public $layer_a_order;
    public $mf_layer_class_def;
    public $date_modif;

    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->belongsTo("contexte_id", "IgoContexte", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("couche_id", "IgoCouche", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("groupe_id", "IgoGroupe", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("attribut_id", "IgoAttribut", "id",  array(
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
    
    public function onConstruct(){
       
            $this->est_active = false;
            $this->est_visible = false;
            $this->est_exclu = false;
       
    }
    
    public function beforeValidation(){

        $this->validate(new PresenceOf(array(
            'field' =>'contexte_id',
            'message' => 'Veuillez indiquer le contexte.'
         )));

        if(!$this->groupe_id){
            //$this->appendMessage(new Phalcon\Mvc\Model\Message('Veuillez sélectionner un groupe de couche.', ''));
        }
        
        $this->validate(new Regex(array(
            'field' => 'ind_fond_de_carte',
            'pattern' => '/^[D|O|N]$/',
            'message' => 'Sélectionner l\'indicateur de fond de carte'
        )));

        $this->validate(new IgoStringLength(array(
            'label' => 'Mf Layer Meta Name',
             'field' => 'mf_layer_meta_name',
             'max' => 150,
             'min' => 0
         )));     

        $this->validate(new IgoStringLength(array(
            'label' => 'Mf Layer Meta Title',
             'field' => 'mf_layer_meta_title',
             'max' => 150,
             'min' => 0
         )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Mf Layer Meta Group Title',
             'field' => 'mf_layer_meta_group_title',
             'max' => 200,
             'min' => 0
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Mf Layer Class Def',
             'field' => 'mf_layer_class_def',
             'max' => 500,
             'min' => 0
         )));
        /*
        if($this->layer_a_order){
            $this->validate(new Regex(array(
                'field' => 'layer_a_order',
                'pattern' => '/^[A-Z]$/',
                'message' => 'Veuillez indiquer l\'Ordre A'
            )));
        }
*/
       $this->validate(new IgoEntier(array(
            'label' => 'Ordre A',
            'field' => 'layer_a_order'
        )));   

        $this->validate(new IgoEntier(array(
            'label' => 'Ordre Z',
            'field' => 'mf_layer_meta_z_order'
        )));   

        //On soit choisir une couche ou un groupe de couche
        return !$this->validationHasFailed();
    
    }


    public function validation(){
  
            $this->validate(new Uniqueness(array(
                "field"   => ['couche_id','contexte_id', 'attribut_id'],
                "message" => "La combinaison profil et couche doit être unique"
            )));
 
  
        return !$this->validationHasFailed();
     
    }
    
    public function beforeCreate(){
        /*
        //Initialiser les valeurs par défaut
        if(!isset($this->est_active)){
            $this->est_active = false;
        }        
        
        if(!isset($this->est_visible)){
            $this->est_visible = false;
        }
                
        if(!isset($this->est_exclu)){
            $this->est_exclu = false;
        }
         * 
         */
    }
    
    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema.'.igo_couche_contexte_id_seq';
    }

}
