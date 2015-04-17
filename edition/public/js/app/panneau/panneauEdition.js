require.ajouterConfig({
    paths: {
        'service': '../igo/edition/public/js/app/service/service',
    }
});

/** 
 * Module pour l'objet {@link Panneau.PanneauEdition}.
 * @module PanneauEdition
 * @requires panneau
 * @author Michael Lane FADQ
 * @version 1.0
 */

define(['panneauTable', 'vecteur', 'evenement', 'service'], function(PanneauTable, Vecteur, Evenement, Service) {
    
    /** 
    * Création de l'object Panneau.PanneauEdition.
    * Pour la liste complète des paramètres, voir {@link Panneau}
    * @constructor
    * @name Panneau.PanneauEdition
    * @class Panneau.PanneauEdition
    * @alias PanneauEdition:panneau.PanneauEdition
    * @extends Panneau
    * @requires panneau
    * @param {object} [options] Objet contenant les propriétés du panneau
    * @returns {Panneau.PanneauEdition} Instance de {@link Panneau.PanneauEdition}
   */    
       
    function PanneauEdition(options){
        this._toolbar;
        this.options = options || {};
        this.titre = options.titre;
        this.occurences = options.donnees;
        this.colonnes = options.colonnes;
        
        var navigateur = Igo.Aide.obtenirNavigateur();
        var projection = navigateur.carte.obtenirProjection();
        //this.serviceEdition = new Service({projectionCarte:projection, url:Igo.Aide.obtenirCheminRacine() + "edition/app/"}); 
        this.serviceEdition = new Service({projectionCarte:projection, url:"/igo/edition/app/"}); 
        
        if(options.typeGeom === "point")
            this.typeGeometriePermise = "Point";
        else if(options.typeGeom === "LineString")
            this.typeGeometriePermise = "Ligne";
        else if(options.typeGeom === "polygon")
            this.typeGeometriePermise = "Polygone";
        else
            this.typeGeometriePermise = "Point";
        
        
        this.creerVecteur();
        this.creerTemplate();
        this.ajouterOccurences();
        this.accepterModificationsVecteur();
        
        this.panneauTable = new PanneauTable({titre: this.titre, vecteur: this.coucheEdition, reductible: false, fermable: true, activerEdition : true});
        
        //Igo.nav.obtenirPanneauxParType("PanneauAccordeon")[0].listePanneaux[1].ajouterPanneau(this.panneauTable);
        var panneauOngletEdition = Igo.nav.obtenirPanneauParId('edition-panneau', -1);
        panneauOngletEdition.ajouterPanneau(this.panneauTable);
    };

    PanneauEdition.prototype = new Evenement();
    PanneauEdition.prototype.constructor = PanneauEdition;
    
    PanneauEdition.prototype._init = function() {
      
        return true;
    };
    
    PanneauEdition.prototype._getPanel = function(){
      
        this.panneauTable._panel;  
    };
    
    PanneauEdition.prototype.creerTemplate = function() {
        this.coucheEdition.templates = {table:{colonnes: this.colonnes}};
    };

    PanneauEdition.prototype.creerVecteur = function(){
        
        this.coucheEdition = new Vecteur({titre: this.titre, id:"couche" + this.titre, editable:true, typeGeometriePermise: this.typeGeometriePermise, active:true, visible:true, fnSauvegarder: this.sauvegarder.bind(this), garderHistorique:true });
        Igo.nav.carte.gestionCouches.ajouterCouche(this.coucheEdition);
    };
    
    PanneauEdition.prototype.ajouterOccurences = function() {
      
        this.coucheEdition.ajouterOccurences(this.occurences);
        
    };
    
    PanneauEdition.prototype.accepterModificationsVecteur = function() {
      
        this.coucheEdition.accepterModifications(true);
    };
    
    PanneauEdition.prototype.sauvegarder = function(vecteur){
        
        var that = this;
        
        var elemModif = vecteur.obtenirOccurencesModifiees();
        var elemSupp = vecteur.obtenirOccurencesEnlevees();
        var elemAjout = vecteur.obtenirOccurencesAjoutees();
        
        //ajax async: false,
        $.each(elemModif, function(key, occurrence){
            that.serviceEdition.modifierOccurence(that.titre, occurrence, that.succesModif.bind(that), that.erreurModif.bind(that));
        });
        
        $.each(elemSupp, function(key, occurrence){
            that.serviceEdition.supprimerOccurence(that.titre, occurrence, that.succesSupp.bind(that), that.erreurSupp.bind(that));
        });
        
        $.each(elemAjout, function(key, occurrence){
            that.serviceEdition.creerOccurence(that.titre, occurrence, that.succesAjout.bind(that), that.erreurAjout.bind(that));
        });
        
        
        if(true)
            return true;
        else
            return false;
    };
    
    
    PanneauEdition.prototype.succesModif = function(data){
        console.log("Success Modif");
    };
    
    PanneauEdition.prototype.succesSupp = function(data){
        console.log("Success Supp");
    };   
     
    PanneauEdition.prototype.succesAjout = function(data){
        console.log("Success Ajout");
    };
    
    PanneauEdition.prototype.erreurModif = function(data){
        console.log("Erreur Modif");
    };
    
    PanneauEdition.prototype.erreurSupp = function(data){
        console.log("Erreur Supp");
    };   
     
    PanneauEdition.prototype.erreurAjout = function(data){
        console.log("Erreur Ajout");
    };    
    
    
    return PanneauEdition;
});
