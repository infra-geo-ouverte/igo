/** 
 * Module pour l'objet {@link Panneau.Localisation}.
 * @module localisation
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires panneauOnglet
 */

define(['panneauOnglet'], function(PanneauOnglet) {
    /** 
     * Création de l'object Panneau.Localisation.
     * Objet à ajouter à un panneauMenu.
     * @constructor
     * @name Panneau.Localisation
     * @class Panneau.Localisation
     * @alias localisation:Panneau.Localisation
     * @extends PanneauOnglet
     * @requires localisation
     * @param {string} [options.id='localisation-panneau'] Identifiant du panneau.
     * @param {string} [options.titre='Outil de localisation'] Titre du panneau.
     * @returns {Panneau.Localisation} Instance de {@link Panneau.Localisation}
    */
    function Localisation(options){
        this.options = options || {};
        this._lastIndexRadio=0;
        this.defautOptions.titre = 'Outil de localisation';
        this.defautOptions.id = 'localisation-panneau';
    };

    Localisation.prototype = new PanneauOnglet();
    Localisation.prototype.constructor = Localisation;
      
    return Localisation;
    
});