/** 
 * Outil permettant l'importation de fichier géométrique dans la carte
 * Liste des extensions acceptées (selon le service Ogre)
 * Source: http://ogre.adc4gis.com/
 * BNA	.bna	-	
 * CSV	.csv	-	Common spatial columns (e.g. lon, lat, the_geom) will be translated, for less common, use a VRT file
 * DGN	.dgn	-	
 * DXF	.dxf	-	
 * ESRI Shapefile	-	.shp, .dbf, and .shx (.prj optional) - package in zip file	
 * GeoConcept	.gxt or .txt	-	
 * GeoJSON	.json or .geojson	-	
 * GeoRSS	.rss, .georss, or .xml	-	
 * GML	.gml	.gml and .xsd	
 * GMT	.gmt	-	
 * GPX	.gpx	-	
 * Interlis 1	.itf	.itf and .ili (.fmt optional)	
 * KML / KMZ	.kml or .kmz	-	
 * MapInfo	-	.tab, .map, .id, and .dat	
 * S-57	.000	.000 (.001-.00N optional)	
 * TIGER	-	at least an .rt1	
 * VRT
 */

define(['outil', 'aide', 'analyseurGeoJSON', 'vecteur'], function(Outil, Aide, AnalyseurGeoJSON, Vecteur) {
    function OutilExportFichier(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: Aide.obtenirCheminRacine()+'images/toolbar/gps_up.png',
            infobulle: "Exporter la sélection en fichier géométrique"
        });
        
        this.oOutputInputFormatStore = new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            data : [['BNA', 'bna'],
                    ['CSV', 'csv'],
                    //['DGN', 'dgn'],
                    //['DXF', 'dxf'],
                    ['ESRI Shapefile', 'ESRI Shapefile'],
                    //['GEOCONCEPT', 'Geoconcept'],
                    ['GEOJSON', 'GeoJSON'],
                    ['GEORSS', 'GeoRSS'],
                    ['GML', 'GML'],
                   // ['GMT', 'GMT'],
                    ['GPX', 'GPX'],
                    ['KML', 'KML'],
                    //['MapInfo File', 'MapInfo File'],
                   // ['TIGER', 'TIGER'],
                    ['PGDUMP', 'PGDump'],
                    //['VRT', 'VRT']                   
                    ]
        });
        
        this.oEPSGStore = new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            data : [['32198', 'EPSG:32198'],
                    ['3857', 'EPSG:3857'],
                    ['4326', 'EPSG:4326']                 
                    ]
        });
        
       
    };

    OutilExportFichier.prototype = new Outil();
    OutilExportFichier.prototype.constructor = OutilExportFichier;
    
    /** Action de l'outil
     * @method
     * @name OutilExportFichier#executer
     */
    OutilExportFichier.prototype.executer = function() {
        var that = this;
        
        //Valider que le service est défini dans le fichier de configuration
        if(this.options.urlService === undefined) {
             Aide.afficherMessage("Erreur", "Vous devez ajouter un service de conversion pour cet outil dans votre fichier de configuration.");
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
     * Afficher le menu d'import
     * @method
     * @name OutilExportFichier#importer
     */
    OutilExportFichier.prototype.exporter = function(){
                
        var that = this;     
        this.nomCouche = "coucheFichier";
        this.listeFichierLatLon = ["gpx"];
        this.projection = this.carte.obtenirProjection();
       
        var myuploadform= new Ext.FormPanel({
                id: "idFormExport",
                fileUpload: true,
                width: 400,
                autoHeight: true,
                frame: true,
                bodyStyle: 'padding: 10px 10px 10px 10px;',
                standardSubmit:false,
                defaults: {
                    msgTarget: 'side'               
                },
                items:this.obtenirItemsForm(),
                buttons: [{
                    text: 'Exporter',
                    handler: function(){
                            that.lancerExport();
                        }
                },
                {
                    text:'Fermer',
                    handler: function(){
                        myWin.close();
                    }
                }]
            });

        var myWin = new Ext.Window({
            id     : 'myWin',
            title  : "Exportation de occurences sélectionnées",
            autoHeight : true,
            width  : 400,
            items  : [myuploadform],
            modal  : true
        });

        myWin.show();   
        
        this.myWin = myWin;
                   
    };  
    
    
    /**
     * Obtenir et exporter la sélection
     * @method
     * @name OutilExportSHP#exporter
     * @returns {Boolean}
     */
    OutilExportFichier.prototype.lancerExport = function(){    
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
    OutilExportFichier.prototype.appelerService = function(url, json, outputName, nbFichier){
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
            if(this.obtenirValeursRecherche()['exportOutputFormat'])
                inputs+='<textarea id="formatOutput" class="form-control" type="hidden" name="formatOutput">'+ this.obtenirValeursRecherche()['exportOutputFormat'] +'</textarea>';
            
            if(this.obtenirValeursRecherche()['exportEPSGOutput'])
                inputs+='<textarea id="targetSrs" class="form-control" type="hidden" name="targetSrs">'+ this.obtenirValeursRecherche()['exportEPSGOutput'] +'</textarea>';
            
            if(this.obtenirValeursRecherche()['exportEPSGInput'])
                inputs+='<textarea id="sourceSrs" class="form-control" type="hidden" name="sourceSrs">'+ this.obtenirValeursRecherche()['exportEPSGInput'] +'</textarea>';
            
            if(outputName){
                inputs+='<input id="name" name="outputName" value="' + outputName +  '" class="form-control">';
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
     * Importer le GeoJson converti du fichier dans la carte
     * @method
     * @name OutilExportFichier#importerJson
     * @param {json} geoJson données des géométries du fichier converti
     */
    OutilExportFichier.prototype.importerJson = function(geoJson, filename){       
        //Boucle de nettoyage des anomalies des géométries
        //TODO si d'autres ajouts, mettre dans une fonction
        $.each(geoJson.features, function(index, feat) {
            //Si un point, éliminer la dimension z d'une géométrie point si définie (Igo ne supporte pas cette dimension)
            if(feat.geometry.type == "Point" && feat.geometry.coordinates.length == 3) {
                feat.geometry.coordinates.pop();
            }
            
            //Illiminé les doublons de coordonnées pour chaque géométrie de type ligne
            if(feat.geometry.type === "Line" || feat.geometry.type === "LineString"){
                var coordPrec = "";
                var coordIndexToPop = new Array();
                $.each(feat.geometry.coordinates, function(ind, coord){                   
                    if(coordPrec !== "" && coordPrec[0] === coord[0] && coordPrec[1] === coord[1]){
                        coordIndexToPop.push(ind);
                    }                 
                    coordPrec = coord;    
                });
                if (coordIndexToPop.length > 0) {
                    $.each(coordIndexToPop, function(ind, indToPop){
                        //Car la position diminue de 1 à chaque fois qu'on retire un élément
                        var posToPop = indToPop-(ind*1);
                        feat.geometry.coordinates.splice(posToPop, 1);
                    });         
                }
            }
        });
            
        //Si le service retourne le crs, l'écraser car le format CRS84 n'est pas celui de nos projections du fichier proj4.js
        //Par défaut on paramètre le service avec "targetSrs": "EPSG:4326" pour la projection de sortie. compatible avec l'analyseurGeoJson
        if(geoJson.crs){
            geoJson.crs = undefined;
        }
       
        var gestionCouche = this.carte.gestionCouches;
        
        var analyseur = new AnalyseurGeoJSON({
        projectionCarte: this.carte.obtenirProjection()}); 
  
        var coucheImportFichier = gestionCouche.obtenirCoucheParId(this.nomCouche + filename);
        
        if(coucheImportFichier === undefined){
            coucheImportFichier = new Vecteur({titre: this.nomCouche + filename, id:this.nomCouche + filename, active:true, visible:true, suppressionPermise:true});
            gestionCouche.ajouterCouche(coucheImportFichier);
        }
        
        var occurences = analyseur.lire(geoJson);        
        coucheImportFichier.ajouterOccurences(occurences);
        coucheImportFichier.zoomerOccurences();        
    };
    
    /**
     * Vérifier que l'url du service est disponible
     * @method
     * @name OutilExportFichier#verifierServiceDisponible
     * @param {type} url url du service à valider
     * @param {type} fct Fonction à exécuter suite aux résultats
     */
    OutilExportFichier.prototype.verifierServiceDisponible = function(url, fct){
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
  
    /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheAdresse#obtenirAideHTML
     * @returns {String} Aide
    */
    OutilExportFichier.prototype.obtenirItemsForm = function() {
    
        var szDefaultOutputFormat = this.oOutputInputFormatStore.data.items[0].data.value;
        var oOutputFormatComboBox = new Ext.form.ComboBox({
            id : 'exportOutputFormat',
            fieldLabel: 'Format Output',
            store: this.oOutputInputFormatStore,
            valueField: 'value',
            value: szDefaultOutputFormat,
            displayField:'text',
            editable: false,
            mode: 'local',
            triggerAction: 'all',
            lazyRender: true,
            lazyInit: false,
            listWidth: 75
        });
        
        oOutputFormatComboBox.on( 'select', function(combo, record, index ) {   
            if(record.data.value === "GEORSS" || record.data.value === "KML"){
                this.ownerCt.getComponent("exportEPSGOutput").setDisabled(false);
                this.ownerCt.getComponent("exportEPSGOutput").setValue("EPSG:4326");        
            }
        });
        
        var oNomFichier = {
            xtype: 'textarea',
            fieldLabel: 'Préfixe du nom du fichier',
            id: 'exportTitle',
            maxLength: 50,
            width : 75
        };
        
        var szDefaultEPSG = this.oEPSGStore.data.items[0].data.value;
        var oEPSGComboBox = new Ext.form.ComboBox({
            id : 'exportEPSGOutput',
            fieldLabel: 'EPSG Output',
            store: this.oEPSGStore,
            valueField: 'value',
            value: szDefaultEPSG,
            displayField:'text',
            editable: false,
            mode: 'local',
            triggerAction: 'all',
            lazyRender: true,
            lazyInit: false,
            listWidth: 75
        });
        
        var oSkipFailure =
             {
                xtype: 'checkbox',
                id : 'skipfailureCheckBox',
                fieldLabel : ' Ne pas prendre en compte les erreurs.'
            } ;         
        
        
            
         return [oOutputFormatComboBox, oEPSGComboBox];
    };
    
    /** 
     * Obtenir les valeurs des champs de recherche.
     * @method 
     * @name Recherche#obtenirValeursRecherche
     * @returns {array} Tableau des valeurs de recherche
     */
    OutilExportFichier.prototype.obtenirValeursRecherche = function() {
        //Retourner la valeur des éléments contenus dans le formulaire
        return  this.myWin.getComponent("idFormExport").getForm().getValues();
    };
  
    return OutilExportFichier;
    
});