/** 
 * Module pour l'objet {@link Panneau.PanneauCarte}.
 * @module panneauCarte
 * @requires panneau 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['panneau', 'point', 'aide'], function(Panneau, Point, Aide) {
     /** 
     * Création de l'object Panneau.PanneauCarte.
     * Pour la liste complète des paramètres, voir {@link Panneau}
     * @constructor
     * @name Panneau.PanneauCarte
     * @class Panneau.PanneauCarte
     * @alias panneauCarte:Panneau.PanneauCarte
     * @extends Panneau
     * @requires panneauCarte
     * @param {Décimaux} [options.x=-7994004] Coordonnées X du centre de la carte
     * @param {Décimaux} [options.y=6034079] Coordonnées Y du centre de la carte
     * @param {Entier} [options.zoom=7] Niveau de zoom de la carte
     * @returns {Panneau.PanneauCarte} Instance de {@link Panneau.PanneauCarte}
    */
    function PanneauCarte(options){
        this.barreOutils;
        this.options = options || {};
        
        this.defautOptions = $.extend({}, this.defautOptions, {
            id: 'carte-panneau',
            titre: '',
            _margins: '0 5 0 0',
            reductible: false,
            _layout: 'border'
        });
    };

    PanneauCarte.prototype = new Panneau();
    PanneauCarte.prototype.constructor = PanneauCarte;
    
    /** 
     * Initialisation de l'object Panneau. 
     * Est appelé par {@link Navigateur#ajouterPanneau}
     * @method 
     * @name PanneauCarte#_init
    */
    PanneauCarte.prototype._init = function(){
        var opt = this.options;
       /* var oPanneauOnglet = new Ext.TabPanel({
            region: 'north',
            deferredRender: false,
            border: false,
            activeTab: 0, 
            height: 20,
            items: [{
                itemId: 'onglet_navigation',
                title: opt.titre || 'Carte'
                }]
        }); */
        var centreString = Aide.obtenirParametreURL('centre') || opt.centre;
        if (centreString){ //-71.3,48.3;EPSG:4326
            var centre = centreString.split(/[,;]/);
            opt.x = centre[0];
            opt.y = centre[1];
            var centreProj = centre[2];
            if(centreProj){
                var igoPoint = new Point(opt.x,opt.y,centreProj);
                var igoPointProj = igoPoint.projeter(this.carte.obtenirProjection());
                opt.x = igoPointProj.x;
                opt.y = igoPointProj.y;
            }
        };
        var x = Aide.obtenirParametreURL('x') || opt.x || -7994004;
        var y = Aide.obtenirParametreURL('y') || opt.y || 6034079;         
        var z = Aide.obtenirParametreURL('zoom') || opt.zoom || 7;
        
        var coucheDeBaseActive = this.carte.gestionCouches.obtenirCoucheDeBaseActive();
        if(coucheDeBaseActive._layer && coucheDeBaseActive._layer.maxZoomLevel && z > coucheDeBaseActive._layer.maxZoomLevel){
            z = coucheDeBaseActive._layer.maxZoomLevel;
        }

        var barreOutilsExt;
        if (this.barreOutils){
            barreOutilsExt = this.barreOutils._getToolbar();
        } else {
            barreOutilsExt = [];
        }
        
        this.carte.parent = this;
        var oMapComponent = new GeoExt.MapPanel({
            border: false,
            id: 'mapComponent',
            region: 'center',
            map: this.carte._getCarte(),
            center: new OpenLayers.LonLat(x, y),
            zoom: z,
            tbar: barreOutilsExt,
            items: [{
                xtype: "gx_zoomslider",
                id:'idgx_zoomslider',
                vertical: true,
                height: 100,
                x: 17,
                y: 90,
                plugins: new GeoExt.ZoomSliderTip({template: "Échelle: 1 : {scale}"})
            }, {       
                id:'boutonConsoleDiv',
                html: "<button id='boutonConsole' class='boutonConsole'></button>"
            }]
        });

        
        if (this.barreOutils){
            this.barreOutils._setPanelContainer(oMapComponent);
        };
        
        

        this.defautOptions.items = [
           // oPanneauOnglet, 
            oMapComponent
        ];
        
        this._extOptions = {
            region: 'center'
        };   
/*
       $.contextMenu({
            selector: '#mapComponent',
             build: function($trigger, e) {
                 console.log($trigger);
                 console.log(e);
                 e.pageX = 773;
                 e.pageY = 359;
                 if(!Igo.nav.carte.gestionCouches.obtenirCouchesParTitre('table')[0] || !Igo.nav.carte.gestionCouches.obtenirCouchesParTitre('table')[0].obtenirOccurencesSelectionnees()[0]){
                    return{ 
                        callback: function(key, options) {
                        },
                    items: {
                            "add": {name: "Ajouter", icon: "edit"},
                        }
                 }
             }
             return{
                callback: function(key, options) {
                    if(key == 'superficie'){
                        alert(Igo.nav.carte.gestionCouches.obtenirCouchesParTitre('table')[0].obtenirOccurencesSelectionnees()[0].obtenirSuperficie());
                    }
                },
                items: {
                    "edit": {name: "Éditer", icon: "edit"},
                    "delete": {name: "Supprimer", icon: "delete"},
                    "export": {name: "Exporter"},
                     "sep1": "---------",
                    "longueur": {name: "longueur"},
                    "superficie": {name: "superficie"}

                }
            }
            }
        });*/

        Panneau.prototype._init.call(this);
    };
    
    /** 
     * Obtenir le panneau ExtJS de la carte
     * @method 
     * @private
     * @name Navigateur#_getMapComponent
     * @returns {Objet} Objet ExtJS
    */
    PanneauCarte.prototype._getMapComponent = function(){
        return this._panel.items.last();
    };
    
    return PanneauCarte;
    
});
