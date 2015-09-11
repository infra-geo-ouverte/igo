<?php

use Phalcon\Mvc\View;
use Phalcon\Text;
use Phalcon\Mvc\Model\Resultset\Simple as Resultset;
use Phalcon\Http\Request;


class IgoContexteController extends ControllerBase {
    
    function newAction($r_controller = null, $r_action = null, $r_id = null) {
      
        $mapserverConfiguration = $this->getDI()->getConfig()->mapserver;
        $onlineResource = $mapserverConfiguration->mapserver_path 
                            . $mapserverConfiguration->executable 
                            . $mapserverConfiguration->mapfileCacheDir 
                            . $mapserverConfiguration->contextesCacheDir 
                            . "{Code}.map";
 
        //Fournir la liste des contexte que l'utilisateur peut dupliquer
        $igoContextesQuilPossede = $this->igoContextesQuilPossede();
        $igoContextes = array();
        foreach($igoContextesQuilPossede as $igoContexte){
         
            $igoContextes[$igoContexte->id] = $igoContexte->nom . '(' . $igoContexte->code . ')';
              
        }
        $this->view->setVar('igoContextesQuilPossede', $igoContextes);
        
        $this->view->setVar("retour", "igo_contexte/search");
        
        $this->tag->setDefault("mf_map_projection", "32198");
        $this->tag->setDefault("mf_map_meta_onlineresource", $onlineResource);
        $this->tag->setDefault("generer_onlineresource", true);
    }
    
    
    function createAction($r_controller = null, $r_action = null, $r_id = null) {
      
        $mapServerConfig = $this->getDI()->getConfig()->mapserver;
        $fileName = $mapServerConfig->mapfileCacheDir . $mapServerConfig->contextesCacheDir . $this->request->getPost("code") . ".map";

        //Ne pas créer le contexte si il y en a déjà un avec le même code
        if(file_exists($fileName)) {
            $this->flash->error("Le fichier {$fileName} existe déjà!");
            return $this->dispatcher->forward(array(
                "controller" => $this->ctlName,
                "action" => "new",
                "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
            ));
        } 
        
        $idContexteADupliquer = $this->request->getPost('id_contexte_a_dupliquer');
        
        //On désire dupliquer un contexte
        if($idContexteADupliquer){
                
            if(!$this->peutDupliquerContexte($idContexteADupliquer)){
                $this->flash->error("Vous n'avez pas la permission de dupliquer le contexte {$idContexteADupliquer}.");
                return $this->dispatcher->forward(array(
                    "controller" => $this->ctlName,
                    "action" => "new",
                    "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
                ));
                
            }
        }
        
        $this->traiterCodeOnlineRessource();
        
        $igoContexte = new IgoContexte();
        $igoContexte->mode = $this->request->getPost("mode");
        $igoContexte->position = $this->request->getPost("position");
        $igoContexte->zoom = $this->request->getPost("zoom");
        $igoContexte->code = $this->request->getPost("code");
        $igoContexte->nom = $this->request->getPost("nom");
        $igoContexte->description = $this->request->getPost("description");
        $igoContexte->mf_map_def = $this->request->getPost("mf_map_def");
        $igoContexte->date_modif = $this->request->getPost("date_modif");
        $igoContexte->json = $this->request->getPost("json");
        $igoContexte->mf_map_projection = $this->request->getPost("mf_map_projection");
        $igoContexte->profil_proprietaire_id = $this->request->getPost("profil_proprietaire_id");
        
        if($igoContexte->profil_proprietaire_id == "") {
            $igoContexte->profil_proprietaire_id = null;
        }
        
        //Valider la sélection ou pas du profil propriétaire
        if(!$this->validationProfilProprietaire($igoContexte->profil_proprietaire_id, $messageErreurProfilProprietaire)){
            foreach($messageErreurProfilProprietaire as $message){
                $this->flash->error($message);    
            }
            return $this->dispatcher->forward(array(
                "controller" => $this->ctlName,
                "action" => "new",
                "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
              ));
        }
        
        $igoContexte->mf_map_meta_onlineresource = $this->request->getPost("mf_map_meta_onlineresource");
        
        $igoContexte->generer_onlineresource = $this->request->getPost("generer_onlineResource");
        
        try {
            if (!$igoContexte->save()) {

                foreach ($igoContexte->getMessages() as $message) {
                    $this->flash->error($message);
                }
         
                return $this->dispatcher->forward(array(
                    "controller" => $this->ctlName,
                    "action" => "new",
                    "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
                ));
            }
     
            if($idContexteADupliquer){
                $this->dupliquerContexte($idContexteADupliquer, $igoContexte->id);
            }
                
            $this->flash->success(Text::camelize(str_replace("igo_", "", $this->ctlName)) . " " . $igoContexte->id . " créé avec succès");
          
            
        } catch (\Exception $e) {
            $this->flash->error($e->getMessage());
            return $this->dispatcher->forward(array(
                "controller" => $this->ctlName,
                "action" => "new",
                "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
            ));
        }
    }
    
