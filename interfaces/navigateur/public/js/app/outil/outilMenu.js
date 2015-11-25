/** 
 * Module pour l'objet {@link OutilMenu}.
 * @module outilMenu
 * @requires outil 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['outil'], function(Outil) {
    /** 
     * Création de l'object OutilMenu.
     * @constructor
     * @name OutilMenu
     * @class OutilMenu
     * @alias outilMenu:OutilMenu
     * @requires outilMenu
     * @param {dictionnaire} options Liste des options de l'outil
     * @param {String} [options.titre='Menu'] Texte du bouton
     * @returns {OutilMenu} Instance de {@link OutilMenu}
     * @property {Tableau} listeOutils Liste des outils sous le menu
    */
    function OutilMenu(options){
        this.options = options || {};
        
        this.defautOptions = $.extend({}, this.defautOptions, {
            titre: 'Menu',
            items: [],
            outils: []
        });
        
        this.listeOutils = [];
        this._listeOutilsTemp = [];
    };
    
    OutilMenu.prototype = new Outil();
    OutilMenu.prototype.constructor = OutilMenu;

    OutilMenu.prototype._init = function(){
        this._pasInit = false;
        var outils = this.options.outils || this.defautOptions.outils;
        outils = outils.concat(this._listeOutilsTemp);
        if(outils){
            this.ajouterOutils(outils);
        }
        
        this._extOptions = {
            menu:  new Ext.menu.Menu({
                items: this.options.items || this.defautOptions.items
            })
        };
        Outil.prototype._init.call(this);
        //this.ajouterOutils(this.options.outils);
    };
    
    OutilMenu.prototype.obtenirOutils = function(type, niveau){
        return this.listeOutils;
    };
    
    OutilMenu.prototype.obtenirOutilsParType = function(type, niveau){
        niveau = niveau || 1;
        
        var outils=[]; 
        $.each(this.obtenirOutils(), function(key, value){
            if(value.obtenirTypeClasse && value.obtenirTypeClasse() === type){
                outils.push(value);
            };
            if((niveau > 1 || niveau < 0) && value.obtenirOutilsParType){
                outils = outils.concat(value.obtenirOutilsParType(type, niveau-1));
            }
        });
        
        return outils;
    };
    
    OutilMenu.prototype.obtenirOutilParId = function(id, niveau){
        niveau = niveau || 1;
        var outil; 
        $.each(this.obtenirOutils(), function(key, value){
            if(value.obtenirId && value.obtenirId() === id){
                outil=value;
                return false;
            };
            if((niveau > 1 || niveau < 0) && value.obtenirOutilParId){
                outil = value.obtenirOutilParId(id, niveau-1);
                if(outil){
                    return false;
                }
            }
        });
        return outil;
    };
    
    OutilMenu.prototype.ajouterOutils = function(outils){
        var that=this;
        $.each(outils, function(key, outil){
            that.ajouterOutil(outil);
        });
    };
     
    /** 
    * Ajouter un outil au menu
    * @method 
    * @name OutilMenu#ajouterOutil
    * @param {Outil} outil L'outil à ajouter
    */
    OutilMenu.prototype.ajouterOutil = function(outil) {
        if(this._pasInit !== false){
            this._listeOutilsTemp.push(outil);
            return true;
        }
        if (outil instanceof Outil){
            outil.carte = this.carte;
            outil.parent = this;
            outil.defautOptions.elementMenu = true;
            outil._init();
            outil._ajoutCallback(this, this._ajouterElementCallback);
        } else if (outil === '-'){
            this.ajouterSeparateur();
        };
    };
    
    /** 
    * Callback lors de l'ajout d'un outil. 
    * La fonction {@link OutilMenu#ajouterOutil} est appelée de manière asynchrone.
    * @method 
    * @private
    * @name OutilMenu#_ajouterOutilCallback
    * @param {Outil} outil
    */
    OutilMenu.prototype._ajouterElementCallback = function(outil){
        if(this._bouton){
            if(!this._getBouton().menu){
                console.warn(this.obtenirTypeClasse()+" (id->"+this.obtenirId()+") ne peut ajouter de nouvel outil après l'initialisation");
                return false;
            }
            this._getBouton().menu.add(outil._getBouton());
        } else {
            this.defautOptions.items.push(outil._getBouton());
        }
        this.listeOutils.push(outil);
    };
    
    
    /** 
    * Ajouter une division au menu
    * @method 
    * @name OutilMenu#ajouterDivision
    */
    OutilMenu.prototype.ajouterSeparateur = function() {
        if(this._bouton){
            if(!this._getBouton().menu){
                console.warn("outilMenu (id->"+this.obtenirId()+") ne peut ajouter de nouvel outil après l'initialisation");
                return false;
            }
            this._getBouton().menu.addSeparator();
        } else {
            this.defautOptions.items.push('-');
        }
        this.listeOutils.push('-');
    };
    
    /**
    * Desactiver le bouton
    * @method
    * @name OutilMenu#desactiver
    */
    /*OutilMenu.prototype.desactiver = function(){
        this._bouton.menu.setDisabled(true);
        $.each(this.listeOutils, function(key, value){
            if(value instanceof Outil){
                value.desactiver();
            }
        });
    };*/
    
    /**
    * Activer le bouton
    * @method
    * @name OutilMenu#activer
    */
   /* OutilMenu.prototype.activer = function(){
        this._bouton.menu.setDisabled();
        $.each(this.listeOutils, function(key, value){
            if(value instanceof Outil){
                value.activer();
            }
        });
    };*/
    
    /**
    * Afficher le bouton
    * @method
    * @name OutilMenu#afficher
    */
    OutilMenu.prototype.afficher = function(){
       // this._bouton.setHidden();
    };
    
    /**
    * Cacher le bouton
    * @method
    * @name OutilMenu#cacher
    */
    OutilMenu.prototype.cacher = function(){
        //this._bouton.setHidden(true);
    };

    OutilMenu.prototype.releverBouton = function(){
        $.each(this.obtenirOutils(), function(key,value){
            if(value.relever !== undefined){
                value.relever();
            }
        });
    }
              
    return OutilMenu;

});

