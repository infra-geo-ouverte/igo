/** 
 * Module pour l'objet {@link Geometrie.MultiLigne}.
 * @module multiLigne
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 */

define(['aide', 'point', 'ligne'], function(Aide, Point, Ligne) {
    /** 
     * Création de l'object Geometrie.MultiLigne.
     * @constructor
     * @name Geometrie.MultiLigne
     * @class Geometrie.MultiLigne
     * @alias multiLigne:Geometrie.MultiLigne
     * @requires multiLigne
     * @param {string} [proj] Projection du multiLigne (Format EPSG). 
     * Si absent, prend celui de la carte si disponible sinon EPSG:3857
     * @returns {Geometrie.MultiLigne} Instance de {@link Geometrie.MultiLigne}
     */
    function MultiLigne(arrayLigne, proj) {
        var that = this;
        this.lignes = [];

        if (!proj) {
            var nav = Aide.obtenirNavigateur();
            if (nav && nav.carte) {
                proj = nav.carte.obtenirProjection();
            } else {
                proj = 'EPSG:3857';
            }
        } else if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("new MultiLigne : Projection EPSG invalide");
        }
        this.projection = proj;

        if (!arrayLigne) {
            throw new Error("new MultiLigne : Le paramètre est obligatoire");
        }

        //Si c'est un élément de type "OpenLayers.Geometry.MultiLineString"
        if (arrayLigne.CLASS_NAME === "OpenLayers.Geometry.MultiLineString") {
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
                that.lignes.push((new Ligne(value, that.projection)));
            } else if (value instanceof Ligne) {
                if (value.projection !== that.projection) {
                    //plus: paramètre pour convertir ou non la projection
                    throw new Error("new MultiLigne : Les lignes ne sont pas dans la même projection");
                }
                that.lignes.push(value);
            } //Si l'élément est une géométrie Openlayers de type ligne
            else if (value.CLASS_NAME === "OpenLayers.Geometry.LineString" || value.CLASS_NAME == "OpenLayers.Geometry.LinearRing") {
                that.lignes.push(new Ligne(value.components, that.projection));
            } else {
                throw new Error("new MultiLigne : Paramètre invalide");
            }
        });

        if (that.lignes.length < 1) {
            throw new Error("new MultiLigne : Le MultiLigne doit être composé d'au moins une ligne");
        }
    }

    /**
    * Obtenir le type de la classe
    * @method
    * @name MultiLigne#obtenirTypeClasse
    * @returns {String} Type de l'outil
    */
    MultiLigne.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };
    
    /** 
     * Obtenir la projection de la géométrie
     * @method
     * @name Geometrie.MultiLigne#obtenirProjection
     * @returns {String} Projection EPSG
     */
    MultiLigne.prototype.obtenirProjection = function() {
        return this.projection;
    };

    /** 
     * Définir la projection à la géométrie
     * @method
     * @param {String} proj Projection EPSG
     * @name Geometrie.MultiLigne#definirProjection
     * @throws MultiLigne.definirProjection : Projection EPSG invalide
     * @example MultiLigne.definirProjection('EPSG:4326');
     */
    MultiLigne.prototype.definirProjection = function(proj) {
        if (typeof proj !== "string" || proj.toUpperCase().substr(0, 5) !== 'EPSG:' || proj.substr(5) !== proj.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiLigne.definirProjection : Projection EPSG invalide");
        }
        this.projection = proj;
    };


    /** 
     * Transformer les coordonnées dans une autre projection.
     * Cette fonction ne modifie par le multiLigne, un nouveau multiLigne est créé.
     * @method
     * @name Geometrie.MultiLigne#projeter
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection du multiLigne.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Geometrie.MultiLigne} Instance projectée de {@link Geometrie.MultiLigne}
     * @throws MultiLigne.projeter : Projection source invalide
     * @throws MultiLigne.projeter : Projection voulue invalide
     * @example MultiLigne.projeter('EPSG:4326');
     * @example MultiLigne.projeter('EPSG:4326','EPSG:900913');
     */
    MultiLigne.prototype.projeter = function(arg1, arg2) {
        var dest, source;
        if (arg2) {
            source = arg1;
            dest = arg2;
        } else {
            source = this.projection;
            dest = arg1;
        }
        if (typeof source !== "string" || source.toUpperCase().substr(0, 5) !== 'EPSG:' || source.substr(5) !== source.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiLigne.projeter : Projection source invalide");
        }
        if (typeof dest !== "string" || dest.toUpperCase().substr(0, 5) !== 'EPSG:' || dest.substr(5) !== dest.substr(5).match(/[0-9]+/)[0]) {
            throw new Error("MultiLigne.projeter : Projection voulue invalide");
        }
        
        var projSource = new OpenLayers.Projection(source);
        var projDest = new OpenLayers.Projection(dest);
        var multiLignesOL = this._obtenirGeomOL();
        var multiLignesProj = multiLignesOL.transform(projSource, projDest);
        return new MultiLigne(multiLignesProj, dest);
    };

    /** 
     * Obtenir un multiLigne OpenLayers
     * @method 
     * @private
     * @name Geometrie.MultiLigne#_obtenirGeomOL
     * @returns {Objet} MultiLigne OpenLayers.
     */
    MultiLigne.prototype._obtenirGeomOL = function() {
        var lignesOL = [];
        $.each(this.lignes, function(index, value) {
            lignesOL.push(value._obtenirGeomOL());
        });
        return new OpenLayers.Geometry.MultiLineString(lignesOL);
    };

    return MultiLigne;
});