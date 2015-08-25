/** 
 * Module pour l'objet {@link OutilControleMenu}.
 * @module outilMenu
 * @requires outil 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['outilMenu', 'aide', 'outil'], function(OutilMenu, Aide, Outil) {
    /** 
     * Création de l'object OutilControleMenu.
     * @constructor
     * @name OutilControleMenu
     * @class OutilControleMenu
     * @alias outilMenu:OutilControleMenu
     * @requires outilMenu
     * @param {dictionnaire} options Liste des options de l'outil
     * @param {String} [options.titre='ControleMenu'] Texte du bouton
     * @returns {OutilControleMenu} Instance de {@link OutilControleMenu}
     * @property {Tableau} listeOutils Liste des outils sous le menu
    */
    function OutilControleMenu(options){
        this.options = options || {};
        
        this.defautOptions = $.extend({}, this.defautOptions, {
            titre: 'ControleMenu',
            items: [],
            outils: [],
            groupe: 'carte',
            xtype: 'tbsplit'
        });
        
        this.listeOutils = [];
    };
    
    OutilControleMenu.prototype = new OutilMenu();
    OutilControleMenu.prototype.constructor = OutilControleMenu;


    OutilControleMenu.prototype._ajouterElementCallback = function(outil){
        var params = {scope: this, outil: outil};
        if(!this.outilActif){
            this.definirOutilActif(outil, false);
        }
        outil._bouton.setHandler(function(){this.scope.definirOutilActif(this.outil)}, params);
        OutilMenu.prototype._ajouterElementCallback.call(this, outil);
    }; 
    
    OutilControleMenu.prototype.executer = function(){
        if(this.outilActif){
            this.outilActif.executer();
        };
    };
    
    OutilControleMenu.prototype.eteindre =  function () {
        if(this.outilActif){
            this.outilActif.eteindre();
        };
    };
    
    OutilControleMenu.prototype.definirOutilActif = function(outil, enfoncer){
        if(!this._bouton || !(outil instanceof Outil)){return false}
        this.eteindre();
        this.outilActif = outil;
        if(Aide.toBoolean(this.options.utiliserSousTitre) && outil.options.titre){
            this.changerTitre(this.options.titre + '-' + outil.options.titre);
        }
        if(Aide.toBoolean(this.options.utiliserSousIcone) && outil.options.icone){
            this.changerIcone(outil.options.icone);
        }
        if(enfoncer !== false){
            this.enfoncer();
        }
    };
    
    OutilControleMenu.prototype._ajoutCallback = function(target, callback, opt){
        this.definirOutilActif(this.listeOutils[0], false);
        OutilMenu.prototype._ajoutCallback.call(this, target, callback, opt);

    };
              
    return OutilControleMenu;

});

