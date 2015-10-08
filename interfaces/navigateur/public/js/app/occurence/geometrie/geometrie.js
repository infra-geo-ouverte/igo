/** 
 * Module pour l'objet {@link Geometrie}.
 * @module geometrie
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 */

define(['aide'], function(Aide) {

	function Geometrie(proj) {
	  	if (this.constructor === Geometrie) {
	      throw new Error("Ne peut pas instancier la classe abstraite 'Geometrie'");
	    }

        if (!proj) {
            var nav = Aide.obtenirNavigateur();
            if (nav && nav.carte) {
                proj = nav.carte.obtenirProjection();
            } else {
                proj = 'EPSG:3857';
            }
        } else if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("new Geometrie : Projection EPSG invalide");
        }
        this.projection = proj.toUpperCase();
	}

    /**
    * Obtenir le type de la classe
    * @method
    * @name Geometrie#obtenirTypeClasse
    * @returns {String} Nom de la classe
	**/

    Geometrie.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };

    /** 
     * Obtenir la projection de la géométrie
     * @method
     * @name Geometrie#obtenirProjection
     * @returns {String} Projection EPSG
     */
    Geometrie.prototype.obtenirProjection = function() {
        return this.projection;
    };

    /** 
     * Définir la projection à la géométrie
     * @method
     * @param {String} proj Projection EPSG
     * @name Geometrie#definirProjection
     * @throws definirProjection : Projection EPSG invalide
     * @example definirProjection('EPSG:4326');
     */
    Geometrie.prototype.definirProjection = function(proj) {
        if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Geometrie.definirProjection : Projection EPSG invalide");
        }
        this.projection = proj;
    };

    /** 
     * Transformer les coordonnées dans une autre projection.
     * Cette fonction ne modifie par la géométrie, une nouvelle géométrie est créée.
     * @method
     * @name Geometrie#projeter
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection de la géométrie.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Geometrie.Point} Instance projectée de {@link Geometrie}
     * @throws Geometrie.projeter : Projection source invalide
     * @throws Geometrie.projeter : Projection voulue invalide
     * @example Geometrie.projeter('EPSG:4326');
     * @example Geometrie.projeter('EPSG:4326','EPSG:900913');
     */
    Geometrie.prototype.projeter = function(arg1, arg2) {
        var dest, source;
        if (arg2) {
            source = arg1;
            dest = arg2;
        } else {
            source = this.projection;
            dest = arg1;
        }
        if (typeof source !== "string" || source.toUpperCase().substr(0, 5) !== 'EPSG:' || source.substr(5) !== source.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Geometrie.projeter : Projection source invalide");
        }
        if (typeof dest !== "string" || dest.toUpperCase().substr(0, 5) !== 'EPSG:' || dest.substr(5) !== dest.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Geometrie.projeter : Projection voulue invalide");
        }
        var projSource = new OpenLayers.Projection(source);
        var projDest = new OpenLayers.Projection(dest);
        var geomOL = this._obtenirGeomOL();
        var geomProj = geomOL.transform(projSource, projDest);
        return new Igo.Geometrie[this.obtenirTypeClasse()](geomProj, dest);
    };


    /** 
     * Obtenir les limites de la géométrie
     * @method
     * @name Geometrie#obtenirLimites
     * @returns {Geometrie} Limites de la géométrie
     */
    Geometrie.prototype.obtenirLimites = function() {
        if (this.limites) {
            return this.limites;
        }
        var limitesOL = this._obtenirGeomOL().getBounds();
        return new Igo.Geometrie.Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
    };

    Geometrie.prototype.obtenirCentroide = function() {
        var limites = this.obtenirLimites();
        return limites.obtenirCentroide();
    };

    return Geometrie;
});