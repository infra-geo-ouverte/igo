/** 
 * Module pour l'objet {@link Outil}.
 * @module outil
 * @requires aide 
 * @requires evenement 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['aide', 'evenement', 'fonctions'], function(Aide, Evenement, Fonctions) {
    var compteur=0;
    /** 
     * Création de l'object Outil.
     * @constructor
     * @name Outil
     * @class Outil
     * @alias outil:Outil
     * @requires outil
     * @param {dictionnaire} options Liste des options de l'outil
     * @param {Nombre} [options.id='outilXX'] Identifiant du bouton. Si absent, XX est un nombre généré.
     * @param {String} [options.titre] titre du bouton
     * @param {Nombre} [options.icone] Icone du bouton. Lien vers l'image ou une classe CSS
     * @param {String} [options.infobulle] Description (tooltip) du bouton
     * @param {Nombre} [options.action] Action du bouton
     * @param {String} [options.visible=true] Le bouton est-il visible.
     * @param {Nombre} [options.actif=true] Le bouton est-il actif.
     * @param {Nombre} [options.css] CSS lié au bouton à charger.
     * @returns {Outil} Instance de {@link Outil}
     * @property {Carte} carte Carte liée à l'outil
     * @property {dictionnaire} options Liste des options de l'outil
     * @property {dictionnaire} defautOptions Liste par défaut des options de l'outil
    */
    function Outil(options) {
        this._bouton;
        this.carte;
        this.options = options || {};
        this.defautOptions = {
            id: 'outil',
            icone: '',
            titre: '',
            infobulle: '',
            visible: true,
            actif: false,
            activable: true,
            groupe: undefined,
            _allowDepress: true,
            executer: function(){if(!this.options.groupe || this._bouton.pressed || this._bouton.pressed === undefined){this.executer()}}
        };
    };
    
    Outil.prototype = new Evenement();
    Outil.prototype.constructor = Outil;
    
    /** 
     * Initialisation de l'object Outil. 
     * this._extOptions sera fusionné s'il existe déjà.
     * Méthode exécutée par {@link BarreOutils#ajouterOutil}
     * @method 
     * @private
     * @name Outil#_init
    */
    Outil.prototype._init = function(){
        if(this.options.css){
            Aide.chargerCSS(this.options.css);
        };
        
        if (!this._bouton) {
            compteur++;
            this.defautOptions.id = this.defautOptions.id + compteur;
            this.defautOptions = $.extend({}, this.defautOptions, Aide.obtenirConfig(this.obtenirTypeClasse()));
            this.options = $.extend({}, this.defautOptions, this.options);
            var opt = this.options;
            
            var isUrlIcon = opt.icone.match(/\.|\//);
            this._extOptions = $.extend({ 
                xtype: opt.xtype,
                text: opt.titre,
                boxLabel: opt.xtype ? opt.titre : undefined, //checkbox
                name: opt.nom, //checkbox
                iconCls: isUrlIcon ? '' : opt.icone,
                icon: isUrlIcon ? Aide.utiliserBaseUri(opt.icone) : '',
                itemId: opt.id,
                tooltip: opt.infobulle,
                hidden: !Aide.toBoolean(opt.visible),
                disabled: !Aide.toBoolean(opt.activable),
                toggleGroup: opt.groupe,
                allowDepress: opt._allowDepress,
                scope: this,
                handler: function() {this.declencher({type: 'activee'}); opt.executer.call(this)},
                toggleHandler: function(a,b){if(!b && !a.pressing){this.eteindre();} else if(this.options.groupe=='carte'){this.declencher({type: 'controleCarteActiver'});} a.pressing=false; }
            }, this._extOptions, this.options._extOptions);
            
            this._creerBouton(opt);
        }
        return this;
    };

    /** 
     * Création du bouton extjs ou GeoExt
     * Méthode exécutée par {@link Outil#_init}
     * @method 
     * @private
     * @name Outil#_creerBouton
     * @param {dictionnaire} opt Options du bouton
    */
    Outil.prototype._creerBouton = function(opt){
        if(opt.controle || opt.elementMenu){
            if(opt.xtype){
                if(opt.xtype === 'menucheckitem'){
                    delete opt.icone;
                };
                this._bouton = new Ext.create(this._extOptions);
                return;
            }
            var geoExtOptions = $.extend({ 
                control: opt.controle,
                map: this.carte ? this.carte._getCarte() : undefined,
                allowDepress: false
            }, this._extOptions);
            
            this._bouton = new GeoExt.Action(Ext.applyIf((geoExtOptions)));
            return;
        } 
        
        if(opt.xtype){
            this._bouton = new Ext.create(this._extOptions);
            return;
        }
              
        this._bouton = new Ext.Toolbar.Button(this._extOptions);
        if(Aide.toBoolean(opt.actif)){
            this.enfoncer();
        }
    };
    
    /** 
    * Action de l'outil
    * Exécuter au click sur le bouton
    * @method
    * @name Outil#executer
    */
    Outil.prototype.executer =  function () {
        var that=this;
        var action = this.options.action || this.defautOptions.action;
        Fonctions.executerAction({
            scope: this.options.actionScope || this,
            action: action,
            params: this.options.actionParams,
            paramsStr: this.options.actionParamsStr,
           // requireId: this.obtenirId() + 'Action',
            requireFct: function(actionJs) {
                if (actionJs){
                    that.options.action = actionJs;
                    that.executer();
                }
            }            
        });        
    };
    
    Outil.prototype.eteindre =  function () {
    };
     
     
    /**
    * Callback après ajout couche
    * @callback Outil~ajoutCallback
    * @private
    * @param {Outil} couche Outil ajouté
    * @param {dictionnaire} opt Options
    */
    /** 
    * Renvoie vers le callback lorsque l'ajout de l'outil est terminée.
    * La fonction {@link BarreOutils#ajouterOutil} est appelée de manière asynchrone.
    * @method 
    * @private
    * @name Outil#_ajoutCallback
    * @param {BarreOutils} target 'This' dans la fonction callback
    * @param {Outil~ajoutCallback} callback Callback
    * @param {dictionnaire} opt Options du callback
    */
    Outil.prototype._ajoutCallback = function(target, callback, opt){
        if (typeof callback === "function") callback.call(target, this, opt);
    };
    
    /** 
     * Obtenir l'identifiant de l'outil
     * @method 
     * @name Outil#obtenirId
     * @returns {String} Id de l'outil
    */
    Outil.prototype.obtenirId = function(){
        return this._getBouton().itemId;
    };

    /** 
     * Obtenir le bouton ExtJS
     * @method 
     * @private
     * @name Outil#_getBouton
     * @returns {Objet} Objet ExtJS
    */
    Outil.prototype._getBouton = function(){
        if(!this._bouton){
            throw new Error("Igo.Outils."+this.constructor.name+"._getBouton()");
        }
        return this._bouton;
    };
    
    /** 
     * Redessiner le bouton
     * @method 
     * @name Outil#rafraichir
    */
    Outil.prototype.rafraichir = function(){
        if(this._getBouton().doLayout){
            this._getBouton().doLayout();
        }
    };

    /**
    * Obtenir le type de la classe
    * @method
    * @name Outil#obtenirTypeClasse
    * @returns {String} Type de l'outil
    */
    Outil.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };
    
    
    /**
    * Désactiver le bouton
    * @method
    * @name Outil#desactiver
    */
    Outil.prototype.desactiver = function(){
        if(this._bouton){
            this._bouton.setDisabled(true);
        }
    };
    
    /**
    * Activer le bouton (rendreActivable)
    * @method
    * @name Outil#activer
    */
    Outil.prototype.activer = function(){
        this._bouton.setDisabled();
    };
    
    /**
    * Afficher le bouton
    * @method
    * @name Outil#afficher
    */
    Outil.prototype.afficher = function(){
        if(this._bouton.setHidden){
            this._bouton.setHidden(false);
            return true;
        }
        this._bouton.setVisible(true);
    };
    
    /**
    * Cacher le bouton
    * @method
    * @name Outil#cacher
    */
    Outil.prototype.cacher = function(){
        if(this._bouton.setHidden){
            this._bouton.setHidden(true);
            return true;
        }
        this._bouton.setVisible(false);
    };
    
    
    //appelle la fonction Outil.executer
    Outil.prototype.enfoncer=  function (e) {
        var that=this;
        if(!that._bouton.pressed){
            that._bouton.toggle(true);
        }
        if(this instanceof Outil){
            that.executer();
        } else {
            that =  e.options.scope;
        }
    };
    
    Outil.prototype.relever =  function (e) {     
        var that=this;
        if(this instanceof Outil){
            that.eteindre();
        } else {
            that =  e.options.scope;
        }
        that._bouton.pressing = true;
        if(that._bouton.pressed){
            that._bouton.toggle(false);
        } else if (that._bouton.control && that._bouton.control.active){
            that._bouton.control.deactivate();
        }
    };
    
    Outil.prototype.presser =  function () {     
        if(this.estEnfonce()){
            this.relever()
        } else {
            this.enfoncer()
        } 
    };

    Outil.prototype.changerTitre = function(titre){
        this._bouton.setText(titre);
    };
    
    Outil.prototype.changerIcone = function(icone){
        if(!icone){
            this._bouton.setIconClass();
            return true;
        }
        var isUrlIcon = icone.match(/\.|\//);
        if(isUrlIcon){
            this._bouton.setIcon(icone);
        } else {
            this._bouton.setIconClass(icone);
        }      
    };
    
    Outil.prototype.estEnfonce = function(){
        return this._bouton.pressed;
    };
    
    
    
    return Outil;
    
});