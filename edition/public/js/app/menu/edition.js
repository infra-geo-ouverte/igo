require.ajouterConfig({
    paths: {
        'editionService': '[edition]/public/js/app/service/service',
        'panneauEdition': '[edition]/public/js/app/panneau/panneauEdition'
    }
});

/** 
 * Module pour l'objet {@link Panneau.Edition}.
 * @module edition
 * @author Michael Lane, FADQ
 * @version 1.0
 * @requires panneau
 */

define(['panneau', 'editionService', 'panneauEdition'], function(Panneau, Service, PanneauEdition) {
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
    function Edition(options){
        this.options = options || {};
        this._lastIndexRadio=0;
        this.defautOptions.titre = "Outil d'édition";
        this.defautOptions.id = 'edition-panneau';
        
        var navigateur = Igo.Aide.obtenirNavigateur();
        var projection = navigateur.carte.obtenirProjection();
        //this.serviceEdition = new Service({projectionCarte:projection, url:Igo.Aide.obtenirCheminRacine() + "edition/app/"}); 
        this.serviceEdition = new Service({projectionCarte:projection, url:"/igo/edition/app/"});  
        this.serviceEdition.obtenirCouches(this.obtenirCoucheSuccess.bind(this), this.obtenirCoucheErreur.bind(this));
        
    };

    Edition.prototype = new Panneau();
    Edition.prototype.constructor = Edition;

    /**
     * Méthode appellé lors du succès de l'appel ajax pour obtenir les couches
     * @method
     * @name Edition#obtenirCoucheSuccess
     * @Param {object} data Données des couches
     */  
    Edition.prototype.obtenirCoucheSuccess = function(data){
               
        this.storeEdition.loadData(data);       
    };

    /**
     * Méthode appellé lors du succès de l'appel ajax pour obtenir les couches
     * @method
     * @name Edition#obtenirCoucheSuccess
     */      
    Edition.prototype.obtenirCoucheErreur = function(){   
        
        console.log("Erreur! obtenirCoucheErreur!"); 
                                         
        Igo.Aide.cacherMessageChargement();
    };
    
    /**
     * Méthode appellé lors du succès de l'appel ajax pour décrire la couche
     * @method
     * @name Edition#decrireCoucheSucess
     * @Param {object} data Données description de la couche
     */      
    Edition.prototype.decrireCoucheSucess = function(data){
        
        this.DescOccuEdition = data;
                                
        var limites = Igo.nav.carte.obtenirLimites();
        
        this.serviceEdition.obtenirOccurences(this.selection, limites, this.obtenirOccurencesSucess.bind(this), this.obtenirOccurencesErreur.bind(this));
    };
    
    /**
     * Méthode appellé lors de l'échec de l'appel ajax pour décrire la couche
     * @method
     * @name Edition#decrireCoucheErreur
     */     
     Edition.prototype.decrireCoucheErreur = function(){
        
        console.log("Erreur! decrireCoucheErreur!");    
                                
        Igo.Aide.cacherMessageChargement();
    };
    
    /**
     * Méthode appellé lors du succès de l'appel ajax pour obtenir les occurrences
     * @method
     * @name Edition#obtenirOccurencesSucess
     * @Param {object} donnees Données des occurences de la couche
     */       
    Edition.prototype.obtenirOccurencesSucess = function(donnees){
        
        console.log("obtenir Occurences Sucess");

        panneauEdition = new PanneauEdition({titre: this.selection, 
                                             colonnes: this.DescOccuEdition[0].featureType, 
                                             donnees: donnees, 
                                             base: undefined,
                                             typeGeom: this.typeGeom,
                                             fermable: true});
                           
        Igo.Aide.cacherMessageChargement();

        //Igo.nav.obtenirPanneauxParType("PanneauAccordeon")[0].listePanneaux[1].ajouterPanneau(panneauEdition);    
        var accordeon = Igo.nav.obtenirPanneauxParType("PanneauAccordeon")[0];       
        accordeon.obtenirPanneauParId("edition-panneau").ajouterPanneau(panneauEdition);
    };   
    /**
     * Méthode appellé lors de l'échec de l'appel ajax pour obtenir les occurrences
     * @method
     * @name Edition#obtenirOccurencesErreur
     */       
     Edition.prototype.obtenirOccurencesErreur = function(){
          console.log("Erreur! obtenirOccurencesErreur!");   
    };
    
    /**
     * Définition du store contenant les informations des couches
     */
    Edition.prototype.storeEdition = new Ext.data.JsonStore({ 
        fields: [{name:"allowDelete", type:"boolean"},
                 {name:"allowNew", type:"boolean"},
                 {name:"allowSnap", type:"boolean"},
                 {name:"allowUpdate", type:"boolean"},
                 {name:"associatedLayers"},
                 {name:"description", type:"string"},
                 {name:"geometryName", type:"string"},
                 {name:"geometryType", type:"string"},
                 {name:"identifier", type:"string"},
                 {name:"isUserSelectable", type:"boolean"},
                 {name:"maximumScale", type:"int"},
                 {name:"minimumScale", type:"int"},
                 {name:"name", type:"string"},
                 {name:"setSnapTolerance", type:"int"},
                 {name:"srid", type:"string"}
        ],
        data:[],
        sortInfo: {
            field: 'name',
            direction: 'DESC'
        }
    });
    
    /** 
     * Obtenir le panneau ExtJS pour le panneau d'édition
     * @method 
     * @private
     * @name Edition#_init
    */
    Edition.prototype._init = function(){
        
        var that = this;
        
        this.items = [
            {
                xtype: 'combo',
                disabled: false,
                // labelStyle: 'width:120px',
                fieldLabel: "Que désirez-vous éditer?",
                id: 'comboSelEdit',
                store:  this.storeEdition,
                valueField: 'name',
                hiddenName: 'p_comboSelEdit',
                hiddenId : 'p_comboSelEdit',
                forceSelection : true,
                displayField: 'name',
                width: 290,
                editable: false,
                mode: 'local',
                triggerAction: 'all',
                selectOnFocus: false,
                lazyRender:true,
                emptyText: "Sélectionnez un élément",
                listeners: {
                    select: function(combo, record, index){
                        this.ownerCt.items.get("txtDescriptionEdition").setValue(record.data["description"]);
                    }
                }
            },              
            {             
                xtype: 'textarea',
                id: 'txtDescriptionEdition',
                disabled: true,
                style:{overflow:'auto'},
                width:250,
                labelAlign: 'top',
                height:35,
                labelSeparator:"",
                fieldLabel: "Description:",
                value: "Description de l'élément à éditer"
            }];
        
        
        this._panel = new Ext.FormPanel({
            title: "Outil d'édition",
            id: this.options.id,
            hideLabel: true,
            frame:true,
            width: 200,
            bodyStyle: "padding:5px",
            labelAlign: "top",
            layoutConfig: {columns: 1},
            defaults:
               {
                    anchor: "100%"
               },
            scope: this,
            items: this.items,
            buttons: [{
                xtype: 'button',
                text: 'Lancer',
                boxMaxWidth: 60,
                listeners: {
                    click: function(){
                         
                        that.selection = Ext.getCmp("comboSelEdit").getValue();
                        
                        if(that.selection == ""){
                             Ext.MessageBox.show({
                                title: "Message d'information",
                                msg: 'S.V.P. Faite une sélection',
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.INFO
                            });
                            return false;
                        }
                             
                        var echelle = Igo.nav.carte.obtenirEchelle();
                        var storeEdition = Ext.getCmp("comboSelEdit").getStore();
                        
                        var indexRecord = storeEdition.find("name", that.selection, false);
                         
                        var record = storeEdition.getAt(indexRecord);
                         
                        var minScale = record.data["minimumScale"];
                        var maxScale = record.data["maximumScale"];
                        that.typeGeom = record.data["geometryType"];
                         
                        if(echelle < minScale || echelle > maxScale){                            
                            Ext.MessageBox.show({
                                title: "Message d'information",
                                msg: "L'échelle de la carte doit se trouver entre " + minScale + " et " + maxScale + ".",
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.INFO
                            });
                            
                            return false;
                        } 
                        
                        Igo.Aide.afficherMessageChargement();
                        
                        that.serviceEdition.decrireCouche(that.selection, that.decrireCoucheSucess.bind(that), that.decrireCoucheErreur.bind(that));
                    }
                }
            }]
        });
        
        Panneau.prototype._init.call(this);
    };   
    
    return Edition;
    
});