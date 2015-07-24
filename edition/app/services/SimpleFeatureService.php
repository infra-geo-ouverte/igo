<?php
use Phalcon\Db\Column as Column;
/**
* Represents a SimpleFeatureService.
*
* Provides generic implementation for simple services. 
* A simple service is a service that exposes editable data from one table.
* 
* For example: Bornes d'incendies associés a une position géographique.
* @see IFeatureService
* @see FeatureService
*/
abstract class SimpleFeatureService extends FeatureService{

    /**
    * Paramètre par défaut du SNAP dans OL, non-activé par défaut et tolérance de 30 pixels, doit être activé pour chaque couche dans libcommunes\MSPwidgets\Edition\services.
    */
    public function allowSnap(){return false;}
    public function setSnapTolerance(){return 30;}

    
    
    /**
    * Implementation générique pour GetFeatures.
    */
    public function getFeatures($polygon){
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $wkt = GeometryConverter::ConvertJsonToWkt($polygon);

        $fields_sql = $this->CreateSqlSelectFieldsSection();
        $fields_sql .= "," . $this->getIdentifier();		

        $spatialQueryBuilder = $this->getSpatialQueryBuilder();
        $transform = $spatialQueryBuilder->ST_Transform($this->getGeometryName(),4326);
        $geomAsText = $spatialQueryBuilder->ST_AsText($transform);
        $srid = $this->getSRID();
        $bboxFromText = $spatialQueryBuilder->ST_GeomFromText($wkt, $srid);
        $bbox_srid = $spatialQueryBuilder->ST_SetSRID($bboxFromText, 4326);
        $bbox = $spatialQueryBuilder->ST_Transform($bbox_srid, $this->getSRID());
        $intersects = $spatialQueryBuilder->ST_Intersects($this->getGeometryName(), $bbox);
        
        $sql = "SELECT {$fields_sql}, {$geomAsText} as {$this->getGeometryName()} FROM {$this->getDisplayTableName()} WHERE {$intersects} AND {$this->getStatutName()} <> 'D' AND {$this->getStatutName()} <> 'I'";

        $config = $this->getDi()->get("config");
        if($config->application->debug == true){
            error_log($sql);
        }
                    
        $connection = $this->getConnection();
        $features = array();
        $result = $connection->query($sql);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        $fields = $this->getFields(null, null);
        if(!$result){
            throw new Exception('Database error');
        }
        
        while($r = $result->fetch()){
            $geom = $r[$this->getGeometryName()];
            $feature = new stdClass();
            $feature->type = "Feature";

            $feature->geometry = GeometryConverter::ConvertWktToJson($this->getGeometryType(),$r[$this->getGeometryName()]);

            $feature->properties = new stdClass();
            for($i = 0; $i < count($fields); $i++){
                $fieldName = $fields[$i]->propriete;
                $feature->properties->$fieldName = $r[$fields[$i]->propriete];
            }
            $identifierName = $this->getIdentifier();
            $feature->properties->$identifierName = $r[$this->getIdentifier()];

            $features[] = $feature;
        }
        $featureCollection = new stdClass();
        $featureCollection->type = "FeatureCollection";
        $featureCollection->features = $features;
        
        return $featureCollection;
    }

