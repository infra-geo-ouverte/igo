<?php
//Chemins vers les différentes parties du projet.
$baseDir = __DIR__ . '/../';
$baseNavigateurDir = $baseDir . 'interfaces/navigateur/';
$baseServicesDir = $baseDir . 'services/';
//Emplacement par défaut des fichiers xml de configuration
$baseXmlDir = $baseDir . 'xml/';

return array(
    'application' => array(
        // Permet de versionner les fichiers javascripts et css (possible de mettre 'aleatoire')
        'version'        =>  '1.0.0', 
        // Mode debug: des fichiers non-compillés, aucune cache serveur, messages d'erreurs plus nombreux
        'debug'          => true, 
        'navigateur'  => array(
            'controllersDir' => $baseNavigateurDir . 'app/controllers/',      
            'modelsDir'      => $baseNavigateurDir . 'app/models/',
            'viewsDir'       => $baseNavigateurDir . 'app/views/',
            'pluginsDir'     => $baseNavigateurDir . 'app/plugins/',
            'libraryDir'     => $baseNavigateurDir . 'app/library/',
            'cacheDir'       => $baseNavigateurDir . 'app/cache/'
        ),
        'services'  => array(
            'dir'            => $baseServicesDir,
            'controllersDir' => $baseServicesDir . 'igo_commun/app/controllers/',
            'viewsDir'       => $baseServicesDir . 'igo_commun/app/views/'     
        )
    ),
    //url des différentes parties du projet
    'uri' => array(
        'navigateur'    => "/igo_navigateur/",
        'edition'       => "/igo/edition/",
        'librairies'    => "/igo/librairie/",
        'services'      => "/igo/services/",
        'api'           => "/api/"
    ),
    //Options des outils/panneaux à ajouter à une classe
    //Voir la documentation XML pour une liste plus complète
    //Les options définies dans le xml sont prédominantes.
    'navigateur' => array(
        'OutilRapporterBogue'    => array('lien' => 'http://geoegl.msp.gouv.qc.ca/mantis/login_page.php'),
        'OutilAjoutWMS'         => array('urlPreenregistre' => "http://geoegl.msp.gouv.qc.ca/cgi-wms/inspq_icu.fcgi,"
                                                            . "http://geoegl.msp.gouv.qc.ca/cgi-wms/gouvouvertqc.fcgi"),
        'OutilZoomPreselection'  => array('service' => '[zoomPreSelection]'), // [] -> Fait référence à servicesExternes->zoomPreSelection
        'OutilAide'     => array ('lien' => "guides/guide.pdf"),
        'WMS'     =>  array(
            'infoFormat' => "application/vnd.ogc.gml"
        )
    ),
    //Services permis par le proxy
    'servicesExternes' => array(
        'zoomPreSelection'  => 'http://geoegl.msp.gouv.qc.ca/libcommunes/MSPwidgets/coordonnees.php',
        //Les urls externes utilisés dans l'application doivent correspondre à un regex pour être permis
        'regex'         =>  array(
            "#".preg_quote("http://geoegl.msp.gouv.qc.ca/cgi-wms/inspq_icu.fcgi")."#",
            "#".preg_quote("http://geoegl.msp.gouv.qc.ca/cgi-wms/gouvouvertqc.fcgi")."#"
        )
    ),
    // les configurations permettent d'appeler un fichier xml en mode rest et d'associer une clé avec un lien vers un fichier
    'configurations' => array(
        'defaut'        => $baseXmlDir . 'defaut.xml',
        'exemple'          => $baseXmlDir . "exemple.xml"
    )
);
