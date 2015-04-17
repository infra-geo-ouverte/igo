/** 
 * Module pour l'objet {@link Couche.Google}.
 * @module google
 * @requires couche 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['couche', 'aide'], function(Couche, Aide) {
    /** 
     * Création de l'object Couche.Google.
     * Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.Google
     * @class Couche.Google
     * @alias google:Couche.Google
     * @extends Couche
     * @requires google
     * @param {String} [options.titre="Google"] Nom de la couche
     * @param {String} [options.nom="route"] Type de la carte {terrain | satellite | hybride | route}.
     * @returns {Couche.Google} Instance de {@link Couche.Google}
    */
    function Google(options){
            this.options = options || {};
            this.options.fond = true;
            
            this._optionsOL = {
                sphericalMercator: true, 
                numZoomLevels: 20,
                printOptions: false
            };

            //this._init();
    };

    Google.prototype = new Couche();
    Google.prototype.constructor = Google;

    /** 
     * Initialisation de l'object Couche.Google.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.Google#_init
    */
    Google.prototype._init = function(){
        var type = google.maps.MapTypeId.ROADMAP;
        if (this.options.nom){
            switch (this.options.nom.toLowerCase()){
                case "terrain":
                    type = google.maps.MapTypeId.TERRAIN;
                    break;
                case "satellite":
                    type = google.maps.MapTypeId.SATELLITE;
                    break;
                case "hybride":
                    type = google.maps.MapTypeId.HYBRID;
                    break;
                case "route":
                default:
                    type = google.maps.MapTypeId.ROADMAP;
            };
        };
        this._optionsOL.type = type;

        Couche.prototype._init.call(this);
        if(!this.options.titre){this.options.titre='Google';};
        this._layer = new OpenLayers.Layer.Google(
            this.options.titre, 
            this._optionsOL
        );
    };

    Google.prototype._ajoutCallback = function(target, callback, optCallback){
        var that=this;
        //todo: pouvoir mettre une clé à google
        var googleConnexion = this.options.url?window.location.protocol+this.options.url:window.location.protocol+'//maps.google.com/maps/api/js?sensor=false';
        
        require(['async!'+googleConnexion], function(){
            that._init();
            Couche.prototype._ajoutCallback.call(that, target, callback, optCallback);
        }, function (err) {
            Aide.afficherMessage("Google indisponible", "Impossible d'ajouter la couche Google", 'Ok', 'Error');
        });
    }
        
    return Google;
});