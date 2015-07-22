<?php
use Phalcon\Db\Column as Column;
/**
* Represents a SimpleGroupService.
*
* Provides generic implementation for simple services. 
* A simple service is a service that exposes editable data from one table.
* 
* For example: Bornes d'incendies associés a une position géographique.
* @see IGroupService
* @see GroupService
*/
abstract class SimpleGroupService extends GroupService{
    
    /**
     * Get the list of grouping
     * @param integer $fkId foreign key value of parent. Can be false
     * @return Array of grouping object
     * @throws Exception
     */
    public function getGrouping($fkId) {
        
        $arrGrouping = array();
        $clauseWhere = "";
        
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $fields_sql = $this->CreateSqlSelectFieldsSection();
        
        $foreignKey = $this->getForeignKey();
        
        if($foreignKey !== false) {
            $clauseWhere = "WHERE {$foreignKey} = {$fkId}";
        }
        
        $sql = "SELECT {$fields_sql} FROM {$this->getDisplayTableName()} {$clauseWhere}";
        
        $config = $this->getDi()->get("config");
        if($config->application->debug == true){
            error_log($sql);
        }
                    
        $connection = $this->getConnection();
        $result = $connection->query($sql);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        if(!$result){
            throw new Exception('Database error');
        }
        
        while($r = $result->fetch()){
            $arrGrouping[] = $r;
        }
        
        return $arrGrouping;
    }
    
    /**
     * Create a new grouping
     * @param object $grouping object of the grouping to create
     * @param integer $fkId Foreign key value to associate with the grouping
     * @return object of result
     * @throws Exception
     */
    public function createGrouping($grouping, $fkId) {
        
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        } 
        
        //Validation      
        $valid = $this->isValid($grouping, $fkId);
        
        if($valid !== true){
            return array("result" => "failure", "error" => $valid[0], "feature" => $valid[1]);
        }
        
        $connection = $this->getConnection();
       
        //Obtenir les colonnes et leurs valeurs pour les binding du insert
        $bindingRes = $this->bindFields($grouping);
        $tabValue = $bindingRes[0];
        $strCol = $bindingRes[1];
        $columnTypes = $bindingRes[2];
        $strBind = $bindingRes[3];
        
        $foreignKey = $this->getForeignKey();
        
        if($foreignKey != false) {
            $strCol .= ", " . $foreignKey;
            $strBind .=", ?";
            array_push($tabValue,$fkId);
            array_push($columnTypes,1);
        }
    
        $sequenceId = false;
        $sqlSequence = $this->getSQLNextSequence();
        
        if($sqlSequence != false) {
            $result = $connection->query($sqlSequence);
            $result->setFetchMode(\Phalcon\Db::FETCH_NUM);
            $sequenceId = $result->fetch()[0];
            
            $strCol .= ", " . $this->getIdentifier();
            $strBind .=", ?";
            array_push($tabValue,$sequenceId);
            array_push($columnTypes,1);
        }
        if($this->getIdentifiantName()) {
            $strCol .= ",{$this->getIdentifiantName()}";
            $strBind .=", ?";
            array_push($tabValue, $this->getUserId());
            array_push($columnTypes, Column::TYPE_VARCHAR);
        }
        
        $sql = "INSERT INTO ". $this->getTransactionTableName()." ({$strCol}) VALUES ({$strBind})";
       
        $result = $connection->execute($sql, $tabValue, $columnTypes);
        
