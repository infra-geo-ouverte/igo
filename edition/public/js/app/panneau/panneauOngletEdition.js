/**
 * Inclusion des classes complémentaires nécessaires au besoin de la classe
 */

require.ajouterConfig({
    paths: {
        'panneauEdition': '../igo/edition/public/js/app/panneau/panneauEdition',
        'service': '../igo/edition/public/js/app/service/service'
    }
});

/** 
 * Module pour l'objet {@link PanneauOnglet.PanneauOngletEdition}.
 * @module panneauOngletGeometries
 * @requires panneauOnglet, panneauGeometriePoint, panneauGeometrieLigne, panneauGeometrieSurface
 * @author Michael Lane FADQ
 * @version 1.0
 */

define(['panneauOnglet', 'panneauEdition', 'service'], function(PanneauOnglet, PanneauEdition, Service) {
   
 /** 
     * Création de l'object PanneauOnglet.PanneauOngletEdition.
     * Pour la liste complète des paramètres, voir {@link PanneauOnglet}
     * @constructor
     * @name PanneauOnglet.PanneauOngletEdition
     * @class PanneauOnglet.PanneauOngletEdition
     * @alias PanneauOngletEdition:panneauOnglet.PanneauOngletEdition
     * @extends PanneauOnglet
     * @requires panneauOnglet, panneauGeometriePoint, panneauGeometrieLigne, panneauGeometrieSurface
     * @param {object} [options] Objet contenant les propriétés du panneauOnglet
     * @returns {PanneauOnglet.PanneauOngletEdition} Instance de {@link PanneauOnglet.PanneauOngletEdition}
    */  
   
function PanneauOngletEdition(options){
        this.options = options || {};
        this.options.panneaux = [];
            
        this.options.titre = "Éléments géométriques";
        this.options.id = 'edition-panneau';
    };

    PanneauOngletEdition.prototype = new PanneauOnglet();
    PanneauOngletEdition.prototype.constructor = PanneauOngletEdition;
    
    /** 
     * Mettre à jour les attributs sur une géométrie dans un panneau du this.options.panneaux
     * @method 
     * @name PanneauOngletEdition#mettreAjourAttributGeometrie
     * @param {object} [e]: elements de l'attribut mis à jour (e.column, e.filed, e.grid, e.originalValue, e.record, e.row, e.value)    
    */
    PanneauOngletEdition.prototype.mettreAjourAttributGeometrie = function(e){

        //Afficher un message d'erreur si l'attribut est obligatoire et qu'il a été blanchi
        if(e.value == "")
        {
            //Si le champ est obligatoire
            if(e.grid.colModel.config[e.column].obligatoire !== undefined && e.grid.colModel.config[e.column].obligatoire == true)

                //Afficher le message de validation du champ si défini
                if(e.grid.colModel.config[e.column].messageValidation !== undefined)
                    Ext.alert('mess',e.grid.colModel.config[e.column].messageValidation);
                else //Sinon afficher un message générique
                    Ext.alert('mess',"19S");
        }               
    };
    
        
    return PanneauOngletEdition;
});