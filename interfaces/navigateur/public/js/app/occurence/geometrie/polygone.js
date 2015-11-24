/** 
 * Module pour l'objet {@link Geometrie.Polygone}.
 * @module polygone
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires ligne
 * @requires point
 * @requires aide
 */
define(['geometrie', 'ligne', 'point', 'aide'], function(Geometrie, Ligne, Point, Aide) {
    /** 
     * Création de l'object Geometrie.Polygone.
     * @constructor
     * @name Geometrie.Polygone
     * @class Geometrie.Polygone
     * @alias polygone:Geometrie.Polygone
     * @requires polygone
     * @param {tableau} arrayLigne Tableau de {@link Geometrie.Ligne} OU {OpenLayers.Geometry.LineString} OU {	"OpenLayers.Geometry.Polygon"}
     * ou Tableau de paire de coordonnées
     * @param {string} [proj] Projection du point (Format EPSG). 
     * Si absent, prend celui de la carte si disponible sinon EPSG:3857
     * @returns {Geometrie.Polygone} Instance de {@link Geometrie.Polygone}
     * @property {tableau} lignes Tableau de {@link Geometrie.Ligne}
     * @property {string} projection Projection du point (Format EPSG)
     * @throws new Polygone : Projection EPSG invalide
     * @throws new Polygone : Paramètre invalide
     * @throws new Polygone : Le paramètre est obligatoire
     * @throws new Polygone : Les lignes ne sont pas dans la même projection
     * @throws new Polygone : Le polygone doit être composée d'au moins une ligne
     * @example
     * new Geometrie.Polygone([[-73,52], [-74,55], [-74,52]], 'EPSG:4326');
     * //Pour un polygone troué:
     * new Geometrie.Polygone([[[-72,50], [-72,58], [-75,58], [-75,50]], [[-73,52], [-74,55], [-74,52]]], 'EPSG:4326');
     */
    function Polygone(arrayLigne, proj) {
        Geometrie.apply(this, [proj]);
        var that = this;
        this.lignes = [];

        if (!arrayLigne) {
            throw new Error("new Polygone : Le paramètre est obligatoire");
        }

        //Si c'est un élément de type "OpenLayers.Geometry.Polygon"
        if (arrayLigne.CLASS_NAME === "OpenLayers.Geometry.Polygon") {
            arrayLigne = arrayLigne.components;
        } else if (arrayLigne instanceof Ligne || arrayLigne.CLASS_NAME === "OpenLayers.Geometry.LineString" || arrayLigne.CLASS_NAME === "OpenLayers.Geometry.LinearRing") {
            arrayLigne = [arrayLigne];
        } else {
            if ($.isArray(arrayLigne) && arrayLigne[0] && (arrayLigne[0] instanceof Ligne || arrayLigne[0].CLASS_NAME === "OpenLayers.Geometry.LineString" || arrayLigne[0].CLASS_NAME === "OpenLayers.Geometry.LinearRing")) {
                //Paramètre: [ligne]
            } else if ($.isArray(arrayLigne[0]) && arrayLigne[0][0] && (arrayLigne[0][0] instanceof Point || arrayLigne[0][0] instanceof Array || arrayLigne[0][0].CLASS_NAME === "OpenLayers.Geometry.Point")) {
                //Paramètre: [[points]]
            } else {
                arrayLigne = [arrayLigne];
            }
        }

        $.each(arrayLigne, function(index, value) {
            if (value instanceof Array) {
                that.lignes.push((new Ligne(value, that.projection)).fermerLigne());
            } else if (value instanceof Ligne) {
                if (value.projection !== that.projection) {
                    //plus: paramètre pour convertir ou non la projection
                    throw new Error("new Polygone : Les lignes ne sont pas dans la même projection");
                }
                that.lignes.push(value.fermerLigne());
            } //Si l'élément est une géométrie Openlayers de type ligne
            else if (value.CLASS_NAME === "OpenLayers.Geometry.LineString" || value.CLASS_NAME == "OpenLayers.Geometry.LinearRing") {
                that.lignes.push(new Ligne(value.components, that.projection));
            } else {
                throw new Error("new Polygone : Paramètre invalide");
            }
        });

        if (that.lignes.length < 1) {
            throw new Error("new Polygone : Le polygone doit être composé d'au moins une ligne");
        }
    }

    Polygone.prototype = Object.create(Geometrie.prototype);
    Polygone.prototype.constructor = Polygone;
    
    /** 
     * Obtenir la longueur du périmètre
     * @method 
     * @name Geometrie.Polygone#obtenirPerimetre
     * @returns {float} Longueur (m)
     */
    Polygone.prototype.obtenirPerimetre = function() {
        return this._obtenirGeomOL().getGeodesicLength(this.projection);
    };

    /** 
     * Obtenir l'aire du polygone
     * @method 
     * @name Geometrie.Polygone#obtenirSuperficie
     * @returns {float} Aire (m²)
     */
    Polygone.prototype.obtenirSuperficie = function() {
        return this._obtenirGeomOL().getGeodesicArea(this.projection);
    };

    /** 
     * Obtenir le périmètre
     * @method 
     * @name Geometrie.Polygone#obtenirExterieur
     * @returns {Geometrie.Ligne} Périmètre
     */
    Polygone.prototype.obtenirExterieur = function() {
        return this.lignes[0];
    };

    /** 
     * Obtenir les trous du polygones
     * @method 
     * @name Geometrie.Polygone#obtenirInterieurs
     * @returns {Tableau} Tableau de {@link Geometrie.Ligne}
     */
    Polygone.prototype.obtenirInterieurs = function() {
        return this.lignes.slice(1);
    };

     /** 
     * Simplifier la géométrie. La simplification est basée sur l'algorithme Douglas-Peucker.
     * Ne modifie pas le polygone, la fonction crée un nouveau polygone simplifié
     * @method
     * @param {float} tolerance Tolérance de déplacement des lignes du polygones (dans l'unité de la géométrie)
     * @name Geometrie.Polygone#simplifier
     * @returns {Geometrie.Polygone} Instance projectée de {@link Geometrie.Polygone}
     */
    Polygone.prototype.simplifier = function(tolerance) {
        var lignesSimplifiees = [];
        $.each(this.lignes, function(index, value) {
            var ligneSimp = value.simplifier(tolerance);
            if (index !== 0 && ligneSimp.points.length < 4) {
                return true;
            }
            lignesSimplifiees.push(ligneSimp);
        });
        return new Polygone(lignesSimplifiees);
    };

    /** 
     * Obtenir un "Polygon" OpenLayers
     * @method 
     * @private
     * @name Geometrie.Polygone#_obtenirGeomOL
     * @param {float} tolerance Tolérance de déplacement des lignes du polygones (dans l'unité de la géométrie)
     * @returns {Objet} Polygon OpenLayers.
     */
    Polygone.prototype._obtenirGeomOL = function(tolerance) {
        var polygoneOL = [];
        $.each(this.lignes, function(index, value) {
            polygoneOL.push(value._obtenirGeomFermeOL(tolerance));
        });
        return new OpenLayers.Geometry.Polygon(polygoneOL);
    };

    return Polygone;
});