/** 
 * Module pour l'objet {@link Panneau}.
 * @module panneau
 * @requires aide 
 * @requires evenement 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['aide', 'evenement'], function(Aide, Evenement) {
    var compteur=0;
    
    /** 
     * Création de l'object Panneau.
     * @constructor
     * @name Panneau
     * @class Panneau
     * @alias panneau:Panneau
     * @requires panneau
     * @param {dictionnaire} [options] Liste des options du panneau
     * @param {string} [options.id='panneau##'] Identifiant du panneau. ## est un nombre généré. 
     * @param {string} [options.position='nord'] Position du navigateur. Choix possibles: nord, sud, ouest, est
     * @param {string} [options.titre] Titre du Panneau
     * @param {Entier} [options.dimension=100] Dimension du panneau. Largeur si positionné à l'ouest ou à l'est. Hauteur pour le nord et le sud.
     * @param {Entier} [options.minDimension=100] Dimension minimum que l'utilisateur peut redimensionner le panneau.
     * @param {Entier} [options.maxDimension=750] Dimension maximum que l'utilisateur peut redimensionner le panneau.
     * @param {Boolean} [options.ouvert=true] Ouvert à l'ouverture
     * @param {string} [options._margins='0 5 5 5'] Marge autour du panneau. (haut droite bas gauche)
     * @returns {Panneau} Instance de {@link Panneau}
     * @property {Carte} carte Carte associée au panneau
     * @property {dictionnaire} options Liste des options choisies pour le panneau
     * @property {dictionnaire} defautOptions Liste par défaut des options du panneau
    */
    function Panneau(options) {
        this._panel;
        this.carte;
        this.options = options || {};
        this.defautOptions = { 
            position: 'nord',
            id: 'panneau',
            titre: '',
            dimension: 100,
            minDimension: 100,
            maxDimension: 750,
            _margins: '0 5 5 5',
            reductible: true,
            _layout:'auto',
            ouvert: true
            //defaults: {},
            //items: [] 
            //listeners: {}
        };
    };
    
    Panneau.prototype = new Evenement();
    Panneau.prototype.constructor = Panneau;
    
    /** 
     * Initialisation de l'object Panneau. 
     * Est appelé par {@link Navigateur#ajouterPanneau}
     * this._extOptions sera fusionné s'il existe déjà.
     * @method 
     * @name Panneau#_init
    */
    Panneau.prototype._init = function(){
        var that=this;
        if(this.options && this.options.css){
            Aide.chargerCSS(this.options.css);
        };    
  
        //Compteur à ajouter au ID s'il n'est pas défini par l'utilisateur.
        compteur++;
        if(!this.options.id){
            this.options.id = this.defautOptions.id + compteur;
        } 
        this.defautOptions = $.extend({}, this.defautOptions, Aide.obtenirConfig(this.obtenirTypeClasse()));
        this.options = $.extend({}, this.defautOptions, this.options);
        if(!this._panel && this.options.init != false){
            var opt = this.options;
            opt.listeners = opt.listeners || {};
            opt.defaults = opt.defaults || {};
            opt.items = opt.items || [];
            if(!opt.listeners.afterrender){
                opt.listeners.afterrender = function(e) {
                    that.callbackCreation();  
                };
            }
            this._extOptions = $.extend({
                region: Aide._obtenirTermeAnglais(opt.position),
                id: opt.id,
                title: opt.titre,
                split: true,
                width: Number(opt.dimension),
                height: Number(opt.dimension),
                minSize: Number(opt.minDimension),
                maxSize: Number(opt.maxDimension),
                collapsible: Aide.toBoolean(opt.reductible),
                collapsed: !Aide.toBoolean(opt.ouvert),
                closable: Aide.toBoolean(opt.fermable),
                floatable: false,
                margins: opt._margins,
                layout: opt._layout,
                defaults: opt.defaults,
                items: opt.items,
                scope: this,
                listeners: opt.listeners
            }, this._extOptions, this.options._extOptions);
            
            if(!this._extOptions.xtype){
                this._panel = new Ext.Panel(this._extOptions);
            } else if (this._extOptions.xtype === 'grid') {
                this._panel = new Ext.grid.GridPanel(this._extOptions);
            } else if (this._extOptions.xtype === 'editorgrid') {
                this._panel = new Ext.grid.EditorGridPanel(this._extOptions);
            } else {
                this._panel = this._extOptions;
            }
        }
    };

    Panneau.prototype.callbackCreation = function(){
        this.declencher({ type: 'init'+this.obtenirTypeClasse(), panneau: this });
    };
    
    /** 
     * Obtenir le panneau ExtJS
     * @method 
     * @private
     * @name Panneau#_getPanel
     * @returns {Objet} Objet ExtJS
     * @exception Le panneau doit avoir été initialisé
    */
    Panneau.prototype._getPanel = function(){
        if(!this._panel){
            throw new Error("Igo.Panneaux."+this.constructor.name+"._getPanel()");
            return;
        }
        return this._panel;
    };
    
    /** 
     * Obtenir l'identifiant du panneau
     * @method 
     * @name Panneau#obtenirId
     * @returns {String} Id du Panneau
    */
    Panneau.prototype.obtenirId = function(){
        return this._getPanel().id;
    };
    
    /** 
     * Obtenir le titre du panneau
     * @method 
     * @name Panneau#obtenirTitre
     * @returns {String} Titre du Panneau
    */
    Panneau.prototype.obtenirTitre = function(){
        if(this._panel && this._panel.title){
            return this._panel.title;
        }
        if(this.options.titre){
            return this.options.titre;
        }
        
        return this.defautOptions.titre;
        
    };
    
    Panneau.prototype.definirTitre = function(titre){
        if(!this._panel){return false}
        this._panel.setTitle(titre);
    };

    
    /**
    * Obtenir le type de la classe du panneau
    * @method
    * @name Panneau#obtenirTypeClasse
    * @returns {String} Type du Panneau
    */
    Panneau.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };

    /** 
     * Redessiner le layout du panneau
     * @method 
     * @name Panneau#rafraichir
    */
    Panneau.prototype.rafraichir = function(){
            this._getPanel().doLayout();
    };
    
    /** 
     * Associer une carte au panneau
     * Est appelé par {@link Navigateur#ajouterPanneau}
     * @method 
     * @name Panneau#definirCarte
     * @param {Carte} carte Carte à associer au panneau
    */
    Panneau.prototype.definirCarte = function(carte) {
        this.carte = carte;
    };
    
    Panneau.prototype.ouvrir = function(){
        return this._getPanel().expand();
    };
    
    Panneau.prototype.fermer = function(){
        return this._getPanel().collapse();
    };
    
    Panneau.prototype.avantFermeture = function(){};
    
    Panneau.prototype.majContenu = function(contenu){
        this._panel.body.update(contenu);
    };
    
    return Panneau;
    
});