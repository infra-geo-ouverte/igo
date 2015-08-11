/**
 * Inclusion des classes complémentaires nécessaires au besoin de la classe
 */

require.ajouterConfig({
    paths: {
        'panneauEdition': '[edition]/public/js/app/panneau/panneauEdition',
        'editionService': '[edition]/public/js/app/service/service'
    }
});

/** 
 * Module pour l'objet {@link PanneauOnglet.PanneauOngletEdition}.
 * @module panneauOngletGeometries
 * @requires panneauOnglet, panneauGeometriePoint, panneauGeometrieLigne, panneauGeometrieSurface
 * @author Michael Lane FADQ
 * @version 1.0
 */

define(['aide', 'panneauOnglet', 'panneauEdition', 'editionService'], function(Aide, PanneauOnglet, PanneauEdition, Service) {
   
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
        this.options.id = 'edition-panneau'; 
        
        this.defautOptions.titre = "Éléments géométriques";
        
    };

    PanneauOngletEdition.prototype = new PanneauOnglet();
    PanneauOngletEdition.prototype.constructor = PanneauOngletEdition;
    
        
    //Réimplémenter le beforecloseTab pour mieux gérer la fermeture de l'onglet
    PanneauOngletEdition.prototype._beforeCloseTab = function(element){    
        var that = this;
        
        var elemModif = element.scope.options.vecteur.obtenirOccurencesModifiees();
        var elemAjout = element.scope.options.vecteur.obtenirOccurencesAjoutees();
        var elemSupp = element.scope.options.vecteur.obtenirOccurencesEnlevees();
              
        if(elemModif.length > 0 || elemSupp.length > 0 || elemAjout.length > 0) {
            
            var message = 'Il y a des changements non sauvegardés. <br />Désirez-vous les enregistrer?';
            var titre = 'Sauvegarder';
            var boutons = 'YESNOCANCEL';
            var icone = 'QUESTION';
            action = function(btn) {
                        if(btn === 'yes'){
                            element.scope.contexte.sauvegarder();
                        }
                        else if(btn === 'no'){
                            that.listeOnglets = $.grep(that.listeOnglets, function(value) { 
                                if(value._panel === element){
                                    value.avantFermeture();
                                    value._panel.destroy();
                                }

                                return value._panel !== element; 
                            });
                        }
                    };
                    
            Aide.afficherMessage({message:message, titre:titre, boutons:boutons, icone:icone, action:action}); 
        
            return false;
        }
        else {
            this.listeOnglets = $.grep(this.listeOnglets, function(value) { 
                if(value._panel === element){
                    value.avantFermeture();
                }
            
                return value._panel !== element; 
            });
        }  
    };
    
    /**
     * Méthode pour ouvrir l'accordéon du panneau
     * @method
     * @name PanneauOngletEdition#ouvrir
     */
    PanneauOngletEdition.prototype.ouvrir = function(){
       Aide.obtenirNavigateur().obtenirPanneauParId("panBasPanel").ouvrir();
        this._panel.expand();
    };
            
    return PanneauOngletEdition;
});