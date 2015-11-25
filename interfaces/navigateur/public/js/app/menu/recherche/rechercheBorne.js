/** 
 * Module pour l'objet {@link Panneau.RechercheBorne}.
 * @module rechercheBorne
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires recherche
 */
define(['recherche', 'aide', 'point', 'style', 'limites'], function(Recherche, Aide, Point, Style, Limites) {
      /** 
     * Création de l'object Panneau.RechercheBorne.
     * Objet à ajouter à un objet localisation.
     * @constructor
     * @name Panneau.RechercheBorne
     * @class Panneau.RechercheBorne
     * @alias rechercheBorne:Panneau.RechercheBorne
     * @extends Recherche
     * @requires rechercheBorne
     * @param {string} [options.titre='Borne'] Titre du panneau.
     * @returns {Panneau.RechercheBorne} Instance de {@link Panneau.RechercheBorne}
    */
    function RechercheBorne(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            typeRecherche:"borne",
            titre:"Borne"
        });
    };

    RechercheBorne.prototype = new Recherche();
    RechercheBorne.prototype.constructor = RechercheBorne;
      
     /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheBorne#obtenirAideHTML
     * @returns {String} Aide
    */
    RechercheBorne.prototype.obtenirAideHTML = function() {
        return  "Ex: <br>"+
            "->108 73 = borne(MTQ) du 108ième kilomètre de la route #73<br>"+
            "->CN, 50 = toutes les bornes(CN) au 50ième mile<br>"+
            "->GCC H47(lettre chiffre) = bouée dont l'identifiant est 'H47'<br>"+
            "->SORTIE 315 = Toutes les sorties 315<br>"+
            "->SORTIE 315 40 = Sortie 315 de la route 40<br>"+
            "->SORTIE 315 Québec = Sortie 315 de la municipalité de Québec<br>"+
            "->SORTIE Québec = Toutes les sorties de la municipalité de Québec<br>"+
            "->PANNEAU st-raymond = Toutes les sorties dont l'affichage contient 'st-raymond'<br>"+
            this.obtenirLienPDF();
    };         



    RechercheBorne.prototype.lireReponse = function(data, textStatus, jqXHR) {
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
   
    RechercheBorne.prototype.ajouterOccurences = function(e) {
        var vecteur = e.target;
        var responseJSON = e.options.params.responseJSON;
        $.each(responseJSON.borneReponseListe, function(key, value) {
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
                titre: 'Detail',
                triable: true,
                propriete: 'detail'
            }]
        };

        this.traiterResultatVecteur(vecteur, responseJSON.nombreResultat);      
    };
    
    RechercheBorne.prototype.traiterResultatVecteur = function(vecteur, nombreResultats) {
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
            var couleur = 'blue';        
            resultat += "<li data-id='" + occurence.id + 
                    "' class='rechercheResultatsListe'><font color='"+couleur+"'><b>» </b><u>" + 
                    occurence.proprietes.detail+"</u></font></li>";
        });
        this.vecteur = vecteur;
        this.definirResultat(resultat, this.initEventResultat, this);
        Recherche.prototype.traiterResultatVecteur.call(this, vecteur);
    };
    
    return RechercheBorne;
    
});