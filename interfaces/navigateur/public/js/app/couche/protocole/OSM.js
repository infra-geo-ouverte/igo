/** 
 * Module pour l'objet {@link Couche.OSM}.
 * @module osm
 * @requires couche 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['couche'], function(Couche) {
    /** 
     * Création de l'object Couche.OSM. Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.OSM
     * @class Couche.OSM
     * @alias osm:Couche.OSM
     * @extends Couche
     * @requires osm
     * @param {String} [options.titre="OpenStreetMap"] Nom de la couche
     * @param {String} [options.nom="defaut"] Type de la carte {velo | defaut}
     * @returns {Couche.OSM} Instance de {@link Couche.OSM}
    */
    function OSM(options){
        this.options = options || {};
        this.options.fond=true;
        
        this.defautOptions = {
            titre: "OpenStreetMap"
        };
        this._optionsOL = {
            printOptions: false
        };
        this._init();
    };
    
    OSM.prototype = new Couche();
    OSM.prototype.constructor = OSM;

    /** 
     * Initialisation de l'object OSM.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.OSM#_init
    */
    OSM.prototype._init = function(){
        Couche.prototype._init.call(this);
        var type = null;
        if (this.options.nom){
            switch (this.options.nom.toLowerCase()){
                case "velo":
                    type = [window.location.protocol+"//a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                            window.location.protocol+"//b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                            window.location.protocol+"//c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"];
                    break;
                case "humanitaire":
                    var HOTAttribution = '© Contributions<a href="http://hot.openstreetmap.org/" target="_blank"></a> <a class="styleAttributionTable" href="http://hot.openstreetmap.org/" target="_blank"> OpenStreetMap</a> Humanitaire';
                    var get_my_url = function(bounds) {
                        var res = this.map.getResolution();
                        var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
                        var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
                        var z = this.map.getZoom();

                        var path = z + "/" + x + "/" + y + "." + this.type; 
                        var url = this.url;
                        if (url instanceof Array) {
                            url = this.selectUrl(path, url);
                        }
                        return url + path;
                    };
                    
                    this.options.url = window.location.protocol+"//a.tile.openstreetmap.fr/hot/";
                    this.options._optionsOL = $.extend(this._optionsOL, { 
                        'type':'png', 
                        'getURL':get_my_url , 
                        numZoomLevels: 19, 
                        transitionEffect: 'null', 
                        attribution: HOTAttribution
                    });
                    this._layer = (new Igo.Couches.TMS(this.options))._layer;
                    return;
                case "defaut":
                default:
                    type = null;
            };
        };
        this._layer = new OpenLayers.Layer.OSM(            
            this.options.titre, type,
            this._optionsOL
        );
    };
   
   return OSM;
    
});