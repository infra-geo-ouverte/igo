/** 
 * Module pour l'objet {@link Couche.Blanc}.
 * @module Blanc
 * @requires couche 
 * @author Marc-André Trottier, MSP
 * @version 1.0
 */

define(['couche'], function(Couche) {

    /** 
     * Création de l'object Couche.Blanc.
     * Pour la liste complète des paramètres, voir {@link Blanc}
     * @constructor
     * @name Couche.Blanc
     * @class Couche.Blanc
     * @alias Blanc:Couche.Blanc
     * @extends Couche
     * @param {String} [options.titre="Blanc"] Titre de la couche
     * @returns {Couche.Blanc} Instance de {@link Couche.Blanc}
    */
    function Blanc(options){
        this.options = options || {};
        this.options.fond = true;

        this._init(options); 
    };
    
    Blanc.prototype = new Couche();
    Blanc.prototype.constructor = Blanc;

    /** 
     * Initialisation de l'object Couche.Blanc.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.Blanc#_init
    */
    Blanc.prototype._init = function(){
        Couche.prototype._init.call(this);
        if(!this.options.titre){this.options.titre='Blanc';};
        this._layer = new OpenLayers.Layer(
            this.options.titre, 
            this._optionsOL
        );
    };
    
    Blanc.prototype._ajoutCallback = function(target, callback, optCallback){
        this._layer.numZoomLevels=this.carte._carteOL.numZoomLevels;
        Couche.prototype._ajoutCallback.call(this, target, callback, optCallback);
    };    
    
    return Blanc;
    
});