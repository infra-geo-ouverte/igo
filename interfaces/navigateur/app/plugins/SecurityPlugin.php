<?php
use Phalcon\Mvc\User\Plugin;

$config = include __DIR__ . "/../config/config.php";
include $config->application->services->dir."fonctions.php";
/*
 * TODO !!!
 * Il faut nettoyer les fonctions non utilisées de cette classe.
 * Définir comment reconnaitre un utilisateur anonyme.
 */

class SecurityPlugin extends Plugin
{
    public function beforeExecuteRoute(Phalcon\Events\Event $event, Phalcon\Mvc\Dispatcher $dispatcher){
        $authentificationModule = $this->getDI()->get("authentificationModule");
        if($authentificationModule == null){
            return;
        }

        $controller = $dispatcher->getControllerName();
        $action = $dispatcher->getActionName();
        $config = $this->getDI()->get("config");

        if($controller === "connexion" || $controller === "error"){
            $config = $this->getDI()->get("config");
            $this->getDI()->get("view")->setViewsDir($config->application->services->viewsDir);
        }else if($controller === "igo" && ($action === "configuration" || $action === "index")){
            $user = $this->session->get("info_utilisateur");
            
            //On a changer de XML une fois authentifier alors on doit refaire le login
            if($dispatcher->getParam("configuration") !== null && ($this->session->configuration)!== null){
                  if(($this->session->configuration) !== $dispatcher->getParam("configuration")){
                      $this->session->destroy();
                    $authentificationModule->deconnexion();
                     }
                }
       
            $authObligatoire = isset($_GET['force-auth']) ? $_GET['force-auth'] : false;
            $configuration = $this->obtenirConfiguration($action, $dispatcher);

            $authRequise = ($authObligatoire || $this->estAuthentificationRequise($configuration))? true:false;

            if(isset($this->getDi()->getConfig()->configurations[$configuration])){
                $file = $this->getDi()->getConfig()->configurations[$configuration];
            } else {
                $file = $this->getDi()->getConfig()->configurationsDir . $configuration . '.xml';
            }
            if((!file_exists($file) && !curl_url_exists($file))){
                return $this->forwardToErrorPage();
            }
            if(($authObligatoire || $authRequise) && !$this->estAuthentifie() && (!$this->estAnonyme() || ($this->estAnonyme() && (!isset($user->persistant) || $user->persistant == false)))){
                return $this->forwardToLoginPage();
            } else if($authRequise && $this->estRoleSelectionneRequis() && !$this->estRoleSelectionne()){
                return $this->forwardToRolePage();
            } else if (!$authRequise && !$this->estAuthentifie()){
                $authentificationModule = $this->getDI()->get("authentificationModule");
                if(!$this->session->has("info_utilisateur")) {
                    $this->session->set("info_utilisateur", new SessionController());
                }
                $configurationSysteme = $this->getDI()->get("config");
                if($configurationSysteme->offsetExists("database")) {
                    if($this->estRoleSelectionneRequis()){
                        $profilAnonyme = IgoProfil::findFirst("nom = '{$configurationSysteme->application->authentification->profilAnonyme->nom}'");
                        if($profilAnonyme){
                            $this->session->get("info_utilisateur")->profils = array($profilAnonyme->toArray());
                            $this->session->get("info_utilisateur")->profilActif = $this->session->get("info_utilisateur")->profils[0]['id'];
                        }
                    } else if(isset($configurationSysteme->application->authentification->profilAnonyme->nom)){
                        $this->session->get("info_utilisateur")->profils = IgoProfil::find("nom = '{$configurationSysteme->application->authentification->profilAnonyme->nom}'")->toArray();
                    }
                }
                $this->session->get("info_utilisateur")->estAnonyme = true;
            } else if($this->estRoleSelectionneRequis() && !$this->estRoleSelectionne()){
                return $this->forwardToRolePage();
            }

            if($this->estAnonyme() && $authObligatoire){
                return $this->forwardToUnauthorizedPage();
            }
            if($this->estAnonyme()){
                $this->session->get("info_utilisateur")->persistant = false;
            }
        }else if ($controller == "igo" && ($action == "contexte" || $action == "couche" || $action == "groupe")){
            if($this->estAnonyme()){
                $user = $this->session->get("info_utilisateur");
                if(isset($user->persistant) && $user->persistant === true){
                    $user->persistant = false;
                } else {
                    $this->session->destroy();
                    $authentificationModule->deconnexion();
                }
            }
            if(!$this->estAnonyme() && !$this->estAuthentifie()){
                return $this->forwardToLoginPage();
            }else if($this->estRoleSelectionneRequis() && !$this->estRoleSelectionne()){
                return $this->forwardToRolePage();
            }if($this->estAnonyme() && isset($config->application->authentification->permettreAccesAnonyme) && !$config->application->authentification->permettreAccesAnonyme){
                return $this->forwardToUnauthorizedPage();
            }
        }
    }

    private function forwardToLoginPage(){
        $this->dispatcher->forward(array(
            "controller" => "connexion",
            "action" => "index"
            //"params" => array($this->getDi()->getConfig()->application->authentification->nomProfilAnonyme)
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

    private function estAuthentificationRequise($configuration){

        if(!isset($this->getDi()->getConfig()->application->authentification) ||
           $this->getDi()->getConfig()->application->authentification == false){
            $authentification = false;
        }

        if(isset($this->getDi()->getConfig()->configurations[$configuration])){
            $xmlPath = $this->getDi()->getConfig()->configurations[$configuration];
        } else {
            $xmlPath = $this->getDi()->getConfig()->configurationsDir . $configuration . '.xml';
        }
        if(file_exists($xmlPath)){
            $element = simplexml_load_file($xmlPath);
            if(isset($element->serveur) && isset($element->serveur->authentification) && isset($element->serveur->authentification->children()->profilAnonyme->attributes()->nom)){
               $this->getDi()->getConfig()->application->authentification->profilAnonyme->nom = (String) $element->serveur->authentification->children()->profilAnonyme->attributes()->nom;
               $this->session->set('nomProfilAnonyme', $this->getDi()->getConfig()->application->authentification->profilAnonyme->nom);
            }
        } else { //url externe
            $element = simplexml_load_string(curl_file_get_contents($xmlPath));
        }

        if(isset($element->attributes()->authentification)){
            $authentification = $element->attributes()->authentification;
        } else{
            $authentification = "true"; // Est-ce qu'on devrait forcer l'authentification par defaut? En attendant de décider, on le force par défaut.
        }
        // Si la configuration demande que l'utilisateur soit authentifié et qu'il ne l'est pas encore, le rediriger vers la fenetre de connexion
        if($authentification == "true"){
            return true;
        }else{
            return false;
        }


    }

    private function estAuthentifie(){
        if($this->session->has("info_utilisateur")) {
            return $this->session->get("info_utilisateur")->estAuthentifie;
        }
        return false;
    }

    private function estAnonyme(){
        if($this->session->has("info_utilisateur")) {
            return $this->session->get("info_utilisateur")->estAnonyme;
        }
        return false;
    }

    private function estRoleSelectionneRequis(){
        if(isset($this->getDi()->getConfig()->application->authentification->activerSelectionRole)){
            return $this->getDi()->getConfig()->application->authentification->activerSelectionRole;
        }
        return false;
    }

    private function estRoleSelectionne(){
        if($this->session->has("info_utilisateur")) {
            return !is_null($this->session->get("info_utilisateur")->profilActif);
        }
        return false;
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
