/** 
 * Module pour l'objet {@link Panneau.Arborescence}.
 * @module arborescence
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires panneau
 * @requires contextMenuPlugin
 * @requires layerTreeBuilderRequire
 * @requires GetMSPMetadata
 */

require.ajouterConfig({
    paths: {
        layerTreeBuilderBuild: 'libs/GeoExt.ux/LayerTreeBuilder/LayerTreeBuilder%-build%',
        layerTreeBuilderCSS: 'libs/GeoExt.ux/LayerTreeBuilder/resources/css/LayerTreeBuilder'
    },
    shim: {
        layerTreeBuilderBuild: {
            deps: ['css!layerTreeBuilderCSS']
        }
    }
});

define(['panneau', 'contexteMenuArborescence', 'layerTreeBuilderBuild'], function(Panneau, ContexteMenuArborescence) {
    /** 
     * Création de l'object Panneau.Arborescence.
     * Objet à ajouter à un panneauMenu.
     * @constructor
     * @name Panneau.Arborescence
     * @class Panneau.Arborescence
     * @alias arborescence:Panneau.Arborescence
     * @extends Panneau
     * @requires arborescence
     * @returns {Panneau.Arborescence} Instance de {@link Panneau.Arborescence}
    */
    function Arborescence(options){
        this.options = options || {};
    };
        
    Arborescence.prototype = new Panneau();
    Arborescence.prototype.constructor = Arborescence;
    
    /** 
     * Initialisation de l'object Arborescence. 
     * @method 
     * @name Arborescence#_init
    */
    Arborescence.prototype._init = function(){
        var that=this;
        this._panel = new GeoExt.ux.tree.LayerTreeBuilder({
            title: "Arborescence des couches",
            width: 250,
            autoScroll: true,
            rootVisible: false,
            border: false,
            enableDD: false,
            lines: false,
            checkableContainerGroupNodes: false,
        //    plugins: [new GeoExt.tree.ContextMenuPlugin()],
            id: "tree_panneau",
            listeners: {
                afterrender: function(e) {
                    that.callbackCreation();       
                },
                afterlayout: function(){
                    //Si premier affichage, gérer l'affichage des niveau
                    if(this.premier === undefined)
                    {
                        that.gererAffichageNiveau();
                        this.premier = true;
                    }
                }
            }
        });

        $(window).keydown(function(e){
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
                that.ouvrirRecherche();
                e.preventDefault();
            }
        });

        Panneau.prototype._init.call(this);
    };
    
    Arborescence.prototype.callbackCreation = function(){
        this.contexteMenu = new ContexteMenuArborescence({arborescence: this, selecteur: '#'+this.obtenirId(), cible: '.x-tree-node'});
        Panneau.prototype.callbackCreation.call(this);
        this.carte.gestionCouches.ajouterDeclencheur("enleverToutesLesCouches", this._enleverTousLesGroupes, {scope: this});
    };
    
    Arborescence.prototype._enleverTousLesGroupes = function(){
        while(this._panel.root.childNodes.length !== 0){
            this._panel.root.childNodes[0].destroy();
        }
    };

    Arborescence.prototype.ouvrirCouche = function(couche){
        if(!couche){
            return false;
        }
        if(couche.options.groupe){
            var groupeArray = couche.options.groupe.split("/");
            $.each(groupeArray, function(key, groupe) {
                var nameSpan = $("span:contains("+groupe+")").filter(function(key, value){return value.textContent === groupe});
                if(nameSpan){
                    var plusIcone = nameSpan.parent().parent().find(".x-tree-ec-icon.x-tree-elbow-end-plus, .x-tree-ec-icon.x-tree-elbow-plus");
                    if(plusIcone){
                        plusIcone.click();
                    }
                }
            });
        }
        var coucheSpan = $("span:contains("+couche.obtenirTitre()+")").filter(function(key, value){return value.textContent === couche.obtenirTitre()});
        if(coucheSpan){
            var caseInput = coucheSpan.parent().parent().find("input");
            if(caseInput){
                if(caseInput[0].disabled){
                    caseInput.prop('checked', true);
                    couche.activer();
                } else {
                    caseInput.click();
                }
            }
        }
    };
    
    Arborescence.prototype.ouvrirCoucheParTexte = function(texte){
        var couche;
        var couchesArray = this.carte.gestionCouches.trouverCouches(texte);
        if(couchesArray && couchesArray.length){
            couche = couchesArray[0];
        }
        this.ouvrirCouche(couche);
    };

    Arborescence.prototype.creerStore = function(){
        var that = this;
        var couchesArray = this.carte.gestionCouches.obtenirCouches();
        var data = [];
        $.each(couchesArray, function(key, value){
            data.push({
                display: value._layer.name,
                couche: value
            });
        });

        this.store = new Ext.data.JsonStore({
            fields:['display', 'couche'],
            sortInfo: { field: 'display', direction: 'ASC'}
        });

        this.store.loadData(data);
    }

    Arborescence.prototype.creerFenetreRecherche = function(){
        var that = this;
        var id = this.obtenirId();

        this.creerStore();

        this.comboBox = new Ext.form.ComboBox({ 
            id:'combo_'+id,
            name:'combo',
            fieldLabel: 'Entrer le nom de la couche',
            allowBlank:false,
            store: this.store,
            displayField:'display',
            valueField:'display',
            forceSelection:false,
            mode:'local',
            selectOnFocus: false,
            enableKeyEvents: true,
            width:250,
            scope:this,
            listeners: {
                specialkey: function(field, e){
                    if (e.getKey() == e.ENTER) {
                        that.ouvrirCoucheParTexte(that.comboBox.getValue());
                    }
                }
            }
        });

        this.comboBox.originalDoQuery = this.comboBox.doQuery;
        this.comboBox.doQuery = function (queryString, forceAll, rawQuery) {
            this.originalDoQuery.call(this, queryString, forceAll, rawQuery);

            if(typeof queryString === "string"){
                var string = queryString.replace(/ /g, ".*");
                regex = new RegExp(string, 'i');

                this.store.filter([{
                    fn: function (rec) {
                        var couche = rec.json.couche;
                        return regex.test(couche.obtenirTitre()) || regex.test(couche.obtenirGroupe());
                    }
                }]);

                this.onLoad();
            } 
        };

        //this.store.on('exception', this.gestionErreurStore);

        var button_ok = new Ext.Button({
            id:'button_ok_'+id,
            type:'button',
            width:50,
            text:'Rechercher',
            scope:this,
            handler: function(){
                that.ouvrirCoucheParTexte(that.comboBox.getValue());
            }
        });

        var panneau = new Ext.form.FormPanel({
            id:'form_recherche_couche_'+id,
            padding:'5 5 5 5',
            frame:true,
            autoWidth:true,
            width:'auto',
            labelAlign:'top',
            items:[this.comboBox],
            buttons:[button_ok]
        });

        this.window_recherche = new Ext.Window({
            title:'Rechercher une couche',
            width:300,
            closeAction:'hide',
            resizable:true,
            minimizable:false,
            plain:true,
            bodyStyle:'padding5px',
            items:[panneau],
            listeners: {
                show: function(){
                    setTimeout(function(e){that.comboBox.focus()}, 100);
                }
            }
        });
    };

    Arborescence.prototype.ouvrirRecherche =  function () {
        if(!this.window_recherche){
            this.creerFenetreRecherche();
        } else {
            this.creerStore();
            this.comboBox.bindStore(this.store);
        } 

        this.window_recherche.show();
    };

    Arborescence.prototype.fermerRecherche = function() {
       this.window_recherche.hide();
    };
    
    /**
     * Gérer l'affichage des niveaux selon les paramètres fournis dans les options
     * @method
     * @name Arborescence#gererAffichageNiveau
     */
    Arborescence.prototype.gererAffichageNiveau = function(){
        //Option pour retirer le checkbox du niveau répertoire
        if(this.options.retirerCheckboxPremNiveau == "true")
            $("#tree_panneau").find(".x-tree-node-icon").not('.gx-tree-layer-icon').next(".x-tree-node-cb").remove();
    };

    return Arborescence;
    
});