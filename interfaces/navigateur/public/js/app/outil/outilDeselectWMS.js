/** 
 * Module pour l'objet {@link Outil.OutilDeselectWMS}.
 * @module outilDeselectWMS
 * @requires outil 
 * @requires aide 
 * @author Michael Lane, FADQ
 * @version 1.0
 */
define(['outil'], function(Outil) {
    /** 
     * Création de l'object Outil.OutilDeselectWMS.
     * @constructor
     * @name Outil.OutilDeselectWMS
     * @class Outil.OutilDeselectWMS
     * @alias outilDeselectWMS:Outil.OutilDeselectWMS
     * @extends Outil
     * @requires outilDeselectWMS
     * @returns {Outil.OutilDeselectWMS} Instance de {@link Outil.OutilDeselectWMS}
    */
    function OutilDeselectWMS(options){
        this.options = options || {};
        
        this.defautOptions = $.extend({}, this.defautOptions, {
            id: 'deselect_couches',
            titre: 'Décocher couches',
            infobulle: "Décocher les couches WMS de l'arborescence"
            //TODO trouver une icone!
        });
    };
    
    OutilDeselectWMS.prototype = new Outil();
    OutilDeselectWMS.prototype.constructor = OutilDeselectWMS;
 
 
    /** 
    * Action de l'outil.
    * Désélectionner toutes les couches WMS qui ne sont pas des fonds de carte.
    * @method
    * @name Outil.OutilDeselectWMS#executer
    */
    OutilDeselectWMS.prototype.executer =  function () {
        this.carte.gestionCouches.deselectionnerCouchesWMS();
        this.carte.gestionCouches.deselectionnerCouchesWMTS();
    };

    return OutilDeselectWMS;
    
});