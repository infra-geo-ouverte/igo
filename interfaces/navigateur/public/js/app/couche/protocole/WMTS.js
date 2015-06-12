/** 
 * Module pour l'objet {@link Couche.WMTS}.
 * @module wmts
 * @requires couche 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['couche', 'aide'], function(Couche, Aide) {
    /** 
     * Création de l'object Couche.WMTS.
     * Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.WMTS
     * @class Couche.WMTS
     * @alias wmts:Couche.WMTS
     * @extends Couche
     * @requires wmts
     * @param {String} options.titre Titre de la couche
     * @param {String} options.url URL du WMTS
     * @param {String} options.nom Nom du layer WMTS
     * @returns {Couche.WMTS} Instance de {@link Couche.WMTS}
     * @exception Vérification de l'existance d'un url, d'un nom et d'un titre.
    */
    function WMTS(options){
        this.options = options || {};

        if (!this.options.titre || !this.options.url || !this.options.nom) {
            throw new Error("Igo.WMTS a besoin d'un titre, d'un url et d'un nom");
        }
        this._optionsOL = this.options._optionsOL || {
            name: options.titre,
            url: options.url,
            layer: options.nom, 
            matrixSet: options.matrixSet,
            format: options.format==null ? "image/png" : "image/"+options.format,
            style: "default"
        };
        
        if(Aide.toBoolean(this.options.utiliserProxy)){
            this.options.url=Aide.utiliserProxy(this.options.url, true);
        }
        
        this._init();
    };
    
    WMTS.prototype = new Couche();
    WMTS.prototype.constructor = WMTS;

    /** 
     * Initialisation de l'object WMTS.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.WMTS#_init
    */
    WMTS.prototype._init = function(){
        Couche.prototype._init.call(this);
        this._layer = new OpenLayers.Layer.WMTS(
            this._optionsOL
        );
    };
    
    return WMTS;
    
});