<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;
use Phalcon\Mvc\Model\Validator\Uniqueness;

class IgoProfil extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $libelle;
    
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
     * @var integer
     */
    public $profil_proprietaire_id;
   
    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoPermission", "profil_id",  array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoServiceProfil", "profil_id",  array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoUtilisateurProfil", "profil_id",  array(
            'reusable' => true
        ));
        
        $this->belongsTo("profil_proprietaire_id", "IgoProfil", "id");
 
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
           'field' => 'libelle',
           'message' => 'Veuillez indiquer le libellé.'
        )));
        
        $this->validate(new PresenceOf(array(
            'field' => 'nom',
           'message' => 'Veuillez indiquer le nom.'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Nom',
             'field' => 'nom',
             'max' => 200,
             'min' => 0
        )));
        
        $this->validate(new Uniqueness(array(
            "field"   => 'nom',
            "message" => "Le nom de profil doit être unique."
        )));
        

        $info_u  = $this->getDi()->getSession()->get("info_utilisateur");
        $profils = $this->getDi()->getSession()->get("profils");
        if(!$info_u->estAdmin) {
            if(count($profils) == 0) {
                $this->appendMessage(new \Phalcon\Mvc\Model\Message("Vous n'avez pas de profils.", ''));
                return false;
            }
 
            if(is_null($this->profil_proprietaire_id)) {
                $this->appendMessage(new \Phalcon\Mvc\Model\Message("Veuillez indiquer le profil propriétaire.", ''));
                return false;
            }

        }

        //On soit choisir une couche ou un groupe de couche
        return !$this->validationHasFailed();
    }

    public static function findAllProfils() {
        $profils = \Phalcon\DI::getDefault()->getSession()->get("info_utilisateur")->profils;
        $profil_ids = array();
        
        if(\Phalcon\DI::getDefault()->getSession()->get("info_utilisateur")->estAdmin){
            $sql = "SELECT id, libelle FROM igo_profil";
        }else if( count($profils) > 0){
            foreach($profils as $profil) {
                array_push($profil_ids, $profil["id"]);
            }
            $str = implode(',', $profil_ids);
            $sql = "SELECT id, libelle FROM igo_profil WHERE id in ($str)";                        
        }else{
            $sql = "SELECT id, libelle FROM igo_profil WHERE id is null";                        
        }
        $igo_profils = new IgoProfil();

        return new \Phalcon\Mvc\Model\Resultset\Simple(null,
                $igo_profils,
                $igo_profils->getReadConnection()->query($sql)
                );
    }
    
    // Fonction qui retourne tous les sous profils
    // Qui ont le profil propriétaire ID correspondant.
    public static function findProfilsByProfilsProprietaires() {
        $profils = \Phalcon\DI::getDefault()->getSession()->get("info_utilisateur")->profils;
        $profils_proprietaires_ids = array();

        foreach($profils as $profil) {
            array_push($profils_proprietaires_ids, $profil["id"]);
        }

        $str = implode(',', $profils_proprietaires_ids);
        $sql = "SELECT id, libelle FROM igo_profil WHERE profil_proprietaire_id IN ($str)";

        $igo_profils = new IgoProfil();

        return new \Phalcon\Mvc\Model\Resultset\Simple(null,
                                                       $igo_profils,
                                                       $igo_profils->getReadConnection()->query($sql)
                                                       );
    }
}