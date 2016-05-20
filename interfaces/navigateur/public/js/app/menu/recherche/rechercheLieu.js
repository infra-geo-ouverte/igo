/** 
 * Module pour l'objet {@link Panneau.RechercheLieu}.
 * @module rechercheLieu
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires recherche
 */
define(['recherche', 'aide', 'point', 'style', 'limites'], function(Recherche, Aide, Point, Style, Limites) {
      /** 
     * Création de l'object Panneau.RechercheLieu.
     * Objet à ajouter à un objet localisation.
     * @constructor
     * @name Panneau.RechercheLieu
     * @class Panneau.RechercheLieu
     * @alias rechercheLieu:Panneau.RechercheLieu
     * @extends Recherche
     * @requires rechercheLieu
     * @param {string} [options.titre='Lieu'] Titre du panneau.
     * @returns {Panneau.RechercheLieu} Instance de {@link Panneau.RechercheLieu}
    */
    function RechercheLieu(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            typeRecherche:"lieu",
            titre:"Lieu"
        });
    };

    RechercheLieu.prototype = new Recherche();
    RechercheLieu.prototype.constructor = RechercheLieu;

     /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheLieu#obtenirAideHTML
     * @returns {String} Aide
    */
    RechercheLieu.prototype.obtenirAideHTML = function() {
        return  "Ex: <br>"+
                "->lac Poulin<br>"+
                "->Mcdo Montréal<br>"+
                "->sortie Chauveau<br>"+
                "->sortie Henri IV<br>" +
                this.obtenirLienPDF();
    };
  
    RechercheLieu.prototype.lireReponse = function(data, textStatus, jqXHR) {
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
   
    RechercheLieu.prototype.ajouterOccurences = function(e) {
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
            
            $.each(value.placeListe, function(keyPlace, place){
                if(place.type === 'Municipalité'){
                    value.municipalite = place.nom;
                } else if (place.type === 'Lieu'){
                    value.lieu = place.nom;
                }
            });
            vecteur.creerOccurence(point, value);
        });

        vecteur.templates.table = {
            colonnes: [{
                utiliserBase: false,
                titre: 'id',
                triable: true,
                propriete: 'id'
            }, { 
                titre: 'Nom',
                triable: true,
                propriete: 'lieu'
            }, { 
                titre: 'Municipalité',
                triable: true,
                propriete: 'municipalite'
            }, { 
                titre: 'Adresse',
                triable: true,
                propriete: 'adresseLibre'
            }]
        };

        this.traiterResultatVecteur(vecteur, responseJSON.nombreResultat);      
    };
    
    RechercheLieu.prototype.traiterResultatVecteur = function(vecteur, nombreResultats) {
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
            if(occurence.proprietes.statut.etat && occurence.proprietes.statut.etat !== 'Officiel'){
                couleur = '#ff7200';
            }
            resultat += "<li data-id='" + occurence.id + 
                    "' class='rechercheResultatsListe'><font color='"+couleur+"'><b>» </b><u>" + 
                    occurence.proprietes.lieu;
            if(occurence.proprietes.municipalite){
                resultat += " ("+occurence.proprietes.municipalite+")";
            }
            resultat += "</u></font><p class='rechercheResultatsListeDescription'>"+occurence.proprietes.adresseLibre+"</p></li>";
        });
        this.vecteur = vecteur;
        this.definirResultat(resultat, this.initEventResultat, this);
        Recherche.prototype.traiterResultatVecteur.call(this, vecteur);
    };
    
    
    RechercheLieu.prototype.initEventResultat = function() {
        var that=this;
        var resultatListe = $(this.resultatPanneau.items.items[0].body.dom).find('li.rechercheResultatsListe font');
        $.each(resultatListe, function(key, target) {
            var p_nomTheme = that.vecteur.listeOccurences[key].proprietes.metadonnee.source;
            var getThemeUrl = Aide.utiliserProxy(that.options.serviceMetadonnees + '?action=obtenirDetailTheme&p_nomTheme=' + p_nomTheme + '&p_format=html&p_force=true');
            new Ext.ToolTip({
                target: target,
                autoLoad: getThemeUrl,
                showDelay: 0,
                autoHeight: true,
                width: 300
            });
        });
        Recherche.prototype.initEventResultat.call(this);
    };

    return RechercheLieu;
    
});