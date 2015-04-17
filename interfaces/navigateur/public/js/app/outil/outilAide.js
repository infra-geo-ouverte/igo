/** 
 * Module pour l'objet {@link Outil.OutilAide}.
 * @module outilAide
 * @requires outil 
 * @requires aide 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['outil', 'aide'], function(Outil, Aide) {
    /** 
     * Création de l'object Outil.OutilAide.
     * Pour la liste complète des paramètres, voir {@link Outil}
     * @constructor
     * @name Outil.OutilAide
     * @class Outil.OutilAide
     * @alias outilAide:Outil.OutilAide
     * @extends Outil
     * @requires outilAide
     * @param {string} [options.id='aide_goloc##'] Identifiant du bouton. Si absent, XX est un nombre généré.
     * @param {string} [options.icone='aide'] Icone du bouton. Lien vers l'image ou une classe CSS
     * @param {string} [options.infobulle='Guide d'auto-formation'] Description (tooltip) du bouton
     * @param {string} [options.lien] Lien vers l'aide. Si absent, lien vers l'aide du MSP.
     * @returns {Outil.OutilAide} Instance de {@link Outil.OutilAide}
    */
    function OutilAide(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: 'aide',
            id: 'aide_goloc',
            infobulle: "Guide d'auto-formation",
            lien: "guides/guide.pdf"
        });
    };
    
    OutilAide.prototype = new Outil();
    OutilAide.prototype.constructor = OutilAide;
 
 
    /** 
    * Action de l'outil.
    * Ouvre l'aide de l'application.
    * @method
    * @name Outil.OutilAide#executer
    */
    OutilAide.prototype.executer =  function () {
        var link = Aide.utiliserBaseUri(this.options.lien);
        window.open(link);
    };

    return OutilAide;
    
});