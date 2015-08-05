<?php
/**
* Represents a FeatureService.
*
* Provides generic implementation for services. 
* Provides connection to database, user identifier, authentication.
* 
* For example: Bornes d'incendies associés a une position géographique.
* @see IFeatureService
*/
abstract class FeatureService implements IFeatureService, \Phalcon\DI\InjectionAwareInterface{
    
    private $di = null;
    
    private $escaped = false;
    
    private $connection = null;

    public function setDi($di){
        $this->di = $di;
    }
    
    public function getDi(){
        return $this->di;
    }
    
    public function reset(){
        $this->escaped = false;
    }
    
    /** 
    * Returns the connection to the database.
    *
    * @return resource representing the connection to the database.
    */	
    public function getConnection(){
        if($this->connection == null){
            $this->connection = $this->getDi()->get("connexion");
        }
        return $this->connection;
    }
    
    
    public function getSpatialQueryBuilder() {
        $connection = $this->getConnection();
        if($connection instanceof \Phalcon\Db\Adapter\Pdo\Postgresql){
            return new PgSpatialQueryBuilder();            
        }else if($connection instanceof \Phalcon\Db\Adapter\Pdo\Oracle){
            return new OracleSpatialQueryBuilder();
        }else{        
            throw new Exception("Spatial query builder not implemented for " . get_class($connection));
        }        
    }

    /** 
    * Provides default implementation for IsAuthenticated()
    */
    public function isAuthenticated(){
        return $this->getDI()->getSession()->has("info_utilisateur");
    }

    /** 
    * Provides default implementation for GetAuthenticationErrorMessage()
    */
    public function getAuthenticationErrorMessage(){	
        return array("result" => "error", "error" => "Vous n'êtes pas identifié par le système.");
    }

    /** 
    * Provides default implementation for GetUserId()
    */
    public function getUserId(){
        if(!$this->getDI()->getSession()->has("info_utilisateur")){
            throw new Exception("Problème avec l'identifiant de l'utilisateur.");
        }
                
        return $this->getDI()->getSession()->get("info_utilisateur")->identifiant;
    }

    /** 
    * Provides default implementation for IsUserSelectable()
    */
    public function isUserSelectable(){
        return true;
    }

    /** 
    * Constructs the sql geometry.
    *
    * @return string representing the sql geometry.
    */
    protected function GetSqlGeometry($geometry){

        $sqlGeometry = null;

        if($this->getGeometryType() == "point" || $this->getGeometryType() == "LineString" || $this->getGeometryType() == "polygon" || $this->getGeometryType() == "circle"){
            $wkt = GeometryConverter::ConvertJsonToWkt($geometry);
            $spatialQueryBuilder = $this->getSpatialQueryBuilder();
            $geomFromText = $spatialQueryBuilder->ST_GeomFromText($wkt);
            $geomFromTextSrid = $spatialQueryBuilder->ST_SetSrid($geomFromText, 4326);
            return $spatialQueryBuilder->ST_Transform($geomFromTextSrid, $this->getSRID());
        }else{
            throw new Exception("ERREUR, non implémenté: {$this->getGeometryType()}");
        }	

        return $sqlGeometry;
    }

    /** 
    * Escape the value of all the fields.
    * @warning this function modifies the value of the $feature.
    * @todo modify this function to return a clone of the original feature with escaped values.
    */
    protected function EscapeFields($feature){	
        if(!$this->escaped){
            // Escape les valeurs pour pouvoir utiliser la valeur dans la bd.
            // Petite passe d'accès dynamique aux propriétés de la $feature dynamique provenant du json_decode.
            $connection = $this->getConnection();
            $fields = $this->getFields($feature->geometry, null);
            foreach($fields as $field){
                $name = $field->propriete;		
                $feature->properties->$name = $field->Escape($connection, $feature->properties->$name);
            }	        
            $this->escaped = true;
        }
    }
    
    /**
     * Fonction retournant les valeurs et les colonnes à utiliser pour les bindings
     * @param object $feature L'objet feature contenant ses attributs
     * @return array (array $tabValue: tableau des valeurs pour le binding
     *                string $strCol: string contenant les champs à mettre à jour
     */
    protected function bindFields($feature){
        $strCol = "";
        $tabValue = array(); 
        $columnTypes = array();
        
        $fields = $this->getFields($feature->geometry, null);
        
        foreach($fields as $field){
            $name = $field->propriete;
            
            if(($field->editable === false || $field->obligatoire == false &&  $feature->properties->$name == null) || $name == $this->getIdentifier() || $name == $this->getIdentifiantName()) {
                continue;
            }
            
            if($strCol == "") {
                $strCol ="$name"; 
            }
            else {
                $strCol .= ", $name"; 
            }

            array_push($tabValue, $feature->properties->$name); 
            array_push($columnTypes, $field->getType());
        }
        
        return array($tabValue, $strCol, $columnTypes);
    }
    
