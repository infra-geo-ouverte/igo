<?php

/**
 * Description of SchemaService
 *
 * @author Michael Lane
 */

//require_once($_SERVER['DOCUMENT_ROOT'] . '/commun/autoload.php');
if(!defined("FADQ_CONFIG_SERVICE_PATH_COMMUN")){
    define("FADQ_CONFIG_SERVICE_PATH_COMMUN", $_SERVER["DOCUMENT_ROOT"] . "/commun");
}
require_once(FADQ_CONFIG_SERVICE_PATH_COMMUN . '/class/Config.class.php');
require_once(FADQ_CONFIG_SERVICE_PATH_COMMUN . '/config/config.php');

class SchemaService extends SimpleGroupService  {
    
    public function allowNew() {
        return true;
    }

    public function allowUpdate() {
        return true;
    }

    public function allowDelete() {
        return true;
    }
    
    public function getIdentifier() {
        return "id";
    }
    
    public function getIdentifiantName(){
        return "usag_maj";
    }
    
    public function getName() {
        return "Schéma";
    }
    
    public function getTableName() {
        return "locvd_sche";
    }
    
    public function getViewName() {
        return "loci_sche"; 
    }
    
    public function getTableAssociationName(){
        return "part_tabl_sche";
    }
    
    public function getTypeAssociationName() {
        return "type_sche";
    }
    
    public function getDescription() {
        return "Schéma d'intervention";
    }
    
    public function getGroupingTypeName() {
        return "type_sche";
    }
    
    public function getGroupingAttribLayer() {
        return "nom_serv";
    }
    
    public function getActiveServiceCondition() {
        return "INDI_TABL_UTIL = 'O'";
    }
    
    public function getForeignKey() {
        return "fk_ra_no_perm";
    }
    
    public function getSQLNextSequence(){
        return "SELECT LOCS_SH_SEQ.NEXTVAL AS NEXTINSERTID FROM DUAL";
    }
    
    public function getDuplicateProcedure(){
        return "LOC_SH.COPI_SCHE";
    }
    
    public function getHaveAssociateFile(){
        return true;
    }
    
    public function getAssociateFileTable(){
        return "LOCT_DOCU";
    }
    
    public function getAssociateFileInsertProcedure(){
        return "LOC_DOCU.INSC_DOCU";
    }
    
    public function getAssociateFileId(){
        return "id";
    }
    
    public function getAssociateFileFk(){
        return "fk_sh_id";
    }
    
    public function getAssociateFileName(){
        return "nom_phys_docu";
    }
    
    public function getAssociateFileBlob(){
        return "docu";
    }
    
    public function getAssociateFileSize(){
        return "tail_docu";
    }
    
    public function getAssociateFileMime(){
        return "mime_type";
    } 
    
    public function getAssocateFileMaxSize(){
        return (10 * 1024 * 1024); //10Mo
    }
    
    public function getOraclePatchConnexion(){
                    
        $connection= oci_connect(Config::get('donnees', 'oracle', 'usager'),
                                 Config::get('donnees', 'oracle', 'motPasse'),
                                 Config::get('donnees', 'oracle', 'serveur'));
        
        
        return $connection;

    }
    
    //Validation que les fichiers joints respectent les conditions d'insertion
    public function getAssociateFileValidation($uploadfile, $filename, $extension, $size, $mime){
        
        if(intVal($size) > $this->getAssocateFileMaxSize() || intVal($size) == 0){
            $error = new stdClass();
            $error->size = new stdClass();
            $error->size->message = "Vous devez sélectionner un document numérisé qui contient des données et avoir au plus une taille de 10mo.";
            return[$error];
        }
            else {
                return true;
        }
    }    
    
    public function getTypes()
    {
        $sql = "SELECT CODE, DESC_ABRE_FRAN FROM REFV_TYPE_SCHE ORDER BY CODE ASC";

        $config = $this->getDi()->get("config");
        if($config->application->debug == true){
            //error_log($sql);
        } 
        
        $connection = $this->getConnection();
        $result = $connection->query($sql);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        if(!$result){
            throw new Exception('Database error');
        }

        $i = 0;
        $values = array();
        while($r = $result->fetch()){
            if ($r['code'] != null) {
                $values[$i] = array();
                $values[$i]["id"] = $r['code'];
                $values[$i]["value"] = mb_convert_encoding($r['desc_abre_fran'],'UTF-8', 'ISO-8859-1');
                $i++;
            }    
        }
        if($config->application->debug == true){
            //error_log(json_encode($values));
        } 
        
        return $values;
    }
    
