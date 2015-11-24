/** 
 * Module pour l'objet {@link Geometrie.MultiLigne}.
 * @module multiLigne
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 */

define(['geometrie', 'aide', 'point', 'ligne'], function(Geometrie, Aide, Point, Ligne) {
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
        Geometrie.apply(this, [proj]);
        var that = this;
        this.lignes = [];

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

    MultiLigne.prototype = Object.create(Geometrie.prototype);
    MultiLigne.prototype.constructor = MultiLigne;
    

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