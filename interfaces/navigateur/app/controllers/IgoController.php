<?php
class IgoController extends ControllerBase
{
    public function indexAction() {
        $this->definirVariablesCommunes();
        $this->view->setVar("titre", "Navigateur");
        if(isset($this->getDi()->getConfig()->configurations["defaut"])){
            $xmlPath = $this->getDi()->getConfig()->configurations["defaut"];
        } else {
            $xmlPath = $this->getDi()->getConfig()->configurationsDir . "defaut" . '.xml';
        }
        $filemtime = filemtime ($xmlPath);        
        $this->view->setVar("configuration", "defaut?v={$filemtime}");
        $this->view->setVar("contexteId", "null");
        $this->view->setVar("contexteCode", "null");
        $this->view->setVar("couche", "null");
    }
    
    public function configurationAction($configuration) {
        $this->definirVariablesCommunes();

        if(isset($this->getDi()->getConfig()->configurations[$configuration])){
            $xmlPath = $this->getDi()->getConfig()->configurations[$configuration];
        } else {
            $xmlPath = $this->getDi()->getConfig()->configurationsDir . $configuration . '.xml';
        }

        if(file_exists($xmlPath)){
            $element = simplexml_load_file($xmlPath);            
        } else { //url externe
            $element = simplexml_load_string(curl_file_get_contents($xmlPath)); 
        }
        if(isset($element->attributes()->titre)){
            $titre = $element->attributes()->titre;
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
        $this->view->setVar("configuration", $configuration . "?v={$filemtime}");
        
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
                
        if(isset($element->attributes()->baseUri) && isset($element->attributes()->libUri)){
            $this->config->uri->librairies = $element->attributes()->baseUri . $element->attributes()->libUri;
        }
        if(isset($element->attributes()->baseUri) && isset($element->attributes()->serviceUri)){
            $this->config->uri->services = $element->attributes()->baseUri . $element->attributes()->serviceUri;
        }
        if(isset($element->attributes()->baseUri) && isset($element->attributes()->apiUri)){
            $this->config->uri->api = $element->attributes()->baseUri . $element->attributes()->apiUri;
        }        
        if(isset($element->attributes()->baseUri) && isset($element->attributes()->mapserver)){
            $this->config->uri->mapserver = $element->attributes()->mapserver;
        }
        $this->getDi()->getView()->config = $this->config;
        
        if(isset($element->attributes()->baseUri)){
            $this->config->uri->navigateur = $element->attributes()->baseUri;
            $this->config->application->baseUri = $this->config->uri->navigateur;
        }                
    }
    
    public function contexteAction($code) {
        $this->definirVariablesCommunes();
        $this->view->setVar("titre", "Navigateur");
        if(isset($this->getDi()->getConfig()->configurations["defaut"])){
            $xmlPath = $this->getDi()->getConfig()->configurations["defaut"];
        } else {
            $xmlPath = $this->getDi()->getConfig()->configurationsDir . "defaut" . '.xml';
        }
        $filemtime = filemtime ($xmlPath);
        $this->view->setVar("configuration", "defaut?v={$filemtime}");
        $this->view->setVar("couche", "null");
        
        $type = "id";
        if(!is_numeric($code)){
            $type = "code";      
            $contexte = IgoContexte::findFirst("$type='$code'");
        } else {
            $contexte = IgoContexte::findFirst("$type=$code");
        }

        $this->view->setVar("contexteCode", "null");
        $this->view->setVar("contexteId", "null");
        if($contexte){
            $this->view->setVar("contexte".ucfirst($type), $code . "?v=" . md5($contexte->date_modif));
        }else {
            $this->view->setVar("avertissement", "Le contexte avec le $type:$code n'existe pas");
        }
    }

    public function coucheAction($id) {  
         
        $filterArray = function ($value){
            if(is_numeric($value)){
                return $value;
            }
        };
                
        $this->definirVariablesCommunes();
        $this->view->setVar("titre", "Navigateur");
        if(isset($this->getDi()->getConfig()->configurations["defaut"])){
            $xmlPath = $this->getDi()->getConfig()->configurations["defaut"];
        } else {
            $xmlPath = $this->getDi()->getConfig()->configurationsDir . "defaut" . '.xml';
        }
        $filemtime = filemtime ($xmlPath);        
        $this->view->setVar("configuration", "defaut?v={$filemtime}");
        $arrayCoucheId = array_filter(explode(",",$id), $filterArray);    
            
        $couches = array();
        foreach ($arrayCoucheId as $key => $value) {
            $couche = IgoCouche::findFirst("id=$value");
           
            if($couche === false){
                continue;
            }
           
            $couches[] = $couche;
        }

        if(count($couches)>=1){
            $this->view->setVar("couche", implode(',', $arrayCoucheId) . "?v=" . md5(rand(1000, 9999999)));
        }else {
            $this->view->setVar("avertissement", "Aucune couche n'a été trouvée avec le(s) id(s) suivant :".implode(";", $arrayCoucheId));
            $this->view->setVar("couche", "null"); 
        }
    }
    
     public function groupeAction($id) {
         
        $filterArray = function ($value){
            if(is_numeric($value)){
                return $value;
            }
        };
                  
        $this->definirVariablesCommunes();
        $this->view->setVar("titre", "Navigateur");
        if(isset($this->getDi()->getConfig()->configurations["defaut"])){
            $xmlPath = $this->getDi()->getConfig()->configurations["defaut"];
        } else {
            $xmlPath = $this->getDi()->getConfig()->configurationsDir . "defaut" . '.xml';
        }
        $filemtime = filemtime ($xmlPath);        
        $this->view->setVar("configuration", "defaut?v={$filemtime}");
        $arrayGroupeCoucheId = array_filter(explode(",",$id), $filterArray);    
        
        $couches = array();
        foreach ($arrayGroupeCoucheId as $key => $value) {

            $couche = IgoGroupeCouche::find("groupe_id=$value");
           
            if(count($couche)==0){
                continue;
            }
         
            foreach($couche as $value){
                if(is_numeric($value->couche_id)){
                    $couches[] = $value->couche_id;
                }
                else{
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
        }else {
            $this->view->setVar("avertissement", "Aucun groupe n'a été trouvé avec le(s) id(s) suivant :".implode(";", $arrayGroupeCoucheId));
            $this->view->setVar("couche", "null"); 
        }
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
        $application->getDI()->getSession()->set('page','../'.$application->getDi()['router']->getRewriteUri());

        if($application->getDI()->getSession()->has("info_utilisateur")){
            if($application->getDI()->getSession()->get("info_utilisateur")->identifiant){
                $user = $application->getDI()->getSession()->get("info_utilisateur")->identifiant;
                $idProfil = $application->getDI()->getSession()->get("info_utilisateur")->profilActif;
                if(isset($application->getDI()->getSession()->get("info_utilisateur")->profils)){
                    $count = count($application->getDI()->getSession()->get("info_utilisateur")->profils);
                    foreach($application->getDI()->getSession()->get("info_utilisateur")->profils as $value){
                        if($value['id']== $idProfil){
                             $libelleProfil = $value['libelle']; 
                             break;
                        }
                    }
                }
                if($libelleProfil === ''){
                    $count = 0;
                }
            }
        }
        $this->view->setVar("profil", $libelleProfil);   
        $this->view->setVar("utilisateur", $user);   
        $this->view->setVar("nbProfil", $count);   
        
        if(($this->request->get('url')||$this->request->get('URL'))){
                       
            $filter = new \Phalcon\Filter();
            $filter->add('url', function($value) {
                filter_var($value, FILTER_SANITIZE_URL);
            });
            
            $url = $this->request->get('url')?$this->request->get('url'):$this->request->get('URL');
            $layers = $this->request->get('layers')?$this->request->get('layers','string'):$this->request->get('LAYERS','string');
            
            if($layers==null && strrpos($url, 'layers')!==false ){
                $layers = substr($url, strrpos($url, 'layers')+7);
                $url = substr($url,0, strrpos($url, 'layers')); 
            }
            
            if($layers==null && strrpos($url, 'LAYERS')!==false){
                $layers = substr($url, strrpos($url, 'LAYERS')+7);
                $url = substr($url,0, strrpos($url, 'LAYERS'));
            }
            
            $filter->sanitize($url,'url');
            $active = $layers==null?'false':'true';
                        
            $fonctionCallback = 
                "function(e){
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
        }   
        else{
            $this->view->setVar("callbackInitIGO", 'null');
        }
    }
    
    /*
     * vérifie si URL ou nom du service est permis selon config.php.
     * retour false ou l'url permis
     */
    public function verifierPermis($szUrl){
        
        //vérifier URL 
        //Services
        $url = "";
        $serviceRep = array(
            "url"  => "",
            "test" => false
        );
        $session = $this->getDI()->getSession();
        
        if($session->has("info_utilisateur") && isset($this->config['profilsDroit'])) {
            //utilisateur
            if(($session->info_utilisateur->identifiant) && isset($this->config->profilsDroit[$session->info_utilisateur->identifiant])){
                $serviceExtUser = $this->config->profilsDroit[$session->info_utilisateur->identifiant];
                $serviceRep = self::verifieDomaineFunc($serviceRep, $szUrl, $serviceExtUser);
            }
               
            //profils
            if($serviceRep["test"] === false && isset($session->info_utilisateur->profils)){
           
                $test = false;
                foreach ($session->info_utilisateur->profils as $key => $value) {
                    if(is_array($value)){
                        $idValue = $value["id"];
                        $profil = $value["libelle"];
                    } else {
                        $idValue = $value->id;
                        $profil = $value->libelle;
                    }
                    if(!isset($session->info_utilisateur->profilActif) || $idValue == $session->info_utilisateur->profilActif){
                        if(isset($profil) && isset($config->profilsDroit[$profil])){
                            $serviceExtProfil = $this->config->profilsDroit[$profil];
                            $serviceRep = self::verifieDomaineFunc($serviceRep, $szUrl, $serviceExtProfil);
                            if($serviceRep["test"] !== false){                        
                                $test = true;
                                if($serviceRep["url"] !== false){
                                    break;
                                }
                            }
                        }
                    }
                }
                $serviceRep["test"] = $test;
            }
        } else if(!$session->has("info_utilisateur")){
            return false;
        }
       
        //general
        if(($serviceRep["test"] === false || $serviceRep["url"] === true) && isset($this->config['servicesExternes'])) {
            $servicesExternes = $this->config['servicesExternes'];
            $serviceRep = self::verifieDomaineFunc($serviceRep, $szUrl, $servicesExternes);
        }
        
        if(($serviceRep["url"] === false)||($serviceRep["test"]===false)){
            return false;
        }

        if ($serviceRep["test"] === true && $serviceRep["url"] === ""){
            $szUrl = $szUrl;
        } else {
            $szUrl = $serviceRep["url"];
        }
        
        return $szUrl;
    }
    
    private function verifieDomaineRegexFunc($service, $arrayRegex) {
        $trustedDom = array();
        foreach ($arrayRegex as $regex){
            if($regex[0] === '#' || $regex[0] === '/') {
                $trustedDom[] = $regex;
            } else if($regex[0] === "*"){
                $trustedDom[] = "#(.)+#";
            } else {
                $trustedDom[] = '#'.preg_quote($regex, '#').'#';
            }
        }
        $test = preg_replace($trustedDom, 'ok', $service);

        return $test==="ok";
    }
    
    private function verifieDomaineFunc($serviceRep, $service, $arrayServicesExternes){
        if(isset($arrayServicesExternes[$service])){
            $serviceRep["url"] = $arrayServicesExternes[$service];
            $serviceRep["test"] = true;
        } else {
            $serviceArray = explode("?", $service);
            $serviceSplit = $serviceArray[0];   
            if(isset($arrayServicesExternes['regexInterdits'])){
                $serviceRep["test"] = self::verifieDomaineRegexFunc($serviceSplit, $arrayServicesExternes['regexInterdits']);
            }
            if($serviceRep["test"] === true){
                $serviceRep["url"] = false;
            } else if(isset($arrayServicesExternes['regex']) && (strpos($serviceSplit,'/') !== false)) {
                $serviceRep["test"] = self::verifieDomaineRegexFunc($serviceSplit, $arrayServicesExternes['regex']);
            }
        } 
        return $serviceRep;
    }
}
