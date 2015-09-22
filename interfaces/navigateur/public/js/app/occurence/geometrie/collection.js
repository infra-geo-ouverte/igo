/** 
 * Module pour l'objet {@link Geometrie.Collection}.
 * @module Collection
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires polygone
 * @requires ligne
 * @requires point
 * @requires aide
 */
define(['polygone', 'ligne', 'point', 'aide'], function(Polygone, Ligne, Point, Aide) {
    /** 
     * Création de l'object Geometrie.Collection.
     * @constructor
     * @name Geometrie.Collection
     * @class Geometrie.Collection
     * @alias Collection:Geometrie.Collection
     * @requires Collection
     * @param {tableau} geometries Tableau de {@link Geometrie}
     * @param {string} [proj] Projection des géométries (Format EPSG). 
     * Si absent, prend celui de la carte si disponible sinon EPSG:3857
     * @returns {Geometrie.Collection} Instance de {@link Geometrie.Collection}
     * @property {string} projection Projection du point (Format EPSG)
     * @throws new Collection : Projection EPSG invalide
     * @throws new Collection : Paramètre invalide
     * @throws new Collection : Le paramètre est obligatoire
     * @throws new Collection : Les géométries ne sont pas dans la même projection
     */
    function Collection(geometries, proj) {
        var that = this;
        this.geometries = [];

        if (!proj) {
            var nav = Aide.obtenirNavigateur();
            if (nav && nav.carte) {
                proj = nav.carte.obtenirProjection();
            } else {
                proj = 'EPSG:3857';
            }
        } else if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("new Collection : Projection EPSG invalide");
        }
        this.projection = proj;

        if (geometries && geometries.CLASS_NAME === "OpenLayers.Geometry.Collection") {
            geometries = geometries.components;
        }

        if (geometries instanceof Array === false) {
            throw new Error("new Collection : Paramètre invalide");
        }

        $.each(geometries, function(index, value) {
            if (value instanceof Polygone || value instanceof Ligne || value instanceof Point) {
                that.geometries.push(value);
            } else if (value.CLASS_NAME) {
				if (value.CLASS_NAME === "OpenLayers.Geometry.Polygon") {
	                that.geometries.push(new Polygone(value));
	            } else if (value.CLASS_NAME === "OpenLayers.Geometry.Point") {
	                that.geometries.push(new Point(value));
	            } else if (value.CLASS_NAME === "OpenLayers.Geometry.LineString" || value.CLASS_NAME === "OpenLayers.Geometry.LinearRing") {
	                that.geometries.push(new Ligne(value));
	            } 
            }
        });

        if (that.geometries.length === 0) {
            throw new Error("new Collection : La Collection doit être composée d'au moins une géométrie");
        }
    }

    /** 
     * Obtenir la projection de la géométrie
     * @method
     * @name Geometrie.Collection#obtenirProjection
     * @returns {String} Projection EPSG
     */
    Collection.prototype.obtenirProjection = function() {
        return this.projection;
    };

    /** 
     * Définir la projection à la géométrie
     * @method
     * @param {String} proj Projection EPSG
     * @name Geometrie.Collection#definirProjection
     * @throws Collection.definirProjection : Projection EPSG invalide
     * @example Collection.definirProjection('EPSG:4326');
     */
    Collection.prototype.definirProjection = function(proj) {
        if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Collection.definirProjection : Projection EPSG invalide");
        }
        this.projection = proj;
    };

    /** 
     * Obtenir la longueur du périmètre
     * @method 
     * @name Geometrie.Collection#obtenirPerimetre
     * @returns {float} Longueur (m)
     */
    Collection.prototype.obtenirPerimetre = function() {
        return this._obtenirGeomOL().getGeodesicLength(this.projection);
    };

    /** 
     * Obtenir l'aire
     * @method 
     * @name Geometrie.Collection#obtenirSuperficie
     * @returns {float} Aire (m²)
     */
    Collection.prototype.obtenirSuperficie = function() {
        return this._obtenirGeomOL().getGeodesicArea(this.projection);
    };

    /*
     * Transformer les coordonnées dans une autre projection.
     * Cette fonction ne modifie par le Collection, un nouveau Collection est créé
     * @method
     * @name Geometrie.Collection#projeter
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection du Collection.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Geometrie.Collection} Instance projectée de {@link Geometrie.Collection}
     * @throws Collection.projeter : Projection source invalide
     * @throws Collection.projeter : Projection voulue invalide
     * @example Collection.projeter('EPSG:4326');
     * @example Collection.projeter('EPSG:4326','EPSG:900913');
     */
    Collection.prototype.projeter = function(arg1, arg2) {
        var dest, source;
        if (arg2) {
            source = arg1;
            dest = arg2;
        } else {
            source = this.projection;
            dest = arg1;
        }
        if (typeof source !== "string" || source.toUpperCase().substr(0, 5) !== 'EPSG:' || source.substr(5) !== source.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Collection.projeter : Projection source invalide");
        }
        if (typeof dest !== "string" || dest.toUpperCase().substr(0, 5) !== 'EPSG:' || dest.substr(5) !== dest.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Collection.projeter : Projection voulue invalide");
        }
        var projSource = new OpenLayers.Projection(source);
        var projDest = new OpenLayers.Projection(dest);
        var polyOL = this._obtenirGeomOL();
        var polyProj = polyOL.transform(projSource, projDest);
        return new Collection(polyProj, dest);
    };

    /**
    * Obtenir le type de la classe
    * @method
    * @name Collection#obtenirTypeClasse
    * @returns {String} Type de l'outil
    */
    Collection.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };
    
    /** 
     * Obtenir un "MultiPolygon" OpenLayers
     * @method 
     * @private
     * @name Geometrie.Collection#_obtenirGeomOL
     * @param {float} tolerance Tolérance de déplacement des lignes (dans l'unité de la géométrie)
     * @returns {Objet} Collection OpenLayers.
     */
    Collection.prototype._obtenirGeomOL = function(tolerance) {
        var collectionOL = [];
        $.each(this.geometries, function(index, value) {
            collectionOL.push(value._obtenirGeomOL(tolerance));
        });
        return new OpenLayers.Geometry.Collection(collectionOL);
    };

    return Collection;
});