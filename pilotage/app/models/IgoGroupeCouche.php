<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoGroupeCouche extends \Phalcon\Mvc\Model {

    public $id;
    public $groupe_id;
    public $couche_id;
   

    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
              $this->belongsTo("groupe_id", "IgoGroupe", "id", array(
            'reusable' => true
        ));
        $this->belongsTo("couche_id", "IgoCouche", "id", array(
            'reusable' => true
        ));
        
        $this->belongsTo("groupe_id", "IgoGroupe", "id", array(
            'reusable' => true
        )); 

    }
    
    public function beforeValidation(){

        $this->validate(new PresenceOf(array(
            'field' => 'groupe_id',
            'message' => 'Veuillez choisir un groupe.'
        )));
        
        $this->validate(new PresenceOf(array(
            'field' => 'couche_id',
            'message' => 'Veuillez choisir une couche.'
        )));
        
        if(!$this->validationHasFailed() && count(IgoGroupeCouche::find("groupe_id=" . $this->groupe_id . "and couche_id=" . $this->couche_id))){
            
            $this->appendMessage(new Phalcon\Mvc\Model\Message('Cette association groupe/couche existe déjà' . "groupe_id=" . $this->groupe_id . "and couche_id=" . $this->couche_id, ''));
        }

        return !$this->validationHasFailed();
    
    }

    
    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema . '.igo_groupe_couche_id_seq';
    }
    
    /**
     * Enlève d'un groupe les couches, sauf celles spécifiées
     * @param string $id_couches Liste des couches à conserver
     * @param int $groupe_id 
     * @param int $profil_id Id du profil propriétaire
     */
    public function enleverCouchesDuGroupe($id_couches, $groupe_id, $profil_id){
        
        if(!$id_couches){
            $id_couches = 0;
        }

        $estAdmin = $this->getDi()->getSession()->get("info_utilisateur")->estAdmin;
        if(!$estAdmin){
            
            //Récupérer la liste des profils du pilote
            $profils = $this->getDi()->getSession()->get("info_utilisateur")->profils;
            $liste_profil_id_utilisateur = array();
            foreach($profils as $profil) {
                array_push($liste_profil_id_utilisateur, $profil["id"]);
            }

            $liste_profil_id_utilisateur = implode(",", $liste_profil_id_utilisateur);
        }
        
        //Récupérer les couches qui sont à enlever du groupe
        $igoGroupeCouches = IgoGroupeCouche::find("groupe_id = {$groupe_id} AND couche_id NOT IN ({$id_couches})");
        
        foreach($igoGroupeCouches as $igoGroupeCouche){
            
            //L'utilisateur n'est pas un pilote
            if(!$estAdmin){
               
                //Vérifier si l'utilisateur à le droit d'enlever la couche du groupe
                $igoVuePermissionsPourCouches = IgoVuePermissionsPourCouches::findFirst("couche_id = {$igoGroupeCouche->couche_id} AND groupe_id = {$groupe_id} AND profil_id IN({$liste_profil_id_utilisateur})");
                
            }
            
            //L'utilisateur a le droit d'enlever la couche du groupe
            if($estAdmin || ($igoVuePermissionsPourCouches && $igoVuePermissionsPourCouches->est_association)){
             
                //Supprimer les associations de cette couche dans les contextes
                $igoCoucheContextes = IgoCoucheContexte::find("groupe_id = {$igoGroupeCouche->id}");
                foreach($igoCoucheContextes as $igoCoucheContexte){
                    if(!$igoCoucheContextes->delete()){
                        foreach ($igoCoucheContextes->getMessages() as $message) {
                            $this->flash->error($message);
                        }
                    }
              
                }

                if(!$igoGroupeCouche->delete()){
                        foreach ($igoGroupeCouche->getMessages() as $message) {
                            $this->flash->error($message);
                        }
                    }
                
            }
            
        }
     
    }
    
    /**
     * Ajoute au groupe les couches qui n'y sont pas déjà
     * @param type $id_couches 
     * @param type $groupe_id
     * @param type $profil_id Profil de l'utilisateur qui pose l'action
     */
    public function ajouterCouchesAuGroupe($id_couches, $groupe_id, $profil_id){

        if(!$id_couches){
            
            $id_couches = 0;
        }
        
        //Récupérer les couches qui ne sont pas déjà dans le groupe
        $sql = " NOT EXISTS(
                        SELECT id
                        FROM igo_groupe_couche AS gc
                        WHERE igo_couche.id = gc.couche_id
                            AND groupe_id = {$groupe_id}
                            AND couche_id IN ({$id_couches})
                    )
                    AND igo_couche.id IN ({$id_couches})";


        $igoCouches = IgoCouche::findByRawSql($sql);

        foreach($igoCouches as $igoCouche){
            
            //Ajouter la couche dans le groupe
            $igoGroupeCouche = new IgoGroupeCouche();
            $igoGroupeCouche->couche_id = $igoCouche->id;
            $igoGroupeCouche->groupe_id = $groupe_id;
            if(!$igoGroupeCouche->save()){
                foreach($igoGroupeCouche->getMessages() as $message){
                    echo $message;
                }
                die();
            }
            
        }
        
    }

}
