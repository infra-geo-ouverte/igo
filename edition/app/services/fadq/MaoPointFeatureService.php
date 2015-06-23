<?php

class MaoPointFeatureService extends SimpleFeatureService {

    public function getIdentifier() {
        return "id";
    }

    public function getName() {
        return "MaoPointFeatureService";
    }

    public function getViewName() {
        return "locip_elem_geom_poin";
    }

    public function getTableName() {
        return "locvdp_elem_geom_poin"; 
    }

    public function getDescription() {
        return "Service de modification des géométries point des schémas MAO.";
    }
    
    public function getTitle(){
        return "Points";
    }
    
    public function getLabelName(){
        return "etiq_elem_geom";
    }    
    
    public function getStatutName() {
        return "type_oper_occu";
    }
    
    public function getIdentifiantName() {
        return "usag_maj";
    }
  
    public function getJustificationName() {
        return "desc_elem_geom";
    }
    
    public function allowNew() {
        return true;
    }

    public function allowUpdate() {
        return true;
    }

    public function allowDelete() {
        return true;
    }

    public function getAssociatedLayers() {
        return array();
    }

    public function getSRID() {
        return "4326";
    }

    public function getGeometryName() {
        return "geom_poin";
    }

    public function getGeometryType() {
        return "point";
    }

    public function getMinimumScale() {
        return 1;
    }

    public function getMaximumScale() {
        return 170000;
    }
    
    public function getReferenceIdentifier() {
        return "fk_egp_id";
    }
    
    public function getFk(){
        return "fk_sh_id";
    }
    
    public function getSequenceName(){
        return "LOCS_EGP_SEQ";
    }

    public function getFields($geom, $fkId) {
        $fields = array();
        
        $idElem = new IntegerField("id", "Id élément", false, false);
        $fields[] = $idElem;
        
        $typeElemGeom = new EnumerationField("type_elem_geom", "Type d'élément", true, true);
         if($fkId){$typeElemGeom->valeurs = $this->obtenirTypeElemGeom($fkId);}
        $fields[] = $typeElemGeom;
        
        $etiq = new StringField("etiq_elem_geom", "Étiquette", true, false);  
        $etiq->maxLenght = 25;
        $fields[] = $etiq;
        
        $desc = new StringField("desc_elem_geom", "Description", true, false);            
        $desc->maxLenght = 250;
        $fields[] = $desc;
        
        $anOrth = new IntegerField("an_imag", "Année d'image", true, false);
        $fields[] = $anOrth;
        
        $timbMaj = new StringField("timb_maj", "Timbre de mise à jour", false, false); 
        $fields[] = $timbMaj;
        
        $usagMaj = new StringField("usag_maj", "Usager mise à jour", false, false); 
        $fields[] = $usagMaj;
        
        return $fields;
    }
    
    /*action:obtenirDomaineValeur
    domaine:TYPE_ELEM_GEOM_POIN*/
    private function obtenirTypeElemGeom($fkId) {

        // Ajouter les noms des municipalitées voisines au cas ou les limites municipales ne seraient pas bonnes.
        //$sql = "SELECT CODE, DESC_ABRE_FRAN FROM REFV_TYPE_ELEM_GEOM_POIN ORDER BY CODE ASC";
        $sql = "SELECT CODE, DESC_FRAN FROM REFV_TYPE_ELEM_GEOM  REFV
                INNER JOIN PART_ELEM_SCHE PART
                 ON REFV.CODE = PART.TYPE_ELEM_GEOM
                INNER JOIN LOCT_SCHE LS
                 ON LS.TYPE_SCHE = PART.TYPE_SCHE
                WHERE TYPE_GEOM = 'POIN'
                AND LS.ID = {$fkId}";
        
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
                $values[$i]["value"] = mb_convert_encoding($r['desc_fran'],'UTF-8', 'ISO-8859-1');;
                $i++;
            }    
        }
        if($config->application->debug == true){
            //error_log(json_encode($values));
        } 
        
        return $values;
    }
    
    /**
    * Implémentation spécifique pour createFeature.
    */
    public function createFeature2($feature){
        if(!$this->isAuthenticated()){
            return $this->getAuthenticationErrorMessage();
        }
        if(!$this->AreFieldsValid($feature)){
            return $this->GetErrorMessage($feature);
        }

        //Obtenir les colonnes et leurs valeurs pour les binding du insert
        $bindingRes = $this->bindFields($feature);
        $tabValue = $bindingRes[0];
        $strCol = $bindingRes[1];
        $columnTypes = $bindingRes[2];
        

        $sqlGeometry = $this->GetSqlGeometry($feature->geometry);	
        
        //Ajouter les colonnes génériques
        array_push($tabValue, $this->getUserId());
        array_push($tabValue, 'A');
        $strCol .= ",{$this->getIdentifiantName()} , {$this->getStatutName()}";
        
        //Todo pour regroupemement
        //Coder en dur FK_SH_ID
        array_push($tabValue,"1");
        $strCol.=", fk_sh_id";
        
        //Obtenir la string de binding pour la requête insert
        $strBinding = $this->getStringBinding($tabValue);
        
        $connection = $this->getConnection();
        
        $result = $connection->execute("INSERT INTO ". $this->getTableName()." (".$this->getGeometryName().", $strCol) VALUES($sqlGeometry, $strBinding)", $tabValue, $columnTypes);
        
        if($result){
            return array("result" => "success");
        }else {
            return array("result" => "failure");
        }
    }
}
