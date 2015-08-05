/* global Ext, this */
require.ajouterConfig({
    paths: {
            editionService: '[edition]/public/js/app/service/service',
            panneauEdition: '[edition]/public/js/app/panneau/panneauEdition',
            rowEditor: 'libs/Ext.ux/RowEditor/RowEditor',
            rowEditorCSS: 'libs/Ext.ux//RowEditor/RowEditorCss',           
            gridFiltersCSS: 'libs/GeoExt.ux/GridFilters/css/GridFilters',
            rangeMenuCSS: 'libs/GeoExt.ux/GridFilters/css/RangeMenu',         
            rangeMenu: 'libs/GeoExt.ux/GridFilters/menu/RangeMenu',
            listMenu: 'libs/GeoExt.ux/GridFilters/menu/ListMenu',           
            gridFilters: 'libs/GeoExt.ux/GridFilters/GridFilters',
            cFilter: 'libs/GeoExt.ux/GridFilters/filter/Filter',    
            stringFilter: 'libs/GeoExt.ux/GridFilters/filter/StringFilter',    
            dateFilter: 'libs/GeoExt.ux/GridFilters/filter/DateFilter',    
            listFilter: 'libs/GeoExt.ux/GridFilters/filter/ListFilter',    
            numericFilter: 'libs/GeoExt.ux/GridFilters/filter/NumericFilter',    
            booleanFilter: 'libs/GeoExt.ux/GridFilters/filter/BooleanFilter',
            fileUploadField: 'libs/Ext.ux/FileUploadField/FileUploadField',
            fileUploadFieldCSS: 'libs/Ext.ux/FileUploadField/FileUploadField',
            editionCSS: '[edition]/public/css/edition'
    },
    shim: {
        stringFilter: {
            deps: ['filter']
        },
        dateFilter: {
            deps: ['filter']
        },
        listFilter: {
            deps: ['filter']
        },
        numericFilter: {
            deps: ['filter']
        },
        booleanFilter: {
            deps: ['filter']
        }
    }
});

/** 
 * Module pour l'objet {@link Panneau.PanneauRegroupement}.
 * @module PanneauRegroupement
 * @requires panneau
 * @author Michael Lane FADQ
 * @version 1.0
 */

