<?php

class IgoController extends ControllerBase {

    public function indexAction() {
        $this->definirVariablesCommunes();
        $this->traiterXml('defaut');
    }

    public function configurationAction($configuration) {
        $this->definirVariablesCommunes();
        $this->traiterXml($configuration);
    }

    public function contexteAction($code) {
        $this->definirVariablesCommunes();
        $this->traiterXml('defaut');

        if(!is_numeric($code)){
            $type = "code";
            $contexte = IgoContexte::findFirst("$type='$code'");
        } else {
            $type = "id";
            $contexte = IgoContexte::findFirst("$type=$code");
        }

        $this->view->setVar("contexteCode", "null");
        $this->view->setVar("contexteId", "null");
        if ($contexte) {
            $this->view->setVar("contexte" . ucfirst($type), $code . "?v=" . md5($contexte->date_modif));
        } else {
            $this->view->setVar("avertissement", "Le contexte avec le $type:$code n'existe pas");
        }
    }

    public function coucheAction($id) {
        $this->definirVariablesCommunes();
        $this->traiterXml('defaut');

        $filterArray = function ($value){
            if(is_numeric($value)){
                return $value;
            }
        };

        $arrayCoucheId = array_filter(explode(",",$id), $filterArray);

        $couches = array();
        foreach ($arrayCoucheId as $key => $value) {
            $couche = IgoCouche::findFirst("id=$value");

            if ($couche === false) {
                continue;
            }

            $couches[] = $couche;
        }

        if (count($couches) >= 1) {
            $this->view->setVar("couche", implode(',', $arrayCoucheId) . "?v=" . md5(rand(1000, 9999999)));
        } else {
            $this->view->setVar("avertissement", "Aucune couche n'a été trouvée avec le(s) id(s) suivant :" . implode(";", $arrayCoucheId));
            $this->view->setVar("couche", "null");
        }
        $this->ajouterModules();
    }

    public function groupeAction($id) {
        $this->definirVariablesCommunes();
        $this->traiterXml('defaut');

        $filterArray = function ($value){
            if(is_numeric($value)){
                return $value;
            }
        };

        $arrayGroupeCoucheId = array_filter(explode(",",$id), $filterArray);

        $couches = array();
        foreach ($arrayGroupeCoucheId as $key => $value) {
            $couche = IgoGroupeCouche::find("groupe_id=$value");

            if (count($couche) == 0) {
                continue;
            }

            foreach ($couche as $value) {
                if (is_numeric($value->couche_id)) {
                    $couches[] = $value->couche_id;
                } else {
                    $this->dispatcher->forward(array(
                        "controller" => "error",
                        "action" => "error404"
                    ));
                    return;
                }
            }
        }

        if(count($couches)>=1){
            $this->view->setVar("couche", implode(',', $couches) . "?v=" . md5(rand(1000, 9999999)));
        } else {
            $this->view->setVar("avertissement", "Aucun groupe n'a été trouvé avec le(s) id(s) suivant :" . implode(";", $arrayGroupeCoucheId));
            $this->view->setVar("couche", "null");
        }
        $this->ajouterModules();
    }

    private function traiterXml($nomXml){

        if(isset($this->getDi()->getConfig()->configurations[$nomXml])){
            $xmlPath = $this->getDi()->getConfig()->configurations[$nomXml];
        } else {
            $xmlPath = $this->getDi()->getConfig()->configurationsDir . $nomXml . '.xml';
        }

        if(file_exists($xmlPath)){
            $externe = false;
            $element = simplexml_load_file($xmlPath);
        } else { //url externe
            $externe = true;
            $element = simplexml_load_string(curl_file_get_contents($xmlPath));
        }
        $elAttributes = $element->attributes();
        if(isset($_GET['mode'])){
            $element = $element->mode;
        }

        if(isset($elAttributes->titre)){
            $titre = $elAttributes->titre;
        }else{
            $titre = "Navigateur";
        }
        $this->view->setVar("titre", $titre);
        if(file_exists($xmlPath)){
            $filemtime = filemtime($xmlPath);
        } else {
            $curl = curl_init($xmlPath);
            curl_setopt($curl, CURLOPT_NOBODY, true);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_FILETIME, true);
            curl_exec($curl);
            $timestamp = curl_getinfo($curl, CURLINFO_FILETIME);
            $filemtime = $timestamp;
        }
        $this->view->setVar("configuration", $nomXml . "?v={$filemtime}");

