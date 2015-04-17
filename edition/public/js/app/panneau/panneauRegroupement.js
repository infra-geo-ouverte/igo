require.ajouterConfig({
    paths: {
            rowEditor: '../igo/librairie/ext/extension/RowEditor/RowEditor',
            rowEditorCSS: '../igo/librairie/ext/extension/RowEditor/RowEditorCss'
    }
});

/** 
 * Module pour l'objet {@link Panneau.PanneauRegroupement}.
 * @module PanneauRegroupement
 * @requires panneau
 * @author Michael Lane FADQ
 * @version 1.0
 */

define(['panneau', 'css!rowEditorCSS', 'rowEditor'], function(Panneau) {  

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
    };

    PanneauRegroupement.prototype = new Panneau();
    PanneauRegroupement.prototype.constructor = PanneauRegroupement;

    /** 
     * Obtenir le panneau ExtJS pour les schémas
     * @method 
     * @private
     * @name PanneauRegroupement#_getPanel
     * @returns {Objet} Objet ExtJS
    */

    PanneauRegroupement.prototype._init = function(){
        this.defautOptions = $.extend({}, this.defautOptions);
     //   Panneau.prototype._init.call(this);
     this.defautOptions.layout= 'border';
        this.defautOptions.layoutConfig= {
            columns: 1
        };
        this.defautOptions.height= 600;
        var that = this;
        /*-------------------------------------------------------------------
        Création du data store contenant les données
        -------------------------------------------------------------------*/
        var rSchema = Ext.data.Record.create([
            {name: "ID", type: "INTEGER"}, {name: "NO_SCHE", type: "INTEGER"}, {name: "FK_RA_NO_PERM", type: "STRING"}, 
            {name: "TYPE_SCHE", type: "STRING"}, {name: "DESC_FRAN", type: "STRING"}, {name: "DESC_SCHE", type: "STRING"}, 
            {name: "D_SCHE", type: "STRING"}, {name: "AN_ASSU", type: "INTEGER"}, {name: "TIMB_MAJ", type: "STRING"}, 
            {name: "USAG_MAJ", type: "STRING"}, {name: "actions", type: "STRING"}
        ]);

        var store =  new Ext.data.Store({
            reader: new Ext.data.JsonReader({fields: rSchema}),
            data: [],
            //Ajouter l'identificateur de clé primaire, ça permet d'obtenir la valeur de la foreingkey lors de l'ajout d'une nouvelle géométrie
            primaryKey: "ID"    
        });

        var storeTypeSchema = new Ext.data.JsonStore({
            fields: [{name: "CODE", type: "STRING"}, {name: "DESC_ABRE_FRAN", type: "STRING"}],
            data: []
        });

        var storeAnnee = new Ext.data.JsonStore({ 
                fields: [{name:"AN", mapping:"AN", type:"string"}],

                data:[{AN:2014},{AN:2013},{AN:2012},{AN:2011},{AN:2010}],
                sortInfo: {
                    field: 'AN',
                    direction: 'DESC'
                }
            });

       //RowEditor qui permet la modification des lignes une à la fois
        var editor = new Ext.ux.grid.RowEditor({
            saveText: 'Enregistrer'
        });

        /* //POUR TEST
        var formFieldRenderer = function (value, metadata) {             
           metadata.css = 'x-form-field';             
           return value;         
        };*/

        //Commun.obtenirDomaineValeur("TYPE_SCHE",storeTypeSchema);
        
        //Code permettant de contrer le problème d'affichage du rowEditor lors d'une seule ligne
        Ext.override(Ext.grid.GridView, {
            getEditorParent: function() {
                return document.body;
            }
        });

        var gridRegr = new Ext.grid.GridPanel({
            autoHeight: true, //Problème de auteur ici
            plugins: [editor],
            id: "editorGridRegroup",
            region: "center",
            layout: "fit",
            clicksToEdit: 1, //Un clic sélection, un clic édition
            //viewConfig: {forceFit: true, autoFill:true},
            enableColumnHide: false,
            listeners: {
                afterrender: function(e) {
                    e.view.fitColumns();       
                }
            },
            store: store,
            tbar: [{
                iconCls: 'btn-ajouter',
                text: 'Ajouter',
                id: 'btnAjouterRegr',
                handler: function(btn, event){
                    var e = new rSchema(/*{
                     ID:0,
                     NO_SCHE:0,
                     FK_RA_NO_PERM:"",
                     TYPE_SCHE:"", 
                     DESC_FRAN:"",
                     DESC_SCHE: "",
                     D_SCHE:(new Date()).toLocaleDateString("fr-CA"), 
                     AN_ASSU: "2014",
                     TIMB_MAJ:(new Date()).toLocaleDateString("fr-CA"),
                     USAG_MAJ:"",
                     ACTIONS:""

                    }*/);
                    
                    /*
                     * TEST POUR AJOUTER À LA FIN
                     //Obtenir le nombre d'élément
                    var nbElem = store.getCount();
                    
                    editor.stopEditing();
                    //Insérer à la fin
                    store.insert(nbElem, e);
                    gridRegr.getView().refresh();

                    gridRegr.getSelectionModel().selectRow(nbElem);
                    editor.startEditing(nbElem, false);
                     */
                    
                    editor.stopEditing();
                    store.insert(0, e);
                    gridRegr.getView().refresh();

                    gridRegr.getSelectionModel().selectRow(0);
                    editor.startEditing(0, false);
                    gridRegr.setHeight(gridRegr.getHeight()+180);
                    editor.values = {}; //Ne pas permettre le changement de ligne avant enregistrement
                    btn.setDisabled(true);
                    Ext.getCmp("btnSuppRegr").setDisabled(true);
                }
            },
            {
                ref: '../removeBtn',
                iconCls: 'btn-supprimer',
                text: 'Supprimer',
                id: 'btnSuppRegr',
                disabled: false,
                handler: function(){
                    editor.stopEditing();
                    var s = gridRegr.getSelectionModel().getSelections();
                    for(var i = 0, r; r = s[i]; i++){
                        store.remove(r);
                    }
                }
            }],
            cm: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true
                },
                columns: [
                    {header: "Numéro de schéma", align : "left", sortable: true, dataIndex: "NO_SCHE", isCellEditable:false/*, renderer:formFieldRenderer*/},
                    {header: "Type de schéma", align : "left", sortable: true, dataIndex: "TYPE_SCHE",
                     editor: new Ext.form.ComboBox({
                                id: 'cbTypeSchema',
                                store: storeTypeSchema,
                                typeAhead: true,
                                typeAheadDelay: 1,
                                mode: 'local',
                                triggerAction: 'all',
                                selectOnFocus: false,
                                forceSelection : true,
                                displayField:'DESC_ABRE_FRAN',
                                valueField:'CODE',
                                emptyText: 'Sélectionner un type de schéma'
                      }),
                      obligatoire: true,
                      messageValidation: "8S",
               //       renderer: Commun.afficherDescription(storeTypeSchema, "DESC_ABRE_FRAN", "CODE")
                    },
                    {header: "Description", align : "left", sortable: true, dataIndex: "DESC_SCHE",
                     editor:{
                        xtype: "textfield",
                        id: "inputDescSchema",
                        maxLength: 250,
                        msgTarget: 'side',
                        //On utilise l'autoCreate pour définir le fonctionnement du maxLength comme dans un input text (bloque à X caract.)
                        autoCreate : {tag: 'input',
                                      type: 'text',
                                      maxLength: 250,
                                      autocomplete: 'off'
                                     }
                     },
                     obligatoire: true,
                     messageValidation: "10S"
                    },
                    {header: "Date de schéma", align : "center", sortable: true, dataIndex: "D_SCHE", isCellEditable:false/*, renderer:formFieldRenderer*/},
                    {header: "Année d'assurance", align : "left", sortable: true, dataIndex: "AN_ASSU", isCellEditable:false/*, renderer:formFieldRenderer*/},
                    {header: "Date de mise à jour", align : "center", sortable: true, dataIndex: "TIMB_MAJ", isCellEditable:false/*, renderer:formFieldRenderer*/},
                    {header: "Utilisateur demande", align : "left", sortable: true, dataIndex: "USAG_MAJ", isCellEditable:false/*, renderer:formFieldRenderer*/},
                    {header: "Actions", dataIndex: "ID", renderer: this.definirActions, isCellEditable:false} 
                ]
            }),
            sm: new Ext.grid.RowSelectionModel({singleSelect:true})          
        });
        
        //Évènement en début d'édition
        editor.on('beforeedit', 
            function() {
                //Désactiver les boutons
                Ext.getCmp("btnAjouterRegr").setDisabled(true);
                Ext.getCmp("btnSuppRegr").setDisabled(true);
                Ext.getBody().mask();
            });
        
        //Évènement sur le bouton Annuler en mode édition        
        editor.on('canceledit',
            function(roweditor, forced) {
                editor.stopEditing();
                //On supprime la ligne nouvellement ajouté
                if(roweditor.record.dirty === undefined || roweditor.record.dirty == false)
                {
                    var r = gridRegr.store.getAt(roweditor.rowIndex);
                    gridRegr.getStore().remove(r);
                }
                //Réactiver les boutons
                Ext.getCmp("btnAjouterRegr").setDisabled(false);
                Ext.getCmp("btnSuppRegr").setDisabled(false);
                Ext.getBody().unmask();
            }
         );
 
        //Évènement sur le bouton Enregistrer en mode édition 
        editor.on('afteredit', 
            function() {
                //Réactiver les boutons
                Ext.getCmp("btnAjouterRegr").setDisabled(false);
                Ext.getCmp("btnSuppRegr").setDisabled(false);
                Ext.getBody().unmask();
            });
 
        //Panneau qui contient la grille
        var panRegr= new Ext.Panel({
              title: 'Regroupement',
                    items: [gridRegr],
                    autoScroll:true
        });

        this._panel = panRegr;

        Panneau.prototype._init.call(this);     
    };
  
    /**
     * Fonction permettant d'ajouter les actions
     * @param {type} value
     * @returns {String}
     */
  
    PanneauRegroupement.prototype.definirActions = function(value){
        
        //Répertoire des images
        var host = Igo.Aide.obtenirCheminRacine() + "/public/ModuleExterne/images/";
        
        //TODO plugger les bonnes méthodes
        var onClickOuvrir = "openSchema(" + value + ")";
        var onClickSupprimer = "deleteSchema(" + value + ")";

        return '<a href="javascript:;" onClick="' + onClickOuvrir + '"><img title="Ouvrir un schéma." src="' + host + 'ouvrir.png"></a>&nbsp<a href="javascript:;\ onClick="' + onClickSupprimer + '"><img title="Supprimer un schéma." src="' + host + 'supprimer.png"></a>';
    };
    
    PanneauRegroupement.prototype.definirActionsSchemaOuvert = function(){
        
        //Répertoire des images
        var host = Igo.Aide.obtenirCheminRacine() + "/public/ModuleExterne/images/";
        
        //TODO plugger les bonnes méthodes
        var onClickEnregistrer = "onClickSaveSchema()";
        var onClickAnnuler = "openSchema()";
        var onClickFileManager = "openFileManager()";

        return '<a href="javascript:;" onClick="' + onClickEnregistrer + '"><img title="Enregistrer les opérations." src="'+ host + 'enregistrer.png"></a>&nbsp<a href="javascript:;" onClick="' + onClickAnnuler + '"><img title="Annuler les modifications." src="' + host + 'annuler.png"></a>&nbsp<a href="javascript:;" onClick="' + onClickFileManager + '"><img title="Associer un document numérisé au schéma." src="' + host + 'doc_num_schema.png"></a>';
    };

    return PanneauRegroupement;
});
