/** 
 * Module pour l'objet {@link Geometrie.Ligne}.
 * @module ligne
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires point
 * @requires aide
 */
define(['geometrie', 'point', 'aide'], function(Geometrie, Point, Aide) {
    /** 
     * Création de l'object Geometrie.Ligne.
     * @constructor
     * @name Geometrie.Ligne
     * @class Geometrie.Ligne
     * @alias ligne:Geometrie.Ligne
     * @requires ligne
     * @param {tableau} arrayPoint Tableau de {@link Geometrie.Point} OU Tableau de paire de coordonnées 
     * ou de {Openlayers.Geometry.Point} 
     * @param {string} [proj] Projection du point (Format EPSG). 
     * Si absent, prend celui de la carte si disponible sinon EPSG:3857
     * @returns {Geometrie.Ligne} Instance de {@link Geometrie.Ligne}
     * @property {tableau} points Tableau de {@link Geometrie.Point}
     * @property {string} projection Projection du point (Format EPSG)
     * @throws new Ligne : Projection EPSG invalide
     * @throws new Ligne : Paramètre invalide
     * @throws new Ligne : Les Points ne sont pas dans la même projection
     * @throws new Ligne : La ligne doit être composée d'au moins 2 points
     * @example
     * new Geometrie.Ligne([[-7994004, 6034079],[-7944004, 6044079]]);
     * new Geometrie.Ligne([[46,52],[48,55]], 'EPSG:4326');
     */
    function Ligne(arrayPoint, proj) {
        Geometrie.apply(this, [proj]);
        var that = this;
        this.points = [];

        if (arrayPoint && (arrayPoint.CLASS_NAME === "OpenLayers.Geometry.LineString" || arrayPoint.CLASS_NAME === "OpenLayers.Geometry.LinearRing")) {
            arrayPoint = arrayPoint.components;
        }

        if (arrayPoint instanceof Array === false) {
            throw new Error("new Ligne : Paramètre invalide");
        }
        $.each(arrayPoint, function(index, value) {
            if (value instanceof Array) {
                that.points.push(new Point(value[0], value[1], that.projection));
            } else if (value instanceof Point) {
                if (value.projection !== that.projection) {
                    //plus: paramètre pour convertir ou non la projection
                    throw new Error("new Ligne : Les Points ne sont pas dans la même projection");
                }
                that.points.push(value);
            } else if (value.CLASS_NAME === "OpenLayers.Geometry.Point") {
                that.points.push(new Point(value.x, value.y, that.projection));
            } else {
                throw new Error("new Ligne : Paramètre invalide");
            }
        });

        if (that.points.length < 2) {
            throw new Error("new Ligne : La ligne doit être composée d'au moins 2 points");
        }
    }

    Ligne.prototype = Object.create(Geometrie.prototype);
    Ligne.prototype.constructor = Ligne;
    
    /** 
     * Obtenir la longueur de la ligne
     * @method 
     * @name Geometrie.Ligne#obtenirLongueur
     * @returns {float} Longueur (m)
     */
    Ligne.prototype.obtenirLongueur = function() {
        return this._obtenirGeomOL().getGeodesicLength(this.projection);
    };
    
    /** 
     * Ajouter un point à la ligne.
     * @method
     * @name Geometrie.Ligne#ajouterPoint
     * @param {Tableau|Geometrie.Point} point Point à ajouter ou paire de coordonnées
     * @returns {Geometrie.Ligne} Retourne lui-même
     * @throws Ligne.ajouterPoint : L'argument n'est pas un point
     * @throws Ligne.ajouterPoint : L'argument n'est pas un point
     * @example Ligne.ajouterPoint([-73,46]);
     */
    Ligne.prototype.ajouterPoint = function(point) {
        if (point instanceof Array) {
            point = new Point(point[0], point[1], this.projection);
        }
        
        if (point instanceof Point === false) {
            throw new Error("Ligne.ajouterPoint : L'argument n'est pas un point");
        } else if (point.projection !== this.projection) {
            throw new Error("Ligne.ajouterPoint : Le point n'est pas dans la même projection");
        }
        this.points.push(point);

        if (this._feature) {
            this._feature.geometry.addPoint(point._obtenirGeomOL());
        }
        return this;
    };
    
    /** 
     * Vérifier si la ligne est une boucle
     * @method
     * @name Geometrie.Ligne#estFerme
     * @returns {Boolean} La ligne est-elle une boucle?
     */
    Ligne.prototype.estFerme = function() {
        return (this.points[0].estEgal(this.points[this.points.length - 1]));
    };
    
    /** 
     * Fermer la ligne pour former une boucle
     * @method
     * @name Geometrie.Ligne#fermerLigne
     * @returns {Geometrie.Ligne} Retourne lui-même
     */
    Ligne.prototype.fermerLigne = function() {
        if (!this.estFerme()) {
            this.ajouterPoint(this.points[0]);
        }
        return this;
    };
       
    /** 
     * Simplifier la géométrie. La simplification est basée sur l'algorithme Douglas-Peucker.
     * Ne modifie pas la ligne, la fonction crée une nouvelle ligne simplifiée
     * @method
     * @param {float} tolerance Tolérance de déplacement de la ligne (dans l'unité de la géométrie)
     * @name Geometrie.Ligne#simplifier
     * @returns {Geometrie.Ligne} Instance projectée de {@link Geometrie.Ligne}
    */
    Ligne.prototype.simplifier = function(tolerance) {
        var ligneSimplifiee = this._obtenirGeomOL().simplify(tolerance);
        return new Ligne(ligneSimplifiee);
    };
    
    /** 
     * Obtenir un "LineString" OpenLayers
     * @method 
     * @private
     * @name Geometrie.Ligne#_obtenirGeomOL
     * @param {float} tolerance Tolérance de déplacement de la ligne (dans l'unité de la géométrie)
     * @returns {Objet} LineString OpenLayers.
     */
    Ligne.prototype._obtenirGeomOL = function(tolerance) {
        var ligneOL = [];
        var ligneSimplifiee = this;
        if (tolerance) {
            ligneSimplifiee = this.simplifier(tolerance);
        }
        $.each(ligneSimplifiee.points, function(index, value) {
            ligneOL.push(value._obtenirGeomOL());
        });
        return new OpenLayers.Geometry.LineString(ligneOL);
    };

    /** 
     * Obtenir un "LinearRing" OpenLayers
     * @method 
     * @private
     * @name Geometrie.Ligne#_obtenirGeomFermeOL
     * @param {float} tolerance Tolérance de déplacement de la ligne (dans l'unité de la géométrie)
     * @returns {Objet} LinearRing OpenLayers.
     */
    Ligne.prototype._obtenirGeomFermeOL = function(tolerance) {
        var ligneOL = [];
        var ligneSimplifiee = this;
        if (tolerance) {
            ligneSimplifiee = this.simplifier(tolerance);
        }
        $.each(ligneSimplifiee.points, function(index, value) {
            ligneOL.push(value._obtenirGeomOL());
        });
        return new OpenLayers.Geometry.LinearRing(ligneOL);
    };

    return Ligne;
});