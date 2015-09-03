<?php
use Phalcon\Mvc\Controller;

class ConnexionController extends Controller{
    
    public function indexAction() {
        $authentificationModule = $this->getDI()->get("authentificationModule");        

        $configuration = $this->getDI()->get("config");
        if(isset($configuration->application->authentification->authentificationExterne) && $configuration->application->authentification->authentificationExterne){
            $succes = $authentificationModule->authentification(null, null);
            if (!$succes) {
                $this->session->set("erreur", $authentificationModule->obtenirMessageErreur());
                if(isset($configuration->application->authentification->authentificationUri)){
                    return $this->response->redirect($configuration->application->authentification->authentificationUri, TRUE);
                }
            } else {
                if (!$this->session->has("info_utilisateur")) {
                    $utilisateur = new SessionController();
                    $this->session->set("info_utilisateur", $utilisateur);
                }
                $this->session->get("info_utilisateur")->identifiant = $authentificationModule->obtenirIdentifiantUtilisateur();
                $this->session->get("info_utilisateur")->estAuthentifie = $authentificationModule->estAuthentifie();
                $this->session->get("info_utilisateur")->estAdmin = $authentificationModule->estAdmin();
                $this->session->get("info_utilisateur")->estPilote = $authentificationModule->estPilote();                       
                $this->session->get("info_utilisateur")->profils = $authentificationModule->obtenirProfils();
                $this->session->get("info_utilisateur")->estAnonyme  = false; 
            }              
        }
            
         //Vérifier si on doit se rappeler où on voulait aller
        $request = new Phalcon\Http\Request();
        $uri = $request->getURI();
        if(substr($uri, -strlen("/connexion/")) !== "/connexion/"){    
            //Stocker l'url de redirection dans la session
            $this->definirPageRedirection($uri);
        }
        
        //L'utilisateur est déjà authentifié
        if($authentificationModule->estAuthentifie()){
            //Passer à la page de choix du profil
            return $this->roleAction();
        }
        
        //Paramètres pour l'affichage de la page de connexion
        $this->view->setVar("titre", "Authentification");
        if($this->session->has("erreur")){
            $this->view->setVar("erreur", $this->session->get("erreur"));
        }else{
            $this->view->setVar("erreur", "");
        }
        
        $this->view->setVar("permettreAccesAnonyme", $configuration->application->authentification->permettreAccesAnonyme);
        $this->view->setVar("roleUri", $configuration->application->baseUri. "connexion/role");
        $this->view->setVar("anonymeUri", $configuration->application->baseUri. "connexion/anonyme");       
        $configuration->application->baseUri = $configuration->uri->services . "igo_commun/public/";

        $this->session->set("erreur","");        
    }

    public function roleAction() {

        $authentificationModule = $this->getDI()->get("authentificationModule");
        $configuration = $this->getDI()->get("config");
        $this->view->setVar("titre", "Choix du profil");
        $request = new \Phalcon\Http\Request();

        if ($request->isPost()) {

            $username = $request->getPost('username', null);
            $password = $request->getPost('password', null);
            $succes = $this->getDI()->get("authentificationModule")->authentification($username, $password);
            if (!$succes) {
                $this->session->set("erreur", $this->getDI()->get("authentificationModule")->obtenirMessageErreur());
                return $this->redirigeVersPage();
            }

            if (!$this->session->has("info_utilisateur")) {
                $utilisateur = new SessionController();
                $this->session->set("info_utilisateur", $utilisateur);
            }
            $this->session->get("info_utilisateur")->estAuthentifie = true;
            $this->session->get("info_utilisateur")->identifiant = $username;

            $this->session->get("info_utilisateur")->estAdmin = $authentificationModule->estAdmin();
            $this->session->get("info_utilisateur")->estPilote = $authentificationModule->estPilote();

            //L'utilisateur tente d'accéder au pilotage et il n'a pas le droit
            //TODO Remplacer /pilotage/ par la variable de config correspondante. En ce moment elle est dans /igo/pilogate...config.php
            if (!$this->session->get("info_utilisateur")->estAdmin &&
                    !$this->session->get("info_utilisateur")->estPilote &&
                    $configuration->application->baseUri === "/pilotage/") {
                $this->session->remove("info_utilisateur");
                $this->session->set("erreur", "Droits insuffisants");
                return $this->redirigeVersPage();
            }

            $profils = $this->getDI()->get("authentificationModule")->obtenirProfils();

            if (!$configuration->application->authentification->activerSelectionRole && $configuration->application->authentification->permettreAccesAnonyme) {
                array_merge($profils, IgoProfil::find("nom = '{$configuration->application->authentification->nomProfilAnonyme}'")->toArray());
            }
            
            $this->session->get("info_utilisateur")->profils = $profils;
            
            if($configuration->application->authentification->activerSelectionRole){
                if(count($profils) === 1){
                    $this->session->get("info_utilisateur")->profilActif = $profils[0]['id'];
                    return $this->redirigeVersPage();
                }
                if(!count($profils)){
                    return $this->anonymeAction(TRUE);
                }
            }
        }
        //L'utilisateur doit sélectionner son rôle
        if($this->session->get("info_utilisateur")->estAuthentifie && 
            $configuration->application->authentification->activerSelectionRole){
            
            $configuration = $this->getDI()->get("config");
            $this->view->setVar("accesUri", $configuration->application->baseUri. "connexion/acces");
          
            if(!$this->obtenirPageRedirection()){
                $this->definirPageRedirection($request->getURI());
            }
        } else{
            return $this->redirigeVersPage();
        }
        $configuration->application->baseUri = $configuration->uri->services . "igo_commun/public/";
    }

