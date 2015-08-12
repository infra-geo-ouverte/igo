<?php



try {
    $config = include __DIR__ . "/../app/config/config.php";
    
    include __DIR__ . "/../app/config/loader.php";
    include __DIR__ . "/../app/config/services.php";

    include $config->application->services->dir."fonctions.php";
    
    $app = new \Phalcon\Mvc\Micro();
    $app->setDI($di);
    
    $app->get('/configuration/{configuration}', function($configuration) use($di, $app) {                
        $configArray = explode(".", $configuration);
        $configKey = $configArray[0];
        $encoding = "json";
        if(count($configArray) === 2){
            $encoding = $configArray[1];
        }
     
        // Gerer le cas où on appelle une configuration inexistante et où il y aurait une erreur dans la configuration.
        if(isset($di->getConfig()->configurations[$configKey])){
            $xmlPath = $di->getConfig()->configurations[$configKey];
        } else {
            $xmlPath = $di->getConfig()->configurationsDir . $configKey . '.xml';
        }
        if(!file_exists ($xmlPath) && !curl_url_exists($xmlPath)){
            $app->response->setStatusCode(404, "Not Found");
            $error = new stdClass();
            $error->error = "La configuration « {$configuration} » n'existe pas!";
            $app->response->send();
            die(json_encode($error));                        
        }
        if($encoding === "json"){
            $app->response->setContentType('application/json; charset=UTF-8')->sendHeaders();  

            if(file_exists($xmlPath)){
                $element = simplexml_load_file($xmlPath, 'SimpleXMLElement', LIBXML_NOCDATA);           
            } else {
                $element = simplexml_load_string(curl_file_get_contents($xmlPath), 'SimpleXMLElement', LIBXML_NOCDATA);   
            }

            if ($element->getName() === "navigateur" ){
                
                //Gerer le cas des couches seulement avec un Id
                //Retourner l'info pour creer correctement la couche cote client
                $result = $element->xpath('//couche[boolean(@idbd)]');
                $avertissement = null;
                $debug = $app->getDI()->get("config")->application->debug;
                foreach($result as $couche){
                    $coucheId =  $couche->attributes()->idbd->__toString();
                                      
                    if(is_numeric($coucheId)){
                        $coucheBd = IgoVueCouche::findFirst("id=".$coucheId);
                    }
                    else{
                        $coucheBd = IgoVueCouche::findFirst("mf_layer_name='".$coucheId."'");
                    }

                    if($coucheBd === false){
                        if(is_numeric($coucheId)){
                            $avertissement[] = "La couche avec id:« {$coucheId} » n'existe pas!";   
                            $dom=dom_import_simplexml($couche);
                            $dom->parentNode->removeChild($dom);
                            continue;
                        }
                        else{
                            $avertissement[] = "La couche avec mf_layer_name:« {$coucheId} » n'existe pas!";
                            $dom=dom_import_simplexml($couche);
                            $dom->parentNode->removeChild($dom);
                            continue;
                        }         
                    }
                    
                    //Vérifier l'access
                    $permission = obtenirPermission($coucheBd->id);
                    if($permission != null && $permission->est_lecture){
                        if($coucheBd->connexion_type == 'POSTGIS' || $coucheBd->connexion_type == null){
                            $mf_map_meta_onlineresource =   $di->getConfig()->mapserver['host'].
                                                            $di->getConfig()->mapserver['mapserver_path'] .
                                                            $di->getConfig()->mapserver['executable'].
                                                            $di->getConfig()->mapserver['mapfileCacheDir'] .
                                                            $di->getConfig()->mapserver['couchesCacheDir'] .
                                                            $coucheBd->mf_layer_name .
                                                            '.map';
                            $protocole = 'WMS';
                            //ne pas exposer 
                            unset($coucheBd->connexion);

                        }
                        else{
                            $mf_map_meta_onlineresource = $coucheBd->connexion;
                            $protocole = $coucheBd->connexion_type;

                        }

                        !$couche->attributes()->nom?$couche->addAttribute("mf_map_meta_onlineresource",$mf_map_meta_onlineresource):null;
                        !$couche->attributes()->protocole?$couche->addAttribute("protocole",$protocole):null;
                        !$couche->attributes()->nom?$couche->addAttribute("nom",$coucheBd->mf_layer_name):null;
                        !$couche->attributes()->titre?$couche->addAttribute("titre",$coucheBd->mf_layer_meta_title):null;
                        !$couche->attributes()->url?$couche->addAttribute("url",$mf_map_meta_onlineresource):null;
                        !$couche->attributes()->fond?$couche->addAttribute("fond",$coucheBd->est_fond_de_carte):null;

                        foreach($coucheBd as $key =>$value){
                            if(!$couche->attributes()->$key){
                                $couche->addAttribute($key,$value);
                            }
                        }                        
                    }
                    else{
                         if (isset($debug) && ($debug > 1 || $debug===true)){
                            $avertissement[] = 'Vous n\'avez pas les droits sur la couche "'
                                                .$coucheBd->mf_layer_meta_title.'" (id:'.$coucheBd->id.')';
                        }                    
                        $dom=dom_import_simplexml($couche);
                        $dom->parentNode->removeChild($dom);       
                    }
                }
                                
                if($avertissement != null){
                    foreach($avertissement as $value){
                        $element->addChild('avertissements', $value);
                    }
                }
                
                echo json_encode($element);               
            }
            else{
                $app->response->setStatusCode(404, "Not Found");
                $error = new stdClass();
                $error->error = "L'élément racine du fichier de configuration doit se nommer « navigateur »!";
                $app->response->send();
                die(json_encode($error));                                                    
            }                
        }else{        
            $app->response->setStatusCode(404, "Not Found");
            $error = new stdClass();
            $error->error = "L'encodage «{$encoding} » n'est pas supporté!";
            $app->response->send();
            die(json_encode($error));                                    
        }
    });

    function obtenirContexte($contexteId){
        global $app;
        $contexte = IgoContexte::findFirst("id=$contexteId");
        if($contexte === false){
            $app->response->setStatusCode(404, "Not Found");
            $error = new stdClass();
            $error->error = "Le contexte « {$contexteId} » n'existe pas!";
            $app->response->send();
            die(json_encode($error));            
        }
        return $contexte;
    }

    function obtenirContexteParCode($contexteCode){
        global $app;
        $contexte = IgoContexte::findFirst("code='$contexteCode'");
        if($contexte === false){
            $app->response->setStatusCode(404, "Not Found");
            $error = new stdClass();
            $error->error = "Le contexte « {$contexteCode} » n'existe pas!";
            $app->response->send();
            die(json_encode($error));            
        }
        return $contexte;
    }
    
    function estAuthentifie($session) {
        if(!$session->has("info_utilisateur"))
            return false;
        return $session->get("info_utilisateur")->estAuthentifie;
    }

    function estAnonyme($session) {        
        if(!$session->has("info_utilisateur"))
            return true;
        return $session->get("info_utilisateur")->estAnonyme;
    }
    
    function obtenirProfils($session) {
        return $session->get("info_utilisateur")->profils;
    }

    function obtenirAuthentificationModule(){
        global $app;
        // Construire un tableau associatif de permissions avec le id de la couche ou groupe de couche comme clef.
        $authentificationModule = $app->getDI()->get("authentificationModule");
        if($authentificationModule == null){
            return null;
        }
        if(!estAuthentifie($app->getDI()->getSession()) && !estAnonyme($app->getDI()->getSession())){
            $app->response->setStatusCode(401, "Unauthorized");
            $error = new stdClass();
            $error->error = "Vous n'êtes pas authentifié!";
            $app->response->send();
            die(json_encode($error));            
        }
        return $authentificationModule;
    }    
     function obtenirUtilisateurProfilsInQuery() {
        global $app;
        $authentificationModule = $app->getDI()->get("authentificationModule");

        if (estAnonyme($app->getDI()->getSession())) {
            $configuration = $app->getDI()->get("config");
            if(!isset($configuration->application->authentification->nomProfilAnonyme)){
                return (string) '0';
            }
            return (string) '0,'.IgoProfil::findFirst("nom = '{$configuration->application->authentification->nomProfilAnonyme}'")->id;
        }
            
        if(!is_null($app->getDI()->getSession()->get("info_utilisateur")->profilActif)) {
            $profil = $app->getDI()->getSession()->get("info_utilisateur")->profilActif;
            return (string) '0,'.$profil;
        }else{
            $profils = obtenirProfils($app->getDI()->getSession());
            $profilsArray = array();
            foreach ($profils as $profil) {
                array_push($profilsArray, $profil["id"]);
            }
            array_push($profilsArray, 0); // défaut
            return implode(",", $profilsArray);
        }
    }
    
    function obtenirPermission($couche_id){
        global $app;
        if(is_null($app->getDI()->getConfig()->database)) {
            return null;
        }else{
            $conditions = "profil_id in (" . obtenirUtilisateurProfilsInQuery() . ") AND (couche_id = ?1)";        
            $parameters = array(1 => $couche_id);
            $permission = IgoVuePermissionsPourCouches::findFirst(array(
                $conditions,
                "bind" => $parameters,
                "columns" => "couche_id, bool_or(est_lecture) as est_lecture, bool_or(est_ecriture) as est_ecriture, bool_or(est_analyse) as est_analyse, bool_or(est_export) as est_export",
                "group" => "couche_id"
            ));
            return $permission;
        }
    }
    
    function obtenirGroupeCouche($coucheId){ 
        $groupes = IgoGroupeCouche::find("couche_id=".$coucheId);
        // TODO cleanup
        $in='';
        foreach($groupes as $value){
            $in .= $value->groupe_id . ','; 
        }
        return  substr($in,0,strlen($in)-1);
    } 
    
   $app->get('/couche/{coucheId}', function($coucheId) use($di, $app){
        
        $authentificationModule = obtenirAuthentificationModule();
        $arrayCoucheId = explode(",",$coucheId);
        $couches = array();
        $avertissements = null;
        $debug = $app->getDI()->get("config")->application->debug;
        foreach ($arrayCoucheId as $key => $value) {
            
            $couche = IgoVueCouche::findFirst("id=$value");
            
            if($couche === false){
                $avertissements[] = 'La couche avec le id:'.$value.' n\'existe pas.';
                continue;
            }
            
            $permission = obtenirPermission($couche->id);
            if($permission != null && $permission->est_lecture){
                 
                if($couche->connexion_type == 'POSTGIS' || $couche->connexion_type == null){

                    $couche->mf_map_meta_onlineresource = 
                                                        $di->getConfig()->mapserver['host'].
                                                        $di->getConfig()->mapserver['mapserver_path'] .
                                                        $di->getConfig()->mapserver['executable'].
                                                        $di->getConfig()->mapserver['mapfileCacheDir'] .
                                                        $di->getConfig()->mapserver['couchesCacheDir'] .
                                                        $couche->mf_layer_name .
                                                        '.map';
                    $couche->protocole = 'WMS';  
                    //ne pas exposer
                    unset($couche->connexion);
                }
                else{
                    $couche->mf_map_meta_onlineresource = $couche->connexion;
                    $couche->protocole = $couche->connexion_type;
                    $couche->nom = $couche->mf_layer_name;
                }

                $couche->est_active = true;
                $couche->est_visible = true;

                $couches[] = $couche;
            }
            else{
                 if (isset($debug) && ($debug > 1 || $debug===true)){
                    $avertissements[] = 'Vous n\'avez pas les droits sur la couche "'.$couche->mf_layer_meta_title.'" (id:'.$value.').';
                }
            }
            
        }
        
        if($avertissements != null){
            $reponse = array('couches'=>$couches, 'avertissements'=>$avertissements);
        }
        else{
            $reponse = $couches;
        }
        
        $app->response->setContentType('application/json; charset=UTF-8')->sendHeaders();        
        echo json_encode($reponse);
    }); 
    
    $app->get('/contexteCode/{contexteCode}', function($contexteCode) use($app, $di){
        $contexte = obtenirContexteParCode($contexteCode);              
        obtenirInfoContexte($contexte, $app, $di);
    });

    $app->get('/contexte/{contexteId:[0-9]+}', function($contexteId) use($app, $di){
        $contexte = obtenirContexte($contexteId);      
        obtenirInfoContexte($contexte, $app, $di);
    });
    
    function obtenirInfoContexte($contexte, $app, $di){
        $contexteId = $contexte->id;
        $contexteCouches = IgoVueContexteCoucheNavigateur::find(array("conditions"=>"contexte_id=$contexteId","order"=>array("layer_a_order","mf_layer_meta_group_title","mf_layer_meta_title")));        
        $authentificationModule = obtenirAuthentificationModule();
        $array = array();
        $avertissements = null;
        $debug = $app->getDI()->get("config")->application->debug;
        foreach($contexteCouches as $couche){
            // Petite passe croche pour établire le protocole des couches...
            if($couche->connexion_type !== "Google" 
                    && $couche->connexion_type !== "TMS" 
                    && $couche->connexion_type !== "OSM" 
                    && $couche->connexion_type !== "Blanc"){
                $couche->protocole = "WMS";
                //ne pas exposer
                unset($couche->connexion);
            }else{
                $couche->protocole = $couche->connexion_type;   
                $couche->mf_map_meta_onlineresource = $couche->connexion;
            }
            unset($couche->connexion_type);
            if($authentificationModule==null){
                unset($couche->couche_id);
                $array[] = $couche;
            }else{
                $permission = obtenirPermission($couche->couche_id);
                
                if($permission != false && $permission->est_lecture){
                    unset($couche->couche_id);
                    $array[] = $couche;
                    
                    if($couche->mf_layer_meta_def){
                        $test= preg_match("/wms_timeitem\"\s\"([^\"]*)/i", $couche->mf_layer_meta_def, $matches);
                        ($test==1&&isset($matches[1]))?$couche->wms_timeitem = true:$couche->wms_timeitem = false;
                        
                        $test= preg_match("/msp_wmst_multiplevalues\"\s\"([^\"]*)/i", $couche->mf_layer_meta_def, $matches);
                        ($test==1&&isset($matches[1]))?$couche->msp_wmst_multiplevalues = true:$couche->msp_wmst_multiplevalues = false;
                        
                        $test= preg_match("/wms_timedefault\"\s\"([^\"]*)/i", $couche->mf_layer_meta_def, $matches);
                        if($test==1&&isset($matches[1]))$couche->wms_timedefault = $matches[1];
                        
                        $test= preg_match("/wms_timeextent\"\s\"([^\"]*)/i", $couche->mf_layer_meta_def, $matches);
                        if($test==1&&isset($matches[1]))$couche->wms_timeextent = $matches[1];                               
                    }    
                }else{
                    if (isset($debug) && ($debug > 1 || $debug===true)){                 
                        $avertissements[] = 'Vous n\'avez pas les droits sur la couche "'.$couche->mf_layer_meta_title.'" (id:'.$couche->couche_id.')';
                    }
                }            
            }
        }
        
        $contexte->couches = $array;
        
        if($avertissements != null){
            $contexte->avertissements = array('avertissements'=>$avertissements);    
        }
        
        $app->response->setContentType('application/json; charset=UTF-8')->sendHeaders();        
        echo json_encode($contexte);
    }        

    $app->map('/wms/{contexteId:[0-9]+}',"wms_proxy")->via(array('GET','POST'));
    
    function wms_proxy($contexteId){
        global $app;
        $httprequest = new Phalcon\Http\Request();
        $httprequest->setDI($app->getDI());
        
        //Possible sanitize filters: string, email, int, float, alphanum, striptags, trim, lower, upper
        $filter = new \Phalcon\Filter();
        
        if($httprequest->isGet() || $httprequest->isPost()){  
            $datain = $httprequest->get();
            $data = array();
            foreach($datain as $key=>$value){
                $data[strtoupper($key)] = $value;
            }            
            $service = $filter->sanitize($data["SERVICE"], array("string","upper"));
            $request = $filter->sanitize($data["REQUEST"], array("string","upper"));
        }else{
            // TODO : Gérer l'erreur, on ne peut appeler un service wms en put ou en delete.
            error_log("not a get or a post?");
            return;
        }
        error_log("service: {$service}, request: {$request}");
        if($service === "WMS"){
            
            $config = $app->getDI()->get("config");
            $mapserver = $config['mapserver']['host'] . $config['mapserver']['mapserver_path'] . $config['mapserver']['executable'];
            $contexte = IgoContexte::findFirst("id='$contexteId'");
            $map = $config['mapserver']['mapfileCacheDir'] . $config['mapserver']['contextesCacheDir'] . $contexte->code . ".map";

            $method = $httprequest->getMethod();
            $data = $httprequest->get();
            $data["MAP"] = $map;            
            $response = null;
            switch($request){
                case "GETCAPABILITIES":
                    $response = proxy_request($mapserver, $data , $method);
                    // Devrait-on enlever les couches non permises en lecture de la réponse.? C'est probablement trop complexe...
                    break;
                case "GETMAP":
                case "GETFEATUREINFO":   
                case "DESCRIBELAYER":    
                case "GETLEGENDGRAPHIC":                    
                    $authentificationModule = obtenirAuthentificationModule();
                    if($authentificationModule === null){
                        $response = proxy_request($mapserver, $data , $method);                        
                    }else{
                        if(isset($data["LAYERS"])){
                            $couches = explode(",", $data["LAYERS"]);
                        }
                        else{
                            $couches = explode(",", $data["LAYER"]);
                        }
                        foreach($couches as $couche){
                            $igoVueContexteCoucheNavigateur = IgoVueContexteCoucheNavigateur::findFirst("mf_layer_name='$couche'");
                            $coucheContexte = array($igoVueContexteCoucheNavigateur);
                            if($igoVueContexteCoucheNavigateur === false){
                                $coucheContexte = IgoVueContexteCoucheNavigateur::find("mf_layer_group='$couche' and contexte_id='$contexteId'");
                            }
                            
                            if(count($coucheContexte) === 0){
                                // L'utilisateur essaie d'appeler la couche root du mapfile qui consiste à toutes les couches. 
                                // Nous interdissons ce type d'appels pour le moment.
                                die("Forbidden");
                            }
                            $estPermis = false;
                            foreach($coucheContexte as $igoVueContexteCoucheNavigateur ){
                                $permission = obtenirPermission($igoVueContexteCoucheNavigateur->couche_id);
                                if($permission !== null && $permission->est_lecture){
                                    $estPermis = true;
                                    break;
                                }            
                            }
                            if(!$estPermis){
                                die("Forbidden");
                            }
                        }
                        $response = proxy_request($mapserver, $data , $method);           
                    }
                    break;
                default:
                    break;
            }
            
            $headerArray = explode("\r\n", $response["header"]);
            foreach($headerArray as $headerLine) {
                header($headerLine);
            }
            echo $response["content"];
            
        }else{
            die("Seul les services WMS sont pris en charge par ce proxy.");
        }
    }
    
    function proxy_request($url, $data, $method) {
        // Based on https://github.com/eslachance/php-transparent-proxy Copyright (c) 2011, Eric-Sebastien Lachance <eslachance@gmail.com>
        // Based on post_request from http://www.jonasjohn.de/snippets/php/post-request.htm
        global $ip;
        // Convert the data array into URL Parameters like a=b&foo=bar etc.
        $data = http_build_query($data);
        $datalength = strlen($data);

        // parse the given URL
        $url = parse_url($url);

        if ($url['scheme'] != 'http') { 
            die('Error: Only HTTP request are supported !');
        }

        // extract host and path:
        $host = $url['host'];
        $path = $url['path'];

        // open a socket connection on port 80 - timeout: 30 sec
        $fp = fsockopen($host, 80, $errno, $errstr, 30);

        if ($fp){
            // send the request headers:
            if($method == "POST") {
                fputs($fp, "POST $path HTTP/1.1\r\n");
            } else {
                fputs($fp, "GET $path?$data HTTP/1.1\r\n");
            }
            fputs($fp, "Host: $host\r\n");

            fputs($fp, "X-Forwarded-For: $ip\r\n");
            fputs($fp, "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\n"); 

            $requestHeaders = apache_request_headers();
            while ((list($header, $value) = each($requestHeaders))) {
                if($header == "Content-Length") {
                    fputs($fp, "Content-Length: $datalength\r\n");
                } else if($header !== "Connection" && $header !== "Host" && $header !== "Content-length") {
                    fputs($fp, "$header: $value\r\n");
                }
            }
            fputs($fp, "Connection: close\r\n\r\n");
            fputs($fp, $data);

            $result = ''; 
            while(!feof($fp)) {
                // receive the results of the request
                $result .= fgets($fp, 128);
            }
        }
        else { 
            return array(
                'status' => 'err', 
                'error' => "$errstr ($errno)"
            );
        }

        // close the socket connection:
        fclose($fp);

        // split the result header from the content
        $result = explode("\r\n\r\n", $result, 2);

        $header = isset($result[0]) ? $result[0] : '';
        $content = isset($result[1]) ? $result[1] : '';

        // return as structured array:
        return array(
            'status' => 'ok',
            'header' => $header,
            'content' => $content
        );
    }

  $app->map('/service',"proxyNavigateur")->via(array('GET','POST'));
  
    function ObtenirAdresseIP($serveur){
      if (!empty($serveur['HTTP_CLIENT_IP'])){   //check ip from share internet
          $ip=$serveur['HTTP_CLIENT_IP'];
      }
      elseif (!empty($serveur['HTTP_X_FORWARDED_FOR'])){   //to check ip is pass from proxy
          $ip=$serveur['HTTP_X_FORWARDED_FOR'];
      }
      else{
          $ip=$serveur['REMOTE_ADDR'];
      }

      $tabIPs = explode(",", $ip);
      $ip = $tabIPs[0];
      return $ip;
    }
    
    function proxyNavigateur() {
        //todo: http://php.net/manual/en/function.curl-setopt.php
            
        global $app;
        $config = $app->getDI()->get("config");

        $method = $_SERVER['REQUEST_METHOD'];
        if($method !== "GET" && $method !== "POST"){
            http_response_code(405);
            die("Seules les méthodes POST ou GET sont autorisées");
        }
        $paramsGet = $_GET;
        $paramsPost = $method == "POST" ? $_POST : array();
        
        $options = array();
        $files = count($_FILES)>0?$_FILES:null;
        if($files!=null) {
            $options['files'] = $files;
        }

        $service = urldecode(isset($paramsPost['_service']) ? $paramsPost['_service'] : $paramsGet['_service']);
        unset($paramsPost['_service']);
        unset($paramsGet['_service']);
        unset($paramsPost['_url']);
        unset($paramsGet['_url']);
        unset($paramsPost['_client_IP']);
        unset($paramsGet['_client_IP']);
            
        //Session
        $session = $app->getDI()->getSession();
        if(!$session->has("info_utilisateur")){
            http_response_code(401);
            die("Vous devez être connecté pour utiliser ce service");
        }
        
        //Services       
        $igoController = new IgoController();
        $url = $igoController->verifierPermis($service);
        if($url === false){
            http_response_code(403);
            die("Vous n'avez pas les droits pour ce service.");
        }     
                  
        $protocole = strtolower(substr($_SERVER["SERVER_PROTOCOL"],0,strpos( $_SERVER["SERVER_PROTOCOL"],'/'))).'://';
        if(isset($url) && is_string($url) && $url !== ""){
            //$url = str_replace("//localhost/","//".$appelant."/", $url);
            if(substr($url, 0, 1) === "/"){
                //$url = $protocole.$appelant.$url;
                $url = $protocole."localhost".$url;
            }
        } else {
            http_response_code(403);
            die("Ce service n'est pas permis.");
        }
        
        $urlParse = parse_url($url);
        if (!isset($urlParse['scheme']) || $urlParse['scheme']."://" != $protocole) { 
            http_response_code(403);
            die('Seul le protocole ('.$protocole.') est valide');
        }

        $encodage = isset($paramsPost['_encodage']) ? $paramsPost['_encodage'] : (isset($paramsGet['_encodage']) ? $paramsGet['_encodage'] : NULL); 
        if($encodage != NULL){
            $options['encodage'] = $encodage;
            unset($paramsPost['_encodage']);
            unset($paramsGet['_encodage']);
        }
        
        //ajouter la clé
	if(isset($paramsPost['_cle'])){
            $_cle = $paramsPost['_cle'];
            $cleM = "POST";
        } else if (isset($paramsGet['_cle'])){
            $_cle = $paramsGet['_cle'];
            $cleM = "GET";
        }
        if(isset($_cle)){             
            if($session->has("info_utilisateur") && isset($config['profilsDroit'])) {
                //utilisateur
                if(($session->info_utilisateur->identifiant) && isset($config->profilsDroit[$session->info_utilisateur->identifiant]["cles"])){
                    $clesUser = $config->profilsDroit[$session->info_utilisateur->identifiant]["cles"];
                    if(isset($clesUser[$_cle])){ 
                        $cle = $clesUser[$_cle];
                    }
                }
                
                //profils
                if(!isset($cle) && isset($session->info_utilisateur->profils)){
                    $profilActif = $session->info_utilisateur->profilActif;
                    $nbProfils = count($session->info_utilisateur->profils);
                    foreach ($session->info_utilisateur->profils as $key => $value) {
                        if(is_array($value)){
                            $idValue = $value["id"];
                            $profil = $value["libelle"];
                        } else {
                            $idValue = $value->id;
                            $profil = $value->libelle;
                        }
                        if($nbProfils === 1 || $idValue == $profilActif){
                            if(isset($profil) && isset($config->profilsDroit[$profil]["cles"])){
                                $clesProfil = $config->profilsDroit[$profil]["cles"];
                                if(isset($clesProfil[$_cle])){ 
                                    $cle = $clesProfil[$_cle];
                                }
                            }
                            break;
                        }
                    }
                }
            }
            
            if(!isset($cle)){
                if(isset($config['cles'][$_cle])){
                    $cle = $config['cles'][$_cle];
                } else {
                    $cle = $_cle;
                }
            }
            unset($paramsPost['_cle']);
            unset($paramsGet['_cle']);
            if($cleM == "POST"){
                $paramsPost['_client_IP'] = ObtenirAdresseIP($_SERVER);
                $paramsPost['cle'] = $cle;
            } else {
                $paramsGet['_client_IP'] = ObtenirAdresseIP($_SERVER);
                $paramsGet['cle'] = $cle;
            }
        }
        
        if(count($paramsGet)!=0){
            if (strpos($url,'?') === false) {
                $url = $url.'?';
            } else if(substr($url, -1) !== '?') {
                $url = $url.'&';
            }

            $url = $url.http_build_query($paramsGet);

            //remplacer les parametres array ([0]= , [1]= , ...) par le même nom.
            //todo en faire une option?
            $url = preg_replace('/%5B(?:[0-9]|[1-9][0-9]+)%5D=/', '=', $url);
        }
        proxyRequestNavigateur($url, $paramsPost, $method, $options);
    };    
    
    function proxyRequestNavigateur($url, $data, $method, $options) {        
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);  
        if(isset($GLOBALS['HTTP_RAW_POST_DATA'])){
            curl_setopt($ch, CURLOPT_POST, 1 );
            curl_setopt($ch, CURLOPT_POSTFIELDS, $GLOBALS['HTTP_RAW_POST_DATA'] ); 
            curl_setopt($ch, CURLOPT_HTTPHEADER,  array('Content-Type: text/plain')); 
        } else if ($method === 'POST') {
            if(isset($options['files'])){
                $filesTemp = array();

                foreach($options['files'] as $key => $value){
                     $cfile = curl_file_create($value['tmp_name'],
                        $value['type'],
                        $value['name']);

                    $filesTemp = array_merge($filesTemp,array($key=>$cfile));
                }

                $result = array_merge($data, $filesTemp);

                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER,  array('multipart/form-data;charset=UTF-8')); 
                curl_setopt($ch, CURLOPT_POSTFIELDS, $result);
                curl_setopt($ch, CURLOPT_SAFE_UPLOAD, true);
            } else {
                $dataQuery = http_build_query($data);
                curl_setopt($ch, CURLOPT_POST, count($data));
                curl_setopt($ch, CURLOPT_POSTFIELDS, $dataQuery);  
            }

        }
        
        $result = curl_exec ($ch);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $http_status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close ($ch);
        
       if (isset($_SERVER['HTTP_USER_AGENT']) && (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false)){
            if(($contentType === "application/xml" || $contentType === "application/vnd.ogc.wms_xml" || $contentType === "application/vnd.ogc.gml" || $contentType === "text/xml; subtype=gml/3.1.1") && !isset($options['encodage'])){
                $pos = strpos($result,'encoding=');
                if($pos !== false) {
                    $temp = substr($result, $pos+10);
                    $posEnd = strpos($temp,'" ');
                    $options['encodage'] = substr($temp, 0, $posEnd);
                }
            }
        }
        
        if(isset($options['encodage'])){
            $contentType = $contentType."; charset=".$options['encodage']; 
        }
        header('Content-type: '.$contentType);

        http_response_code($http_status_code);
        echo ($result);
    }
    
    $app->notFound(function () use ($app) {
        $app->response->setStatusCode(404, "Not Found");
        die();
    });    
    
    $app->handle();
} catch (\Exception $e) {
    echo $e->getMessage();    
}
