/** 
 * Module pour l'objet {@link Geometrie.MultiPoint}.
 * @module multiPoint
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 */

define(['aide', 'point'], function(Aide, Point) {
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
        var that = this;
        this.points = [];

        if (!proj) {
            var nav = Aide.obtenirNavigateur();
            if (nav && nav.carte) {
                proj = nav.carte.obtenirProjection();
            } else {
                proj = 'EPSG:3857';
            }
        } else if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("new MultiPoint : Projection EPSG invalide");
        }
        this.projection = proj;

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

    /**
    * Obtenir le type de la classe
    * @method
    * @name MultiPoint#obtenirTypeClasse
    * @returns {String} Type de l'outil
    */
    MultiPoint.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };
    
    /** 
     * Obtenir la projection de la géométrie
     * @method
     * @name Geometrie.MultiPoint#obtenirProjection
     * @returns {String} Projection EPSG
     */
    MultiPoint.prototype.obtenirProjection = function() {
        return this.projection;
    };

    /** 
     * Définir la projection à la géométrie
     * @method
     * @param {String} proj Projection EPSG
     * @name Geometrie.MultiPoint#definirProjection
     * @throws MultiPoint.definirProjection : Projection EPSG invalide
     * @example MultiPoint.definirProjection('EPSG:4326');
     */
    MultiPoint.prototype.definirProjection = function(proj) {
        if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiPoint.definirProjection : Projection EPSG invalide");
        }
        this.projection = proj;
    };


    /** 
     * Transformer les coordonnées dans une autre projection.
     * Cette fonction ne modifie par le multiPoint, un nouveau multiPoint est créé.
     * @method
     * @name Geometrie.MultiPoint#projeter
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection du multiPoint.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Geometrie.MultiPoint} Instance projectée de {@link Geometrie.MultiPoint}
     * @throws MultiPoint.projeter : Projection source invalide
     * @throws MultiPoint.projeter : Projection voulue invalide
     * @example MultiPoint.projeter('EPSG:4326');
     * @example MultiPoint.projeter('EPSG:4326','EPSG:900913');
     */
    MultiPoint.prototype.projeter = function(arg1, arg2) {
        var dest, source;
        if (arg2) {
            source = arg1;
            dest = arg2;
        } else {
            source = this.projection;
            dest = arg1;
        }
        if (typeof source !== "string" || source.toUpperCase().substr(0, 5) !== 'EPSG:' || source.substr(5) !== source.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiPoint.projeter : Projection source invalide");
        }
        if (typeof dest !== "string" || dest.toUpperCase().substr(0, 5) !== 'EPSG:' || dest.substr(5) !== dest.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiPoint.projeter : Projection voulue invalide");
        }
        
        var projSource = new OpenLayers.Projection(source);
        var projDest = new OpenLayers.Projection(dest);
        var multiPointsOL = this._obtenirGeomOL();
        var multiPointsProj = multiPointsOL.transform(projSource, projDest);
        return new MultiPoint(multiPointsProj, dest);
    };

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