    public function getFields() {       
        
        $fields = array();
        
        $fk = new IntegerField("fk_ra_no_perm", "fk key", false, false, false);
        $fields[] = $fk;
        //NO_SCHE est devenu ID
        $numSchema = new IntegerField("id", "Numéro de schéma", false, false);
        $fields[] = $numSchema;
        
        $typeSche = new EnumerationField("type_sche", "Type de schéma", true, true);
        $typeSche->valeurs = $this->getTypes();
        $fields[] = $typeSche;
        
        $desc = new StringField("desc_sche", "Description", true, true);            
        $desc->maxLenght = 250;
        $fields[] = $desc;
        
        $anAss = new IntegerField("an", "Année", true, false);
        $fields[] = $anAss;
        
        $timbMaj = new StringField("timb_maj", "Date de mise à jour", false, false); 
        $fields[] = $timbMaj;
        
        $usagMaj = new StringField("usag_maj", "Usager mise à jour", false, false); 
        $fields[] = $usagMaj;
        
        return $fields;           
    }
    
    //Validation que l'année en cours est sélectionnée pour un plan de production
    public function getValidPlanProdAn($grouping) {

        //Lors de la création:validation que l'année de sélection
        if($grouping["type_sche"] == "PLP" && $grouping["an"] < date("Y")){                       
            
            $error = new stdClass();

            $error->type_sche = new stdClass();
            $error->type_sche->message = "Vous ne pouvez réaliser un plan de production que pour l’année courante.";        
            
            return $error;
        }

        return true;
    }
    
    public function isValid($grouping, $fkId){

        $resultPlanProdAn = $this->getValidPlanProdAn($grouping);
        $result = new stdClass();


        if($resultPlanProdAn === true){
            return true;
        }
        else {
            if(is_object($resultPlanProdAn)){
                $result = (object) array_merge((array) $resultPlanProdAn, (array) $result);
            }

            return [$result, $grouping];
        }
    }
    
    public function getAssociateFileFields() {
       $fields = array();
       
       $id = new IntegerField("id", "id", false, false, false);
       $fields[] = $id;
       
       $fk = new IntegerField("fk_sh_id", "fk key", false, false, false);
       $fields[] = $fk;
       
       $name = new StringField("nom_phys_docu", "Nom", false, false, true);
       $fields[] = $name;
       
       $lastUpdate = new StringField("timb_maj", "Dernière modification", false, false, true);
       $fields[] = $lastUpdate;
       
       $size = new StringField("tail_docu", "Taille", false, false); //Define in string to get the unit
       $fields[] = $size;
       
       return $fields;  
    }
    
    public function associateDocument($grouping, $uploadfile, $filename, $extension, $size, $mime) {
                
        $valid = $this->getAssociateFileValidation($uploadfile, $filename, $extension, $size, $mime);
        
        if($valid !== true){
            return array("result" => "failure", "error" => $valid);
        }
         
        $connection = $this->getOraclePatchConnexion();        
        
        $procedure = $this->getAssociateFileInsertProcedure();
        
        $contenu = file_get_contents($uploadfile['tmp_name']); 
        $blob = oci_new_descriptor($connection, OCI_D_LOB);  
        $plsql =  "BEGIN {$procedure} (:FK_SH_ID, :NOM_DOCU, :DOCU, :TAIL_DOCU, :MIME_TYPE); END; ";

        $fk = $grouping->{$this->getIdentifier()};
      
        $stid = oci_parse($connection, $plsql);
        
        oci_bind_by_name($stid, ":FK_SH_ID",$fk );
        oci_bind_by_name($stid, ":NOM_DOCU",$filename );
        oci_bind_by_name($stid, ":DOCU",$blob, -1, OCI_B_BLOB);
        oci_bind_by_name($stid, ":TAIL_DOCU", $size);
        oci_bind_by_name($stid, ":MIME_TYPE",$mime );
        
        $blob->WriteTemporary($contenu, OCI_TEMP_BLOB); 
        try {
            $result = oci_execute($stid,OCI_DEFAULT);
        }
        catch (Exception $e) {
            throw oci_error($stid) . $e;
        }

        if (!$result) {
            throw oci_error($stid);
        }          

        if($result){ 
            $blob->save($contenu); 
            oci_commit($connection);
            $blob->close(); 
            $blob->free(); 
            oci_free_statement($stid);   
            oci_close($connection);
            return array("result" => "success");
        }
        else {
            oci_rollback($connection);
            oci_free_descriptor($blob);
            oci_free_statement($stid);   
            oci_close($connection);
            return array("result" => "failure");
        } 
        
        return array("result" => "success");    
        
    }    
}
