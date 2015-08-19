<?php

use Phalcon\Http\Response;

class ContextePermissionProfilController extends ControllerBase {
 
    public function initialize() {
        
        $this->accesAdminSeulement();
                
        $this->view->setVar('titre', "Donner toutes les permissions d'un contexte à un profil");
        parent::initialize();
    } 
    
    /**
     * Affichage du formulaire
     */
    public function formulaireAction($idContexte = 0) {
        
        $formulaire = new ContextePermissionProfilForm();
        $this->view->setVar('formulaire', $formulaire);

        $this->tag->setDefault('idContexte', $idContexte);
     
    }
    
    /**
     * Submit du formulaire
     */
    public function submitAction(){
        

        $formulaire = new ContextePermissionProfilForm();
        $this->view->setVar('formulaire', $formulaire);
        
        if(!$formulaire->isValid($_POST)){
            
            foreach ($formulaire->getMessages() as $message) {
                $this->flash->error($message);
            }
            $this->view->pick($this->ctlName . "/formulaire");
            return;
        }
        
        $idContexte = $this->request->getPost("idContexte");
        $idProfil = $this->request->getPost("idProfil");
        
        $nbDonnees = $this->donnerPermissionsContexteProfil($idContexte, $idProfil);  
        
        $pluriel = (count($nbDonnees)> 1) ? 's' : '';
        $nomProfil = $this->nomProfil($idProfil);

        $this->view->setVar('idProfil', $idProfil);
        $this->view->setVar('message', "$nbDonnees permission{$pluriel} ont été accordée{$pluriel} au profil {$nomProfil}.");
        
    }
    
    /**
     * Donne en lecture, à un profil, la permission sur toutes les couches et 
     * les groupes d'un contexte
     * @param type $idContexte
     * @param type $idProfil
     * @return ing Nombre de permissions données
     */
    function donnerPermissionsContexteProfil($idContexte, $idProfil){
        $nbPermissionsCrees = 0;
        
        $manager = new Phalcon\Mvc\Model\Transaction\Manager();
        $transaction = $manager->get();
        
        //Récupérer toutes les couches/groupes du contexte
        $igoCoucheContextes = IgoCoucheContexte::find('contexte_id = ' . $idContexte);

        foreach($igoCoucheContextes as $igoCoucheContexte){

            if(!$this->permissionExisteDeja($idProfil, 
                                            $igoCoucheContexte->couche_id, 
                                            $igoCoucheContexte->groupe_id)){
    
                //Créer la permission
                $igoPermission = new IgoPermission();
                $igoPermission->setTransaction($transaction);
                $igoPermission->profil_id = $idProfil;
                $igoPermission->couche_id = $igoCoucheContexte->couche_id;
                $igoPermission->est_lecture = true;
                $igoPermission->groupe_id = (!$igoCoucheContexte->couche_id ? $igoCoucheContexte->groupe_id : null);
                
                if(!$igoPermission->save()){
                  
                    $flash = $this->getDI()->getFlash();
                    foreach ($igoPermission->getMessages() as $message) {
                        $flash->error($message);
                    }
                    try{
                        $transaction->rollback("Un problème est survenu. Aucune permission n'a été accordée");
                    }catch(Phalcon\Mvc\Model\Transaction\Failed $e){
                        $flash->error($e->getMessage());
                    }
                    return false;
                }
                $nbPermissionsCrees++;
            }
        
        }
        $transaction->commit();
        return $nbPermissionsCrees;
    }    
      
    private function accesAdminSeulement(){
        global $application;
      
         if(!$application->getDI()->getSession()->get('info_utilisateur')->estAdmin){
   
            $response = new Response();
            $response->redirect("");
            $response->send();
        }
    }
    
    /**
     * Une permission sur le groupe ou la couche existe déjà pour le profil
     * @param int $idProfil
     * @param int $idCouche
     * @param int $idGroupe
     * @return bool
     */
    private function permissionExisteDeja($idProfil, $idCouche, $idGroupe){
        $conditions = array();
            $conditions[] = "profil_id = {$idProfil}";
            if($idCouche){
                $conditions[] = "couche_id = {$idCouche}";
            }
            if($idGroupe && !$idCouche){
                $conditions[] = "groupe_id = {$idGroupe}";
            }
            $conditions = implode(' AND ', $conditions);

            $igoPermission = IgoPermission::findFirst($conditions);
            return (bool)$igoPermission;
    }
    
    private function nomProfil($idProfil){
        $igoProfil = IgoProfil::findFirstById($idProfil);
        return $igoProfil ? $igoProfil->libelle : '';
    }
    
}
