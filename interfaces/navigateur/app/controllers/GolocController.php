<?php
class GolocController extends ControllerBase
{
    public function indexAction() {
        $this->definirVariablesCommunes();
        $this->view->setVar("titre", "Navigateur");
        $xmlPath = $this->getDi()->getConfig()->configurations["defaut"];    
        $filemtime = filemtime ($xmlPath);        
        $this->view->setVar("configuration", "defaut?v={$filemtime}");
        $this->view->setVar("contexteId", "null");
        $this->view->setVar("contexteCode", "null");
        $this->view->setVar("couche", "null");
    }
    
    public function configurationAction($configuration) {
        
        $this->definirVariablesCommunes();

        $xmlPath = $this->getDi()->getConfig()->configurations[$configuration];    
        $element = simplexml_load_file($xmlPath);        
        if(isset($element->attributes()->titre)){
            $titre = $element->attributes()->titre;
        }else{
            $titre = "Navigateur";
        }
        $this->view->setVar("titre", $titre);
        $filemtime = filemtime($xmlPath);
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
        $xmlPath = $this->getDi()->getConfig()->configurations["defaut"];
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
        $xmlPath = $this->getDi()->getConfig()->configurations["defaut"];    
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
        $xmlPath = $this->getDi()->getConfig()->configurations["defaut"];    
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
            if(!$application->getDI()->getSession()->get("info_utilisateur")->estAnonyme &&
                isset($application->getDI()->getSession()->get("info_utilisateur")->profils)){
                $user = $application->getDI()->getSession()->get("info_utilisateur")->identifiant;
                $idProfil = $application->getDI()->getSession()->get("info_utilisateur")->profilActif;
                $count = count($application->getDI()->getSession()->get("info_utilisateur")->profils);
                foreach($application->getDI()->getSession()->get("info_utilisateur")->profils as $value){
                    if($value['id']== $idProfil){
                         $libelleProfil = $value['libelle']; 
                         break;
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
                            _useGetCapabilities:true
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
}
