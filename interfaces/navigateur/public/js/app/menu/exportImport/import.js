/** 
 * Module pour l'objet {@link Panneau.RechercheAdresse}.
 * @module rechercheAdresse
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires recherche
 */
define(['exportImport', 'aide', 'point', 'style', 'limites'], function(ExportImport, Aide, Point, Style, Limites) {
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
    function Import(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            typeRecherche:"import",
            titre:"Import"
        });
    };

    Import.prototype = new ExportImport();
    Import.prototype.constructor = Import;
    
     /** 
     * Initialisation de l'object recherche. 
     * @method 
     * @name Recherche#_init
     */
    Import.prototype._init = function() {
        var that = this;
       
        this.items.push(this.obtenirItemsForm());
       
        this._panel = new Ext.FormPanel({
            title: this.obtenirTitre() ,
            id: this.options.id,
            hideLabel: true,
            frame: true,
            border: false,
            bodyStyle: 'padding:0px 17px 0 0px; overflow-y: auto;',
            scope: this,
            items: this.items,
            //height:'fit',
            hidden: false,
            //autoScroll: true,
            buttons: this.obtenirBoutonLancer(),
            listeners: {
                afterrender: function(e) {
                    that.callbackCreation();
                },
                activate: function(e){
                    that.declencher({type: that.obtenirTypeClasse()+'Active'});
                }  
            }
        });
    };
    
    
    /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheAdresse#obtenirAideHTML
     * @returns {String} Aide
    */
    Import.prototype.obtenirItemsForm = function() {
    
        var szDefaultOutputFormat = this.oOutputInputFormatStore.data.items[0].data.value;
        var oOutputFormatComboBox = new Ext.form.ComboBox({
            id : 'importOutputFormat',
            fieldLabel: 'Format Input',
            store: this.oOutputInputFormatStore,
            valueField: 'value',
            value: szDefaultOutputFormat,
            displayField:'text',
            editable: false,
            mode: 'local',
            triggerAction: 'all',
            lazyRender: true,
            lazyInit: false,
            listWidth: 150,
            submitValue: false
        });
            
         return [oOutputFormatComboBox];
    };
    
     /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheAdresse#obtenirAideHTML
     * @returns {String} Aide
    */
    Import.prototype.obtenirAideHTML = function() {
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
    Import.prototype.obtenirCopyright = function() {
        return  "<a href=\"http://adressesquebec.gouv.qc.ca/\" target=\"_blank\">"+
                "<img src=\"" + Aide.utiliserBaseUri("images/quebec/AQhorizontal-copyrightPetit.png") + "\" style='height:39px' alt=\"Adresse Québec\" ></img></a>";
    };
    
    
    Import.prototype.lireReponse = function(data, textStatus, jqXHR) {
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

       var styles = {defaut: {visible: false}, select: style};

        var vecteur = this.creerVecteurRecherche(styles);
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
    
    Import.prototype.traiterResultatVecteur = function(vecteur, nombreResultats) {
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
        ExportImport.prototype.traiterResultatVecteur.call(this, vecteur);
    };
    
    return Import;
    
});