    /**
    * Implementation générique pour CreateFeature.
    */	
    public function createFeature($feature, $fkId = null){
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        if(!$this->AreFieldsValid($feature, $fkId)){
            return $this->GetErrorMessage($feature);
        }
        
        //Validation      
        $valid = $this->isValid($feature, $fkId);
        
        if($valid !== true){
            return array("result" => "failure", "error" => $valid[0], "feature" => $valid[1]);
        }
        
        $noSeq = null;        
        if(isset($feature->no_seq)){
            $noSeq = $feature->no_seq;
        }

        //Obtenir les colonnes et leurs valeurs pour les binding du insert
        $bindingRes = $this->bindFields($feature);
        $tabValue = $bindingRes[0];
        $strCol = $bindingRes[1];
        $columnTypes = $bindingRes[2];
        $sqlGeometry = $this->GetSqlGeometry($feature->geometry);	
        
        //Ajouter les colonnes génériques
        array_push($tabValue, $this->getUserId());
        array_push($columnTypes, Column::TYPE_VARCHAR);
        
        array_push($tabValue, 'A');
        array_push($columnTypes, Column::TYPE_VARCHAR);
        if($strCol !== ''){
            $strCol .= ', ';
        }
        $strCol .= "{$this->getIdentifiantName()} , {$this->getStatutName()}";
                           
        if($fkId != null && $this->getFk()) {
            $strCol .= "," . $this->getFk();
            array_push($tabValue, $fkId);
            array_push($columnTypes, 1);
        }
             
        //Obtenir la string de binding pour la requête insert
        $strBinding = $this->getStringBinding($tabValue);        
        
        $connection = $this->getConnection();

        $result = $connection->execute("INSERT INTO ". $this->getTransactionTableName()." (".$this->getGeometryName().", $strCol) VALUES($sqlGeometry, $strBinding)", $tabValue, $columnTypes);
       
        if($result){
            
            //Get The Id of the inserted sequence
            if($this->getSequenceName()) {
                $lastId = $connection->lastInsertId($this->getSequenceName())[0];
            } else {
                return array("result" => "success");
            }

            $fields_sql = $this->CreateSqlSelectFieldsSection();
            
            $sql = "SELECT {$fields_sql} FROM {$this->getDisplayTableName()} WHERE {$this->getIdentifier()} = {$lastId}";

            $result = $connection->query($sql);
            $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
            if(!$result){
                throw new Exception('Database error');
            }
            else{
                $featureMaj = new stdClass();
                $featureMaj->properties = $result->fetchAll()[0];
                $featureMaj->no_seq = $noSeq; //Numéro de séquence pour le suivi des modifs côté client
            }                                   

            return array("result" => "success", "feature" => $featureMaj);
        }else {
            return array("result" => "failure");
        }
    }

    /**	
    * Implémentation générique pour DeleteFeature.
    */	
    public function deleteFeature($feature, $fkId = null){	
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }

        $identifier = $feature->properties->{$this->getIdentifier()};	
        $justification = $feature->properties->{$this->getJustificationName()};

        $connection = $this->getConnection();
        $fields_sql = $this->CreateSqlFieldsSection();
        $spatialQueryBuilder = $this->getSpatialQueryBuilder();
        $geomAsText = $spatialQueryBuilder->ST_AsText($this->getGeometryName());
        
        $sql = "SELECT {$geomAsText} as {$this->getGeometryName()}, {$fields_sql}, {$this->getStatutName()}, {$this->getReferenceIdentifier()} FROM {$this->getDisplayTableName()} WHERE {$this->getIdentifier()} = {$feature->properties->{$this->getIdentifier()}}";