        $contexteArrayId = array();
        $contexteArrayCode = array();
        $this->view->setVar("couche", "null");

        if(isset($element->contexte)){
            $contexte = null;
            for($i = 0; $i < count($element->contexte); $i++) {
                if(isset($element->contexte[$i]->attributes()->id)) {
                    $contexteId = $element->contexte[$i]->attributes()->id;
                    $contexte = IgoContexte::findFirst("id=$contexteId");
                    if($contexte){
                        $contexteArrayId[] = $element->contexte[$i]->attributes()->id . "?v=" . md5($contexte->date_modif);
                    }else{
                        $this->view->setVar("avertissement", "Le contexte avec le id:$contexteId n'existe pas");
                    }
                } else if (isset($element->contexte[$i]->attributes()->code)) {
                    $contexteCode = $element->contexte[$i]->attributes()->code;
                    $contexte = IgoContexte::findFirst("code='$contexteCode'");
                    if($contexte){
                        $contexteArrayCode[] = $element->contexte[$i]->attributes()->code . "?v=" . md5($contexte->date_modif);
                    }else{
                        $this->view->setVar("avertissement", "Le contexte '$contexteCode' n'existe pas");
                    }
                }
            }
        }
        $this->view->setVar("contexteCode", $contexteArrayCode);
        $this->view->setVar("contexteId", $contexteArrayId);

        if(isset($elAttributes->aliasUri)){
            $this->config->uri->librairies = $elAttributes->aliasUri . 'librairie/';
            $this->config->uri->services = $elAttributes->aliasUri . 'services/';
            $this->config->uri->api = $elAttributes->aliasUri . 'api/';
            $this->config->uri->modules = $elAttributes->aliasUri . 'modules/';

            $this->config->uri->navigateur = $elAttributes->aliasUri . 'public/';
            $this->config->application->baseUri = $this->config->uri->navigateur;
        } else if(isset($elAttributes->baseUri)){

            if(isset($elAttributes->libUri)){
                $this->config->uri->librairies = $elAttributes->baseUri . $elAttributes->libUri;
            }
            if(isset($elAttributes->serviceUri)){
                $this->config->uri->services = $elAttributes->baseUri . $elAttributes->serviceUri;
            }
            if(isset($elAttributes->apiUri)){
                $this->config->uri->api = $elAttributes->baseUri . $elAttributes->apiUri;
            }
            if(isset($elAttributes->modulesUri)){
                $this->config->uri->modules = (string) $elAttributes->modulesUri;
            }

            $this->config->uri->navigateur = (string) $elAttributes->baseUri;
            $this->config->application->baseUri = $this->config->uri->navigateur;

        }

        if(isset($elAttributes->mapserver)){
            $this->config->uri->mapserver = $elAttributes->mapserver;
        }

        $this->getDi()->getView()->config = $this->config;
        $this->getDi()->getView()->configXml = $element;

        global $application;
        $configServeurXml = array();
        if($externe === false){
            if(isset($element->serveur)){
                if(isset($element->serveur->authentification)) {
                    $configServeurXml['authentification'] = array();
                    foreach ($element->serveur->authentification->children() as $key=>$attr) {
                       $child = array();
                       foreach ($attr->attributes() as $cle => $valeur) {
                         $child[$cle] = (String) $valeur;
                       }
                       $configServeurXml['authentification'][$key] = $child;
                    }
                }
            }
        }
        $application->getDI()->getSession()->set('configXml', $configServeurXml);
      
