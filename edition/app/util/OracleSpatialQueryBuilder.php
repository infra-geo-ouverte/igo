<?php

class OracleSpatialQueryBuilder implements ISpatialQueryBuilder{
    
    public function ST_Transform($query, $toSrid) {
        return "SDO_CS.TRANSFORM(".$query.",".$toSrid.")";
    }

    public function ST_ASText($query) {
        return " TO_CHAR(SDO_UTIL.TO_WKTGEOMETRY({$query}))";
        return $query;
    }

    public function ST_GeomFromText($wkt, $srid = 4326) {
        return "SDO_GEOMETRY('{$wkt}', $srid)";
    }

    public function ST_Intersects($geom1, $geom2) {
        return "SDO_FILTER(".$geom1.", ".$geom2.") = 'TRUE'";
    }

    public function ST_SetSRID($query, $srid) {
        //Seulement pour Pg. combiné au ST_GeomFromText en oracle
        return $query;
    }
    
    public function isEquivalent($geometryType, $geomA, $geomB, $buffer){
        //Version oracle, ici on compare la géométrie 1 pour 1 sans tenir compte du buffer
        if($geometryType == "point"){
            return "SDO_EQUAL({$geomA},{$geomB})";
        }else if($geometryType == "LineString"){
            return "SDO_EQUAL({$geomA},{$geomB})";
        }else if($geometryType == "polygon" || $geometryType == "circle"){
            return "SDO_EQUAL({$geomA},{$geomB})";
        }else{
            throw new Exception("Not implemented isEquivalent() for geometry type : {$geometryType}");
        }
    }
}