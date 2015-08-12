/** 
 * Module pour l'objet {@link Couche}.
 * @module couche
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires aide
 * @requires evenement
 */

define(['evenement', 'aide'], function(Evenement, Aide) {
    var compteur=0;
    /** 
     * Création de l'object Couche.
     * @constructor
     * @abstract 
     * @name Couche
     * @class Couche
     * @alias couche:Couche
     * @extends Evenement
     * @requires couche
     * @param {dictionnaire} options Liste des options de la couche
     * @param {String} options.groupe Aborescence de la couche
     * @param {Boolean} [options.fond=false] La couche est une couche de fond?
     * @param {Nombre} [options.echelleMin] Échelle Minimun de la couche
     * @param {Nombre} [options.echelleMax] Échelle Maximun de la couche
     * @param {String} [options.droit] Droit d'auteur apparaissant en bas à droite de la carte.
     * @param {String} [options.metadonnee] Lien vers les métadonnées
     * @param {Boolean} [options.visible=true] Présence dans l'arborescence des couches. 
     * @param {Boolean} [options.active=false] Visibilité de la couche. 
     * @param {Nombre} [options.ordreAffichage] Ordre d'affichage de la couche
     * @param {Nombre} [options.ordreArborescence] Ordre d'affichage de la couche dans le groupe de l'arborescence (1 étant le haut du groupe)
     * @param {String} [options.typeContexte] Origine de la couche {contexte | ajout}
     * @returns {Couche} Instance de {@link Couche}
     * @property {dictionnaire} options Liste des options de la couche
     * @property {dictionnaire} defautOptions Liste par défaut des options de la couche
    */
    function Couche(options){
        this.options = options || {};
        this._layer;
        this.carte;
        
        this.defautOptions = { 
            visible: true,
            active: false
        };
    };

    Couche.prototype = new Evenement();
    Couche.prototype.constructor = Couche;
    
    /** 
     * Initialisation de l'object Couche. 
     * this._optionsOL sera fusionné s'il existe déjà.
     * @method 
     * @private
     * @abstract
     * @name Couche#_init
    */
    Couche.prototype._init = function(){
        this.defautOptions.groupe = 'Autres Couches';
        if (Aide.toBoolean(this.options.fond)){
            this.defautOptions.groupe = 'Fond de carte';
        };
        
        this.options = $.extend({}, this.defautOptions, Aide.obtenirConfig("Couche"), Aide.obtenirConfig(this.obtenirTypeClasse()), this.options);
                
        var opt = this.options;

        var printOptions = {'fromLayer': true};
        if(opt.impressionUrl){
            var format = opt.format || "png";
            printOptions = {
                "url": opt.impressionUrl,
                "layers": opt.impressionNom || opt.nom,
                "format": "image/" + format,
                "mapformat": format
            };
        }

        this._optionsOL = $.extend({ 
            isBaseLayer: Aide.toBoolean(opt.fond),
            minScale: opt.echelleMin, //todo: defaultMapOptions.resolutions[11] || this.carte.getResolutionForZoom(opt.niveauZoomMin), //echelleMin: grand nombre
            maxScale: opt.echelleMax, //|| this.carte.getResolutionForZoom(opt.niveauZoomMax), //echelleMax: petit nombre
            group: opt.groupe,
            attribution: opt.droit,
            typeContexte: opt.typeContexte,
            displayInLayerSwitcher: Aide.toBoolean(opt.visible),
            legende: Aide.toBoolean(opt.legende),
            visibility: Aide.toBoolean(opt.active),
            opacity: opt.opacite ? opt.opacite/100 : 1,
            zTree: opt.ordreArborescence,
            printOptions: printOptions
        }, this._optionsOL, this.options._optionsOL);
       
    };
    
    
    /**
    * Callback après ajout couche
    * @callback Couche~requestCallback
    * @private
    * @param {Couche} couche Couche ajoutée
    * @param {dictionnaire} optCallback Options
    */
    /** 
    * Renvoie vers le callback lorsque l'ajout de la couche est terminée.
    * La fonction {@link Carte#ajouterCouche} est appelée de manière asynchrone.
    * @method 
    * @private
    * @name Couche#_ajoutCallback
    * @param {Carte} target 'This' dans la fonction callback
    * @param {Couche~requestCallback} callback Callback
    * @param {dictionnaire} optCallback Options du callback
    */
    Couche.prototype._ajoutCallback = function(target, callback, optCallback){
        if(this.options.id){
            this.id = this.options.id;
            if(target.obtenirCoucheParId(this.options.id)){
                this.id += this._getLayer().id.substr(this._getLayer().id.lastIndexOf('_')+1);
                console.warn("Ajout d'une couche: L'identifiant '"+this.options.id+"' n'est pas unique. L'identifiant de la couche a été modifié pour '"+this.id+"'");
            }
        } else {
            this.id = 'couche_'+this._getLayer().id.substr(this._getLayer().id.lastIndexOf('_')+1);
        }
        
        this._getLayer().id = this.id;
        if (typeof callback === "function") callback.call(target, this, optCallback);
        
        this._getLayer().events.register('loadstart',this,function(e){this.afficherChargement()});
        this._getLayer().events.register('loadend',this,function(e){this.masquerChargement()});
    };
    
    /** 
    * Obtenir le layer Openlayers;
    * @method
    * @private 
    * @name Couche#_getLayer
    * @returns {objet} Layer de Openlayers
    * @exception Vérification l'existance du layer de Openlayers
    */
    Couche.prototype._getLayer = function() { 
        if(!this._layer){
            throw new Error("Igo.Couches."+this.constructor.name+"._getLayer()");
        }
        return this._layer;
    };
    
    /** 
    * Obtenir le titre de la couche
    * @method 
    * @name Couche#obtenirTitre
    * @returns {String} Titre de la couche
    */
    Couche.prototype.obtenirTitre = function() { 
        if (this._getLayer()) {
            return this._getLayer().name;
        }
    };
    
    /** 
    * Obtenir le groupe de la couche
    * @method 
    * @name Couche#obtenirGroupe
    * @returns {String} Groupe de la couche
    */
    Couche.prototype.obtenirGroupe = function() { 
        return this.options.groupe;
    };

    /** 
    * Obtenir l'identifiant de la couche
    * @method 
    * @name Couche#obtenirId
    * @returns {String} Id de la couche
    */
    Couche.prototype.obtenirId = function() { 
        return this.id;
    };

    /** 
    * Assigner la carte à la couche
    * @method 
    * @name Couche#definirCarte
    * @param {Carte} carte Carte à laquelle la couche appartient
    */
    Couche.prototype.definirCarte = function(carte) {
        this.carte = carte;
    };
    
/*    Couche.prototype.getInfo = function() { 

    };

    Couche.prototype.estDonnees = function() { 
   
    };
    Couche.prototype.estResultat = function() { 

    };
    Couche.prototype.estSelection = function() { 

    };*/
    
    /** 
    * Vérifie si la couche est une couche de fond
    * @method 
    * @name Couche#estFond
    * @returns {Boolean}
    */
    Couche.prototype.estFond = function() { 
        if(this._layer){
            return this._getLayer().isBaseLayer;
        } else {
            return this.options.fond;
        }
    };
    
    /** 
    * Vérifie si la couche est active (affiché sur la carte)
    * @method 
    * @name Couche#estActive
    * @returns {Boolean}
    */
    Couche.prototype.estActive = function() { 
        return this._getLayer().getVisibility();
    };
    
    /** 
    * Activer la couche
    * @method 
    * @name Couche#activer
    */
    Couche.prototype.activer = function(bool) { 
        if(bool === false){
            this.desactiver();
            return;
        }
        if(this.estFond()){
           this.carte._carteOL.setBaseLayer(this._getLayer());
        }
            
        this._getLayer().setVisibility(true);
    };
    
    /** 
    * Désactiver la couche
    * @method 
    * @name Couche#desactiver
    */
    Couche.prototype.desactiver = function(bool) { 
        if(bool === false){
            this.activer();
            return;
        }
        if(this.estFond()){
           return;
        }
        this._getLayer().setVisibility(false);
    };
    
    
    Couche.prototype.definirOpacite = function(opacite) { 
        this._getLayer().setOpacity(opacite);
    };
    
     
  /*  Couche.prototype.estSelectionnee = function() { 

    };*/

    /** 
    * Obtenir l'ordre d'affichage de base de la couche
    * @method 
    * @name Couche#obtenirOrdreAffichageBase
    * @returns {Nombre} Ordre d'affichage de base
    */
    Couche.prototype.obtenirOrdreAffichageBase = function() { 
        if(this.estFond()){
            return this.carte._getCarte().Z_INDEX_BASE.BaseLayer;
        };
        return this.carte._getCarte().Z_INDEX_BASE.Overlay;
    };
    
    /** 
    * Obtenir l'ordre d'affichage de la couche
    * @method 
    * @name Couche#obtenirOrdreAffichage
    * @returns {Nombre} Ordre d'affichage de la couche
    */
   Couche.prototype.obtenirOrdreAffichage = function() { 
        return Number(this._getLayer().getZIndex());
    };
    
    /** 
    * Assigner un ordre d'affichage à la couche
    * @method 
    * @name Couche#definirOrdreAffichage
    * @param {Number} [ordreAffichage=this.options.ordreAffichage] Ordre d'affichage à appliquer à la couche.
    */
    Couche.prototype.definirOrdreAffichage = function(ordreAffichage) { 
        if(!ordreAffichage){
            var oAffichage;
            if(this.options.ordreAffichage){
                oAffichage = this.options.ordreAffichage;
            } else {
                compteur += 2;
                oAffichage = compteur;
            }
            ordreAffichage = this.obtenirOrdreAffichageBase() + Number(oAffichage);
        }
        if (!isNaN(ordreAffichage)){
            this._getLayer().setZIndex(ordreAffichage); 
            this._getLayer().z_index_default = ordreAffichage;
        }
    };

    /**
    * Obtenir le type de la classe de la couche
    * @method
    * @name Couche#obtenirTypeClasse
    * @returns {String} Type de la couche
    */
    Couche.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };
    
    /**
    * Obtenir la projection de la couche
    * @method
    * @name Couche#obtenirProjection
    * @returns {String} Code de la couche
    */
    Couche.prototype.obtenirProjection = function(){
        return this._layer.projection.projCode;
    };
    
    /**
     * Obtenir le div de l'arborescence des couches pour la couche en cours
     * @method
     * @name Couche#obtenirElementDivArbo
     * @return {Objet} Div de la couche en cours ou false si non défini
     */
    Couche.prototype.obtenirElementDivArbo = function(){
        var that = this;
        var result = false
        if(this._layer.layerContainer){
            $.each(this._layer.layerContainer.childNodes, function(index,node){
                if (node.text == that.obtenirTitre()){
                    result = node.ui.elNode;
                    return false; //stop exécution
                }
            });
        }
        return result;
    }
    
    /**
     * Afficher une icône de chargement dans le div de la couche dand l'arborescence des couches
     * @method
     * @name Couche#afficherChargement
     */
    Couche.prototype.afficherChargement = function(){
        var div = this.obtenirElementDivArbo();
        var $layerArboLoading = $(div).find(".layerArboLoading");
        if($layerArboLoading.length){
            $layerArboLoading.show();
        } else if(div){
            $(div).find(".x-tree-node-anchor").after('<img class="layerArboLoading" src="'+ Aide.utiliserBaseUri("images/app/loading_14_14.gif")+'" alt="Chargement">');
        }
    };
     /**
     * Masquer l'icône de chargement dans le div de la couche dand l'arborescence des couches
     * @method
     * @name Couche#masquerChargement
     */   
    Couche.prototype.masquerChargement = function(){
        var div = this.obtenirElementDivArbo();
        if(div){
            $(div).find(".layerArboLoading").hide();
        }
    };
    
    return Couche;
});