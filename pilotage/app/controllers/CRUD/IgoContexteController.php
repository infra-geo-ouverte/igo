<?php

use Phalcon\Mvc\View;
use Phalcon\Text;
use Phalcon\Mvc\Model\Resultset\Simple as Resultset;

class IgoContexteController extends ControllerBase {

    
    public function newAction($r_controller = null, $r_action = null, $r_id = null) {
        
        //parent::newAction($r_controller, $r_action, $r_id);
        $mapserverConfiguration = $this->getDI()->getConfig()->mapserver;
        $onlineResource = $mapserverConfiguration->mapserver_path . $mapserverConfiguration->executable . $mapserverConfiguration->mapfileCacheDir . $mapserverConfiguration->contextesCacheDir . "{Code}.map";
                
        $this->view->setVar("retour", "igo_contexte/search");
        
        $this->tag->setDefault("mf_map_projection", "32198");
        $this->tag->setDefault("mf_map_meta_onlineresource", $onlineResource);
        $this->tag->setDefault("generer_onlineresource", true);
    }
    
    
    public function createAction($r_controller = null, $r_action = null, $r_id = null) {
        $mapServerConfig = $this->getDI()->getConfig()->mapserver;
        $fileName = $mapServerConfig->mapfileCacheDir . $mapServerConfig->contextesCacheDir . $this->request->getPost("code") . ".map";

        if(file_exists($fileName)) {
            $this->flash->error("le fichier {$fileName} existe déjà!");
            return $this->dispatcher->forward(array(
                "controller" => $this->ctlName,
                "action" => "new",
                "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
            ));
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
        // Si le contexte est vide on change la string "" à null.
        $igoContexte->profil_proprietaire_id = $this->request->getPost("profil_proprietaire_id");
        
        if($igoContexte->profil_proprietaire_id == "") {
            $igoContexte->profil_proprietaire_id = null;
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
            } else {
                $this->flash->success(Text::camelize(str_replace("igo_", "", $this->ctlName)) . " " . $igoContexte->id . " créé avec succès");
            }
        } catch (\Exception $e) {
            $this->flash->error($e->getMessage());
            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "new",
                        "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
            ));
        }
    }
    
    public function mapfileAction($contexte_id, $profil_id = null, $utilisateur_id = null) {

        $igo_contexte = IgoContexte::findFirstByid($contexte_id);
        if (!$igo_contexte) {
            $this->flash->error("Contexte non-trouvé");

            return $this->dispatcher->forward(array(
                        "controller" => "igo_contexte",
                        "action" => "search"
            ));
        }
        
        $contexte = $igo_contexte->toArray();

        $contexte["wms_onlineresource"] = $this->view->host . $igo_contexte->mf_map_meta_onlineresource;

        if (is_numeric($igo_contexte->mf_map_projection)) {
            $contexte["mf_map_projection"] = "\"init=epsg:" . $igo_contexte->mf_map_projection . "\"";
        } else if (trim($igo_contexte->mf_map_projection) != '') {
            $contexte["mf_map_projection"] = $igo_contexte->mf_map_projection;
            if ($contexte["mf_map_projection"] <> "") {
                $contexte["mf_map_projection"] = str_replace('"', "\t\t\t", str_replace('" ', '\n ', $contexte["mf_map_projection"]));
            }
        }
        
        $contexteCouches = IgoVueContexteCoucheNavigateur::find(
            array(
                "conditions"=>"contexte_id=$contexte_id",
                //"order"=>array("mf_layer_meta_z_order")
                "order"=>array("mf_layer_meta_group_title", "mf_layer_meta_title")                
            ));
        
        
        
        // Il faut trier les classes par mf_class_z_order, c'est impossible de
        // le faire avec l'orm ou encore avec le volt... Il faudrait étendre volt 
        // pour y ajouter une fonction usort, préférable d'utiliser la BD pour le sort...
        // http://docs.phalconphp.com/en/latest/reference/volt.html#extending-volt
        $couchesClasses = array();
        foreach($contexteCouches as $contexteCouche){
            $classes = IgoClasse::find(
                array("conditions"=>"couche_id=$contexteCouche->couche_id",
                    "order"=>array("mf_class_z_order")
                ));
            $couchesClasses[$contexteCouche->couche_id] = $classes;
        }
        
        $mapfileInclude = '';
        if(isset($this->config->mapserver->mapfileInclude)){  
            foreach($this->config->mapserver->mapfileInclude as $chemin){
                $mapfileInclude .=  parent::fopen_file_get_contents($chemin);  
            } 
        }
        $this->view->mapfileInclude = $mapfileInclude;
        
        $this->view->couchesClasses = $couchesClasses;
        $this->view->contexteCouches = $contexteCouches;

        $this->view->contexte = $contexte;
        $this->view->preview = true;
        
        return array($contexte);
    }

    public function saveMapFile($contexte_id) {
        $contexte = IgoContexte::findFirstById($contexte_id);
        if (!$contexte) {
            throw new Exception("Contexte inexistant");
        }
        $contexte->save(); 
     }
     
     public function saveAction($r_controller = null, $r_action = null, $r_id = null) { 
         $this->traiterCodeOnlineRessource();
         parent::saveAction($r_controller = null, $r_action = null, $r_id = null);
         
     }

     
     public function deleteAction($id, $r_controller = null, $r_action = null, $r_id = null) {

        $igoContexte = IgoContexte::findFirst($id);
        $mapServerConfig = $this->getDI()->getConfig()->mapserver;
        $fileName = $mapServerConfig->mapfileCacheDir . $mapServerConfig->contextesCacheDir . $igoContexte->code . ".map";

        if (file_exists($fileName)) {
            unlink($fileName);
        }

        parent::deleteAction($id, $r_controller, $r_action, $r_id);
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

}
