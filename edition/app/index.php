<?php

try {
    $config = include __DIR__ . "/config/config.php";    
    include __DIR__ . "/config/loader.php";
    include __DIR__ . "/config/services.php";

    $app = new \Phalcon\Mvc\Micro();
    $app->setDI($di);    
    $app->map('/',"request")->via(array('GET', 'POST'));
    $app->handle();
    
} catch (\Exception $e) {
    $debug = $config['application']['debug'];
    $protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');
    header($protocol . ' 400 Bad Request');
    if(isset($debug) && $debug === true){
        die(json_encode(array("result" => "failure", "error" => $e->getMessage(), "stack"=>$e->getTraceAsString())));
    }
    else{            
        die(json_encode(array("result" => "failure", "error" => "Une erreur s'est produite.")));
    }
}

function request () {
    global $app;

    $httprequest = new Phalcon\Http\Request();
    $datain = $httprequest->get();
    $data = array();

    foreach($datain as $key=>$value){
        $data[strtolower($key)] = $value;
    }  
    $filter = new \Phalcon\Filter();
    $request = $filter->sanitize($data["request"],array("string","lower"));
    $response = null;
    switch($request){
        case "getcapabilities":
            $response = getCapabilities();
            break;
        case "describefeaturetype":
            $response = describeFeatureType($data);
            break;
        case "getfeatures":
            $response = getFeatures($data);
            break;
        case "delete":
            $response = delete($data);
            break;
        case "create":
            $response = create($data);
            break;                        
        case "update":
            $response = update($data);
            break;
        case "transaction":
            $response = transaction($data);
            break;
        /* For grouping*/
        case "getassoclayers":
            $response = getAssocLayers($data);
            break;        
         case "getgrouping":
            $response = getGrouping($data);
            break;        
         case "describegrouping":
            $response = describeGrouping($data);
            break;
         case "creategrouping":
            $response = createGrouping($data);
            break;         
         case "updategrouping":
            $response = updateGrouping($data);
            break;    
         case "deletegrouping":
            $response = deleteGrouping($data);
            break;
        case "getFeaturesFk":
            $response = getFeaturesFk($data);
            break;
        case "duplicategrouping":
            $response = duplicateGrouping($data);
            break;
        case "associatedocument":
            $response = associateDocument($data);
            break;
        case "deletedocument":
            $response = deleteDocument($data);
            break;
        case "downloaddocument":
            $response = downloadDocument($data);
            echo $response;
            break;
        case "getdocumentlist":
            $response = getDocumentList($data);
            break;
        case "getdocumentdescription":
            $response = getDocumentDescription($data);
            break;
        default:
            $response = false;
            break;
    }       

    $app->response->setContentType('application/json; charset=UTF-8')->sendHeaders(); 
    echo json_encode($response); 
 }
/**
 * Exécute la requête GetCapabilities.
 * 
 * @return type
 */
function getCapabilities(){
    $layers = array();
    $services = getServices();
    foreach($services as $srv){
        $layer["name"] = $srv->getName();
        $layer["description"] = $srv->getDescription();
        $layer["title"] = $srv->getTitle();
        $layer["associatedLayers"] = $srv->getAssociatedLayers();
        $layer["srid"] = $srv->getSRID();
        $layer["minimumScale"] = $srv->getMinimumScale();
        $layer["maximumScale"] = $srv->getMaximumScale();	
        $layer["geometryName"] = $srv->getGeometryName();
        $layer["geometryType"] = $srv->getGeometryType();
        $layer["identifier"] = $srv->getIdentifier();
        $layer["isUserSelectable"] = $srv->isUserSelectable();
        $layer["allowNew"] = $srv->allowNew();
        $layer["allowSnap"] = $srv->allowSnap();
        $layer["setSnapTolerance"] = $srv->setSnapTolerance();
        $layer["allowUpdate"] = $srv->allowUpdate();
        $layer["allowDelete"] = $srv->allowDelete();
        $layers[] = $layer;	
    }    
    return $layers;    
}
/**
 * Execute la requête describeFeatureType. Prend les paramêtres optionels layer
 * et geometry.
 * 
 * @param type $data
 * @return type 
 */
