<?php

header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: ".gmdate("D, d M Y H:i:s")." GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");
//on retourne du JSON mais le MIME doit être text/html pour 
//un résultat en JSON.
header("content-type: text/html; charset=utf-8");

require_once('../config.php');
require_once('../fonctions.php');
//load config IGO
$configIgo = include __DIR__ . "/../../interfaces/navigateur/app/config/config.php";
include __DIR__ . "/../../interfaces/navigateur/app/config/loader.php";
include __DIR__ . "/../../interfaces/navigateur/app/config/services.php";


// La fonction dl a été supprimée avec php 5.3
if (!extension_loaded("MapScript")){
	die("MapScript extension is not loaded!");
}

if(!extension_loaded("PDFLib")){
	die("pdflib extension is not loaded!");
}

set_error_handler("warning_handler", E_ALL);

/******************/
/*     GLOBAL     */
/******************/
/**
 * IMAGEPATH and IMAGE URL must be set manually according to current
 * configuration
 L'alias /ms_tmp a été modifié dans config Apache
 */
$_IMAGEPATH = $GLOBALS['apps_config']['impression']['imagepath'];

$_IMAGEURL = $GLOBALS['apps_config']['impression']['imageurl'];

/**
 * Global property : $_MODE
 * {Array} The map can be printed using a specified extent (mode 'view') or
 *         using a specified scale (mode 'scale')
 */
$_MODE = array('scale','view');

/**
 * Global property : $_OUTPUTFORMAT
 * {Array} The possible types of document outputed by the script, i.e. an image
 *         or a pdf document.
 */
$_OUTPUTFORMAT = array('pdf','img');

/**
 * Global property : $_MAPFORMAT
 * {Array} Regardless of the type of document outputed by the script, mapserver
 *         must draw a map.  Theses are the possibles format the map can be
 *         drawn with
 */
$_MAPFORMAT = array('png', 'jpeg');

/**
 * Global property : $_FORCE
 * {Array} The possible force values.  While in 'force' mode, the map will be
 *         drawn even if an error is detected.  While not in 'force' mode, as
 *         soon as an error is detected, it is reported.
 */
$_FORCE = array('true','false');

/**
 * Global property : $_UNITS
 * {Array} The possible units values for the scale bar.
 */
$_UNITS = array(
    'default' => '',
    'in' => MS_INCHES,
    'ft' => MS_FEET,
    'mi' => MS_MILES,
    'm'  => MS_METERS,
    'km' => MS_KILOMETERS,
    'dd' => MS_DD
);

/**
 * The configuration for maximum size in inches for a print request.
 */
$_MAXIMUM_SIZE_INCHES = 44;

/**
 * Global property : $_SEPARATOR
 * {String} The character used to separate values since sometimes spaces " "
 * and comma "," can be used.
 */
$_SEPARATOR = "#";

/**
 * Global property : $_MSVERSION
 * {Integer} The version of mapserver used.
 */
$_MSVERSION = ms_GetVersionInt();

$dpi = 72;
$heightComments = 35;
$heightMaxLogo = 50;
//array contenant les possibles erreurs des URLs fournient.
//[message=>'', niveau=>]
$erreurs = array();
//array contenant l'url et les messages d'erreurs
//['url'=>'', 'erreurs'=>$erreurs]
$reponse = null;

/*************************/
/* PARAMETERS VALIDATION */
/*************************/
validateParams($erreurs);

/**********************/
/* PARAMETERS PARSING */
/**********************/
/**
 * Each parameter is assigned to a variable, ready to be used.
 */
