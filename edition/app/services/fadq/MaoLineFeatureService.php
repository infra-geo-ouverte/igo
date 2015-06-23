<?php

class MaoLineFeatureService extends SimpleFeatureService {

    public function getIdentifier() {
        return "id";
    }

    public function getName() {
        return "MaoLineFeatureService";
    }

    public function getViewName() {
       return "locil_elem_geom_lign";
    }

    public function getTableName() {
        return "locvdl_elem_geom_lign";
    }

    public function getDescription() {
        return "Service de modification des géométries point des schémas MAO.";
    }
    
    public function getTitle(){
        return "Lignes";
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
        return "geom_lign";
    }

    public function getGeometryType() {
        return "LineString";
    }

    public function getMinimumScale() {
        return 1;
    }

    public function getMaximumScale() {
        return 170000;
    }
    
    public function getReferenceIdentifier() {
        return "fk_egl_id";
    }
    
    public function getFk(){
        return "fk_sh_id";
    }
    
    public function getSequenceName(){
        return "LOCS_EGL_SEQ";
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
        //$sql = "SELECT CODE, DESC_ABRE_FRAN FROM REFV_TYPE_ELEM_GEOM_LIGN ORDER BY CODE ASC";
        $sql = "SELECT CODE, DESC_FRAN FROM REFV_TYPE_ELEM_GEOM  REFV
                INNER JOIN PART_ELEM_SCHE PART
                 ON REFV.CODE = PART.TYPE_ELEM_GEOM
                INNER JOIN LOCT_SCHE LS
                 ON LS.TYPE_SCHE = PART.TYPE_SCHE
                WHERE TYPE_GEOM = 'LIGN'
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
}
