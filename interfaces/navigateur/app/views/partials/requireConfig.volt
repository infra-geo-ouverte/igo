<?php 
echo $this->getContent(); ?>
requirejs.onError = function (err) {
console.log(err);
    console.warn("Erreur chargement ("+err.requireType+"): Le module '" + err.requireModules + "' n'a pas été chargé");
    throw new Error("Le module '" + err.requireModules + "' n'a pas été chargé: " + err.originalError.target.src);
};
require.config({
    baseUrl: "<?php echo $this->url->getBaseUri()?>",
    urlArgs: "version="+version,
    waitSeconds: 30,
    paths: {
    <?php
        //TODO Documenter la fonction et la mettre ailleur que dans la vue
        function ScanRepertoireJS($repertoire, $baseUri){
           
            $repertoireOuvert = opendir($repertoire) or die('Erreur');
            while($fichier = readdir($repertoireOuvert)) {
                if($fichier != '.' && $fichier != '..' && $fichier != 'inutilise' && $fichier != 'main.js') {
                    if(is_dir($repertoire.'/'.$fichier)) {
                         ScanRepertoireJS($repertoire.'/'.$fichier, $baseUri);
                    }
                    else {                          
                        echo "\t\t".substr($fichier,0,-3).": '".$repertoire."/".substr($fichier,0,-3)."',\n";
                    }
                }
            }
            closedir($repertoireOuvert);
        }

        ScanRepertoireJS($apps, '');
    ?>
        async : "libs/require/src/async",
        noAMD : "libs/require/src/noAMD",
        css : "libs/require/src/css",
        text : "libs/require/src/text",
        hbars : "libs/require/src/hbars",
        handlebars: 'libs/handlebars/handlebars-v3.0.0',
        jquery: debug ? "libs/jquery/jquery-1.10.2" : "libs/jquery/jquery-1.10.2.min",
        proj4js: 'libs/proj/Proj4js',
        epsgDef: 'libs/proj/epsgDef',
        build: "js/main-build"
    }, 
    shim: {
        build: {
            deps: ['requireAide']
        },
        epsgDef: {
            deps: ['proj4js']
        },
        Handlebars: {
            exports: 'Handlebars'
        }
    }
});