        if($result && $sequenceId){
            
            $grouping = false;
            
            $sql = "SELECT * FROM {$this->getDisplayTableName()} WHERE {$this->getIdentifier()} = {$sequenceId}";

            $result = $connection->query($sql);
            $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
            if(!$result){
                throw new Exception('Database error');
            }
            else{
                $grouping = $result->fetchAll();
            }                
            
            return array("result" => "success", "grouping" => $grouping, "id" =>$sequenceId);
            
        }else if($result) {
             return array("result" => "success");
        }else {
            return array("result" => "failure");
        }
    }
    
    /**
     * Delete grouping
     * @param object $grouping object to delete
     * @return object of result
     */
    public function deleteGrouping($grouping) {
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $connection = $this->getConnection();
        
        $identifier = $grouping[$this->getIdentifier()];
        
        $tabValue = Array($identifier);
        
        $columnTypes = Array(PDO::PARAM_INT);
        
        $sql = "DELETE FROM {$this->getTransactionTableName()} WHERE {$this->getIdentifier()} = ?";
        
        $result = $connection->execute($sql, $tabValue, $columnTypes);
        
        if($result){
            return array("result" => "success");
        }else {
            return array("result" => "failure");
        }
    }
    
    /**
     * Update grouping
     * @param object $grouping object to update
     * @return object of result
     * @throws Exception
     */
    public function updateGrouping($grouping) {
        
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        //Validation      
        $valid = $this->isValid($grouping, $fkId);
        
        if($valid !== true){
            return array("result" => "failure", "error" => $valid[0], "feature" => $valid[1]);
        }        
        
        $connection = $this->getConnection();

        //Obtenir les colonnes et leurs valeurs pour les binding du insert
        $bindingRes = $this->UpdateFields($grouping);
        $tabValue = $bindingRes[0];
        $strCol = $bindingRes[1];
        $columnTypes = $bindingRes[2];  
        
        $identifier = $grouping[$this->getIdentifier()];
        
        if($this->getIdentifiantName()) {
            $strCol .= ",{$this->getIdentifiantName()} = ?";
            array_push($tabValue, $this->getUserId());
            array_push($columnTypes, Column::TYPE_VARCHAR);
        }
        
        $sql = "UPDATE ". $this->getTransactionTableName()." SET {$strCol}  WHERE {$this->getIdentifier()} = {$identifier}";
        
        $result = $connection->execute($sql, $tabValue, $columnTypes);
        
        if($result){
            
            $sql = "SELECT * FROM {$this->getDisplayTableName()} WHERE {$this->getIdentifier()} = {$identifier}";

            $result = $connection->query($sql);
            $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
            if(!$result){
                throw new Exception('Database error');
            }
            else{
                $grouping = $result->fetchAll();
            }                
            
            return array("result" => "success", "grouping" => $grouping);
        }else {
            return array("result" => "failure");
        }
    }
    
    /**
     * Duplicate a grouping
     * @param integer $idGrouping Id of the grouping to duplicate
     * @return type
     * @throws Exception
     */
    public function duplicateGrouping($idGrouping){
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $connection = $this->getConnection();
        
        $procedure = $this->getDuplicateProcedure();
                
        $sql = "CALL {$procedure}(?,?)";      
        
        $statement = $connection->prepare($sql);
        $statement->bindParam(1, intval($idGrouping), PDO::PARAM_INT);
        $statement->bindParam(2, $result, PDO::PARAM_STR, 2048); //PARAM_LOB ne fonctionne pas
        $statement->execute();
        
         if(!$result){
            throw new Exception('Database error');
        }
        
        return array_change_key_case(get_object_vars(json_decode($result)));
    }
    
    /**
     * Insert a associate document to the grouping
     * @param object $grouping object to associate the document
     * @param file $uploadfile file to associate
     * @param string $filename the filemane
     * @param string $extension the extension of the file
     * @param integer $size the size of the file
     * @param string $mime the mime of the file
     * @return object of result
     */
    //TODO Adapt to Postgresql
    public function associateDocument($grouping, $uploadfile, $filename, $extension, $size, $mime) {
        
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $valid = $this->getAssociateFileValidation($uploadfile, $filename, $extension, $size, $mime);
        
        if($valid !== true){
            return array("result" => "failure", "error" => $valid);
        }
        
        $connection = $this->getConnection();
                
        $tableName = $this->getAssociateFileTable();
        $fkAttr = $this->getAssociateFileFk();
        $nameAttr = $this->getAssociateFileName();
        $fileAttr = $this->getAssociateFileBlob();
        $sizeAttr = $this->getAssociateFileSize();
        $mimeAttr = $this->getAssociateFileMime();
        $arrayOfBind = Array();
        
        $tabValue = Array();
        $columnTypes = Array();
        
        if($fkAttr){
            $strCol .= "{$fkAttr}";
            $strBind .= "?";

            $param = Array((count($arrayOfBind)+1), $grouping->{$this->getIdentifier()}, PDO::PARAM_INT);
            array_push($arrayOfBind, $param);
        }
        
        if($nameAttr) {
            $strCol .= ", {$nameAttr}";
            $strBind .= ",?";
            
            $param = Array((count($arrayOfBind)+1), $filename, PDO::PARAM_STR);
            array_push($arrayOfBind, $param);
        }                       
        
        //À retirer quand la procédure sera okay
        $strBind .= ",?";
        $param = Array((count($arrayOfBind)+1), '', PDO::PARAM_STR);
        array_push($arrayOfBind, $param);
        
        if($fileAttr) {
            $strCol .= ", {$fileAttr}";
            $strBind .= ",?";
            
            $fp = fopen($uploadfile['tmp_name'], 'rb');         
            
            $param = Array((count($arrayOfBind)+1), $fp, PDO::PARAM_LOB);
            array_push($arrayOfBind, $param);
        }
        
        if($sizeAttr) {
            $strCol .= ", {$sizeAttr}";
            $strBind .= ",?";
            
            $param = Array((count($arrayOfBind)+1), $size, PDO::PARAM_INT);
            array_push($arrayOfBind, $param);
        }         
        
        if($mimeAttr) {
            $strCol .= ", {$mimeAttr}";
            $strBind .= ",?";
            
            $param = Array((count($arrayOfBind)+1), $mime, PDO::PARAM_STR);
            array_push($arrayOfBind, $param);
        }
        
        $procedure = $this->getAssociateFileInsertProcedure();
  
        $sql = "BEGIN {$procedure} ({$strBind}); END; ";
        $stmt = $connection->prepare($sql);
        
        foreach($arrayOfBind as $binding){
            $stmt->bindParam($binding[0], $binding[1], $binding[2]); 
        }
        
        $result = $stmt->execute();
        
        if($result){       
            return array("result" => "success");
        }
        else {
            return array("result" => "failure");
        }
    }
    
    /**
     * Delete an associate document
     * @param object $document object of the document information
     * @return object of result
     */
    public function deleteDocument($document){
        
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $connection = $this->getConnection();
        
        $id = $this->getAssociateFileId();
        
        $idValue = $document[$id];
        
        $tabValue = Array($idValue);
        $columnTypes = Array(PDO::PARAM_INT);
        
        $sql = "DELETE FROM {$this->getAssociateFileTable()} WHERE {$id} = ?";
        
        $result = $connection->execute($sql, $tabValue, $columnTypes);
        
        if($result){
            return array("result" => "success");
        }else {
            return array("result" => "failure");
        }
    }
    
    /**
     * Download the content of a specific document
     * @param object $document object of the document to get the file
     * @return object of result
     */
    public function downloadDocument($document){
         
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $connection = $this->getConnection();
        
        $id = $this->getAssociateFileId();
        
        $idValue = $document->{$id};
        
        $tabValue = Array($idValue);
        $columnTypes = Array(PDO::PARAM_INT);
        
        $strCol = $this->getAssociateFileName() . ", " . $this->getAssociateFileBlob() . ", " . $this->getAssociateFileMime() . ", ". $this->getAssociateFileSize();
        
        $sql = "SELECT {$strCol} FROM {$this->getAssociateFileTable()} WHERE {$id} = ?";
        
         $result = $connection->query($sql, $tabValue, $columnTypes);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        
        if($result){
             
            $data = $result->fetchAll()[0];
            
            header("Content-length: {$data[$this->getAssociateFileSize()]}");
            header("Content-type: {$data[$this->getAssociateFileMime()]}");
            header("Content-Disposition: attachment; filename={$data[$this->getAssociateFileName()]}");            
                        
            fpassthru($data[$this->getAssociateFileBlob()]);
            exit();

                //return array("result" => "success", "document" => $result->fetchAll());
        }else {
            return array("result" => "failure");
        }
    }
    
    /**
     * Get the document list
     * @param object $grouping object of the grouping to get the document list
     * @return object of result
     */
    public function getDocumentList($grouping){
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        $connection = $this->getConnection();       
                
        $fkId = $this->getAssociateFileFk();
        
        $fkIdValue = $grouping->{$this->getIdentifier()};
        
        $tabValue = Array($fkIdValue);
        $columnTypes = Array(PDO::PARAM_INT);

        $fields = $this->getAssociateFileFields();
        
        $strCol = "";
        foreach($fields as $field){
            
            //Define file size with unit if define as String
            if($field->propriete == $this->getAssociateFileSize() && $field->type == "string"){
                $sizeAttr = $this->getAssociateFileSize();
                $theField .= ", CASE
                                WHEN 
                                     ({$sizeAttr}) < 1024 THEN {$sizeAttr} || ' o' 
                                WHEN
                                    ({$sizeAttr}/1024) < 1024 THEN ROUND({$sizeAttr}/1024,2) || ' Ko' 
                                WHEN
                                    ({$sizeAttr}/1024/1024) < 1024 THEN ROUND({$sizeAttr}/1024/1024,2) || ' Mo'
                                WHEN ({$sizeAttr}/1024/1024/1024) < 1024 THEN ROUND({$sizeAttr}/1024/1024/1024,2) || ' Go'
                                END  AS {$sizeAttr}";
            }
            else{
                $theField = $field->propriete;
            }
            
            
            if($strCol == ""){
                $strCol = $theField;
            }else{
                $strCol.= ", " .$theField;
            }
        }
        
        $sql = "SELECT {$strCol} FROM {$this->getAssociateFileTable()} WHERE {$fkId} = ?";
        
        //$result = $connection->execute($sql, $tabValue, $columnTypes);
        $result = $connection->query($sql, $tabValue, $columnTypes);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        
        if($result){
            return array("result" => "success", "documentlist" => $result->fetchAll());
        }else {
            return array("result" => "failure");
        }
    }
    
    /**
     * Get the document column description to build the information grid
     * @return object of result
     */
    public function getDocumentDescription(){
        
        $fileNameAttr = $this->getAssociateFileName();
        $fileMimeAttr = $this->getAssociateFileMime();
        
        $fields = $this->getAssociateFileFields();
        
        return array("result" => "success", "fileNameAttr" => $fileNameAttr, "fileMimeAttr" =>$fileMimeAttr, "fields" => $fields);       
    }
    
 
    /**
     * Get the layers associated to the grouping to select them in the user interface
     * @param object $grouping object of the grouping
     * @return object of result
     * @throws Exception
     */
    public function getAssociatedLayers($grouping) {
        
        $tabValue = array();
         $columnTypes = array();
        
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        
        //Colonne associée au type de regroupement
        $attrGroupType = $this->getGroupingTypeName();
        
        //Nom de la table
        $table = $this->getTableAssociationName();
        
        //Colonne du nom du service
        $attrLayer = $this->getGroupingAttribLayer();
        
        array_push($tabValue, $grouping[$attrGroupType]);
        $strCol =  $attrGroupType;
        array_push($columnTypes,2);
        
        $sql = "SELECT {$attrLayer} FROM {$table} WHERE {$strCol} = ?";
        
        
        //Condition pour obtenir seulement les couches actives à l'édition
        if($this->getActiveServiceCondition()){
           $sql.= " AND {$this->getActiveServiceCondition()}"; 
        }
          
        $config = $this->getDi()->get("config");
        if($config->application->debug == true){
            error_log($sql);
        }
                    
        $connection = $this->getConnection();
        $result = $connection->query($sql, $tabValue, $columnTypes);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        if(!$result){
            throw new Exception('Database error');
        }
        
        $i =0;
        while($r = $result->fetch()){
            $arrLayers[$i]["layer"] = $r[$attrLayer];
            $arrLayers[$i]["fk"] = $grouping[$this->getIdentifier()];
            $arrLayers[$i]["describe"] = describeFeatureType($arrLayers[$i]);
            $arrLayers[$i]["data"] = getFeaturesFk($arrLayers[$i]);
            $arrLayers[$i]["title"] = getTitleDescription($arrLayers[$i]);
            $arrLayers[$i]["associatedLayers"] = getAssociatedLayersInformation($arrLayers[$i]);
            $arrLayers[$i]["label"] = getLabelNameInformation($arrLayers[$i]);          
            
            $i++;
        }
        
        return $arrLayers;
    }
    /**
     * No Sequence by default
     * Implement with the SQL request to get the Sequence
     * @return Default boolean false or string of SQL request
     */
    public function getSQLNextSequence(){
        return false;
    }
    
    /**
     * No file association by default
     * Implement with true to activate
     * You have to implement getAssociateFileTable, getAssociateFileId, getAssociateFileFk
     * getAssociateFileName, getAssociateFileBlob, getAssociateFileSize, getAssociateFileMime
     * to complete the feature
     * @return boolean false by default
     */
    public function getHaveAssociateFile(){
        return false;
    }
    
    /**
     * File are valid by default
     * Implement with a size to define max size
     * @return boolean true
     */
    public function getAssociateFileValidation($uploadfile, $filename, $extension, $size, $mime){
        return true;
    }
}

