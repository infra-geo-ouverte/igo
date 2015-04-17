/** 
 * Module pour l'objet {@link Panneau.PanneauEntete}.
 * @module panneauEntete
 * @requires panneau 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['panneau', 'aide'], function(Panneau, Aide) {
     /** 
     * Création de l'object Panneau.PanneauEntete.
     * Pour la liste complète des paramètres, voir {@link Panneau}
     * @constructor
     * @name Panneau.PanneauEntete
     * @class Panneau.PanneauEntete
     * @alias panneauEntete:Panneau.PanneauEntete
     * @extends Panneau
     * @requires panneauEntete
     * @param {string} [options.id='entete-panneau##'] Identifiant du panneau.
     * @param {string} [options.image] Url de l'image du bandeau d'entête.
     * @returns {Panneau.PanneauEntete} Instance de {@link Panneau.PanneauEntete}
    */
    function PanneauEntete(options){
        this.options = options || {};
        var image = Aide.utiliserBaseUri(this.options.image || "images/bandeau_donnees_ouv_goloc.png");
        var html = this.options.html || "<div style='text-align: center;'><img style='text-align: center;' src=\""+image+"\" alt=\"\" name=\"Entête IGO\" border=\"0\" /></div>";
        this.defautOptions.id = "info-entete";
        this.defautOptions.items = [{
            id: 'header',
            html: html
        }];
    };

    PanneauEntete.prototype = new Panneau();
    PanneauEntete.prototype.constructor = PanneauEntete;
  
    return PanneauEntete;
    
});