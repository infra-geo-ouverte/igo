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
                }
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
    
    return Arborescence;
    
});