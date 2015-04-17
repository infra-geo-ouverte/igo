/** 
 * Module pour l'objet {@link Panneau.PanneauAccordeon}.
 * @module panneauAccordeon
 * @requires panneau 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['panneau'], function(Panneau) {
     /** 
     * Création de l'object Panneau.PanneauAccordeon.
     * Pour la liste complète des paramètres, voir {@link Panneau}
     * @constructor
     * @name Panneau.PanneauAccordeon
     * @class Panneau.PanneauAccordeon
     * @alias panneauAccordeon:Panneau.PanneauAccordeon
     * @extends Panneau
     * @requires panneauAccordeon
     * @param {string} [options.id='accordeon-panneau##'] Identifiant du panneau.
     * @returns {Panneau.PanneauAccordeon} Instance de {@link Panneau.PanneauAccordeon}
     * @property {dictionnaire} listePanneaux Liste des {@link Panneau} dans l'accordeon
    */
    function PanneauAccordeon(options) {
        this.options = options || {};
        this.listePanneaux = [];
        
        this.defautOptions = $.extend({}, this.defautOptions, {
            id: 'accordeon-panneau',
            _layout: 'accordion',
            items:[]
        });

        this._extOptions = {
            layoutConfig:{animate: true}
        };
    };
    
    PanneauAccordeon.prototype = new Panneau();
    PanneauAccordeon.prototype.constructor = PanneauAccordeon;
    
    /** 
     * Ajouter un panneau de l'accordéon
     * @method 
     * @name PanneauAccordeon#ajouterPanneau
     * @param {Panneau} panneau Panneau à ajouter
    */
    PanneauAccordeon.prototype.ajouterPanneau = function(panneau){
        this._extOptions.region = 'center';
        panneau.definirCarte(this.carte);
        panneau._init();
        
        this.listePanneaux.push(panneau);
        
        if(this._panel){
            this._panel.add(panneau._getPanel());
            this.rafraichir();
        } else {
            this.defautOptions.items.push(panneau._getPanel());
        }
        
    };
    
    /** 
     * Retirer un panneau de l'accordéon
     * @method 
     * @name PanneauAccordeon#enleverPanneau
     * @param {Panneau} panneau Panneau à retirer
    */
    PanneauAccordeon.prototype.enleverPanneau = function(panneau){
        var elExt= this._getPanel().items.get(panneau.obtenirId());
        if (elExt){
            elExt.destroy();
        }
    };
    
    /** 
     * Obtenir la liste des panneaux de l'accordéon
     * @method 
     * @name PanneauAccordeon#obtenirPanneaux
     * @returns {Tableau} Liste des {@link Panneau}
    */
    PanneauAccordeon.prototype.obtenirPanneaux = function(){
        return this.listePanneaux;
    };
    
    /** 
     * Obtenir le panneau de l'accordéon ayant l'identifiant fourni en intrant
     * Sort uniquement le premier trouvé.
     * @method 
     * @name PanneauAccordeon#obtenirPanneauParId
     * @param {String} id Identifiant de du panneau recherché
     * @returns {Panneau} Instance de {@link Panneau}
    */
   PanneauAccordeon.prototype.obtenirPanneauParId = function(id, niveau){
        var item; 
        niveau = niveau || 1;
        $.each(this.obtenirPanneaux(), function(key, value){
            if(value.obtenirId() === id){
                item=value;
                return false;
            };
            if((niveau > 1 || niveau < 0) && value.obtenirPanneauParId){
                item = value.obtenirPanneauParId(id, niveau-1);
                if(item){
                    return false;
                }
            }
        });
        return item;
    };
   
    /** 
     * Obtenir les panneaux d'un certain type
     * @method 
     * @name PanneauAccordeon#obtenirPanneauxParType
     * @param {String} type Type du panneau recherché
     * @returns {Tableau} Tableau de {@link Panneau}
    */
    PanneauAccordeon.prototype.obtenirPanneauxParType = function(type, niveau){
        var panneaux=[]; 
        niveau = niveau || 1;
        $.each(this.obtenirPanneaux(), function(key, value){
            if(value.obtenirTypeClasse() === type){
                panneaux.push(value);
            };
            if((niveau > 1 || niveau < 0) && value.obtenirPanneauxParType){
                panneaux = panneaux.concat(value.obtenirPanneauxParType(type, niveau-1));
            }
        });
        return panneaux;
    };
    
    return PanneauAccordeon;
    
});
       
    