function describeFeatureType($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        if(!isset($services[$layer])){
            throw new Exception("Le service {$layer} n'est pas disponible.");
        }
            
        $srv = $services[$layer];
        $services = array($srv->getName()=>$srv);
    }
    $geometry = null;
    if(isset($data["geometry"])) {	
        $geometry = json_decode($data["geometry"]);
    }
    
    $featureTypes = array();
    foreach($services as $srv){
        $featureType = array(
            'name' => $srv->getName(),
            'featureType' => $srv->getFields($geometry, $data["fk"]),
            'type' => $srv->getGeometryType()
        );
        $featureTypes[] = $featureType;
    }
    return $featureTypes;    
}

/**
 * Execute la requête getFeatures. Prend les paramêtres optionels layer
 * et geometry.
 * 
 * @param type $data
 * @return type 
 */
function getFeatures($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        if(!isset($services[$layer])){
            throw new Exception("Le service {$layer} n'est pas disponible.");
        }        
        $srv = $services[$layer];
    }
    $geometry = null;
    if(isset($data["geometry"])) {	
        $geometry = json_decode($data["geometry"]);
    }
    return $srv->getFeatures($geometry);
}

function delete($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        $srv = $services[$layer];
    }
    $feature = null;
    if(isset($data["feature"])) {	
        $feature = json_decode($data["feature"]);
    }
    return $srv->deleteFeature($feature);
}

function create($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        $srv = $services[$layer];
    }
    $feature = null;
    if(isset($data["feature"])) {
        $feature = json_decode($data["feature"]);
    }
    return $srv->createFeature($feature);
}

function update($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        $srv = $services[$layer];
    }
    $feature = null;
    if(isset($data["feature"])) {
        $feature = json_decode($data["feature"]);
    }            
    return $srv->updateFeature($feature);    
}

function transaction($data){
    $filter = new \Phalcon\Filter();
    $results = array();
    
    $services = getServices();   
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        $srv = $services[$layer];
    }
    
    if(isset($data["fkid"])) {
        $fkId = $data["fkid"];
    }
    else {
        $fkId = null;
    }
    
    $connection = $srv->getConnection();
    $connection->begin();
    try{
        $errors = array();
        $warnings = array();
        $features = array();
        
        if(isset($data["features"])){
            $featureCollection = json_decode($data["features"]);
            
            foreach($featureCollection->features as $feature){
                if($feature->action==="create"){
                    $result = $srv->createFeature($feature, $fkId);
                }else if($feature->action==="update"){
                    $result = $srv->updateFeature($feature, $fkId);
                }else if($feature->action==="delete"){
                    $result = $srv->deleteFeature($feature, $fkId);
                }else{
                    throw new Exception("Action invalide ou indéfinit: " . $feature->action);
                }
                
                if($result["result"] === "failure" && isset($result["error"])){
                    $errors[$feature->no_seq] = $result["error"];
                }else if($result["result"] === "failure" && isset($result["errors"])){
                    $errors[$feature->no_seq] = $result["errors"];
                }else if($result["result"] === "warning"){
                    $warnings[$feature->no_seq] = $result["warning"];
                }
                
                if(isset($result["feature"]))
                {
                    array_push($features, $result["feature"]);
                    unset($result["feature"]);
                }
                
                $srv->reset();
            }
        }
        if(count($errors) > 0 || count($warnings) > 0){
            $connection->rollback();
            return array("result" => "failure", "errors" => $errors, "warnings" => $warnings, "features" => $features);
        }
        
        $connection->commit();
        
    }catch(\Exception $e) {
        $connection->rollback();
        throw $e;
    }
    return array("result" => "success", "features" => $features);
}

function getAssocLayers($data){
    
    $srv = getGroupingService();
    
    $grouping = null;
    if(isset($data["grouping"])) {
        $grouping = $data["grouping"];
    }            
    return $srv->getAssociatedLayers($grouping);  
}

function getGrouping($data) {
    
    $srv = getGroupingService();
    
    $fkId = null;
    if(isset($data["fkid"])){
        $fkId = $data["fkid"];
    }           
    return $srv->getGrouping($fkId);  
}

function describeGrouping() {
    
    $srv = getGroupingService();
    
    
    
    return [$srv->getFields(), $srv->getHaveAssociateFile()];      
}

function createGrouping($data) {
 
    $srv = getGroupingService();
    
    $fkId = null;
    if(isset($data["fkid"])){
        $fkId = $data["fkid"];
    }
    
    $grouping = null;
    if(isset($data["grouping"])) {
        $grouping = $data["grouping"];
    }            
    return $srv->createGrouping($grouping, $fkId);  
}

function updateGrouping($data) {
 
    $srv = getGroupingService();
    
    $grouping = null;
    if(isset($data["grouping"])) {
        $grouping = $data["grouping"];      
    }            
    return $srv->updateGrouping($grouping);      
}

