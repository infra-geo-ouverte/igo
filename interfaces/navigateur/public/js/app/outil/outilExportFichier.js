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
            togpx: '[librairies]/togpx/togpx',
            multiSelect: 'libs/Ext.ux/multiSelect/MultiSelect',
            multiSelectCss: 'libs/Ext.ux/multiSelect/css/MultiSelect'
        },
        shim: {
            multiSelect: {
                deps: ['css!multiSelectCss']
            }
    }
});

define(['outil', 'occurence', 'aide', 'analyseurGeoJSON', 'togpx', 'multiSelect'], function(Outil, Occurence, Aide, AnalyseurGeoJSON, togpx) {
    function OutilExportFichier(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: Aide.obtenirCheminRacine()+'images/toolbar/gps_up.png',
            infobulle: "Exporter la sélection en fichier géométrique",
            format: [
                        ['csv', 'CSV', 'csv'],
                        //['DGN', 'dgn'],
                        //['DXF', 'dxf'],
                        ['ESRI Shapefile', 'ESRI Shapefile', 'zip'],
                        //['GEOCONCEPT', 'Geoconcept'],
                        ['geojson', 'GeoJSON', 'geojson'],
                        ['georss', 'GeoRSS', 'georss'],
                        ['gml', 'GML', 'gml'],
                       // ['GMT', 'GMT'],
                        ['gpx', 'GPX', 'gpx'],
                        ['kml', 'KML', 'kml'],
                        //['MapInfo File', 'MapInfo File'],
                       // ['TIGER', 'TIGER'],
                        ['pgdump', 'PGDump', 'sql']
                        //['VRT', 'VRT']       
                        ],
            libelleFormatOutput: 'Format Output',
            exampleCoordonnee: true,
            titreFenetre: "Exportation de occurences sélectionnées"
        });
        
        this.oOutputFormatStore = new Ext.data.SimpleStore({
            fields: ['value', 'text', 'extension'],
            data : this.defautOptions.format
        });        
        
        this.oEPSGStore = new Ext.data.SimpleStore({
            fields: ['value', 'text', 'exemple'],
            data : [
                ['EPSG:32198', 'EPSG:32198', '"-119820.522383, 594656.307879" <br> en mètres'],
                ['EPSG:3799', 'EPSG:3799 (NAD83 CSRS MTQ/Lambert)', '"788540.5947, 593873.0983" <br> en mètres'],
                ['EPSG:3799', 'EPSG:3797 (NAD27 MTQ/Lambert)', '"788509.4700, 593871.1210" <br> en mètres'],
                ['EPSG:4269', 'EPSG:4269 (NAD83)', '"-70.157745, 49.342105" <br> en degrés décimaux'],
                ['EPSG:3857', 'EPSG:3857 (Google)(900913)', '"-7809924.526660, 6333110.209241" <br> en mètres'],
                ['EPSG:4326', 'EPSG:4326 (WGS84)', '"-70.157745, 49.342105" <br> en degrés décimaux'],
                ['EPSG:26917', 'EPSG:26917 UTM zone 17', '"1286853.2279, 5522280.1159" <br> en mètres'],
                ['EPSG:26918', 'EPSG:26918 UTM zone 18', '"851679.4746, 5476773.2620" <br> en mètres'],
                ['EPSG:26919', 'EPSG:26919 UTM zone 19', '"415901.8955, 5466131.7953" <br> en mètres'],
                ['EPSG:26920', 'EPSG:26920 UTM zone 20', '"-19734.6510, 5490174.6287" <br> en mètres'],
                ['EPSG:26921', 'EPSG:26921 UTM zone 21', '"-454452.5742, 5549309.8653" <br> en mètres'],
                ['EPSG:32181', 'EPSG:32181 MTM Zone 1', '"-938855.7578, 5610376.9310" <br> en mètres'],
                ['EPSG:32182', 'EPSG:32182 MTM Zone 2', '"-722260.0446, 5564308.0180" <br> en mètres'],
                ['EPSG:32183', 'EPSG:32183 MTM Zone 3', '"-541361.6573, 5532851.8772" <br> en mètres'],
                ['EPSG:32184', 'EPSG:32184 MTM Zone 4', '"-323922.4119, 5503290.8654" <br> en mètres'],
                ['EPSG:32185', 'EPSG:32185 MTM Zone 5', '"-106202.4196. 5482544.9072" <br> en mètres'],
                ['EPSG:32186', 'EPSG:32186 MTM Zone 6', '"111693.0862, 5470526.2767" <br> en mètres'],
                ['EPSG:32187', 'EPSG:32187 MTM Zone 7', '"329668.8844, 5467183.8387" <br> en mètres'],
                ['EPSG:32188', 'EPSG:32188 MTM Zone 8', '"547634.4199, 5472503.3319" <br> en mètres'],
                ['EPSG:32189', 'EPSG:32189 MTM Zone 9', '"765498.5383, 5486507.4448" <br> en mètres'],
                ['EPSG:32190', 'EPSG:32190 MTM Zone 10', '"983164.2090, 5509255.6947" <br> en mètres']
            ]
        });
        
         this.separateurStore = new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            data : [
                ['COMMA', ','],
                ['SEMICOLON', ';'],
                ['TAB', '*tabulation*'],
                ['SPACE', '*espace*']                
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
            
        if(this.options.formatSupporte){
            var records = [];
            for(i=0;i<this.oOutputFormatStore.getTotalCount();i++){
                var record = this.oOutputFormatStore.getAt(i);
                if(this.options.formatSupporte.indexOf(record.data.value)===-1){
                    records.push(record);
                }
            }
            this.oOutputFormatStore.remove(records);
        }
        
        
        
    };
    
    /**
     * Afficher le menu d'import
     * @method
     * @name OutilExportFichier#importer
     */
    OutilExportFichier.prototype.exporter = function(){
                
        var that = this;     
       
        var myuploadform= new Ext.FormPanel({
                id: "idFormExport",
                fileUpload: true,
                width: 430,
                autoHeight: true,
                frame: true,
                bodyStyle: 'padding: 10px 10px 10px 10px;',
                standardSubmit:false,
                labelWidth: 200,
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
            title  : this.options.titreFenetre,
            autoHeight : true,
            autoWidth: true,
            items  : [myuploadform],
            modal  : true
        });

        myWin.show();   
        
        this.myWin = myWin;
    };  
    
    /**
     * Obtenir et exporter la sélection
     * @method
     * @name OutilExport#exporter
     * @returns {Boolean}
     */
    OutilExportFichier.prototype.lancerExport = function(){    
         
        var that = this;     
        var geojson;
        this.tabOccu = new Array();       
        var analyseur = new AnalyseurGeoJSON({
            projectionCarte: this.carte.obtenirProjection()
        });
        
        var couchesOccurencesSelect = new Object();

        var fctCallback = function(){
        var nbFichier=0;
            var couchesOccurencesSelectManuel = [];
            var listeCoucheSelect = Ext.getCmp(this.listeCoucheVecteurDispo.id).getValue();

            if(listeCoucheSelect==="") {
                Aide.afficherMessage("Aucune sélection", "Vous devez choisir un type d’élément à exporter.");
                return false;
            }

            $.each(listeCoucheSelect.split(","), function(index, coucheSelect){

                if(coucheSelect === "_selection") {      
                    couchesOccurencesSelectManuel = that.carte.gestionCouches.obtenirOccurencesSelectionnees();
                }
                else {
                    couchesOccurencesSelect[coucheSelect] = that.carte.gestionCouches.obtenirCoucheParId(coucheSelect).obtenirOccurences();
                }
            });                    

            
            //Joindre la sélection manuelle en excluant les sélections de couche du multiselect
            $.each(couchesOccurencesSelectManuel, function(index, coucheSelectManuel) {
                if(couchesOccurencesSelect[index] === undefined)
                {
                     couchesOccurencesSelect[index] = coucheSelectManuel;
                }
            });
            
        this.tabMethod = new Array();
        var combo = this.myWin.getComponent('idFormExport').getComponent('exportOutputFormat');
        var extension = combo.findRecord(combo.valueField||combo.displayField, combo.getValue()).data.extension;
        
        //Pour GPX seulement (groupe en un seul fichier toutes les couches) et ne fonctionne pas bien sinon avec le module de conversion
        if(this.obtenirValeursSaisie()['exportOutputFormat'] == "gpx"){
                this.tabOccu = new Array(); 
                $.each(couchesOccurencesSelect, function(index, couche) {             
                    //Pour chaque occurence de la couche
                    $.each(couche, function(ind, occu) {
                            //convertir les occurence en 4326
                        if(occu.type === "Polygone") {
                            that.tabOccu.push(new Occurence(occu.obtenirExterieur().projeter("EPSG:4326"), occu.proprietes));   
                        }
                        else {
                    that.tabOccu.push(occu.projeter("EPSG:4326"));
                        }
                });            
            });

            if(this.tabOccu.length == 0){
                Aide.afficherMessage("Aucune sélection", "Vous devez sélectionner au moins un élément avant de pouvoir l’exporter.");
                return false;
            }

                geojson = JSON.parse(analyseur.ecrire(this.tabOccu));        
                
                var ua = window.navigator.userAgent;
                var msie = ua.indexOf("MSIE ");

                //SI IE appeler le service Ogre 
                if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./) || true) {
                   that.appelerService(that.options.urlService, JSON.stringify(geojson), "fichier", 1); 
                }
                else
                {                
                    //Autre que IE
            result = togpx(geojson); 

            var lien = document.createElement('a');
            document.body.appendChild(lien); //Nécessaire pour Firefox
            var data = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(result);
            lien.setAttribute('href', data);
            lien.setAttribute('download', "fichier.gpx");
            lien.click();
        }
            }
        else{       
        //Pour chaque couches dans la carte 
        $.each(couchesOccurencesSelect, function(index, couche) {             
            that.tabOccu = new Array(); 
            
            //Pour chaque occurence de la couche
            $.each(couche, function(ind, occu) {
                    //convertir les occurence en 4326
                that.tabOccu.push(occu.projeter("EPSG:4326"));
            }); 
            
            /*Si des occurences sont sélectionnées pour la couche, on les convertit en json et on appelle la fonction
             * de conversion en shapeFile
             */
            if(that.tabOccu.length !== 0){
                        var nomFichier;
                geojson = JSON.parse(analyseur.ecrire(that.tabOccu));
                        //Ogre ne gère pas l'extension zip automatiquement contrairement aux autres formats
                        if(extension === "zip") {
                            nomFichier = index+"."+extension;
                        }
                        else {
                            nomFichier = index;
                        }
                        
                        
                        that.appelerService(that.options.urlService, JSON.stringify(geojson), nomFichier, nbFichier);
                nbFichier++;
            }
        });
        
        //Si aucun fichier n'a été créé
        if(nbFichier === 0){
            Aide.afficherMessage("Aucune sélection", "Vous devez sélectionner au moins un élément avant de pouvoir l’exporter.");
            return false;
        }             
        }
                      
            Aide.cacherMessageChargement();
            
        };

        Aide.afficherMessageChargement();  
        //Ajouter un délai car le message de chargement n'a pas le temps de s'afficher si la sélection des occurences est trop volumineuse
        setTimeout(fctCallback.bind(this), 100); 
    };  
      
      /**
     * Appeler le service qui retournera les géométries sélectionnés de la couche dans un fichier selon le format sélectionné
     * @method
     * @name OutilExport#appelerService
     * @param {string} url URL du service à de conversion 
     * @param {json} json contenant les géométries à convertir
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
            if($("#iframeExport"+nbFichier-1)){
                $("#iframeExport"+nbFichier-1).remove();
            }
            
            /*Créer un iframe qui contiendra le form qui servira à soumettre les paramètres aux services de conversion
             * On doit faire ainsi afin de nous permettre de retourner plusieurs fichiers.
             */
            var iframe = $('<iframe id="iframeExport"'+nbFichier+ ' style="visibility: collapse;"></iframe>');
            $('body').append(iframe);
            var content = iframe[0].contentDocument;
                 
            var inputs = '';
            
            inputs+='<textarea id="json" class="form-control" type="hidden" name="json">'+ json +'</textarea>';
            if(this.obtenirValeursSaisie()['exportOutputFormat'])
                inputs+='<textarea id="formatOutput" class="form-control" type="hidden" name="formatOutput">'+ this.obtenirValeursSaisie()['exportOutputFormat'] +'</textarea>';
            
            if(this.obtenirValeursSaisie()['exportEPSGOutput'] && this.convertSrs === true)
                inputs+='<textarea id="targetSrs" class="form-control" type="hidden" name="targetSrs">'+ this.obtenirValeursSaisie()['exportEPSGOutput'] +'</textarea>';
            
            if(this.srsSource && this.convertSrs === true)
                inputs+='<textarea id="sourceSrs" class="form-control" type="hidden" name="sourceSrs">'+ this.srsSource +'</textarea>';
            
            if(outputName){
                inputs+='<input id="name" name="outputName" value="' + outputName + '" class="form-control">';
            }
            
            if(this.obtenirValeursSaisie()['exportSeparateurId'])
                inputs+='<textarea id="separateurOutput" class="form-control" type="hidden" name="separateurOutput">'+ this.obtenirValeursSaisie()['exportSeparateurId'] +'</textarea>';
            
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
     * Obtenir les items du panneau
     * @method 
     * @name OutilExportFichier#obtenirItemsForm
     * @returns {array} 
    */
    OutilExportFichier.prototype.obtenirItemsForm = function() {
    
        var that = this
        
        var szDefaultOutputFormat = this.oOutputFormatStore.data.items[0].data.value;
        var oOutputFormatComboBox = new Ext.form.ComboBox({
            id : 'exportOutputFormat',
            fieldLabel: this.options.libelleFormatOutput,
            store: this.oOutputFormatStore,
            valueField: 'value',
            value: szDefaultOutputFormat,
            displayField:'text',
            editable: false,
            mode: 'local',
            triggerAction: 'all',
            lazyRender: true,
            lazyInit: false,
            listWidth: 125
        });
        
        this.convertSrs = true;
        
        oOutputFormatComboBox.on( 'select', function(combo, record, index ) {   
            
            that.convertSrs = true;
            
            if(record.data.extension === "georss" || record.data.extension === "kml" || 
                record.data.extension === "gpx" ){
                this.ownerCt.getComponent("exportEPSGOutput").setDisabled(true);
                this.ownerCt.getComponent("exportEPSGOutput").setValue("EPSG:4326");        
                that.convertSrs = false;
                
            }else{
                this.ownerCt.getComponent("exportEPSGOutput").setDisabled(false);
            }
                
            if(record.data.extension === "csv"){
                this.ownerCt.getComponent("exportSeparateurId").setVisible(true);
            }else{
                this.ownerCt.getComponent("exportSeparateurId").setVisible(false);
            }
            
        });
        
        var szDefaultEPSG = this.oEPSGStore.data.items[0].data.value;
        var oEPSGComboBox = new Ext.form.ComboBox({
            id : 'exportEPSGOutput',
            fieldLabel: 'Système de coordonnées'+(this.options.exampleCoordonnee === true ?  '<br>Ex. :'+ this.oEPSGStore.data.items[0].data.exemple : ""),
            store: this.oEPSGStore,
            valueField: 'value',
            value: szDefaultEPSG,
            displayField:'text',
            editable: false,
            mode: 'local',
            triggerAction: 'all',
            lazyRender: true,
            lazyInit: false,
            listWidth: 175
        });
        
        oEPSGComboBox.on( 'select', function(combo, record, index ) {   
            combo.label.update("Système de coordonnée <br>Ex. :"+record.data.exemple);
        });
        
        var separateurDefaut = this.separateurStore.data.items[0].data.value;
        var separateurComboBox = new Ext.form.ComboBox({
            id : 'exportSeparateurId',
            fieldLabel: 'Séparateur',
            store: this.separateurStore,
            valueField: 'value',
            value: separateurDefaut,
            displayField:'text',
            editable: false,
            mode: 'local',
            triggerAction: 'all',
            lazyRender: true,
            lazyInit: false,
            listWidth: 75,
            hidden : false
        });
        
        
        var listeObjCouche = this.carte.gestionCouches.obtenirCouchesParType("Vecteur");       
        
        var dataCouche = [["_selection", "Éléments sélectionnés"]];
        $.each(listeObjCouche, function(index, objCouche){
            dataCouche.push([objCouche.id, objCouche.options.titre]);
        });
        
        var asListeCouche = new Ext.data.ArrayStore({
            data: dataCouche,
            fields: ['value','display'],
            sortInfo: {
                field: 'value',
                direction: 'ASC'
            }
        });
        
        var listeCoucheVecteurDispo = {
           // anchor: '100%',
            width: 186,
            height: 100,
            xtype: 'multiselect',
            msgTarget: 'side',
            fieldLabel: 'Éléments à exporter',
            name: 'multiselect',
            id: 'outilExportFichierMultiSelect',
            store: asListeCouche,
            valueField: 'value',
            displayField: 'display',
            listConfig: {
                itemTpl: '<div class="inner-boundlist-item {color}">{numberName}</div>',
            }
        };
        
        this.listeCoucheVecteurDispo = listeCoucheVecteurDispo;
        
         return [listeCoucheVecteurDispo, oOutputFormatComboBox, oEPSGComboBox, separateurComboBox];
    };
    
    /** 
     * Obtenir les valeurs des champs de saisie.
     * @method 
     * @name OutilExportFichier#obtenirValeursSaisie
     * @returns {array} Tableau des valeurs de saisie
     */
    OutilExportFichier.prototype.obtenirValeursSaisie = function() {
        //Retourner la valeur des éléments contenus dans le formulaire
        return  this.myWin.getComponent("idFormExport").getForm().getFieldValues();
    };
  
    return OutilExportFichier;
    
});