    /**
     * Fonction retournant les valeurs et les colonnes à utiliser pour les bindings lors d'un delete
     * @param object $feature L'objet feature contenant ses attributs
     * @return array (array $tabValue: tableau des valeurs pour le binding
     *                string $strCol: string contenant les champs à mettre à jour
     */
    protected function bindFieldsForDelete($feature){
        $strCol = "";
        $tabValue = array(); 
        $columnTypes = array();
        $geometry = null;
        if(isset($feature->geometry)){
            $geometry = $feature->geometry;
        }
        $fields = $this->getFields($geometry, null);
        
        foreach($fields as $field){
            $name = $field->propriete;
            
            if($field->editable === false || $name == $this->getIdentifier() || $name == $this->getIdentifiantName() || $name == $this->getReferenceIdentifier() || $name == $this->getStatutName()) {
                continue;
            }
            
            if($strCol == "") {
                $strCol ="$name"; 
            }
            else {
                $strCol .= ", $name"; 
            }

            array_push($tabValue, $feature->properties->$name); 
            array_push($columnTypes, $field->getType());
        }
        
        return array($tabValue, $strCol, $columnTypes);
    }
    
    /**
     * Créer la string contenant le nombre de binding à utiliser dans la requête selon le nombre de valeur
     * @param array $tabValue Le tableau contenant les valeurs du binding
     * @return string $strBinding La string contenant le nombre correspondant de binding selon le nombre de valeur
     */
    protected function getStringBinding($tabValue){
        
        $nbBinding = count($tabValue);
        $strBinding = "";
        while($nbBinding != 0)
        {
            if($strBinding == "")
                $strBinding = "?";
            else
                $strBinding .= ", ?";

            $nbBinding--;
        }
        
        return $strBinding;
    }

    /** 
    * Construit la partie des champs de la requête. En ignorant les champs !editable && !mandatory.
    * example: x,y,z 
    * ...
    * @return string containing editable && mandatory names of the fields separated with coma.
    */
    protected function CreateSqlFieldsSection(){
        $fields = $this->getFields(null, null);
        $fields_sql = "";
        for($i = 0; $i < count($fields); $i++){
//            if(!$fields[$i]->editable /*&& !$fields[$i]->obligatoire*/){
//                continue;			
//            }
            if(empty($fields_sql)){
                $fields_sql .= $fields[$i]->propriete;
            }else{
                 $fields_sql .= "," . $fields[$i]->propriete;
            }
        }
        return $fields_sql;
    }

    /** 
    * Construit la partie des champs de la requête. 
    * example: x,y,z 
    * ...
    * @return string containing all the names of the fields separated with coma.
    */
    protected function CreateSqlSelectFieldsSection(){
        $fields = $this->getFields(null, null);
        $fields_sql = "";
        for($i = 0; $i < count($fields); $i++){	
            if($i < count($fields) - 1){
                $fields_sql .= $fields[$i]->propriete . ",";
            }else{
                $fields_sql .= $fields[$i]->propriete;
            }
        }
        return $fields_sql;
    }

