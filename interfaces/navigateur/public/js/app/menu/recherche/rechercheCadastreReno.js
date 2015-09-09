/** 
 * Module pour l'objet {@link Panneau.RechercheCadastreReno}.
 * @module RechercheCadastreReno
 * @author Michael Lane, FADQ
 * @version 1.0
 * @requires recherche, limites, point, vecteur, style
 */

define(['limites', 'point', 'marqueurs', 'style', 'recherche','aide'], function(Limites, Point, Marqueurs, Style, Recherche, Aide) {

   /** 
   * Création de l'object Panneau.RechercheCadastreReno.
   * Objet à ajouter à un objet localisation.
   * @constructor
   * @name Panneau.RechercheCadastreReno
   * @class Panneau.RechercheCadastreReno
   * @alias rechercheAdresse:Panneau.RechercheCadastreReno
   * @extends Recherche
   * @requires recherche, limites, point, vecteur, style
   * @param {object} [options] Objet contenant les propriétés du panneau
   * @returns {Panneau.RechercheCadastreReno} Instance de {@link Panneau.RechercheCadastreReno}
  */
    
    function RechercheCadastreReno(options){
        this.options = options || {};
        this.options.id = "RechercheCadastreReno";
        this.options.typeRecherche = "cadastreReno";
        this.defautOptions = $.extend({}, this.defautOptions, {
            titre: "Cadastre rénové"
            
        });
        this.defautOptions = $.extend({}, Aide.obtenirConfig('RechercheCadastreReno'), this.defautOptions);
    };

    RechercheCadastreReno.prototype = new Recherche();
    RechercheCadastreReno.prototype.constructor = RechercheCadastreReno;
     
    /**
    * Appeler le service de la recherche Cadastre rénové
    * @method
    * @name RechercheCadastreReno#appelerService
    */
   
    RechercheCadastreReno.prototype.appelerService = function(){
      
        //Obtenir les valeurs saisies par l'usager
        var tabValeursRecherche = this.obtenirValeursRecherche();    
        
        var that = this;
        var numCadastre = tabValeursRecherche["RechercheTitle" + this.options.id].replace(/ /g,'');
        
        if(!numCadastre){
            Aide.afficherMessage({titre: "Recherche", message:'Vous devez saisir un cadastre rénové'});
            return false;
        }
        
        var codeEPSG = this.carte.obtenirProjection();
        page = this.options.url;

        //Ajouter les paramètres
        var url = page;
        url += "?numero=" + numCadastre;
        url += "&epsg=" + codeEPSG.substr(5); //retirer le EPSG:

        //Effectuer l'appel du service et passer la fonction de callback
    //    OpenLayers.loadURL(url, null, null, this.AfficherCadastreReno);      
    
        Ext.Ajax.request({
            url : url,
            method: 'GET',
            success: function ( result, request ) {

                that.AfficherCadastreReno(result);
            },
            failure: function ( result, request ) {

                that.afficherMessageErreur();
            }
       });
    };

    /**
    * Afficher les informations retourné par le service
    * @method
    * @name RechercheCadastreReno#AfficherCadastreReno
    */
    
    RechercheCadastreReno.prototype.AfficherCadastreReno = function(response){

        //Valeurs séparées seulement par un point virgule
        var Tabinfos = response.responseText.split(";"); 
        
        //Définir les données séparément
        var numCadastre = Tabinfos[0];
        var xmin = parseFloat(Tabinfos[1]);
        var ymin = parseFloat(Tabinfos[2]);
        var xmax = parseFloat(Tabinfos[3]);
        var ymax = parseFloat(Tabinfos[4]);
        var pointx = parseFloat(Tabinfos[5]);
        var pointy = parseFloat(Tabinfos[6]);
        var projection = parseFloat(Tabinfos[7]); 


        //TODO à vérifier pourquoi le message ne s'affiche pas
        //Si aucun point n'est retourné
        if(isNaN(xmin) || isNaN(ymin))
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
        //this.vecteur.ajouterMarqueur(point, null, numCadastre);
         
        this.vecteur.zoomerMarqueurs();
         
        var couche = this.carte.gestionCouches.obtenirCouchesParTitre("Cadastre rénové - bas niveau")[0];

        if(couche !== undefined){
            couche.activer();                   
        }
         

    };
        
    /**
    * Obtenir le message d'aide.
    * @method
    * @name RechercheCadastreReno#obtenirAideHTML
    * @returns {String} Message d'aide
    */
   
    RechercheCadastreReno.prototype.obtenirAideHTML = function() {
        return  "Fournir un numéro de cadastre rénové";
    };
        
    /**
    * Afficher le message d'erreur
    * @todo Lier à une classe de gestion des messages
    * @method
    * @name RechercheCadastreReno#afficherMessageErreur
    */
     
    RechercheCadastreReno.prototype.afficherMessageErreur = function()
    {
        Aide.afficherMessage({titre: "Message", message:'Aucune donnée trouvée'});
    };
    
        /** 
     * Initialisation de la couche vecteur mais en couche Marquers.
     * @method 
     * @name Recherche#_creerCoucheVecteur
    */
    RechercheCadastreReno.prototype.creerCoucheVecteur = function(){
        this.vecteur = new Marqueurs({nom:'couche'+this.typeRecherche, displayInLayerSwitcher:false, visible:false});
        this.carte.gestionCouches.ajouterCouche(this.vecteur);
        if (!this.pineCheckbox || this.pineCheckbox.checked){
            this.vecteur.activer();
        }
    };
     
    return RechercheCadastreReno;
    
});