/** 
 * Module pour l'objet {@link Panneau.RechercheAdresse}.
 * @module rechercheAdresse
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires recherche
 */
define(['recherche', 'aide', 'point', 'style', 'limites'], function(Recherche, Aide, Point, Style, Limites) {
      /** 
     * Création de l'object Panneau.RechercheAdresse.
     * Objet à ajouter à un objet localisation.
     * @constructor
     * @name Panneau.RechercheAdresse
     * @class Panneau.RechercheAdresse
     * @alias rechercheAdresse:Panneau.RechercheAdresse
     * @extends Recherche
     * @requires rechercheAdresse
     * @param {string} [options.titre='Adr.'] Titre du panneau.
     * @returns {Panneau.RechercheAdresse} Instance de {@link Panneau.RechercheAdresse}
    */
    function RechercheAdresse(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            typeRecherche:"adresse",
            titre:"Adr."
        });
    };

    RechercheAdresse.prototype = new Recherche();
    RechercheAdresse.prototype.constructor = RechercheAdresse;
    
     /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheAdresse#obtenirAideHTML
     * @returns {String} Aide
    */
    RechercheAdresse.prototype.obtenirAideHTML = function() {
        return  "Ex: <br>"+
                "->no. immeuble et nom de rue<br>"+
                "->no. immeuble et nom de rue et ville<br>"+
                "->nom de rue et ville<br>"+
                "->nom de rue + nom de rue, ville (intersection)<br>" +
                this.obtenirLienPDF() +
                this.obtenirCopyright();
    };

     /** 
     * Obtenir le droit d'auteur en format HTML
     * @method 
     * @name RechercheAdresse#obtenirCopyright
     * @returns {String} Droit d'auteur
    */
    RechercheAdresse.prototype.obtenirCopyright = function() {
        return  "<a href=\"http://adressesquebec.gouv.qc.ca/\" target=\"_blank\">"+
                "<img src=\"" + Aide.utiliserBaseUri("images/quebec/AQhorizontal-copyrightPetit.png") + "\" style='height:39px' alt=\"Adresse Québec\" ></img></a>";
    };
    
    
    RechercheAdresse.prototype.lireReponse = function(data, textStatus, jqXHR) {
        if(!jqXHR.responseJSON){
            this.definirResultat('Erreur lors de la recherche.');
            return false;
        }
        
        var responseJSON = jqXHR.responseJSON;

        var style = new Style({
            visible: true,
            icone: Aide.utiliserBaseUri('images/marqueur/marker-orange.png'),
            iconeHauteur: 34,
            iconeLargeur: 20,
            iconeOffsetX: -10,
            iconeOffsetY: -34,
            filtres: [ {
                    filtre: "[geocodeMatchCode]>0",
                    style: {icone: Aide.utiliserBaseUri('images/marqueur/marker-yellow.png')}
                }, {
                    filtre: "[geocodeMatchCode]==100",
                    style: {icone: Aide.utiliserBaseUri('images/marqueur/marker-green.png')}
                }, {
                    style: {}
                }
            ]
        });

        var survolStyle = style.cloner();
        survolStyle.definirPropriete('opacite', 0.8);

        var styles = {defaut: {visible: false}, select: style, survol: survolStyle};
        if(this.options.idResultatTable){
            styles.defaut = style;
        }

        var vecteur = this.creerVecteurRecherche(styles, this.ajouterOccurences, {responseJSON: responseJSON});
    };
   
    RechercheAdresse.prototype.ajouterOccurences = function(e) {
        var vecteur = e.target;
        var responseJSON = e.options.params.responseJSON;
        $.each(responseJSON.geocoderReponseListe, function(key, value) {
            var point;
            if (!value.localisation) {
                return true;
            }
            if (!value.localisation.point.x || !value.localisation.point.y) {
                var x = Number(value.localisation.enveloppe.Xmin) + ((Number(value.localisation.enveloppe.Xmax)-Number(value.localisation.enveloppe.Xmin))/2);
                var y = Number(value.localisation.enveloppe.Ymin) + ((Number(value.localisation.enveloppe.Ymax)-Number(value.localisation.enveloppe.Ymin))/2);
                point = new Point(x, y);
                point.limites = new Limites(value.localisation.enveloppe.Xmin, value.localisation.enveloppe.Ymin, value.localisation.enveloppe.Xmax, value.localisation.enveloppe.Ymax);
            } else {
                point = new Point(value.localisation.point.x, value.localisation.point.y);
            }
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
                propriete: 'adresseLibre'
            }]
        };

        this.traiterResultatVecteur(vecteur, responseJSON.nombreResultat); 
    };
    
    RechercheAdresse.prototype.traiterResultatVecteur = function(vecteur, nombreResultats) {
        nombreResultats = nombreResultats || vecteur.listeOccurences.length ;
            
        var resultat = this.ajouterPagination(nombreResultats);
        var debut = this.indexDebut+1;
        var fin = this.indexDebut+vecteur.listeOccurences.length;
        if(fin === 0){
            this.definirResultat('Aucun résultat');
            return false;
        }
        resultat += "<h4><u>Résultats (" + debut + " - " + fin + ")</u></h4>";
        $.each(vecteur.listeOccurences, function(row, occurence) {
            var title = occurence.proprietes.statut.description || '';
            var couleur = 'blue';
            
            if(occurence.proprietes.statut.commentaire){
                title += '\nCommentaire: ' + occurence.proprietes.statut.commentaire;
                couleur = 'DarkOrange';
            }
            
            if(occurence.proprietes.statut.etat && occurence.proprietes.statut.etat !== 'Officiel'){
                couleur = '#ff7200';
            }
            
            title = title.replace(/'/g, "&#39;");
            
            resultat += "<li data-id='" + occurence.id + 
                    "' class='rechercheResultatsListe'><font color='"+couleur+"' title='"+title+"'><b>» </b><u>" + 
                    occurence.obtenirPropriete("adresseLibre")+"</u></font></li>";
        });
        this.vecteur = vecteur;
        this.definirResultat(resultat, this.initEventResultat, this);
        Recherche.prototype.traiterResultatVecteur.call(this, vecteur);
    };
    
    return RechercheAdresse;
    
});