function deleteGrouping($data){
 
    $srv = getGroupingService();
    
    $grouping = null;
    if(isset($data["grouping"])) {
        $grouping = $data["grouping"];      
    }            
    return $srv->deleteGrouping($grouping);          
}

/**
 * Execute la requête getFeatures. Prend les paramêtres optionels layer
 * et Foreign key.
 * 
 * @param type $data
 * @return type 
 */
function getFeaturesFk($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        if(!isset($services[$layer])){
            throw new Exception("Le service {$layer} n'est pas disponible.");
        }        
        $srv = $services[$layer];
    }
    $fk = null;
    if(isset($data["fk"])) {	
        $fk = json_decode($data["fk"]);
    }
    return $srv->getFeaturesFk($fk);
}

function duplicateGrouping($data){

    $srv = getGroupingService();
    
    $idGrouping = null;
    if(isset($data["idgrouping"])) {
        $idGrouping = $data["idgrouping"];      
    }            
    return $srv->duplicateGrouping($idGrouping);            
}

function associateDocument($data){
    
    $srv = getGroupingService();
    
    $grouping = null;
    if(isset($data["grouping"])) {
        $grouping = json_decode($data["grouping"]);      
    }
    
    if(isset($_FILES["uploadFile"])) {
        $uploadfile = $_FILES["uploadFile"];      
    }
    else{
        return false; //no file
    }
    
    $filename = "";
    if(isset($data["filename"])) {
        $filename = $data["filename"];      
    }
    
    $extension = "";
    if(isset($data["extension"])) {
        $extension = $data["extension"];      
    }
     
    $size = 0;
    if(isset($data["size"])) {
        $size = $data["size"];      
    } 
    
    $mime = "";
    if(isset($data["mime"])) {
        $mime = $data["mime"];      
    } 
    
    return $srv->associateDocument($grouping, $uploadfile, $filename, $extension, $size, $mime);       
}

function deleteDocument($data){
    
     $srv = getGroupingService();
     
    $document = null;
    if(isset($data["document"])) {
        $document = $data["document"];
        
        return $srv->deleteDocument($document);
    }
}

function downloadDocument($data){
    
     $srv = getGroupingService();
     
    $document = null;
    if(isset($data["document"])) {
        $document = json_decode($data["document"]);
        
        return $srv->downloadDocument($document);
    }
}

function getDocumentList($data){
    $srv = getGroupingService();
     
    $grouping = null;
    if(isset($data["grouping"])) {
        $grouping = json_decode($data["grouping"]);
        
        return $srv->getDocumentList($grouping);
    } 
}

function getDocumentDescription($data){
    $srv = getGroupingService();
     
    return $srv->getDocumentDescription();
}
/**
 * Execute la requête getFeatures. Prend les paramêtres optionels layer
 * et Foreign key.
 * 
 * @param type $data
 * @return type 
 */
function getTitleDescription($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        if(!isset($services[$layer])){
            throw new Exception("Le service {$layer} n'est pas disponible.");
        }        
        $srv = $services[$layer];
    }
    
    return $srv->getTitle();
}

/**
 * Execute la requête getFeatures. Prend les paramêtres optionels layer
 * et Foreign key.
 * 
 * @param type $data
 * @return type 
 */
function getAssociatedLayersInformation($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        if(!isset($services[$layer])){
            throw new Exception("Le service {$layer} n'est pas disponible.");
        }        
        $srv = $services[$layer];
    }
    
    return $srv->getAssociatedLayers();
}

function getLabelNameInformation($data){
    $filter = new \Phalcon\Filter();
    
    $services = getServices();
    if(isset($data["layer"])){
        $layer = $filter->sanitize($data["layer"],array("string"));
        if(!isset($services[$layer])){
            throw new Exception("Le service {$layer} n'est pas disponible.");
        }        
        $srv = $services[$layer];
    }
    
    return $srv->getLabelName();    
}

function getServices(){
    global $config,$app;
    $services = array();

    foreach($config->services as $service){
        $srv = new $service(); 
        $srv->setDi($app->getDI());
        $services[$srv->getName()] = $srv;
        
    }
    return $services;
}

function getGroupingService(){
    global $config,$app;
    $grouping = false;

    if($config->grouping){
        $grp = $config->grouping;
        $srv = new $grp(); 
        $srv->setDi($app->getDI());
        $grouping = $srv;
    }
    return $grouping;
}