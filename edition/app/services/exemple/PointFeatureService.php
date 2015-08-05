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
    
    public function getTitle() {
        return "Exemple Point";
    }

    public function getGeometryName() {
        return "geom_p";
    }

    public function getGeometryType() {
        return "point";
    }
    
    public function getStatutName() {
        return "statut";
    }
    
    public function getIdentifiantName() {
        return "identifiant";
    }
  
    public function getJustificationName() {
        return "justification";
    }
    
    public function getIdentifier() {
        return "no_seq_point_feature_service";
    }
    
    
    public function getReferenceIdentifier() {
        return "no_seq_point_feat_service_ref";
    }

    public function getDisplayTableName() {
        return "point_feature_service";
    }
    
    public function getTransactionTableName() {
        return "point_feature_service_v";
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

        $commentaire = new TextField("commentaire", "Commentaire", true, true);
        $fields[] = $commentaire;

        $valeur_bool = new BooleanField("valeur_bool", "Valeur bool", true, false);
        $fields[] = $valeur_bool;
        $valeur_integer = new IntegerField("valeur_integer", "Valeur integer", true, true);
        $fields[] = $valeur_integer;
        $valeur_string = new StringField("valeur_string", "Valeur string", true, true);
        $fields[] = $valeur_string;
        
        $justification = new TextField("justification", "Justification", true, true);
        $fields[] = $justification;

        return $fields;
    }

}

