/** 
 * Module pour l'objet {@link Panneau.RechercheMatricule}.
 * @module RechercheMatricule
 * @author Karl Gingras CPTAQ basé sur RechercheCadastreReno de Michael Lane, FADQ
 * @version 1.0
 * @requires recherche, limites, point, vecteur, style
 */

define(['limites', 'point', 'marqueurs', 'style', 'recherche','aide'], function(Limites, Point, Marqueurs, Style, Recherche, Aide) {

   /** 
   * Création de l'object Panneau.RechercheMatricule.
   * Objet à ajouter à un objet localisation.
   * @constructor
   * @name Panneau.RechercheMatricule
   * @class Panneau.RechercheMatricule
   * @alias RechercheMatricule:Panneau.RechercheMatricule
   * @extends Recherche
   * @requires recherche, limites, point, vecteur, style
   * @param {object} [options] Objet contenant les propriétés du panneau
   * @returns {Panneau.RechercheMatricule} Instance de {@link Panneau.RechercheMatricule}
  */
    
    function RechercheMatricule(options){
        this.options = options || {};
        this.options.id = "RechercheMatricule";
        this.options.typeRecherche = "RechercheMatricule";
        this.defautOptions = $.extend({}, this.defautOptions, {
            titre: "Matricule"
        });
        this.defautOptions = $.extend({}, Aide.obtenirConfig('RechercheMatricule'), this.defautOptions);
    };

    RechercheMatricule.prototype = new Recherche();
    RechercheMatricule.prototype.constructor = RechercheMatricule;
    
    RechercheMatricule.prototype.obtenirElementsRecherche = function() {
        var that = this;
        return [{
            xtype: 'textfield',  
            enforceMaxLength:true,   //Activer le maximum de caractère 
            maxLength: 18,           //Maximum de caractères
            maskRe:/[0-9.]/,         //Autoriser les chiffres seulement
            fieldLabel: 'Texte',
            hideLabel: true,
            width: 200,
            id: 'RechercheTitle' + this.options.id,
            allowBlank: false,
            blankText: 'Vous devez saisir au moins 1 chiffre...',
            enableKeyEvents: true,
            scope: this,
            listeners: {
                keyup: function(field, e) {
                    var key = e.getKey();
                    if (key == 13) {
                        that.lancerRecherche();
                    } 
                }
            }
        }];
    };
     
    /**
    * Appeler le service de la recherche par Matricule
    * @method
    * @name RechercheMatricule#appelerService
    */
   
    RechercheMatricule.prototype.appelerService = function(){
      
        //Obtenir les valeurs saisies par l'usager
        var tabValeursRecherche = this.obtenirValeursRecherche();    
        
        var that = this;
        var numMatricule = tabValeursRecherche["RechercheTitle" + this.options.id].replace(/ /g,'');
        
        if(!numMatricule){
            Aide.afficherMessage({titre: "Recherche", message:'Vous devez saisir un matricule22'});
            return false;
        }
        
        var codeEPSG = this.carte.obtenirProjection();
        page = this.options.url;

        //Ajouter les paramètres
        var url = page;
        url += "?numero=" + numMatricule;
        url += "&epsg=" + codeEPSG.substr(5); //retirer le EPSG:
        //Effectuer l'appel du service et passer la fonction de callback
    //    OpenLayers.loadURL(url, null, null, this.AfficherMatricule);      
    
        Ext.Ajax.request({
            url : url,
            method: 'GET',
            success: function ( result, request ) {

                that.AfficherMatricule(result);
            },
            failure: function ( result, request ) {

                that.afficherMessageErreur();
            }
       });
    };

    /**
    * Afficher les informations retourné par le service
    * @method
    * @name RechercheMatricule#AfficherMatricule
    */
    
    RechercheMatricule.prototype.AfficherMatricule = function(response){
         
        //Valeurs séparées seulement par un point virgule
        var Tabinfos = response.responseText.split(";"); 
        
        //Définir les données séparément
        var numMatricule = Tabinfos[0];
        //var xmin = parseFloat(Tabinfos[1]);
        //var ymin = parseFloat(Tabinfos[2]);
       //var xmax = parseFloat(Tabinfos[3]);
        //var ymax = parseFloat(Tabinfos[4]);
        var pointx = parseFloat(Tabinfos[1]);
        var pointy = parseFloat(Tabinfos[2]);
        var projection = parseFloat(Tabinfos[3]); 

        //TODO à vérifier pourquoi le message ne s'affiche pas
        //Si aucun point n'est retourné
        if(isNaN(pointx) || isNaN(pointy))
        {
            this.afficherMessageErreur();
            return false;
        }
        
        if(this.vecteur === undefined){
            this.creerCoucheVecteur();
        }
        else{
            this.vecteur.enleverMarqueurs();
        }
        
        point = new Point(pointx, pointy);

        this.vecteur.ajouterMarqueur(point);
        //this.vecteur.ajouterMarqueur(point, null, numMatricule);
         
        this.vecteur.zoomerMarqueurs();
         
        var couche = this.carte.gestionCouches.obtenirCouchesParTitre("Cadastre rénové - bas niveau")[0];

        if(couche !== undefined){
            couche.activer();                   
        }
         

    };
        
    /**
    * Obtenir le message d'aide.
    * @method
    * @name RechercheMatricule#obtenirAideHTML
    * @returns {String} Message d'aide
    */
   
    RechercheMatricule.prototype.obtenirAideHTML = function() {
        return  "Inscire un matricule. \n\
                 <BR><BR> Le numéro saisi sera complété par des 0 jusqu'à concurrence de 18 chiffres.";
    };
        
    /**
    * Afficher le message d'erreur
    * @todo Lier à une classe de gestion des messages
    * @method
    * @name RechercheMatricule#afficherMessageErreur
    */
     
    RechercheMatricule.prototype.afficherMessageErreur = function()
    {
        Aide.afficherMessage({titre: "Message", message:'Aucune donnée trouvée'});
    };
    
        /** 
     * Initialisation de la couche vecteur mais en couche Marquers.
     * @method 
     * @name Recherche#_creerCoucheVecteur
    */
    RechercheMatricule.prototype.creerCoucheVecteur = function(){
        this.vecteur = new Marqueurs({nom:'couche'+this.typeRecherche, displayInLayerSwitcher:false, visible:false});
        this.carte.gestionCouches.ajouterCouche(this.vecteur);
        if (!this.pineCheckbox || this.pineCheckbox.checked){
            this.vecteur.activer();
        }
    };
     
    return RechercheMatricule;
    
});/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


