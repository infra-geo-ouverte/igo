<?php

$baseDir = __DIR__ . '/../';
$baseNavigateurDir = $baseDir . 'interfaces/navigateur/';
$basePilotageDir = $baseDir . 'pilotage/';
$baseEditionDir = $baseDir . 'edition/';
$baseServicesDir = $baseDir . 'services/';
$baseXmlDir = __DIR__ . '/../xml/';

return array(
    'database' => array(
        'adapter'     => 'Postgresql',
        'host'        => 'host',
        'username'    => 'user',
        'password'    => 'password',
        'dbname'      => 'dbname',
        'schema'      => 'schema',
        'modelsMetadata' => 'Off' // valeurs possibles de configuration : Apc, Xcache, Off        
    ),
    'data' => array( // Connexion à la base de données pour l'édition en ligne
        'adapter'     => 'Postgresql',
        'host'        => 'host',
        'username'    => 'user',
        'password'    => 'password',      
        'dbname'      => 'dbname',
        'schema'      => 'schema',
        'modelsMetadata' => 'Off' // valeurs possibles de configuration : Apc, Xcache, Off        
    ),
    'application' => array(
        'version'        =>  '0.4.dev', // Permet de versionner les fichiers javascripts et css
        'debug'          => true, //2 pour plus de messages
        'navigateur'  => array(
            'controllersDir' => $baseNavigateurDir . 'app/controllers/',      
            'modelsDir'      => $baseNavigateurDir . 'app/models/',
            'viewsDir'       => $baseNavigateurDir . 'app/views/',
            'pluginsDir'     => $baseNavigateurDir . 'app/plugins/',
            'libraryDir'     => $baseNavigateurDir . 'app/library/',
            'cacheDir'       => $baseNavigateurDir . 'app/cache/'
        ),
        'pilotage'  => array(
            'controllersDir' => $basePilotageDir . 'app/controllers/',
            'modelsDir'      => $basePilotageDir . 'app/models/',    
            'viewsDir'       => $basePilotageDir . 'app/views/',
            'pluginsDir'     => $basePilotageDir . 'app/plugins/',
            'libraryDir'     => $basePilotageDir . 'app/library/',
            'cacheDir'       => $basePilotageDir . 'app/cache/',
            'helpersDir'     => $basePilotageDir . 'app/helpers/',
            'validatorsDir'  => $basePilotageDir . 'app/validators/',  // Temporaire, TODO refactor de validator dans services.
            'retroCheminDefaut' => '' //Chemin serveur où sont les mapfile pour la rétroingénierie
        ),
        'edition' => array(
            'fieldsDir' => $baseEditionDir . 'app/fields/',
            'utilDir' => $baseEditionDir . 'app/util/',
            'servicesDir' => $baseEditionDir . 'app/services/',
            'exemplesServicesDir' => $baseEditionDir . 'app/services/exemple/'
        ),        
        'services'  => array(
            'dir'            => $baseServicesDir,
            'controllersDir' => $baseServicesDir . 'igo_commun/app/controllers/',
            'viewsDir'       => $baseServicesDir . 'igo_commun/app/views/'     
        ),
        'authentification' => array(
            //'authentificationUri' => '/igo/services/igo_commun/public',        
            //'authentificationExterne' => false,     // Si l'authentication externe est activée, le navigateur se fiera sur la variable $PHP_AUTH_USER 
                                                    // sans valider le $PHP_AUTH_PW; Si elle est désactivé, mais que PHP_AUTH_USER et PHP_AUTH_PW sont présent,
                                                    // elle validera ces paramêtre en utilisant la configuration  authenticationModule ci bas.
                                                    // Si elle est désactivé et que PHP_AUTH_USER n'est pas présent, une fenêtre de Connexion affichera.
            'module' => 'AuthentificationTest',  // Le nom de la classe responsable de l'authentification. Doit implémenter l'interface IAuthentification
            'activerSelectionRole' => true,                     // Détermine si un role doit être activé, ou si les permissions sont attribués selon tous les roles disponibles
            'permettreAccesAnonyme' => true,                    // Détermine si l'accès anomyme est permise pour le système
            'nomProfilAnonyme' => 'cn=GRAPP-VIG-MSP_ANONYME,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP' // Détermine le nom du profil à utiliser pour les utilisateurs anonymes.
        ),
    ),
    'mapserver' => array(
        'host'           => 'host', 
        'mapfileCacheDir'=> "mapfileCacheDir",
        'contextesCacheDir' => "contextes/",
        'couchesCacheDir' => "couches/",
        'mapserver_path' => "/cgi-wms/",
        'executable'     => "mapserv.fcgi?map=",
        'mapfileInclude' => array() //tableau de chemin de mapfile devant être incluent dans tous les mapfiles IGO
        //'url' => "/cgi-wms/mapserv.fcgi?"
    ),
    'uri' => array(
        'navigateur'    => "/igo_navigateur/",
        'librairies'    => "/igo/librairie/",
        'services'      => "/igo/services/",
        'api'           => "/api/",
        'pilotage'      => "/pilotage/"
    ),
    'navigateur' => array(
        'OutilRapporterBogue'    => array('lien' => 'http://geoegl.msp.gouv.qc.ca/mantis/login_page.php'),
        'OutilAjoutWMS'         => array('urlPreenregistre' => "http://geoegl.msp.gouv.qc.ca/cgi-wms/adnInternetV2.fcgi,"
                                                            . "http://wms.sst-sw.rncan.gc.ca/wms/toporama,"
                                                            . "http://geoegl.msp.gouv.qc.ca/cgi-wms/inspq_icu.fcgi,"
                                                            . "http://geoegl.msp.gouv.qc.ca/cgi-wms/gouvouvertqc.fcgi"),
        'OutilImportFichier'    => array('urlService' => 'http://ogre.adc4gis.com/convert'), //Version en ligne du service
        'OutilExportSHP'        => array('urlService' => 'http://ogre.adc4gis.com/convertJson'), //Version en ligne du service        
        'Recherche'  => array(
            'service' => '[gloV6]',
            'format'  => 'json',
            'urlAppelant' => "" //Utiliser urlAppelant ou cle, pas les 2
            //'cle' => 'glo'
        )
    ),
    /*'cles' => array(
        'glo'           => '123'
    ),*/
    'servicesExternes' => array(
        'gloV6'         => 'http://pregeoegl.msp.gouv.qc.ca/Services/glo/V6/gloServeurHTTP.php',  
        'regex'  =>  array(
            "#http://geoegl\.msp\.gouv\.qc\.ca/cgi-wms/(.)+\.fcgi#",
            "#http://wms\.sst-sw\.rncan\.gc\.ca/wms/(.)+#" 
        )
    ),
    // les configurations permettent d'appeler un fichier xml en mode rest et d'associer une clé avec un lien vers un fichier
    'configurations' => array(
        'defaut'        => $baseXmlDir . 'defaut.xml',
        'editionSimple' => $baseXmlDir . 'editionSimple.xml'
    ),
    'services' => array(
        'PointFeatureService'
    )    
);