define(['aide', 'analyseurGeoJSON', 'panneau', 'editionService', 'panneauEdition', 'outilAssocierFichier', 'css!rowEditorCSS', 'rowEditor', 
        'css!gridFiltersCSS', 'css!rangeMenuCSS', 'rangeMenu', 'listMenu', 'gridFilters', 'cFilter', 'stringFilter', 
        'dateFilter','listFilter', 'numericFilter', 'booleanFilter', 'fileUploadField', 'css!fileUploadFieldCSS', 'css!editionCSS'], 
function(Aide, AnalyseurGeoJSON, Panneau, Service, PanneauEdition, OutilAssocierFichier) {  

    /** 
    * Création de l'object Panneau.PanneauRegroupement.
    * Pour la liste complète des paramètres, voir {@link Panneau}
    * @constructor
    * @name Panneau.PanneauRegroupement
    * @class Panneau.PanneauRegroupement
    * @alias PanneauRegroupement:panneau.PanneauRegroupement
    * @extends Panneau
    * @requires panneau
    * @param {object} [options] Objet contenant les propriétés du panneau
    * @returns {Panneau.PanneauRegroupement} Instance de {@link Panneau.PanneauRegroupement}
   */    
   //http://dev.sencha.com/deploy/ext-3.3.1/examples/grid/row-editor.html
   
    function PanneauRegroupement(options){
        this._toolbar;
        this.options = options || {};
        
        this.options.id = 'regroupement-panneau';
        
        this.defautOptions.titre = 'Regroupement';
    };

    PanneauRegroupement.prototype = new Panneau();
    PanneauRegroupement.prototype.constructor = PanneauRegroupement;

    /** 
     * Obtenir le panneau ExtJS pour les regroupements
     * @method 
     * @private
     * @name PanneauRegroupement#_init
    */

    PanneauRegroupement.prototype._init = function(){       
        var that = this;
        
        this.defautOptions = $.extend({}, this.defautOptions);
    
        this.navigateur = Aide.obtenirNavigateur();
        this.projection = this.navigateur.carte.obtenirProjection();
        this.serviceEdition = new Service({projectionCarte:this.projection, url: Aide.utiliserBaseUri("[edition]/app/")});    
     
        this.serviceEdition.decrireRegroupement(this.succesDecrireRegroupement.bind(this), this.erreurDecrireRegroupement.bind(this));       
        
        this.defautOptions.layout= 'border';
        this.defautOptions.layoutConfig= {
            columns: 1
        };
        this.defautOptions.height= 600;
        
        Panneau.prototype._init.call(this); 
        
        //Panneau qui contient la grille
        var panRegr= new Ext.Panel({
              title: this.options.titre,
             // autoScroll:true,
              //forceLayout: true,
              layout: "fit",
              style:"overflow-y:hidden;overflow-x: hidden;",
              autoDestroy: false
        });

        this._panel = panRegr;        
        this.listePanEditionAssoc = [];       
    };
    
    /**
     * Construction du panneau
     * @method
     * @name PanneauRegroupement#construirePanneau
     */
    PanneauRegroupement.prototype.construirePanneau = function(){             
        var that = this;
        /*-------------------------------------------------------------------
        Création du data store contenant les données
        -------------------------------------------------------------------*/        
        var rSchema = Ext.data.Record.create(this.fields);
        
        var store =  new Ext.data.Store({
            reader: new Ext.data.JsonReader({fields: rSchema}),
            data: [],
            //Ajouter l'identificateur de clé primaire, ça permet d'obtenir la valeur de la foreingkey lors de l'ajout d'une nouvelle géométrie
            //primaryKey: "ID",
            listeners: {
                remove: function(store,record, index) {
                    if(store.getCount() === 0) {
                    var tbar = gridRegr.toolbars[0];
                        tbar.findById("btnSuppRegr").disable();
                        tbar.findById("btnDupliRegr").disable();
                        tbar.findById("btnAssocFich").disable();
                    }
                                         
                    //Si aucune donnée n'était saisie pour le regroupement (nouveau + Annuler sans sauvegarde à la BD) et que le record n'est pas un nouveau
                    //qui n'a pas pu être sauvegarder (erreur à la validation)
                    if(!$.isEmptyObject(record.data) && record.data !== that.recordNouveau) {
                        that.serviceEdition.supprimerRegroupement(record.data, that.succesSupprimer.bind(that), that.erreurSupprimer.bind(that));
                        store.removed.push(record);
                    }                  
                },
                add: function(e, record, index) {
                    
                    //that.serviceEdition.creerRegroupement(record, that.obtenirFkId, that.succesCreer, that.erreurCreer);
                },
                update: function(e, record, operation) {
                    
                    if(operation === "edit" && !record.nouveau){
                        that.serviceEdition.modifierRegroupement(record.data, that.succesModifier.bind(that), that.erreurModifier.bind(that));      
                    }
                    if(operation === "commit"){
                        that.gridRegr.selModel.selectRecords([record]);
                    }
                }
            }
        });

       //RowEditor qui permet la modification des lignes une à la fois
        var editor = new Ext.ux.grid.RowEditor({
            saveText: 'Enregistrer'
        });
        
        this.editeur = editor;
        
        var filters = new Ext.ux.grid.GridFilters({
            autoReload: false,
            // encode and local configuration options defined previously for easier reuse
            encode: false, // json encode the filter query
            local: true,   // defaults to false (remote filtering)
            filters: this.filtre //Champs filtre défini selon les colonnes du tableau
        }); 
        
        //Code permettant de contrer le problème d'affichage du rowEditor lors d'une seule ligne
        Ext.override(Ext.grid.GridView, {
            getEditorParent: function() {
                return document.body;
            }
        });

        var gridRegr = new Ext.grid.GridPanel({
            plugins: [editor, filters],
            id: "editorGridRegroup",
            stateful: false,
            region: "center",
            layout: "fit",
            clicksToEdit: 1, //Un clic sélection, un clic édition
            //viewConfig: {forceFit: true, autoFill:true},
            enableColumnHide: false,
            forceLayout: true,
            viewConfig: {
                        forceFit: true,
                        emptyText: "Aucun élément",
                        deferEmptyText: false
                    },
            listeners: {
                afterrender: function(e) {
                    e.view.fitColumns();       
                }
            },
            store: store,
            tbar: [{
                iconCls: 'btn-ajouter',
                text: 'Ajouter',
                tooltip: "Ajouter un élément",
                id: 'btnAjouterRegr',
                disabled: true,
                handler: function(btn, event){
                    if(!that.estChangePanneauxAssocies()){
                    
                        var e = new rSchema();

                        editor.stopEditing();
                        store.insert(0, e);
                        gridRegr.getView().refresh();

                        gridRegr.getSelectionModel().selectRow(0);
                        editor.startEditing(0, false);
                        gridRegr.setHeight(gridRegr.getHeight()+180);
                        editor.values = {}; //Ne pas permettre le changement de ligne avant enregistrement
                        btn.setDisabled(true);
                        btn.findParentByType("toolbar").findById("btnSuppRegr").setDisabled(true);
                        btn.findParentByType("toolbar").findById("btnDupliRegr").setDisabled(true);
                        btn.findParentByType("toolbar").findById("btnAssocFich").setDisabled(true);
                        e.nouveau = true;
                    }
                    else{
                        that.afficherMessageChangement(that.actionInfosModifies.bind(that, false));
                        return false;
                    }
                }
            },
            {
                iconCls: 'btn-supprimer',
                text: 'Supprimer',
                tooltip: "Supprimer l'élément sélectionné",
                disabled: true,
                id: 'btnSuppRegr',
                handler: function(){
                        Aide.afficherMessage({titre: "Supprimer", 
                            message: "Désirez-vous supprimer cet élément et toutes ses géométries associés?",
                            boutons: "OUINON",
                            icone:"QUESTION",
                            action: that.supprimerRegroupement.bind(that)}
                        );
                }
            },
            {
                iconCls: 'btn-dupliquer',
                text: 'Dupliquer',
                tooltip: "Dupliquer l'élément sélectionné",
                disabled: true,
                id: 'btnDupliRegr',
                handler: function(){       
                    var action = function(){
                        Aide.afficherMessage({titre: "Dupliquer", 
                            message: "Désirez-vous dupliquer cet élément?",
                            boutons: "OUINON",
                            icone:"QUESTION",
                            action: that.dupliquerRegroupement.bind(that)}
                        );   
                    };
                    
                    //Si des modifications ont été faites
                    if(that.estChangePanneauxAssocies()) {
                       that.afficherMessageChangement(that.actionInfosModifies.bind(that, action));
                       return false;
                    }
                    else{                   
                        action.call();
                    }
                }                  
            },
            {
                iconCls: 'btn-associerFichier',
                text: 'Associer des fichiers',
                tooltip: "Associer des fichiers",
                disabled: true,
                hidden: !this.indFichierAssoc,
                id: 'btnAssocFich',
                handler: function(){
                        that.appelerFenetreFichierJoin();
                    }   
            }],
            colModel: new Ext.grid.ColumnModel(this.columnModel),
            sm: new Ext.grid.RowSelectionModel({
                singleSelect:true,
                listeners: {
                    beforerowselect: function(e, rowIndex, keepExisting, record) {
                        
                        //Si c'est une nouvelle ligne, on ne la sélectionne pas
                        if(jQuery.isEmptyObject(record.data)){
                            return false;
                        }
                        
                        //Sélectionner sans faire d'opération
                        if(that.selectSansOperation) {
                            return true;
                        }
                        
                        //Définition des paramètres de contexte rowSelect pour réutilisation dans l'enchainement des méthodes
                        that.contexteRowSelect = new Array();
                        that.contexteRowSelect.contexte = e;
                        that.contexteRowSelect.rowIndex = rowIndex;
                        that.contexteRowSelect.record = record;                      
                        
                        if(that.estChangePanneauxAssocies()){
                            that.afficherMessageChangement();
                            
                            that.selectSansOperation = true;
                            that.nextSelection = record;
                            
                            //Remettre la sélection précédente/perdu par sélection externe
                            e.selectRecords([that.currentSelection]);                            
                            return false;
                        }
                    },
                    rowselect: function(e, rowIndex, record) {
                        
                        //Sélectionner sans faire d'opération
                        if(that.selectSansOperation) {
                            that.selectSansOperation = false;  
                            return true;
                        }
                        
                        that.currentSelection = record;                    
                        that._nouvelleSelection();
                    },
                    rowdeselect: function(e, rowIndex, r){
                        var tbar = e.grid.toolbars[0];
                        tbar.findById("btnSuppRegr").disable();
                        tbar.findById("btnDupliRegr").disable();
                        tbar.findById("btnAssocFich").disable();
                    }
                }
            })          
        });
        
        //Pour utilisation dans les contextes des autres méthodes
        this.gridRegr = gridRegr;
        this.store = store;
        
        //Évènement en début d'édition
        editor.on('beforeedit', 
            function() {
                //Désactiver les boutons
                this.grid.getTopToolbar().findById("btnAjouterRegr").setDisabled(true);
                this.grid.getTopToolbar().findById("btnSuppRegr").setDisabled(true);
                this.grid.getTopToolbar().findById("btnDupliRegr").setDisabled(true);
                this.grid.getTopToolbar().findById("btnAssocFich").setDisabled(true);
                Ext.getBody().mask();
            });
        
        //Évènement sur le bouton Annuler en mode édition        
        editor.on('canceledit',
            function(roweditor, forced) {
                editor.stopEditing();
                //On supprime la ligne nouvellement ajouté
                if(roweditor.record.nouveau === true) {
                    var r = gridRegr.store.getAt(roweditor.rowIndex);
                    gridRegr.getStore().remove(r);
                }
                
                this.grid.getTopToolbar().findById("btnAjouterRegr").setDisabled(false);
                
                
                if(that.currentSelection && this.grid.getSelectionModel().getSelections().length === 0) {
                    this.grid.selModel.selectRecords(that.currentSelection);                    
                }
                
                //Réactiver les boutons si un élément est sélectionné
                if(this.grid.getSelectionModel().getSelections().length !== 0) {         
                    this.grid.getTopToolbar().findById("btnSuppRegr").setDisabled(false);
                    this.grid.getTopToolbar().findById("btnDupliRegr").setDisabled(false);
                    this.grid.getTopToolbar().findById("btnAssocFich").setDisabled(false);
                }
                
                Ext.getBody().unmask();
            }
         );
 
        //Évènement sur le bouton Enregistrer en mode édition 
        editor.on('afteredit', 
            function(e) {
                //Réactiver les boutons
                this.grid.getTopToolbar().findById("btnAjouterRegr").setDisabled(false);
                this.grid.getTopToolbar().findById("btnSuppRegr").setDisabled(false);
                this.grid.getTopToolbar().findById("btnDupliRegr").setDisabled(false);
                this.grid.getTopToolbar().findById("btnAssocFich").setDisabled(false);
                Ext.getBody().unmask();
                
                var fkId = that.obtenirFkId();
                
                if(e.record.nouveau) {
                    that.serviceEdition.creerRegroupement(e.record.data, fkId, that.succesCreer.bind(that), that.erreurCreer.bind(that));
                
                    //Retirer le flag de nouveau record
                    e.record.nouveau = undefined;
                    that.recordNouveau = e.record.data;
                }
            }
        );
 
        this._panel.add(gridRegr);
        
        this.serviceEdition.obtenirDescriptionDocument(this.succesObtenirDescriptionDocument.bind(this), this.erreurObtenirDescriptionDocument.bind(this));
    };
    
    /**
     * Activer/désactiver le bouton d'ajout de regroupement
     * @method
     * @name PanneauRegroupement#activerAjout
     * @param {bool} indice True si on active, false pour désactiver
     */
    PanneauRegroupement.prototype.activerAjout = function(indice) {   
        if(indice === true) {
            this.gridRegr.toolbars[0].findById("btnAjouterRegr").enable();
        }
        else {
            this.gridRegr.toolbars[0].findById("btnAjouterRegr").disable();
        } 
    };
    
    /**
     * Obtenir le modèle d'une colonne
     * @method
     * @private
     * @name PanneauRegroupement#_obtenirColumnModel
     * @param {objet} colTemplate Objet contenant les données pour contruire le modèle de colonne
     * @returns {objet} Colonne
     */
    PanneauRegroupement.prototype._obtenirColumnModel = function(colTemplate){
        var editor, rendu;
        var that=this;
        
        if(!colTemplate.editable) {        
            editor = undefined;
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
                if(index !== -1) {
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
        
        var titre;
        if(colTemplate.obligatoire) {
            titre = "*" + colTemplate.titre;      
        }
        else{
            titre = colTemplate.titre;
        }

        return {
            header   : titre, 
            width    : colTemplate.largeur, 
            sortable : colTemplate.triable, 
            alignement : colTemplate.alignement,
            dataIndex: colTemplate.propriete,
            renderer : rendu,
            editor : editor,
            filterable: true
        };
    };
       
    /**
     *  Méthode pour obtenir l'élément filtre pour une colonne
     * @param {object} element Objet élément contenant les attributs pour contruire un fields
     * @returns {filtre} 
     */
    PanneauRegroupement.prototype._obtenirFiltre = function(element) {   
        var filtreOption = new Array();
        var type;
        
        if(element.visible === "false"){
            return false;
        }
        
        if(element.type === "nombre" || element.type === "integer"){
            type = "numeric";
        }
        else if(element.type === "enumeration"){
            type = "list"; 
                    
            $.each(element.valeurs, function(index, valeur){
                filtreOption.push([valeur["id"], valeur["value"]]); 
            }); 
        }
        else {
            type = "string";
        }
        
        filtre = ({
            type: type,
            dataIndex: element.propriete,
            options: filtreOption
        });
        
        return filtre;         
    };
    
    /**
     *  Méthode pour définir un champ pour le store de données de Regroupement
     * @param {object} element Objet élément contenant les attributs pour contruire un fields
     * @returns {fields} 
     */
    PanneauRegroupement.prototype._obtenirChamps = function(element) {
        fields = ({
            name:element.propriete, 
            type: element.type,
            useNull: true
        });
        
        return fields;         
    };
    
    /**
     * Methode appelée à la suite du succès de l'appel Ajax pour décrire les colonnes du regroupement
     * @method
     * @private
     * @name PanneauRegroupement#succesDecrireRegroupement
     * @param {object} data Données de descriptions du regroupement retournées par l'appel ajax
     */
    PanneauRegroupement.prototype.succesDecrireRegroupement = function(data){    
        console.log("Succès desc");
        this.columnModel = new Array();
        var that = this;
        var column;
        var field;
        this.fields = new Array();
        this.filtre = new Array();
        
        $(data[0]).each(function( index, element ) {            
            //Si on doit afficher l'élément
            if(element.visible === undefined || element.visible === true) {
                column = that._obtenirColumnModel(element);
                that.columnModel.push(column);
            }
            
            //Définir les champs pour le store
            field = that._obtenirChamps(element);           
            that.fields.push(field);
            
            //Définir les champs du filtre
            filtre = that._obtenirFiltre(element); 
            that.filtre.push(filtre);           
        });
        
        //Indicateur que des fichiers peuvent être associés au regroupement true/false pour activer le bouton
        this.indFichierAssoc = data[1]; 
        
        this.construirePanneau();
    };
    
    /**
     * Méthode appelé lors de l'échec de l'appel ajax pour décrire les colonnes du regroupement
     * @method
     * @name PanneauRegroupement#erreurDecrireRegroupement     
     * @param {type} status Statut retourné par la fonction ajax
     * @param {type} error Erreur retournée par la fonction ajax
     */
    PanneauRegroupement.prototype.erreurDecrireRegroupement = function(status, error){
        console.log("Erreur décrire regroupement");
    };
    
    /**
     * Méthode retournant l'objet Extjs représentant le panneau Regroupement
     * @method
     * @private
     * @name PanneauRegroupement#_getPanel
     * @returns {object} Objet Extjs du panneau
     */
    PanneauRegroupement.prototype._getPanel = function(){
        return this._panel;
    };
    
    /**
     * Méthode appelée par le succès de l'appel Ajax pour la suppresion d'un regroupement
     * @method
     * @name PanneauRegroupement#succesSupprimer
     */
    PanneauRegroupement.prototype.succesSupprimer = function(){
        this.store.commitChanges();
        console.log("Succes Supprimer Regroupement");
        Aide.afficherMessage("Message", "Élément supprimé avec succès.", "OK", "INFO");
    };
    
    /**
     * Méthode appelée par le succès de l'appel Ajax pour la modification d'un regroupement
     * @method
     * @name PanneauRegroupement#succesModifier
     */
    PanneauRegroupement.prototype.succesModifier = function(data){       
        var that = this;
        
        if(data["result"] !== undefined && data["result"] == "success"){      
        
            //Mettre à jour l'enregistrement ajouté avec les attributs définis par trigger
            var record = that.store.getById(that.idRegroupement).data;
            $.each(data["grouping"][0], function(key, value) {
                if(record[key] !== undefined) {
                    record[key] = value;
                 }    
            });

            var callBack = function(){
                that.store.commitChanges();
            };
            console.log("Succes Modifier Regroupement");
            Aide.afficherMessage({titre: "Message", message: "Élément modifié avec succès.", boutons:"OK", icone:"INFO", action:callBack});
        }
        
        if(data["result"] !== undefined && data["result"] == "failure"){  
            this.store.rejectChanges();
            
            var mess = "";
            
            $.each(data["error"], function(index, elem){
                if(elem["message"]){
                    mess += elem["message"] + "<br />";
                }
            });
            that.store.rejectChanges();
            Aide.afficherMessage("Erreur", mess, "OK", "ERREUR");
            
            return false;         
        }    
    };  
    
    /**
     * Méthode appelée par le succès de l'appel Ajax pour la création d'un regroupement
     * @method
     * @name PanneauRegroupement#succesCreer
     * @param {object} data Objet contenant les données à jour du regroupement
     */    
    PanneauRegroupement.prototype.succesCreer = function(data){
        var that = this;
        
        if(data["result"] == "failure"){
            
            var mess = "";
            
            $.each(data["error"], function(index, elem){
                if(elem["message"]){
                    mess += elem["message"] + "<br />";
                }
            });
            that.store.removeAt(0);
            that.store.rejectChanges();
            Aide.afficherMessage("Erreur", mess, "OK", "ERREUR");
            
            return false;
        }
        
        //Mettre à jour l'enregistrement ajouté avec les attributs définis par trigger
        $.each(data["grouping"][0], function(key, value) {
            if(that.recordNouveau[key] !== undefined) {
                that.recordNouveau[key] = value;
             }    
        });
        that.store.getModifiedRecords()[0].id = data["id"];
        
        
        var callBack = function(){
            that.store.commitChanges();
        };
        that.recordNouveau = undefined;
        console.log("Succes Creer Regroupement");
        Aide.afficherMessage({titre: "Message", message: "Élément créé avec succès.", boutons:"OK", icone:"INFO", action:callBack});
    };  

    /**
     * Méthode appelée par l'échec de l'appel Ajax pour la suppresion d'un regroupement
     * @method
     * @name PanneauRegroupement#erreurSupprimer
     */    
   PanneauRegroupement.prototype.erreurSupprimer = function(){
        Aide.afficherMessage({titre: "Message", message: "Erreur lors de la suppression du " + (this.options.identifiant || "regroupement")});
        this.store.rejectChanges();
    };
    
    /**
     * Méthode appelée par l'échec de l'appel Ajax pour la modication d'un regroupement
     * @method
     * @name PanneauRegroupement#erreurModifier
     */    
    PanneauRegroupement.prototype.erreurModifier = function(){
        Aide.afficherMessage({titre: "Message", message: "Erreur lors de la sauvegarde du " + (this.options.identifiant || "regroupement")});
    };  
    
    /**
     * Méthode appelée par l'échec de l'appel Ajax pour la création d'un regroupement
     * @method
     * @name PanneauRegroupement#erreurCreer
     */    
    PanneauRegroupement.prototype.erreurCreer = function(code, data, m, d, e){
        Aide.afficherMessage({titre: "Message", message: "Erreur lors de la sauvegarde du " + (this.options.identifiant || "regroupement")});
    };
    
    /**
     * Méthode permettant la mise à jour des données du panneau de regroupement
     * @method
     * @name PanneauRegroupement#mettreAJourDonnees
     * @param {object} donnees Données des regroupements à afficher
     */
    PanneauRegroupement.prototype.mettreAJourDonnees = function(donnees){
        this.store.loadData(donnees, false);
    };
    
    /**
     * Méthode permettant de définir la foreign Key associé aux regroupements
     * @method
     * @name PanneauRegroupement#definirFkId
     * @param {integer} fkId Foreign Key a définir
     */     
    PanneauRegroupement.prototype.definirFkId = function(fkId){
        this.fkId = fkId;
    };
    
    /**
     * Méthode retournant la foreign key
     * @method
     * @name PanneauRegroupement#obtenirFkId
     * @returns {integer} FkId Retourne la foreign Key
     */
    PanneauRegroupement.prototype.obtenirFkId = function() {
        return this.fkId;  
    };
    
    /**
     * Méthode appellé lors du succès de l'appel ajax pour obtenir les couches associées au type de regroupement sélectionné
     * @method
     * @name PanneauRegroupement#succesObtenirCouchesAssocies
     * @Param {object} data Données des couches associées
     */
    PanneauRegroupement.prototype.succesObtenirCouchesAssocies = function(data){
        var that = this;
        var panneauEdition;
        var analyseur = new AnalyseurGeoJSON({
        projectionCarte: this.projection});
        var panEdition = this.navigateur.obtenirPanneauxParType("PanneauAccordeon")[0].obtenirPanneauParId("edition-panneau");
        this.listeCouches = new Array();
        
        this.navigateur.obtenirPanneauParId("panBasPanel").ouvrir();
        panEdition.ouvrir();              
        
        $.each(data, function(index, couche) {
            
            var occurences = analyseur.lire(couche["data"]);
            that.listeCouches.push(couche["title"] || couche["layer"]);
           
            panneauEdition = new PanneauEdition({titre: couche["title"] || couche["layer"],
                                service: couche["layer"],
                                colonnes: couche["describe"][0].featureType, 
                                donnees: occurences, 
                                base: undefined,
                                typeGeom: couche["describe"][0]["type"],
                                fkId: that.idRegroupement,
                                fermable: false,
                                couchesAssoc: couche.associatedLayers,
                                etiquette: couche["label"]});
                              
            panEdition.ajouterPanneau(panneauEdition);           
            
            that.listePanEditionAssoc.push(panneauEdition);                                   
        }); 
                    
        var listeOccurences = new Array();
        $.each(this.listeCouches, function(index, couche) {
            
            var coucheIgo = that.carte.gestionCouches.obtenirCouchesParTitre(couche)[0];           
            listeOccurences = listeOccurences.concat(coucheIgo.listeOccurences);                
        });

        this.carte.gestionCouches.zoomerOccurences(listeOccurences);
        
        //Retirer le contexte du rowSelection
        this.contexteRowSelect = undefined;            
        Aide.cacherMessageChargement();             
    };

    /**
     * Méthode appelée par l'échec de l'appel Ajax pour l'obtenition des couches associées au type de regroupement sélectionné
     * @method
     * @name PanneauRegroupement#erreurObtenirCouchesAssocies
     */  
    PanneauRegroupement.prototype.erreurObtenirCouchesAssocies = function(){
        console.log("Erreur Obtenir couches associées");
        
        //Retirer le contexte du rowSelection
        this.contexteRowSelect = undefined;       
        Aide.cacherMessageChargement();
    };
    
    /**
     * Méthode retournant la liste des panneaux de couche associés au regroupement
     * @method
     * @name PanneauRegroupement#obtenirPanneauxAssocies
     * @returns {Array} Liste des panneaux de couche associcés
     */
    PanneauRegroupement.prototype.obtenirPanneauxAssocies = function(){     
        return this.listePanEditionAssoc;
    };
    
    /**
     * Méthode appellé par le message de sauvegarde si un changement de sélection de regroupement
     * @method
     * @name PanneauRegroupement#effectuerActionMessageSauvegarde
     * @param {string} bouton Identifiant du bouton cliqué par l'usager
     */
    PanneauRegroupement.prototype.effectuerActionMessageSauvegarde = function(bouton){     
        if(bouton === "yes"){
            this.sauvergarderPanneauxAssocies();
            this.nextSelection = undefined;
        }else if(bouton === "no") {
            //this._nouvelleSelection();
            this.reinitialiserPanneauxAssocies();
            this.selectionnerEnregistrement(this.nextSelection);
        } else if(bouton === "cancel"){
            this.nextSelection = undefined;
        }            
        //else cancel aucune action
    };
    
    /**
     * Méthode pour lancer la sauvegarde des panneaux associés
     * @method
     * @name PanneauRegroupement#sauvergarderPanneauxAssocies
     */
    PanneauRegroupement.prototype.sauvergarderPanneauxAssocies = function(){       
        var panneaux = this.obtenirPanneauxAssocies();
        
        $.each(panneaux, function(index, panneau) {
           panneau.sauvegarder();
        });
    };
    
    /**
     * Méthode retournant un bool indiquant s'il y a des modifications dans les panneau de couche associés au regroupement
     * @method
     * @name PanneauRegroupement#estChangePanneauxAssocies
     * @returns {bool} true Si des changements sont non enregistrés, sinon false
     */   
    PanneauRegroupement.prototype.estChangePanneauxAssocies = function(){
       var panneaux = this.obtenirPanneauxAssocies();
       
       var estChange = false;
        
        $.each(panneaux, function(index, panneau) {
           estChange = estChange || panneau.estChange();
        });
        
        return estChange;     
    };
    
    /**
     * Méthode pour fermer les panneaux de couche associés
     * @method
     * @name PanneauRegroupement#fermerPanneauxAssocies
     */      
    PanneauRegroupement.prototype.fermerPanneauxAssocies = function(){        
        var panneaux = this.obtenirPanneauxAssocies();
        
        $.each(panneaux, function(index, panneau) {
           panneau.fermerPanneau();
        });
    };
    
    /**
     * Réinitialiser les données dans les panneaux associés
     * @method
     * @name PanneauRegroupement#reinitialiserPanneauxAssocies
     */
    PanneauRegroupement.prototype.reinitialiserPanneauxAssocies = function(){      
        var panneaux = this.obtenirPanneauxAssocies();
        
        $.each(panneaux, function(index, panneau) {
           panneau.fermerPanneau();
        });
        
        this.listePanEditionAssoc = [];
        this.selectSansOperation = false;
    };
      
    /**
     * Méthode affichant un message pour effectuer la sauvegarde
     * @method
     * @name PanneauRegroupement#afficherMessageChangement
     * @param {fn} action Si une action spécifique doit être faite plutôt que celle par défaut
     */
    PanneauRegroupement.prototype.afficherMessageChangement = function(action){       
        if(action === undefined) {
            action = this.effectuerActionMessageSauvegarde.bind(this);
        }        
        
        Aide.afficherMessage({titre: "Informations non sauvegardées", 
                        message: "Désirez-vous sauvegarder les modifications des couches?",
                        boutons: "OUINONANNULER",
                        icone:"QUESTION",
                        action: action});  
    };
    
    /**
     * Méthode déclenchée lors d'une nouvelle sélection si aucun changement
     * @method
     * @private
     * @name PanneauRegroupement-_nouvelleSelection
     */
    PanneauRegroupement.prototype._nouvelleSelection = function(){      
        Aide.afficherMessageChargement();

        this.fermerPanneauxAssocies(); 
        
        var contexte = this.contexteRowSelect.contexte;
        var rowIndex = this.contexteRowSelect.rowIndex;
        var record = this.nextSelection || this.contexteRowSelect.record;
        this.idRegroupement = record.id;

        var tbar = contexte.grid.toolbars[0];
        tbar.findById("btnSuppRegr").enable();
        tbar.findById("btnDupliRegr").enable();
        tbar.findById("btnAssocFich").enable();

        this.serviceEdition.obtenirCouchesAssociees(record.store.getAt(rowIndex).data, this.succesObtenirCouchesAssocies.bind(this), this.erreurObtenirCouchesAssocies.bind(this));  
    };
    
    /**
     * Retirer la sélection du regroupement
     * @method
     * @name PanneauRegroupement#deselectionner
     */
    PanneauRegroupement.prototype.deselectionner = function() {       
        if(this._panel.getComponent("editorGridRegroup").selModel !== undefined && this._panel.getComponent("editorGridRegroup").selModel.getSelected() !== undefined) {
            //this._panel.getComponent("editorGridRegroup").selModel.clearSelections(true);
            this._panel.getComponent("editorGridRegroup").selModel.deselectRow(this._panel.getComponent("editorGridRegroup").selModel.last);
        }
    };
    
    /**
     * Sélectionner un regroupement à charger
     * @method
     * @name PanneauRegroupement#selectionner
     * @param {integer} idRegroupement ID du regroupement à sélectionner
     */
    PanneauRegroupement.prototype.selectionner = function(idRegroupement) {      
        //Obtenir l'enregistrement sélectionné
        var selection =  this.gridRegr.selModel.getSelected();
        
        //Obtenir l'enregistrement à sélectionner
        var selectRecord =  this.store.getById(idRegroupement);
        
        //Si différent, on sélectionne le nouveau
        if(selection !== selectRecord) {               
            this.gridRegr.selModel.selectRecords([selectRecord]);    
        }
    };
    
    /**
     * Sélectionner un enregistrement à charger
     * @method
     * @param {object} enregistrement Objet de données de la ligne à sélectionner
     * @name PanneauRegroupement#selectionnerEnregistrement
     */
    PanneauRegroupement.prototype.selectionnerEnregistrement = function(enregistrement) {       
        //Obtenir l'enregistrement sélectionné
        var selection =  this.gridRegr.selModel.getSelected();
        
        //Si différent, on sélectionne le nouveau
        if(selection != enregistrement) {               
            this.gridRegr.selModel.selectRecords([enregistrement]);    
        }
    };
    
    /**
     * Réinitialiser la liste des regroupements et ses couches associées
     * @method
     * @name PanneauRegroupement#reinitialiser
     */
    PanneauRegroupement.prototype.reinitialiser = function() {     
        this.deselectionner();
        this.fermerPanneauxAssocies();
        this.store.removeAll();
    };
    
    /**
     * Ouvrir le panneau Regroupement
     * @method
     * @name PanneauRegroupement#ouvrir
     */
    PanneauRegroupement.prototype.ouvrir = function() {
        this.navigateur.obtenirPanneauParId("panBasPanel").ouvrir();
        this._panel.expand();
        this.gridRegr.expand();
    };
    
    /**
     * Supprimer un regroupement
     * @method
     * @name PanneauRegroupement#supprimerRegroupement
     * @param {string} action valeur yes/no selon la sélection de l'utilisateur au message d'action
     */
    PanneauRegroupement.prototype.supprimerRegroupement = function(action) {
        if(action === "yes"){           
            this.editeur.stopEditing(); //Arrêter l'édition
            var s = this.gridRegr.getSelectionModel().getSelections();  //Obtenir la/les sélections
            for(var i = 0, r; r = s[i]; i++){
                this.store.remove(r); //Supprimer l'enregistrement
            }
            this.fermerPanneauxAssocies(); //Fermer les panneaux actifs
        } 
    };
    
    /**
     * Dupliquer un regroupement
     * @method
     * @name PanneauRegroupement#dupliquerRegroupement
     * @param {string} action valeur yes/no selon la sélection de l'utilisateur au message d'action
     * @returns {undefined}
     */
    PanneauRegroupement.prototype.dupliquerRegroupement = function(action){       
        if(action === "yes"){
            this.serviceEdition.dupliquerRegroupement(this.idRegroupement, this.succesDupliquerRegroupement.bind(this), this.erreurDupliquerRegroupement.bind(this));
        }
    };
    
    /**
     * Succès à exécuter suite à la duplication du regroupement
     * @method
     * @name PanneauRegroupement#successDupliquerRegroupement
     * @param {json} data données du nouveau regroupement
     */
    PanneauRegroupement.prototype.succesDupliquerRegroupement = function(data){
        this.store.loadData(data, true);
        this.gridRegr.getView().refresh();

        this.selectionnerEnregistrement(this.store.getAt(this.store.getCount()-1));
    };
    
    /**
     * Erreur à exécuter suite à l'échec de la duplication du regroupement
     * @method
     * @name PanneauRegroupement#erreurDupliquerRegroupement
     */
    PanneauRegroupement.prototype.erreurDupliquerRegroupement = function(){
          Aide.afficherMessage("Message", "Erreur lors de la duplication ", "OK", "ERREUR");
    };
    
    /**
     * Appeler la fenêtre qui permet de joindre un fichier au regroupement
     * @method
     * @name PanneauRegroupement#appelerFenetreFichierJoin
     */
    PanneauRegroupement.prototype.appelerFenetreFichierJoin = function(){          
        if(!this.fenetreFichierJoin){
            this.fenetreFichierJoin = new OutilAssocierFichier({supprimerFichier:this.supprimerDocument.bind(this), 
                                                                associerFichier: this.associerDocument.bind(this),
                                                                visualiserFichier: this.visualiserDocument.bind(this),
                                                                listerFichiers: this.listerDocuments.bind(this),
                                                                champs: this.champsFichier,
                                                                colonnes: this.columnModelFichierAssoc});
        }       
        
        this.fenetreFichierJoin.afficherFenetre();
    };
    
    /**
     * Méthode qui permet d'associer un document au regroupement
     * @method
     * @name PanneauRegroupement#associerDocument
     * @param {file} document Document à associer
     * @param {string} nom nom du document
     * @param {string} extension extension du document
     * @param {integer} taille taille du document
     * @param {string} mime mime du document
     * @param {fct} paramFctSuccess fonction à exécuter au succès de l'association du document
     * @returns {undefined}
     */
    PanneauRegroupement.prototype.associerDocument = function(document, nom, extension, taille, mime, paramFctSuccess){    
        Aide.afficherMessageChargement();
        
        var regroupement = JSON.stringify(this.gridRegr.getSelectionModel().getSelected()["json"]);
               
        this.serviceEdition.associerDocument(regroupement, document, nom, extension, taille, mime, this.succesAssocierDocument.bind(this, paramFctSuccess), this.erreurAssocierDocument.bind(this));
    };
    
    /**
     * Supprimer un document
     * @method
     * @name PanneauRegroupement#supprimerDocument
     * @param {object} document objet du document à supprimer
     * @param {fct} paramFctSuccess function à exécuter au succès de la suppression du document
     */
    PanneauRegroupement.prototype.supprimerDocument = function(document, paramFctSuccess){     
        this.serviceEdition.supprimerDocument(document, this.succesSupprimerDocument.bind(this, paramFctSuccess), this.erreurSupprimerDocument.bind(this));
    }; 
    
    /**
     * Visualiser le document sélectionné
     * @method
     * @name PanneauRegroupement#visualiserDocument
     * @param {object} document Object du document à visualiser
     */
    PanneauRegroupement.prototype.visualiserDocument = function(document){     
        this.serviceEdition.visualiserDocument(document, this.attrNomFichier, this.attrMimeFichier, this.succesVisualiserDocument.bind(this), this.erreurVisualiserDocument.bind(this));
    }; 
    
    /**
     * Lister les documents
     * @method
     * @name PanneauRegroupement#listerDocuments
     * @param {fct} paramFctSuccess function à exécuter au succès de l'affichage de la liste des documents
     * @returns {undefined}
     */
    PanneauRegroupement.prototype.listerDocuments = function(paramFctSuccess){        
        var regroupement = JSON.stringify(this.gridRegr.getSelectionModel().getSelected()["json"]);
                
        this.serviceEdition.listerDocuments(regroupement, this.succesListerDocuments.bind(this, paramFctSuccess), this.erreurListerDocuments.bind(this));
    };     
    
    
    /**
     * Méthode suivant le succès de l'association d'un document
     * @method
     * @name #PanneauRegroupement#succesAssocierDocument
     * @param {fct} callBack Fonction à appeler à la suite
     * @param {object} data Objet de données renvoyés du serveur
     * @returns {Boolean} true si bien déroulé sinon false
     */
    PanneauRegroupement.prototype.succesAssocierDocument = function(callBack, data){       
        Aide.cacherMessageChargement();
        
        if(typeof data == "object" && data["result"] == "success"){
            Aide.afficherMessage({titre: "Message", message: "Le document a été associé avec succès.", boutons: "OK", icone:"INFO", action:callBack});
            return true;
        }
        
        if(typeof data == "object" && data["result"] == "failure"){
            var mess = "";
            $.each(data["error"], function(index, type){
                if(typeof type === "object"){
                    
                    $.each(type, function(key, message){
                       mess += message["message"] + "<br />"; 
                    });
                    
                }else{
                    mess += type + "<br />";
                }
            });
            
            Aide.afficherMessage("Message", mess, "OK", "ERREUR");
            return false;
        }
                      
        if(data.indexOf("Warning") >0) {
            Aide.afficherMessage("Erreur", data);
            console.log(data);
            return false;
        }
    };
    
    /**
     * Méthode suivant l'échec de l'association d'un document
     * @method
     * @name PanneauRegroupement#erreurAssocierDocument
     */
    PanneauRegroupement.prototype.erreurAssocierDocument = function(){
        Aide.cacherMessageChargement();
        
        Aide.afficherMessage("Erreur", "Erreur lors du transfert du document numérisé.", "OK", "ERREUR");
    };
    
    /**
     * Méthode suivant le succès de la suppression d'un document
     * @method
     * @name #PanneauRegroupement#succesSupprimerDocument
     * @param {fct} callBack Fonction à appeler à la suite
     * @param {object} data Objet de données renvoyés du serveur
     */    
    PanneauRegroupement.prototype.succesSupprimerDocument = function(callback, data){      
        Aide.cacherMessageChargement();
        
        console.log("success supprimer document");
        
        callback.call(this, data);
    };
 
    /**
     * Méthode suivant l'échec de la suppression d'un document
     * @method
     * @name PanneauRegroupement#erreurSupprimerDocument
     */    
    PanneauRegroupement.prototype.erreurSupprimerDocument = function(){     
        Aide.cacherMessageChargement();
        
        Aide.afficherMessage("Erreur", "Erreur lors de la suppression du document numérisé.", "OK", "ERREUR");
    };
    
    /**
     * Méthode suivant le succès de l'appel de la visualisation d'un document
     * @method
     * @name PanneauRegroupement#successVisualiserDocument
     * @param {object} data Objet de donnée reçu du serveur
     */
    PanneauRegroupement.prototype.succesVisualiserDocument = function(data){      
        Aide.cacherMessageChargement();
        
        console.log("success visualiser document");
    };
    
    /**
     * Méthode suivant l'échec de l'appel de la visualisation d'un document
     * @method
     * @name PanneauRegroupement#erreurVisualiserDocument
     */
    PanneauRegroupement.prototype.erreurVisualiserDocument = function(){       
        Aide.cacherMessageChargement();
        
        Aide.afficherMessage("Erreur", "Impossible d’accéder à ce document.", "OK", "ERREUR");
    };
    
    /**
     * Méthode suivant le succès de l'appel au listage des documents
     * @param {fct} callback Fonction à exécuter à la suite
     * @param {object} data Objet de données retourné par le serveur
     * @returns {undefined}
     */
    PanneauRegroupement.prototype.succesListerDocuments = function(callback, data){       
        Aide.cacherMessageChargement();
  
        callback.call(this, data);
    };
    
    /**
     * Méthode suivant l'échec de l'appel au listage des documents
     * @method
     * @name PanneauRegroupement#erreurListerDocuments
     */
    PanneauRegroupement.prototype.erreurListerDocuments = function(){    
        Aide.cacherMessageChargement();      
        
        Aide.afficherMessage("Erreur", "Impossible d’accéder aux documents numérisés.", "OK", "ERREUR");
    }; 
    
    /**
     * Méthode suivant le succès de l'appel pour obtenir la description des documents
     * @method
     * @name PanneauRegroupement#succesObtenirDescriptionDocument
     * @param {object} data Objet de données reçu du serveur contenant la description des documents
     */
    PanneauRegroupement.prototype.succesObtenirDescriptionDocument = function(data){
        console.log("Success obtenir description document");
        
        var that = this;
        var field, column;
        this.attrNomFichier = data["fileNameAttr"];
        this.attrMimeFichier = data["fileMimeAttr"];
        this.champsFichier = new Array();
        this.columnModelFichierAssoc = new Array();
               
        $(data["fields"]).each(function( index, element ) {

            //Si on doit afficher l'élément
            if(element.visible === undefined || element.visible === true) {
                column = that._obtenirColumnModel(element);
                that.columnModelFichierAssoc.push(column);
            }

            //Définir les champs pour le store
            field = that._obtenirChamps(element);           
            that.champsFichier.push(field);
        });
    };
    
    /**
     * Méthode suivant l'échec de l'appel pour obtenir la description des documents
     * @method
     * @name PanneauRegroupement#erreurObtenirDescriptionDocument
     */
    PanneauRegroupement.prototype.erreurObtenirDescriptionDocument = function(){    
        console.log("Erreur obtenir description document");
    };
    
    PanneauRegroupement.prototype.actionInfosModifies = function(actionSuite, bouton){
        if(bouton == "yes"){
            this.sauvergarderPanneauxAssocies();
        }else if(bouton == "no") {
            this.reinitialiserPanneauxAssocies();
            if(actionSuite){
                actionSuite.call();
            }
        } else if(bouton == "cancel"){
            //Aucune action
            var patate;
        }    
    };
    
    return PanneauRegroupement;
});