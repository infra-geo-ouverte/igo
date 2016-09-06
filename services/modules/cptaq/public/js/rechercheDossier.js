/** 
 * Module pour l'objet {@link Panneau.RechercheDossier}.
 * @module RechercheDossier
 * @author Karl Gingras CPTAQ basé sur RechercheCadastreReno de Michael Lane, FADQ
 * @version 1.0
 * @requires recherche, limites, point, vecteur, style
 */

define(['limites', 'point', 'polygone', 'marqueurs', 'occurence', 'vecteur', 'style', 'recherche', 'aide'], function(Limites, Point, Polygone, Marqueurs, Occurence, Vecteur, Style, Recherche, Aide) {

   /** 
   * Création de l'object Panneau.RechercheDossier.
   * Objet à ajouter à un objet localisation.
   * @constructor
   * @name Panneau.RechercheDossier
   * @class Panneau.RechercheDossier
   * @alias RechercheDossier:Panneau.RechercheDossier
   * @extends Recherche
   * @requires recherche, limites, point, vecteur, style
   * @param {object} [options] Objet contenant les propriétés du panneau
   * @returns {Panneau.RechercheDossier} Instance de {@link Panneau.RechercheDossier}
  */
    
    function RechercheDossier(options){
        this.options = options || {};
        this.options.id = "RechercheDossier";
        this.options.typeRecherche = "RechercheDossier";
        this.defautOptions = $.extend({}, this.defautOptions, {
            titre: "Dossier"
        });
        this.defautOptions = $.extend({}, Aide.obtenirConfig('RechercheDossier'), this.defautOptions);
    };

    RechercheDossier.prototype = new Recherche();
    RechercheDossier.prototype.constructor = RechercheDossier;
    
    RechercheDossier.prototype.obtenirElementsRecherche = function() {
        var textField = Recherche.prototype.obtenirElementsRecherche.call(this);
        textField[0].maskRe = /[0-9.]/;
        return textField;
    }

    RechercheDossier.prototype.obtenirEpingleCheckbox = function() {
        var pineCheckbox = Recherche.prototype.obtenirEpingleCheckbox.call(this);
        pineCheckbox.boxLabel =  "Afficher la sélection";
        return pineCheckbox;
    }    
    
    RechercheDossier.prototype.obtenirSauvegarderCheckbox = function() {
        var saveCheckbox = Recherche.prototype.obtenirSauvegarderCheckbox.call(this);
        saveCheckbox.hidden = true;
        return saveCheckbox;
    }    
        
    /**
    * Appeler le service de la recherche par Dossier
    * @method
    * @name RechercheDossier#appelerService
    */
   
    RechercheDossier.prototype.appelerService = function(){
      
        //Obtenir les valeurs saisies par l'usager
        var tabValeursRecherche = this.obtenirValeursRecherche();    
        
        var that = this;
        var numDossier = tabValeursRecherche["RechercheTitle" + this.options.id].replace(/ /g,'');
        
        if(!numDossier){
            Aide.afficherMessage({titre: "Recherche", message:'Vous devez saisir un dossier'});
            return false;
        }
        
        codeEPSG = this.carte.obtenirProjection();
        page = this.options.url;

        //Ajouter les paramètres
        var url = page;
        url += "?numero=" + numDossier;
        url += "&epsg=" + codeEPSG.substr(5); //retirer le EPSG:
        //Effectuer l'appel du service et passer la fonction de callback
    //    OpenLayers.loadURL(url, null, null, this.AfficherDossier);      
        console.log(url);
        Ext.Ajax.request({
            url : url,
            method: 'GET',
            success: function ( result, request ) {

                that.AfficherDossier(result);
            },
            failure: function ( result, request ) {

                that.afficherMessageErreur();
            }
       });
    };

    /**
    * Afficher les informations retourné par le service
    * @method
    * @name RechercheDossier#AfficherDossier
    */
    
    RechercheDossier.prototype.AfficherDossier = function(response){
//         console.log(response);
         var vecteur = this.carte.gestionCouches.obtenirCouchesParTitre('Dossier sélectionné')[0];
         
         if(vecteur === undefined){
            var style = new Style({               
                couleur:'#00FFFF', 
                limiteCouleur: '#00FFFF',
                opacite:0.05,
                limiteEpaisseur: 5,
                titre:'Entité sélectionée',
            });
            
            var vecteur = new Vecteur({active: true, titre:'Dossier sélectionné',styles:{defaut:style}});  
            this.carte.gestionCouches.ajouterCouche(vecteur);
            
        }
        else{
              vecteur.enleverTout();
        }

        //Valeurs séparées seulement par  ZZZ
        var arrayInfo = response.responseText.split("ZZZ"); 

        if( arrayInfo.length < 2)
        {
            this.traiterResultatVecteur(vecteur, response.nombreResultat);
            Aide.afficherMessage({titre: "Message", message:'Aucune donnée trouvée'});
            return false;
        }

        //Boucle à travers valeurs séparées seulement par un point virgule
        for (var i = 0; i < arrayInfo.length - 1; i++){
             var Tabinfos = arrayInfo[i].split(";");
            //Définir les données séparément
            var numDossier = Tabinfos[0].trim();
            var xmin = parseFloat(Tabinfos[1]);
            var ymin = parseFloat(Tabinfos[2]);
            var xmax = parseFloat(Tabinfos[3]);
            var ymax = parseFloat(Tabinfos[4]);
            var pointx = parseFloat(Tabinfos[5]);
            var pointy = parseFloat(Tabinfos[6]);
            var projection = parseFloat(Tabinfos[7]); 
            var resultat = Tabinfos[8]; 
            var geom = Tabinfos[9]; 

            var wkt = new OpenLayers.Format.WKT();
            var featureOL = wkt.read(geom);          
            var occurences = new Occurence(featureOL.geometry,{numDossier: numDossier,valeur: numDossier + "  " + resultat});
            vecteur.creerOccurence(occurences);
         
        }

        vecteur.zoomerOccurences();
        this.traiterResultatVecteur(vecteur, response.nombreResultat);
        
    };
        
    /**
    * Obtenir le message d'aide.
    * @method
    * @name RechercheDossier#obtenirAideHTML
    * @returns {String} Message d'aide
    */
   
    RechercheDossier.prototype.obtenirAideHTML = function() {
        return  "Inscire un numéro de dossier.";
    };
        
    /**
    * Afficher le message d'erreur
    * @todo Lier à une classe de gestion des messages
    * @method
    * @name RechercheDossier#afficherMessageErreur
    */
     
    RechercheDossier.prototype.afficherMessageErreur = function()
    {
        Aide.afficherMessage({titre: "Message", message:'Un problème est survenu lors de la requête.'});
    };
    
    
     RechercheDossier.prototype.traiterResultatVecteur = function(vecteur, nombreResultats) {
        nombreResultats = nombreResultats || vecteur.listeOccurences.length ;
            
        var resultat = this.ajouterPagination(nombreResultats);
        var debut = this.indexDebut+1;
        var fin = this.indexDebut+vecteur.listeOccurences.length;
        if(fin === 0){
            this.definirResultat('Aucun résultat');
            return false;
        }
        
        var title = "";
        var couleur = "blue"; //411476 407845
        
        resultat += "<h4><u>Résultats (" + debut + " - " + fin + ")</u></h4>";
        $.each(vecteur.listeOccurences, function(row, occurence) {
            resultat += "<li data-id='" + occurence.id + 
                    "' class='rechercheResultatsListe'><font color='"+couleur+"' title='"+title+"'><b>» </b><u>" + 
                    occurence.obtenirPropriete("valeur")+"</u></font>      " +
                    "<a href=http://www.cptaq.gouv.qc.ca/index.php?id=198&action=rechercher&requete=" + 
                    occurence.obtenirPropriete('numDossier') + " target=_blank><img src=" + Aide.obtenirCheminRacine()+"images/toolbar/pdf_icon.gif></a></li>" ;    
        });
        this.vecteur = vecteur;
        this.definirResultat(resultat, this.initEventResultat, this);
//        Recherche.prototype.traiterResultatVecteur.call(this, vecteur);
    };

    return RechercheDossier;
    
});/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


