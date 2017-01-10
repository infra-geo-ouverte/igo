<?php
use Phalcon\Mvc\Controller;

class ConnexionController extends Controller{

    public function indexAction() {
        $authentificationModule = $this->getDI()->get("authentificationModule");

        $configuration = $this->getDI()->get("config");
        if(isset($configuration->application->authentification->authentificationExterne) &&
        $configuration->application->authentification->authentificationExterne){

            $succes = $authentificationModule->authentification(null, null);

            if (!$succes) {

                $this->setErrors($authentificationModule->obtenirMessagesErreur());

                if(isset($configuration->application->authentification->authentificationUri)){
                    return $this->response->redirect($configuration->application->authentification->authentificationUri, TRUE);
                }
            } else {

                if (!$this->session->has("info_utilisateur")) {
                    $utilisateur = new SessionController();
                    $this->session->set("info_utilisateur", $utilisateur);
                }

                $this->session->get("info_utilisateur")->identifiant = $authentificationModule->obtenirIdentifiantUtilisateur();
                $this->session->get("info_utilisateur")->prenom  = $authentificationModule->obtenirPrenom();
                $this->session->get("info_utilisateur")->nom  = $authentificationModule->obtenirNom();
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
            return $this->dispatcher->forward(array(
                "action" => "role"
            ));
        }

        //Paramètres pour l'affichage de la page de connexion
        $this->view->setVar("titre", "Authentification");

        if($this->session->has("erreurs")){
            $this->setErrors($authentificationModule->obtenirMessagesErreur());
        }else{
            $this->deleteErrors();
        }

        //Obtenir le nom du configuration XML ouvert et mettre dans la session
        if(!isset ($this->getDI()->get('session')->configuration)){
            $this->getDI()->get('session')->configuration =  $this->getDI()->get('dispatcher')->getParam("configuration");
        }

        $this->view->setVar("permettreAccesAnonyme", $configuration->application->authentification->permettreAccesAnonyme);
        $this->view->setVar("roleUri", $configuration->application->baseUri. "connexion/role");
        $this->view->setVar("anonymeUri", $configuration->application->baseUri. "connexion/anonyme");
        $configuration->application->baseUri = $configuration->uri->services . "igo_commun/public/";
    }

    public function roleAction() {

        $authentificationModule = $this->getDI()->get("authentificationModule");
        $configuration = $this->getDI()->get("config");
        $this->view->setVar("titre", "Choix du profil");
        $request = new \Phalcon\Http\Request();

        if ($request->isPost()) {

            $username = $request->getPost('username', null);
            $password = $request->getPost('password', null);
            $succes = $authentificationModule->authentification($username, $password);

            if (!$succes) {
                $this->setErrors($authentificationModule->obtenirMessagesErreur());
                return $this->redirigeVersPage();
            }
            else{
                $this->deleteErrors();
            }

            if (!$this->session->has("info_utilisateur")) {
                $utilisateur = new SessionController();
                $this->session->set("info_utilisateur", $utilisateur);
            }
            $this->session->get("info_utilisateur")->estAuthentifie = true;
            $this->session->get("info_utilisateur")->identifiant = $username;
            $this->session->get("info_utilisateur")->prenom  = $authentificationModule->obtenirPrenom();
            $this->session->get("info_utilisateur")->nom  = $authentificationModule->obtenirNom();
            $this->session->get("info_utilisateur")->estAdmin = $authentificationModule->estAdmin();
            $this->session->get("info_utilisateur")->estPilote = $authentificationModule->estPilote();
            $this->session->get("info_utilisateur")->profils = $authentificationModule->obtenirProfils();

            //L'utilisateur tente d'accéder au pilotage et il n'a pas le droit
            if (!$this->session->get("info_utilisateur")->estAdmin &&
                    !$this->session->get("info_utilisateur")->estPilote &&
                    isset($configuration->application->estPilotage) &&
                    $configuration->application->estPilotage === true) {
                $this->session->remove("info_utilisateur");
                $this->session->setErrors(["Droits insuffisants"]);
                return $this->redirigeVersPage();
            }


        }

        //L'utilisateur doit sélectionner son rôle
        $profilObligatoire = isset($_GET['force-profil']) ? $_GET['force-profil'] : false;
        if(isset($this->session->get("info_utilisateur")->estAuthentifie) &&
              $this->session->get("info_utilisateur")->estAuthentifie &&
            ($profilObligatoire || $configuration->application->authentification->activerSelectionRole)){

            $configuration = $this->getDI()->get("config");
            $accessTotalUri = "";
            if($configuration->application->authentification->activerSelectionRole === false){
                $accessTotalUri = $configuration->application->baseUri. "connexion/accesTotal";
            }
            $this->view->setVar("accesUri", $configuration->application->baseUri. "connexion/acces");
            $this->view->setVar("accesTotalUri", $accessTotalUri);

            if(!$this->obtenirPageRedirection()){
                $this->definirPageRedirection($request->getURI());
            }

            if($configuration->application->authentification->activerSelectionRole){
                $profils = $this->session->get("info_utilisateur")->profils;

                if(!count($profils)){
                    return $this->anonymeAction(TRUE);
                }
                else if (
                  ($configuration->application->authentification->profilAnonyme->nom==$profils[0]['nom'])
                  && (count($profils) === 1)
                ){
                  $this->session->get("info_utilisateur")->profilActif = $profils[0]['id'];
                  return $this->anonymeAction(TRUE);
                }
                else if(count($profils) === 1){
                    $this->session->get("info_utilisateur")->profilActif = $profils[0]['id'];
                    return $this->redirigeVersPage();
                }
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

    public function accesTotalAction() {
        $request = new \Phalcon\Http\Request();
        if ($request->isPost()) {
           $this->session->get("info_utilisateur")->profilActif = null;
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
        if((isset($xmlAuth->aDeconnectionRetourNav) && $xmlAuth->aDeconnectionRetourNav !== 'false') || (!isset($xmlAuth->aDeconnectionRetourNav) && (!isset($configuration->application->authentification->aDeconnectionRetourNav) || $configuration->application->authentification->aDeconnectionRetourNav !== false))){
            $pageRedirection = $this->obtenirPageRedirection();
            if((isset($xmlAuth->aDeconnectionSeConnecter) && $xmlAuth->aDeconnectionSeConnecter === 'true') || (!isset($xmlAuth->aDeconnectionSeConnecter) && isset($configuration->application->authentification->aDeconnectionSeConnecter) && $configuration->application->authentification->aDeconnectionSeConnecter == true)){
                $seConnecter = true;
            }
        }

        $configuration->application->baseUri = $configuration->uri->services . "igo_commun/public/";

        $pageAccueil = $configuration->application->authentification->deconnectionAccueil;

        if(isset($xmlAuth->deconnectionHttpsAccueil) && $xmlAuth->deconnectionHttpsAccueil !== false && substr($_SERVER["HTTP_REFERER"],0,8) === "https://"){
            $pageAccueil = $xmlAuth->deconnectionHttpsAccueil;
            if(isset($xmlAuth->directAccueil) && $xmlAuth->directAccueil === 'true'){
              $response = new \Phalcon\Http\Response();
              return $response->redirect($pageAccueil, true);
            }
        }

        if(isset($xmlAuth->deconnectionAccueil) && $xmlAuth->deconnectionAccueil !== false){
            $pageAccueil = $xmlAuth->deconnectionAccueil;
            if(isset($xmlAuth->directAccueil) && $xmlAuth->directAccueil === 'true'){
              $response = new \Phalcon\Http\Response();
              return $response->redirect($pageAccueil, true);
            }
        }

        $this->session->destroy();
        $this->getDI()->get("authentificationModule")->deconnexion();
        $this->view->setVar("titre", "Déconnexion");
        if(isset($configuration->application->estPilotage) && $configuration->application->estPilotage === true){
            $pageRedirection = "";
        }
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
                    $nomProfilAnonyme = $configuration->application->authentification->profilAnonyme->nom;
                }

                if($configuration->application->authentification->activerSelectionRole){
                    $profilAnonyme = IgoProfil::findFirst("nom = '{$nomProfilAnonyme}'");
                    if($profilAnonyme){
                        $this->session->get("info_utilisateur")->profils = array($profilAnonyme->toArray());
                        $this->session->get("info_utilisateur")->profilActif = $this->session->get("info_utilisateur")->profils[0]['id'];
                    }
                    else{
                      $this->session->get("info_utilisateur")->profilActif = $nomProfilAnonyme;
                    }
                } else {
                    $this->session->get("info_utilisateur")->profils = IgoProfil::find("nom = '{$nomProfilAnonyme}'")->toArray();
                }
            }
            return $this->redirigeVersPage();
        }
        else if (isset($configuration->application->authentification->profilAnonyme->pageRedirection) && $estAuthentifier){
            $this->definirPageRedirection($configuration->application->authentification->profilAnonyme->pageRedirection);
            $nomProfilAnonyme = null;
            //Paramétrer le profilActif comme Anonyme si null sinon boucle infini
            if($this->session->get('info_utilisateur')->profilActif===null){

              if($this->session->get('nomProfilAnonyme')==null){
                $nomProfilAnonyme = $configuration->application->authentification->profilAnonyme->nom;
              }
              else{
                $nomProfilAnonyme = $this->session->get('nomProfilAnonyme');
              }

              if($nomProfilAnonyme === null){
                $this->dispatcher->forward(array(
                    "controller" => "error",
                    "action" => "error403"
                ));
              }
            }

            $this->session->get("info_utilisateur")->profilActif = $nomProfilAnonyme;
            return $this->redirigeVersPage();
        }
        else {
            $this->dispatcher->forward(array(
                "controller" => "error",
                "action" => "error403"
            ));
        }
    }

    private function redirigeVersPage(){

        $configuration = $this->getDI()->get("config");
        $page = $this->obtenirPageRedirection();

        if ($page) {
            if(!$configuration->application->authentification->activerSelectionRole){
                $this->session->remove("page");
            }
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

    /**
     * Défini les erreurs dans la session et la variable "erreurs" pour la vue.
     *
     * @param  array $erreurs Tableau d'erreurs à ajouter
     */

    private function setErrors($erreurs = []){

        $sessionErrors = [];
        if($this->session->has('erreurs')){
            $sessionErrors = $this->session->get('erreurs');
            if(is_string($sessionErrors)){
                $sessionErrors = [$sessionErrors];
            }
        }

        $errorsMerge = array_unique(array_merge($sessionErrors,$erreurs),SORT_LOCALE_STRING);

        $this->session->set("erreurs", $errorsMerge);
        $this->view->setVar("erreurs", $errorsMerge);

    }

    /**
     * Supprime les erreurs dans la session et la variable erreurs pour la vue
     */

    private function deleteErrors(){
        $this->session->set("erreurs", []);
        $this->view->setVar("erreurs", []);
    }

}