        $result = $connection->query($sql);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        
        if($result){
            $row = $result->fetch();
            if($row == null || $row[$this->getStatutName()] == "D"){
                return array("result" => "failure", "error" => "Cet élément n'existe pas.");
            }
                    
            //Définir les valeurs dans le feature
            $fields = $this->getFields(null, null);
            $feature = new StdClass;
            $feature->type = "Feature";
            $feature->properties = new stdClass();
            foreach($fields as $field){
                $name = $field->propriete;			
                $feature->properties->$name = $row["{$name}"];
            }
            $feature->properties->{$this->getIdentifier()} = $identifier;
            $feature->properties->{$this->getJustificationName()} = $justification;  

            $geometryName = $row["{$this->getGeometryName()}"];
            $srid = $this->getSRID();
            $geomFromText = $spatialQueryBuilder->ST_GeomFromText($geometryName);
            $geom = $spatialQueryBuilder->ST_SetSRID($geomFromText, $srid);
            $referenceIdentifier = $row[$this->getReferenceIdentifier()];
                    
            try{
                $connection->begin();
                $update_request = "UPDATE {$this->getTransactionTableName()} SET {$this->getStatutName()} = 'I' WHERE {$this->getReferenceIdentifier()} = {$feature->properties->{$this->getIdentifier()}}";
                $update_result = $connection->query($update_request);
                             
                $bindingRes = $this->bindFieldsForDelete($feature);
                $tabValue = $bindingRes[0];
                $strCol = $bindingRes[1];
                $columnTypes = $bindingRes[2];
                                
                //Ajouter les valeurs des colonnes génériques
                array_push($tabValue, $referenceIdentifier);
                array_push($tabValue, $this->getUserId());
                array_push($tabValue, 'D');   
                array_push($columnTypes, Column::BIND_PARAM_INT);
                array_push($columnTypes, Column::TYPE_VARCHAR);
                array_push($columnTypes, Column::TYPE_VARCHAR);   

                $strCol .= ",". $this->getReferenceIdentifier(). ", {$this->getIdentifiantName()}, {$this->getStatutName()}";
                
                if($fkId != null && $this->getFk()) {
                    $strCol .= "," . $this->getFk();
                    array_push($tabValue, $fkId);
                    array_push($columnTypes, 1);
                }
                
                //Obtenir la string de binding pour la requête insert
                $strBinding = $this->getStringBinding($tabValue);
                
                $insert_result = $connection->execute("INSERT INTO ". $this->getTransactionTableName()." (".$this->getGeometryName().", $strCol) VALUES($geom, $strBinding)", $tabValue, $columnTypes);
                
                if($update_result && $insert_result){
                    $connection->commit();
                    return array("result" => "success");
                }else{
                    $connection->rollback();
                    return array("result" => "failure");
                }                
            }catch(Exception $e){
                $connection->rollback();
                throw $e;
            }
            
        }else{
            return array("result" => "failure");
        }
    }

    /**
    * Implémentation générique pour UpdateFeature.
    */
    public function updateFeature($feature, $fkId = null){
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }

        $connection = $this->getConnection();		
        
        if(!$this->AreFieldsValid($feature, $fkId)){            
            return $this->GetErrorMessage($feature);
        }
        
        //Validation      
        $valid = $this->isValid($feature, $fkId);
        
        if($valid !== true){
            return array("result" => "failure", "error" => $valid);
        }
        
        $noSeq = null; 
        if(isset($feature->no_seq)){
            $noSeq = $feature->no_seq;
        }

        // Petite passe pour construire dynamiquement la requête d'update.
        $sqlGeometry = $this->GetSqlGeometry($feature->geometry);		

        //Obtenir les colonnes et leurs valeurs pour les binding du insert
        $bindingRes = $this->bindFields($feature);
        $tabValue = $bindingRes[0];
        $strCol = $bindingRes[1];
        $columnTypes = $bindingRes[2];
        
        $statut = $this->getStatut($feature);   
        
        if($statut === false){
            return array("result" => "failure", "error" => "Aucune modification n'a été apporté, votre demande de sauvegarde a été refusée.");
        }
        try{
            $connection->begin();
            $identifier = $this->getIdentifier();
            $update_request = "UPDATE {$this->getTransactionTableName()} SET {$this->getStatutName()} = 'I' WHERE {$this->getReferenceIdentifier()} = {$feature->properties->$identifier}";
            $update_result = $connection->query($update_request);            
            
            //Effectuer le select pour obtenir le ReferenceIdentifier selon le ID
            $select_request = "SELECT {$this->getReferenceIdentifier()} FROM {$this->getDisplayTableName()} WHERE {$this->getIdentifier()} = {$feature->properties->$identifier}";
            
            $result = $connection->query($select_request);
            $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
            if(!$result){
                throw new Exception('Database error');
            }
            $r = $result->fetch();
            $referenceIdentifier = $r[$this->getReferenceIdentifier()];
                      
            //Ajouter les colonnes génériques
            if($referenceIdentifier !== NULL){
                array_push($tabValue, $referenceIdentifier);
            } else {
                array_push($tabValue, $feature->properties->$identifier);
            }
            array_push($tabValue, $this->getUserId());
            array_push($tabValue, $statut);
            array_push($columnTypes, Column::BIND_PARAM_INT);
            array_push($columnTypes, Column::TYPE_VARCHAR);
            array_push($columnTypes, Column::TYPE_VARCHAR);
            
            
            $strCol .= ",".$this->getReferenceIdentifier() .", {$this->getIdentifiantName()}, {$this->getStatutName()}";
            
            if($fkId != null && $this->getFk()) {
                $strCol .= "," . $this->getFk();
                array_push($tabValue, $fkId);
                array_push($columnTypes, 1);
            }
                       
            //Obtenir la string de binding pour la requête insert
            $strBinding = $this->getStringBinding($tabValue);
            
            $sql = "INSERT INTO ". $this->getTransactionTableName()." (".$this->getGeometryName().", $strCol) VALUES($sqlGeometry, $strBinding)";
            $insert_result = $connection->execute($sql, $tabValue, $columnTypes);
            
            if($update_result && $insert_result){
                
                //Get The Id of the inserted sequence
                if($this->getSequenceName()) {
                    $lastId = $connection->lastInsertId($this->getSequenceName())[0];
                } else {     
                    $connection->commit();
                    return array("result" => "success");
                }

                $fields_sql = $this->CreateSqlSelectFieldsSection();

                $sql = "SELECT {$fields_sql} FROM {$this->getDisplayTableName()} WHERE {$this->getIdentifier()} = {$lastId}";

                $result = $connection->query($sql);
                $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
                if(!$result){
                    throw new Exception('Database error');
                }
                else{
                    $featureMaj = new stdClass();
                    $featureMaj->properties = $result->fetchAll()[0];
                    $featureMaj->no_seq = $noSeq; //Numéro de séquence pour le suivi des modifs côté client
                }                                   
                
                $connection->commit();
                return array("result" => "success", "feature" => $featureMaj);
            }else{
                $connection->rollback();
                return array("result" => "failure");
            }
        }catch(Exception $e){
            $connection->rollback();
            throw $e;
        }
    }
    
        /**
    *  GetFeatures by foreign key
         * @param $fk Foreign key
    */
    public function getFeaturesFk($fk){
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $fields_sql = $this->CreateSqlSelectFieldsSection();
        $fields_sql .= "," . $this->getIdentifier();		

        $fkAttribute = $this->getFk();
        
        $spatialQueryBuilder = $this->getSpatialQueryBuilder();
        $transform = $spatialQueryBuilder->ST_Transform($this->getGeometryName(),4326);
        $geomAsText = $spatialQueryBuilder->ST_AsText($transform);
        
        $sql = "SELECT {$fields_sql}, {$geomAsText} as {$this->getGeometryName()} FROM {$this->getDisplayTableName()} WHERE {$fkAttribute}={$fk} AND {$this->getStatutName()} <> 'D' AND {$this->getStatutName()} <> 'I'";

        $config = $this->getDi()->get("config");
        if($config->application->debug == true){
            error_log($sql);
        }
                    
        $connection = $this->getConnection();
        $features = array();
        $result = $connection->query($sql);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        $fields = $this->getFields(null, $fk);
        if(!$result){
            throw new Exception('Database error');
        }
        
        while($r = $result->fetch()){
            $geom = $r[$this->getGeometryName()];
            $feature = new stdClass();
            $feature->type = "Feature";

            $feature->geometry = GeometryConverter::ConvertWktToJson($this->getGeometryType(),$r[$this->getGeometryName()]);

            $feature->properties = new stdClass();
            for($i = 0; $i < count($fields); $i++){
                $fieldName = $fields[$i]->propriete;
                $feature->properties->$fieldName = $r[$fields[$i]->propriete];
            }
            $identifierName = $this->getIdentifier();
            $feature->properties->$identifierName = $r[$this->getIdentifier()];

            $features[] = $feature;
        }
        $featureCollection = new stdClass();
        $featureCollection->type = "FeatureCollection";
        $featureCollection->features = $features;
        
        return $featureCollection;
    }
    
    
    /**
     * Function to get the Foreign key
     * No Foreign key by default
     * @return boolean false
     */
    public function getFk(){
        return false;
    }
    
    /**
     * Function to get sequence name
     * No sequence by default
     * @return boolean false
     */
    public function getSequenceName(){
        return false;
    }
    
    /**
     * Function to get the attribute to display as label in the geometry
     * No label by default
     * @return boolean false
     */
    public function getLabelName (){
        return false;
    }
    
    /**
     * Function to implement to valid the informations
     * @return boolean true by default (no validation)
     */
    public function isValid($feature, $fkId){
        return true;
    }
	
}