try {
    
    $aszExtents = explode(",", filter_input(INPUT_GET, 'BBOX',FILTER_SANITIZE_STRING));
    $szComments = utf8_decode(filter_input(INPUT_GET, 'printComments',FILTER_SANITIZE_STRING));// may contain "\n"filter_input(INPUT_GET, 'printUnits',FILTER_SANITIZE_STRING);
    $height = filter_input(INPUT_GET, 'height',FILTER_SANITIZE_NUMBER_FLOAT,FILTER_FLAG_ALLOW_FRACTION) * $dpi;
    $width = filter_input(INPUT_GET, 'width',FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION)* $dpi;
    $szSRS = filter_input(INPUT_GET, 'SRS',FILTER_SANITIZE_STRING);
    $szScale = filter_input(INPUT_GET, 'SCALE',FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $szTitle = utf8_decode(filter_input(INPUT_GET, 'printTitle',FILTER_SANITIZE_STRING));
    $szUnits = filter_input(INPUT_GET, 'printUnits',FILTER_SANITIZE_STRING);
    $szOutputFormat = filter_input(INPUT_GET, 'printOutputFormat',FILTER_SANITIZE_STRING);
    $szForce = filter_input(INPUT_GET, 'force',FILTER_VALIDATE_BOOLEAN);
    $aszOpacity = explode($_SEPARATOR, filter_input(INPUT_GET, 'OPACITY',FILTER_SANITIZE_STRING));
    $aszLayers = explode($_SEPARATOR, filter_input(INPUT_GET, 'LAYERS',FILTER_SANITIZE_STRING));
    $aszURLs = explode($_SEPARATOR, filter_input(INPUT_GET, 'URLS',FILTER_SANITIZE_URL));
    $aszFormats = explode($_SEPARATOR, filter_input(INPUT_GET, 'FORMAT',FILTER_SANITIZE_STRING));
    $aszTimes = explode($_SEPARATOR, filter_input(INPUT_GET, 'TIME',FILTER_SANITIZE_STRING));
    $kml = filter_input(INPUT_POST, 'vecteurs');
    $auteurNom = filter_input(INPUT_GET,'printNomAuteur', FILTER_SANITIZE_STRING);
    $aszTitles = explode($_SEPARATOR, filter_input(INPUT_GET, 'TITLE',FILTER_SANITIZE_STRING));
     
    $hasbaselayer = filter_input(INPUT_GET, 'HASBASELAYER',FILTER_VALIDATE_BOOLEAN);
    if($hasbaselayer === null){
        $hasbaselayer = false;
    }

    $printDescription = filter_input(INPUT_GET, 'printDescription',FILTER_VALIDATE_BOOLEAN);
    if($printDescription === null){
        $printDescription = false;
    }

    $printLogo = filter_input(INPUT_GET, 'printLogo',FILTER_VALIDATE_BOOLEAN);
    if($printLogo === null){
        $printLogo = false;
    }

    $showLegend = filter_input(INPUT_GET, 'showLegendGraphics',FILTER_VALIDATE_BOOLEAN);
    if($showLegend === null){
        $showLegend = false;
    }

    $aszPositionLegende = explode($_SEPARATOR, filter_input(INPUT_GET, 'printLegendeLocation',FILTER_SANITIZE_STRING));
    if($aszPositionLegende === null){
        $aszPositionLegende = 'UR';
    }

    if ($aszExtents && count($aszExtents) == 4){
        $minx = min($aszExtents[0], $aszExtents[2]);
        $miny = min($aszExtents[1], $aszExtents[3]);
        $maxx = max($aszExtents[0], $aszExtents[2]);
        $maxy = max($aszExtents[1], $aszExtents[3]);
    }

    // text decoding in case of special characters
    $numberLineComments = count(explode("\n", $szComments));
    if($numberLineComments <= 0){
        $numberLineComments=1;
    }

    $heightMaxComments = $numberLineComments*7.5;

    //Calcul de correction de la légende pour ne pas avoir de conflit entre la légende
    //, le logo, auteur, commentaire et échelle
    $correctionLegende = 0;

    switch ($aszPositionLegende){
        CASE 'UL':
        case 'LL':
            $correctionLegende = $printDescription?$heightComments+$heightMaxComments+10:25;
            break;
        case 'UR':
        case 'LR':
        default:
            $correctionLegende = $printLogo?$heightMaxLogo:0;
            break;
    }


    $page_width = $width;
    $page_height = $height;
    $nMapWidth = $width - 60;
    $nMapHeight = $height - 130;

    /**************************/
    /*   MAP OBJECT CREATION   */
    /***************************/

    /**
     * A temporary map object is created.  Its width and height is ajusted depending
     * on the paper size choosed and its orientation.
     */
    $oMap = ms_newMapObj('') or die("Unable to open mapfile\n");
    $oMap->setconfigoption("PROJ_LIB", $GLOBALS['apps_config']['impression']['proj_lib']);
    $oMap->applyconfigoptions();

    $baseResolution = 72;
    $oMap->set('defresolution', $baseResolution);
    $oMap->set('resolution', $dpi);
    $oMap->set('width', $nMapWidth);
    $oMap->set('height', $nMapHeight);
    $test = $oMap->setProjection("init=".strtolower($szSRS));
    
    $oMap->setExtent($minx, $miny, $maxx, $maxy);
    $oMap->set("units", MS_METERS);

    $oMap->setFontSet(dirname(__FILE__) . "/../font/fonts.txt");

    /**
     * Scalebar
     */
    if($szUnits == "default"){
        $oMap->scalebar->set("units", $oMap->units);
    } else {
        $oMap->scalebar->set("units", $_UNITS[$szUnits]);
    }

    $oMap->scalebar->outlinecolor->setRGB(0,0,0);
    $oMap->scalebar->set("status", MS_EMBED);

    /*
     * Projection
     */

    $oLayerPoints = ms_newLayerObj($oMap);
    $oLayerPoints->set( "name", "Projection");
    $oLayerPoints->set( "type", MS_LAYER_ANNOTATION);
    $oLayerPoints->set( "status", MS_DEFAULT);
    $oLayerPoints->set( "transform", MS_FALSE); 

    $oCoordList = ms_newLineObj();
    $oPointShape = ms_newShapeObj(MS_SHAPE_POINT);
    $oCoordList->addXY(265,$nMapHeight-4);
    $oPointShape->add($oCoordList);
    $oPointShape->set("text", "Projection : " . $szSRS);
    $oLayerPoints->addFeature($oPointShape);

    $oLabelObj  = new labelObj();
    $oLabelObj->set( "position", MS_UC);
    $oLabelObj->set( "size", 8);
    $oLabelObj->set( "type", MS_TRUETYPE);
    $oLabelObj->set( "font", "arial");
    $oLabelObj->color->setRGB(0,0,0);

    $oMapClass = ms_newClassObj($oLayerPoints);
    $oMapClass->addLabel($oLabelObj);

    /**
     * Uncomment this to enable debug
     */
    //$oMap->setconfigoption('MS_ERRORFILE','/srv/www/geomatique/partage/log/wms2pdf.log');

    $oCenter = ms_newPointObj();
    $oCenter->setXY($nMapWidth/2,$nMapHeight/2);
    $oMap->zoomscale($szScale, $oCenter, $nMapWidth, $nMapHeight, $oMap->extent);

    /**
     * If document produced is not a pdf, we need to set the imageurl path.
     */
    $oMap->web->set('imagepath', $_IMAGEPATH);
    $oMap->web->set('imageurl', $_IMAGEURL);

    /**
     * Map outputformat
     */
    $oMap->outputformat->setOption("QUALITY", "100");
    $oMap->outputformat->set("transparent","1");
    $oMap->selectOutputFormat("png");
    $oMap->outputformat->set('name','png');
    $oMap->outputformat->set('driver','GD/PNG');
    $oMap->outputformat->set('mimetype','image/png');
    $oMap->outputformat->set('imagemode',MS_IMAGEMODE_RGBA);
    $oMap->outputformat->setOption("INTERLACE", "OFF");

    /******************************/
    /*   LAYER OBJECTS CREATION   */
    /******************************/

    /**
     * For each layer parsed in parameters, create a layer object of WMS type and
     * add it to the map.
     */

    $legendsUrls = array();
    $legendsPaths = array();
    $legendIndex = 0;

    for($i=0, $len=count($aszLayers); $i<$len; $i++){
        $szLayer = $aszLayers[$i];

        if($szLayer=='')continue;
        // Nom du layer pour le GetLegendGraphic de la legende
        $szLayer_legend = $szLayer;

        // si plus d'une couche dans un ajout service web : on prend le premier nom du layer 
        // pour le GetLegendGraphic de la legende
        if(strstr($szLayer_legend, ',')){
            list($szLayer_legend) = explode(",", $szLayer_legend);
        }

        $szLayer_legend = str_replace(" ", ",", $szLayer_legend);
        $szURL = strrpos($aszURLs[$i],'?')===false?$aszURLs[$i].'?':$aszURLs[$i];    
        $szFormat = $aszFormats[$i];
        $szOpacity = $aszOpacity[$i];
        $szTime = $aszTimes[$i];
        $szLegendTitle = $aszTitles[$i];

        $igoController = new IgoController();
             
        $szUrl = $igoController->verifierPermis($szURL);  
        if($szUrl===false){   
            $erreurs[] = array('message'=>"L'Url $szURL n'est pas permis.", 'niveau'=>'eleve');
            continue;
        }
        
        if($showLegend){

            if($hasbaselayer === false || $i != 0){
                // Construit requete GetLegendGraphic
                $getLegendGraphic = $szURL . "&TRANSPARENT=TRUE&NOCACHE=0.39793555804004654&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=" . $szLayer_legend . "&FORMAT=image%2Fpng";

                // Requete a GetLegendGraphic
                $resource = curl_file_get_contents($getLegendGraphic);
                 
                if((strpos($resource, '<?xml')!==false)||($resource === 'Forbidden')||(strpos($resource, 'Erreur') !== false)){
                    $erreurs[] = array('message'=>"$getLegendGraphic a échoué.<br> Message d'erreur:<br>" . $resource, 'niveau'=>'eleve');
                    continue; 
                } 

                $imgRes = imagecreatefromstring($resource);

                //  Sauve l'image retournee par GetLegendGraphic dans le repertoire de partage temporaire.
                if($imgRes === false){ // Le service n'a pas retourné une image valide.
                    $erreurs[] = array('message'=>"L'image retournée par $getLegendGraphic n'est pas valide.", 'niveau'=>'faible');
                    continue;
                }

                $imagePath = $_IMAGEPATH . $szLayer_legend . ".png";
                $imageUrl = $_IMAGEURL . "/" . $szLayer_legend . ".png";
                imagealphablending($imgRes, false);
                imagesavealpha($imgRes, true);         
                imagepng($imgRes, $imagePath);
                // Ajoute le path de l'image dans le tableau de legendes.
                $legendsUrls[$legendIndex] = $imageUrl;
                $legendsPaths[$legendIndex] = $imagePath;
                $legendsTitle[$legendIndex] = $szLegendTitle;
                $legendIndex++;
                imagedestroy($imgRes);
            }
        }

        if($i!=0){
            $szURL .= '&randomnumber='. mt_rand() . '&';

            if($szTime != "null"){
                $szURL .= '&TIME=' . $szTime . '&' ;
            }     
            // Patch pour l'impression de la session ID de GO-Collaboration.
            if (isset($_SERVER["HTTP_REFERER"])){
                $referer = $_SERVER["HTTP_REFERER"];
                $explodedReferer = explode("&", $referer);
            }

            if (isset($explodedReferer[1])){
                $sessionId = explode("=", $explodedReferer[1]);

                if (isset($sessionId[1])){
                    $szSessionIDs = $sessionId[1];
                }

                if($szSessionIDs != "null"){
                    $szURL .= '&SESSION_ID=' . $szSessionIDs . '&' ;
                }
            }
        }
        
        $oLayer = ms_newLayerObj($oMap);
        $oLayer->set("name", $szLayer);
        $oLayer->set("type", MS_LAYER_RASTER);
        $oLayer->set("status", MS_ON);
        $oLayer->set("connection", $szURL);

        if($_MSVERSION < 50400){
            $oLayer->set("connectiontype", MS_WMS);
        } else {
            $oLayer->setConnectionType(MS_WMS);
        }
        /**
         * Uncomment this to enable debug
         */
        //$oLayer->set("debug", 5);

        $oLayer->setMetaData("wms_name", $szLayer);
        $oLayer->setMetaData("wms_server_version", "1.1.1");
        $oLayer->setMetaData("wms_srs", $szSRS);
        $oLayer->setMetaData("wms_format", $szFormat);
        if($szOpacity != 'null'){
            if($szOpacity=='1'){
                $oLayer->set("opacity", 99);
            }else{
                $oLayer->set("opacity", floor(((double)$szOpacity)*100));
            }
        }
    }

    /**********************/
    /* MORE LAYER OBJECTS */
    /**********************/
    /**
     * If the document produced is not a pdf, the title needs to be added as a layer
     * to the map, positioned on upper-center.  The comments are not added
     */
    if($szOutputFormat != 'pdf'){

        //TITRE
        $oLayerPoints = ms_newLayerObj($oMap);
        $oLayerPoints->set( "name", "Title");
        $oLayerPoints->set( "type", MS_LAYER_ANNOTATION);
        $oLayerPoints->set( "status", MS_DEFAULT);
        $oLayerPoints->set( "transform", MS_FALSE); 

        $oCoordList = ms_newLineObj();
        $oPointShape = ms_newShapeObj(MS_SHAPE_POINT);
        $oCoordList->addXY($nMapWidth/2,30);
        $oPointShape->add($oCoordList);
        $oPointShape->set("text", $szTitle);
        $oLayerPoints->addFeature($oPointShape);

        $oLabelObj  = new labelObj();
        $oLabelObj->set( "position", MS_UC);
        $oLabelObj->set( "size", 14);
        $oLabelObj->set( "type", MS_TRUETYPE);
        $oLabelObj->set( "font", "arial");
        $oLabelObj->color->setRGB(0,0,0);
        $oLabelObj->outlinecolor->setRGB(255,255,255);

        $oMapClass = ms_newClassObj($oLayerPoints);
        $oMapClass->addLabel($oLabelObj);

        //COMMENTAIRE
        $oLayerPoints2 = ms_newLayerObj($oMap);
        $oLayerPoints2->set( "name", "Title");
        $oLayerPoints2->set("type", MS_LAYER_ANNOTATION);
        $oLayerPoints2->set( "status", MS_DEFAULT);
        $oLayerPoints2->set( "transform", MS_FALSE);

        $oCoordList2 = ms_newLineObj();
        $oPointShape2 = ms_newShapeObj(MS_SHAPE_POINT);
        $oCoordList2->addXY(0,$nMapHeight-$heightComments);
        $oPointShape2->add($oCoordList2);
        $oPointShape2->set("text", $szComments);
        $oLayerPoints2->addFeature($oPointShape2);

        $oLabelObj2 = new labelObj();
        $oLabelObj2->set("position", MS_UR);
        $oLabelObj2->set("size", 7);
        $oLabelObj2->set("type", MS_TRUETYPE);
        $oLabelObj2->set("font", "arial");
        $oLabelObj2->color->setRGB(0,0,0);
        $oLabelObj2->outlinecolor->setRGB(255,255,255);

        $oMapClass2 = ms_newClassObj($oLayerPoints2);
        $oMapClass2->addLabel($oLabelObj2);

        //auteur et logo
        if($printLogo && $auteurNom != null){

            $oLayerPoints3 = ms_newLayerObj($oMap);
            $oLayerPoints3->set( "name", "Title");
            $oLayerPoints3->set("type", MS_LAYER_ANNOTATION);
            $oLayerPoints3->set( "status", MS_DEFAULT);
            $oLayerPoints3->set( "transform", MS_FALSE);

            $oCoordList3 = ms_newLineObj();
            $oPointShape3 = ms_newShapeObj(MS_SHAPE_POINT);
            $oCoordList3->addXY($nMapWidth-$heightMaxLogo-5,$nMapHeight-5);
            $oPointShape3->add($oCoordList3);
            $oPointShape3->set("text", $auteurNom);
            $oLayerPoints3->addFeature($oPointShape3);

            $oLabelObj3 = new labelObj();
            $oLabelObj3->set("position", MS_CL);
            $oLabelObj3->set("size", 7);
            $oLabelObj3->set("type", MS_TRUETYPE);
            $oLabelObj3->set("font", "arial");
            $oLabelObj3->set("align", MS_ALIGN_LEFT);

            $oLabelObj3->color->setRGB(0,0,0);
            $oLabelObj3->outlinecolor->setRGB(255,255,255);

            $oMapClass3 = ms_newClassObj($oLayerPoints3);
            $oMapClass3->addLabel($oLabelObj3);

        }
    }

    // If the vecteurs parameter is present, print the vecteurs!
    if($kml != null){

            // Create a random file name for temporary kml and map file.
            $randomFileName = uniqid();
            $vecteurFilePath = $GLOBALS['apps_config']['impression']['imagepath'] . $randomFileName. ".kml";
            $vecteurMapFilePath = $GLOBALS['apps_config']['impression']['imagepath'] . $randomFileName. ".map";

            $vecteurTemplateMapFilePath = $GLOBALS['apps_config']['impression']['map_template'];
            $mapTemplateFileHandler = fopen($vecteurTemplateMapFilePath, 'r') or die("can't open file");
            $mapTemplateFileContent = fread($mapTemplateFileHandler, filesize($vecteurTemplateMapFilePath));

            //Check SVG
            if(preg_match_all('/<Icon><href>([^<]+\.svg)<\/href><\/Icon>/', $kml, $matches)){              
                foreach($matches[1] as $key => $value){                

                    $dir = $GLOBALS['apps_config']['impression']['imagepath'];

                    //Trouver le nom et l'extension
                    $name = substr($value, strrpos($value, '/')+1);

                    //aller chercher le symbol
                    $svg = curl_file_get_contents($value);
                    $handle = fopen($dir.$randomFileName.$name, "w");
                    fwrite($handle, $svg);
                    fclose($handle);

                    //Ajout du symbol dans le Mapfile
                    $symbolTemplate = "#SYMBOL_TAG \n"
                            . "SYMBOL \n"
                            . " NAME \"" . $randomFileName.$name . "\" \n"
                            . " TYPE svg \n"
                            . " IMAGE \"" . $randomFileName.$name . "\" \n"
                            . " END \n";

                    $mapTemplateFileContent = str_ireplace('#SYMBOL_TAG', $symbolTemplate, $mapTemplateFileContent);

                    //modification du kml pour faire référence au nom du symbol
                    $kml = str_ireplace($value,$randomFileName.$name,$kml);
                }
            }        

            // Read the template map file and replace the filename tag with the path of the kml file
            $vecteurMapFileContent = str_replace ( "mapfilename" , $vecteurMapFilePath , $mapTemplateFileContent);
            $vecteurMapFileContent = str_replace ( "kmlfilename" , $vecteurFilePath , $vecteurMapFileContent);
            fclose($mapTemplateFileHandler);


            // Write the KML File to disk.
            $vecteurFileHandler = fopen($vecteurFilePath, 'w') or die("can't open file");
            fwrite($vecteurFileHandler, $kml);
            fclose($vecteurFileHandler);

            // Create the mapfile.
            $mapFileHandler = fopen($vecteurMapFilePath, 'w') or die("can't open file");
            fwrite($mapFileHandler, $vecteurMapFileContent);
            fclose($mapFileHandler);

            // Print.
            $oLayer = ms_newLayerObj($oMap);
            $oLayer->set("name", 'Vecteur');
            $oLayer->set("type", MS_LAYER_RASTER);
            $oLayer->set("status", MS_ON);

            $host = filter_input(INPUT_SERVER, 'HTTP_HOST', FILTER_SANITIZE_STRING);
            $oLayer->set("connection", 'http://'. $host .'/cgi-wms/mapserv.fcgi?map=' . $vecteurMapFilePath);

            if($_MSVERSION < 50400){
                    $oLayer->set("connectiontype", MS_WMS);
            } else {
                    $oLayer->setConnectionType(MS_WMS);
            }

            //$oLayer->set("debug", 5);
            if($printDescription === true){
                $oLayer->setMetaData("wms_name", 'polygon,lignekml,point,annotation');
            }
            else{
                $oLayer->setMetaData("wms_name", 'polygon,lignekml,point');
            }

            $oLayer->setMetaData("wms_server_version", "1.1.1");
            $oLayer->setMetaData("wms_srs", 'EPSG:4326');
            $oLayer->setMetaData("wms_format", 'image/png');
    }

    /***********************/
    /* MAP DRAWING & DEBUG */
    /***********************/

    /**
     * Draw the map.  If an error occurs and 'force' == false, the script ends and
     * outputs the error that occured.  It also outputs the url with 'force' == true
     * if the user still wants to see the result.
     */
    ms_ResetErrorList();

    $oMapImage = $oMap->draw();

    $oError = ms_GetErrorObj();
    $bError = ($oError->code != MS_NOERR);

    if($bError && $szForce != "true"){
        while($oError && $oError->code != MS_NOERR) {
            $erreurs[] = array('message'=>$oError->routine . " : " .$oError->message, 'niveau'=>'eleve');
            $oError = $oError->next();
        }
    }


    /**
     * Get the image URL of the returned image
     */
    $szMapImageURL = $oMapImage->saveWebImage();

    if($showLegend === true && count($legendsPaths) > 0 ){
        /* 
         * Merge les legendes avec la map
        */
        $largestLegend = 140; //Largeur minimale pour les légendes.
        $totalHeight = 0;
        $fontSizeTitle = 10;
        $fontSizeLegendeTitle = 15;
        $texteLegende = 'Légende';
        $ecartEntreCouce = 5;
        $font = '../font/Ubuntu-R.ttf';

        // Find the largest legend and the total height.
        for($i=0;$i<count($legendsPaths);$i++){

            //calcul de l'espace du titre de la couche
            $bbox = imagettfbbox($fontSizeTitle, 0,$font, $legendsTitle[$i]);

            $imgSrc = imagecreatefrompng($legendsPaths[$i]);
            $legendWidth = imagesx($imgSrc);
            $titleWidth = $bbox[2] - $bbox[0];

            $imageWidth =  $legendWidth>=$titleWidth?$legendWidth:$titleWidth;
            $imageHeight =  imagesy($imgSrc) + ($bbox[1] - $bbox[7]) ;
            if($imageWidth > $largestLegend){
                    $largestLegend = $imageWidth;
            }
            $totalHeight += $imageHeight + $ecartEntreCouce;
            imagedestroy($imgSrc);

        }

        //ajout du titre de la légende
        $totalHeight +=  ($fontSizeLegendeTitle*2);

        // Create one image to contain all the legends.
        $newLegendImage = imagecreatetruecolor($largestLegend, $totalHeight);
        $white = imagecolorallocate($newLegendImage, 255, 255, 255);
        imagefilledrectangle($newLegendImage, 0, 0, $largestLegend, $totalHeight, $white);

        // Ecrire Légende (souligné) en haut de la légende.
        $black = imagecolorallocate($newLegendImage, 0, 0, 0);   
        $bbox = imagettfbbox($fontSizeLegendeTitle, 0,$font, $texteLegende);
        $x = $bbox[0] + (imagesx($newLegendImage) / 2) - ($bbox[4] / 2);
        $y = $bbox[1] - $bbox[5] ;
        imagettftext($newLegendImage, $fontSizeLegendeTitle, 0, $x,$y, $black, $font, $texteLegende);
        imageline($newLegendImage, $largestLegend/2-40, 25, $largestLegend/2+38, 25, $black);

        //Définir le début de l'insertion des légendes.
        $legendHeight = $fontSizeLegendeTitle*2;

        // Enlarge legend images to fit the largest size.
        for($i=0;$i<count($legendsPaths);$i++){

            $imgSrc = imagecreatefrompng($legendsPaths[$i]);

            $bbox = imagettfbbox($fontSizeTitle, 0,$font, $legendsTitle[$i]);
            $titleWidth = $bbox[2] - $bbox[0];
            $titleHeight = $bbox[1] - $bbox[7];

            $imageWidth =  imagesx($imgSrc);
            $imageHeight =  imagesy($imgSrc);

            $maxWidth = $titleWidth>=$imageWidth?$titleWidth:$imageWidth;
            $maxHeight = ($imageHeight+$titleHeight+$ecartEntreCouce);

            //définir une image contenant titre et légende de la couche
            $imageLegende = imagecreatetruecolor($maxWidth, $maxHeight);
            $white = imagecolorallocate($imageLegende, 255, 255, 255);
            $black = imagecolorallocate($imageLegende, 0, 0, 0);        
            imagefilledrectangle($imageLegende, 0, 0, $maxWidth, $maxHeight, $white);

            $x = $bbox[0] + (imagesx($imageLegende) / 2) - ($bbox[4] / 2);
            $y = $bbox[1] - $bbox[5] ;

            //Insertion du titre de la couche
            imagettftext($imageLegende, $fontSizeTitle, 0, $x,$y, $black, $font,$legendsTitle[$i] );
            imagecopy($imageLegende, $imgSrc, 0, $titleHeight, 0, 0, $imageWidth, $imageHeight);

            //insertion de la légende
            imagecopy($newLegendImage, $imageLegende, 
                                0, $legendHeight, 
                                0, 0, 
                                $maxWidth, $maxHeight
                                );

            $legendHeight = $legendHeight + $maxHeight;
            imagedestroy($imgSrc);
            imagedestroy($imageLegende);
            unlink($legendsPaths[$i]);
        }

        // Trouver le scale ratio pour redimensionner l'image.
        $scaleRatio = 1;
        $legendWidthRatio = $largestLegend / $nMapWidth;
        if($legendWidthRatio > .40){ // The legend witdh should not be larger than 20% of the map image width.
                $scaleRatio = $legendWidthRatio / .40;
        }

        $legendHeightRatio = $legendHeight / ($nMapHeight-($correctionLegende)) / $scaleRatio;

        if($legendHeightRatio > 1 ){ // The legend height should not be longer than 100% of the map image height.
                $scaleRatio = $scaleRatio * $legendHeightRatio;
        }

        $new_image = imagecreatetruecolor($largestLegend/$scaleRatio, $totalHeight/$scaleRatio);
        imagealphablending($new_image, false);
        imagesavealpha($new_image, true);

        imagecopyresampled($new_image, $newLegendImage, 0, 0, 0, 0, $largestLegend/$scaleRatio, 
                            $totalHeight/$scaleRatio, $largestLegend, $totalHeight);

        $newLegendImage = $new_image;

        $basename = basename($szMapImageURL); // Construct the map image path
        $mapImagePath = $_IMAGEPATH . $basename;

        $imgDest = imagecreatefrompng($mapImagePath); // Loads the map image.
        imagealphablending($imgDest, false);
        imagesavealpha($imgDest, true);


        switch($aszPositionLegende){
            case 'UL':
                $positionLegendeX = 0;
                $positionLegendeY = 0;
                break;
            case 'LL':
                $positionLegendeX = 0;
                $positionLegendeY = ($nMapHeight - $totalHeight/$scaleRatio) - ($correctionLegende+10);
                break;
            case 'LR':
                $positionLegendeX = ($nMapWidth - $largestLegend/$scaleRatio) ;
                $positionLegendeY = ($nMapHeight - $totalHeight/$scaleRatio) - ($correctionLegende+5);
                break;
            case 'UR':
            default:
                $positionLegendeX = ($nMapWidth - $largestLegend/$scaleRatio);
                $positionLegendeY = 0;
                break;
        }
        // Merge the legends with the map image.
        imagecopymerge($imgDest, $newLegendImage, $positionLegendeX, $positionLegendeY, 0, 0, $largestLegend/$scaleRatio, $totalHeight/$scaleRatio, 100);

        // Saves the merged images.
        imagepng($imgDest, $mapImagePath);
        imagedestroy($imgDest);
        imagedestroy($new_image);
    }

    if($printLogo && isset($_FILES['printLogoPath'])){

        $printLogoPath = explode('/', $_FILES['printLogoPath']['tmp_name']);
        $printLogoExtension = explode('.',$_FILES['printLogoPath']['name']);
        $printLogoPath = $printLogoPath[2].'.'.$printLogoExtension[1];

        if(move_uploaded_file($_FILES['printLogoPath']['tmp_name'], 
            $_IMAGEPATH.$printLogoPath)){
        }else{
             $erreurs[] = array('message'=>"Error : Image :'".$_FILES['printLogoPath']['name']."' n'a pas été téléversé correctement sur le serveur.",
                                'niveau'=> 'eleve');
             echo json_encode(array('url'=>'','erreurs'=>$erreurs));
        }

        $imagePath = $_IMAGEPATH . $printLogoPath;
        $imageUrl = $_IMAGEURL . "/" . $printLogoPath;
        list($width, $height, $type, $attr) = getimagesize($imagePath);

        $basename = basename($szMapImageURL); // Construct the map image path
        $mapImagePath = $_IMAGEPATH . $basename;

        switch($_FILES['printLogoPath']['type']){
            case 'image/png':
                $imgLogo = imagecreatefrompng($imagePath); 
                break;
            case 'image/gif':
                $imgLogo = imagecreatefromgif($imagePath); 
                break;
            case 'image/jpg':
            case 'image/jpeg':
                $imgLogo = imagecreatefromjpeg($imagePath); 
                break;
            default:
                $imgLogo = imagecreatefrompng($imagePath); 
                break;
        }

        if(!$imgLogo){
            exit ("Error : Image :'".$_FILES['printLogoPath']['name']."' n'a pu être correctement traité. Format supporté jpg, gif et png");
        }

        //redimensionne l'image au besoin si plus grand que 50/50pixel
        if(($width>$heightMaxLogo)||($height>$heightMaxLogo)){
            //redimensionne l'image
            $imgLogoRedimensionner = imagecreatetruecolor($heightMaxLogo, $heightMaxLogo);
            $white = imagecolorallocate($imgLogoRedimensionner, 255, 255, 255);
            imagefill($imgLogoRedimensionner, 0, 0, $white);
            imagecopyresampled($imgLogoRedimensionner, $imgLogo, 0, 0, 0, 0, 50, 50, $width, $height);
            $imgLogo = $imgLogoRedimensionner;
            $width = $heightMaxLogo;
            $height = $heightMaxLogo;
        }

        $imgDest = imagecreatefrompng($mapImagePath); 
        imagealphablending($imgDest, false);
        imagesavealpha($imgDest, true);
        // Merge le logo avec l'image
        imagecopymerge($imgDest, $imgLogo, $nMapWidth - $width, $nMapHeight-$height, 0, 0, $width, $height, 100);

        imagepng($imgDest, $mapImagePath);
        imagedestroy($imgDest);
        unlink($imagePath);

    }

    /**
     * If outputed document is pdf, create it.  Add the title, map and comments to
     * the document.
     */
    if($szOutputFormat == 'pdf'){
        $basename = basename($szMapImageURL); // Construct the map image path
        $pdfPath = $_IMAGEPATH . $basename;
        $pdfUrl = $szMapImageURL . ".pdf";
        createPDF($page_width, $page_height, $szTitle, $szComments, $pdfPath);
        $reponse = json_encode(['url'=>$pdfUrl, 'erreurs'=>$erreurs]);
    }
    else{
        $reponse = json_encode(['url'=>$szMapImageURL, 'erreurs'=>$erreurs]);
    }

    if(isset($vecteurFilePath)){
        unlink($vecteurFilePath);
        unlink($vecteurMapFilePath);
    }

    //Pour sauvegarder le mapfile.
    //$oMap->save('/srv/www/geomatique/dev/geodev1/partage/services/tmp/wms2pdf.map');

} catch (Exception $exc) {
    global $erreurs;
    $erreurs[] = array('message'=>$exc->getTraceAsString(), 'niveau'=>'eleve'); 
}
finally {
    global $erreurs;
    global $reponse;
      
    if($reponse != null){
        echo $reponse;
    }else{
        echo json_encode(['url'=>'', 'erreurs'=>$erreurs]);
    }
}

/**
 * This function creates a PDF with a title, an image and a comment.
 *
 * @param $page_width  	(The page width in dpi. (inches x 72) )
 * @param $page_height  (The page height in dpi. (inches x 72) )
 * @param $title		(The title to insert in the pdf)
 * @param $comments		(The comments to insert in the pdf)
 * @param $mapImageUrl 	(The url to the image to insert in the pdf)
 */
function createPDF($page_width, $page_height, $title, $comments, $mapImageUrl){
	$p = new PDFlib();
    /*  open new PDF file; insert a file name to create the PDF on disk */
    if ($p->begin_document($mapImageUrl . ".pdf", "") == 0) {
        die("Error: " . $p->get_errmsg());
    }
    // These lines should set the PDF properties, but it does not seem to work.
    $p->set_info("Creator", "Vigilance");
    $p->set_info("Author", "Vigilance");
    $p->set_info("Title", $title);

    // Create a new PDF page.
    $p->begin_page_ext($page_width, $page_height, "");

    // Loads the Helvetica font.
    $font = $p->load_font("Helvetica", "winansi", "");
    $p->setfont($font, 20.0);
    // Displays the title as set by the user
    // On ne peut pas dire a pdflib de centrer le texte sur la ligne... donc $page_width / 2 - 20;
    $p->set_text_pos($page_width / 2 - 20 , $page_height - 30 );
    $p->show($title);
	// Adds the image to the PDF.
    $image = $p->load_image("auto", $mapImageUrl, "");
    $p->fit_image($image, 30, 80, "");

    $p->close_image($image);
    // Adds the comments to the PDF.
    $p->set_text_pos(10, 60 );
    $p->setfont($font, 12.0);
    $p->continue_text($comments);
    // Ends the page and the document.
    $p->end_page_ext("");
    $p->end_document("");
}

/**
 * Function: validateParams
 *
 * Check each param property and value.  If one is invalid, the script stops and
 * output what's wrong
 */
function validateParams(&$erreurs){
 
    if(isset($argv)) {
        exit("Error : this is a cgi utility only\n");
    }

    if (!isset($_GET) || count($_GET) == 0){
        $erreurs[] = array('message'=>"Aucune paramètre n'a été trouvé.", 'niveau'=>'eleve');  
    }

    $aszParams = array('BBOX','SRS','SCALE','URLS','LAYERS', 'TIME','FORMAT',
                       'printTitle','printComments'/*,'printPaper'*/,
                       /*'printOrientation',*/'printUnits',
                       'printOutputFormat', 'force', 'height', 'width', 'showLegendGraphics');
                  
    foreach($aszParams as $szParam){
        if($szParam != 'force'){
            if (!isset($_GET[$szParam])){
                $erreurs[] = array('message'=>"Le paramètre '$szParam' est manquant.", 'niveau'=>'eleve');  
            } else {
                $szParamValue = urldecode($_GET[$szParam]);
            }
        }

        switch ($szParam) {
            case 'BBOX':
                if (preg_match('/^-?\d+.?\d*,-?\d+.?\d*,-?\d+.?\d*,-?\d+.?\d*$/',
                               $szParamValue) != 1){
                    $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas valide.", 'niveau'=>'eleve');
                }
                break;
            case 'SRS':
                if (preg_match('/^EPSG:\d{4,6}$/', $szParamValue) != 1){
                    $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas valide.", 'niveau'=>'eleve');  
                }
                break;
            case 'SCALE':
                if (preg_match('/^\d+.?\d*$/', $szParamValue) != 1){
                    $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas valide.", 'niveau'=>'eleve');  
                }
                break;
            case 'URLS':
                global $_SEPARATOR;
                $aszURLs = explode($_SEPARATOR, $szParamValue);
                break;
            case 'MAPFORMAT':
                global $_MAPFORMAT;
                if(!in_array($szParamValue, $_MAPFORMAT)) {
                    $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas valide.", 'niveau'=>'eleve'); 
                }
                break;
            case 'FORMAT':
            case 'LAYERS':
            case 'TIME':
            case 'printTitle':
             case 'printComments':
            // no need to validate anything
            break;
            case 'width':
            case 'height':
          	global $_MAXIMUM_SIZE_INCHES;
                if($szParamValue > $_MAXIMUM_SIZE_INCHES){
                    $erreurs[] = array('message'=>"La valeur du paramètre '$szParam' est trop grande.", 'niveau'=>'eleve'); 
                }
          	break;
            case 'printUnits':
                global $_UNITS;
                if(!array_key_exists($szParamValue, $_UNITS)) {
                    $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas valide.", 'niveau'=>'eleve');  
                }
                break;
            case 'printMode':
                global $_MODE;
                if(!in_array($szParamValue, $_MODE)) {
                    $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas valide.", 'niveau'=>'eleve'); 
                }
                break;
            case 'printOutputFormat':
                global $_OUTPUTFORMAT;
                if(!in_array($szParamValue, $_OUTPUTFORMAT)) {
                    $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas valide.", 'niveau'=>'eleve'); 
                }
                break;
            case 'force':
                if (isset($_GET[$szParam])){
                    $szParamValue = urldecode($_GET[$szParam]);
                    global $_FORCE;
                    if(!in_array($szParamValue, $_FORCE)) {
                        $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas valide.", 'niveau'=>'eleve');
                    }
                }
                break;
            case 'showLegendGraphics':
                if($szParamValue !== 'true' && $szParamValue !== 'false'){
                    $erreurs[] = array('message'=>"Le paramètre '$szParam' doit être true ou false.", 'niveau'=>'eleve');
                }
          	break;
            default:
                $erreurs[] = array('message'=>"Le paramètre '$szParam' n'est pas supporté.", 'niveau'=>'eleve'); 
                break;
        }
    }
}

function warning_handler($errno, $errstr) {

    global $erreurs;

    $erreurs[] = array('message'=>"Erreur : $errstr", 'niveau'=>'eleve');

}
?>