    public function accesAction() {
        $request = new \Phalcon\Http\Request();
        if ($request->isPost()) {
           $this->session->get("info_utilisateur")->profilActif = $request->getPost('profil', null);
        }
        return $this->redirigeVersPage();
    }        
    
    public function deconnexionAction() {
        $xmlConfig = $this->session->get('configXml');
        $xmlAuth = (object) array();
        if(isset($xmlConfig) && isset($xmlConfig['authentification'])){
            $xmlAuth = (object) $xmlConfig['authentification'];
        }
        $configuration = $this->getDI()->get("config");

        $pageRedirection = '';
        $seConnecter = false;
        if((isset($xmlAuth->aDeconnectionRetourNav) && $xmlAuth->aDeconnectionRetourNav !== 'false') || (!isset($xmlAuth->aDeconnectionRetourNav) && $configuration->application->authentification->aDeconnectionRetourNav !== false)){
            $pageRedirection = $this->obtenirPageRedirection();
            if((isset($xmlAuth->aDeconnectionSeConnecter) && $xmlAuth->aDeconnectionSeConnecter === 'true') || (!isset($xmlAuth->aDeconnectionSeConnecter) && $configuration->application->authentification->aDeconnectionSeConnecter == true)){
                $seConnecter = true;
            }
        }

        $configuration->application->baseUri = $configuration->uri->services . "igo_commun/public/";       

        $pageAccueil = $configuration->application->authentification->deconnectionAccueil;
        if(isset($xmlAuth->deconnectionAccueil) && $xmlAuth->deconnectionAccueil !== false){
            $pageAccueil = $xmlAuth->deconnectionAccueil;
        }

        $this->session->destroy();
        $this->getDI()->get("authentificationModule")->deconnexion();
        $this->view->setVar("titre", "Déconnexion");
        $this->view->setVar("pageRedirection", $pageRedirection);
        $this->view->setVar("seConnecter", $seConnecter);
        $this->view->setVar("pageAccueil", $pageAccueil);
    }    
    
    public function anonymeAction($estAuthentifier = FALSE){
        $configuration = $this->getDI()->get("config");
        if($configuration->application->authentification->permettreAccesAnonyme){
            if(!$this->session->has("info_utilisateur")) {
                $this->session->set("info_utilisateur", new SessionController());
            }
            if($estAuthentifier !== TRUE){
                $this->session->get("info_utilisateur")->estAuthentifie = false;
                $this->session->get("info_utilisateur")->estAnonyme = true;
                $this->session->get("info_utilisateur")->persistant = true;
            }
            if($configuration->offsetExists("database")) {
                $nomProfilAnonyme = $this->session->get('nomProfilAnonyme');
                if($nomProfilAnonyme === null){
                    $nomProfilAnonyme = $configuration->application->authentification->nomProfilAnonyme;
                }
                    
                if($configuration->application->authentification->activerSelectionRole){
                    $profilAnonyme = IgoProfil::findFirst("nom = '{$nomProfilAnonyme}'");
                    if($profilAnonyme){
                        $this->session->get("info_utilisateur")->profils = array($profilAnonyme->toArray());
                        $this->session->get("info_utilisateur")->profilActif = $this->session->get("info_utilisateur")->profils[0]['id'];
                    }
                } else {
                    $this->session->get("info_utilisateur")->profils = IgoProfil::find("nom = '{$nomProfilAnonyme}'")->toArray();
                }
            }
            return $this->redirigeVersPage();        
        } else {
            $this->dispatcher->forward(array(
                "controller" => "error",
                "action" => "error403"
            ));
        }
    }
    
    private function redirigeVersPage(){ 
        
        $page = $this->obtenirPageRedirection();
        if ($page) {
            $this->session->remove("page");
            $response = new \Phalcon\Http\Response();
            $response->redirect($page, true);
            return $response;            
        }else{
            $response = new \Phalcon\Http\Response();
            $configuration = $this->getDI()->get("config");
            $response->redirect($configuration->application->baseUri, true);
            return $response;        
        }
    }
    
    /**
     * Page vers laquelle rediriger l'utilisateur une fois qu'il s'est correctement authentifié
     * @return string
     */
    private function obtenirPageRedirection(){
        if($this->session->has('page')){
            $page = $this->session->get('page');
            return preg_replace('/(\/+)/','/', $page);
        }else{
            return '';
        }
    }
    
    private function definirPageRedirection($page = ''){
        if($page){
            $this->session->set('page', $page);
        }else{
            $this->session->remove('page');
        }
    }
    
}
