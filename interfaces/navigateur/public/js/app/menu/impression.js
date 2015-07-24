/** 
 * Module pour l'objet {@link Panneau.Impression}.
 * @module impression
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires panneau
 * @requires wms2pdf
 */

require.ajouterConfig({
    paths: {
        kmlMsp: "libs/extension/OpenLayers/kmlMsp"
    },
});

if(!require.estDansConfig("fileUploadField")){   
    require.ajouterConfig({
        paths: {
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

define(['panneau', 'aide', 'kmlMsp', 'fileUploadField'], function(Panneau, Aide) {
    /** 
     * Création de l'object Panneau.Impression.
     * Objet à ajouter à un panneauMenu.
     * @constructor
     * @name Panneau.Impression
     * @class Panneau.Impression
     * @alias impression:Panneau.Impression
     * @extends Panneau
     * @requires impression
     * @returns {Panneau.Impression} Instance de {@link Panneau.Impression}
    */
    function Impression(options){
        this.options = options || {};
        
        //todos
        this.defautOptions.service=  Aide.obtenirUrlServices() + "impression/printIGO.php";
         
        this.separator = "&";
        this.aszPrintableLayerTypes = [
            "OpenLayers.Layer.WMS",
            "OpenLayers.Layer.WMS.Untiled",
            "OpenLayers.Layer.MapServer",
         //   "OpenLayers.Layer.OpenLayers"
        ];
    };
    
    Impression.prototype = new Panneau();
    Impression.prototype.constructor = Impression;
    
    /** 
     * Initialisation de l'object Impression. 
     * @method 
     * @name Impression#_init
    */
    Impression.prototype._init = function(){
        this.wms2pdf();
        this._panel = {						
            title: 'Impression', 
            id: 'widgetImpression',
            hidden: false,
            border: true,
            width: 200,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            autoScroll: true,
            items:[this.printForm]
        };
    };


    Impression.prototype.wms2pdf = function(){
        var that=this;
        // outputformat
        var oOutputFormatStore = new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            data : [['img', 'Image'],['pdf', 'Document PDF']]
        });
        var szDefaultOutputFormat = oOutputFormatStore.data.items[0].data.value;
        var oOutputFormatComboBox = new Ext.form.ComboBox({
            id : 'printOutputFormat',
            fieldLabel: 'Format',
            store: oOutputFormatStore,
            valueField: 'value',
            value: szDefaultOutputFormat,
            displayField:'text',
            editable: false,
            mode: 'local',
            triggerAction: 'all',
            lazyRender: true,
            lazyInit: false,
            listWidth: 150,
            submitValue: false
    });

    oOutputFormatComboBox.on('change', function(){
        var nKey =  that.printForm.items.indexOfKey("printComments");
    });

    // paper size
    var oPaperStore = new Ext.data.SimpleStore({
        fields: ['value', 'text'],
        data : [
                ['LETTER', 'Lettre	8.5 X 11'],
                ['LEGAL', 'Legal	8.5 X 14'],
                ['LEDGER', 'Tabloid	11 X 17'],
                ['A1', 'A1	23 X 33'],
                ['ANSI E', 'ANSI E	34 X 44'],
                ['Personalisé', 'Personalisé']
        ]
    });
    var szDefaultPaper = oPaperStore.data.items[0].data.value;

    var oPaperComboBox = new Ext.form.ComboBox({
        id : 'printPaper',
        fieldLabel: 'Format papier',
        store: oPaperStore,
        valueField: 'value',
        value: szDefaultPaper,
        displayField:'text',
        editable: false,
        mode: 'local',
        triggerAction: 'all',
        lazyRender: true,
        lazyInit: false,
        listWidth: 150,
        submitValue: false
    });
    
    var widthNumberField = new Ext.form.NumberField({
    	id: 'width',
        fieldLabel: 'Largeur',
        name: 'width',
        decimalPrecision:1,
        value: 11,
        minValue:8.5,
        maxValue:44,
        submitValue: false
    });
    widthNumberField.setDisabled(true);
    
    var heightNumberField = new Ext.form.NumberField({
    	id:'height',
        fieldLabel: 'Hauteur',
        name: 'height',
        decimalPrecision:1,
        value:8.5,
        minValue:8.5,
        maxValue:44,
        submitValue: false
    });
    heightNumberField.setDisabled(true);
    
    // When the paper selection changes, update the width & height NumberFields.
    oPaperComboBox.on( 'select', function() {   
    		updatePaperNumberFields();
        });
    
    function updatePaperNumberFields(){
		var paper = oPaperComboBox.getValue();
		var orientation = oOrientationComboBox.getValue();
		
		var width = widthNumberField.getValue();
		var height = heightNumberField.getValue();
		
		if(paper == "Personalisé"){
			widthNumberField.setDisabled(false);
			heightNumberField.setDisabled(false);
		}
		else{
			if(paper == "LETTER"){
				width = 8.5;
				height = 11;
			}else if(paper == "LEGAL"){
				width = 8.5;
				height = 14;
			}else if(paper == "LEDGER"){
				width = 11;
				height = 17;
			}else if(paper == "A1"){
				width = 23;
				height = 33;
			}else if(paper == "ANSI E"){
				width = 34;
				height = 44;
			}
			widthNumberField.setDisabled(true);
			heightNumberField.setDisabled(true);
			
			if(orientation == "landscape"){
				// Invert width & height
				var buffer = width;
				width = height;
				height = buffer;
			}
		}		
		widthNumberField.setValue(width);
		heightNumberField.setValue(height);		
    }
    
    // paper orientation
    var oOrientationStore = new Ext.data.SimpleStore({
        fields: ['value', 'text'],
        data : [['landscape', 'Paysage'],
                ['portrait', 'Portrait']]
    });
    var szDefaultOrientation = oOrientationStore.data.items[0].data.value;

    var oOrientationComboBox = new Ext.form.ComboBox({
        id : 'printOrientation',
        fieldLabel: 'Orientation',
        store: oOrientationStore,
        valueField: 'value',
        value: szDefaultOrientation,
        displayField:'text',
        editable: false,
        mode: 'local',
        triggerAction: 'all',
        lazyRender: true,
        lazyInit: false,
        listWidth: 150,
        submitValue: false
    });
    
    // When the PaperComboBox value changes, update the paper number fields.
    oOrientationComboBox.on( 'select', function() {   
            updatePaperNumberFields();
    });

    // units
    var oUnitsStore = new Ext.data.SimpleStore({
        fields: ['value', 'text'],
        data : [['default', 'Celle de la carte'],
                ['in', 'Pouces'],['ft', 'Pieds'],['mi', 'Miles'],
                ['m', 'Mètres'],['km', 'Kilomètres'],['dd', 'Degrés']]
    });
    var szDefaultUnits = oUnitsStore.data.items[0].data.value;

    var oUnitsComboBox = new Ext.form.ComboBox({
        id : 'printUnits',
        fieldLabel: 'Unité',
        store: oUnitsStore,
        valueField: 'value',
        value: szDefaultUnits,
        displayField:'text',
        editable: false,
        mode: 'local',
        triggerAction: 'all',
        lazyRender: true,
        lazyInit: false,
        listWidth: 150,
        submitValue: false
    });
    
     // units
    var oLegendeLocation = new Ext.data.SimpleStore({
        fields: ['value', 'text'],
        data : [['UR', 'Haut-droit'],
                ['UL', 'Haut-gauche'],['LR', 'Bas-droit'],['LL', 'Bas-gauche']]
    });
    var szDefaultLegendeLocation = oLegendeLocation.data.items[0].data.value;

    var oLegendeLocationComboBox = new Ext.form.ComboBox({
        id : 'printLegendeLocation',
        fieldLabel: 'Position de la légende',
        store: oLegendeLocation,
        valueField: 'value',
        value: szDefaultLegendeLocation,
        displayField:'text',
        editable: false,
        mode: 'local',
        triggerAction: 'all',
        lazyRender: true,
        lazyInit: false,
        listWidth: 150,
        submitValue: false,
        hidden: true
    });


    // the form
    this.printForm = new Ext.FormPanel({
        labelWidth: 100, // label settings here cascade unless overridden
        frame:true,
        border: false,
        bodyStyle:'padding:5px 5px 0',
        //width: 298, //enlever MAT 2011-07-18, mis auto-scroll 
        defaults: {width: 150},
        defaultType: 'textfield',
        fileUpload : true,
        items: [{
            fieldLabel: 'Titre',
            id: 'printTitle',
            maxLength: 50,
            submitValue: false
        },{
            xtype: 'textarea',
            fieldLabel: 'Commentaires',
            id: 'printComments',
            height: 100,
            maxLength: 256,
            submitValue: false
        }, 
        oOutputFormatComboBox, 
        oPaperComboBox, 
        widthNumberField,
        heightNumberField, 
        oOrientationComboBox, 
        oUnitsComboBox,
        {
            xtype: 'checkbox',
            id : 'showLegendGraphics',
            fieldLabel : ' Afficher la légende',
            submitValue: false,
             listeners:{
                check: function (checkbox,checked){
                    if(checked){
                        this.ownerCt.items.item("printLegendeLocation").setDisabled(false);
                        this.ownerCt.items.item("printLegendeLocation").setVisible(true);
                        
                    }else{
                        this.ownerCt.items.item("printLegendeLocation").setDisabled(true);
                        this.ownerCt.items.item("printLegendeLocation").setVisible(false);                        
                    }
                }
            }
        },
        oLegendeLocationComboBox,
         {
            xtype: 'checkbox',
            id : 'printDescription',
            fieldLabel : ' Afficher les descriptions (couche vectoriel seulement)',
            submitValue: false
        },
         {
            xtype: 'checkbox',
            id : 'printLogo',
            fieldLabel : ' Afficher les droits',
            submitValue: false,
            listeners:{
                check: function (checkbox,checked){
                    if(checked){
                        this.ownerCt.items.item("printLogoPath").setDisabled(false);
                        this.ownerCt.items.item("printNomAuteur").setVisible(true);
                        this.ownerCt.items.item("printLogoPath").setVisible(true);  
                        
                    }else{
                         this.ownerCt.items.item("printLogoPath").setDisabled(true);
                        this.ownerCt.items.item("printNomAuteur").setVisible(false);
                        this.ownerCt.items.item("printLogoPath").setVisible(false);
                        
                    }
                }
            }
        },
        {
            fieldLabel: 'Auteur',
            id: 'printNomAuteur',
            maxLength: 50,
            hidden: true,
            submitValue: false,
        },
         {
            xtype: 'fileuploadfield',
            id: 'printLogoPath',
            emptyText: 'Sélectionner un fichier ...',
            fieldLabel: 'Logo',
            buttonText: 'Fichier',
            hidden: true,
            submitValue: false,
            listeners: {
                fileselected: function(inputNode,fileInput){
                    inputNode.setValue(fileInput.replace("C:\\fakepath\\", ""));

                }
            }
        }
        
        ],
        buttons: [{
            id: 'printButton',
            text: 'Imprimer',
            tooltip: 'Générer un fichier pdf de la carte présente',
            handler: function(){
                that.printMap();               
            }
        },{
            text: 'Restaurer',
            tooltip: 'Réinitialiser les valeurs des champs',
            handler: function(){
                that.printForm.getForm().reset();
            }
        }]
    });
    
    this.printForm.on('beforeaction', function(form, action) {
        if (action.type == 'submit') {

            //Vérifie qu'on doit réellement envoyé le fichier.
            if(form.items.get("printLogo").checked == false || 
                    form.items.get("printLogoPath").value == "" ||
                    typeof(form.items.get("printLogoPath").value) == "undefined"){
                form.items.get("printLogoPath").setDisabled(true);
            }

            return true;
        }
    });
    
    this.printForm.on('actionfailed', function(form, action) {
        if (action.type == 'submit') {
           form.items.get("printLogoPath").setDisabled(false);
           return true;
        }
    });
    
     this.printForm.on('actioncomplete', function(form, action) {
        if (action.type == 'submit') {
           form.items.get("printLogoPath").setDisabled(false);
           return true;
        }
    });
    
}

/**
 * Function: printMap
 *
 * Get all visible and printable layers currently on map.  Get all required
 * parameters and build a request url string to be putted in a Ext.Window that
 * contains an iframe.  The actual "printing" (image/pdf generation) is done
 * server-side by the url (wms2pdf.php).
 *
 * In the end, an image or pdf appears in the Ext.Window.  See wms2pdf.php for
 * more details on how the actual "printing" works.
 */
Impression.prototype.printMap = function(){
    
    var vecteursKml = this.exportVecteur(); 
    
    if(vecteursKml != null){
        var aoLayers = this.getPrintableLayers(false);
    }else{
        var aoLayers = this.getPrintableLayers(true);
    }
    

    if(!aoLayers){
        return false;
    }
    
    //Lancer l'impression
    var szURL = this.options.service || this.defautOptions.service;
    /*if (szURL[0]==='/') {
        szURL = szURL.slice(1);
    }*/
        
    var oParams = this.getPrintParams(aoLayers);
    var szTitle = "Création du fichier";
    var szWait = "Création du fichier en cours, veuillez patienter quelques"+
                 " secondes...";

    // STANDARD WAY --> open the url in a new window
    var szParams = OpenLayers.Util.getParameterString(oParams);
    if(szParams.length > 0) {
        szURL += '?' + szParams;
    }

    //var proxy = Aide.obtenirProxy() + '?url=';
    szURL=Aide.utiliserProxy(szURL);

    if(this.printForm.getForm().isValid()){
    
        this.printForm.getForm().submit({
            url: szURL,
            headers: {"Content-type":"multipart/form-data;charset=UTF-8"},
            waitMsg: szWait,
            waitTitle: szTitle,
            params:{
                vecteurs:vecteursKml
            },
            method:'POST',
            scope:this,
            success: function(form, action){
                 this.afficherImpression(action); 
            },
            failure : function (form, action){
               this.afficherImpression(action); 
            }
        });

    }
 
}

Impression.prototype.getPrintableLayers = function(flagVecteur) {
    
    var flagVecteur = (typeof flagVecteur === "undefined") ? true : flagVecteur;
    var aolBase = [], aolOverlays = [], aoLayers;

    var oMap = Igo.nav.carte._carteOL;
    for (var i = 0, len = oMap.layers.length; i < len; i++) {
        var oLayer = oMap.layers[i];
        var coucheIGO = Igo.nav.carte.gestionCouches.obtenirCoucheParId(oLayer.id);
        if (!oLayer.printOptions) {
            if (oLayer.getVisibility() && coucheIGO && (coucheIGO.obtenirTypeClasse()==="Google" || coucheIGO.obtenirTypeClasse()==="OSM")){
                Aide.afficherMessage("Impression", 
                                    "Les couches Google et OpenStreetMap, ne sont pas disponible à l'impression pour des raisons de  droits d'utilisation.", 
                                    "OK", 
                                    "ERREUR");
                return;
            }
            
            if(OpenLayers.Util.indexOf(this.aszPrintableLayerTypes, oLayer.CLASS_NAME) == -1){
                continue;
            }
        }

        if( (OpenLayers.Util.indexOf(this.aszPrintableLayerTypes, oLayer.CLASS_NAME) == -1) &&
           ((!oLayer.printOptions['url'] ||
             !oLayer.printOptions['layers'] ||
             !oLayer.printOptions['mapformat'] ||
             !oLayer.printOptions['format']) ||
            oLayer.printOptions['fromLayer'] == true)){
            continue;
        }

        if (oLayer.isBaseLayer) {

            if (oLayer.getVisibility()) {

                aolBase.push(oLayer);
            }
        } else if (oLayer.inRange && oLayer.getVisibility()) {
            aolOverlays.push(oLayer);
        }
    }

    aoLayers = aolBase.concat(aolOverlays);

    if (aoLayers.length === 0 && flagVecteur) {
       
        Aide.afficherMessage('Impression', "Aucune couche imprimable n'est sélectionnée", 
                                "OK", "ERREUR");
        return;
    }

    return aoLayers;
};

Impression.prototype.getPrintParams = function(aoLayers){
    // Patch pour pallier à  l'erreur de la projection Google avec 
    // le paramètre geodesic à  true dans le GOLOC, voir mantis #	0000874
    var bbox_reprojete = new OpenLayers.Bounds.fromString(Igo.nav.carte._carteOL.getExtent().toBBOX());
    bbox_reprojete.transform(new OpenLayers.Projection('EPSG:900913'), new OpenLayers.Projection('EPSG:32198'));
	
    var hasBaseLayer = false;
    for(var i = 0; i < aoLayers.length; i++){
            if(aoLayers[i].isBaseLayer){
                    hasBaseLayer = true;
                    break;
            }
    }
			
   var oParams = {
        'BBOX':      bbox_reprojete.toBBOX(), // patch mantis #	0000874
        'SRS':       "EPSG:32198", // patch mantis #	0000874
        'SCALE':     Igo.nav.carte._carteOL.getScale(),
        'MAPFORMAT': 'png',
	'LAYERS':    this.getLayersPrintOption(aoLayers, "layers"),
        'TITLE':    this.getLayersPrintOption(aoLayers, "title"),
	'TIME':    	 this.getLayersPrintOption(aoLayers, "time"),
        'URLS':      this.getLayersPrintOption(aoLayers, "url"),
        'FORMAT':    this.getLayersPrintOption(aoLayers, "format"),
        'OPACITY': 	 this.getLayersPrintOption(aoLayers, "opacity"),
	'HASBASELAYER' : hasBaseLayer        
    };
    
    // user parameters
    var aoElements, nElements;
    aoElements = this.printForm.items.items;
    for (var i=0, len=aoElements.length; i<len; i++){
        oElement = aoElements[i];
        oParams[oElement.getId()] = oElement.getValue();

        if(oElement.getId() == "printOutputFormat"){
            szOutputFormat = oElement.getValue();
            switch(szOutputFormat){
              case "pdf":
                this.szWindowTitle = "Présente carte en PDF.";
                break;
              default:
                this.szWindowTitle = "Présente carte en image.  Clique droit "+
                                "sur l'image pour la sauvegarder.";
            }
        }else if(oElement.getId() == "printPaper" || oElement.getId() == "printOrientation"){
        	// Do not send the print paper/orientation, this is application specific, 
        	// the services requires a width and a height parameter and does not know about the paper formats.
        	continue;
        }
    }
    return oParams;
}

Impression.prototype.getLayersPrintOption = function(aoLayers, szOption){
    var szOptionValues = "";

	for (var i=0, len=aoLayers.length; i<len; i++) {
            var oLayer = aoLayers[i];

            if(i>0){
                szOptionValues += '#';
            }

            szOptionValues += this.getLayerPrintOption(oLayer, szOption);

            //Changer les urls de layers pour que ça soit en http
            if ( szOption == 'url'){
                szOptionValues.replace(/https:\/\//gi, /*Aide.obtenirHote() + Aide.utiliserProxy() +*/ 'https://');
            }
	}
	
    return szOptionValues;
}

/**
 * Function: getLayersPrintOption
 *
 * Return a given print option value of a layer.  Each layer type and option
 * type is treated separately.
 *
 * Parameters:
 * oLayer   - {<OpenLayers.Layer>}  A printable OpenLayer.Layer object
 * szOption - {string}              A possible option of the layer printOptions
 *                                  properties.  See readme at beginning for
 *                                  for more details.
 *
 * Returns:
 * {string}  Layer print option needed for the server-side printing script
 * 
 */
Impression.prototype.getLayerPrintOption = function(oLayer, szOption){
    var szOptionValue = oLayer.printOptions[szOption];
    if(szOptionValue){
        switch(szOption){
            case "url":
                if(szOptionValue.substring(0,1) == "/"){
                    //Call fait pas le server donc pas de https
                    szOptionValue = Aide.obtenirHote() + szOptionValue;
                }
            break;               
        }
        
        return szOptionValue;
    }

    switch(szOption){

        case "url":
            var szURL;
            if (oLayer.url instanceof Array && oLayer.url.length > 1){
                szURL = oLayer.url[0];
            } else {
                szURL = oLayer.url;
            }
            var oParam = OpenLayers.Util.upperCaseObject(oLayer.params);
            var szMap = oParam.MAP;

            // if the layer has a 'map' param and it is not in the url, add it.
            if (szMap &&
                (szURL.indexOf('map=') == -1 || szURL.indexOf('MAP=') == -1)){
                var szMapParam = "map="+szMap;
                szURL += szMapParam + this.separator;
            }

            if(szURL.substring(0,1) == "/"){
                szURL = Aide.obtenirHote() + szURL;
            }

            szOptionValue = szURL;
            break;

        case "layers":
            var oParam = OpenLayers.Util.upperCaseObject(oLayer.params);
            szOptionValue = oParam.LAYERS;
            break;

        case "format":
            switch(oLayer.CLASS_NAME){
                case "OpenLayers.Layer.WMS":
                case "OpenLayers.Layer.WMS.Untiled":
                    szOptionValue = oLayer.params.FORMAT;
                    break;
                case "OpenLayers.Layer.MapServer":
                    szOptionValue = oLayer.params.map_imagetype;
                    break;
            }
            break;

        case "mapformat":
            szOptionValue = 'png';
            break;

        case "opacity":
            szOptionValue = oLayer.opacity;
            break;

        case "time":
                if (oLayer.params['TIME']){
                szOptionValue = oLayer.params['TIME'];
                }else{
                szOptionValue = "null";
                }
        break;
                
        case "title":
            szOptionValue = oLayer.name;
            break;
                
    }    

    return szOptionValue;
}

Impression.prototype.exportVecteur = function(){

    var dataConvertie;
    
    var vecteurCouches = Array();

    
    var vecteurCouchesIgo = Igo.nav.carte.gestionCouches.obtenirCouchesParType('Vecteur');
    $.each(vecteurCouchesIgo, function(key, layer){
        if(layer.estActive()){
            vecteurCouches.push(layer);
        }
    });
    
    if(vecteurCouches.length == 0){
        return null;
    }else{
        var kmlWriter = new OpenLayers.Format.KML_MSP({
            extractStyles: true,   
            extractAttributes: true,   
            externalProjection: new OpenLayers.Projection("EPSG:4326"),
            internalProjection: Igo.nav.carte._carteOL.getProjectionObject(),
            foldersName: 'vecteur',
            placemarksDesc: "",
            foldersDesc: "Exporté le " + new Date()
        });
    
        dataConvertie = kmlWriter.writeLayers(vecteurCouches);

        return dataConvertie;
    }
    
};

Impression.prototype.afficherImpression = function(action){
    
    oMapComponent = Igo.nav.obtenirPanneauxParType('PanneauCarte')[0]._getMapComponent();
    var nWinHeight = oMapComponent.getSize().height;
    var nWinWidth = oMapComponent.getSize().width;
    var nIFrameHeight = nWinHeight - 32;
    var nIFrameWidth = nWinWidth - 15;

    var mConfig = { 
        mediaType   :'PDF', 
        url         : 'temp.pdf',//pdf file path
        unsupportedText : 'Acrobat Viewer is not Installed',
        resizable   : true
    };

     var htmlContent = null;
     
    var afficherItineraire = true;
    if(afficherItineraire && $('#itineraire').css('display') === 'block'){
        var itineraire = $('#itineraire').clone();
        itineraire.find('.button').remove();
        htmlContent = "<div id='impressionItineraire'> <a href='#' onClick='window.stop(); window.print()'> Imprimer </a>"+
                itineraire.html()+"</div><br/><img src=" + action.response.responseText+"> ";
        
        var myWindow = window.open('','','scrollbars=1,width=800,height=800');
        myWindow.document.write('<html><head>');
        myWindow.document.write('<title>' + 'Impression' + '</title>');
        myWindow.document.write('<link rel="Stylesheet" type="text/css" href="'+Aide.obtenirCheminRacine()+'css/itineraire.css?version=0.2.0" />');
        myWindow.document.write('</head><body>');
        myWindow.document.write(htmlContent);
        myWindow.document.write('</body></html>');
        return true;
    } else if(action.response.responseText.indexOf("html") == -1){
        htmlContent = "<iframe src=" + action.response.responseText + " width='" + nIFrameWidth + "px' height='"+nIFrameHeight+"px'> ";
    }else{
        htmlContent = action.response.responseText;
    }

    this.oPDFWindow = new Ext.Window({
            title    : this.szWindowTitle,
            closable : true,
            width    : nWinWidth,
            height   : nWinHeight,
            border : false,
            modal: true,
            plain    : true,
            resizable : true,
            constrain: true,
            region: 'center',
            mediaCfg : mConfig,
            xtype: 'application/pdf',
            //height:'fit',
            hidden: false,
            autoScroll: true ,
            items: [{
                    html: htmlContent,
                    border: false
            }]
    });
    var oPrintButton = Ext.get('printButton');
    Ext.MessageBox.hide();
    this.oPDFWindow.show(oPrintButton); 
};

return Impression;
    
});
