<?php

// Config pour le service d'impression
$GLOBALS['apps_config']['impression'] = array(
	'imagepath'			=> 	'/tmp/',
	'imageurl'			=> 	'/ms_tmp/',
	'proj_lib'			=> 	'epsg',
	'symbol_path'		=>	'symbol_path',
	'map_path'			=>	'map_path',
	'map_template'		=>	'map_template'	
);

// Config pour le service GeoNetwork
// On utilise le GeoNetwork en pré-prod pour tous nos environnements de travail
$GLOBALS['apps_config']['geonetwork']= array(
	'host'	=>	'spssogl20.sso.msp.gouv.qc.ca'
);

?>
