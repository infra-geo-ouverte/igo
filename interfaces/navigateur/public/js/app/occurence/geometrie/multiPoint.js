/** 
 * Module pour l'objet {@link Geometrie.MultiPoint}.
 * @module multiPoint
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 */

define(['geometrie', 'aide', 'point'], function(Geometrie, Aide, Point) {
    /** 
     * Création de l'object Geometrie.MultiPoint.
     * @constructor
     * @name Geometrie.MultiPoint
     * @class Geometrie.MultiPoint
     * @alias multiPoint:Geometrie.MultiPoint
     * @requires multiPoint
     * @param {string} [proj] Projection du multiPoint (Format EPSG). 
     * Si absent, prend celui de la carte si disponible sinon EPSG:3857
     * @returns {Geometrie.MultiPoint} Instance de {@link Geometrie.MultiPoint}
     */
    function MultiPoint(arrayPoint, proj) {
        Geometrie.apply(this, [proj]);
        var that = this;
        this.points = [];

        if (arrayPoint && (arrayPoint.CLASS_NAME === "OpenLayers.Geometry.MultiPoint")) {
            arrayPoint = arrayPoint.components;
        }

        if (arrayPoint instanceof Array === false) {
            throw new Error("new MultiPoint : Paramètre invalide");
        }
        $.each(arrayPoint, function(index, value) {
            if (value instanceof Array) {
                that.points.push(new Point(value[0], value[1], that.projection));
            } else if (value instanceof Point) {
                if (value.projection !== that.projection) {
                    //plus: paramètre pour convertir ou non la projection
                    throw new Error("new MultiPoint : Les Points ne sont pas dans la même projection");
                }
                that.points.push(value);
            } else if (value.CLASS_NAME === "OpenLayers.Geometry.Point") {
                that.points.push(new Point(value.x, value.y, that.projection));
            } else {
                throw new Error("new MultiPoint : Paramètre invalide");
            }
        }); 
        
        if (this.points.length < 1) {
            throw new Error("new MultiPoint : Le multiPoint doit être composé d'au moins 1 point");
        }
    }

    MultiPoint.prototype = Object.create(Geometrie.prototype);
    MultiPoint.prototype.constructor = MultiPoint;

    /** 
     * Obtenir un multiPoint OpenLayers
     * @method 
     * @private
     * @name Geometrie.MultiPoint#_obtenirGeomOL
     * @returns {Objet} MultiPoint OpenLayers.
     */
    MultiPoint.prototype._obtenirGeomOL = function() {
        var pointsOL = [];
        $.each(this.points, function(index, value) {
            pointsOL.push(value._obtenirGeomOL());
        });
        return new OpenLayers.Geometry.MultiPoint(pointsOL);
    };

    return MultiPoint;
});