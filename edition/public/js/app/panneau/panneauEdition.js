/* global this */

require.ajouterConfig({
    paths: {
        'editionService': '[edition]/public/js/app/service/service'
    }
});

/** 
 * Module pour l'objet {@link Panneau.PanneauEdition}.
 * @module PanneauEdition
 * @requires panneau
 * @author Michael Lane FADQ
 * @version 1.0
 */

define(['aide', 'panneauTable', 'vecteur', 'evenement', 'editionService'], function(Aide, PanneauTable, Vecteur, Evenement, Service) {
    
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
        this.service = options.service;
        this.occurences = options.donnees;
        this.colonnes = this.traiterColonnes(options.colonnes);
        this.fkId = options.fkId || undefined;
        this.fermable = options.fermable;        
        this.couchesAssoc = options.couchesAssoc;
        this.etiquette = options.etiquette;
       
        var navigateur = Aide.obtenirNavigateur();
        var projection = navigateur.carte.obtenirProjection();
        this.serviceEdition = new Service({projectionCarte:projection, url: Aide.utiliserBaseUri("[edition]/app/")}); 
        
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
        this.activerCouchesAssoc();
        
        this.panneauTable = new PanneauTable({titre: this.titre, vecteur: this.coucheEdition, reductible: false, fermable: this.fermable, activerEdition : true});
        
        this.panneauTable.avantFermeture = this.avantFermeture.bind(this);
        this.panneauTable.contexte = this;
        
        this.panneauOngletEdition = navigateur.obtenirPanneauParId('edition-panneau', -1);
        this.panneauOngletEdition.ajouterPanneau(this.panneauTable);
    };

    PanneauEdition.prototype = new Evenement();
    PanneauEdition.prototype.constructor = PanneauEdition;
    
    PanneauEdition.prototype._init = function() {      
        return true;
    };
    
    /**
     * Méthode retournant l'objet Extjs représentant le panneau d'édition
     * @method
     * @private
     * @name PanneauEdition#_getPanel
     * @returns {object} Objet Extjs du panneau
     */    
    PanneauEdition.prototype._getPanel = function(){     
        return this.panneauTable._panel;  
    };
    
    /**
     * Méthode pour créer le template au niveau de la couche associé au panneau
     * @method
     * @name PanneauEdition#creerTemplate
     */
    PanneauEdition.prototype.creerTemplate = function() {
        this.coucheEdition.templates = {table:{colonnes: this.colonnes}};
    };

    /**
     * Méthode pour créer le vecteur à associer au panneau
     * @method
     * @name PanneauEdition#creerVecteur
     */
    PanneauEdition.prototype.creerVecteur = function(){
        var that = this;
        
        this.coucheEdition = new Vecteur({titre: this.titre, id:"couche" + this.titre, editable:true, typeGeometriePermise: this.typeGeometriePermise, active:true, visible:true, fnSauvegarder: this.sauvegarder.bind(this), garderHistorique:true });
        Aide.obtenirNavigateur().carte.gestionCouches.ajouterCouche(this.coucheEdition);
        //this.coucheEdition.controles.activerSelection();
        
        //Définir le champ d'étiquette si une valeur définie ou sinon à ""
        this.coucheEdition.definirStyle({etiquette: "${label}", etiquetteTaille: "${taille}",limiteEpaisseur:3, 
                                         couleur: '#660033', limiteCouleur: '#660033', opacite: 0.5,
            contexte: {label:
                function(occ){
                    if(!occ){
                        return "";
                    }
                    return occ.obtenirPropriete(that.etiquette) || "";
                },
                taille: function(){
                    scale = Math.round(Aide.obtenirNavigateur().carte.obtenirEchelle());

                   if(scale>=50000){
                       return "0px";
                   } else if(scale >= 20000){
                        return "8px";
                   } else if (scale >= 5000) {
                       return "16px";
                   } else if(scale >= 2500) {
                       return "36px";
                   }else {
                       return "56px";
                   }
                }
            }
        });
        
        this.coucheEdition.controles = new Vecteur.Controles(this.coucheEdition);
        this.coucheEdition.controles.activerSelection();
    };
    
    /**
     * Méthode pour ajouter des occurences dans la couche associée au panneau
     * @method
     * @name PanneauEdition#ajouterOccurences
     */    
    PanneauEdition.prototype.ajouterOccurences = function() {     
        this.coucheEdition.ajouterOccurences(this.occurences);       
    };
    
    /**
     * Méthode pour accepter les modification des occurences dans la couche associée au panneau
     * @method
     * @name PanneauEdition#accepterModificationsVecteur
     */     
    PanneauEdition.prototype.accepterModificationsVecteur = function() {     
        this.coucheEdition.accepterModifications(true);
        
        if(this.panneauTable){
            this.panneauTable.rafraichir();
        }      
    };
    
    /**
     * Méthode appellée pour sauvegarder les ajouts/modifications/suppressions
     * @method
     * @name PanneauEdition#sauvegarder
     * @param {object} vecteur Vecteur de la couche à sauvegarder
     */      
    PanneauEdition.prototype.sauvegarder = function(vecteur){       
        if(vecteur === undefined){
            vecteur = this.coucheEdition;
        }
                    
        var that = this;        
        var elemModif = vecteur.obtenirOccurencesModifiees(); 
        var elemSupp = vecteur.obtenirOccurencesEnlevees();
        var elemAjout = vecteur.obtenirOccurencesAjoutees();                    

        if(elemModif.length > 0 || elemSupp.length > 0 || elemAjout.length > 0) {
            that.serviceEdition.transaction(that.service, elemAjout, elemModif, elemSupp, that.fkId, that.succesSauvegarde.bind(that), that.erreurSauvegarde.bind(that));
        }
        else{           
            Aide.afficherMessage("Message", "Aucun enregistrement à effectuer.", "OK", "MESSAGE"); 
            return true;
        }      
    };
 
    /**
     * Méthode appellée par le succès de l'appel ajax de la sauvegarde
     * @method
     * @name PanneauEdition#succesSauvegarde
     * @param {object} data Données retournée par le succès de le l'appel ajax
     */  
    PanneauEdition.prototype.succesSauvegarde = function(data){                 
        if(data.result === "failure"){
            
            //Si des données de la BD ont été mises à jour pour aider à l'erreur
            if(data.features){
                this.panneauTable.mettreAJourDonnees(data.features, "no_seq");
            }
            
            this.panneauTable.ajouterErreurs(data.errors, "proprietes");
             Aide.afficherMessage("Message", "Erreur lors de la sauvegarde, voir message dans la grille pour plus de détails.", "OK", "MESSAGE");
            return false;
        }
        else{
            
            this.panneauTable.retirerErreurs();
            
            console.log("Succès de la sauvegarde lors de l'édition de géométrie");
  
            this.panneauTable.mettreAJourDonnees(data.features, "no_seq");           
            this.accepterModificationsVecteur();   
            Aide.afficherMessage("Message", "Enregistrement effectué avec succès.", "OK", "MESSAGE");
            return true;
        }
    };
    
    /**
     * Méthode appellée par l'échec de l'appel ajax de la sauvegarde
     * @method
     * @name PanneauEdition#erreurSauvegarde
     * @param {integer} status Status HTTP
     * @param {string} erreur Erreur retournée
     * @param {string} responseText Réponse en format texte
     */      
    PanneauEdition.prototype.erreurSauvegarde = function(status, erreur, responseText){
        console.log("Erreur de la sauvegarde lors de l'édition de géométrie");
        
        Aide.afficherMessage("Erreur", "Erreur lors de la sauvegarde de la transaction.", "OK", "ERREUR");
        return false;
    };    

    /**
     * Méthode de l'opération à affectuer avant la fermeture du panneau
     * @method
     * @name PanneauEdition#avantFermeture
     */  
    PanneauEdition.prototype.avantFermeture = function(){       
        PanneauTable.prototype.avantFermeture.call(this.panneauTable);

        this.coucheEdition.enlever();
    };
    
    /**
     * Méthode retournant un bool indiquant si des changements ne sont pas enregistrés
     * @method
     * @name PanneauEdition#estChange
     * @returns {Boolean} true Si des changements sont non enregistrés, sinon false
     */
    PanneauEdition.prototype.estChange = function(){      
        vecteur = this.coucheEdition;
        
        if(vecteur === undefined)
            return false;
        
        var elemModif = vecteur.obtenirOccurencesModifiees(); 
        var elemSupp = vecteur.obtenirOccurencesEnlevees();
        var elemAjout = vecteur.obtenirOccurencesAjoutees();
        
        if(elemModif.length > 0 || elemSupp.length > 0 || elemAjout.length > 0) {
            return true;
        } else {
            return false;
        }   
    };
    
    /**
     * Fermer le panneau
     * @method
     * @name PanneauEdition#fermerPanneau
     */
    PanneauEdition.prototype.fermerPanneau = function(){
        this.avantFermeture();
        this.desactiverCoucheAssoc();
        this.panneauOngletEdition.enleverPanneau(this);
    };
    
    /**
     * Réinitialiser les changements faits
     * @method
     * @name PanneauEdition#reinitialiser
     */
    PanneauEdition.prototype.reinitialiser = function(){     
        if(this._getPanel().store !== null) {
            this._getPanel().store.rejectChanges();
        }
        
        this.coucheEdition.annulerModifications();       
    };
    
    /**
     * 
     * @param {type} donnees
     * @returns {undefined}Traiter les colonnes selon les données reçues
     * @method
     * @name PanneauEdition#traiterColonnes
     */
    PanneauEdition.prototype.traiterColonnes = function(donnees) {        
        var that = this;
        
        $.each(donnees, function(index, colonne) {
            if(colonne.editable !== undefined && colonne.editable === false){
                colonne.rendu = that._afficherCellStyleInactif;
           }            
        });
        
        return donnees;
    };
    
    /**
     * Ajouter le style à la colonne pour qu'elle ait l'apparence d'inactive
     * @method
     * @private
     * @name PanneauEdition#_afficherCellStyleInactif
     * @param {type} currentCellValue cellule active Géré par le renderer
     * @param {type} metadata Données de la cellule Géré par le renderer
     * @returns {object} Cellule
     */
    PanneauEdition.prototype._afficherCellStyleInactif = function(currentCellValue, metadata){
        //Ce css se retrouve dans la feuille de style de la FADQ StyleFadq.css
        metadata.css = "GridCellInactif";

        return currentCellValue;
    };
    
    /**
     * Activer les couches WMS associées
     * @method
     * @name PanneauEdition#activerCouchesAssoc
     */
    PanneauEdition.prototype.activerCouchesAssoc = function(){
        
        if(this.couchesAssoc!== undefined) {
            for(var index = 0; index < this.couchesAssoc.length; index++){
                var couche = Aide.obtenirNavigateur().carte.gestionCouches.obtenirCouchesParTitre(this.couchesAssoc[index])[0];

                if(couche !== undefined){
                    couche.activer();                   
                }
            }
        }
    };
    
    /**
     * Désactiver les couches WMS associées
     * @method
     * @name PanneauEdition#desactiverCoucheAssoc
     */    
    PanneauEdition.prototype.desactiverCoucheAssoc = function(){
        for(var index = 0; index < this.couchesAssoc.length; index++){
            var couche = this.carte.gestionCouches.obtenirCouchesParTitre(this.couchesAssoc[index])[0];

            if(couche !== undefined){
                couche.desactiver();                   
            }
        }     
    };   
    
    return PanneauEdition;
});