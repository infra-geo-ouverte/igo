/** 
 * Module pour l'objet {@link Panneau.Impression}.
 * @module impression
 * @author  Michael Lane, FADQ /Inspiré du module d'impression Igo
 * @version 1.0
 * @requires panneau
 */

define(['panneau', 'aide'], function(Panneau, Aide) {
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
 * Imprimer la carte
 * @method
 * @name Impression#imprimerCarte
 */
Impression.prototype.imprimerCarte = function(){  
    var navigateur = Aide.obtenirNavigateur();
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
    var height = canvas.height;
    var width = canvas.width;
    var heightImg,widthImg, paperMax, paperSize, widthMM, heightMM;
    var titre = Ext.getCmp("printTitle").getValue();
    var commentaire = Ext.getCmp("printComments").getValue();
    var orientation = Ext.getCmp("printOrientation").getValue();
    var formatPapier = Ext.getCmp("printPaper").getValue();
    
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
        var FIXHEIGHT = 700;
        var FIXWIDTH = paperMax;
    }
    else
    {
       var FIXHEIGHT = paperMax; 
       var FIXWIDTH = 700;
    }
    
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
    var win=window.open();
    win.document.write("<html><head></head><body>");
    win.document.write('<style type="text/css" media="print">@page { size: ' + paperSize + '; }' +
                       '@media print {body { width: ' + widthMM + '; height: ' + heightMM + '; }</style>');
    win.document.write("<h1><center>" +titre+ "</center></h1>");
    win.document.write("<br><center><img height=" + heightImg + " width= " + widthImg + " src='"+canvas.toDataURL("image/png")+"'/></center>");
    win.document.write("<br><p>" + commentaire + "</p>");
    win.document.write("</body></html>");
    win.document.body.style.width = FIXWIDTH; //permet de centrer le titre avec la largeur connue de la page
    win.document.body.style.height = heightImg;
    win.document.close();
    win.print();
    win.location.reload();
    win.close();
};

return Impression;
    
});