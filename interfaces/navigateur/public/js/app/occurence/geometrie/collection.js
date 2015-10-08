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
define(['geometrie', 'polygone', 'ligne', 'point', 'aide'], function(Geometrie, Polygone, Ligne, Point, Aide) {
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
        Geometrie.apply(this, [proj]);

        var that = this;
        this.geometries = [];

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

    Collection.prototype = Object.create(Geometrie.prototype);
    Collection.prototype.constructor = Collection;

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