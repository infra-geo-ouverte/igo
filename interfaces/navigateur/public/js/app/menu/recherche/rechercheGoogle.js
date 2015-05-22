/** 
 * Module pour l'objet {@link Panneau.RechercheGoogle}.
 * @module rechercheGoogle
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires recherche
 */
define(['recherche', 'aide', 'point', 'style', 'limites'], function(Recherche, Aide, Point, Style, Limites) {
      /** 
     * Création de l'object Panneau.RechercheGoogle.
     * Objet à ajouter à un objet localisation.
     * @constructor
     * @name Panneau.RechercheGoogle
     * @class Panneau.RechercheGoogle
     * @alias rechercheGoogle:Panneau.RechercheGoogle
     * @extends Recherche
     * @requires rechercheGoogle
     * @param {string} [options.titre='Adr.'] Titre du panneau.
     * @returns {Panneau.RechercheGoogle} Instance de {@link Panneau.RechercheGoogle}
    */
    function RechercheGoogle(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            typeRecherche:"google",
            titre:"Google",
            service: "http://maps.googleapis.com/maps/api/geocode/json"
        });
    };

    RechercheGoogle.prototype = new Recherche();
    RechercheGoogle.prototype.constructor = RechercheGoogle;
    
     /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheGoogle#obtenirAideHTML
     * @returns {String} Aide
    */
    RechercheGoogle.prototype.obtenirAideHTML = function() {
        return  "<span style='color:red; font-size: 1.3em'>**ATTENTION**</span> <br>\n\
                Cette recherche d'adresse provient de Google Maps, \n\
                donc il n'utilise pas les données gouvernementales du Québec. \n\
                S'il y a une erreur dans cette localisation de Google Maps, \n\
                elle se situe dans les informations utilisées par Google. \n\
                Cette fonction est fournie en support, doit être utilisée avec \n\
                précaution et n'est pas un outil officiel en mesures d'urgence du MSP.";
    };


    RechercheGoogle.prototype.appelerService = function() {
        var texte = this.obtenirValeursRecherche()['RechercheTitle' + this.options.id];
        if(!texte){
            Aide.afficherMessage({titre: "Recherche", message:'Veillez entrer un texte à chercher'});
            return false;
        }
        Aide.afficherMessageChargement({message: 'Recherche en cours, patientez un moment...'});
        this.reinitialiserVecteur();

        $.ajax({
            url: Aide.utiliserProxy(this.options.service),
            data: {
                address: texte,
                sensor: false
                //todo: key
            },
            context: this,
            success: this.lireReponse,
            error: this.appelerServiceErreur
        }); 
    }
    
    RechercheGoogle.prototype.lireReponse = function(data, textStatus, jqXHR) {
        if(!jqXHR.responseJSON){
            this.definirResultat('Erreur lors de la recherche.');
            return false;
        }
        console.log(data);
        if(data.status !== "OK"){
            var erreur;
            if(data.status === "ZERO_RESULTS"){
                erreur = "Aucun résultat";
            } else {
                erreur = "Erreur lors de la recherche. <br>";
                erreur += data.status + ": " + data.error_message;
            }  
            this.definirResultat(erreur);
            return false;
        }
        
        var style = new Style({
            visible: true,
            icone: Aide.utiliserBaseUri('images/marqueur/marker-yellow.png'),
            iconeHauteur: 34,
            iconeLargeur: 20,
            iconeOffsetX: -10,
            iconeOffsetY: -34,
            filtres: [ {
                    filtre: "[geometry.location_type]=='APPROXIMATE'",
                    style: {icone: Aide.utiliserBaseUri('images/marqueur/marker-orange.png')}
                }, {
                    filtre: "[geometry.location_type]=='ROOFTOP'",
                    style: {icone: Aide.utiliserBaseUri('images/marqueur/marker-green.png')}
                }, {
                    style: {}
                }
            ]
        });

        var styles = {defaut: {visible: false}, select: style};

        var vecteur = this.creerVecteurRecherche(styles);
        $.each(data.results, function(key, value) {
            var x = value.geometry.location.lng;
            var y = value.geometry.location.lat;
            var point = new Point(x, y);
            var limites = new Limites(value.geometry.viewport.southwest.lng, value.geometry.viewport.southwest.lat, value.geometry.viewport.northeast.lng, value.geometry.viewport.northeast.lat);
            var projCarte = Aide.obtenirNavigateur().carte.obtenirProjection();
            point = point.projeter("EPSG:4326", projCarte);
            point.limites = limites.projeter("EPSG:4326", projCarte);
            vecteur.creerOccurence(point, value);
        });

        vecteur.templates.table = {
            colonnes: [{
                utiliserBase: false,
                titre: 'id',
                triable: true,
                propriete: 'id'
            }, { 
                titre: 'Adresse',
                triable: true,
                propriete: 'formatted_address'
            },{ 
                titre: 'Types',
                triable: true,
                propriete: 'types'
            }]
        };

        this.traiterResultatVecteur(vecteur); 
    };
    
    RechercheGoogle.prototype.traiterResultatVecteur = function(vecteur) {
        var nombreResultats = vecteur.listeOccurences.length ;
            
        var resultat = this.ajouterPagination(nombreResultats);
        var debut = this.indexDebut+1;
        var fin = this.indexDebut+vecteur.listeOccurences.length;
        if(fin === 0){
            this.definirResultat('Aucun résultat');
            return false;
        }
        resultat += "<h4><u>Résultats (" + debut + " - " + fin + ")</u></h4>";
        $.each(vecteur.listeOccurences, function(row, occurence) {
            var title = occurence.proprietes.formatted_address || '';
            var couleur = 'blue';        
            resultat += "<li data-id='" + occurence.id + 
                    "' class='rechercheResultatsListe'><font color='"+couleur+"'><b>» </b><u>" + 
                    title+"</u></font></li>";
        });
        this.vecteur = vecteur;
        this.definirResultat(resultat, this.initEventResultat, this);
        Recherche.prototype.traiterResultatVecteur.call(this, vecteur);
    };
    
    return RechercheGoogle;
    
});