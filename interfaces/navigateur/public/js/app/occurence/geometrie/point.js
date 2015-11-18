/** 
 * Module pour l'objet {@link Geometrie.Point}.
 * @module point
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 */

define(['geometrie', 'aide'], function(Geometrie, Aide) {
    /** 
     * Création de l'object Geometrie.Point.
     * @constructor
     * @name Geometrie.Point
     * @class Geometrie.Point
     * @alias point:Geometrie.Point
     * @requires point
     * @param {float|string} x Coordonées X du point OU Openlayers.Geometry.Point
     * @param {float|string} y Coordonées Y du point
     * @param {string} [proj] Projection du point (Format EPSG). 
     * Si absent, prend celui de la carte si disponible sinon EPSG:3857
     * @returns {Geometrie.Point} Instance de {@link Geometrie.Point}
     * @property {float} x Coordonées X du point
     * @property {float} y Coordonées Y du point
     * @property {string} projection Projection du point (Format EPSG)
     * @throws new Point : Paramètres obligatoires
     * @throws new Point : Paramètres invalides
     * @throws new Point : Projection EPSG invalide
     * @example new Point(-7994004, 6034079)
     * @example new Point(-73.4, 46.5, 'EPSG:4326')
     * @example new Point([-73.4, 46.5], 'EPSG:4326')
     */
    function Point(x, y, proj) {
        if (!x) {
            throw new Error("new Point : Paramètres obligatoires");
        } else if ((typeof x == "number" || typeof x == "string") && (typeof y == "number" || typeof y == "string")) {
            this.x = parseFloat(x);
            this.y = parseFloat(y);
        } //Si une géométrie Openlayers de type point a été passé comme premier paramètre et rien comme 2e
        else if (x.CLASS_NAME == "OpenLayers.Geometry.Point" && x.x && x.y) {
            this.x = parseFloat(x.x);
            this.y = parseFloat(x.y);
            proj = y;
        } else if ($.isArray(x) && (typeof x[0] == "number" || typeof x[0] == "string") && (typeof x[1] == "number" || typeof x[1] == "string")) {
            this.x = parseFloat(x[0]);
            this.y = parseFloat(x[1]);
            proj = y;
        }

        if (!this.x || !this.y) {
            throw new Error("new Point : Paramètres invalides");
        }

        Geometrie.apply(this, [proj]);

        var nav = Aide.obtenirNavigateur();
        if(nav && nav.carte && nav.carte.options.precision){
            this.precision = parseInt(nav.carte.options.precision);
            this.definirNombreDecimales();
        }
    }

    Point.prototype = Object.create(Geometrie.prototype);
    Point.prototype.constructor = Point;

    /** 
     * Transformer les coordonnées dans une autre projection.
     * Cette fonction ne modifie par le point, un nouveau point est créé.
     * @method
     * @name Geometrie.Point#projeter
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection du point.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Geometrie.Point} Instance projectée de {@link Geometrie.Point}
     * @throws Point.projeter : Projection source invalide
     * @throws Point.projeter : Projection voulue invalide
     * @example Point.projeter('EPSG:4326');
     * @example Point.projeter('EPSG:4326','EPSG:900913');
     */
    Point.prototype.projeter = function(arg1, arg2) {
        var dest, source;
        if (arg2) {
            source = arg1;
            dest = arg2;
        } else {
            source = this.projection;
            dest = arg1;
        }
        if (typeof source !== "string" || source.toUpperCase().substr(0, 5) !== 'EPSG:' || source.substr(5) !== source.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Point.projeter : Projection source invalide");
        }
        if (typeof dest !== "string" || dest.toUpperCase().substr(0, 5) !== 'EPSG:' || dest.substr(5) !== dest.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("Point.projeter : Projection voulue invalide");
        }
        var projSource = new OpenLayers.Projection(source);
        var projDest = new OpenLayers.Projection(dest);
        var pointOL = new OpenLayers.LonLat(this.x, this.y);
        var pointProj = pointOL.transform(projSource, projDest);
        return new Point(pointProj.lon, pointProj.lat, dest);
    };

    /** 
     * Obtenir un point OpenLayers
     * @method 
     * @private
     * @name Geometrie.Point#_obtenirGeomOL
     * @returns {Objet} Point OpenLayers.
     */
    Point.prototype._obtenirGeomOL = function() {
        return new OpenLayers.Geometry.Point(this.x, this.y);
    };

    /** 
     * Obtenir un LonLat OpenLayers
     * @method 
     * @private
     * @name Geometrie.Point#_obtenirLonLatOL
     * @returns {Objet} LonLat OpenLayers.
     */
    Point.prototype._obtenirLonLatOL = function() {
        return new OpenLayers.LonLat(this.x, this.y);
    };

    /** 
     * Comparer deux points
     * @method
     * @name Geometrie.Point#estEgal
     * @param {Geometrie.Point} p2 Point à comparer
     * @returns {Boolean} Les points sont-ils égaux?
     */
    Point.prototype.estEgal = function(p2) {
        if (!(p2 instanceof Point)) {
            return false;
        }
        //plus: paramètre pour convertir ou non la projection
        //plus: nombre de décimales à vérifier
        return ((this.x === p2.x) && (this.y === p2.y) && (this.projection === p2.projection));
    };

    /** 
     * Calcul de la distance entre deux points
     * @method
     * @name Geometrie.Point#distanceDe
     * @param {Geometrie.Point} p2 2e Point
     * @returns {float} Distance entre les 2 points (dans l'unité de la projection)
     * @throws Point.distanceDe : L'argument n'est pas un point
     * @throws Point.distanceDe : Les points ne sont pas dans la même projection
     */
    Point.prototype.distanceDe = function(p2) {
        if (!(p2 instanceof Point)) {
            throw new Error("Point.distanceDe : L'argument n'est pas un point");
        } else if (this.projection !== p2.projection) {
            //plus: paramètre pour convertir ou non la projection
            throw new Error("Point.distanceDe : Les points ne sont pas dans la même projection");
        }
        return this._obtenirGeomOL().distanceTo(p2._obtenirGeomOL());
    };

    /**
     * Définir le nombre de décimales pour les coordonnées selon la valeur défini dans le fichier de config xml
     * @param {float} nombre Nombre où la précision doit être défini
     * @param {type} precision le nombre de décimale à définir pour le nombre
     * @returns {nombre} nombre avec la nouvelle précision
     */
    Point.prototype.definirNombreDecimales = function(nombre){
        if(nombre){
            this.precision = nombre;
        } else if(!this.precision){
            return true;
        }
        
        var multi = Math.pow(10, this.precision);
        this.x = Math.round((this.x * multi).toFixed(this.precision + 1) ) / multi;
        this.y = Math.round((this.y * multi).toFixed(this.precision + 1) ) / multi;
    };

    Point.prototype.majGeometrie = function(point) {
        Geometrie.prototype.majGeometrie.call(this, point);
        this.definirNombreDecimales();
    };
    
    return Point;
});