        $this->ajouterModules();
    }

    private function definirVariablesCommunes(){
        $this->view->setVar("version", $this->config->application->version);
        $this->view->setVar("apps", "js/app");
        $this->view->setVar("widgets", "js/widgets");
        $configClient = $this->config->navigateur;
        $configClient->uri = $this->config->uri;
        $this->view->setVar("configClient", $configClient);

        global $application;
        $libelleProfil = '';
        $user = '';
        $count = 0;
        $application->getDI()->getSession()->set('page', '../' . $application->getDi()['router']->getRewriteUri());

        if ($application->getDI()->getSession()->has("info_utilisateur")) {
            if ($application->getDI()->getSession()->get("info_utilisateur")->identifiant) {
                $user = $application->getDI()->getSession()->get("info_utilisateur")->identifiant;
            }
            $idProfil = $application->getDI()->getSession()->get("info_utilisateur")->profilActif;
            if(isset($application->getDI()->getSession()->get("info_utilisateur")->profils)){
                $count = count($application->getDI()->getSession()->get("info_utilisateur")->profils);
                if(isset($idProfil)){
                    foreach($application->getDI()->getSession()->get("info_utilisateur")->profils as $value){
                        if($value['id']== $idProfil){
                             $libelleProfil = $value['libelle'];
                             break;
                        }
                    }
                } else if ($count === 1){
                    $libelleProfil = $application->getDI()->getSession()->get("info_utilisateur")->profils[0]['libelle'];
                }
            }
        }

        $this->view->setVar("profil", $libelleProfil);
        $this->view->setVar("utilisateur", $user);
        $this->view->setVar("nbProfil", $count);

        if (($this->request->get('url') || $this->request->get('URL'))) {

            $filter = new \Phalcon\Filter();
            $filter->add('url', function($value) {
                filter_var($value, FILTER_SANITIZE_URL);
            });

            $url = $this->request->get('url') ? $this->request->get('url') : $this->request->get('URL');
            $layers = $this->request->get('layers') ? $this->request->get('layers', 'string') : $this->request->get('LAYERS', 'string');

            if ($layers == null && strrpos($url, 'layers') !== false) {
                $layers = substr($url, strrpos($url, 'layers') + 7);
                $url = substr($url, 0, strrpos($url, 'layers'));
            }

            if ($layers == null && strrpos($url, 'LAYERS') !== false) {
                $layers = substr($url, strrpos($url, 'LAYERS') + 7);
                $url = substr($url, 0, strrpos($url, 'LAYERS'));
            }

            $filter->sanitize($url, 'url');
            $active = $layers == null ? 'false' : 'true';

            $fonctionCallback = "function(e){
                    var coucheWMS = new Igo.Couches.WMS(
                        {
                            url:'{$url}',
                            nom:'{$layers}',
                            fond:false,
                            active:{$active},
                            mode: 'getCapabilities'
                        }
                    );
                    Igo.nav.carte.gestionCouches.ajouterCouche(coucheWMS);
                };";

            $this->view->setVar("callbackInitIGO", $fonctionCallback);
        } else {
            $this->view->setVar("callbackInitIGO", 'null');
        }
    }

    /**
     * Ajoute tous les scripts Javascript requis pour chacun des modules.
     *
     * @return void
     */
    private function ajouterModules() {
        $chargeurModules = $this->getDi()->get('chargeurModules');

        $modulesJS = $chargeurModules->obtenirJavascript();
        $this->view->setVar("modulesJS", $modulesJS);

        $modulesVues = $chargeurModules->obtenirVues();
        $this->view->setVar("modulesVues", $modulesVues);

        $config = $this->getDi()->getView()->config;
        $configXml = $this->getDi()->getView()->configXml;
        $modulesFonctions = $chargeurModules->obtenirFonctions();
        foreach ($modulesFonctions as $fct) {
            include($fct);
        }
    }

    /*
     * vérifie si URL ou nom du service est permis selon config.php.
     */
    public function verifierPermis($szUrl, $restService=false){
        return $this->obtenirPermisUrl($szUrl, $restService) !== false;
    }

    public function obtenirPermisUrl($szUrl, $restService=false){
        //vérifier URL
        //Services

        $szUrl = $this->removeDblBackSlash($szUrl);

        $url = "";

        $serviceRep = array(
            "url" => "",
            "test" => false
        );

        $session = $this->getDI()->getSession();

        if($session->has("info_utilisateur") && isset($this->config['permissions'])) {
            //utilisateur
            if(($session->info_utilisateur->identifiant) && isset($this->config->permissions[$session->info_utilisateur->identifiant]) && isset($this->config->permissions[$session->info_utilisateur->identifiant]->servicesExternes)){
                $serviceExtUser = $this->config->permissions[$session->info_utilisateur->identifiant]->servicesExternes;
                $serviceRep = self::verifieDomaineFunc($serviceRep, $szUrl, $serviceExtUser, $restService);
            }

            //profils
            if($serviceRep["test"] === false && isset($session->info_utilisateur->profils)){
                $test = false;
                foreach ($session->info_utilisateur->profils as $key => $value) {
                    $idValue = $value["id"];
                    $profil = $value["libelle"];
                    if(!isset($session->info_utilisateur->profilActif) || $idValue == $session->info_utilisateur->profilActif){
                        if(isset($profil) && isset($this->config->permissions[$profil]) && isset($this->config->permissions[$profil]->servicesExternes)){
                            $serviceExtProfil = $this->config->permissions[$profil]->servicesExternes;
                            $serviceRep = self::verifieDomaineFunc($serviceRep, $szUrl, $serviceExtProfil, $restService);
                            if($serviceRep["test"] !== false){
                                $test = true;
                                if ($serviceRep["url"] !== false) {
                                    break;
                                }
                            }
                        }
                    }
                }

                $serviceRep["test"] = $test;
            }
        } else if (!$session->has("info_utilisateur")) {
            return false;
        }

        //general
        if (($serviceRep["test"] === false || $serviceRep["url"] === true) && isset($this->config['servicesExternes'])) {

            $servicesExternes = $this->config['servicesExternes'];

            $serviceRep = self::verifieDomaineFunc($serviceRep, $szUrl, $servicesExternes, $restService);
        }

        if (($serviceRep["url"] === false) || ($serviceRep["test"] === false)) {
            return false;
        }

        if ($serviceRep["test"] === true && $serviceRep["url"] === "") {
            if(is_object($serviceRep["regex"])){
                $serviceRep["regex"]["url"] = $szUrl;
                $szUrl = (array) $serviceRep["regex"];
            } else {
                $szUrl = array("url" => $szUrl);
            }
        } else {
            if(is_object($serviceRep["url"])){
                $szUrl = (array) $serviceRep["url"];
                if(!isset($szUrl['url'])){
                    $szUrl['url'] = $szUrl[0];
                }
            } else {
                $szUrl = array("url" => $serviceRep["url"]);
            }
        }

        return $szUrl;

    }



 /**
     * Obtenir Chaine de connexion au site securise
     * @param ??? $service
     * @param ??? $restService
     * @return ??? $auth
     */

    public function obtenirChaineConnexion($service, $restService=false){
        global $app;

        $permisUrl = self::obtenirPermisUrl($service, $restService);

        if($permisUrl === false){
            http_response_code(403);
            die("Vous n'avez pas les droits pour ce service.");
        }

       //Decrypter la chaine de connexion
        if (!empty($permisUrl['connexion']) || !empty($permisUrl['user'])) {
            $auth = array();
            if(!empty($permisUrl['user'])) {
                $auth['user'] = $permisUrl['user'];
            }
            if(!empty($permisUrl['pass'])) {
                $auth['pass'] = $permisUrl['pass'];
            }
            if(!empty($permisUrl['methode'])) {
                $auth['method'] = $permisUrl['methode'];
            }
            if(!empty($permisUrl['cainfo'])) {
                $auth['cainfo'] = $permisUrl['cainfo'];
            }
            if(!empty($permisUrl['verifypeer'])) {
                $auth['verifypeer'] = $permisUrl['verifypeer'];
            }

            if(!empty($permisUrl['connexion'])){
                $crypt = $this->getDI()->get("crypt");
                $chaine = explode(",", $crypt->decryptBase64(urldecode($permisUrl['connexion'])));
                $auth['user'] = ltrim(trim($chaine[0]), " user:");
                $auth['pass'] = ltrim(trim($chaine[1]), " pass:");
                if (empty($auth['pass'])) {
                    header('Content-Type: text/html; charset=utf-8');
                    http_response_code(401);
                    die("Votre clé n'est pas décryptée correctement.");
                }
            }

        }

          $auth['url'] = $permisUrl['url'];
          return $auth;
    }


    /**
     * Obtenir Chaine de connexion au site securise pour proxy
     * @param ??? $ch
     * @param ??? $url
     * @param ??? $method
     * @param ??? $url
     * @return ??? $ch
     */
    public function proxyChaineConnexion ($ch, $url, $method, $options) {

        if (!empty ($options['auth'])) {
            $auth = $options['auth'];
            if (isset ($auth['user']) && isset ($auth['pass'])) {
                //On obtient le payload (objectif chercher dans le payload les url securisees)
                $postdata = file_get_contents ("php://input");
                //Seul le post xml de zoo est modifié
                if (!empty ($postdata) && strpos ($postdata, 'wps:Execute') !== false) {
                    $doc = new DOMDocument();
                    $doc->loadXML ($postdata);
                    $domList = $doc->getElementsByTagNameNS ('*', '*');
                    //on navigue dans tout le payload
                    for ($i = 0; $i < $domList->length; $i++) {
                        if ($domList->item ($i)->tagName === 'wps:Reference') {
                            $xmlurl = $domList->item ($i)->getAttribute ('xlink:href');
                            $partsxml = parse_url ($xmlurl);
                            //les credentials a ajouter dans le xml on verifié s il y en as
                            if (isset ($xmlurl) && $partsxml['scheme'] === 'https') {
                                if ($xmlurl !== $url) {
                                    //les credentials des urls qu on as pas
                                    $authxml = $this->obtenirChaineConnexion ($partsxml['scheme'] . '://' . $partsxml['host'] . $partsxml['path'], $restService = false);
                                    if (isset ($authxml['user']) && isset ($authxml['pass']) && isset($partsxml['host']) && isset($partsxml['path']) && isset ( $partsxml['query'])) {
                                        $urlxml = $partsxml['scheme'] . '://' . $authxml['user'] . ':' . $authxml['pass'] . '@' . $partsxml['host'] . $partsxml['path'] . '?' . $partsxml['query'];
                                    } else if (isset ($authxml['user']) && isset ($authxml['pass']) && isset($partsxml['host']) && isset($partsxml['path'])) {
                                        $urlxml = $partsxml['scheme'] . '://' . $authxml['user'] . ':' . $authxml['pass'] . '@' . $partsxml['host'] . $partsxml['path'] ;
                                    }
                                    $xmlpost = str_replace ($xmlurl, $urlxml, $postdata);
                                    $postdata = $xmlpost;
                                }
                                //les credentials de zoo on possede deja dans le xml est modifié
                                if ($xmlurl === $url) {
                                    $urlxml = $partsxml['scheme'] . '://' . $auth['user'] . ':' . $auth['pass'] . '@' . $partsxml['host'] . $partsxml['path'];
                                    $xmlpost = str_replace ($xmlurl, $urlxml, $postdata);
                                    $postdata = $xmlpost;
                                }
                            }
                        }
                    }

                    curl_setopt ($ch, CURLOPT_POST, 1);
                    curl_setopt ($ch, CURLOPT_POSTFIELDS, $postdata);
                }

                //Necessaire pour le SSL sinon on voit pas les couches dans
                //la list des couche disponible analyse spatial

                //curl_setopt ($ch, CURLOPT_VERBOSE, 1);
                //curl_setopt ($ch, CURLOPT_CERTINFO, 1);

                 if (isset ($auth['cainfo'])) {
                    curl_setopt ($ch, CURLOPT_CAINFO, $auth['cainfo']);
                }

                //Verify peer pour le SSL 1 par défaut, 0 si dans config 'verifypeer' => 'Off' (pas de vérification)
                if (isset ($auth['verifypeer']) && $auth['verifypeer'] == 'Off') {
                    curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, 0);
                } else {
                    curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, 1);
                }

                curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 2);

                curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt ($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt ($ch, CURLOPT_CUSTOMREQUEST, $method);

                switch ($auth['method']) {
                    case "BASIC":
                        curl_setopt ($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
                        break;
                    case "NTLM":
                        curl_setopt ($ch, CURLOPT_HTTPAUTH, CURLAUTH_NTLM);
                        break;
                    case "GSSNEGOTIATE":
                        curl_setopt ($ch, CURLOPT_HTTPAUTH, CURLAUTH_GSSNEGOTIATE);
                        break;
                    case "DIGEST":
                        curl_setopt ($ch, CURLOPT_HTTPAUTH, CURLAUTH_DIGEST);
                        break;
                    default:
                        curl_setopt ($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
                        break;
                }

                curl_setopt ($ch, CURLOPT_USERPWD, $auth['user'] . ':' . $auth['pass']);
            }
        }

        return $ch;
    }
    private function verifieDomaineRegexFunc($service, $arrayRegex) {
        foreach ($arrayRegex as $regex) {
            if ($regex[0] === '#' || $regex[0] === '/') {
                $trustedDom = $regex;
            } else if ($regex[0] === "*") {
                $trustedDom = "#(.)+#";
            } else if (is_array([$regex])) {
                if(!isset($regex['url'])){
                    $regex['url'] = $regex[0];
                }
                $trustedDom = $regex['url'];
            } else {
                $trustedDom = '#' . preg_quote($regex, '#') . '#';
            }
             if($trustedDom === $service || preg_replace($trustedDom, 'ok', $service) === "ok"){
                return $regex;
            }
        }

        return false;
    }

    private function verifieDomaineFunc($serviceRep, $service, $arrayServicesExternes, $restService){
        if(isset($arrayServicesExternes[$service])){
            if($restService == false){return $serviceRep;}
            $serviceRep["url"] = $arrayServicesExternes[$service];
            $serviceRep["test"] = true;
        } else {
            $serviceArray = explode("?", $service);
            $serviceSplit = $serviceArray[0];
            if (isset($arrayServicesExternes['regexInterdits'])) {
                $serviceRep["test"] = self::verifieDomaineRegexFunc($serviceSplit, $arrayServicesExternes['regexInterdits']) !== false;
            }
            if ($serviceRep["test"] === true) {
                $serviceRep["url"] = false;
            } else if (isset($arrayServicesExternes['regex']) && (strpos($serviceSplit, '/') !== false)) {
                $serviceRep['regex'] = self::verifieDomaineRegexFunc($serviceSplit, $arrayServicesExternes['regex']);
                $serviceRep["test"] = $serviceRep['regex'] !== false;
            }
        }

        return $serviceRep;
    }


    /**
     * Obtenir une url sans double backslash. Permet ainsi de résoudre
     * correctement les regex pour les urls permis.
     * @param ??? $url url à vérifier
     * @return ??? $resultat url sans double backslash
     */
    private function removeDblBackSlash($url){

       $resultat = preg_replace('/(?<!http:|https:)\/\//i', '/',$url);

        if(preg_match('/(?<!http:|https:)\/\//i',$resultat) === 1){
            $resultat = $this->removeDblBackSlash($resultat);
        }

        if($resultat === null){
            $resultat = $url;
        }

        return $resultat;
    }
}
