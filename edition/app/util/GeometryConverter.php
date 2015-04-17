<?php

class GeometryConverter{
    /**
     * Converts a JSON geometry to WKT.
     *
     * @return A String identifying the primary key field.
     */
    public static function ConvertJsonToWkt( $geometry ){
        $wkt = null;
        if($geometry->type == "Point"){
            $wkt = "POINT ({$geometry->coordinates[0]} {$geometry->coordinates[1]})";		
        }else if($geometry->type == "LineString"){
            $wkt = GeometryConverter::ConvertJsonLineStringToWkt($geometry);
        }else if($geometry->type == "Polygon"){
            $wkt = GeometryConverter::ConvertJsonPolygonToWkt($geometry);
        }else if($geometry->type == "Circle"){
            $wkt = GeometryConverter::ConvertJsonPolygonToWkt($geometry);
        }else{
            die("Convert Json to WKT not implemented for {$geometry->type}");
        }

        return $wkt;
    }

    private static function ConvertJsonLineStringToWkt($lineString){
        $wkt = "LINESTRING (";
        foreach($lineString->coordinates as $coordinate){
                $wkt .= "{$coordinate[0]} {$coordinate[1]},";
        }
        $wkt = substr($wkt, 0, -1); // Remove last ,
        $wkt .= ")";
        return $wkt;
    }
    
    private static function ConvertJsonPolygonToWkt($polygon){
        $wkt = "POLYGON ((";
        foreach($polygon->coordinates[0] as $coordinate){
            $wkt .= "{$coordinate[0]} {$coordinate[1]},";
        }
        $wkt = substr($wkt, 0, -1); // Remove last ,
        $wkt .= "))";
        return $wkt;
    }
    
    public static function ConvertWktToJson($geometryType, $wkt){
        if($geometryType == "point"){            
            return GeometryConverter::ConvertWktPointToJson($wkt);                
        }else if($geometryType == "LineString"){
            return GeometryConverter::ConvertWktPolylineToJson($wkt);
        }else if($geometryType == "polygon"){               
            return GeometryConverter::ConvertWktPolygonToJson($wkt);
        }else if($geometryType == "circle"){
            return GeometryConverter::ConvertWktPolygonToJson($wkt);
        }else{				
            throw new Exception("ERREUR, non implémenté: {$geometryType}");
        }

    }
    
    public static function ConvertWktPointToJson($wkt){ 

        $pos = strpos($wkt,'(') + 1;
        $point = substr($wkt, $pos, (strlen($wkt) - $pos - 1));
        $coords = explode(' ', $point);
        $geom_p = new stdClass();
        $geom_p->type  = "Point";
        $geom_p->coordinates  = array(floatval($coords[0]), floatval($coords[1]));
        return $geom_p;
    }
    

    public static function ConvertWktPolylineToJson($wkt){
        
        $pos = strpos($wkt,'(') + 1;
        $line = substr($wkt, $pos, (strlen($wkt) - $pos - 1));
        $line = str_replace(", ", ",", $line); //trick for Oracle format
        $points = explode(",",$line);
        $coordinates = array();
        foreach($points as $point){
            $coords = explode(' ', $point);								
            $coordinates[] = array(floatval($coords[0]), floatval($coords[1]));
        }
        $geom_l = new stdClass();
        $geom_l->type  = "LineString";
        $geom_l->coordinates  = $coordinates;
        
        return $geom_l;
    }
    
    public static function ConvertWktPolygonToJson($wkt){
        
        $pos = strrpos($wkt,'(') + 1;
        $polygon = substr($wkt, $pos, (strlen($wkt) - $pos - 1));    
        $polygon = str_replace(", ", ",", $polygon); //trick for Oracle format
        $points = explode(",",$polygon);
        $coordinates = array();
        foreach($points as $point){
            $coords = explode(' ', $point);								
            $coordinates[] = array(floatval($coords[0]), floatval($coords[1]));
        }
        $geom_s = new stdClass();
        $geom_s->type = "Polygon";
        $geom_s->coordinates = array();
        $geom_s->coordinates[] = $coordinates;
        
        return $geom_s;
    }
}

