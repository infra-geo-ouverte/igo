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
            layer: options.nom, 
            matrixSet: options.matrixSet,
            format: options.format==null ? "image/png" : "image/"+options.format,
            style: "default"
        };
        
        if(Aide.toBoolean(this.options.utiliserProxy)){
            this.options.url=Aide.utiliserProxy(this.options.url, true);
        }

        this.options.version = this.options.version==null ? "1.0.0" : this.options.version;

        if(!this.options.mode){
            this._init();
        }

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
    	if (!this.options.layerOL){
	        Couche.prototype._init.call(this);

	 		var opt = $.extend({}, this._optionsOL, {url: this.options.url});
		    this._layer = new OpenLayers.Layer.WMTS(opt); 
		}
    };

    WMTS.prototype._ajoutCallback = function(target, callback, optCallback){
        if(this.options.mode === 'getCapabilities'){
            this._getCapabilities(target, callback, optCallback);
        }else {
            Couche.prototype._ajoutCallback.call(this, target, callback, optCallback);
        }
    };

  	WMTS.prototype._getCapabilities = function(target, callback, optCallback){
        var that=this;

		OpenLayers.Request.GET({
            url: that.options.url,                 
            params: {
                SERVICE: "WMTS",
                VERSION: this.options.version,
                REQUEST: "GetCapabilities",
            },
            async: false,
            success: function(request) {
                var doc = request.responseXML;
                if (!doc || !doc.documentElement) {
                    doc = request.responseText;
                }
                
                var layerWMTS;    
                try{
                    var reader = new OpenLayers.Format.WMTSCapabilities();
                    var capabilities = reader.read(doc);
                    layerWMTS = reader.createLayer(capabilities, 
                                        that._optionsOL);
                }
                catch(e){
                    Aide.afficherMessageConsole('La création du layer WMTS '+that.options.titre+' a échoué.'
                                +'Erreur:'+e,'eleve');
                }
               
                if(layerWMTS){
                    that._layer = layerWMTS;
                }
                
            	Couche.prototype._ajoutCallback.call(that, target, callback, optCallback);
            },
            failure: function() {
                Aide.afficherMessageConsole("La requête GetCapabilities au service :"+that.options.url+', pour la couche:'+that.options.titre+' a échoué.','eleve');
            }
        });  



    };
    
    return WMTS;
    
});
