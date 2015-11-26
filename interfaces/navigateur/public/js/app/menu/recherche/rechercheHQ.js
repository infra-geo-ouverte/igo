/** 
 * Module pour l'objet {@link Panneau.RechercheHQ}.
 * @module rechercheHQ
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires recherche
 */
define(['recherche', 'aide', 'point', 'style', 'limites'], function(Recherche, Aide, Point, Style, Limites) {
      /** 
     * Création de l'object Panneau.RechercheHQ.
     * Objet à ajouter à un objet localisation.
     * @constructor
     * @name Panneau.RechercheHQ
     * @class Panneau.RechercheHQ
     * @alias rechercheHQ:Panneau.RechercheHQ
     * @extends Recherche
     * @requires rechercheHQ
     * @param {string} [options.titre='HQ'] Titre du panneau.
     * @returns {Panneau.RechercheHQ} Instance de {@link Panneau.RechercheHQ}
    */
    function RechercheHQ(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            typeRecherche:"hq",
            titre:"HQ"
        });
    };

    RechercheHQ.prototype = new Recherche();
    RechercheHQ.prototype.constructor = RechercheHQ;

    /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheHQ#obtenirAideHTML
     * @returns {String} Aide
    */
    RechercheHQ.prototype.obtenirAideHTML = function() {
        return  "->Z8k5z<br>"+
          "->65 788 = 65e pylône de la ligne 788<br>" +
          this.obtenirLienPDF();
    };
    
   RechercheHQ.prototype.lireReponse = function(data, textStatus, jqXHR) {
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
   
    RechercheHQ.prototype.ajouterOccurences = function(e) {
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
    
    RechercheHQ.prototype.traiterResultatVecteur = function(vecteur, nombreResultats) {
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
            if(occurence.proprietes.statut.commentaire){
                title += '\nCommentaire: ' + occurence.proprietes.statut.commentaire;
            }
            var couleur = 'blue';
            if(occurence.proprietes.statut.etat && occurence.proprietes.statut.etat !== 'Officiel'){
                couleur = '#ff7200';
            }
            resultat += "<li data-id='" + occurence.id + 
                    "' class='rechercheResultatsListe'><font color='"+couleur+"' title='"+title+"'><b>» </b><u>" + 
                    occurence.obtenirPropriete("adresseLibre")+"</u></font></li>";
        });
        this.vecteur = vecteur;
        this.definirResultat(resultat, this.initEventResultat, this);
        Recherche.prototype.traiterResultatVecteur.call(this, vecteur);
    };
    
    return RechercheHQ;
    
});