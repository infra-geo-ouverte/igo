/** 
 * Module pour l'objet {@link Couche.Vecteur}.
 * @module vecteur
 * @requires couche 
 * @requires occurence 
 * @requires limites 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['couche', 'occurence', 'limites', 'style', 'aide'], function(Couche, Occurence, Limites, Style, Aide) {
    /** 
     * Création de l'object Couche.Vecteur.
     * Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.Vecteur
     * @class Couche.Vecteur
     * @alias vecteur:Couche.Vecteur
     * @extends Couche
     * @requires vecteur
     * @returns {Couche.Vecteur} Instance de {@link Couche.Vecteur}
     * @param {String} [options.titre="vector"] Titre de la couche
     * @param {Dictionnaire} [options.styles] Styles des occurences.
     * @property {tableau} listeOccurences Tableau des {@link Occurence} de la couche
     * @property {Dictionnaire} styles Dictionnaire de {@link Geometrie.Style} de la couche
    */
    function Vecteur(options){
        this.options = options || {};
        
        //todo: Aide.toBoolean() pour selectionnable et autres...
        this.garderHistorique = this.options.garderHistorique;
        this._historiqueOccurencesAjoutees=[];
        this._historiqueOccurencesEnlevees=[];
        this.defautOptions.selectionnable = true;
        this.listeOccurences = [];
        this.styles={};
        this.templates={};
        this.defautOptions.rafraichissementPermis = true;
        this.defautOptions.rafraichirMaxOccurence = 100;
        if(this.obtenirTypeClasse() === "Vecteur"){
            this._init();
        };
    };
    
    Vecteur.prototype = new Couche();
    Vecteur.prototype.constructor = Vecteur;
    
    /** 
     * Initialisation de l'object Couche.Vecteur.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.Vecteur#_init
    */
    Vecteur.prototype._init = function(){
        if (!this.options.layerOL){
            Couche.prototype._init.call(this);
            var titre = this.options.titre || "vecteur";
            this._optionsOL.rendererOptions= {zIndexing: true};
            this._layer = new OpenLayers.Layer.Vector(
                titre,
                this._optionsOL
            );
    
            if(!this._optionsOL.styleMap){
                var styles = this.options.styles || new Style();
                this.definirStyles(styles);
            }
        } else {
            //todo: les occurences du vecteur ne sont pas inclues dans IGO
            this._layer = this.options.layerOL;
        }
    };
    
    Vecteur.prototype._ajoutCallback = function(target, callback, optCallback){
        var that=this;
        Couche.prototype._ajoutCallback.call(this, target, callback, optCallback);
        this.controles = new Vecteur.Controles(this);
        if(that.options.source && that.options.sourceType){
            require(['analyseur'+that.options.sourceType], function(Analyseur){
                if(!Analyseur){
                    var message = "Erreur: Couche vecteur \"" + that.obtenirTitre() + "\" (id: " + that.obtenirId() + ")<br>";
                    message += "Échec lors du chargement \"" + that.options.donnees + "\"<br>";
                    message += "Message: Type de donnees inconnu.";
                    Aide.afficherMessageConsole(message);
                }
                var analyseur = new Analyseur();
                analyseur.lireUrl({
                    url: Aide.utiliserProxy(that.options.source), 
                    callback: function(reponse, status){
                        if(status === 'success') {
                            that.ajouterOccurences(reponse);
                        } else {
                            var message = "Erreur: Couche vecteur \"" + that.obtenirTitre() + "\" (id: " + that.obtenirId() + ")<br>";
                            message += "Échec lors du chargement \"" + that.options.donnees + "\"<br>";
                            message += "Message: " + reponse;
                            Aide.afficherMessageConsole(message);
                        }
                    }
                })
            });
        }
    };
    
    /** 
    * Obtenir la liste des occurences.
    * @method 
    * @name Couche.Vecteur#obtenirOccurences
    * @returns {Tableau} Tableau de {@link Occurence}
    */
    Vecteur.prototype.obtenirOccurences = function() { 
        return this.listeOccurences;
    };
    
    Vecteur.prototype.obtenirOccurencesModifiees = function(ajoutEtRetrait){
        var occurencesModifiees = [];
        $.each(this.obtenirOccurences(), function(key, occurence){
            if(ajoutEtRetrait && (occurence.modifiee || occurence.ajoutee || occurence.enlevee)){
                occurencesModifiees.push(occurence);
            } else if(occurence.modifiee && !occurence.ajoutee && !occurence.enlevee){
                occurencesModifiees.push(occurence);
            }
        });
        
        return occurencesModifiees;
    };
    
    Vecteur.prototype.obtenirOccurencesEnlevees = function(){
        return this._historiqueOccurencesEnlevees;
    };
    
    Vecteur.prototype.obtenirOccurencesAjoutees = function(){
        return this._historiqueOccurencesAjoutees;
    };
    
    /** 
    * Selectionner une occurence de la couche 
    * @method 
    * @name Couche.Vecteur#selectionnerOccurence
    * @param {Occurence} occurence L'occurence à sélectionner
    * @fires Couche.Vecteur#selectionnerOccurence
    */
    Vecteur.prototype.selectionnerOccurence = function(occurence) { 
        if (!occurence || !occurence._feature){return;};
        /*var selectControle = this._.controles._selectControle;
        if (!selectControle){
            this._.controles.initSelection();
        };*/
        occurence.selectionner();
        //selectControle.select(occurence._feature);
    };
    
    /** 
    * Obtenir la liste des occurences sélectionnées.
    * @method 
    * @name Couche.Vecteur#obtenirOccurencesSelectionnees
    * @returns {Tableau} Tableau de {@link Occurence}
    */
    Vecteur.prototype.obtenirOccurencesSelectionnees = function() { 
        var occurences=[];
        $.each(this.obtenirOccurences(), function(key, value){
            if(value.selectionnee){
                occurences.push(value);
            };
        });
        return occurences;
    };
    
    /** 
    * Obtenir la liste des occurences pas sélectionnées.
    * @method 
    * @name Couche.Vecteur#obtenirOccurencesNonSelectionnees
    * @returns {Tableau} Tableau de {@link Occurence}
    */
    Vecteur.prototype.obtenirOccurencesNonSelectionnees = function() { 
        var occurences=[];
        $.each(this.obtenirOccurences(), function(key, value){
            if(!value.selectionnee){
                occurences.push(value);
            };
        });
        return occurences;
    };
    
    
    /** 
    * Obtenir l'occurence ayant l'id entré en paramètre.
    * @method 
    * @name Couche.Vecteur#obtenirOccurenceParId
    * @returns {Occurence} Occurence ayant l'identifiant voulu.
    */
    Vecteur.prototype.obtenirOccurenceParId = function(id) { 
        var occurence;
        $.each(this.obtenirOccurences(), function(key, value){
            if(value.id===id){
                occurence = value;
                return false;
            };
        });
        return occurence;
    };
    
    /** 
    * Déselectionner une occurence de la couche 
    * @method 
    * @name Couche.Vecteur#deselectionnerOccurence
    * @param {Occurence} occurence L'occurence à désélectionner
    * @fires Couche.Vecteur#deselectionnerOccurence
    */
    Vecteur.prototype.deselectionnerOccurence = function(occurence) { 
        if (!occurence || !occurence._feature){return;};
        //todo: mode igo
        occurence.deselectionner();
       /* var selectControle = this._.controles._selectControle;
        if (selectControle){
            selectControle.unselect(occurence._feature);
        };*/
    };
    
    /** 
    * Déselectionner toutes les occurences de la couche
    * @method 
    * @name Couche.Vecteur#deselectionnerTout
    * @param {Opt} Possibilité de passer une option
    */
    Vecteur.prototype.deselectionnerTout = function(opt) { 
        
        var opt = opt || {};
        var occurences = this.obtenirOccurencesSelectionnees();
        this.definirRafraichissementPermis('debut', occurences);
        var that=this;
        $.each(occurences, function(key, value){
            if(!opt.exceptions || $.inArray(value, opt.exceptions) === -1){
                that.deselectionnerOccurence(value);
            }
        });
        this.definirRafraichissementPermis('fin');
        
    };
    
      /** 
    * Sélectionner toutes les occurences de la couche
    * @method 
    * @name Couche.Vecteur#selectionnerTout
    * @param {Opt} Possibilité de passer une option
    */
    Vecteur.prototype.selectionnerTout = function(opt) { 
        
        var opt = opt || {};
        var occurences = this.obtenirOccurences();
        this.definirRafraichissementPermis('debut', occurences);
        var that=this;
        
         $.each(occurences, function(key, value){
            if(!opt.exceptions || $.inArray(value, opt.exceptions) === -1){
                that.selectionnerOccurence(value);
            }
        });
        this.definirRafraichissementPermis('fin');
    };
    
       /** 
    * Inverser la sélection des occurences
    * @method 
    * @name Couche.Vecteur#selectionnerInverse
    * @param {Opt} Possibilité de passer une option
    */
    Vecteur.prototype.selectionnerInverse = function(opt) { 
        
        var opt = opt || {};
        var occurences = this.obtenirOccurences();
        this.definirRafraichissementPermis('debut', occurences);
        var that=this;
        //todo: throw error si trop occurences... 
          $.each(occurences, function(key, value){
            if(!opt.exceptions || $.inArray(value, opt.exceptions) === -1){
             if(value.selectionnee){
                 that.deselectionnerOccurence(value);
               } else{
                 that.selectionnerOccurence(value);
            }  
         }}); 
     
       this.definirRafraichissementPermis('fin');
        
    };
    
    /** 
    * Créer une occurence et l'ajouter à la couche.
    * Appel de la fonction {@link Occurence}
    * Appel de la fonction {@link Couche.Vector#ajouterOccurence}
    * @method 
    * @name Couche.Vecteur#creerOccurence
    * @param {Geometrie.Point|Geometrie.Ligne|Geometrie.Polygone} geometrie La géométrie à créer et à ajouter
    * @exception Vérification de la création de l'occurence.
    */
    Vecteur.prototype.creerOccurence = function(geometrie, info, opt) {   
        //todo: throw error si pas geometrie...
        //todo: vérifier la projection de la géométrie
        opt = opt || {};
        if (geometrie instanceof Occurence){
            this.ajouterOccurence(geometrie, opt);
            return;
        }
        var creationOccurence = {};
        if(opt.existe){
            creationOccurence._keepFeature = true;
        }
        var occurence = new Occurence(geometrie, info, undefined, creationOccurence);
        
        this.ajouterOccurence(occurence, opt);
    };
    
    /** 
    * Ajouter une occurence à la couche 
    * @method 
    * @name Couche.Vecteur#ajouterOccurence
    * @param {Occurence} occurence L'occurence à ajouter
    * @exception Vérification du type de l'intrant.
    * @fires Couche.Vecteur#ajouterOccurence
    */
    Vecteur.prototype.ajouterOccurence = function(occurence, opt) {
        //todo: vérifier la projection de la géométrie
        opt = opt || {};
        if (occurence instanceof Occurence === false){
            this.creerOccurence(occurence, undefined, opt);
            return;
            //throw new Error("L'intrant n'est pas une occurence. Utiliser creerOccurence(geom).");
        } 
        
        if(this.options.typeGeometriePermise && this.options.typeGeometriePermise !== occurence.type){
            console.warn("Cette couche vecteur accepte seulement le type de géométrie: " + this.options.typeGeometriePermise);
            return false;
        }
        
        if(!occurence.type){
            console.warn("L'occurence doit avoir une géométrie pour être ajoutée à la couche vecteur.");
            return false;
        }
        
        if(this.options.protege && opt.forcer !== true){
            console.warn("Cette couche est protégée, elle n'accepte pas l'ajout d'occurrence de cette façon.");
            return false;
        }
        //avant
       // this.declencher({ type: "ajouterOccurence", occurence: occurence }); 
        occurence.vecteur=this;      
        
        if(this.options.simplificationZoom && opt.simplificationZoom !== false){
            occurence._feature.geometry=occurence._obtenirGeomOL(this.carte._carteOL.getResolution()/2);
        }

        this.listeOccurences.push(occurence);
        if(!opt.existe){
            occurence._feature.utilisateur=true;
            this._layer.addFeatures(occurence._feature);
        };
        
        if(this.garderHistorique){
            occurence.ajoutee = true;
            this._historiqueOccurencesAjoutees.push(occurence);
        }
        
        /**
        * Événement ajouterOccurence. Événement lancée avant et après.
        * @event Couche.Vecteur#ajouterOccurence
        * @type {object}
        * @property {Occurence} occurence L'occurence ajoutée
        */
        this.declencher({ type: "ajouterOccurence", occurence: occurence }); 
        
        return occurence;
    };
    
    /** 
    * Ajouter un tableau d'occurences à la couche 
    * @method 
    * @name Couche.Vecteur#ajouterOccurences
    * @param Array {Occurences} tableau d'occurence à ajouter
    */
    Vecteur.prototype.ajouterOccurences = function(occurences, opt) {
        var that = this;
        if(!occurences){return false;}
        $.each(occurences, function(key, value){
            that.ajouterOccurence(value, opt); 
        });
        /**
        * Événement ajouterOccurences. Événement lancée avant et après.
        * @event Couche.Vecteur#ajouterOccurences
        * @type {object}
        * @property {Occurences} occurences Les occurences ajoutées
        */
        this.declencher({ type: "ajouterOccurences", occurences: occurences });
    };
    
    /** 
    * Enlever une occurence à la couche 
    * @method 
    * @name Couche.Vecteur#enleverOccurence
    * @param {Occurence} occurence L'occurence à enlever
    * @fires Couche.Vecteur#enleverOccurence
    */
    Vecteur.prototype.enleverOccurence = function(occurence, opt) { 
        var idx = this.listeOccurences.indexOf(occurence);
        if (idx !== -1) {
            occurence.vecteur = undefined;
            this.listeOccurences.splice(idx, 1);
            this._layer.removeFeatures(occurence._feature);
            this.carte.gestionCouches.enleverOccurenceSurvol(occurence);
            if(this.garderHistorique){
                occurence.enlevee = true;
                
                if(!occurence.ajoutee){
                    this._historiqueOccurencesEnlevees.push(occurence);
                }
                else {
                    this._historiqueOccurencesAjoutees.remove(occurence);
                }
            }
        }
        /**
        * Événement enleverOccurence.
        * @event Couche.Vecteur#enleverOccurence
        * @type {object}
        * @property {Occurence} occurence L'occurence à retirer
        */
        this.declencher({ type: "enleverOccurence", occurence: occurence }); 
    };

    Vecteur.prototype.accepterModifications = function(saveFn) { 
        var save = saveFn || false;
        if(!save && this.options.fnSauvegarder){
            save = this.options.fnSauvegarder(this);
        }
        if(save){
            $.each(this.obtenirOccurencesModifiees(true), function(key, occurence){
                occurence.accepterModifications();
            });
            $.each(this._historiqueOccurencesEnlevees, function(key, occurence){
                occurence.accepterModifications();
            });
            this._historiqueOccurencesAjoutees=[];
            this._historiqueOccurencesEnlevees=[];
        }
    };

    Vecteur.prototype.annulerModifications = function() { 
        this.garderHistorique = false;
        this.enleverOccurences(this._historiqueOccurencesAjoutees);
        this._historiqueOccurencesAjoutees=[];
        
        this.ajouterOccurences(this._historiqueOccurencesEnlevees);
        this._historiqueOccurencesEnlevees=[];
        this.garderHistorique = true;
        $.each(this.obtenirOccurencesModifiees(true), function(key, occurence){
            occurence.annulerModifications();
        });
        
        $.each(this._historiqueOccurencesAjoutees, function(key, occurence){
            occurence.annulerModifications();
        });
    };
    
    Vecteur.prototype.enleverOccurences = function(occurences, opt) { 
        var that=this;
        var occurencesClone = $.extend({}, occurences);
        $.each(occurencesClone, function(key, value){
            that.enleverOccurence(value, opt); 
        });
    };

    /** 
    * Enlever toutes les occurences de la couche
    * @method 
    * @name Couche.Vecteur#enleverTout
    * @fires Couche.Vecteur#enleverTout
    */
   //todo renommer en enleverToutesOccurences
    Vecteur.prototype.enleverTout = function(opt) { 
        this.enleverOccurences(this.listeOccurences, opt);
    };
    

    Vecteur.prototype.cacherOccurence = function(occurence,tousLesStyles) { 
        if(!occurence || occurence.vecteur !== this){return false};
        
        var tousStyles = tousLesStyles===undefined?false:tousLesStyles;
             
        occurence.cacher(tousStyles);
    };

    Vecteur.prototype.afficherOccurence = function(occurence) { 
        if(!occurence || occurence.vecteur !== this){return false};
        occurence.afficher();
    };
    
    /** 
     * Obtenir l'emprise de toutes les occurences de la couche
     * @method 
     * @name Couche.Vecteur#obtenirLimites
     */
     Vecteur.prototype.obtenirLimites = function() {  
         var limitesOL = this._layer.getDataExtent();
         if(!limitesOL){return false};
         var limites = new Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
         return limites;
     };
     
    /** 
    * Zoomer sur l'emprise de toutes les occurences de la couche ou sur les occurences en paramètre
    * @method 
    * @name Couche.Vecteur#zoomerOccurences
    * @param {Array} [occurences] Occurences sur lesquelles zoomer. Si absent, zoom sur toutes les occurences de la couche
    */
    Vecteur.prototype.zoomerOccurences = function(occurences, maxZoom) {  
        if(!occurences){
            var limitesOL = this._layer.getDataExtent();
            if(!limitesOL){return false};
            var limites = new Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
            this.carte.zoomer(limites, maxZoom);
            return true;
        }
        this.carte.gestionCouches.zoomerOccurences(occurences, maxZoom);
    };

    /** 
    * Zoomer sur une occurence
    * @method 
    * @name Couche.Vecteur#zoomerOccurence
    * @param {Occurence} occurence L'occurence sur laquelle zoomer.
    */
    Vecteur.prototype.zoomerOccurence = function(occurence, maxZoom) { 
        this.carte.zoomer(occurence.obtenirLimites(), maxZoom);
       
        this.declencher({ type: "zoomerOccurence", occurence: occurence }); 
    };

    /** 
    * Obtenir les styles pour les occurences de la couche vecteur
    * @method 
    * @name Couche.Vecteur#obtenirStyles
    * @returns {Tableau} Tableau de {@link Geometrie.Style}
    */
    Vecteur.prototype.obtenirStyles = function() { 
        return this.styles;
    };
    
    /** 
    * Changer les styles pour les occurences de la couche vecteur
    * @method 
    * @param {Tableau} styles Tableau de {@link Geometrie.Style}
    * @name Couche.Vecteur#definirStyles
    */
    Vecteur.prototype.definirStyles = function(styles) { 
        var that=this;
        if (styles){
            if (!styles.obtenirTypeClasse || styles.obtenirTypeClasse() !== 'Style'){
                var styleMap={};
                $.each(styles, function(key, style){
                    if(!style.obtenirTypeClasse){
                        style = new Style(style);
                    } 
                    that.styles[key] = style.cloner();
                    that.styles[key].parent = that;
                    that.styles[key].regle = key;
                    styleMap[key] = that.styles[key]._getStyleOL();
                    if(key === 'defaut'){
                        var styleOL = that.styles.defaut._getStyleOL();
                        styleMap['default'] = styleOL;
                        styleMap['defaut'] = styleOL;
                    }
                });
                if(!styleMap['select']){
                    styleMap['select'] = styleMap['default'].clone();
                    styleMap['select'].defaultStyle.fillColor = "#0000FF";
                    styleMap['select'].defaultStyle.strokeColor = "#0000FF";
                    styleMap['select'].defaultStyle.strokeWidth = 2;
                    styleMap['select'].defaultStyle.graphicZIndex = 100;
                    //problème avec le style des labels dynamiques,
                    //le style du label n'est pas mis à jour!
//                    styleMap['select'].defaultStyle.labelOutlineColor = "#FF99FF";
//                    styleMap['select'].defaultStyle.labelOutlineWidth = 3;
                }
                this._optionsOL.styleMap = new OpenLayers.StyleMap(styleMap);

                if(this._layer){
                    this._layer.styleMap = this._optionsOL.styleMap;
                    this.rafraichir();
                }
            } else {
                this.definirStyle(styles, 'defaut');
            }
        }
    };
    
    /** 
    * Obtenir le style par défaut ou lors de la sélection.
    * @method 
    * @name Couche.Vecteur#obtenirStyle
    * @param {String} [regle='defaut'] Style à obtenir (defaut | select)
    * @returns {Geometrie.Style} Occurence de {@link Geometrie.Style}
    */
    Vecteur.prototype.obtenirStyle = function(regle) { 
        regle = regle || 'defaut';
        return this.styles[regle];
    };
    
    /** 
    * Changer le style d'une règle pour les occurences de la couche vecteur
    * @method 
    * @param {Geometrie.Style} style Occurence de {@link Geometrie.Style}
    * @param {String} [regle='defaut'] Style à obtenir (defaut | select)
    * @name Couche.Vecteur#definirStyle
    */
    Vecteur.prototype.definirStyle = function(style, regle) { 
        if (!regle){
            regle = 'defaut';
        };
        
        if(!style.obtenirTypeClasse){
            style = new Style(style);
        }
        this.styles[regle]=style.cloner();
        this.styles[regle].parent=this;
        this.styles[regle].regle=regle;
        
        if (this.styles){
            if (this._optionsOL.styleMap){
                if(regle==='defaut'){
                    var styleOL = this.styles.defaut._getStyleOL();
                    this._optionsOL.styleMap.styles['default'] = styleOL;
                    this._optionsOL.styleMap.styles['defaut'] = styleOL;
                } else if(regle==='select'){
                    this._optionsOL.styleMap.styles.select = this.styles.select._getStyleOL();
                }
                if(this._layer){
                    this._layer.styleMap = this._optionsOL.styleMap;
                    this.rafraichir();
                }
            } else {
                this.definirStyles(this.styles);
            }
        }       
    };
    
    /** 
    * Redessiner les occurences de la couche
    * @method 
    * @name Couche.Vecteur#rafraichir
    */
    Vecteur.prototype.rafraichir = function(occurence) { 
        
        if(this.options.rafraichissementPermis){
            if(!occurence){
                this._layer.redraw();  
                this.rafraichirLegende();
                return true;
            }
            this._layer.drawFeature(occurence._feature);
            this.rafraichirLegende();
        }
        
    };
    
    Vecteur.prototype.rafraichirLegende = function() {
        if(this._layer.arborescence){
            this._layer.arborescence.setRules();
            this._layer.arborescence.update();
        }
    };
    
    
    
    /**
    * Obtenir l'ordre d'affichage de base de la couche
    * @method
    * @name Vecteur#obtenirOrdreAffichageBase
    * @returns {Nombre} Ordre d'affichage de base
    */
    Vecteur.prototype.obtenirOrdreAffichageBase = function() {
        return this.carte._getCarte().Z_INDEX_BASE.Vecteur;
    };
    
    /**
     * Enlever la couche
     * @method
     * @name Vecteur#enlever
     * @returns true
     */
    Vecteur.prototype.enlever = function(){
        this.carte.gestionCouches.enleverCouche(this);
      
        return true;
    };
    
    Vecteur.Controles = function(_){
        this._ = _;
        if (this._.options.simplificationZoom) {
            var that=this._;
            that.carte._carteOL.events.register("zoomend", that.carte._carteOL, function(){
                //todo: simplifier à chaque zoom? ou seulement certain? donner le choix a l'utilisateur?
                var zoom = that.carte.obtenirZoom();
                if ((zoom % 2) === 0) {
                    return true;
                }
                $.each(that.listeOccurences, function(key, occurence){
                    that._layer.removeFeatures(occurence._feature);
                    if(!occurence._geomSimplifiee){
                       occurence._geomSimplifiee = {}; 
                    }
                    if(!occurence._geomSimplifiee[zoom]){
                        occurence._geomSimplifiee[zoom] = occurence._obtenirGeomOL(that.carte._carteOL.getResolution()/2);
                    }
                    occurence._feature.geometry = occurence._geomSimplifiee[zoom];
                    that._layer.addFeatures(occurence._feature);
                });                
            });
        }
    };
   
    Vecteur.Controles.prototype.activerDeplacement = function(opt) {
        opt = opt || {};
        if (!this._dragControl) {
            this._dragControl = new OpenLayers.Control.DragFeature(this._._layer, {onStart: this._debutDeplacement, onDrag: this._deplacement, onComplete: this._finDeplacement, scope: this});
            this._.carte._getCarte().addControl(this._dragControl);
        };
       /* if(opt.combinaisonClique){
            this._dragControl.handlers['drag'].stopDown = false;
            this._dragControl.handlers['drag'].stopUp = false;
            this._dragControl.handlers['drag'].stopClick = false;
            this._dragControl.handlers['feature'].stopDown = false;
            this._dragControl.handlers['feature'].stopUp = false;
            this._dragControl.handlers['feature'].stopClick = false;
        } else {
            this._dragControl.handlers['drag'].stopDown = true;
            this._dragControl.handlers['feature'].stopDown = true;
            this._dragControl.handlers['feature'].stopClick = true;
        };*/
        this._dragControl.activate();
    };
    
    Vecteur.Controles.prototype.desactiverDeplacement = function() {
        if (this._dragControl) {
            this._dragControl.deactivate();
        }
    };
    
    Vecteur.Controles.prototype._debutDeplacement = function(feature) {
        var that = this.scope;
        var occurence = that._.obtenirOccurenceParId(feature.id);
        that._.declencher({ type: "debutDeplacementOccurence", occurence: occurence }); 
    };
    
    
    Vecteur.Controles.prototype._deplacement = function(feature) {
        var that = this.scope;
        var occurence = that._.obtenirOccurenceParId(feature.id);
        occurence.x = feature.geometry.x;
        occurence.y = feature.geometry.y;
        that._.declencher({ type: "deplacementOccurence", occurence: occurence }); 
    };
    
    Vecteur.Controles.prototype._finDeplacement = function(feature) {
        var that = this.scope;
        var occurence = that._.obtenirOccurenceParId(feature.id);
        occurence.x = feature.geometry.x;
        occurence.y = feature.geometry.y;
        that._.declencher({ type: "finDeplacementOccurence", occurence: occurence }); 
    };
    

    Vecteur.Controles.prototype.activerSelection = function(opt) { //ajouter? au lieu d'activer? separer en 2?
        opt = opt || {};
        if(this._.obtenirDeclencheur('occurenceClique', null, this._selection).length){
            return false;
        } 
        this._.ajouterDeclencheur('occurenceClique', this._selection, {scope: this});
        
        //todo: vérifier si selectionnable...ou force:
       /* opt = opt || {};
        if (!this._.options.selectionnable && !opt.force){return false};
        
        if (opt.local !== undefined && opt.local) {
            if (!this._selectControl) {
                this._selectControl = new OpenLayers.Control.SelectFeature(this._._layer, {onSelect: this._._.controles._selection, scope: this});
                this._.carte._getCarte().addControl(this._selectControl);
            };
            this._selectControl.activate();
            return true;
        }
        
        var selectControle = this._._.controles._selectControle;
        if (!selectControle) {
            selectControle = this._._.controles.initSelection();
        };
        
        if(selectControle.layers.lastIndexOf(this._._layer) === -1){
            selectControle.addLayer(this._._layer);
        }

        if(selectControle.active){
            selectControle.activate();
        }  */
    };
    
    Vecteur.Controles.prototype.desactiverSelection = function() { //retirer
        this._.carte.enleverDeclencheur('occurenceClique', null, this._selection);
      /*  opt = opt || {};
        if (!opt.local !== undefined && opt.local) {
            if (this._selectControl) {
                this._selectControl.deactivate();
            }
            return true;
        }  
        
        var selectControle = this._._.controles._selectControle;
        if (selectControle && selectControle.active) {
            selectControle.deactivate();
            selectControle.layers.remove(this._._layer);
            if(selectControle.layers.length !== 0) {
                selectControle.activate();
            }
        }*/
    };
    
    Vecteur.Controles.prototype._selection = function(e) {
        var that = e.options.scope;
        if (that._.obtenirId() !== e.occurence.vecteur.obtenirId()){return false};  
        if (!Aide.obtenirNavigateur().obtenirCtrl()) { 
            that._.carte.gestionCouches.deselectionnerToutesOccurences();
        }
        if(e.occurence.estSelectionnee()){
            e.occurence.vecteur.deselectionnerOccurence(e.occurence);
        } else {
            e.occurence.vecteur.selectionnerOccurence(e.occurence);
        }
        //that._.declencher({ type: "occurenceClique", occurence: e.occurence }); 
    };
    
    
    Vecteur.prototype.afficherSelectionSeulement = function(){
        
        var selection = this.obtenirOccurencesNonSelectionnees();
        this.definirRafraichissementPermis('debut', selection);
        $.each(selection, function(key, occurence){
                occurence.cacher(true);
        });
        selection = this.obtenirOccurencesSelectionnees();
        $.each(selection, function(key, occurence){
                occurence.afficher(true);
        });
        this.definirRafraichissementPermis('fin');
    }
    
    Vecteur.prototype.cacherTous = function(){
        
        var selection = this.obtenirOccurences();
        this.definirRafraichissementPermis('debut', selection);
        $.each(selection, function(key, occurence){
                occurence.cacher(true);
        });
        this.definirRafraichissementPermis('fin');
    }
    
     Vecteur.prototype.afficherTous = function(){
        
        var selection = this.obtenirOccurences();
        this.definirRafraichissementPermis('debut', selection);
        $.each(selection, function(key, occurence){
                occurence.afficher(true);
        });
        this.definirRafraichissementPermis('fin');
    }
    
    Vecteur.prototype.definirRafraichissementPermis = function (tag, occurence){
        switch(tag){
            case 'debut':
                if(occurence.length > this.options.rafraichirMaxOccurence){
                    this.options.rafraichissementPermis = false;
                }
                break;
            case 'fin':
                if(!this.options.rafraichissementPermis){
                    this.options.rafraichissementPermis = true;
                }
                this.rafraichir();
                break;
        }
    }
    
  /*  Vecteur.Controles.prototype.activerClique = function() {   
        this._.carte.ajouterDeclencheur('occurenceClique', this._clique, {scope: this});
    };
    
    Vecteur.Controles.prototype.desactiverClique = function() { 
        this._.carte.enleverDeclencheur('occurenceClique', null, this._clique);
    };

    Vecteur.Controles.prototype._clique = function(e) {
        var that = e.options.scope;
        if (that._.obtenirId() !== e.occurence.vecteur.obtenirId()){return false};  
        that._.declencher({ type: "occurenceClique", occurence: e.occurence }); 
    };
    
    Vecteur.Controles.prototype.activerMouseover = function() {   
        this._.carte.ajouterDeclencheur('occurenceMouseover', this._mouseover, {scope: this});
    };
    
    Vecteur.Controles.prototype.desactiverMouseover = function() { 
        this._.carte.enleverDeclencheur('occurenceMouseover', null, this._mouseover);
    };

    Vecteur.Controles.prototype._mouseover = function(e) {
        var that = e.options.scope;
        if (that._.obtenirId() !== e.occurence.vecteur.obtenirId()){return false};  
        that._.declencher({ type: "occurenceMouseover", occurence: e.occurence }); 
    };

    Vecteur.Controles.prototype.activerMouseout = function() {   
        this._.carte.ajouterDeclencheur('occurenceMouseout', this._mouseout, {scope: this});
    };
    
    Vecteur.Controles.prototype.desactiverMouseout = function() { 
        this._.carte.enleverDeclencheur('occurenceMouseout', null, this._mouseout);
    };

    Vecteur.Controles.prototype._mouseout = function(e) {
        var that = e.options.scope;
        if (that._.obtenirId() !== e.occurence.vecteur.obtenirId()){return false};  
        that._.declencher({ type: "occurenceMouseout", occurence: e.occurence }); 
    };*/
    
    return Vecteur;
    
});
