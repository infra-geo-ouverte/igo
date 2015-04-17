/**
 * Outil permettant l'exportation d'une sélection en fichier shapeFile
 */
define(['outil', 'aide', 'analyseurGeoJSON'], function(Outil, Aide, AnalyseurGeoJSON) {
    function OutilExportSHP(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: Aide.obtenirCheminRacine()+'images/toolbar/export_shape.png',
            infobulle: "Exporter en shapeFile"
        });
    };

    OutilExportSHP.prototype = new Outil();
    OutilExportSHP.prototype.constructor = OutilExportSHP;
        
    OutilExportSHP.prototype.executer = function() {      
        if(this.options.urlService === undefined) {
             Aide.afficherMessage("Erreur", "Vous devez ajouter un service de conversion pour cet outil dans votre fichier de configuration.");
             return false;
        }  
        
        var that = this;     
        var geojson;
        this.tabOccu = new Array();       
        var analyseur = new AnalyseurGeoJSON({
            projectionCarte: this.carte.obtenirProjection()
        });
        var nbFichier=0;
        var couchesOccurencesSelect = this.carte.gestionCouches.obtenirOccurencesSelectionnees();
        this.tabMethod = new Array();
        
        //Pour chaque couches dans la carte 
        $.each(couchesOccurencesSelect, function(index, couche) {             
            that.tabOccu = new Array(); 
            
            //Pour chaque occurence de la couche
            $.each(couche, function(ind, occu) {
                //convertir les occurence en 4326 pour le shapeFile
                that.tabOccu.push(occu.projeter("EPSG:4326"));
            }); 
            
            /*Si des occurences sont sélectionnées pour la couche, on les convertit en json et on appelle la fonction
             * de conversion en shapeFile
             */
            if(that.tabOccu.length !== 0){
                geojson = JSON.parse(analyseur.ecrire(that.tabOccu));
                //that.download("http://ogre.adc4gis.com/convertJson", "post", JSON.stringify(geojson), index);
                that.appelerService(that.options.urlService, JSON.stringify(geojson), index);
                nbFichier++;
            }
        });
        
        //Si aucun fichier n'a été créé
        if(nbFichier === 0){
            Aide.afficherMessage("Aucune sélection", "S.V.P. faites une sélection");
            return false;
        }             
    };  
    
    /**
     * Appeler le service qui retournera le fichier zip de shapeFile selon les géométries sélectionnés de la couche
     * @param {string} url URL du service à de conversion shapeFile
     * @param {json} json contenant les géométries à convertir en shapeFile
     * @param {string} outputName le nom du fichier de sortie
     * @returns {file} Retour le fichier selon outputName + shape.zip
     */
    OutilExportSHP.prototype.appelerService = function(url, json, outputName){
        if( url && json ){
            
            //Retirer l'instance du iframe précédent
            /**Ne pas faire avec le setTimeOut à la fin car cause des problème si l'usager prend du temps à enregistrer
             * setTimeout((function(iframe) {
                return function() { 
                    iframe.remove(); 
                };
            })(iframe), 4000);
             */
            if($("#iframeExportShp")){
                $("#iframeExportShp").remove();
            }
            
            /*Créer un iframe qui contiendra le form qui servira à soumettre les paramètres aux services de conversion
             * On doit faire ainsi afin de nous permettre de retourner plusieurs fichiers.
             */
            var iframe = $('<iframe id="iframeExportShp" style="visibility: collapse;"></iframe>');
            $('body').append(iframe);
            var content = iframe[0].contentDocument;
                 
            var inputs = '';
            
            inputs+='<textarea id="json" class="form-control" type="hidden" name="json">'+ json +'</textarea>';
            if(outputName){
                inputs+='<input id="name" name="outputName" value="' + outputName +  'Shape.zip" class="form-control">';
            }
            
            var form = '<form name=' + outputName + ' action="'+ url +'" method="post">'+inputs+'</form>';
            content.write(form);
            $('form', content).submit();
          /*  setTimeout((function(iframe) {
                return function() { 
                    iframe.remove(); 
                };
            })(iframe), 4000);*/
        };
    };    
    
    return OutilExportSHP;
    
});

