<?php

// Config pour le service d'impression
$GLOBALS['apps_config']['impression'] = array(
	'imagepath'			=> 	'/srv/www/geomatique/partage/services/tmp/',
	'imageurl'			=> 	'/ms_tmp/',
	'proj_lib'			=> 	'/srv/www/geomatique/services/epsg/',
	'symbol_path'		=>	'/srv/www/geomatique/services/symbols/',
	'map_path'			=>	'/srv/www/geomatique/partage/services/map/',
	'map_template'	=>	'/srv/www/geomatique/partage/services/map/print_vecteurs_annotations_template.map'	
);

// Config pour le service GeoNetwork
// On utilise le GeoNetwork en pré-prod pour tous nos environnements de travail
$GLOBALS['apps_config']['geonetwork']= array(
	'host'	=>	'spssogl20.sso.msp.gouv.qc.ca'
);

?>
