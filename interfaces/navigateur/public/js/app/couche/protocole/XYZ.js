/** 
 * Module pour l'objet {@link Couche.TMS}.
 * @module xyz
 * @requires couche 
 * @author Steve Toutant(INSPQ), Marc-André Barbeau (MSP)
 * @version 1.0
 */
define(['couche', 'aide'], function(Couche, Aide) {
    /** 
     * Création de l'object Couche.TMS.
     * Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.XYZ
     * @class Couche.XYZ
     * @alias xyz:Couche.XYZ
     * @extends Couche
     * @requires xyz
     * @param {String} options.titre Titre de la couche
     * @param {String} options.url URL(s) du XYZ. Peut être une liste d'url séparé par des virgules et entre []
     * @returns {Couche.XYZ} Instance de {@link Couche.XYZ}
     * @exception Vérification de l'existance d'un url et d'un titre.
    */
    function XYZ(options){
        this.options = options || {};

        if (!this.options.titre || !this.options.url) {
            throw new Error("Igo.XYZ a besoin d'un titre et d'un url");
        }
        this._optionsOL = this.options._optionsOL || {
            maxZoomLevel: options.zoomMax==null?null:Number(options.zoomMax),
            minZoomLevel: options.zoomMin==null?null:Number(options.zoomMin)
        };
        
        if(Aide.toBoolean(this.options.utiliserProxy)){
            this.options.url=Aide.utiliserProxy(this.options.url, true);
        }
        
        this._init();
    };
    
    function getXYZurl(urls){
    	var arUrl = urls.replace(/\[|\]/g, "").split(",");
    	return arUrl;
    };
    
    XYZ.prototype = new Couche();
    XYZ.prototype.constructor = XYZ;

    /** 
     * Initialisation de l'object XYZ.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.XYZ#_init
    */
    XYZ.prototype._init = function(){
        Couche.prototype._init.call(this);
        //TODO: voir pour bien gérer inclure tous les traitements de tuile.js
        //selon le host, appeler les bonnes tuiles... voir Tuiles.getURLs_MapCache()
        //mettre une variable d'environnement qui pointe vers le bon serveur de tuile.
        //et pour les printOptions....
        this._layer = new OpenLayers.Layer.XYZ(
            this.options.titre,
            getXYZurl(this.options.url),
            this._optionsOL
        );
    };
    
    return XYZ;
    
});