    /*
     * S'assurer que le profil propriétaire soit bien assigné
     * @param int $idProfil Id du profil fourni dans le formulaire
     * @param array $messages Messages d'erreur à retourner
     * return bool Est valide
     */
    private function validationProfilProprietaire($idProfil, &$messages){
        $messages = array();
        //L'utilisateur doit préciser le profil propriétaire
        if(!$this->getDI()->get('session')->get('info_utilisateur')->estAdmin){
            
            if(!$idProfil){
                $messages[] = "Vous devez spécifier quel est le profil propriétaire.";
                return false;
            }

            if(!$this->getDI()->get('session')->get('info_utilisateur')->aProfil($idProfil)){
                $messages[] = "Vous n'avez pas le droit d'assigner ce profil. Vous devez en être propriétaire ou être administrateur.";
                return false;
            }
        }
        return true;
    }
    
    /**
     * Fait une copie des associations igo_couche_contexte dans le contexte cible
     * @param int $idContexteSource
     * @param int $idContexteCible
     */
    private function dupliquerContexte($idContexteSource, $idContexteCible){
        
        //Récupérer les couchecontexte de la source
        $igoContexteSource = IgoContexte::findFirst($idContexteSource);
   
        $igoContexteSource->dupliquer($idContexteCible);
        
    }
    
    function mapfileAction($contexte_id, $profil_id = null, $utilisateur_id = null) {

        $igo_contexte = IgoContexte::findFirstByid($contexte_id);
        if (!$igo_contexte) {
            $this->flash->error("Contexte non-trouvé");

            return $this->dispatcher->forward(array(
                        "controller" => "igo_contexte",
                        "action" => "search"
            ));
        }
        
        $contexte = $igo_contexte->toArray();
        $couches = array();

        $contexte["wms_onlineresource"] = $this->view->host . $igo_contexte->mf_map_meta_onlineresource;

        if (is_numeric($igo_contexte->mf_map_projection)) {
            $contexte["mf_map_projection"] = "\"init=epsg:{$igo_contexte->mf_map_projection}\"";
        } else if (trim($igo_contexte->mf_map_projection) != '') {
            $contexte["mf_map_projection"] = $igo_contexte->mf_map_projection;
            if ($contexte["mf_map_projection"] <> "") {
                $contexte["mf_map_projection"] = str_replace('"', "\t\t\t", str_replace('" ', '\n ', $contexte["mf_map_projection"]));
            }
        }
        
        $contexteCouches = IgoVueContexteCoucheNavigateur::find(
            array(
                "conditions"=>"contexte_id=$contexte_id",
                "order"=>array("mf_layer_meta_group_title", "mf_layer_meta_title")                
            ));
        
        // Il faut trier les classes par mf_class_z_order, c'est impossible de
        // le faire avec l'orm ou encore avec le volt... Il faudrait étendre volt 
        // pour y ajouter une fonction usort, préférable d'utiliser la BD pour le sort...
        // http://docs.phalconphp.com/en/latest/reference/volt.html#extending-volt
        $couchesClasses = array();
        foreach($contexteCouches as $contexteCouche){
            $classes = IgoClasse::find(
                array(
                    "conditions"=>"couche_id=$contexteCouche->couche_id",
                    "order"=>array("mf_class_z_order"
                    )
                ));
            $couchesClasses[$contexteCouche->couche_id] = $classes;
        }
        
        $mapfileInclude = '';
        if(isset($this->config->mapserver->mapfileInclude)){  
            foreach($this->config->mapserver->mapfileInclude as $chemin){
                $mapfileInclude .=  Utils::fopen_file_get_contents($chemin);  
            } 
        }
        $this->view->mapfileInclude = $mapfileInclude;
        
        $this->view->couchesClasses = $couchesClasses;
        $this->view->contexteCouches = $contexteCouches;

        $this->view->contexte = $contexte;
        $this->view->preview = true;

        return array($contexte, $couches);
    }

