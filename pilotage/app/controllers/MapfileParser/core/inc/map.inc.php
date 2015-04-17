<?php

class Map{
    var $oMap;

    function __construct($oMap){
        $this->oMap = $oMap;
    }

    function getMeta($meta){
        return utf8_encode($this->oMap->getMetaData($meta));
    }

    function getParam($param){
        if($param == 'projection'){
            $value = $this->getProjection();
        } else{
            $value = utf8_encode($this->oMap->$param);
        }

        return $value;
    }

    function getProjection(){
        $projection = '';
        $mapString = $this->oMap->convertToString();

        $layersPattern = '/LAYER.*END\s#\sLAYER/is';
        //Remove layers
        $mapContent = preg_replace($layersPattern, '', $mapString);

        $projectionPattern = '/(?<=PROJECTION).*(?=END)/Uis';

        if(preg_match($projectionPattern, $mapContent, $matches)){
            $projection = $matches[0];
            $projectionCode = trim(str_replace(array("'", '"', "init=epsg:"), '', strtolower($projection)));
            if(ctype_digit($projectionCode)){
                $projection = $projectionCode;
            }
        }

        return utf8_encode($projection);
    }

    function createLayerFromString($string){
        $layer = new Layer(new LayerObj($this->oMap));
        $layer->oLayer->updateFromString($string);

        return $layer;
    }

    function parseLayers(){
        $layerParameters = array(
            "name",
            "group",
            "type",
            "projection",
            "connection",
            "connectiontype",
            "data",
            "filter",
            "opacity",
            "minscaledenom",
            "maxscaledenom",
            "labelitem",
            "labelminscaledenom",
            "labelmaxscaledenom",
            "vue_defaut"
        );

        $layerMetaData = array(
            "wms_name",
            "wms_title",
            "wms_group_title",
            "wfs_maxfeatures",
            "gml_include_items",
            "gml_exclude_items",
            "ows_exclude_items",
            "ows_include_items",
            "msp_classe_meta",
            "wms_attribution_title"
        );

        $layerZIndex = array(
            'LINE' => 2001,
            'POINT' => 3001,
            'POLYGON' => 1001,
            'RASTER' => 1,
            'CHART' => 5000,
            'CIRCLE' => 1001,
            'QUERY' => 0,
            'ANNOTATION' => 4001,
            'TILEINDEX' => 1001       
        );

        $baseIndex = -1;
        $index = -1;
        $layers = array();

        //Parse layers
        for($i = 0; $i < $this->oMap->numlayers; $i++){
            //create new layer object
            $layer = new Layer($this->oMap->getLayer($i));

            //Create new empty hash array to store layer data
            $l = array();

            //Get some layer parameters
            foreach ($layerParameters as $parameter) {
                $l[$parameter] = $layer->getParam($parameter);

            }
            //Get some metadata
            foreach ($layerMetaData as $metaData) {
                $l[$metaData] = $layer->getMeta($metaData);
            }
            //Get other parameters as plain text
            $l['layer_def'] = $layer->getLayerDef($layerParameters);
            //Get other metadata as plain text
            $l['meta_def'] = $layer->getMetaDef($layerMetaData);
            //Get attributes
            $l['attributes'] = $layer->getAttributes();

            //Parse layer classes
            $classes = $layer->getClasses();
            $l['classes'] = array();
            foreach ($classes as $class) {
                $l['classes'][] = utf8_encode($class->convertToString());    
            }
            
            if(($layerZIndex[$l['type']] > $baseIndex) && ($layerZIndex[$l['type']] > $index)){
                $index = $layerZIndex[$l['type']];
            } else{
                $index += 1;
            }
            $baseIndex = $layerZIndex[$l['type']];
            $l['zIndex'] = $index;            
            $layers[] = $l;
        }

        return $layers;
    }
}

?>
