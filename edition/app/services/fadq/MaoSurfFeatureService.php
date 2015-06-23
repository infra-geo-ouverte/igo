<?php

class MaoSurfFeatureService extends SimpleFeatureService {

    public function getIdentifier() {
        return "id";
    }

    public function getName() {
        return "MaoSurfFeatureService";
    }

    public function getViewName() {
        return "locvds_elem_geom_surf";
    }

    public function getTableName() {
        return "locvds_elem_geom_surf";
    }

    public function getDescription() {
        return "Service de modification des géométries surface des schémas MAO.";
    }

    public function getTitle(){
        return "Surfaces";
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
        return "geom_surf";
    }

    public function getGeometryType() {
        return "polygon";
    }

    public function getMinimumScale() {
        return 1;
    }

    public function getMaximumScale() {
        return 170000;
    }

    public function getReferenceIdentifier() {
        return "fk_egsu_id";
    }

    public function getFk(){
        return "fk_sh_id";
    }

    public function getSequenceName(){
        return "LOCS_EGSU_SEQ";
    }

    public function getFields($geom, $fkId) {
        $fields = array();

        $idElem = new IntegerField("id", "Id élément", false, false);
        $fields[] = $idElem;

        $superficie = new FloatField("supe", "Superficie (m²)", false, false);
        //$superficie = new IntegerField("supe", "Superficie (m²)", false, false);
        $fields[] = $superficie;

        $superficieHect = new FloatField("g_supe_hect", "Superficie (ha)", false, false);
        $fields[] = $superficieHect;

        $superficieAcre = new FloatField("g_supe_acre", "Superficie (acres)", false, false);
        $fields[] = $superficieAcre;

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
        //$sql = "SELECT CODE, DESC_ABRE_FRAN FROM REFV_TYPE_ELEM_GEOM_SURF ORDER BY CODE ASC";
        $sql = "SELECT CODE, DESC_FRAN FROM REFV_TYPE_ELEM_GEOM  REFV
                INNER JOIN PART_ELEM_SCHE PART
                 ON REFV.CODE = PART.TYPE_ELEM_GEOM
                INNER JOIN LOCT_SCHE LS
                 ON LS.TYPE_SCHE = PART.TYPE_SCHE
                WHERE TYPE_GEOM = 'SURF'
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
     * Valider que la superficie > 50m2
     * @param type $geom
     * @throws Exception
     */
    public function getSuperficieValide($feature){

        $connection = $this->getConnection();

        $geom = $this->GetSqlGeometry($feature->geometry);

        //TODO problème de paramètre plus de 4000 caractères
        /*
         *  $geomFlat = "";
            for($a=0;$a < count($feature->geometry->coordinates[0]);$a++){

                if($geomFlat != ""){
                    $geomFlat.= ",";
                }

                $geomFlat.= $feature->geometry->coordinates[0][$a][0] . " " . $feature->geometry->coordinates[0][$a][1];
            }

       // $sql = "SELECT SDO_GEOM.SDO_AREA(SDO_CS.TRANSFORM(SDO_GEOMETRY(?, 4326),4326), 0.05, 'unit=SQ_M') AS SUPE FROM DUAL";

        //$result = $connection->query($sql);

        $sql = "DECLARE
                    MA_GEO   CLOB;
                    AREA    NUMBER;
                BEGIN
                    MA_GEO := ?;

                    SELECT SDO_GEOM.SDO_AREA (
                            SDO_CS.TRANSFORM (SDO_GEOMETRY (MA_GEO, 4326), 4326),
                            0.05,
                            'unit=SQ_M')
                            AS SUPE
                        INTO AREA
                        FROM DUAL;


                END;";


        $tabValue = Array();

        $param = "POLYGON (({$geom}))";
       array_push($tabValue, $param);
        $tabType = Array();
        $result = $connection->query($sql, $tabValue);


        $stmt = $connection->prepare("BEGIN obtenirSuperficieClob(? in CLOB, ?); END;");
        $stmt ->execute(array($param, $area));

         */



        $sql = "SELECT SDO_GEOM.SDO_AREA({$geom}, 0.05, 'unit=SQ_M') AS SUPE FROM DUAL";

        $result = $connection->query($sql);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        if(!$result){
            throw new Exception('Database error');
        }

        $row = $result->fetch();
        if($row == null || $row["supe"] < 50)
        {
            $error = new stdClass();
            $error->supe = new stdClass();

            $supe = round($row['supe'],2);
            $error->supe->message = "La superficie de {$supe} est plus petite que le minimum de 50m²";

            $feature->properties->supe = $supe;

            return $error;
        }
        else{
            return true;
        }
    }

    public function getSSParcellesValide($feature, $fkId) {

        //Lors de la création:validation que la sous-parcelle à un centroide à l'intérieur de la parcelle
        if($feature->properties->type_elem_geom == "SPA"){                      

            //Validation que le centroïde de la sous-parcelle est à l'intérieur d'une parcelle existante pour l'année du schéma pour les schémas de type sous- parcelles
            $connection = $this->getConnection();

            $geom = $this->GetSqlGeometry($feature->geometry);

            $sql = "SELECT 1 as result from
                        (SELECT GEOM_SURF FROM LOCTS_PARC_AGRI_AN_COUR  LPAAN
                         INNER JOIN LOCT_SCHE LS
                         on LS.FK_RA_NO_PERM = LPAAN.FK_RA_NO_PERM_PROP
                         WHERE  id = {$fkId})  P
                    WHERE
                        SDO_CONTAINS(P.geom_surf,
                                    (SELECT sdo_geom.sdo_centroid({$geom}, 0.05) from DUAL ))= 'TRUE'";

            $result = $connection->query($sql);
            $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
            if(!$result){
                throw new Exception('Database error');
            }
            $response = count($result->fetchAll());

            if($response == 1){
                return true;
            }
            
            if($response == 0) {
                $error = new stdClass();
                
                $error->type_elem_geom = new stdClass();
                $error->type_elem_geom->message = "Le centroîde de la géométrie doit être à l'intérieur d'une parcelle existante pour ce type de géométrie.";
            }          
            
            return $error;
        }
        
        return true;
    }

    public function isValid($feature, $fkId){

        $resultSupVal = $this->getSuperficieValide($feature);
        $resultSSParVal = $this->getSSParcellesValide($feature, $fkId);
        $result = new stdClass();


        if($resultSupVal === true && $resultSSParVal === true){
            return true;
        }
        else {
            if(is_object($resultSupVal)){
                $result = (object) array_merge((array) $resultSupVal, (array) $result);
            }

            if(is_object($resultSSParVal)){
                $result =(object) array_merge((array) $resultSSParVal, (array) $result);
            }

            return [$result, $feature];
        }
    }
}
