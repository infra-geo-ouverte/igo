/** 
 * Module pour l'objet {@link Panneau.PanneauOccurence}.
 * @module PanneauOccurence
 * @requires panneau
 * @author Frédéric Morin
 * @version 1.0
 */

define(['panneau', 'occurence', 'aide'], function(Panneau, Occurence, Aide) {

    /** 
     * Création de l'object Panneau.PanneauOccurence.
     * Pour la liste complète des paramètres, voir {@link Panneau}
     * @constructor
     * @name Panneau.PanneauOccurence
     * @class Panneau.PanneauOccurence
     * @alias PanneauOccurence:panneau.PanneauOccurence
     * @extends Panneau
     * @requires panneau
     * @param {object} [options] Objet contenant les propriétés du panneau
     * @returns {Panneau.PanneauOccurence} Instance de {@link Panneau.PanneauOccurence}
     */
    function PanneauOccurence(options) {
        
        this.options = options || {};
        this.serviceEdition = this.options.serviceEdition || null;
        
        this._init();
    };

    PanneauOccurence.prototype = new Panneau();
    PanneauOccurence.prototype.constructor = PanneauOccurence;

    PanneauOccurence.prototype.obtenirChamps = function(attributes, forceDisabled, occurence){
        
        var options = {
            collapsible:false,
            border:false,
            frame:false,
            width:'100%',
            style:'padding: 0px'
        };
        
        if(attributes !== null){
            var items = new Array();
            for(index = 0; index < attributes.length; index++) {
                var attribute = attributes[index];
                var item = this.creerControle(attribute);
                if(forceDisabled){
                    item.setDisabled(true);
                }
                if(occurence !== null && occurence.obtenirPropriete(attribute.propriete) !== undefined){                    
                    item.setValue(occurence.obtenirPropriete(attribute.propriete));
                }
                items.push(item);
                if(forceDisabled === false && attribute.allowNew === true){
                    //TODO: Ajouter le bouton qui permet de créer un nouveau element et de l'ajouter au combobox par la suite.
                    var button = new Ext.Button({
                        name:attribute.propriete,
                        sameAsName:attribute.sameAs,
                        newService:attribute.newService,
                        text: "Nouveau " + attribute.titre + "...",
                        handler: this._onNew.bind(this)
                    });
                    items.push(button);
                }
            }
            options.items = items;
        }
        return new Ext.form.FieldSet(options);
    };

    PanneauOccurence.prototype.creerControle = function(attribute) {
        var control = null;
        
        if (attribute.type === "integer")
        {
            var numberfield = null;
            if (attribute.maxValue) {
                numberfield = new Ext.form.NumberField({
                    fieldLabel: attribute.titre,
                    name: attribute.propriete,
                    allowBlank: !attribute.obligatoire,
                    anchor: '100%',
                    maxValue: attribute.maxValue
                });

            } else {
                numberfield = new Ext.form.NumberField({
                    fieldLabel: attribute.titre,
                    name: attribute.propriete,
                    allowBlank: !attribute.obligatoire,
                    anchor: '100%'
                });
            }
            control = numberfield;
        }
        else if (attribute.type === "string")
        {
            var textfield = null;

            if (attribute.maxLength) {
                textfield = new Ext.form.TextField({
                    fieldLabel: attribute.titre,
                    name: attribute.propriete,
                    allowBlank: !attribute.obligatoire,
                    maxLength: attribute.maxLength,
                    anchor: '100%'
                });
            } else {
                textfield = new Ext.form.TextField({
                    fieldLabel: attribute.titre,
                    name: attribute.propriete,
                    allowBlank: !attribute.obligatoire,
                    anchor: '100%'
                });
            }
            control = textfield;
        }
        else if (attribute.type === "texte")
        {
            var textarea = new Ext.form.TextArea({
                fieldLabel: attribute.titre,
                name: attribute.propriete,
                allowBlank: !attribute.obligatoire,
                anchor: '100%'
            });
            control = textarea;
        }
        else if (attribute.type === "enumeration")
        {
            var store = new Ext.data.JsonStore({
                fields: ["id", "value"],
                data: attribute.valeurs || []
             });
            var comboBox = new Ext.form.ComboBox({
                fieldLabel: attribute.titre,
                store: store,
                valueField: 'id',
                displayField: 'value',
                editable: false,
                mode: 'local',
                triggerAction: 'all',
                lazyRender: true,
                lazyInit: false,
                name: attribute.propriete,
                allowBlank: !attribute.obligatoire,
                sameAsName: attribute.sameAs,
                anchor: '100%'
            });
         
            control = comboBox;
        }
        else if (attribute.type === "date")
        {
            var date = new Ext.form.DateField({
                fieldLabel: attribute.titre,
                name: attribute.propriete,
                anchor: '100%',
                allowBlank: !attribute.obligatoire
            });
            control = date;
        }
        else if (attribute.type === "time") {
            var time = new Ext.form.TimeField({
                fieldLabel: attribute.titre,
                name: attribute.propriete,
                format: "H:i:s",
                anchor: '100%',
                allowBlank: !attribute.obligatoire
            });
            control = time;
        }
        else if (attribute.type === "datetime") {
            var datetime = new DateTimeField({
                fieldLabel: attribute.titre,
                name: attribute.propriete,
                anchor: '100%',
                allowBlank: !attribute.obligatoire
            });
            control = datetime;
        }
        else
        {
            //return null;
        }
        control.type = attribute.type;
        if (!attribute.editable)
            control.setDisabled(true);
        
        return control;
    };

    PanneauOccurence.prototype._init = function() {
        Panneau.prototype._init.call(this);   
    };

    PanneauOccurence.prototype.afficher = function(attributes, forceDisabled, occurence){
        this.occurence = occurence || new Occurence();
        this.fieldSet = this.obtenirChamps(attributes, forceDisabled, occurence);
                
        this.saveButton = new Ext.Button({formBind:true});
        this.saveButton.text = 'Sauvegarder';
        this.saveButton.tooltip = 'Sauvegarder';
        //this.saveButton.disabled = true;
        //this.saveButton.formBind = true; // Ne fonctionne pas avec les fieldSet.
        this.saveButton.handler = this._onSave.bind(this);
        //this.saveButton.setVisible(false);
        
        this.cancelButton = new Ext.Button();
        //this.cancelButton.id = 'cancelNew';
        this.cancelButton.text = 'Annuler';
        this.cancelButton.tooltip = 'Annuler';
        this.cancelButton.handler = this._onCancel.bind(this);
        //this.cancelButton.setVisible(false);
        
        this._panel = new Ext.FormPanel({
            frame: false,
            border:false,
            labelAlign: "top",
            width: 500,
            scope: this,
            items: this.fieldSet,
            bodyStyle: 'background:none',
            buttons: [this.saveButton,this.cancelButton]
        });        
        
        this.window = new Ext.Window({
            id:'fenetrePanneauOccurence',
            title: this.options.titre,
            items:[this._panel]
        });
        
        this.saveButton.setVisible(!forceDisabled);
        this.cancelButton.setVisible(!forceDisabled);

        this.window.show();
        this.fieldSet.doLayout();
        this._panel.doLayout();
    };

    PanneauOccurence.prototype._onSave = function(e){
        var valid = true;
        var erreur = "";
        
        for(index = 0; index < this.fieldSet.items.length; index++){
            var item = this.fieldSet.items.items[index];
            if(!item.isValid()){
                
                erreur += 'La valeur pour le champ ' + item.fieldLabel + ' est invalide.</br>';                
                valid = false;
            }
        }
        if(valid === true){
            for(index = 0; index < this.fieldSet.items.length; index++){
                var item = this.fieldSet.items.items[index];
                this.occurence.definirPropriete(item.name, item.getValue());                
            }    
            this.serviceEdition.creerOccurence(this.options.couche, this.occurence, this._sauvegardeSuccess.bind(this), this._sauvegardeErreur.bind(this));
            
        }else{
            Aide.afficherMessage("Erreur", erreur, "OK", "ERREUR");
        }        
    };
    
    PanneauOccurence.prototype._onNew = function(e){
        this.newService = e.newService;
        this.newTitle = e.text;
        this.newElementName = e.name;
        
        this.serviceEdition.decrireCouche(this.newService, 
            this._decrireCoucheNewSuccess.bind(this), 
            this._decrireCoucheNewErreur.bind(this));
    };
    
    PanneauOccurence.prototype._decrireCoucheNewSuccess = function(data){
        this.newPanneauOccurence = new PanneauOccurence({titre:this.newTitle, couche:this.newService, serviceEdition:this.serviceEdition, element:this.newElementName,callback:this.options.callback});
        var featureType = data[0].featureType;
        this.newPanneauOccurence.afficher(featureType,false,null);
    };
    
    PanneauOccurence.prototype._decrireCoucheNewErreur = function(){
        console.log("Erreur! decrireCoucheNewErreur!");
    };
        
    PanneauOccurence.prototype._sauvegardeSuccess = function(data){
        if(this.options.callback){
            data.element = this.options.element;
            this.options.callback(data);
        }
        
        this.window.close();
    };

    PanneauOccurence.prototype._sauvegardeErreur = function(){
        console.log("Erreur! sauvegardeErreur!");
    };
    
    PanneauOccurence.prototype._onCancel = function(e){
        this.window.close();
    };
    return PanneauOccurence;
});
