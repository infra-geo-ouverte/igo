/** 
 * Module pour l'objet {@link Panneau.PanneauAccordeon.PanneauMenu}.
 * @module panneauMenu
 * @requires panneauAccordeon 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['panneauAccordeon', 'aide'], function(PanneauAccordeon, Aide) {
     /** 
     * Création de l'object Panneau.PanneauAccordeon.PanneauMenu.
     * Pour la liste complète des paramètres, voir {@link Panneau.PanneauAccordeon}
     * @constructor
     * @name Panneau.PanneauAccordeon.PanneauMenu
     * @class Panneau.PanneauAccordeon.PanneauMenu
     * @alias panneauMenu:Panneau.PanneauAccordeon.PanneauMenu
     * @extends Panneau.PanneauAccordeon
     * @requires panneauMenu
     * @param {dictionnaire} [options] Liste des options de la carte
     * @param {string} [options.id='menu-panneau##'] Identifiant du panneau.
     * @param {string} [options.position='ouest'] Position du navigateur. Choix possibles: nord, sud, ouest, est
     * @param {string} [options.titre='Menu'] Titre du Panneau
     * @param {Entier} [options.dimension=300] Dimension du panneau. Largeur si positionné à l'ouest ou à l'est. Hauteur pour le nord et le sud.
     * @param {Entier} [options.minDimension=175] Dimension minimum que l'utilisateur peut redimensionner le panneau.
     * @param {Entier} [options.maxDimension=400] Dimension maximum que l'utilisateur peut redimensionner le panneau.
     * @param {string} [options._margins='0 0 0 5'] Marge autour du panneau. (haut droite bas gauche)
     * @returns {Panneau.PanneauMenu} Instance de {@link Panneau.PanneauMenu}
     * @property {tableau} menus Liste des {@link Menu}
    */
    function PanneauMenu(options){
        this.options = options || {};

        this.defautOptions.position = 'ouest';
        this.defautOptions.id = 'menu-panneau';
        this.defautOptions.titre = 'Menu';
        this.defautOptions.dimension = 300;
        this.defautOptions.minDimension = 175;
        this.defautOptions.maxDimension = 400;
        this.defautOptions._margins = '0 0 0 5';
        this.defautOptions.items = [];
    };

    PanneauMenu.prototype = new PanneauAccordeon();
    PanneauMenu.prototype.constructor = PanneauMenu;
    
    
    PanneauMenu.prototype._init = function(){
        this.estOuvertParDefaut = Aide.toBoolean(this.options.ouvert);
        this.options.ouvert = true;
        PanneauAccordeon.prototype._init.call(this);
    };
    
    
    PanneauMenu.prototype.ajouterPanneau = function(panneau){
        PanneauAccordeon.prototype.ajouterPanneau.call(this, panneau);
        if(!this.estOuvertParDefaut && panneau.obtenirTypeClasse() === 'Arborescence'){
            this.fermer();
        }
    };
    
    return PanneauMenu;
    
});