    /** 
    * Retourne le nouveau statut de l'entrée. 
    * 
    * Si current_status = 'V' 
    *	SI GeomChanged() && DescChanged() 
    *		retourne 'MC'.
    *   SI GeomChanged() 
    *		retourne 'MG'.
    *   SI DescChanged() 
    *		retourne 'MD'.
    * SI current_status = 'MD' && GeomChanged() 
    *	retourne 'MC'
    * SI current_status = 'MG' && DescChanged() 
    *	retourne 'MC'	
    * SINON
    *	retourne current_status;
    *
    * @returns the new status to be applied. Returns false if no changes were applied.
    */	
    protected function GetStatut($feature){
        $connection = $this->getConnection();
        $identifier = $this->getIdentifier();
        $sql = "SELECT {$this->getStatutName()} FROM {$this->getDisplayTableName()} WHERE {$identifier} = {$feature->properties->$identifier}";

        $statutResult = $connection->query($sql);
        $statutResult->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        $statut_temp_assoc = $statutResult->fetch();	
        $statut_temp = $statut_temp_assoc[$this->getStatutName()];	
        
        $isModifGeo = $this->IsModifGeo($feature);		
        $isModifDescriptive = $this->IsModifDescriptive($feature);

        if(!$isModifGeo && !$isModifDescriptive){
            return false;
        }

        if($statut_temp == 'V'){
            if($isModifGeo && $isModifDescriptive){
                $statut = "MC";
            }
            else if($isModifGeo){
                $statut = "MG";
            }
            else if($isModifDescriptive){
                $statut = "MD";
            }
        }
        else if($statut_temp == "MG" && $isModifDescriptive){
            $statut = "MC";
        }
        else if($statut_temp == "MD" && $isModifGeo){
            $statut = "MC";
        }
        else{
            $statut = $statut_temp;
        }	
        return $statut;
    }

    protected function AreFieldsValid($feature, $fkId = null){
        $fields = $this->getFields($feature->geometry, $fkId);
        foreach($fields as $field){			
            $fieldName = $field->propriete;
            if((!property_exists($feature->properties, $fieldName) && $field->obligatoire) || !$field->IsValid($feature->properties->$fieldName, $fkId)){				
                return false;				
            }			
        }		
        return true;
    }

    protected function GetErrorMessage($feature){
        $errors = array();
        $fields = $this->getFields($feature->geometry, null);
        foreach($fields as $field){
            $fieldName = $field->propriete;
            if(!property_exists($feature->properties, $fieldName)){
                $errors[$fieldName] = $fieldName . " n'est pas défini";
            }
            if(!$field->IsValid($feature->properties->$fieldName, null)){			
                $errorMessage = $field->GetInvalidErrorMessage();
                $errors[$fieldName] = $errorMessage;
            }			
        }	
        return array("result" => "failure", "errors" => $errors);
    }

    protected function IsModifGeo($feature){
        $isModifGeo = false;
        $sqlGeometry = $this->GetSqlGeometry($feature->geometry);
        $connection = $this->getConnection();
        $identifier = $this->getIdentifier();
        
        $buffer = 2;
        $spatialQueryBuilder = $this->getSpatialQueryBuilder();
        $isEquivalent = $spatialQueryBuilder->isEquivalent($this->getGeometryType(),$this->getGeometryName(), $sqlGeometry, $buffer);
        $sql = "SELECT {$isEquivalent} as is_equivalent from {$this->getDisplayTableName()} where {$identifier} = '{$feature->properties->$identifier}'";

        $result = $connection->query($sql);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        $r = $result->fetch();

        if($r['is_equivalent'] === false || $r['is_equivalent'] == "FALSE"){
            $isModifGeo = true;
        }
        return $isModifGeo;
    }

    protected function IsModifDescriptive($feature){
        $connection = $this->getConnection();
        $isModifDescriptive = false;
        $query = "";
        $tabBinding= array();
        $columnTypes=array();
        
        $fields = $this->getFields($feature->geometry, null);
        for($i = 0; $i < count($fields); $i++){
            $field = $fields[$i];
            if($field->editable === true){
                $fieldName = $field->propriete;			
                if(!$field->obligatoire || $feature->properties->$fieldName == 'null'){
                    //$query .= "({$fieldName} = ? OR {$fieldName} is null) AND "; //Si à null dans BD et on set une nouvelle valeur!?!!!
                    $query .= "({$fieldName} = ?) AND "; 
                }else{
                    $query .= "({$fieldName} = ? AND {$fieldName} is not null) AND ";
                }
                array_push($tabBinding, $feature->properties->$fieldName);
                array_push($columnTypes, $field->getType());
            }
        }
        
        $query = substr($query, 0, strlen($query) - 5);
        if(strlen($query) > 0){
            $identifier = $this->getIdentifier();
            $sql_modif_desc = "SELECT CASE WHEN({$query}) THEN 'true' ELSE 'false' END as is_not_modif_descriptive FROM {$this->getDisplayTableName()} WHERE {$identifier} = '{$feature->properties->$identifier}'";	

            $result = $connection->query($sql_modif_desc, $tabBinding, $columnTypes);
            $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);            
            $r = $result->fetch();
            if($r['is_not_modif_descriptive'] == "false")
            {
                $isModifDescriptive = true;
            }
        }        
        return $isModifDescriptive;
    }
}