/** 
 * Module pour l'objet {@link Geometrie}.
 * @module geometrie
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 */

define(['aide'], function(Aide) {

	function Geometrie(proj) {
	  	if (this.constructor === Geometrie) {
	      throw new Error("Ne peut pas instancier la classe abstraite 'Geometrie'");
	    }

        if (!proj) {
            var nav = Aide.obtenirNavigateur();
            if (nav && nav.carte) {
                proj = nav.carte.obtenirProjection();
            } else {
                proj = 'EPSG:3857';
            }
        } else if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("new " + this.obtenirTypeClasse() + " : Projection EPSG invalide");
        }
        this.projection = proj.toUpperCase();
	}

    /**
    * Obtenir le type de la classe
    * @method
    * @name Geometrie#obtenirTypeClasse
    * @returns {String} Nom de la classe
	**/

    Geometrie.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };

    /** 
     * Obtenir la projection de la géométrie
     * @method
     * @name Geometrie#obtenirProjection
     * @returns {String} Projection EPSG
     */
    Geometrie.prototype.obtenirProjection = function() {
        return this.projection;
    };

    /** 
     * Définir la projection à la géométrie
     * @method
     * @param {String} proj Projection EPSG
     * @name Geometrie#definirProjection
     * @throws definirProjection : Projection EPSG invalide
     * @example definirProjection('EPSG:4326');
     */
    Geometrie.prototype.definirProjection = function(proj) {
        if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error(this.obtenirTypeClasse() + ".definirProjection : Projection EPSG invalide");
        }
        this.projection = proj;
    };

    /** 
     * Transformer les coordonnées dans une autre projection.
     * Cette fonction ne modifie par la géométrie, une nouvelle géométrie est créée.
     * @method
     * @name Geometrie#projeter
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection de la géométrie.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Geometrie.Point} Instance projectée de {@link Geometrie}
     * @throws Geometrie.projeter : Projection source invalide
     * @throws Geometrie.projeter : Projection voulue invalide
     * @example Geometrie.projeter('EPSG:4326');
     * @example Geometrie.projeter('EPSG:4326','EPSG:900913');
     */
    Geometrie.prototype.projeter = function(arg1, arg2) {
        var dest, source;
        if (arg2) {
            source = arg1;
            dest = arg2;
        } else {
            source = this.projection;
            dest = arg1;
        }
        if (typeof source !== "string" || source.toUpperCase().substr(0, 5) !== 'EPSG:' || source.substr(5) !== source.substr(5).match(/[0-9]+/)[0]) {
            throw new Error(this.obtenirTypeClasse() + ".projeter : Projection source invalide");
        }
        if (typeof dest !== "string" || dest.toUpperCase().substr(0, 5) !== 'EPSG:' || dest.substr(5) !== dest.substr(5).match(/[0-9]+/)[0]) {
            throw new Error(this.obtenirTypeClasse() + ".projeter : Projection voulue invalide");
        }
        var projSource = new OpenLayers.Projection(source);
        var projDest = new OpenLayers.Projection(dest);
        var geomOL = this._obtenirGeomOL();
        var geomProj = geomOL.transform(projSource, projDest);
        return new Igo.Geometrie[this.obtenirTypeClasse()](geomProj, dest);
    };


    /** 
     * Obtenir les limites de la géométrie
     * @method
     * @name Geometrie#obtenirLimites
     * @returns {Geometrie} Limites de la géométrie
     */
    Geometrie.prototype.obtenirLimites = function() {
        if (this.limites) {
            return this.limites;
        }
        var limitesOL = this._obtenirGeomOL().getBounds();
        return new Igo.Geometrie.Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top, this.projection);
    };

    Geometrie.prototype.obtenirCentroide = function() {
        var centroidOL = this._obtenirGeomOL().getCentroid();
        return new Igo.Geometrie.Point(centroidOL, this.projection);
    };

    Geometrie.prototype.obtenirCentre = function() {
        var limites = this.obtenirLimites();
        return limites.obtenirCentroide();
    };

    /** 
     * Déplacer la géométrie vers un nouveau point
     * @method
     * @name Geometrie#deplacer
     * @param {Geometrie.Point} point Nouvel emplacement
     * @returns {Geometrie} Retourne lui-même
     * @throws Geometrie.deplacer : L'argument n'est pas un point
     * @throws Geometrie.deplacer : Les géométries ne sont pas dans la même projection
     */
    Geometrie.prototype.deplacer = function(point) {
        if(!point){
            throw new Error(this.obtenirTypeClasse() + ".deplacer : L'argument est obligatoire");
        } else if (point.CLASS_NAME === 'OpenLayers.LonLat'){
            //continue
        } else if (point.obtenirTypeClasse() !== 'Point') {
            throw new Error(this.obtenirTypeClasse() + ".deplacer : L'argument n'est pas un point");
        } else if (this.projection !== point.projection) {
            //plus: paramètre pour convertir ou non la projection
            throw new Error(this.obtenirTypeClasse() + ".deplacer : Les points ne sont pas dans la même projection");
        }

        if (this._feature) {
            var pointOL = point;
            if (point.obtenirTypeClasse && point.obtenirTypeClasse() === 'Point'){
                pointOL = point._obtenirLonLatOL();
            }
            this._feature.move(pointOL);
            this.majGeometrie(this._feature.geometry);
        } else {
            var centre = this.obtenirCentre();
            var dx = point.x - centre.x;
            var dy = point.y - centre.y;
            this.deplacerDe(dx, dy);
        }

        return this;
    };

     /** 
     * Déplacer de dX et dY le point
     * @method
     * @name Geometrie#deplacerDe
     * @param {float} dx delta en X
     * @param {float} dy delta en Y
     * @returns {Geometrie} Retourne lui-même
     */
    Geometrie.prototype.deplacerDe = function(dx , dy) {
        if (this._feature) {
            var centre = this.obtenirCentre();
            var newX = parseFloat(centre.x+dx);
            var newY = parseFloat(centre.y+dy);
            var point = new OpenLayers.LonLat(newX, newY);
            this.deplacer(point);
        } else {
            geom = this._obtenirGeomOL();
            geom.move(dx, dy);
            this.majGeometrie(geom);
        }
        return this;
    };
    
    Geometrie.prototype.majGeometrie = function(geom, proj) {
        var proj = proj || this.projection;
        var newGeom = new this.constructor(geom, proj);
        if(newGeom){
            $.extend(this, newGeom);
        }
        return this;
    };

    return Geometrie;
});