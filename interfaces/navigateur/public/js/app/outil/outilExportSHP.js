/**
 * Outil permettant l'exportation d'une sélection en fichier shapeFile
 */
define(['outil', 'aide', 'analyseurGeoJSON'], function(Outil, Aide, AnalyseurGeoJSON) {
    function OutilExportSHP(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: Aide.obtenirCheminRacine()+'images/toolbar/export_shape.png',
            infobulle: "Exporter en fichier(s) de formes (shp)"
        });
    };

    OutilExportSHP.prototype = new Outil();
    OutilExportSHP.prototype.constructor = OutilExportSHP;
    
    /** Action de l'outil
     * @method
     * @name OutilExportSHP#executer
     */
    OutilExportSHP.prototype.executer = function() {
        
        var that = this;
        
        //Valider que le service est défini dans le fichier de configuration
        if(this.options.urlService === undefined) {
             Aide.afficherMessage("Erreur", "Vous devez définit un service de conversion dans votre fichier de configuration.");
             return false;
        }
        
        //Valider que le service défini est fonctionnel
        this.verifierServiceDisponible(this.options.urlService, function(status){
            if(status === 200){
               that.exporter();
            }
            else{
               Aide.afficherMessage("Erreur", "Le service de conversion n'est pas disponible.");
            }
        });
    };
    
    /**
     * Obtenir et exporter la sélection
     * @method
     * @name OutilExportSHP#exporter
     * @returns {Boolean}
     */
    OutilExportSHP.prototype.exporter = function(){    
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
                that.appelerService(that.options.urlService, JSON.stringify(geojson), index, nbFichier);
                nbFichier++;
            }
        });
        
        //Si aucun fichier n'a été créé
        if(nbFichier === 0){
            Aide.afficherMessage("Aucune sélection", "Vous devez sélectionner au moins un élément avant de pouvoir l’exporter.");
            return false;
        }             
    };  
    
    /**
     * Appeler le service qui retournera le fichier zip de shapeFile selon les géométries sélectionnés de la couche
     * @method
     * @name OutilExportSHP#appelerService
     * @param {string} url URL du service à de conversion shapeFile
     * @param {json} json contenant les géométries à convertir en shapeFile
     * @param {string} outputName le nom du fichier de sortie
     * @returns {file} Retour le fichier selon outputName + shape.zip
     */
    OutilExportSHP.prototype.appelerService = function(url, json, outputName, nbFichier){
        if( url && json ){
            
            //Retirer l'instance du iframe précédent
            /**Ne pas faire avec le setTimeOut à la fin car cause des problème si l'usager prend du temps à enregistrer
             * setTimeout((function(iframe) {
                return function() { 
                    iframe.remove(); 
                };
            })(iframe), 4000);
             */
            if($("#iframeExportShp"+nbFichier-1)){
                $("#iframeExportShp"+nbFichier-1).remove();
            }
            
            /*Créer un iframe qui contiendra le form qui servira à soumettre les paramètres aux services de conversion
             * On doit faire ainsi afin de nous permettre de retourner plusieurs fichiers.
             */
            var iframe = $('<iframe id="iframeExportShp"'+nbFichier+ ' style="visibility: collapse;"></iframe>');
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
    
    /**
     * Vérifier que l'url du service est disponible
     * @method
     * @name OutilExportSHP#verifierServiceDisponible
     * @param {type} url url du service à valider
     * @param {type} fct Fonction à exécuter suite aux résultats
     */
    OutilExportSHP.prototype.verifierServiceDisponible = function(url, fct){
        jQuery.ajax({
            url:      url,
            dataType: 'text',
            type:     'POST',
            complete:  function(xhr){
                if(typeof fct === 'function')
                   fct.apply(this, [xhr.status]);
            }
        });
    };
    
    return OutilExportSHP;
    
});

