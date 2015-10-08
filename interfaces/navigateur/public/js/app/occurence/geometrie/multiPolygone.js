/** 
 * Module pour l'objet {@link Geometrie.MultiPolygone}.
 * @module multiPolygone
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires polygone
 * @requires aide
 */
define(['geometrie', 'polygone', 'aide'], function(Geometrie, Polygone, Aide) {
    /** 
     * Création de l'object Geometrie.MultiPolygone.
     * @constructor
     * @name Geometrie.MultiPolygone
     * @class Geometrie.MultiPolygone
     * @alias multiPolygone:Geometrie.MultiPolygone
     * @requires multiPolygone
     * @param {tableau} polygones Tableau de {@link Geometrie.Polygone}
     * @param {string} [proj] Projection du point (Format EPSG). 
     * Si absent, prend celui de la carte si disponible sinon EPSG:3857
     * @returns {Geometrie.MultiPolygone} Instance de {@link Geometrie.MultiPolygone}
     * @property {tableau} lignes Tableau de {@link Geometrie.Polygone}
     * @property {string} projection Projection du point (Format EPSG)
     * @throws new MultiPolygone : Projection EPSG invalide
     * @throws new MultiPolygone : Paramètre invalide
     * @throws new MultiPolygone : Le paramètre est obligatoire
     * @throws new MultiPolygone : Les lignes ne sont pas dans la même projection
     * @throws new MultiPolygone : Le polygone doit être composée d'au moins une ligne
     * @example
     * new Geometrie.MultiPolygone([[[-72,50], [-72,58], [-75,58], [-75,50]], [[-73,52], [-74,55], [-74,52]]], 'EPSG:4326');
     */
    function MultiPolygone(polygones, proj) {
        Geometrie.apply(this, [proj]);
        var that = this;
        this.polygones = [];

        if (polygones && polygones.CLASS_NAME === "OpenLayers.Geometry.MultiPolygon") {
            polygones = polygones.components;
        }

        if (polygones instanceof Array === false) {
            throw new Error("new MultiPolygone : Paramètre invalide");
        }

        $.each(polygones, function(index, value) {
            if (value instanceof Polygone) {
                that.polygones.push(value);
            } else {
                that.polygones.push(new Polygone(value, proj));
            }
        });

        if (that.polygones.length === 0) {
            throw new Error("new MultiPolygone : Le multipolygone doit être composé d'au moins 1 polygone");
        }
    }

    MultiPolygone.prototype = Object.create(Geometrie.prototype);
    MultiPolygone.prototype.constructor = MultiPolygone;

    /** 
     * Obtenir la longueur du périmètre
     * @method 
     * @name Geometrie.MultiPolygone#obtenirPerimetre
     * @returns {float} Longueur (m)
     */
    MultiPolygone.prototype.obtenirPerimetre = function() {
        return this._obtenirGeomOL().getGeodesicLength(this.projection);
    };

    /** 
     * Obtenir l'aire
     * @method 
     * @name Geometrie.MultiPolygone#obtenirSuperficie
     * @returns {float} Aire (m²)
     */
    MultiPolygone.prototype.obtenirSuperficie = function() {
        return this._obtenirGeomOL().getGeodesicArea(this.projection);
    };
    
    /** 
     * Obtenir un "MultiPolygon" OpenLayers
     * @method 
     * @private
     * @name Geometrie.MultiPolygone#_obtenirGeomOL
     * @param {float} tolerance Tolérance de déplacement des lignes (dans l'unité de la géométrie)
     * @returns {Objet} MultiPolygone OpenLayers.
     */
    MultiPolygone.prototype._obtenirGeomOL = function(tolerance) {
        var polygoneOL = [];
        $.each(this.polygones, function(index, value) {
            polygoneOL.push(value._obtenirGeomOL(tolerance));
        });
        return new OpenLayers.Geometry.MultiPolygon(polygoneOL);
    };

    return MultiPolygone;
});