    function saveMapFile($contexte_id) {
        $contexte = IgoContexte::findFirstById($contexte_id);
        if (!$contexte) {
            throw new Exception("Contexte inexistant");
        }
        $contexte->save(); 
     }
     
     function saveAction($r_controller = null, $r_action = null, $r_id = null) { 
        $this->traiterCodeOnlineRessource();
        
        //Valider la sélection ou pas du profil propriétaire
        if(!$this->validationProfilProprietaire($this->request->getPost("profil_proprietaire_id"), $messageErreurProfilProprietaire)){
            foreach($messageErreurProfilProprietaire as $message){
                $this->flash->error($message);    
            }
            
            return $this->dispatcher->forward(array(
                "controller" => $this->ctlName,
                "action" => "edit"
             ));
          
        }

         parent::saveAction($r_controller, $r_action);
         
     }
     
     function deleteAction($id, $r_controller = null, $r_action = null, $r_id = null) {

        $this->supprimerMapfile($id);

        parent::deleteAction($id, $r_controller, $r_action, $r_id);
    }

    /**
    * Supprimer le mapfile associé au contexte
    * @params int|string Id du contexte
    */
    function supprimerMapfile($idContexte){

        $igoContexte = IgoContexte::findFirst($idContexte);
        $mapServerConfig = $this->getDI()->getConfig()->mapserver;
        $fileName = $igoContexte->getMapfilePath();

        if (file_exists($fileName)) {
            unlink($fileName);
        }
    }
    
    /**
     * Récupère le mf_map_meta_onlineresource dans le formulaire 
     * et ajuste le code au besoin
     */
    private function traiterCodeOnlineRessource(){
      
        $onlineResource = $this->request->getPost("mf_map_meta_onlineresource");
        $code = $this->request->getPost("code");
        
        if (strpos($onlineResource, '{Code}') !== FALSE){
           
            $onlineResource = str_replace("{Code}", $code, $onlineResource);
            
        }
        
        $_POST['mf_map_meta_onlineresource'] = $onlineResource;
        
    }
    
    /**
     * Récupère la liste de igo_contexte dont l'utilisateur courant est 
     * propriétaire (un admin possède tous les contextes)
     * @return igoContexte[]
     */
    private function igoContextesQuilPossede(){
        $sql = '';
        if(!$this->getDI()->get('session')->get('info_utilisateur')->estAdmin){
            
            //Récupérer les profils de l'utilisateurs
            $profils = $this->getDI()->get('session')->get('info_utilisateur')->profils;
            if(!count($profils)){
                return false;
            }
            
            $idsProfils = array();
          
            foreach($profils as $profil){
                $idsProfils[] = $profil['id'];
            }
            $idsProfils = implode(',', $idsProfils);
            
            //Récupérer les contextes auquels ces profils donne droit
            $sql = "profil_proprietaire_id IN ($idsProfils)";
        }
        
        return IgoContexte::find($sql);
    }
    
    /**
     * Indique si l'utilisateur courant peut dupliquer le contexte
     * @param int $idContexte
     * return bool
     */
    private function peutDupliquerContexte($idContexte){
        
        if($this->getDI()->get('session')->get('info_utilisateur')->estAdmin){
            return true;
        }
        
        $contextes = $this->igoContextesQuilPossede();
        foreach($contextes as $contexte){
            if($contexte->id == $idContexte){
                die("$contexte->id == $idContexte");
                return true;
            }
        }
        return false;
    }

    function regenererAction(){

        $request = new Request();
        if($request->isPost()){

            //Faire le stock!
            $this->supprimerMapfileDeTousLesContextes();

            $this->flash->success("Les mapfiles de contextes ont bien été supprimés. Chaque mapfile sera regénéré lors de l'accès à son contexte.");

        }
    }

    /**
    * Supprime les mapfiles de tous les contextes
    */
    private function supprimerMapfileDeTousLesContextes(){

        //récupérer les mapfiles
        $igoContextes = IgoContexte::find();

        foreach($igoContextes as $igoContexte){

            $this->supprimerMapfile($igoContexte->id);

        }

    }

}
