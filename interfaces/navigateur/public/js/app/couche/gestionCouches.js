/** 
 * Module pour l'objet {@link GestionCouches}.
 * @module gestionCouches
 * @requires evenement 
 * @requires couche 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['evenement', 'couche', 'blanc', 'limites', 'aide'], function(Evenement, Couche, Blanc, Limites, Aide) {
    /** 
     * Création de l'object GestionCouches.
     * @constructor
     * @name GestionCouches
     * @class GestionCouches
     * @alias gestionCouches:GestionCouches
     * @extends Evenement
     * @requires gestionCouches
     * @param {Carte} carte Carte reliée à la barre d'outils
     * @returns {GestionCouches} Instance de {@link GestionCouches}
     * @property {tableau} listeCouches Tableau de {@link Couche}
     * @property {Carte} carte Carte reliée à la barre d'outils
    */
    function GestionCouches(carte) {
        this.listeCouches = [];
        this.listeOccurencesSurvols = [];
        this.carte = carte;
        this.controles = new GestionCouches.Controles(this);
    };
    
    GestionCouches.prototype = new Evenement();
    GestionCouches.prototype.constructor = GestionCouches;
 
    /** 
    * Ajouter plusieurs couches à la carte.
    * @method 
    * @name GestionCouches#ajouterCouches
    * @param {Tableau} couches Tableau de {@link Couche} à ajouter
    */
    GestionCouches.prototype.ajouterCouches = function(couches, opt) {
        var that=this;
        $.each(couches, function(key, value){
            that.ajouterCouche(value, opt);
        });
    };
    
    /** 
    * Ajouter une couche à la carte.
    * @method 
    * @name GestionCouches#ajouterCouche
    * @param {Couche} couche La couche à ajouter
    * @exception Vérification de la validité de la couche en paramètre
    */
    GestionCouches.prototype.ajouterCouche = function(couche, opt) {
        if (couche instanceof Couche) {
            couche.definirCarte(this.carte);
            couche._ = this;
            couche._ajoutCallback(this, this._ajouterCoucheCallback, opt);
        } else {
            throw new Error("Igo.Carte.ajouterCouche(couche) a besoin d'un objet de type Igo.Couches");
        }
    };

    /** 
    * Callback lors de l'ajout d'une couche. 
    * La fonction {@link GestionCouches#ajouterCouche} est appelée de manière asynchrone.
    * @method 
    * @private
    * @name GestionCouches#_ajouterCoucheCallback
    * @param {Couche} couche
    */
    GestionCouches.prototype._ajouterCoucheCallback = function(couche, opt) {
        var that = this;
        opt = opt || {};
        if (couche._getLayer()) {
            this.listeCouches.push(couche);
            this._ajouterCoucheCallbackEnd(couche, opt);
        };
    };

    GestionCouches.prototype._ajouterCoucheCallbackEnd = function(couche, opt) {
        this.carte._carteOL.addLayer(couche._getLayer());
        couche.definirOrdreAffichage();
        if (couche.estFond()){
            couche.desactiver(!Aide.toBoolean(couche.options.active));
        }
        if(opt.callback){
            var scopeCallback = opt.scopeCallback || couche;
            opt.callback.call(scopeCallback);
        }
        this.declencher({ type: "ajouterCouche", couche: couche }); 
        couche.declencher({ type: "coucheAjoutee" }); 
    };

    /** 
    * Enlever une couche de la carte.
    * @method 
    * @name GestionCouches#enleverCouche
    * @param {Couche} couche La couche à retirer
    */
    GestionCouches.prototype.enleverCouche = function(couche) {
        var idx = this.listeCouches.indexOf(couche);
        if (idx !== -1) {
            this.listeCouches.splice(idx, 1);
            this.carte._carteOL.removeLayer(couche._getLayer());
            couche.declencher({ type: "enleverCouche"}); 
            this.declencher({ type: "enleverCouche", couche: couche }); 
        }
    };

    GestionCouches.prototype.enleverToutesLesCouches = function() {
        var that=this;
        var i = 0;
        this.ajouterCouche(new Blanc());
        while(this.listeCouches.length > i){
            that.enleverCouche(that.listeCouches[0]);
        };
        this.declencher({ type: "enleverToutesLesCouches" }); 
    };
    
    /** 
    * Obtenir la liste des couches.
    * @method 
    * @name GestionCouches#obtenirCouches
    * @returns {Tableau} Tableau de {@link Couche}
    */
    GestionCouches.prototype.obtenirCouches = function(trier) {
        if(trier){
            return this.listeCouches.sort(function(a, b){return a.obtenirOrdreAffichage()-b.obtenirOrdreAffichage()});
        }
        return this.listeCouches;
    };

    /** 
    * Obtenir la liste des couches ayant le titre donné en paramètre.
    * @method 
    * @name GestionCouches#obtenirCouchesParTitre
    * @param {String} titre Titre recherché
    * @returns {Tableau} Tableau de {@link Couche}
    */
    GestionCouches.prototype.obtenirCouchesParTitre = function(titre) {
        var couches = [];
        $.each(this.listeCouches, function(index, value){
            if(value.obtenirTitre() === titre){
                couches.push(value);
            }
        });
        return couches;
    };
    
    /** 
    * Obtenir la liste des couches ayant le nom donné en paramètre.
    * @method 
    * @name GestionCouches#obtenirCouchesParNom
    * @param {String} nom Nom recherché
    * @returns {Tableau} Tableau de {@link Couche}
    */
    GestionCouches.prototype.obtenirCouchesParNom = function(nom) {
        var couches = [];
        $.each(this.listeCouches, function(index, value){
            if(value.obtenirNom() === nom){
                couches.push(value);
            }
        });
        return couches;
    };

    /** 
    * Obtenir la liste des couches avec l'aide d'un regex
    * @method 
    * @name GestionCouches#trouverCouches
    * @param {String} regex Regex à chercher
    * @returns {Tableau} Tableau de {@link Couche}
    */
    GestionCouches.prototype.trouverCouches = function(regex, opt) {
        opt = opt || {};
        var testerTitre = opt.testerTitre !== false ? true : false;
        var testerGroupe = opt.testerGroupe !== false ? true : false;
        var testerNom = opt.testerNom !== false ? true : false;
        
        if(typeof regex === "string"){
            var ignorerCase = opt.ignorerCase !== false ? 'i' : '';
            var string = regex;
            if(opt.exacte !== true){
                //todo: il faut que ça soit dans le bon ordre, devrait peut-être séparer les regex.test pour en faire un par mot
                string = string.replace(/ /g, ".*");
            }
            regex = new RegExp(string, ignorerCase);
        } else if (regex instanceof RegExp){
            //ne prend pas en compte les options
//            if(opt.ignoreCase){
//                regex.ignoreCase = opt.sensibleCase;
//            }
        } else {
            return false;
        }
        
        var couches = [];
        $.each(this.listeCouches, function(index, value){
            if((testerTitre && regex.test(value.obtenirTitre())) || (testerGroupe && regex.test(value.obtenirGroupe())) || (testerNom && regex.test(value.obtenirNom()))){
                couches.push(value);
            }
        });
        return couches;
    };
    
    /** 
    * Obtenir la liste des couches de type BaseLayer.
    * @method 
    * @name GestionCouches#obtenirCouchesDeBase
    * @returns {Tableau} Tableau de {@link Couche}
    */
    GestionCouches.prototype.obtenirCouchesDeBase = function() {
        var couches = [];
        $.each(this.listeCouches, function(index, value){
            if(value.estFond()){
                couches.push(value);
            }
        });
        return couches;
    };
    

    GestionCouches.prototype.obtenirCoucheDeBaseActive = function() {
        var coucheActive = false;
        $.each(this.obtenirCouchesDeBase(), function(index, value){
            if(value.estActive()){
                coucheActive = value;
                return false;
            } 
        });
        return coucheActive;
    };

    /** 
    * Obtenir la liste des couches étant du type donné en paramètre.
    * @method 
    * @name GestionCouches#obtenirCouchesParType
    * @param {String} type Type recherché
    * @returns {Tableau} Tableau de {@link Couche}
    */
    GestionCouches.prototype.obtenirCouchesParType = function(type, trier){
        if(!$.isArray(type)){type = [type];}
        var couches=[]; 
        $.each(this.listeCouches, function(key, value){
            if(type.indexOf(value.obtenirTypeClasse()) !== -1){
                couches.push(value);
            };
        });
        if(trier){
            return couches.sort(function(a, b){return a.obtenirOrdreAffichage()-b.obtenirOrdreAffichage()});
        }
        return couches;
    };

    /** 
    * Obtenir la couche ayant l'id donné en paramètre.
    * @method 
    * @name GestionCouches#obtenirCoucheParId
    * @param {String} id Id recherché
    * @returns {Couche} Couche recherchée
    */
    GestionCouches.prototype.obtenirCoucheParId = function(id){
        var couche; 
        $.each(this.listeCouches, function(key, value){
            if(value.obtenirId() === id){
                couche = value;
                return false;
            };
        });
        return couche;
    };
    
    /**
     * Obtenir les couches selon un type permis
     * @method 
     * @param {string} type Type de géométrie de couche à obtenir
     * @param {bool} trier Trier le résultat ou non
     * @returns {Array}
     */    
    GestionCouches.prototype.obtenirCouchesParTypePermis = function(type, trier){
        var couches=[]; 
        $.each(this.listeCouches, function(key, value){
            if((value.obtenirTypeClasse() === 'Vecteur' || value.obtenirTypeClasse() === 'VecteurCluster' || value.obtenirTypeClasse() === 'WFS') && value.options.protege !== true && (value.options.typeGeometriePermise === undefined || value.options.typeGeometriePermise === type)){
                couches.push(value);
            };
        });
        if(trier){
            return couches.sort(function(a, b){return a.obtenirOrdreAffichage()-b.obtenirOrdreAffichage()});
        }
        return couches; 
    };
    

    
    /** 
    * Obtenir la liste des occurences sélectionnées dans toutes les couches de type 'Vecteur'.
    * @method 
    * @name GestionCouches#obtenirOccurencesSelectionnees
    * @returns {Tableau} Tableau de {@link Occurence}
    */
    GestionCouches.prototype.obtenirOccurencesSelectionnees = function(groupe) { //groupe = true pour grouper par couche sinon un seul tableau
        if(groupe == false){
            var occurences=[];
            $.each(this.obtenirCouchesParType(['Vecteur', 'VecteurCluster', 'WFS']), function(key, value){
                occurences = occurences.concat(value.obtenirOccurencesSelectionnees());
            });
            return occurences;
        }
        var occurences={};
        $.each(this.obtenirCouchesParType(['Vecteur', 'VecteurCluster', 'WFS']), function(key, value){
            occurences[value.obtenirId()] = value.obtenirOccurencesSelectionnees();
        });
        return occurences;
    };    

    /** 
    * Obtenir l'occurence ayant l'id donné en paramètre.
    * @method 
    * @name GestionCouches#obtenirOccurenceParId
    * @param {String} id Id recherché
    * @returns {Occurence} Occurence recherchée
    */
    GestionCouches.prototype.obtenirOccurenceParId = function(id) { 
        var occurence;
        $.each(this.obtenirCouchesParType(['Vecteur', 'VecteurCluster', 'WFS']), function(key, value){
            occurence = value.obtenirOccurenceParId(id);
            if (occurence){
                return false;
            }
        });
        return occurence;
    };
 
    GestionCouches.prototype.deselectionnerToutesOccurences = function() { 
        $.each(this.obtenirCouchesParType(['Vecteur', 'VecteurCluster', 'WFS']), function(key, value){
            value.deselectionnerTout();
        });
        /*var selectControle = this.controles._selectControle;
        if (selectControle){
            selectControle.unselectAll();
        };*/
    };
    
     /** 
    * Zoomer sur les occurences sélectionnées sur les couches multiples
    * @method 
    * @name GestionCouches#zoomerSelections
    */
    GestionCouches.prototype.zoomerSelections = function(maxZoom) {               
        var occurences = this.obtenirOccurencesSelectionnees(false);
        this.zoomerOccurences(occurences, maxZoom);
    };
    
    /** 
    * Zoomer sur plusieurs occurences
    * @method 
    * @name GestionCouches#zoomerOccurences
    * @param {Array} occurences Occurences sur lesquelles zoomer.
    */
    GestionCouches.prototype.zoomerOccurences = function(occurences, maxZoom) { 
        if(!occurences || occurences.length === 0){return false;}
        
        var limiteGauche=null;
        var limiteDroite=null;
        var limiteHaut=null;
        var limiteBas=null;
              
        //Pour chaque occurences sélectionnéees
        $.each(occurences, function(indice, occurence){
            var limitesOccurence = occurence.obtenirLimites();

            if(limiteGauche == null || limiteGauche > limitesOccurence.gauche){
                limiteGauche = limitesOccurence.gauche;
            }

            if(limiteBas == null || limiteBas > limitesOccurence.bas){
                limiteBas = limitesOccurence.bas;
            }

            if(limiteDroite == null || limiteDroite < limitesOccurence.droite){
                limiteDroite = limitesOccurence.droite;
            }

            if(limiteHaut == null || limiteHaut < limitesOccurence.haut){
                limiteHaut = limitesOccurence.haut;
            }
        });
      
        var limiteSelection = new Limites(limiteGauche, limiteBas, limiteDroite, limiteHaut);
        this.carte.zoomer(limiteSelection, maxZoom);         
    };

    
    GestionCouches.prototype.obtenirListeOccurencesSurvols = function(){
        return this.listeOccurencesSurvols;
    };
    
    GestionCouches.prototype.ajouterOccurenceSurvol = function(occurence){
        if(!this.carte.curseur){
            $('.olMapViewport').css('cursor','pointer');
        }            
        var index = this.obtenirListeOccurencesSurvols().indexOf(occurence);
        if (index === -1) {
            occurence.appliquerStyle('courant', true);
            this.obtenirListeOccurencesSurvols().push(occurence);
            occurence.vecteur.declencher({ type: "occurenceSurvol", occurence: occurence }); 
        }
    };

    GestionCouches.prototype.enleverOccurenceSurvol = function(occurence){
        occurence.appliquerStyle('courant', false); 
        var index = this.obtenirListeOccurencesSurvols().indexOf(occurence);
        if (index !== -1) {
            this.obtenirListeOccurencesSurvols().splice(index, 1);
        }
        if(this.obtenirListeOccurencesSurvols().length === 0){
            $('.olMapViewport').css('cursor','');
        }
        
        if(occurence.vecteur){
            occurence.vecteur.declencher({ type: "occurenceSurvolFin", occurence: occurence }); 
        }
    };
    
    
    /**
     * Désélectionner toutes les couches WMS qui ne sont pas des fonds de carte
     * @method
     * @name GestionCouches#deselectionnerCouchesWMS
     * 
     */
    GestionCouches.prototype.deselectionnerCouchesWMS = function(){
      
        var tabCouches = this.obtenirCouchesParType("WMS");
        
        $.each(tabCouches, function(index, couche){
                
            if(!couche.estFond() && couche.estActive()){
                couche.desactiver();
                couche.gererStyleParentEnfantSelect();
            }
        }); 
    };
    
    /**
     * Désélectionner toutes les couches WMTS qui ne sont pas des fonds de carte
     * @method
     * @name GestionCouches#deselectionnerCouchesWMTS
     * 
     */
    GestionCouches.prototype.deselectionnerCouchesWMTS = function(){
      
        var tabCouches = this.obtenirCouchesParType("WMTS");
        
        $.each(tabCouches, function(index, couche){
                
            if(!couche.estFond() && couche.estActive()){
                couche.desactiver();
            }
        }); 
    };    
      
    /** 
     * Création de l'object GestionCouches.Controles
     * @constructor
     * @name GestionCouches.Controles
     * @class GestionCouches.Controles
     * @alias gestionCouches:GestionCouches.Controles
     * @requires gestionCouches
     * @returns {GestionCouches.Controles} Instance de {@link GestionCouches.Controles}
    */
    GestionCouches.Controles = function(_){
        this._ = _;
    };
  

    return GestionCouches;
    
});
