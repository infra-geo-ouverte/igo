/** 
 * Module pour l'objet {@link Panneau.Impression}.
 * @module impression
 * @author  Michael Lane, FADQ /Inspiré du module d'impression Igo
 * @version 1.0
 * @requires panneau
 */

define(['panneau', 'aide', 'browserDetect'], function(Panneau, Aide, BrowserDetect) {
    /** 
     * Création de l'object Panneau.Impression.
     * Objet à ajouter à un panneauMenu.
     * @constructor
     * @name Panneau.Impression
     * @class Panneau.Impression
     * @alias impression:Panneau.Impression
     * @extends Panneau
     * @requires impression
     * @param {Objet} options options
     * @returns {Panneau.Impression} Instance de {@link Panneau.Impression}
    */
    function Impression(options){
        this.options = options || {};       
        this.aszPrintableLayerTypes = [
            "WMS",
            "WMTS"
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
        this.genererPanneau();
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

    /**
     * Générer les éléments du panneau d'impression
     * @method
     * @name Impression#genererPanneau
     */
    Impression.prototype.genererPanneau = function(){
        var that=this;       
    // paper size
    var oPaperStore = new Ext.data.SimpleStore({
        fields: ['value', 'text'],
        data : [
                ['LETTER', 'Lettre	8.5 X 11'],
                ['LEGAL', 'Legal	8.5 X 14']
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

        if(paper === "Personalisé"){
                widthNumberField.setDisabled(false);
                heightNumberField.setDisabled(false);
        }
        else{
            if(paper === "LETTER"){
                    width = 8.5;
                    height = 11;
            }else if(paper === "LEGAL"){
                    width = 8.5;
                    height = 14;
            }else if(paper === "LEDGER"){
                    width = 11;
                    height = 17;
            }else if(paper === "A1"){
                    width = 23;
                    height = 33;
            }else if(paper === "ANSI E"){
                    width = 34;
                    height = 44;
            }
            widthNumberField.setDisabled(true);
            heightNumberField.setDisabled(true);

            if(orientation === "landscape"){
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

    // the form
    this.printForm = new Ext.FormPanel({
        labelWidth: 100, // label settings here cascade unless overridden
        frame:true,
        border: false,
        bodyStyle:'padding:5px 5px 0',
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
            height: 200,
            maxLength: 256,
            submitValue: false
        }, 
        {
            xtype: 'checkbox',
            id : 'showLegendGraphics',
            fieldLabel : ' Afficher la légende',
            submitValue: false
        },
        oPaperComboBox, 
        widthNumberField,
        heightNumberField, 
        oOrientationComboBox, ],
        buttons: [{
            id: 'printButton',
            text: 'Imprimer',
            tooltip: 'Imprimer la carte',
            handler: function(){
                that.imprimerCarte();               
            }
        },{
            text: 'Restaurer',
            tooltip: 'Réinitialiser les valeurs des champs',
            handler: function(){
                that.printForm.getForm().reset();
            }
        }]
    });
};



/**
    * Obtenir les options d'impression pour une série de couche
    * @method
    * @name Impression#getPrintableLayers
    * @param {boolean} flagVecteur signifie si des couches vecteurs sont présentes
    * @returns {couche[]} aoLayers série de couche à imprimer
    */
Impression.prototype.getPrintableLayers = function(flagVecteur) {

    var flagVecteur = (typeof flagVecteur === "undefined") ? true : flagVecteur;
    var aolBase = [], aolOverlays = [], aoLayers;

    var oMap = Aide.obtenirNavigateur().carte._carteOL;
    var layers = Aide.obtenirNavigateur().carte.gestionCouches.obtenirCouches(true);
    for (var i = 0, len = layers.length; i < len; i++) {
        var coucheIGO = layers[i];
        if (!coucheIGO._layer.printOptions) {
            if (coucheIGO.estActive() && (coucheIGO.obtenirTypeClasse()==="Google")){
                Aide.afficherMessage("Impression",
                                    "Les couches Google ne sont pas disponible à l'impression pour des raisons de  droits d'utilisation.",
                                    "OK",
                                    "ERREUR");
                return;
            }

            if(OpenLayers.Util.indexOf(this.aszPrintableLayerTypes, coucheIGO.obtenirTypeClasse()) === -1){
                continue;
            }
        }

        if( (OpenLayers.Util.indexOf(this.aszPrintableLayerTypes, coucheIGO.obtenirTypeClasse()) === -1) &&
          ((!coucheIGO._layer.printOptions['url'] ||
             !coucheIGO._layer.printOptions['layers'] ||
             !coucheIGO._layer.printOptions['mapformat'] ||
             !coucheIGO._layer.printOptions['format']) ||
            coucheIGO._layer.printOptions['fromLayer'] === true)){
            continue;
        }

        if (coucheIGO.estFond()) {

            if (coucheIGO.estActive()) {
                aolBase.push(coucheIGO);
            }
        } else if (coucheIGO.estDansPortee() && coucheIGO.estActive()) {
            aolOverlays.push(coucheIGO);
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

/**
 * Imprimer la carte
 * @method
 * @name Impression#imprimerCarte
 */
Impression.prototype.imprimerCarte = function(){  
    var navigateur = Aide.obtenirNavigateur();
    Aide.afficherMessageChargement({titre: "Préparation de l'impression", message: "Veuillez patienter..."});

    navigateur.carte.exporterImage(this.genererImpression.bind(this));       
};
    
/**
 * Générer une impression optimisé pour l'image de la carte
 * @method 
 * @name Impression#genererImpression
 * @param {object} canvas Image de la carte
 */    
Impression.prototype.genererImpression = function(canvas)
{ 
    
    var that = this;
    var carte = Aide.obtenirNavigateur().carte;
    var echelle = carte.obtenirEchelle(true);
    var proj = carte.obtenirProjection();

    var opt = this.printForm.getForm().getFieldValues();
    var orientation = opt.printOrientation;
    var formatPapier = opt.printPaper;

    var heightImg,widthImg, paperMax, paperSize, widthMM, heightMM;
    var correctionAjouts = 42;
    if (opt.printTitle) {
        correctionAjouts += 23;
    }

    if (opt.printComments) {
        correctionAjouts += 18; // valide seulement pour une ligne
    }

    if(formatPapier == "LETTER")
    {
        paperMax = 1200;
        paperSize = "letter";
        
        if(orientation == "portrait")
        {
           paperSize = "8.5in 11in";
           widthMM = "216mm";
           heightMM = "279mm";
        }
        else
        {
            paperSize = "11in 8.5in";
            widthMM = "279mm";
            heightMM = "216mm";
        }
    }
    else if(formatPapier == "LEGAL")
    {
        paperMax = 1400;
       
        if(orientation == "portrait")
        {
           paperSize = "8.5in 14in";
           widthMM = "216mm";
           heightMM = "356mm";           
        }
        else
        {
            paperSize = "14in 8.5in";
            widthMM = "356mm";
            heightMM = "216mm";
        }
    }

    if(orientation == "landscape")
    {
        var FIXHEIGHT = 700 - correctionAjouts;
        var FIXWIDTH = paperMax;
    }
    else
    {
       var FIXHEIGHT = paperMax - correctionAjouts; 
       var FIXWIDTH = 700;
    }

    var height = canvas.height;
    var width = canvas.width;

    if(height>width)
    {
        heightImg=FIXHEIGHT;
        widthImg = Math.round((heightImg/height)*width);
        
        if(widthImg>FIXWIDTH)
        {
            widthImg=FIXWIDTH;
            heightImg =  Math.round((widthImg/width)*height);
        }
    }
    else
    {
        widthImg=FIXWIDTH;
        heightImg =  Math.round((widthImg/width)*height);
        
        if(heightImg>FIXHEIGHT)
        {
            heightImg=FIXHEIGHT;
            widthImg =  Math.round((heightImg/height)*width);
        }
    }

    canvas.style.height = heightImg;
    canvas.style.width = widthImg;

    
    var printLayer = $("#printLayer");
  
    if (!printLayer.length) {
        var printLayerText = '<div id="printLayer" style="display:none;"> </div>';
        $("body").append(printLayerText);
        printLayer = $("#printLayer");
    } else {
        printLayer.empty();
    }

    if (opt.showLegendGraphics) {
        var existLegend = false;
        var legend = "<div class='printLegend'>";
        legend += "<b><u>Légende</u></b><br/>";
        var aoLayers = this.getPrintableLayers(true);
        $.each(aoLayers, function(key, layer) {
          if (!layer.estFond()) {
            existLegend = true;
            legend += "<span>" + layer.options.titre + "</span><br/>";
            legend += "<img class='printImageLegend' src='" + layer.options.url + "?scale=" + carte.obtenirEchelle() + "&TRANSPARENT=TRUE&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layer.options.nom + "'></img>";
            legend += "<br/>";
          }
        });
        legend += "</div>";
        if (existLegend) {
          printLayer.append(legend);
        }
    }


    html = '<div id="media-print-igo" style="max-width:'+widthImg+'px;>';
    html += '<h1 class="printTitle"><center>' +opt.printTitle+ '</center></h1>';
    html += '<center><img height=' + heightImg + ' width= ' + widthImg + ' src="' + canvas.toDataURL("image/png") + '" /></center>';
    html += '<br><p>' + opt.printComments + '</p>';
    html += "<p><i>Projection: " + proj + "&nbsp;&nbsp;&nbsp;Échelle ~ 1 : " + echelle + "</i></p>";    
    html += '<div id="printLayer">' + printLayer.html() + '</div>';
    html += "</div>";

    $('body').append(html);


    var createCanvasPrint = function(){
        html2canvas($('#media-print-igo')[0]).then(function(canvas2) {
            $("#media-print-igo").remove();

            if(orientation == "landscape")
            {
                var FIXHEIGHT = 700;
            }
            else
            {
               var FIXHEIGHT = paperMax; 
            }

            var height = canvas2.height;
            var width = canvas2.width;

            if(height>width)
            {
                heightImg=FIXHEIGHT;
                widthImg = Math.round((heightImg/height)*width);
                
                if(widthImg>FIXWIDTH)
                {
                    widthImg=FIXWIDTH;
                    heightImg =  Math.round((widthImg/width)*height);
                }
            }
            else
            {
                widthImg=FIXWIDTH;
                heightImg =  Math.round((widthImg/width)*height);
                
                if(heightImg>FIXHEIGHT)
                {
                    heightImg=FIXHEIGHT;
                    widthImg =  Math.round((heightImg/height)*width);
                }
            }

            canvas2.style.height = heightImg;
            canvas2.style.width = widthImg;

            var html  = '<html><head><title>Impression</title>';
            html += '<link rel="stylesheet" href="' + Aide.obtenirCheminRacine() + 'css/print.css?version=1.1.0.8" type="text/css">';
            html += '<style type="text/css" media="print">@page { size: ' + paperSize + '; }' +
                       '@media print {body { width: ' + widthMM + '; height: ' + heightMM + '; }</style>';
            html += '<script> function savePrintImage(e) {var a = document.createElement("a"); a.href="' + canvas2.toDataURL("image/png") + '"; a.download="igoImpression.png"; document.body.appendChild(a); a.click(); document.body.removeChild(a);}</script>';                       
            html += '</head>';
            html += '<body class="media-print-igo" style="width: ' + widthImg + '; height: ' + heightImg + '; padding: 0; margin: 0;">';
            html += '<center><img height=' + heightImg + ' width= ' + widthImg + ' src="' + canvas2.toDataURL("image/png") + '" /></center>';
            html += '<button class="noPrint" type="button" onclick="window.print()" style="margin: 5px; z-index: 999; position: absolute; bottom:0; right: 0; cursor: pointer;">Imprimer</button>';
            html += '<button class="noPrint saveButtonPrint" type="button" onclick="savePrintImage()" style="margin: 5px; z-index: 999; position: absolute; bottom:0; right: 80px; cursor: pointer;">Enregistrer</button>';
            html += '</body></html>';


            var printWindow = window.open('', 'À imprimer', 'height='+heightImg+',width='+widthImg);
            printWindow.document.write(html);
            printWindow.document.close();

            Aide.cacherMessageChargement();

        }); 
    };



    setTimeout(function(){
      var imagesLegende = $("#media-print-igo .printImageLegend");
      if (!imagesLegende.length) {
        createCanvasPrint();
        return true;
      }

      var count = 0;
      var waitImages = function() {
        var printOk = true;
        if (count < 20) {
          $.each(imagesLegende, function(key, image) {
            if (!image.complete) {
              printOk = false;
              count++;
              setTimeout(waitImages, 500);
              return false;
            }
          });
        }
        if (printOk) {
            createCanvasPrint();
            return true
        }
      };
      waitImages();
    }, 1);
        
};


return Impression;
    
});