<?php

class PointFeatureService extends SimpleFeatureService{
    
    
    public function allowDelete() {
        return true;
    }

    public function allowNew() {
        return true;
    }

    public function allowUpdate() {
        return true;
    }

    public function getAssociatedLayers() {
        return array();
    }

    public function getDescription() {
        return "Service exemple d'édition de points";
    }

    public function getGeometryName() {
        return "GEOM_P";
    }

    public function getGeometryType() {
        return "point";
    }

    public function getIdentifier() {
        return "NO_SEQ_POINT_FEATURE_SERVICE";
    }
    
    
    public function getReferenceIdentifier() {
        return "NO_SEQ_POINT_FEAT_SERVICE_REF";
    }

    public function getDisplayTableName() {
        return "POINT_FEATURE_SERVICE";
    }
    
    public function getTransactionTableName() {
        return "POINT_FEATURE_SERVICE_V";
    }
    
    public function getStatutName() {
       return "STATUT"; 
    }

    public function getMaximumScale() {
        return 15000000;
    }

    public function getMinimumScale() {
        return 1;
    }

    public function getName() {
        return "ExemplePoint";
    }

    public function getSRID() {
        return "4326";
    }
    
    public function getFields($geometry, $fk) {
        $fields = array();

        $commentaire = new TextField("COMMENTAIRE", "Commentaire", true, true);
        $fields[] = $commentaire;

        $valeur_bool = new BooleanField("VALEUR_BOOL", "Valeur bool", true, true);
        $fields[] = $valeur_bool;
        $valeur_integer = new IntegerField("VALEUR_INTEGER", "Valeur integer", true, true);
        $fields[] = $valeur_integer;
        $valeur_string = new StringField("VALEUR_STRING", "Valeur string", true, true);
        $fields[] = $valeur_string;
        
        $justification = new TextField("JUSTIFICATION", "Justification", false, true);
        $fields[] = $justification;

        return $fields;
    }

}

