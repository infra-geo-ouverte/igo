<?php

interface ISpatialQueryBuilder{	
    
    public function ST_Transform($query, $srid);
    
    public function ST_ASText($query);
    
    public function ST_SetSRID($query, $srid);
    
    public function ST_GeomFromText($wkt);
    
    public function ST_Intersects($geomA, $geomB);
    
    public function isEquivalent($geometryType, $geomA, $geomB, $buffer);
    
    
}
