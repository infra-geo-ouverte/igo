/* global this */

/** 
 * Module pour l'objet {@link Panneau.PanneauMesure}.
 * @module PanneauMesure
 * @requires panneau
 * @author Michael Lane FADQ
 * @version 1.0
 */

define(['aide', 'panneauTable', 'panneauOnglet', 'vecteur', 'fonctions'], function(Aide, PanneauTable, PanneauOnglet, Vecteur, Fonctions) {
    
    /** 
    * Création de l'object Panneau.PanneauMesure.
    * Pour la liste complète des paramètres, voir {@link Panneau}
    * @constructor
    * @name Panneau.PanneauMesure
    * @class Panneau.PanneauMesure
    * @alias PanneauMesure:panneau.PanneauMesure
    * @extends Panneau
    * @requires panneau
    * @param {object} [options] Objet contenant les propriétés du panneau
    * @returns {Panneau.PanneauMesure} Instance de {@link Panneau.PanneauMesure}
   */    
       
    function PanneauMesure(options){
        this._toolbar;
        this.creerVecteurs();
        this.options = options || {};
        this.defautOptions = $.extend({},this.defautOptions, {
                titre: 'Mesure libre', 
                reductible: false, 
                activerEdition : true,
                panneaux : [new PanneauTable({titre: "Surface", vecteur: this.coucheEditionPolygone, reductible: false, fermable: false, activerEdition : true, sansSauvegarde: true, optionCalcul: true}),
                            new PanneauTable({titre: "Ligne", vecteur: this.coucheEditionLigne, reductible: false, fermable: false, activerEdition : true, sansSauvegarde: true, optionCalcul: true})]
            });
      
        this.Aide = Aide; 
       
        this.creerTemplatePolygone();
        this.creerTemplateLigne();
                
        //Définir l'outil de mesure d'Igo qui permettra d'afficher les mesures en cours de dessin
        var outilsMesure = this.Aide.obtenirNavigateur().obtenirBarreOutils().obtenirOutilsParType("OutilMesure");
        var om = outilsMesure[0];
        this.om = om;
        
        //Exécuter une fois l'outil de mesure et le cacher afin qu'il puisse être rappellé correctement au moment de l'exécution
        om._bouton.items[0].el.dom.click();
        //Enlever la pression sur le bouton
        om.relever();
        //Masquer l'outil
        om.cacherFenetre();
    };

    PanneauMesure.prototype = new PanneauOnglet();
    PanneauMesure.prototype.constructor = PanneauMesure;
            
    /**
     * Créer le modèle de table pour les géométries de type polygone
     * @method
     * @name PanneauMesure#creerTemplatePolygone
     */
    PanneauMesure.prototype.creerTemplatePolygone = function() {
        this.coucheEditionPolygone.templates = {table:{colonnes: [{propriete: "SuperficieM", editable: false, titre: "Superficie en mètres²"}, 
                                                                  {propriete: "SuperficieKM", editable: false, titre: "Superficie en km²"},
                                                                  {propriete: "SuperficieMile", editable: false, titre: "Superficie en miles²"},
                                                                  {propriete: "SuperficieAcre", editable: false, titre: "Superficie en acres"},
                                                                  {propriete: "SuperficieHectare", editable: false, titre: "Superficie en hectare"},
                                                                  {propriete: "Perimetre", editable: false, titre: "Périmètre en mètre"}]}};
    };
    
    /**
     * Créer le modèle de table pour les géométries de type ligne
     * @method
     * @name PanneauMesure#creerTemplateLigne
     */
    PanneauMesure.prototype.creerTemplateLigne = function() {
        this.coucheEditionLigne.templates = {table:{colonnes: [{propriete: "LongueurM", editable: false, titre: "Longueur en mètres"},
                                                               {propriete: "LongueurKM", editable: false, titre: "Longueur en km"},
                                                               {propriete: "LongueurMile", editable: false, titre: "Longueur en miles"},
                                                               {propriete: "LongueurPied", editable: false, titre: "Longueur en pieds"}]}};
    };

    /**
     * Méthode pour créer les vecteurs à associer aux panneaux de mesure
     * @method
     * @name PanneauMesure#creerVecteurs
     */
    PanneauMesure.prototype.creerVecteurs = function(){
        var that = this;
        
        this.coucheEditionPolygone = new Vecteur({titre: "Mesure libre polygone", id:"coucheMesureLibrePolygone", editable:true, active:true, visible:true, typeGeometriePermise: "Polygone"});
        Aide.obtenirNavigateur().carte.gestionCouches.ajouterCouche(this.coucheEditionPolygone);
        
        this.coucheEditionLigne = new Vecteur({titre: "Mesure libre ligne", id:"coucheMesureLibreLigne", editable:true, active:true, visible:true, typeGeometriePermise: "Ligne"});
        Aide.obtenirNavigateur().carte.gestionCouches.ajouterCouche(this.coucheEditionLigne);
                
        var styleCouche = {etiquette: "${label}", etiquetteTaille: "${taille}",limiteEpaisseur:3,
                                         couleur: '#660033', opacite: 0.2, etiquettePolice:"arial", 
                                         etiquetteEpaisseur:"bold", etiquetteLimiteCouleur:"#EBEBEB", etiquetteLimiteEpaisseur:2,
            contexte: {label:
                function(occ){
                    if(!occ){
                        return "";
                    }
                    occ.proprietes.Type = occ.type;
                    
                    //Mettre à jour les propriétés de l'occurrence si celle-ci nécessite une mise à jour
                    if(occ.type === "Ligne") {        
                        if(occ.proprietes.LongueurM != occ.obtenirLongueur().toFixed(2)) {
                            occ.proprietes.LongueurM = occ.obtenirLongueur().toFixed(2);
                            occ.proprietes.LongueurKM = Fonctions.convertirMesure(occ.obtenirLongueur(), 'm', 'km').toFixed(2);
                            occ.proprietes.LongueurMile = Fonctions.convertirMesure(occ.obtenirLongueur(), 'm', 'mile').toFixed(2);
                            occ.proprietes.LongueurPied = Fonctions.convertirMesure(occ.obtenirLongueur(), 'm', 'pied').toFixed(2);
                            occ.definirProprietes(occ.proprietes);
                        }
                        return occ.obtenirLongueur().toFixed(2);
                    }else if(occ.type === "Polygone") {
                        if(occ.proprietes.SuperficieM != occ.obtenirSuperficie().toFixed(2)) {
                            occ.proprietes.SuperficieM = occ.obtenirSuperficie().toFixed(2);
                            occ.proprietes.SuperficieKM = Fonctions.convertirMesure(occ.obtenirSuperficie(), 'm²', 'km²').toFixed(2);
                            occ.proprietes.SuperficieMile = Fonctions.convertirMesure(occ.obtenirSuperficie(), 'm²', 'mile²').toFixed(2);
                            occ.proprietes.SuperficieAcre = Fonctions.convertirMesure(occ.obtenirSuperficie(), 'm²', 'acre').toFixed(2);
                            occ.proprietes.SuperficieHectare = Fonctions.convertirMesure(occ.obtenirSuperficie(), 'm²', 'hectare').toFixed(2);
                            occ.proprietes.SuperficiePied = Fonctions.convertirMesure(occ.obtenirSuperficie(), 'm²', 'pied²').toFixed(2);
                            occ.proprietes.Perimetre = occ.obtenirPerimetre().toFixed(2);
                            occ.definirProprietes(occ.proprietes);
                        }
                        return occ.obtenirSuperficie().toFixed(2);
                    }
                    else 
                        return "";
                },
                taille: function(){
                    scale = Math.round(Aide.obtenirNavigateur().carte.obtenirEchelle());

                    if(scale>=40000){
                        return "12px";
                    } else if(scale >= 20000){
                         return "10px";    
                    } else if(scale >= 10000){
                         return "8px";
                    } else if (scale >= 2500) {
                        return "16px";
                    } else {
                        return "26px";
                    }
                }
            }
        };
        
        this.coucheEditionPolygone.definirStyle(styleCouche);
        this.coucheEditionLigne.definirStyle(styleCouche);
                             
        this.coucheEditionPolygone.controles = new Vecteur.Controles(this.coucheEditionPolygone);
        this.coucheEditionPolygone.controles.activerSelection();
        
        this.coucheEditionLigne.controles = new Vecteur.Controles(this.coucheEditionLigne);
        this.coucheEditionLigne.controles.activerSelection();
        
        this.coucheEditionPolygone.ajouterDeclencheur("mesurePartielle", this.gererMesure.bind(this));
        this.coucheEditionLigne.ajouterDeclencheur("mesurePartielle", this.gererMesure.bind(this));
    };
    
    /**
     * Méthode pour ajouter des occurences dans la couche associée au panneau
     * @method
     * @name PanneauMesure#ajouterOccurences
     */    
    PanneauMesure.prototype.ajouterOccurences = function() {     
        this.coucheEdition.ajouterOccurences(this.occurences);     
    };          
    
    /**
     * Gérer l'affichage des mesures lors du dessin
     * @method
     * @param {object} elem Objet contenant type: 'mesurePartielle', occurence: occ evenement: e en provenance de l'évênement measurepartial de carte.js
     * @returns {undefined}
     */
    PanneauMesure.prototype.gererMesure = function(elem){
      if(this.om && this.typeGeometriePermise !== "Point"){
        this.om.afficherFenetre();
        this.om.mesureSelection(elem);
        var tailleEcran = $(window).width();
        var tailleFenetreOM = this.om.obtenirFenetre().width;
        var positionOM = tailleEcran-tailleFenetreOM-5;
        this.om.positionnerFenetre(positionOM, 25);
      }      
    };
    
    return PanneauMesure;
});