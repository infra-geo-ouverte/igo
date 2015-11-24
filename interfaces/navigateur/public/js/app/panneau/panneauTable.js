define(['panneau', 'aide', 'contexteMenuTable', 'barreOutils', 'outilTableSelection', 'outil', 'outilMenu', 'outilDessin', 'outilEdition', 'outilControleMenu', 'libs/extension/Extjs/JsonReader'], function(Panneau, Aide, ContexteMenuTable, BarreOutils, OutilTableSelection, Outil, OutilMenu, OutilDessin, OutilEdition, OutilControleMenu) {

    function PanneauTable(options) {
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            id: 'table-panneau'
        });   
    };
    
    PanneauTable.prototype = new Panneau();
    PanneauTable.prototype.constructor = PanneauTable;
    
    PanneauTable.prototype._init = function() {
        Ext.QuickTips.init();
        
        this.controles = new PanneauTable.Controles(this);
        this.template = this.options.template || {colonnes: []};
        this.donnees = this.options.donnees || [];
        var config = this.configurer(this.template, this.donnees);

        this._extOptions = {
            xtype: 'editorgrid',
            store: config.store,
            colModel:  config.columnModel,
            stripeRows: true,
            stateful: true,
            stateId: 'grid'+this.options.titre,
            clicksToEdit: 1,
            width:screen.width, // corrige le bug dernière colonne width (vue module d'édition)
            viewConfig: {
              forceFit: true
            },
            sm: new Ext.grid.RowSelectionModel(),
            tbar: this._obtenirToolbar()

        };

        Panneau.prototype._init.call(this);
        this._initEvent();
        this.barreOutils._setPanelContainer(this._panel);
        if(this.options.vecteur){
            this.ouvrirTableVecteur();
        }
    };
    
  
    PanneauTable.prototype._initEvent = function(){
        var that=this;
        this._panel.on('beforeedit', function(e){
            if((!that.donnees.templates.table || !that.donnees.templates.table.colonnes) && typeof e.value === "object"){
                return false;
            }
            return that.options.activerEdition === true || that.donnees.editionActif === true;}
        );     
        this._panel.on('afteredit', function(e){
            var occurence = e.record.json;
            if(occurence.obtenirPropriete('/'+e.field) !== e.value) {
                occurence.definirPropriete('/'+e.field, e.value);
            }
        });
    };
    
    PanneauTable.prototype._obtenirToolbar = function(){
        var that=this;
        this.barreOutils = new BarreOutils(this.carte);
    
        return this.barreOutils._getToolbar();
    };
    
    
    PanneauTable.prototype.chargerDonnees = function(donnees, garderDonnees){
        var that=this;
        try{
            that._panel.store.loadData(donnees, garderDonnees);
        } catch(e){
            console.warn(e);
//            $.each(donnees.listeOccurences, function(key, value){
//                
//            });
//            donnees.listeOccurences[0].definirPropriete("test", {});
//            that.chargerDonnees(donnees, garderDonnees);
        }
        if(this._panel.store.sortInfo){
            var sortInfo  = this._panel.store.sortInfo;
            this._panel.store.sort(sortInfo.field, sortInfo.direction);
        } else {
            this._panel.store.sort('id', "ASC");
        }
    };
    
    PanneauTable.prototype.ajouterOccurences = function(occurences, garderDonnees){
        //todo: vérifié si compatible avec le template?
        this.chargerDonnees({listeOccurences: occurences}, garderDonnees);
//        this.donnees.deselectionnerTout();
//        occurences[0].selectionner();
//        var index = this._panel.store.indexOfId(occurences[0].id);
//        if(index === -1){return true;}
        
//        var that=this;
//        setTimeout(function() { //todo: utiliser un event after loadData
//           // that._panel.getView().focusRow(index);
//        }, 5);
    };
    
    PanneauTable.prototype.enleverParOccurences = function(occurences){
        var that=this;
        $.each(occurences, function(key, value){
            var index = that._panel.store.indexOfId(value.id);
            if(index === -1){return true;}
            that.enleverParIndex(index);
        });
    };
    
    PanneauTable.prototype.enleverParIndex = function(index){
        this._panel.store.removeAt(index);
    };
    
    PanneauTable.prototype._obtenirColumnModel = function(colTemplate){
        var editor;
        var rendu = colTemplate.rendu;
        var that=this;
        //colTemplate.type = 'enumeration';
//        colTemplate.editable = true;
        if(!colTemplate.editable) {        
            editor = undefined;
//            if(this.donnees.options.editable){
//                rendu = function(currentCellValue, metadata){
//                    metadata.css = "GridCellInactif";
//                    return currentCellValue;
//                };
//            }
        } else if(colTemplate.type === 'enumeration'){
            var store;
            if(colTemplate.urlEnumeration){
                store = new Ext.data.ArrayStore({
                    autoDestroy: true,
                    proxy: new Ext.data.HttpProxy({
                        method: 'GET',
                        url: colTemplate.urlEnumeration,
                        listeners: {
                            beforeload: function(a, params ){
                                delete params.query;
                                params = colTemplate.enumerationParamsFonction();
                            }
                        }
                    }),
                    root: colTemplate.enumerationRoot,
                    fields: ["id", "value"]
                });
            } else {
                store = new Ext.data.JsonStore({
                    fields: ["id", "value"],
                    data: colTemplate.valeurs || []
                 });
            }

            editor = new Ext.form.ComboBox({
                store: store,
                displayField:'value',
                valueField: "id",
                typeAhead: true,
                mode: colTemplate.urlEnumeration ? undefined : 'local',
                forceSelection: true,
                triggerAction: 'all',
                selectOnFocus: true,
                allowBlank: !colTemplate.obligatoire
            });

            rendu = function(value) {
                var store = this.editor.store; 
                var index = store.find('id', value);
                if(index != -1) {
                    return store.data.items[index].data["value"];
                } else {
                    return value;
                }
            };
        } else if(colTemplate.type === 'nombre' || colTemplate.type === "integer") {
            editor = new Ext.form.NumberField({
                allowBlank: !colTemplate.obligatoire                
            });
        } else if(colTemplate.type === 'texte'){
           editor = new Ext.form.TextArea({
                allowBlank: !colTemplate.obligatoire      
            }); 
        } else {
           editor = new Ext.form.TextField({
                allowBlank: !colTemplate.obligatoire      
            }); 
        }

        var base = '';
        if(colTemplate.utiliserBase !== false && that.template.proprietesBase){
            base = that.template.proprietesBase + '.';
        }
        
        var renduDirty = function(value, cell, objet){
            if(objet.json.modifiee && objet.json.proprietesOriginales){
                var propriete = objet.store.fields.get(cell.id).name;
                var proprieteOriginale = propriete.replace("proprietes.", "proprietesOriginales.");
                var valeurOriginale = objet.json.obtenirPropriete("/"+proprieteOriginale);
                var valeur = objet.json.obtenirPropriete("/"+propriete);
                
                if(valeurOriginale !== valeur){
                    cell.css = cell.css + " x-grid3-dirty-cell";
                }
            }
            if(rendu){
                value = rendu.call(this, value, cell, objet);
            }
            return value;
        }
        
        var titre;
        if(colTemplate.obligatoire) {
            titre = "*" + colTemplate.titre;      
        }
        else{
            titre = colTemplate.titre;
        }
        
        return {
            //id       : colTemplate.titre,
            header   : titre, 
            width    : colTemplate.largeur, 
            sortable : colTemplate.triable, 
            alignement : colTemplate.alignement,
            dataIndex: base + colTemplate.propriete,
            renderer : renduDirty,
            editor : editor
        };
    };
    
    PanneauTable.prototype.afficherErreurs = function(){
        var that = this;
        try {
            $(this._panel.view.el.dom.getElementsByClassName("x-form-invalid")).removeClass("x-form-invalid");
        } catch (e){}
        
        $.each(this.donnees.listeOccurences, function(key, occurence){
            if($.isEmptyObject(occurence.obtenirErreurs())){
                return true;
            }
            var row = that.obtenirIndexParOccurence(occurence);
            if(row < 0){return true;}
            //General
            var messageGen = "";
            var erreurGen = occurence.obtenirErreur("general");
            var erreurGeom = occurence.obtenirErreur("geometrie");
            if(erreurGen || erreurGeom){
                var cell = that._panel.view.getRow(row).children[0];
                if(!cell){return true;}
                cell.classList.add("x-form-invalid");
                if($.isArray(erreurGen)){
                    $.each(erreurGen, function(errKey, uneErreur){
                        if(typeof uneErreur === "string"){
                            messageGen += uneErreur + "\n";
                        } else if(uneErreur.message){
                            messageGen += uneErreur.message + "\n";
                        }
                    });
                } else if(erreurGen) {
                    if(typeof erreurGen === "string"){
                        messageGen += erreurGen + "\n";
                    } else if(erreurGen.message){
                        messageGen += erreurGen.message + "\n";
                    }
                }
                if($.isArray(erreurGeom)){
                    $.each(erreurGeom, function(errKey, uneErreur){
                        if(typeof uneErreur === "string"){
                            messageGen += uneErreur + "\n";
                        } else if(uneErreur.message){
                            messageGen += uneErreur.message + "\n";
                        }
                    });
                } else if(erreurGeom){
                    if(typeof erreurGeom === "string"){
                        messageGen += erreurGeom + "\n";
                    } else if(erreurGeom.message){
                        messageGen += erreurGeom.message + "\n";
                    }
                }
                cell.title = messageGen; //todo: un event à la place?
            }
            
            $.each(that.template.colonnes, function(colKey, colTemplate){
                var base = '';
                if(colTemplate.utiliserBase !== false && that.template.proprietesBase){
                    base = that.template.proprietesBase + '.';
                }
                var erreur = occurence.obtenirErreur(base + colTemplate.propriete);
                if(erreur){
                    var cell = that._panel.view.getCell(row, colKey);
                    if(!cell){return true;}
                    cell.classList.add("x-form-invalid");
                    var message = messageGen;
                    if($.isArray(erreur)){
                        $.each(erreur, function(errKey, uneErreur){
                            if(typeof uneErreur === "string"){
                                message += uneErreur + "\n";
                            } else if(uneErreur.message){
                                message += uneErreur.message + "\n";
                            }
                        });
                    } else {
                        if(typeof erreur === "string"){
                            message += erreur;
                        } else if(erreur.message){
                            message += erreur.message;
                        }
                    }
                    cell.title = message; //todo: un event à la place?
                }
            });
        });
    };
    
    PanneauTable.prototype.configurer = function(template, donnees){
        var that=this;
        this.desactiverDeclencheursVecteur(this.donnees);
        //this.controles.desactiverSelection();
        
        this.template = template || this.template || {};
        this.donnees = donnees || this.donnees || [];

        if(!this.template.titre){
            this.template.titre = this.options.titre || 'Table';
        }
        this.definirTitre(this.template.titre); 

        var fields = [];
        var columnModel = [];
        var colonnes = this.template.colonnes || [];
        $.each(colonnes, function(key, value){
            var base = '';
            if(value.utiliserBase !== false && that.template.proprietesBase){
                base = that.template.proprietesBase + '.';
            }
            fields.push({
                name: base + value.propriete, 
                type: value.type,
                allowBlank: !value.obligatoire,
                useNull: true
           });
            columnModel.push(that._obtenirColumnModel(value));
        });

        var store = new Ext.data.JsonStore({
            root: this.template.base,
            fields: fields
        });  


        try {
            store.loadData(that.donnees);
        } catch(e){
            console.warn(e);
        }
        
        if(this._panel && this._panel.store && this._panel.store.sortInfo){
            var sortInfo  = this._panel.store.sortInfo;
            store.sort(sortInfo.field, sortInfo.direction);
        } else {
            store.sort('id', "ASC");
        }

        this.activerDeclencheursVecteur(this.donnees);
        this.reconfigurerBarreOutils(this.donnees);
        this.controles.activerSelection();
        
        return {columnModel: new Ext.grid.ColumnModel(columnModel), store: store};
    };
    
    
    PanneauTable.prototype.reconfigurerBarreOutils = function(){
        var that=this;
        if(this.donnees.obtenirTypeClasse && (this.donnees.obtenirTypeClasse() === 'Vecteur' || this.donnees.obtenirTypeClasse() === 'VecteurCluster' || this.donnees.obtenirTypeClasse() === 'WFS')){
            this.barreOutils.eteindreOutils();
            this.barreOutils.enleverTousOutils();
            var outils = [];
            if(this.donnees.options.editable){
                if(this.donnees.options.typeGeometriePermise === 'Point'){
                    outils.push(new OutilDessin({type:'point', couche: this.donnees}));
                } else if(this.donnees.options.typeGeometriePermise === 'Ligne'){
                    outils.push(new OutilDessin({type:'ligne', couche: this.donnees}));
                } else if(this.donnees.options.typeGeometriePermise === 'Polygone'){
                    outils.push(new OutilDessin({type:'polygone', couche: this.donnees}));
                } else {
                    var outilsDessin=[];
                    outilsDessin.push(new OutilDessin({type:'point', titre:'Point', couche: this.donnees}));
                    outilsDessin.push(new OutilDessin({type:'ligne', titre:'Ligne', couche: this.donnees}));
                    outilsDessin.push(new OutilDessin({type:'polygone', titre:'Polygone', couche: this.donnees}));
                    var menuDessin = new OutilControleMenu({titre: 'Dessin', utiliserSousTitre: true, outils: outilsDessin});
                    outils.push(menuDessin);
                }
                      
                outils.push(new OutilEdition({couche: this.donnees, type: "Vertex"}));
                outils.push(new Outil({
                    //titre: 'Supprimer', 
                    icone: Aide.obtenirCheminRacine()+'images/toolbar/supprimer.png',
                    infobulle: "Supprimer l'occurence",
                    action: function(){
                        var oSelected = that.donnees.obtenirOccurencesSelectionnees();
                        that.donnees.enleverOccurences(oSelected);
                    }
                }));

                outils.push(new Outil({
                  //  titre:'Sauvegarder', 
                    icone: Aide.obtenirCheminRacine()+'images/toolbar/disk.png',
                    infobulle: "Sauvegarder les changements",
                    action: function(){
                        that.retirerErreurs();
                        if(!that.verifierTableau()){
                            Aide.afficherMessage("Sauvegarde impossible", "La sauvegarde n'a pas été effectuée. Veillez vérifier que tous les champs sont correctement remplis.");
                            return false;
                        }
                        that.donnees.accepterModifications();
                        that.rafraichir();       
                    }
                })); 
                outils.push(new Outil({
                    //titre:'Annuler', 
                    icone: Aide.obtenirCheminRacine()+'images/toolbar/annuler.png',
                    infobulle: "Annuler tous les changements",
                    action: function(){
                        that.donnees.annulerModifications();
                        that.rafraichir();
                    }
                }));      
            }
             
            var menuSelection = new OutilMenu({titre: 'Sélection'});

            outils.push(menuSelection);
            this.barreOutils.ajouterOutils(outils);

            var outilsSelection = [];

            outilsSelection.push(new OutilTableSelection({
                type:'efface',
                couche: this.donnees}));
            outilsSelection.push(new OutilTableSelection({
                type:'inverse',
                couche: this.donnees}));
            outilsSelection.push(new OutilTableSelection({
                type:'complet', 
                couche: this.donnees}));
            outilsSelection.push(new OutilTableSelection({
                type:'zoom',    
                couche: this.donnees}));
             outilsSelection.push(new OutilTableSelection({
                type:'auto',
                couche: this.donnees}));
             outilsSelection.push(new OutilTableSelection({
                type:'selectionSeulement',
                couche: this.donnees}));


            menuSelection.ajouterOutils(outilsSelection);  
        }
    };
    
    PanneauTable.prototype.reconfigurer = function(template, donnees){
        var config = this.configurer(template, donnees);       
        this._panel.reconfigure(config.store, config.columnModel);
        var that=this;
        setTimeout(function() {
            that.afficherErreurs();
        }, 1);
    };
      
    PanneauTable.prototype.activerDeclencheursVecteur = function(vecteur){
        if(this.donnees.obtenirTypeClasse && (this.donnees.obtenirTypeClasse() === 'Vecteur' || this.donnees.obtenirTypeClasse() === 'VecteurCluster' || this.donnees.obtenirTypeClasse() === 'WFS')){
            vecteur.ajouterDeclencheur('vecteurOccurenceSelectionnee', this._selectionEvent, {scope:this});
            vecteur.ajouterDeclencheur('vecteurOccurenceDeselectionnee', this._deselectionEvent, {scope:this});
            vecteur.ajouterDeclencheur('vecteurOccurenceModifiee', this._modificationEvent, {scope:this});
            vecteur.ajouterDeclencheur('ajouterOccurence', this._occurenceAjouteeEvent, {scope:this});
            vecteur.ajouterDeclencheur('enleverOccurence', this._occurenceEnleveeEvent, {scope:this});
            vecteur.ajouterDeclencheur('enleverCouche', this._coucheEnleveeEvent, {scope:this});
        }
    };
    
    PanneauTable.prototype.desactiverDeclencheursVecteur = function(vecteur){
        if(this.donnees.obtenirTypeClasse && (this.donnees.obtenirTypeClasse() === 'Vecteur' || this.donnees.obtenirTypeClasse() === 'VecteurCluster' || this.donnees.obtenirTypeClasse() === 'WFS')){
            vecteur.enleverDeclencheur('vecteurOccurenceSelectionnee', undefined, this._selectionEvent);
            vecteur.enleverDeclencheur('vecteurOccurenceDeselectionnee', undefined, this._deselectionEvent);
            vecteur.enleverDeclencheur('vecteurOccurenceModifiee', undefined, this._modificationEvent);
            vecteur.enleverDeclencheur('ajouterOccurence', undefined, this._occurenceAjouteeEvent);
            vecteur.enleverDeclencheur('enleverOccurence', undefined, this._occurenceEnleveeEvent);
            vecteur.enleverDeclencheur('enleverCouche', undefined, this._coucheEnleveeEvent);
        }
    };
      
    PanneauTable.prototype._selectionEvent = function(e){
        e.options.scope.selectionnerParOccurences([e.occurence]);
    };
    
    PanneauTable.prototype._deselectionEvent = function(e){
        e.options.scope.deselectionnerParOccurences([e.occurence]);
    };
    
    PanneauTable.prototype._modificationEvent = function(e){
        if(e.modifType=="propriete"){
            var index = this.obtenirIndexParOccurence(e.occurence);
            if(index === -1){return false;}
            var pStore = "proprietes."+e.modif.propriete;
            var record = this._panel.store.getAt(index);
            if(e.modif.valeur !== record.get(pStore)){
                record.set(pStore, e.modif.valeur);
            }   
        } else if (e.modifType=="objetProprietes"){
            var index = this.obtenirIndexParOccurence(e.occurence);
            if(index === -1){return false;}
            var record = this._panel.store.getAt(index);
            $.each(this._panel.store.fields.items, function(key, field){
                var oValeur = e.occurence.obtenirPropriete("/"+field.name);
                var rValeur = record.get(field.name);
                if(oValeur !== rValeur){
                    record.set(field.name, oValeur);
                }
            });
        }
    };
    
    PanneauTable.prototype._occurenceAjouteeEvent = function(e){
        e.options.scope.ajouterOccurences([e.occurence], true);
    }; 
    
    PanneauTable.prototype._occurenceEnleveeEvent = function(e){
        e.options.scope.enleverParOccurences([e.occurence]);
    };
    
    PanneauTable.prototype._coucheEnleveeEvent = function(e){
        if (e.options.scope.parent && e.options.scope.parent.obtenirTypeClasse() === 'PanneauOnglet') {
            e.options.scope.parent.enleverPanneau(e.options.scope);
            return true;
        }
        e.options.scope.reconfigurer({},[]);      
    };
    
    PanneauTable.prototype.obtenirIndexParEnregistrementHtml = function(html){
        return this._panel.getView().findRowIndex(html);
    };
    
    PanneauTable.prototype.obtenirIndexParOccurence = function(occurence){
        if(!occurence){return -1}
        return this._panel.store.indexOfId(occurence.id);
    };
    
    PanneauTable.prototype.selectionnerParOccurences = function(occurences){
        var that=this;
        $.each(occurences, function(key, value){
            if(!that._panel.store){return false;}
            if(value){
                var index = that._panel.store.indexOfId(value.id);
            }
            if(index === -1){return true;}
            that.selectionnerParIndex(index, true);
        });
    };
    
    PanneauTable.prototype.deselectionnerParOccurences = function(occurences){
        var that=this;
        $.each(occurences, function(key, value){
            if(!that._panel.store){return false;}
            var index = that._panel.store.indexOfId(value.id);
            if(index === -1){return true;}
            that.deselectionnerParIndex(index);
        });
    };
    
    PanneauTable.prototype.selectionnerParIndex = function(index, garderSelection, scroll){
        if(this._panel.selModel.grid && !this._panel.selModel.isSelected(index)){
            this._panel.selModel.selectRow(String(index), garderSelection);
            if(this._panel.getView().getRow(index) && scroll !== false){
                this._panel.getView().getRow(index).scrollIntoView(this._panel.getView());
            }
        }
    };
    
    PanneauTable.prototype.deselectionnerParIndex = function(index){
        if(this._panel.selModel.grid && this._panel.selModel.isSelected(index)){
            this._panel.selModel.deselectRow(String(index));
        }
    };
    
    PanneauTable.prototype.obtenirEnregistrementParIndex = function(index){
        return this._panel.getStore().getAt(index);
    };
    
    PanneauTable.prototype.obtenirEnregistrementParId = function(id){
        return this._panel.getStore().getById(id);
    };
    PanneauTable.prototype.ouvrirTableVecteur = function(vecteur){ 
        vecteur = vecteur || this.options.vecteur;

        var template = {
            titre: this.options.titre || vecteur.obtenirTitre(),
            base: 'listeOccurences',
            proprietesBase: 'proprietes'
        };
        
        if(vecteur.templates && vecteur.templates.table){
            $.extend(template, vecteur.templates.table);
        }
        
        if(!template.colonnes){
            template.proprietesBase = 'proprietes';
            template.colonnes = [{
                utiliserBase: false,
                titre   : 'id', 
                largeur    : 160, 
                triable : true, 
                propriete: 'id'   
            }];

            if(vecteur.listeOccurences[0]){
                $.each(vecteur.listeOccurences[0].proprietes, function(key, value){
                    template.colonnes.push({
                        titre   : key, 
                        largeur    : 160, 
                        triable : true, 
                        propriete: key,
                        editable: vecteur.options.editable
                    });                      
                });
            }
        }
        
        this.controles.desactiverSelection();
        this.reconfigurer(template, vecteur);
               
        var that=this;
        setTimeout(function() {
            that.selectionnerParOccurences(vecteur.obtenirOccurencesSelectionnees());
        }, 1);
       // this.controles.activerSelection();
    };
    
    
    PanneauTable.prototype.rafraichir = function() {
        this.reconfigurer();
        Panneau.prototype.rafraichir.call(this);
    };
    
    PanneauTable.prototype.callbackCreation = function(){
        if(Aide.toBoolean(this.options.aContexteMenu) !== false){
            this.contexteMenu = new ContexteMenuTable({panneauTable: this, selecteur: '#'+this.obtenirId(), cible: '.x-grid3-row'});
        }
        Panneau.prototype.callbackCreation.call(this);
    };
    
    PanneauTable.prototype.avantFermeture = function(){
        this.desactiverDeclencheursVecteur(this.donnees);
        this.declencher({ type: "tableFermeture", donnees: this.donnees });
        this.barreOutils.eteindreOutils();
    };
    
    /**
     * Fonction permettant de mettre à jour des attributs d'enregistrement
     * @method
     * @name PanneauTable#mettreAJourDonnees
     * @param {object} donnees Objet d'occurence à mettre à jour
     * @param {string} indicateur attribut du Id de l'occurence se retrouvant dans l'objet donnees
     */
    PanneauTable.prototype.mettreAJourDonnees = function(donnees, indicateur){       
        var that = this;
       
        $.each(donnees, function(index, feature) {
            that.enreg = that.donnees.obtenirOccurenceParId(feature[indicateur]);
            
            if(that.enreg) {
                $.each(feature.properties, function(key, value){
                    that.enreg.definirPropriete("/" + that.template.proprietesBase + "." + key, value);
                });
            }
            else{
                console.log("Occurrence " + feature[indicateur] + " non trouvée");
            }
        });
        
        that.enreg = undefined; 
        that.rafraichir();       
    };
    
    PanneauTable.prototype.verifierTableau = function(){
        var erreurs = this._panel.store.queryBy(function(e){return !e.isValid()});
        if(erreurs.length == 0){return true;}
        
        $.each(erreurs.items, function(index, erreur) {
            var occurrence = erreur.json;
            $.each(erreur.fields.items, function(index2, field) {
                if(!field.allowBlank && (erreur.data[field.name] === "" || erreur.data[field.name] === null)){
                    occurrence.definirErreur(field.name, {message: "Ce champs est obligatoire"});     
                }
            });
        });
        
        this.afficherErreurs();
        return false;
    };

    /**
     * Ajouter les erreurs reçues dans les occurences
     * @method
     * @name PanneauTable#ajouterErreurs
     * @param {type} donnees Données contenant les ID des occurences et les erreurs
     */
    PanneauTable.prototype.ajouterErreurs = function(donnees, categorie){
        var that = this;
        
        $.each(donnees, function(index, erreur) {
            var occurrence = that.donnees.obtenirOccurenceParId(index);
            occurrence.definirErreurs(erreur, categorie);          
        });
        
        this.afficherErreurs();
    };
    
    /**
     * Retirer les erreurs des occurences
     * @methode
     * @name PanneauTable#retirerErreurs
     */
    PanneauTable.prototype.retirerErreurs = function(){
      $.each(this.donnees.listeOccurences, function(key, occurrence){
         occurrence.erreurs = undefined;
      });
      
      this.afficherErreurs();     
    };
    
    PanneauTable.Controles = function(_){
        this._ = _;
        this.activerSelection();
    };   
    
    PanneauTable.Controles.prototype.activerClique = function() {
        this._._panel.on('rowClick', this.clique, this);
    };
    
    PanneauTable.Controles.prototype.clique = function(grid, rowIndex, e) {
        var json = this._._panel.store.data.items[rowIndex].json;
        this._.declencher({ type: "tableEnregistrementClique", indexEnregistrement: rowIndex, enregistrement: json }); 
    };
    
    PanneauTable.Controles.prototype.activerSelection = function() {
        if(!this._._panel){return false;};
        this._._panel.selModel.on('selectionchange', this._selection, this);
    };
    
    PanneauTable.Controles.prototype.desactiverSelection = function() {
        if(!this._._panel){return false;};
        this._._panel.selModel.removeListener('selectionchange', this._selection, this);
    };    

    PanneauTable.Controles.prototype._selection = function(selection) {
        var selectionIGO = [];
        $.each(selection.selections.items, function(key, value){
            selectionIGO.push(value.json);
        });
        var vecteur;
        if(this._.donnees.obtenirTypeClasse && (this._.donnees.obtenirTypeClasse() === 'Vecteur' || this._.donnees.obtenirTypeClasse() === 'VecteurCluster' || this._.donnees.obtenirTypeClasse() === 'WFS')){
            vecteur = this._.donnees;
            vecteur.deselectionnerTout({exceptions: selectionIGO});
            $.each(selectionIGO, function(key, value){
                if(value.estSelectionnee()){
                    return true;
                }
                value.selectionner();               
            });
        }
        if(this._.donnees.zoomAuto){
            this._.donnees.zoomerOccurences(this._.donnees.obtenirOccurencesSelectionnees());
        }
        
        if(this._.donnees.options.selectionSeulement){
           this._.donnees.afficherSelectionSeulement();
        }else{
            this._.donnees.afficherTous();
        }
        
        this._.declencher({ type: "tableEnregistrementSelection", selection: selectionIGO, vecteur: vecteur }); 
    };
    
    
    return PanneauTable;
    
});