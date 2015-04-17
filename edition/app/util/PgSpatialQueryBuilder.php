<?php

class PgSpatialQueryBuilder implements ISpatialQueryBuilder{
    
    
    public function ST_Transform($query, $srid) {
        return "ST_Transform({$query},{$srid})";
    }

    public function ST_ASText($query) {
        return "ST_AsText({$query})";
    }

    public function ST_GeomFromText($wkt) {
        return "ST_GeomFromText('{$wkt}')";
    }

    public function ST_Intersects($geomA, $geomB) {
        return "ST_Intersects({$geomA},{$geomB})";        
    }

    public function ST_SetSRID($query, $srid) {
        return "ST_SetSRID({$query},{$srid})";
    }
    
    public function isEquivalent($geometryType, $geomA, $geomB, $buffer){
        // Vérifier si c'est une modif geo.
        // Pour palier aux contraintes de précisions, on assume qu'une modif géo ne se produit que si le point a été déplacé de {$buffer} en coordonées du SRID.
        if($geometryType == "point"){
            return "ST_Distance({$geomA},{$geomB}) < {$buffer}";
        }else if($geometryType == "LineString"){
            return "(ST_Contains(ST_BUFFER({$geomA},{$buffer}), {$geomB}) AND abs(ST_Length({$geomA}) - ST_Length({$geomB})) < {$buffer})";
        }else if($geometryType == "polygon" || $geometryType == "circle"){
            return "(ST_Contains(ST_BUFFER({$geomA},{$buffer}), {$geomB}) AND ((ST_Area({$geomA}) - ST_Area({$geomB})) < {$buffer}))";
        }else{
            throw new Exception("Not implemented isEquivalent() for geometry type : {$geometryType}");
        }
    }

}