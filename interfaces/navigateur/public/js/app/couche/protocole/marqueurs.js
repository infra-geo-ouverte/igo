/** 
 * Module pour l'objet {@link Couche.Marqueurs}.
 * @module marqueurs
 * @requires couche 
 * @requires occurence 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['couche', 'aide', 'limites'], function(Couche, Aide, Limites) {
    /** 
     * Création de l'object Couche.Marqueurs.
     * Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.Marqueurs
     * @class Couche.Marqueurs
     * @alias marqueurs:Couche.Marqueurs
     * @extends Couche
     * @requires marqueurs
     * @returns {Couche.Marqueurs} Instance de {@link Couche.Marqueurs}
     * @param {String} [options.titre="vector"] Titre de la couche
    */
    function Marqueurs(options){
        this.options = options || {};
        this._init();
    };

    Marqueurs.prototype = new Couche();
    Marqueurs.prototype.constructor = Marqueurs;
    
    /** 
     * Initialisation de l'object Couche.Marqueurs.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.Marqueurs#_init
    */
    Marqueurs.prototype._init = function(){
        Couche.prototype._init.call(this);
        var titre = this.options.titre || "marqueurs";
        this._layer = new OpenLayers.Layer.Markers(
            titre, 
            this._optionsOL
        ); 
    };

    /** 
    * Ajouter un marqueur à la couche 
    * @method 
    * @name Couche.Marqueurs#ajouterMarqueur
    * @param {Geometrie.Point} point Endroit où ajouter le marqueur
    * @param {String} [icone] Lien vers l'icone du marqueur. Marqueur bleu par défaut.
    * @param {Tableau} [dimension=[21,25]] Dimension de l'icone [largeur, hauteur]
    * @param {Tableau} [decalage] Decalage par rapport au centre de l'icone.
    */
    Marqueurs.prototype.ajouterMarqueur = function(point, icone, dimension, decalage) {
        dimension = dimension || [20,34];
        var w = dimension[0];
        var h = dimension[1];
        var sizeOL = new OpenLayers.Size(w,h);
         
        decalage = decalage || [-(sizeOL.w/2), -sizeOL.h];
        var offX = decalage[0];
        var offY = decalage[1];
        var offsetOL = new OpenLayers.Pixel(offX, offY);
        
       
        if(icone === 'bleu' || icone === 'undefined'){
            icone = 'images/marqueur/marker-blue.png';
        } else if (icone === 'vert'){
            icone = 'images/marqueur/marker-green.png';
        } else if (icone === 'jaune'){
            icone = 'images/marqueur/marker-yellow.png';
        } else if (icone === 'rouge'){
            icone = 'images/marqueur/marker-orange.png';
        }
        
        var url = Aide.utiliserBaseUri(icone || 'images/marqueur/marker-blue.png');
        
        var icon = new OpenLayers.Icon(url, sizeOL, offsetOL);

        this._getLayer().addMarker(new OpenLayers.Marker(point._obtenirLonLatOL(),icon));
    };
    
   
    /** 
    * Enlever tous les marqueurs.
    * @method 
    * @name Couche.Marqueurs#enleverMarqueurs
    */
    Marqueurs.prototype.enleverMarqueurs = function() {
        this._getLayer().clearMarkers();
    };
    
    /**
    * Obtenir l'ordre d'affichage de base de la couche
    * @method
    * @name Marqueurs#obtenirOrdreAffichageBase
    * @returns {Nombre} Ordre d'affichage de base
    */
    Marqueurs.prototype.obtenirOrdreAffichageBase = function() {
        return this.carte._getCarte().Z_INDEX_BASE.Vecteur;
    };
    
     /**
     * Zoomer sur les marqueurs de la couche
     * @method 
     * @name Couche.Marqueurs#zoomerMarqueurs
     * @param maxZoom Zoom maximale à passer à la carte au besoin
     */
        
    Marqueurs.prototype.zoomerMarqueurs = function(maxZoom) {  
        var limitesOL = this._layer.getDataExtent();
        if(!limitesOL){return false};
        var limites = new Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
        this.carte.zoomer(limites, maxZoom);
    };


    return Marqueurs;
    
});