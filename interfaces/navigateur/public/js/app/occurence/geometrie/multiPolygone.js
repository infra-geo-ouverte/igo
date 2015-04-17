/** 
 * Module pour l'objet {@link Geometrie.MultiPolygone}.
 * @module multiPolygone
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires polygone
 * @requires aide
 */
define(['polygone', 'aide'], function(Polygone, Aide) {
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
        var that = this;
        this.polygones = [];

        if (!proj) {
            var nav = Aide.obtenirNavigateur();
            if (nav && nav.carte) {
                proj = nav.carte.obtenirProjection();
            } else {
                proj = 'EPSG:3857';
            }
        } else if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("new Polygone : Projection EPSG invalide");
        }
        this.projection = proj;

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

    /** 
     * Obtenir la projection de la géométrie
     * @method
     * @name Geometrie.MultiPolygone#obtenirProjection
     * @returns {String} Projection EPSG
     */
    MultiPolygone.prototype.obtenirProjection = function() {
        return this.projection;
    };

    /** 
     * Définir la projection à la géométrie
     * @method
     * @param {String} proj Projection EPSG
     * @name Geometrie.MultiPolygone#definirProjection
     * @throws MultiPolygone.definirProjection : Projection EPSG invalide
     * @example MultiPolygone.definirProjection('EPSG:4326');
     */
    MultiPolygone.prototype.definirProjection = function(proj) {
        if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiPolygone.definirProjection : Projection EPSG invalide");
        }
        this.projection = proj;
    };

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

    /*
     * Transformer les coordonnées dans une autre projection.
     * Cette fonction ne modifie par le MultiPolygone, un nouveau MultiPolygone est créé
     * @method
     * @name Geometrie.MultiPolygone#projeter
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection du MultiPolygone.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Geometrie.MultiPolygone} Instance projectée de {@link Geometrie.MultiPolygone}
     * @throws MultiPolygone.projeter : Projection source invalide
     * @throws MultiPolygone.projeter : Projection voulue invalide
     * @example MultiPolygone.projeter('EPSG:4326');
     * @example MultiPolygone.projeter('EPSG:4326','EPSG:900913');
     */
    MultiPolygone.prototype.projeter = function(arg1, arg2) {
        var dest, source;
        if (arg2) {
            source = arg1;
            dest = arg2;
        } else {
            source = this.projection;
            dest = arg1;
        }
        if (typeof source !== "string" || source.toUpperCase().substr(0, 5) !== 'EPSG:' || source.substr(5) !== source.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiPolygone.projeter : Projection source invalide");
        }
        if (typeof dest !== "string" || dest.toUpperCase().substr(0, 5) !== 'EPSG:' || dest.substr(5) !== dest.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiPolygone.projeter : Projection voulue invalide");
        }
        var projSource = new OpenLayers.Projection(source);
        var projDest = new OpenLayers.Projection(dest);
        var polyOL = this._obtenirGeomOL();
        var polyProj = polyOL.transform(projSource, projDest);
        return new MultiPolygone(polyProj, dest);
    };

    /**
    * Obtenir le type de la classe
    * @method
    * @name MultiPolygone#obtenirTypeClasse
    * @returns {String} Type de l'outil
    */
    MultiPolygone.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
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