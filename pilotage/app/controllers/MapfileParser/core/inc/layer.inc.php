<?php

class Layer{
    var $oLayer;

    var $connectionTypes = array(
        MS_POSTGIS => "POSTGIS",
        MS_RASTER => "RASTER",
        MS_OGR => "OGR", 
        MS_SHAPEFILE => "SHAPEFILE",
        MS_WMS => "WMS",
        MS_ORACLESPATIAL => "ORACLESPATIAL",
        MS_WFS => "WFS",
        MS_MYSQL => "MYSQL",
        MS_SDE => "SDE",
        MS_GRATICULE => "GRATICULE",
        MS_TILED_SHAPEFILE => "TILED_SHAPEFILE",
        MS_PLUGIN => "PLUGIN",
        MS_UNION => "UNION",
        MS_UVRASTER => "UVRASTER",
        MS_INLINE => "INLINE"
    );

    var $geometryTypes = array(
        MS_LAYER_POINT => "POINT",
        MS_LAYER_LINE => "LINE",
        MS_LAYER_POLYGON => "POLYGON",
        MS_LAYER_RASTER => "RASTER", 
        MS_LAYER_ANNOTATION => "ANNOTATION", 
        MS_LAYER_QUERY => "QUERY", 
        MS_LAYER_CIRCLE => "CIRCLE", 
        MS_LAYER_TILEINDEX => "TILEINDEX", 
        MS_LAYER_CHART => "CHART"
    );

    var $booleanTypes = array(
        MS_TRUE => "TRUE",
        MS_FALSE => "FALSE"
    );

    var $unitTypes = array(
        MS_INCHES => 'inches',      
        MS_FEET => 'feet',       
        MS_MILES => 'miles',       
        MS_METERS => 'meters',      
        MS_NAUTICALMILES => 'nauticalmiles',
        MS_KILOMETERS => 'kilometers',  
        MS_DD => 'dd',          
        MS_PIXELS => 'pixels',      
    );

    function __construct($oLayer){
        $this->oLayer = $oLayer;
    }

    /**
     * Returns the value of a given paarameter
     *
     *  $param [string] : layer parameter
     */
    function getParam($param){
        if($param == 'projection'){
            $value = $this->getProjection();
        } else if($param == 'type'){
            $value = $this->getGeometryType();
        } else if($param == 'connectiontype'){
            $value = $this->getConnectionType();
        } else if($param == 'filter'){
            $value = $this->getUnsupportedParam($param);
        } else if($param == 'vue_defaut'){
            $value = $this->getVueDefaut();
        } else if($param == 'opacity'){
            $value = $this->oLayer->$param;    
            if(!$value or trim($value) == ''){
                $transparency = $this->oLayer->transparency;
                if($transparency and trim($transparency) != ''){
                    $value = $transparency;
        }
        return utf8_encode($value);
    }
        } else{
            $value = utf8_encode($this->oLayer->$param);
        }
        return $value;
    }

    function getUnsupportedParam($param){
        $value = null;
        $layerDef = $this->getLayerDef(array());
        //echo $layerDef;
        //preg_split string into a line-by-line array
        $lines = preg_split("/\n/", $layerDef);
        
        foreach ($lines as $line) {
            $l = trim(str_replace("\t", " ", $line));
            $components = preg_split("/\s/", str_replace(array("\n", "\r"), "", $l));
            $parameter = trim($components[0]);

            if(strlen($parameter) > 0 && strtolower($parameter) == strtolower($param)){
                $value = '';

                for($i=1; $i<count($components); $i++){
                    $value .= ' ' .$components[$i];
                }
            }
        }

        //Remove " and '
        $value = substr(trim($value), 1);
        $value = substr($value, 0, -1);

        return $value;
    }

    function getMeta($meta){
        return utf8_encode($this->oLayer->getMetaData($meta));
    }

    function getAttributes(){
        $data = $this->getParam('data');
        $uniqueIDPattern = "/(?<=using unique\s).*\s+/Ui";
        $uniqueID = null;
        preg_match($uniqueIDPattern, $data, $match);
        if(count($match) > 0){
            $uniqueID = trim($match[0]);
        }

        $attributes = array();
        $includedAttributes = $this->getMeta('gml_include_items');
        $excludedAttributes = $this->getMeta('gml_exclude_items');

        if(strlen($includedAttributes) > 0){
            foreach(preg_split("/,/", $includedAttributes) as $attribute){
                $name = trim($attribute);
                if($name != 'all' && strlen($name) > 0){
                    $attributes[] = array(
                        "colonne" => $name,
                        "est_inclu" => true,
                        "est_cle" => ($name == $uniqueID ? true : false)
                    );
                }
            }
        }

        if(strlen($excludedAttributes) > 0){
            foreach(preg_split("/,/", $excludedAttributes) as $attribute){
                $name = trim($attribute);
                if($name != 'all' && strlen($name) > 0){
                    $found = false;
                    foreach($attributes as &$att){
                        if($att['colonne'] == $name){
                            $att['est_inclu'] = false;
                            $found = true;
                        }
                    }

                    if($found == false){
                        $attributes[] = array(
                            "colonne" => $name,
                            "est_inclu" => false,
                            "est_cle" => ($name == $uniqueID ? true : false)
                        );
                    }
                } else if($name == 'all'){
                    foreach($attributes as &$att){
                        $att['est_inclu'] = false;
                    }
                }
            }
        }

        if($uniqueID && strlen($uniqueID) > 0){
            $found = false;
            foreach($attributes as $attribute){
                if($attribute['colonne'] == $uniqueID){
                    $found = true;
                    break;
                }
            }

            if($found == false){
                $attributes[] = array(
                    "colonne" => $uniqueID,
                    "est_inclu" => false,
                    "est_cle" => true
                );
            }
        }
        return $attributes;
    }

