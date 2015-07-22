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
if(!require.estDansConfig("fileUploadField")){   
    require.ajouterConfig({
        paths: {
                togeojson: '[librairies]/togeojson/togeojson',
                fileUploadField: 'libs/Ext.ux/FileUploadField/FileUploadField',
                fileUploadFieldCss: 'libs/Ext.ux/FileUploadField/FileUploadField'
        },
        shim: {
            fileUploadField: {
                deps: ['css!fileUploadFieldCss']
            }
        }
    });
}

define(['outil', 'aide', 'analyseurGeoJSON', 'vecteur', 'togeojson', 'fileUploadField'], function(Outil, Aide, AnalyseurGeoJSON, Vecteur) {
    function OutilImportFichier(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: Aide.obtenirCheminRacine()+'images/toolbar/gps_down.png',
            infobulle: "Importer un fichier géométrique"
        });
    };

    OutilImportFichier.prototype = new Outil();
    OutilImportFichier.prototype.constructor = OutilImportFichier;
    
    /** Action de l'outil
     * @method
     * @name OutilImportFichier#executer
     */
    OutilImportFichier.prototype.executer = function() {
        var that = this;
        
        //Valider que le service est défini dans le fichier de configuration
        if(this.options.urlService === undefined) {
             Aide.afficherMessage("Erreur", "Vous devez ajouter un service de conversion pour cet outil dans votre fichier de configuration.");
             return false;
        }
        
        //Valider que le service défini est fonctionnel
        this.verifierServiceDisponible(this.options.urlService, function(status){
            if(status === 200){
               that.importer();
            }
            else{
               Aide.afficherMessage("Erreur", "Le service de conversion n'est pas disponible.");
            }
        });
        
    };
    
    /**
     * Afficher le menu d'import
     * @method
     * @name OutilImportFichier#importer
     */
    OutilImportFichier.prototype.importer = function(){
                
        var that = this;     
        this.nomCouche = "coucheFichier";
        this.listeFichierLatLon = ["gpx"];
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
                    blankText: "Vous devez sélectionner un fichier géométrique avant de pouvoir importer.",
                    listeners: {
                        fileselected: function(inputNode,fileInput){
                            inputNode.setValue(fileInput.replace("C:\\fakepath\\", ""));
                            
                            var extension = fileInput.split(".")[fileInput.split(".").length-1].toLowerCase();
                            
                            if(that.listeFichierLatLon.indexOf(extension) === -1){
                                this.ownerCt.form.findField("sourceSrs").show();
                            }
                            else{
                                this.ownerCt.form.findField("sourceSrs").hide();
                            }
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
                    style: {width:'75px'},
                    hidden: true
                }],
                buttons: [{
                    text: 'Importer',
                    handler: function(){
                        if(myuploadform.getForm().isValid()){
                            var data = new FormData();
                            
                            //Obtenir le fichier d'upload
                            var file = jQuery('input[id^="upload"]')[1].files[0];
                            var extension = file.name.split(".")[file.name.split(".").length-1];
                            var filename = file.name.split(".")[0];
                            //Exception pour le format GPX, le service ogre ne fonctionne pas bien, on utilise donc togeojson
                            if(extension.toLowerCase() === "gpx") {
                                
                                //Définir un reader pour lire le fichier GPX
                                var reader = new FileReader();
                                reader.onload = function(e) {                                 
                                    var text = e.target.result;
                                  
                                    //Transformer le contenu du fichier GPX en JSON
                                    var geoJson = toGeoJSON["gpx"]((new DOMParser()).parseFromString(text, 'text/xml'));
                                                                        
                                    that.importerJson(geoJson, filename); //Importer les données
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
                                            console.log(data.errors);
                                            Aide.afficherMessage("Erreur", "Fichier invalide, les formats permis sont: BNA, CSV, DGN, DXF, ESRI Shapefile, GeoConcept, GeoJSON, GeoRSS, GML, GMT, GPX, Interlis 1, KML, KMZ, MapInfo, S-57, TIGER, VRT");
                                        }
                                        else{                                    
                                            that.importerJson(data,filename);
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
    OutilImportFichier.prototype.importerJson = function(geoJson, filename){       
        //Boucle de nettoyage des anomalies des géométries
        //TODO si d'autres ajouts, mettre dans une fonction
        $.each(geoJson.features, function(index, feat) {
            //Si un point, éliminer la dimension z d'une géométrie point si définie (Igo ne supporte pas cette dimension)
            if(feat.geometry.type == "Point" && feat.geometry.coordinates.length === 3) {
                feat.geometry.coordinates.pop();
            }
            
            //Illiminé les doublons de coordonnées pour chaque géométrie de type ligne, éliminer la 3e dimension
            if(feat.geometry.type === "Line" || feat.geometry.type === "LineString"){
                var coordPrec = "";
                var coordIndexToPop = new Array();
                $.each(feat.geometry.coordinates, function(ind, coord){                   
                    //Si égale à la coordonnée précédente
                    if(coordPrec !== "" && coordPrec[0] === coord[0] && coordPrec[1] === coord[1]){
                        coordIndexToPop.push(ind);
                    }else{
                        //Sinon si coordonnée à 3dimensions, on retire la dimension "z"
                        if(coord.length === 3) {
                            coord.pop();
                        }
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
     * @name OutilImportFichier#verifierServiceDisponible
     * @param {type} url url du service à valider
     * @param {type} fct Fonction à exécuter suite aux résultats
     */
    OutilImportFichier.prototype.verifierServiceDisponible = function(url, fct){
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
  
    return OutilImportFichier;
    
});