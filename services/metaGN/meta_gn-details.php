<?php

// Inclusion du fichier de config de l'url du Host de GeoNetwork et son CSW.
require_once(dirname(__FILE__).'/../config.php');	// connexion au host GeoNetwork sur le spssogl20 au MSP / intranet.donnees.qc pour intranet M/O.
require_once(dirname(__FILE__). "/../fonctions.php");

function transform($xml, $xsl)
{
   $xslt = new XSLTProcessor();
   $xslt->importStylesheet(new  SimpleXMLElement($xsl));
   return $xslt->transformToXml(new SimpleXMLElement($xml));
}

$GLOBALS['data'] = null;

$url = null;
if (isset($_REQUEST['url_metadata'])){
    $url = $_REQUEST['url_metadata'];
} else if (isset($_REQUEST['id'])) {
    $url = "http://".$GLOBALS['apps_config']['geonetwork']['host']."/geonetwork/srv/eng/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&outputSchema=csw:IsoRecord&ID={$_REQUEST['id']}&elementSetName=full";
}

if(isset($url)) {
        $parseUrl = parse_url($_SERVER['REQUEST_URI']);
        $base = dirname($parseUrl['path']);
	$xml = curl_file_get_contents($url);

	if(isset($_REQUEST['full']))
	{
		$GLOBALS['data']  = transform($xml, fopen_file_get_contents("./xsl/bs_full.xsl"));
	}
	else
	{
		$GLOBALS['data']  = transform($xml, fopen_file_get_contents("./xsl/bs_full.xsl"));
	}
        $GLOBALS['data'] = str_replace("{base}", $base, $GLOBALS['data']);
	//IncrementPopularity($_REQUEST['id']);
}
?>
<!DOCTYPE HTML>
<html xmlns:fb="http://ogp.me/ns/fb#" xmlns:og="http://ogp.me/ns#">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" href="<?php echo $base;?>/inc/css/reset.css" type="text/css">
<link rel="stylesheet" href="<?php echo $base;?>/inc/css/body.css" type="text/css">

<!--[if IE]><script type="text/javascript" src="inc/js/PIE.js"> </script> <![endif]-->
<!--[if lt IE 8]><link rel="stylesheet" href="inc/css/ie8.css" type="text/css"> <![endif]-->
<!--[if lt IE 9]><link rel="stylesheet" href="inc/css/ie.css" type="text/css"> <![endif]-->
<!--[if IE 6]><link rel="stylesheet" href="inc/css/ie6.css" type="text/css"> <![endif]-->
</head>
<body>
<div class="wrapper">
<div class="acc_colonne1" id="contenu">
<?php //PrintNavigation("Détail de la métadonnée"); ?>
<?php
if($GLOBALS['data'] === null)
{
 	echo "Aucune métadonnée disponible pour cette couche";
}
else
{
	echo $GLOBALS['data'];
}
?>
</div>
</div>
</body>
</html>
