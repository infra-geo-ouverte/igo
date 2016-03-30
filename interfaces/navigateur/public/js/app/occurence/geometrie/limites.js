/** 
 * Module pour l'objet {@link Geometrie.Limites}.
 * @module limites
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 * @requires point
 */
define(['geometrie', 'aide', 'point'], function(Geometrie, Aide, Point) {
    /** 
     * Création de l'object Geometrie.Limites.
     * @constructor
     * @name Geometrie.Limites
     * @class Geometrie.Limites
     * @alias limites:Geometrie.Limites
     * @requires limites
     * @returns {Geometrie.Limites} Instance de {@link Geometrie.Limites}
     * @param {float} gauche Limite gauche
     * @param {float} bas Limite bas
     * @param {float} droite Limite droite
     * @param {float} haut Limite haut
     * @param {string} [proj] Projection du point (Format EPSG). 
     * Si absent, prend celui de la carte si disponible sinon EPSG:3857
     * @property {float} gauche Limite gauche
     * @property {float} bas Limite bas
     * @property {float} droite Limite droite
     * @property {float} haut Limite haut
     * @property {string} projection Projection du point (Format EPSG)
     */
    function Limites(gauche, bas, droite, haut, proj) {
        Geometrie.apply(this, [proj]);
        this.gauche = Number(gauche);
        this.bas = Number(bas);
        this.droite = Number(droite);
        this.haut = Number(haut);

        if (!this.gauche || !this.bas || !this.droite || !this.haut) {
            throw new Error("new Limites : Paramètre absent");
        }
    }

    Limites.prototype = Object.create(Geometrie.prototype);
    Limites.prototype.constructor = Limites;

    /** 
     * Vérifier si la limite contient le point.
     * @method
     * @name Geometrie.Limites#contientPoint
     * @param {Geometrie.Point} point Point à vérifier
     * @returns {Boolean} Le point est-il à l'intérieur de la limite
     */
    Limites.prototype.contientPoint = function(point) {
        if (!(point instanceof Point)) {
            throw new Error("Limites.contientPoint : L'argument n'est pas un point");
        } else if (this.projection !== point.projection) {
            //plus: paramètre pour convertir ou non la projection
            throw new Error("Limites.contientPoint : Le point n'est pas dans la même projection");
        }
        var limitesOL = this._obtenirBoundsOL();
        return limitesOL.containsLonLat(point._obtenirLonLatOL());
    };


    /** 
     * Transformer les coordonnées dans une autre projection.
     * Cette fonction ne modifie par la limite, une nouvelle limite est créée.
     * @method
     * @name Geometrie.Limites#projeter
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection de la limite.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Geometrie.Limites} Instance projectée de {@link Geometrie.Limites}
     * @throws Limites.projeter : Projection source invalide
     * @throws Limites.projeter : Projection voulue invalide
     * @example Limites.projeter('EPSG:4326');
     * @example Limites.projeter('EPSG:4326','EPSG:900913');    
     */
    Limites.prototype.projeter = function(arg1, arg2) {
        var dest, source;
        if (arg2) {
            source = arg1;
            dest = arg2;
        } else {
            source = this.projection;
            dest = arg1;
        }
        if (typeof source !== "string" || source.toUpperCase().substr(0, 5) !== 'EPSG:' || source.substr(5) !== source.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Limites.projeter : Projection source invalide");
        }
        if (typeof dest !== "string" || dest.toUpperCase().substr(0, 5) !== 'EPSG:' || dest.substr(5) !== dest.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Limites.projeter : Projection voulue invalide");
        }
        var projSource = new OpenLayers.Projection(source);
        var projDest = new OpenLayers.Projection(dest);
        var limitesOL = this._obtenirBoundsOL();
        var limitesProj = limitesOL.transform(projSource, projDest);
        return new Limites(limitesProj.left, limitesProj.bottom, limitesProj.right, limitesProj.top, dest);
    };
    
    /** 
     * Obtenir une géométrie OpenLayers
     * @method 
     * @private
     * @name Geometrie.Limites#_obtenirGeomOL
     * @returns {Objet} Géométrie OpenLayers.
     */
    Limites.prototype._obtenirGeomOL = function() {
        return this._obtenirBoundsOL().toGeometry();
    };

    /** 
     * Obtenir une limite OpenLayers
     * @method 
     * @private
     * @name Geometrie.Limites#_obtenirBoundsOL
     * @returns {Objet} Limites OpenLayers.
     */
    Limites.prototype._obtenirBoundsOL = function() {
        return new OpenLayers.Bounds(this.gauche, this.bas, this.droite, this.haut);
    };
    
    /** 
     * Fusionner 2 limites IGO
     * @method 
     * @private
     * @name Geometrie.Limites#fusionnerLimites
     * @returns {Objet} Nouvelles Limites.
     */
    Limites.prototype.fusionnerLimites = function(autreLimite) {
    	var limitesOL = this._obtenirBoundsOL();
    	limitesOL.extend( autreLimite._obtenirBoundsOL() );
    	var limites = new Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
        return limites; 
    };
    
    Limites.prototype.obtenirCentroide = function() {
        var x = Number(this.gauche) + ((Number(this.droite)-Number(this.gauche))/2);
        var y = Number(this.bas) + ((Number(this.haut)-Number(this.bas))/2);
        return new Point(x, y, this.projection);
    };

    return Limites;
});