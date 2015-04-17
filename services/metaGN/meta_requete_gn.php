<?php

    // Inclusion du fichier de config de l'url du Host de GeoNetwork et son CSW.
    require_once(dirname(__FILE__).'/../config.php');	// connexion au host GeoNetwork sur le spssogl20 au MSP / intranet.donnees.qc pour intranet M/O.
    require_once(dirname(__FILE__) . "/../fonctions.php");


    if (isset($_REQUEST['url_metadata'])) {
        $url = $_REQUEST['url_metadata'];
        $parts = parse_url($url);
        parse_str($parts['query'], $query);
        $uuid=$query['ID'];
    } else if(isset($_REQUEST['id'])) {
        $uuid = $_REQUEST['id'];
        // Requete CSW pour voir si le id de la fiche si existante (donc publier à tous dans GN) dans le CSW public.
        $url = "http://".$GLOBALS['apps_config']['geonetwork']['host']."/geonetwork/srv/eng/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&outputSchema=csw:IsoRecord&ID=".$uuid."&elementSetName=full";
    } else {
        die('Vous devez entrer un identifiant de fiche de métadonnée');
    }


    $csw_getrecord = curl_file_get_contents($url);

    function xml_entities($string) {
        return strtr(
            $string, 
            array(
                "<" => "&lt;",
                ">" => "&gt;",
                '"' => "&quot;",
                "'" => "&apos;",
                "&" => "&amp;",
            )
        );
    }
    
		// Return resultats si id existant dans GN
		header('Content-type: text/xml',true);
		$xml  = '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>'."\n";
		$xml .= "<geonetwork_metaid>\n";

		$xml .= "\t\t<nomClasseid>".$uuid."</nomClasseid>\n";





	if(strstr($csw_getrecord, 'gco:CharacterString'))
	{
		$xml .= "\t\t<id>".$uuid."</id>\n";
	}
	else
	{
		$xml .= "\t\t<id>-99</id>\n";
	}

	$xml .= "</geonetwork_metaid>\n";
	// Affiche le résultat si existant dans GN ou non.
	echo ($xml);
?>