    function getGeometryType(){
        $intType = $this->oLayer->type;
        return $this->geometryTypes[$intType];
    }

    function getProjection(){
        $projection = '';
        $layerString = $this->oLayer->convertToString();
        $pattern = '/(?<=PROJECTION).*(?=END)/Uis';

        if(preg_match($pattern, $layerString, $matches)){
            $projection = $matches[0];
            $projectionCode = trim(str_replace(array("'", '"', "init=epsg:"), '', strtolower($projection)));
            if(ctype_digit($projectionCode)){
                $projection = $projectionCode;
            }
        }

        return utf8_encode($projection);
    }

    function getConnectionType(){
        $intType = $this->oLayer->connectiontype;
        return $this->connectionTypes[$intType];
    }

    function getVueDefaut(){
        $vueDefaut = null;
        $data = $this->getParam('data');
        $pattern = '/(?<=from\s).*[\s;]+/Uis';

        if(preg_match($pattern, $data, $matches)){
            $vueDefaut = $matches[0];
        }

        return $vueDefaut;
    }

    function getClasses(){
        $classes = array();
        for($i = 0; $i < $this->oLayer->numclasses; $i++){
            $classes[] = $this->oLayer->getClass($i);
        }
        return $classes;
    }

    function getLayerDef($exclusions){
        $layerString = $this->oLayer->convertToString();
        $contentPattern = '/(?<=LAYER).*(?=END)/is';
        $classesPattern = '/CLASS[^(GROUP|ITEM|")].*END\s#\sCLASS/is';
        $metaDataPattern = '/METADATA.*END\s#\sMETADATA/Uis';
        $projectionPattern = '/PROJECTION.*END\s#\sPROJECTION/is';
        $closeDeferPattern = '/PROCESSING\s+(\"|\')CLOSE_CONNECTION=DEFER[(\"|\')$]/Uis';

        if(preg_match($contentPattern, $layerString, $matches)){
            $layerContent = $matches[0];
            //Remove classes
            $layerContent = preg_replace($classesPattern, '', $layerContent);
            //Remove metadata
            $layerContent = preg_replace($metaDataPattern, '', $layerContent);
            //Remove projection
            $layerContent = preg_replace($projectionPattern, '', $layerContent);
            //Remove close connection defer
            $layerContent = preg_replace($closeDeferPattern, '', $layerContent);
        }
        // Pour une raison incompréhensible, les fichiers de mapfile de MCC terrains protégés et MCC terrains non protégés contiennent toujours un tag metadata dans le layer_def...
        
        if (strpos($layerContent, 'METADATA') !== FALSE){
            $pos = strpos($layerContent, 'METADATA');
            $layerContent = substr($layerContent, 0, $pos);         
        }

        //preg_split string into a line-by-line array
        $lines = preg_split("/\n/", $layerContent);

        $layerDef = '';
        foreach ($lines as $line) {
            $l = trim(str_replace("\t", " ", $line));
            $components = preg_split("/\s/", str_replace(array("\n", "\r"), "", $l));
            $parameter = trim($components[0]);

            if(strlen($parameter) > 0 && !in_array(strtolower($parameter), $exclusions)){
                $layerDef = $layerDef . $line . "\n";
            }
        }
        echo $layerDef;
        return utf8_encode($layerDef);
    }

    function getMetaDef($exclusions){
        $metaDef = '';
        $layerString = $this->oLayer->convertToString();
        $metaDataPattern = '/(?<=METADATA).*(?=END\s#\sMETADATA)/Uis';

        if(preg_match($metaDataPattern, $layerString, $matches)){
            $layerContent = $matches[0];
        //preg_split string into a line-by-line array
        $lines = preg_split("/\n/", $layerContent);

        $metaDef = '';
        foreach ($lines as $line) {
            $l = trim(str_replace("\t", " ", $line));
            $components = preg_split("/\s/", str_replace(array("\n", "\r", "'", '"'), "", $l));
            $parameter = trim($components[0]);

            if(strlen($parameter) > 0 && !in_array(strtolower($parameter), $exclusions)){
                $metaDef = $metaDef . $line . "\n";
            }
        }
        }

        return utf8_encode($metaDef);
    }
}

?>
