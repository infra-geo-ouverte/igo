<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;
use Phalcon\Mvc\Model\Validator\Uniqueness;

class IgoPermission extends \Phalcon\Mvc\Model {

    public $id;
    public $profil_id;
    public $couche_id;
    public $groupe_id;
    public $attribut_id;
    public $est_lecture;
    public $est_analyse;
    public $est_ecriture;
    public $est_export;
    public $est_association;
    public $est_exclu;
    public $mf_layer_filtre;
    public $date_modif;

    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->belongsTo("couche_id", "IgoCouche", "id", array(
            'reusable' => true
        ));
        $this->belongsTo("profil_id", "IgoProfil", "id", array(
            'reusable' => true
        ));
        $this->belongsTo("groupe_id", "IgoGroupe", "id", array(
            'reusable' => true
        ));

        $this->belongsTo("attribut_id", "IgoAttribut", "id", array(
            'reusable' => true
        ));

        $this->addBehavior(new Timestampable(array(
            'beforeCreate' => array(
                'field' => 'date_modif',
                'format' => 'Y-m-d H:i:s'
            ),
            'beforeUpdate' => array(
                'field' => 'date_modif',
                'format' => 'Y-m-d H:i:s',
                'timezone' => 'Canada/Montreal'
            )
        )));
    }
    
    public function onContruct(){
              
        $this->est_lecture = false;
        $this->est_analyse = false;
        $this->est_ecriture = false;
        $this->est_export = false;
        $this->est_association = false;
        $this->est_exclu = false;
        
    }
    
    public function beforeValidation(){
                 
        $this->validate(new PresenceOf(array(
            'field' => 'profil_id',
           'message' => 'Veuillez indiquer le profil.'
        )));

        if(!$this->couche_id && !$this->groupe_id){
          
            $this->appendMessage(new Phalcon\Mvc\Model\Message('Veuillez sélectionner une couche ou un groupe de couche.', ''));
        }
        
        if($this->couche_id && $this->groupe_id){
          
            $this->appendMessage(new Phalcon\Mvc\Model\Message('Il faut spécifier une couche ou un groupe de couche, pas les deux!', ''));
        }

        $this->validate(new IgoStringLength(array(
            'label' => 'Mf Layer Filtre',
             'field' => 'mf_layer_filtre',
             'max' => 200,
             'min' => 0
        )));   

        return !$this->validationHasFailed();
    
    }
    
     public function validation(){
  
        //C'est un attribut
        if($this->attribut_id){
            $this->validate(new Uniqueness(array(
                "field"   => ['couche_id','profil_id', 'attribut_id'],
                "message" => "La combinaison profil et couche doit être unique"
            )));
            
        //C'est une couche
        }elseif($this->couche_id){
            $this->validate(new Uniqueness(array(
                "field"   => ['couche_id','profil_id', 'attribut_id'],
                "message" => "La combinaison profil et couche doit être unique"
            )));
            
        //C'est un groupe
        }else{
            $this->validate(new Uniqueness(array(
                "field"   => ['groupe_id','profil_id'],
                "message" => "La combinaison profil et groupe doit être unique"
            )));
        }
       
        return !$this->validationHasFailed();
     
   }    
   
    public function beforeCreate(){
       /* 
        //Initialiser les valeurs par défaut
        if(!isset($this->est_lecture)){
            $this->est_lecture = false;
        }

                
        if(!isset($this->est_analyse)){
            $this->est_analyse = false;
        }
                
        if(!isset($this->est_ecriture)){
            $this->est_ecriture = false;
        }
                
        if(!isset($this->est_export)){
            $this->est_export = false;
        }
                
        if(!isset($this->est_association)){
            $this->est_association = false;
        }
                
        if(!isset($this->est_exclu)){
            $this->est_exclu = false;
        }

*/
    }
}
