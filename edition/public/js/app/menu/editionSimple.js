require.ajouterConfig({
    paths: {
        'editionService': '[edition]/public/js/app/service/service',
        'editionPanneauOccurence': '[edition]/public/js/app/panneau/panneauOccurence'
    }
});

/** 
 * Module pour l'objet {@link Panneau.Edition}.
 * @module edition
 * @author Frédéric Morin
 * @version 1.0
 * @requires panneau
 */

define(['panneau','editionPanneauOccurence' ,'editionService', 'vecteur', 'aide'], function(Panneau, PanneauOccurence, Service, Vecteur, Aide) {
    /** 
     * Création de l'object Panneau.Edition.
     * Objet à ajouter à un panneauMenu.
     * @constructor
     * @name Panneau.Edition
     * @class Panneau.Edition
     * @alias localisation:Panneau.Edition
     * @extends PanneauOnglet
     * @requires edition
     * @param {string} [options.id='edition-panneau'] Identifiant du panneau.
     * @param {string} [options.titre='Outil d'édition'] Titre du panneau.
     * @returns {Panneau.Edition} Instance de {@link Panneau.Edition}
     */
    function EditionSimple(options) {
        this.options = options || {};
        this._lastIndexRadio = 0;
        this.defautOptions.titre = "Outil d'édition";
        this.defautOptions.id = 'edition-panneau';
        var navigateur = Aide.obtenirNavigateur();
        this.carte = navigateur.carte;
        this.serviceEdition = new Service({projectionCarte: this.carte.obtenirProjection(), url: Aide.utiliserBaseUri("[edition]/app/")});
        var style = {limiteEpaisseur: 3, limiteOpacite: 0.6, limiteCouleur: "#ee9900"};
        var styleSelectionne = {limiteEpaisseur: 3, limiteCouleur: "#2668e3"};
        this.coucheEdition = new Vecteur({titre: this.titre, id:"couche", active:true, visible:false, fnSauvegarder: this.sauvegarder, garderHistorique:true, styles:{defaut: style, select: styleSelectionne}});
        this.carte.gestionCouches.ajouterCouche(this.coucheEdition);
        this.serviceEdition.obtenirCouches(this.obtenirCoucheSuccess.bind(this), this.obtenirCoucheErreur.bind(this));
        this.etat = EditionSimple.ETATS.PENDING;
        this.serviceSelectionne = null;
        this.occurence = null;
        this.couches = null;
    };

    EditionSimple.prototype = new Panneau();
    EditionSimple.prototype.constructor = EditionSimple;

    EditionSimple.ETATS = {PENDING:0, CREATING:1, EDITING:2, DELETING:3};

    EditionSimple.prototype.storeEdition = new Ext.data.JsonStore({
        fields: [{name: "allowDelete", type: "boolean"},
            {name: "allowNew", type: "boolean"},
            {name: "allowSnap", type: "boolean"},
            {name: "allowUpdate", type: "boolean"},
            {name: "associatedLayers"},
            {name: "description", type: "string"},
            {name: "geometryName", type: "string"},
            {name: "geometryType", type: "string"},
            {name: "identifier", type: "string"},
            {name: "isUserSelectable", type: "boolean"},
            {name: "maximumScale", type: "int"},
            {name: "minimumScale", type: "int"},
            {name: "name", type: "string"},
            {name: "setSnapTolerance", type: "int"},
            {name: "srid", type: "string"}
        ],
        data: [],
        sortInfo: {
            field: 'name',
            direction: 'DESC'
        }
    });

    EditionSimple.prototype.obtenirCoucheSuccess = function(data) {
        var userSelectables = [];
        this.couches = data;
        for(index = 0; index < this.couches.length; index++){
            if(this.couches[index].isUserSelectable){
                userSelectables.push(this.couches[index]);
            }
        }        
        this.storeEdition.loadData(userSelectables);
    };

    EditionSimple.prototype.decrireCoucheSucess = function(data) {        

        var featureType = data[0].featureType;
        var fieldSet = this.panneauOccurence.obtenirChamps(featureType, (this.occurence === null), this.occurence);
        
        this.coucheEdition.enleverDeclencheur('vecteurOccurenceSelectionnee', 'EditionSimple');
        this._panel.remove(this.fieldSet);
        this.fieldSet = fieldSet;
        
        this._panel.add(fieldSet);
        fieldSet.doLayout();
        if(this.etat === EditionSimple.ETATS.PENDING){
            this.deleteButton.setVisible(false);        
            this.createButton.setVisible(true);
            this.editButton.setVisible(true);
        }else if(this.etat === EditionSimple.ETATS.EDITING){
            this.deleteButton.setVisible(true);        
            this.saveButton.setVisible(true);
            this.cancelButton.setVisible(true);
        }else{
            this.saveButton.setVisible(true);
            this.cancelButton.setVisible(true);            
        }
        this._panel.doLayout();
        Aide.cacherMessageChargement();
    };

    EditionSimple.prototype.obtenirOccurencesSucess = function(donnees){
        this.coucheEdition.enleverTout();
        this.coucheEdition.ajouterOccurences(donnees);
    };

    EditionSimple.prototype.sauvegardeSuccess = function(data) {
        data = typeof data === 'string' ? JSON.parse(data) : data;
        if(data.result === 'failure' && data.error){
            Aide.cacherMessageChargement();
            Aide.afficherMessage("Erreur", data.error);            
        }else if(data.result === 'failure' && data.errors){
            var message = "";
            for(var index in data.errors){
                message += data.errors[index];
            }
            Aide.cacherMessageChargement();
            Aide.afficherMessage("Erreur", message);            
        }else if(data.result === 'success'){
            console.log("Sauvegarde Success!");
            this.rafraichirCouchesAssociees();
            this._onCancel();
            Aide.cacherMessageChargement();
        }else if(data.result === 'warning'){
            Aide.cacherMessageChargement();
            Aide.afficherMessage({
                titre: "Avertissement", 
                message: data.warning,
                boutons: 'OUINON',
                action: this.avertissementJustifie.bind(this)
            });
        }
    };
    
    EditionSimple.prototype.avertissementJustifie = function(e){    
        if(e === "yes"){
            Aide.afficherMessageChargement({titre:"Sauvegarde en cours..."});
            this.occurence.definirPropriete("ignoreWarning", true);
            if(this.etat === EditionSimple.ETATS.CREATING){
                this.serviceEdition.creerOccurence(this.serviceSelectionne['name'], this.occurence, this.sauvegardeSuccess.bind(this), this.sauvegardeErreur.bind(this));// = function(couche, occurence, success, error){
            }else if(this.etat === EditionSimple.ETATS.EDITING){
                this.serviceEdition.modifierOccurence(this.serviceSelectionne['name'], this.occurence, this.sauvegardeSuccess.bind(this), this.sauvegardeErreur.bind(this));// = function(couche, occurence, success, error){
            }else if(this.etat === EditionSimple.ETATS.DELETING){
                this.serviceEdition.supprimerOccurence(this.serviceSelectionne['name'], this.occurence, this.sauvegardeSuccess.bind(this), this.sauvegardeErreur.bind(this));    
            }
        }else{
            this._onCancel();
        }
    };

    EditionSimple.prototype.obtenirCoucheErreur = function(data) {
        console.log("Erreur! obtenirCoucheErreur! " + data);
    };

    EditionSimple.prototype.obtenirOccurencesErreur = function() {
        console.log("Erreur! obtenirOccurencesErreur!");
    };
    
    EditionSimple.prototype.decrireCoucheErreur = function() {
        console.log("DecrireCouche Erreur!");
        Aide.cacherMessageChargement();
    };
    
    EditionSimple.prototype.sauvegardeErreur = function(status, error, response) {
        Aide.cacherMessageChargement();
        Aide.afficherMessage("Erreur", response.error);
    };
    
    EditionSimple.prototype.limitesModifiees = function(e){
        if(this.serviceSelectionne === null){
            return;
        }
        var echelle = this.carte.obtenirEchelle();
        var minScale = this.serviceSelectionne["minimumScale"];
        var maxScale = this.serviceSelectionne["maximumScale"]
        var limites = this.carte.obtenirLimites();
        if (echelle < minScale || echelle > maxScale) {
            Ext.MessageBox.show({
                title: "Message d'information",
                msg: "L'échelle de la carte doit se trouver entre " + minScale + " et " + maxScale + ".",
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.INFO
            });
            this.combo.setValue(null);
            //return false;
            this.serviceSelectionne = null;
            var fieldSet = this.panneauOccurence.obtenirChamps(null);
            this._panel.remove(this.fieldSet);
            this.fieldSet = fieldSet;
            this.description.setValue("");
            this._panel.add(fieldSet);
            fieldSet.doLayout();            
            this._onCancel();
        }else{
            if(this.occurence === null && this.etat === EditionSimple.ETATS.EDITING){
                this.serviceEdition.obtenirOccurences(this.serviceSelectionne['name'], limites, this.obtenirOccurencesSucess.bind(this), this.obtenirOccurencesErreur.bind(this));                   
            }
        }
    };
    
    EditionSimple.prototype.coucheSelectionne = function(combo, record, index){
        this.combo = combo;
        var echelle = this.carte.obtenirEchelle();
        var minScale = record.data["minimumScale"];
        var maxScale = record.data["maximumScale"];

        if (echelle < minScale || echelle > maxScale) {
            Ext.MessageBox.show({
                title: "Message d'information",
                msg: "L'échelle de la carte doit se trouver entre " + minScale + " et " + maxScale + ".",
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.INFO
            });
            this.combo.setValue(null);
            this.serviceSelectionne = null;
            var fieldSet = this.panneauOccurence.obtenirChamps(null);
            this._panel.remove(this.fieldSet);
            this.fieldSet = fieldSet;
            this.description.setValue("");
            this._panel.add(fieldSet);
            fieldSet.doLayout();            
        }else{            
            this.serviceSelectionne = record.data;
            for(var index = 0; index < this.serviceSelectionne.associatedLayers.length; index++){
                var couches = this.carte.gestionCouches.obtenirCouchesParTitre(this.serviceSelectionne.associatedLayers[index]);
                for(var indexCouche = 0; indexCouche < couches.length; indexCouche++){
                    couches[indexCouche].activer();
                }
            }

            this.description.setValue(record.data['description']);
        }
        this._onCancel();
    };
    
    EditionSimple.prototype.rafraichirCouchesAssociees = function(){
        for(var index = 0; index < this.serviceSelectionne.associatedLayers.length; index++){
            var couches = this.carte.gestionCouches.obtenirCouchesParTitre(this.serviceSelectionne.associatedLayers[index]);
            for(var indexCouche = 0; indexCouche < couches.length; indexCouche++){
                couches[indexCouche].rafraichir(true);
            }
        }
    };
    
    EditionSimple.prototype.occurenceCree = function(e){
        this.coucheEdition.enleverDeclencheur('ajouterOccurence', 'EditionSimple');
        this.carte.controles.desactiverDessin();
        this.occurence = e.occurence;        
        this.serviceEdition.decrireCouche(this.serviceSelectionne['name'], this.decrireCoucheSucess.bind(this), this.decrireCoucheErreur.bind(this), this.occurence);        
        this.carte.controles.activerEdition(this.coucheEdition,{});
        this.occurence.ajouterDeclencheur('occurenceModifiee',this.occurenceModifiee.bind(this), {id:'EditionSimple'});        
    };
    
    EditionSimple.prototype.occurenceSelectionne = function(e){
        this.coucheEdition.enleverDeclencheur('vecteurOccurenceSelectionnee', 'EditionSimple');
        var occurences = this.coucheEdition.obtenirOccurencesSelectionnees();
        this.coucheEdition.enleverTout();
        this.occurence = occurences[0];
        this.coucheEdition.ajouterOccurence(this.occurence);
        //Aide.afficherMessageChargement({titre:"Selection en cours..."});
        this.serviceEdition.decrireCouche(this.serviceSelectionne['name'], this.decrireCoucheSucess.bind(this), this.decrireCoucheErreur.bind(this), this.occurence);
        this.occurence.ajouterDeclencheur('occurenceModifiee',this.occurenceModifiee.bind(this), {id:'EditionSimple'});        
    };
    
    EditionSimple.prototype.occurenceModifiee = function(e){
        this.serviceEdition.decrireCouche(this.serviceSelectionne['name'], this.decrireCoucheSucess.bind(this), this.decrireCoucheErreur.bind(this), this.occurence);
    };

    EditionSimple.prototype._onEdit = function(){
        var limites = this.carte.obtenirLimites();
        this.serviceEdition.obtenirOccurences(this.serviceSelectionne['name'], limites, this.obtenirOccurencesSucess.bind(this), this.obtenirOccurencesErreur.bind(this));
        
        this.createButton.setVisible(false);
        this.editButton.setVisible(false);
        this.cancelButton.setVisible(true);
        this.etat = EditionSimple.ETATS.EDITING;
        this.carte.controles.activerEdition(this.coucheEdition,{});
        this.coucheEdition.ajouterDeclencheur('vecteurOccurenceSelectionnee', this.occurenceSelectionne.bind(this), {id:'EditionSimple'} );        
    };

    EditionSimple.prototype._onCreate = function(){
        this.etat = EditionSimple.ETATS.CREATING;
        this.createButton.setVisible(false);
        this.editButton.setVisible(false);
        this.cancelButton.setVisible(true);


        if(this.serviceSelectionne["geometryType"] === "point"){
            this.carte.controles.activerDessin(this.coucheEdition,'point',{});
        }else if(this.serviceSelectionne["geometryType"] === "LineString"){
            this.carte.controles.activerDessin(this.coucheEdition,'ligne',{});
        }else if(this.serviceSelectionne["geometryType"] === "polygon"){
            this.carte.controles.activerDessin(this.coucheEdition,'polygone',{});
        }else if(this.serviceSelectionne["geometryType"] === "circle"){
            this.carte.controles.activerDessin(this.coucheEdition,'cercle',{});
        }

        
        this.coucheEdition.ajouterDeclencheur('ajouterOccurence', this.occurenceCree.bind(this), {id:'EditionSimple'});
    };

    EditionSimple.prototype._onSave = function(){
        var valid = true;
        var erreur = "";
        
        for(index = 0; index < this.fieldSet.items.length; index++){
            var item = this.fieldSet.items.items[index];
            if(item.isValid && !item.isValid()){
                
                erreur += 'La valeur pour le champ ' + item.fieldLabel + ' est invalide.</br>';                
                valid = false;
            }
        }
        if(valid === true){
            for(index = 0; index < this.fieldSet.items.length; index++){
                var item = this.fieldSet.items.items[index];
                if(item.isValid){
                    this.occurence.definirPropriete(item.name, item.getValue());                
                }
            }    
            var message = 'Cet objet sera enregistré a votre nom : ' + Aide.profil.utilisateur + '. Veuillez décrire la raison pour cette modification ou un commentaire associé:';
            Ext.MessageBox.show({
                    title: 'Commentaire',
                    msg: message,
                    width:300,
                    buttons: Ext.MessageBox.OKCANCEL,
                    multiline: true,
                    fn: this._onJustified.bind(this)
            });           
        }else{
            Aide.afficherMessage("Erreur", erreur, "OK", "ERREUR");
        }
    };

    EditionSimple.prototype._onDelete = function(){
        this.etat = EditionSimple.ETATS.DELETING; 
        var message = 'Cet objet sera enregistré a votre nom : ' + Aide.profil.utilisateur + '. Veuillez décrire la raison pour cette modification ou un commentaire associé:';
        Ext.MessageBox.show({
                title: 'Commentaire',
                msg: message,
                width:300,
                buttons: Ext.MessageBox.OKCANCEL,
                multiline: true,
                fn: this._onJustified.bind(this)
        });        
    };
            
    EditionSimple.prototype._onJustified = function(button, text){
        if(button === 'cancel'){
            this._onCancel();
            return false;
        }
        Aide.afficherMessageChargement({titre:"Sauvegarde en cours..."});
        var justification = this.occurence.obtenirPropriete("justification") || "";
        this.occurence.definirPropriete("justification", justification + Aide.profil.utilisateur + ": " + text + "\n");

        if(this.etat === EditionSimple.ETATS.CREATING){
            this.serviceEdition.creerOccurence(this.serviceSelectionne['name'], this.occurence, this.sauvegardeSuccess.bind(this), this.sauvegardeErreur.bind(this));// = function(couche, occurence, success, error){
        }else if(this.etat === EditionSimple.ETATS.EDITING){
            this.serviceEdition.modifierOccurence(this.serviceSelectionne['name'], this.occurence, this.sauvegardeSuccess.bind(this), this.sauvegardeErreur.bind(this));// = function(couche, occurence, success, error){
        }else if(this.etat === EditionSimple.ETATS.DELETING){
            this.serviceEdition.supprimerOccurence(this.serviceSelectionne['name'], this.occurence, this.sauvegardeSuccess.bind(this), this.sauvegardeErreur.bind(this));    
        }
        
    };

    EditionSimple.prototype._onCancel = function(){
        this.etat = EditionSimple.ETATS.PENDING;
        this.coucheEdition.enleverDeclencheur('vecteurOccurenceSelectionnee', 'EditionSimple');
        this.coucheEdition.enleverDeclencheur('ajouterOccurence', 'EditionSimple');

        if(this.occurence){
            this.occurence.enleverDeclencheur('occurenceModifiee', 'EditionSimple');
        }
        this.carte.controles.desactiverDessin();
        this.carte.controles.desactiverEdition();
        if(this.serviceSelectionne)
            this.serviceEdition.decrireCouche(this.serviceSelectionne['name'], this.decrireCoucheSucess.bind(this), this.decrireCoucheErreur.bind(this));
        this.coucheEdition.enleverTout();
        this.occurence = null;
        
        
        this.createButton.setVisible(this.serviceSelectionne !== null);
        this.editButton.setVisible(this.serviceSelectionne !== null);
        this.cancelButton.setVisible(false);
        this.saveButton.setVisible(false);
        this._panel.doLayout();
        
    };
    
    EditionSimple.prototype._callback = function(data){
        for(var index = 0; index < this.fieldSet.items.items.length; index++){
            var item = this.fieldSet.items.items[index];
            if(item.name === data.element || item.sameAsName === data.element){
                var newValue = {
                    id: data.id,
                    value: data.value
                };
                if(item.store){
                    var newRecord = new item.store.recordType(newValue, newValue.id); // create new record
                    newRecord.json = newValue;
                    item.store.add(newRecord);
                    item.setValue(newValue.id);
                }
            }
        }
    };
    
    EditionSimple.prototype._init = function() {

        this.panneauOccurence = new PanneauOccurence({serviceEdition: this.serviceEdition, callback: this._callback.bind(this)});
        this.panneauOccurence._init();

        this.createButton = new Ext.Button();
        this.createButton.id = 'create';
        this.createButton.text = 'Créer';
        this.createButton.tooltip = 'Créer';
        this.createButton.handler = this._onCreate.bind(this);
        this.createButton.setVisible(false);

        this.editButton = new Ext.Button();
        this.editButton.id = 'edit';
        this.editButton.text = 'Éditer';
        this.editButton.tooltip = 'Éditer';
        this.editButton.handler = this._onEdit.bind(this);
        this.editButton.setVisible(false);

        this.saveButton = new Ext.Button({formBind:true});
        this.saveButton.id = 'save';
        this.saveButton.text = 'Sauvegarder';
        this.saveButton.tooltip = 'Sauvegarder';
        //this.saveButton.disabled = true;
        //this.saveButton.formBind = true; // Ne fonctionne pas avec les fieldSet.
        this.saveButton.handler = this._onSave.bind(this);
        this.saveButton.setVisible(false);

        this.cancelButton = new Ext.Button();
        this.cancelButton.id = 'cancel';
        this.cancelButton.text = 'Annuler';
        this.cancelButton.tooltip = 'Annuler';
        this.cancelButton.handler = this._onCancel.bind(this);
        this.cancelButton.setVisible(false);

        this.deleteButton = new Ext.Button();
        this.deleteButton.id = 'delete';
        this.deleteButton.text = 'Effacer';
        this.deleteButton.tooltip = 'Effacer';
        this.deleteButton.handler = this._onDelete.bind(this);
        this.deleteButton.setVisible(false);


        this.description = new Ext.form.TextArea({
            fieldLabel: 'Description',
            name: 'description',
            allowBlank: true,
            width:'100%'
        });
        this.description.setDisabled(true);
        this.fieldSet = this.panneauOccurence.obtenirChamps(null);
        
        this.items = [
        {
            xtype: 'combo',
            disabled: false,
            fieldLabel: "Que désirez-vous éditer?",
            store: this.storeEdition,
            valueField: 'name',
            forceSelection: true,
            displayField: 'name',
            width: '100%',
            editable: false,
            mode: 'local',
            triggerAction: 'all',
            selectOnFocus: false,
            emptyText: "Sélectionnez un élément",
            listeners: {
                select: this.coucheSelectionne.bind(this)
            }
        },this.description
        ,this.fieldSet
        ];        
        
        this._panel = new Ext.FormPanel({
            title: "Outil d'édition",
            id: this.options.id,
            hideLabel: true,
            frame: true,
            width: '100%',
            bodyStyle: "padding: 10px",
            labelAlign: "top",
            autoScroll: true,
            defaults: {anchor: "100%"},
            scope: this,
            items: this.items,
            buttons: [this.deleteButton,this.createButton,this.editButton,this.saveButton,this.cancelButton]
        });
        
        this._panel.add(this.fieldSet);
        
        this.carte.ajouterDeclencheur('limitesModifiees', this.limitesModifiees.bind(this), {id:'EditionSimple'});
        Panneau.prototype._init.call(this);
    };
    return EditionSimple;
});
