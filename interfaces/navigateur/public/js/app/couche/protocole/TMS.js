/** 
 * Module pour l'objet {@link Couche.TMS}.
 * @module tms
 * @requires couche 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['couche', 'aide'], function(Couche, Aide) {
    /** 
     * Création de l'object Couche.TMS.
     * Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.TMS
     * @class Couche.TMS
     * @alias tms:Couche.TMS
     * @extends Couche
     * @requires tms
     * @param {String} options.titre Titre de la couche
     * @param {String} options.url URL du TMS
     * @param {String} options.nom Nom du layer TMS
     * @returns {Couche.TMS} Instance de {@link Couche.TMS}
     * @exception Vérification de l'existance d'un url, d'un nom et d'un titre.
    */
    function TMS(options){
        this.options = options || {};

        if (!this.options.titre || !this.options.url || !this.options.nom) {
            throw new Error("Igo.TMS a besoin d'un titre, d'un url et d'un nom");
        }
        this._optionsOL = this.options._optionsOL || {
            layername: options.nom, 
            type: options.format==null?"png":options.format,
            maxZoomLevel: options.zoomMax==null?null:Number(options.zoomMax),
            minZoomLevel: options.zoomMin==null?null:Number(options.zoomMin)
        };
        
        if(Aide.toBoolean(this.options.utiliserProxy)){
            this.options.url=Aide.utiliserProxy(this.options.url, true);
        }
        
        this._init();
    };
    
    TMS.prototype = new Couche();
    TMS.prototype.constructor = TMS;

    /** 
     * Initialisation de l'object TMS.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.TMS#_init
    */
    TMS.prototype._init = function(){
        Couche.prototype._init.call(this);
        //TODO: voir pour bien gérer inclure tous les traitements de tuile.js
        //selon le host, appeler les bonnes tuiles... voir Tuiles.getURLs_MapCache()
        //mettre une variable d'environnement qui pointe vers le bon serveur de tuile.
        //et pour les printOptions....
        this._layer = new OpenLayers.Layer.TMS(
            this.options.titre,
            this.options.url,
            this._optionsOL
        );
    };
    
    return TMS;
    
});