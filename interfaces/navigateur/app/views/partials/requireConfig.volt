options.requireConfigFct = function(version, debug){

    require.config({
        baseUrl: "{{this.url.getBaseUri()}}",
        urlArgs: "version="+ version,
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
                            if(substr($fichier, -3) === ".js"){
                                $name = substr($fichier,0,-3);

                                if (preg_match('/^[a-z0-9_-]+$/i', $name)) { 
                                    echo "\t\t".$name.": '".$repertoire."/".$name."',\n";
                                }
                            }
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
            handlebars: '{{this.config.uri.librairies}}/handlebars/handlebars',
            jquery: debug ? "{{this.config.uri.librairies}}/jquery/jquery" : "{{this.config.uri.librairies}}/jquery/jquery.min",
            html2canvas: "{{this.config.uri.librairies}}/html2canvas/dist/html2canvas",
            html2canvassvg: "{{this.config.uri.librairies}}/html2canvas/dist/html2canvas.svg",
            rgbcolor: "{{this.config.uri.librairies}}/rgbcolor/index",
            stackblur: "{{this.config.uri.librairies}}/StackBlur/index",
            canvg: "{{this.config.uri.librairies}}/canvg/index",
            es6promise: "{{this.config.uri.librairies}}/es6-promise/es6-promise.min",
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
            canvg: {
                deps: ['rgbcolor', 'stackblur']
            },
            Handlebars: {
                exports: 'Handlebars'
            }
        }
    });
}