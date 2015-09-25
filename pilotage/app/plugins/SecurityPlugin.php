<?php
use Phalcon\Mvc\User\Plugin;

class SecurityPlugin extends Plugin
{
    public function beforeExecuteRoute(Phalcon\Events\Event $event, Phalcon\Mvc\Dispatcher $dispatcher){
        
        $authentificationModule = $this->getDI()->get("authentificationModule"); 
        if($authentificationModule == null){
            return;
        }
        
        $controller = $dispatcher->getControllerName();
        $action = $dispatcher->getActionName();              
        
        if($controller === "connexion" || $controller === "error"){
            $config = $this->getDI()->get("config");
            $this->getDI()->get("view")->setViewsDir($config->application->services->viewsDir);       
        }else if(!$this->estAuthentifie()){
            return $this->forwardToLoginPage();            
        } else if(!$this->session->get("info_utilisateur")->estAdmin &&
                 !$this->session->get("info_utilisateur")->estPilote) {
            $this->session->set("erreur", "Droits insuffisants");
            return $this->forwardToLoginPage();
        } 
        else {
            
            // Contrôle d'accès.
            return $this->filtrerRoutes($controller, $action);
        }
    }
    
    private function filtrerRoutes($controller, $action) {
        $info_utilisateur = $this->session->get('info_utilisateur');
        
        if(!$info_utilisateur->estAdmin) {
            // On est pilote ici
            
            switch($controller) {
                // Menu Permissions
            case "igo_utilisateur":
                $this->forbidActions($action, array("all"));
                break;
                
            case "utilisateur_et_profil":
                $this->forbidActions($action, array("all"));
                break;
                
            case "igo_permission":
                $this->forbidActions($action, array());
                break;
                
            case "igo_profil":
                $this->forbidActions($action, array());
                break;
                
            case "igo_utilisateur_profil":
                $this->forbidActions($action, array("all"));
                break;
                
            case "igo_service_profil":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
                // Menu Classe d'entité
            case "gestion_couche":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_classe_entite":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_geometrie":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_couche":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_attribut":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_groupe":
                $this->forbidActions($action, array());
                break;
                
            case "igo_groupe_couche":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
                // Menu Context
            case "igo_contexte":
                $this->forbidActions($action, array());
                break;
                
            case "igo_couche_contexte":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
                // Menu Service
            case "igo_service":
                $this->forbidActions($action, array("all"));
                break;
                
                // Menu Pilotage
            case "igo_classe":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_source_entite":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_catalogue_csw":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_organisme_responsable":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_contact":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_classification":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_geometrie_type":
                $this->forbidActions($action, array("new",
                                                    "edit",
                                                    "delete",
                                                    "create"));
                break;
                
            case "igo_connexion":
                $this->forbidActions($action, array("all"));
                break;
                
            case "igo_connexion_type":
                $this->forbidActions($action, array("all"));
                break;
                
                // Menu Mapfile
            case "mapfile":
                $this->forbidActions($action, array("all"));
                break;
                
            default:
                $this->forbidActions($action, array());
                break;
            }
        }
    }
    
    /*
     *  $action : action du controlleur
     *  $actions_interdites : array contenant les actions à filtrer.
     */
    private function forbidActions($action, $actions_interdites) {
        if(in_array("all", $actions_interdites)) {
            $this->forwardToUnauthorizedPage();
        }

        if (in_array($action, $actions_interdites)) {
            $this->forwardToUnauthorizedPage();
        }

        return;
    }
    
    private function forwardToLoginPage(){
        $this->dispatcher->forward(array(
                                         "controller" => "connexion",
                                         "action" => "index"
                                         ));
        return;
    }
    
    private function forwardToErrorPage(){
        $this->dispatcher->forward(array(
                                         "controller" => "error",
                                         "action" => "error404"
                                         ));
        return;
    }
    
    private function forwardToUnauthorizedPage(){
        $this->dispatcher->forward(array(
                                         "controller" => "error",
                                         "action" => "error403"
                                         ));
        return;
    }    
    private function forwardToRolePage(){
        $this->dispatcher->forward(array(
                                         "controller" => "connexion",
                                         "action" => "role"
                                         ));
        return;
    }    
    
    private function estAuthentifie(){
        return $this->session->has("info_utilisateur") 
                    ? $this->session->get("info_utilisateur")->estAuthentifie 
                    : false;
    }
    
    private function estAnonyme(){
        return $this->session->get("info_utilisateur")->estAnonyme;
    }
    
    private function estRoleSelectionneRequis(){
        return $this->getDi()->getConfig()->application->authentification->activerSelectionRole;
    }
    
    private function estRoleSelectionne(){
        return !is_null($this->session->get("info_utilisateur")->profilActif);
    }
    
    private function obtenirConfiguration($action, $dispatcher){
        if($action === "index"){
            $configuration = "defaut";
        }else {
            $configuration = $dispatcher->getParam("configuration");
        }
        return $configuration;
    }
    
}