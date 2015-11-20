/**
 * Module pour l'objet {@link Panneau.PanneauOnglet}.
 * @module panneauOnglet
 * @requires panneau
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['panneau'], function(Panneau) {
     /**
     * Création de l'object Panneau.PanneauOnglet.
     * Pour la liste complète des paramètres, voir {@link Panneau}
     * @constructor
     * @name Panneau.PanneauOnglet
     * @class Panneau.PanneauOnglet
     * @alias panneauOnglet:Panneau.PanneauOnglet
     * @extends Panneau
     * @requires panneauOnglet
     * @param {string} [options.id='accordeon-panneau##'] Identifiant du panneau.
     * @returns {Panneau.PanneauOnglet} Instance de {@link Panneau.PanneauOnglet}
     * @property {dictionnaire} listeOnglets Liste des onglets
    */
    function PanneauOnglet(options) {
        this.options = options || {};

        this.monPanneauOnglet = new Ext.TabPanel({
            activeTab: 0,
            enableTabScroll:true
        });

        this.defautOptions = $.extend({}, this.defautOptions, {
            id: 'onglet-panneau',
            items:[this.monPanneauOnglet],
            _layout: 'fit'
        });
        this.listeOnglets = [];
    };

    PanneauOnglet.prototype = new Panneau();
    PanneauOnglet.prototype.constructor = PanneauOnglet;


     /**
     * Initialisation de l'object Panneau.
     * @method
     * @name PanneauOnglet#_init
    */
    PanneauOnglet.prototype._init = function(){
        Panneau.prototype._init.call(this);

        if(this.options.panneaux){
            this.ajouterPanneaux(this.options.panneaux);
        }
    };

    /**
     * Ajouter des onglets
     * @method
     * @name PanneauOnglet#ajouterPanneaux
     * @param {Tableau} panneaux Liste des {@link Panneau}
    */
    PanneauOnglet.prototype.ajouterPanneaux = function(panneaux){
        var that=this;
        $.each(panneaux, function(key, value){
            that.ajouterPanneau(value);
        });
    };

    /**
     * Ajouter un onglet
     * @method
     * @name PanneauOnglet#ajouterPanneau
     * @param {Panneau} panneau Onglet à ajouter
    */
    PanneauOnglet.prototype.ajouterPanneau = function(panneau){
        panneau.carte=this.carte;
        panneau.parent = this;
        panneau._init();

       /* var onglet = new Ext.Panel({
            title: panneau.obtenirTitre() || 'Onglet',
            items:[panneau._getPanel()],
            height:'fit',
            layout: 'fit',
            hidden: false,
            autoScroll: true
        });*/
        var onglet = panneau._getPanel();
        if(panneau.options.fermable){
            onglet.addListener('beforeclose', this._beforeCloseTab, this);
        }

        this.monPanneauOnglet.add(onglet);
        this.listeOnglets.push(panneau);
        if(!this._panel.items.items[0].activeTab){
            this._panel.items.items[0].setActiveTab(0);
        }

        this.declencher({ type: 'ajouterPanneau', panneau: panneau });
    };

    PanneauOnglet.prototype.enleverPanneau = function(panneau){
        if(!panneau || !panneau._getPanel){return false }
        var onglet = panneau._getPanel();

        this._panel.items.items[0].remove(onglet);
        this.listeOnglets = $.grep(this.listeOnglets, function(value) { return value != panneau; });
    };

    PanneauOnglet.prototype.activerPanneau = function(panneau){
        var onglet = panneau._getPanel();
        this._panel.items.items[0].setActiveTab(onglet);
    };


    /**
     * Obtenir la liste des panneaux (onglets)
     * @method
     * @name PanneauOnglet#obtenirPanneaux
     * @returns {Tableau} Liste des {@link Panneau}
    */
    PanneauOnglet.prototype.obtenirPanneaux = function(){
        return this.listeOnglets;
    };

    /**
     * Obtenir le panneau (l'onglet) ayant l'identifiant fourni en intrant
     * @method
     * @name PanneauOnglet#obtenirPanneauParId
     * @param {String} id Identifiant de du panneau recherché
     * @returns {Panneau} Instance de {@link Panneau}
    */
   PanneauOnglet.prototype.obtenirPanneauParId = function(id, niveau){
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

    PanneauOnglet.prototype.obtenirPanneauxParType = function(type, niveau){
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

    PanneauOnglet.prototype._beforeCloseTab = function(element){
        this.listeOnglets = $.grep(this.listeOnglets, function(value) {
            if(value._panel === element){
                value.avantFermeture();
            }
            return value._panel != element;
        });

    };

    return PanneauOnglet;

});
