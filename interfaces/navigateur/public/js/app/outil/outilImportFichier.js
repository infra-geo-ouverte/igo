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
require.ajouterConfig({
    paths: {
            togeojson: '[librairies]ext/extension/togeojson/togeojson',
            fileUploadField: '[librairies]ext/extension/FileUploadField/FileUploadField',
            fileUploadFieldCss: '[librairies]ext/extension/FileUploadField/FileUploadField'
    }
});

define(['outil', 'aide', 'analyseurGeoJSON', 'vecteur', 'togeojson', 'fileUploadField', 'css!fileUploadFieldCss'], function(Outil, Aide, AnalyseurGeoJSON, Vecteur) {
    function OutilImportFichier(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: Aide.obtenirCheminRacine()+'images/toolbar/gps_down.png',
            infobulle: "Importer un fichier"
        });
    };

    OutilImportFichier.prototype = new Outil();
    OutilImportFichier.prototype.constructor = OutilImportFichier;
        
    OutilImportFichier.prototype.executer = function() {
        
        if(this.options.urlService === undefined) {
             Aide.afficherMessage("Erreur", "Vous devez ajouter un service de conversion pour cet outil dans votre fichier de configuration.");
             return false;
        } 
        
        var that = this;     
        this.nomCouche = "coucheImportFichier";         
        this.projection = this.carte.obtenirProjection();
       
        var myuploadform= new Ext.FormPanel({
                fileUpload: true,
                width: 400,
                autoHeight: true,
                frame: true,
                bodyStyle: 'padding: 10px 10px 10px 10px;',
                standardSubmit:false,
                defaults: {
                    msgTarget: 'side'               
                },
                items:[
                {
                    anchor: '95%',
                    allowBlank: false,
                    xtype: 'fileuploadfield',                   
                    id: 'upload',
                    emptyText: 'Sélectionner un fichier...',
                    fieldLabel: 'Fichier',
                    buttonText: 'Parcourir',
                    listeners: {
                        fileselected: function(inputNode,fileInput){
                            inputNode.setValue(fileInput.replace("C:\\fakepath\\", ""));
                        }
                    }
                },
                {
                    xtype:'textfield',
                    fieldLabel: 'Projection source du fichier : EPSG',
                    id: 'sourceSrs',
                    allowBlank: true,
                    value: '',
                    labelStyle: 'width:195px',
                    style: {width:'75px'}  
                }],
                buttons: [{
                    text: 'Importer',
                    handler: function(){
                        if(myuploadform.getForm().isValid()){
                            var data = new FormData();
                            
                            //Obtenir le fichier d'upload
                            var file = jQuery('input[id^="upload"]')[1].files[0];
                            var extension = file.name.split(".")[file.name.split(".").length-1];
                            
                            //Exception pour le format GPX, le service ogre ne fonctionne pas bien, on utilise donc togeojson
                            if(extension.toLowerCase() === "gpx") {
                                
                                //Définir un reader pour lire le fichier GPX
                                var reader = new FileReader();
                                reader.onload = function(e) {                                 
                                    var text = e.target.result;
                                  
                                    //Transformer le contenu du fichier GPX en JSON
                                    var geoJson = toGeoJSON["gpx"]((new DOMParser()).parseFromString(text, 'text/xml'));
                                    that.importerJson(geoJson); //Importer les données
                                };

                                //Lire le contenu du fichier GPX
                                reader.readAsText(file);   
                            }
                            else {
                                data.append('upload', file);

                                //Ne pas afficher les erreurs
                                //data.append("skipFailures",'');

                               //Projection de la carte
                                //data.append("targetSrs", that.projection);
                                data.append("targetSrs", "EPSG:4326");

                                //Projection source si défini
                                var sourceSrs = jQuery('input[id^="sourceSrs"]').val();
                                if(sourceSrs !== ""){
                                    data.append("sourceSrs", "EPSG:"+sourceSrs);
                                }

                                jQuery.ajax({
                                    //Url du service de conversion
                                    //url: 'http://ogre.adc4gis.com/convert',
                                    url: that.options.urlService,
                                    data: data,
                                    cache: false,
                                    contentType: false,
                                    processData: false,
                                    type: 'POST',
                                    success: function(data){

                                        if(data.errors!== undefined){
                                            var erreurs = "";
                                            $.each(data.errors, function(index, error){
                                                erreurs += error + "<br>";
                                            });
                                            Aide.afficherMessage("Erreur", erreurs);
                                        }
                                        else{                                    
                                            that.importerJson(data);
                                        }
                                    }
                                });   
                            }
                        }
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
            height : 200,
            width  : 400,
            items  : [myuploadform],
            modal  : true
        });

        myWin.show();   
                   
    };  
    
    /**
     * Importer le GeoJson converti du fichier dans la carte
     * @method
     * @name OutilImportFichier#importerJson
     * @param {json} geoJson données des géométries du fichier converti
     */
    OutilImportFichier.prototype.importerJson = function(geoJson){
       
        //Si le service retourne le crs, l'écraser car le format CRS84 n'est pas celui de nos projections du fichier proj4.js
        //Par défaut on paramètre le service avec "targetSrs": "EPSG:4326" pour la projection de sortie. compatible avec l'analyseurGeoJson
        if(geoJson.crs){
            geoJson.crs = undefined;
        }
       
        var gestionCouche = this.carte.gestionCouches;
        
        var analyseur = new AnalyseurGeoJSON({
        projectionCarte: this.carte.obtenirProjection()}); 
  
        var coucheImportFichier = gestionCouche.obtenirCoucheParId(this.nomCouche);
        
        if(coucheImportFichier === undefined){
            coucheImportFichier = new Vecteur({titre: this.nomCouche, id:this.nomCouche, active:true, visible:true});
            gestionCouche.ajouterCouche(coucheImportFichier);
        }
        
         var occurences = analyseur.lire(geoJson);        
         coucheImportFichier.ajouterOccurences(occurences);
         coucheImportFichier.zoomerOccurences();        
    }; 
  
    return OutilImportFichier;
    
});