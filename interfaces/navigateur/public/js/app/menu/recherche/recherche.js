/**
 * Module pour l'objet {@link Panneau.Recherche}.
 * @module recherche
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires panneau
 * @requires limites
 * @requires point
 * @requires vecteur
 * @requires style
 */

define(['panneau', 'vecteur', 'aide', 'panneauTable', 'css!css/recherche'], function(Panneau, Vecteur, Aide, PanneauTable) {
    /**
     * Création de l'object Panneau.Recherche.
     * Objet à ajouter à un objet localisation.
     * @constructor
     * @abstract
     * @name Panneau.Recherche
     * @class Panneau.Recherche
     * @alias recherche:Panneau.Recherche
     * @extends Panneau
     * @requires recherche
     * @param {string} [options.recherchePrefixe] Prefixe de la recherche
     * @param {string} [options.typeRecherche] Type de la recherche
     * @param {string} [options.lienAide] Lien URL vers une aide
     * @returns {Panneau.Recherche} Instance de {@link Panneau.Recherche}
     * @property {dictionnaire} options Liste des options de la couche
     * @property {Couche.Vecteur} vecteur Vecteur pour le résultat de la recherche
     */
    function Recherche(options) {
        this.vecteur;
        this.options = options || {};
        this.defautOptions = {
            recherchePrefixe: "",
            typeRecherche: "",
            maxEnreg: 40,
            proxy: true,
            epingle: true,
            sauvegarder: true,
            id: 'recherche',
            init: false,
            infobulleSurvol: false,
            zoom: 15,
            lienAide: Aide.utiliserBaseUri("guides/IGO_Navigateur_guide.pdf")
        };
    };

    Recherche.prototype = new Panneau();
    Recherche.prototype.constructor = Recherche;

    /**
     * Initialisation de l'object recherche.
     * @method
     * @name Recherche#_init
     */
    Recherche.prototype._init = function() {
        var that = this;
        this.defautOptions = $.extend({}, Aide.obtenirConfig('Recherche'), this.defautOptions);
        if(this.parent.options.cle) {this.defautOptions.cle = this.parent.options.cle;}
        Panneau.prototype._init.call(this);

        this.indexDebut = 0;
        this.indexFin = this.options.maxEnreg -1;

        this.aidePanneau = this.obtenirPanneauAide();
        this.resultatPanneau = this.obtenirResultatPanneau();
        this.formItems = this.obtenirElementsRecherche();

        var items = [
            this.formItems,
            this.aidePanneau,
            this.resultatPanneau
        ]

        if (Boolean(this.options.epingle)) {
            items.push(this.obtenirEpingleCheckbox());
        }

        if (Boolean(this.options.sauvegarder)) {
            items.push(this.obtenirSauvegarderCheckbox());
        }

        this._panel = new Ext.FormPanel({
            title: this.obtenirTitre() ,
            id: this.options.id,
            hideLabel: true,
            frame: true,
            border: false,
            bodyStyle: 'padding:0px 17px 0 0px; overflow-y: auto;',
            scope: this,
            items: items,
            //height:'fit',
            hidden: false,
            //autoScroll: true,
            buttons: this.obtenirBoutonsRecherche(),
            listeners: {
                afterrender: function(e) {
                    that.callbackCreation();
                },
                activate: function(e){
                    that.declencher({type: that.obtenirTypeClasse()+'Active'});
                }
            }
        });
        this.verifierParamsUrl();
    };


    /**
     * Obtenir les valeurs des champs de recherche.
     * @method
     * @name Recherche#obtenirValeursRecherche
     * @returns {array} Tableau des valeurs de recherche
     */
    Recherche.prototype.obtenirValeursRecherche = function() {
        //Retourner la valeur des éléments contenus dans le formulaire
        return this._panel.getForm().getValues();
    };

    /**
     * Obtenir le panneau d'aide.
     * @method
     * @name Recherche#obtenirPanneauAide
     * @returns {ExtJS} Fieldset de extJs
     */
    Recherche.prototype.obtenirPanneauAide = function() {
        //Si un panneau d'aide est défini
        if (this.obtenirAideHTML()) {
            return Ext.create({
                xtype: 'fieldset',
                title: 'aide',
                id: 'lbl_aide' + this.options.id,
                collapsible: true,
                labelWidth: 75,
                items: [{html: this.obtenirAideHTML()}]
            });
        } else {
            return false; //Retourne false pour ne pas afficher de panneau
        }
    };

    /**
     * Obtenir le message d'aide.
     * @method
     * @name Recherche#obtenirAideHTML
     * @returns {String} Message d'aide
     */
    Recherche.prototype.obtenirAideHTML = function() {
        return false;
    };

    /**
     * Obtenir le lien pdf pour l'aide
     * @method
     * @name Recherche#obtenirLienPDF
     * @returns {String} Lien pdf
     */
    Recherche.prototype.obtenirLienPDF = function() {
        return  "<a href=\'#here\' onclick=\'window.open(\"" +
                this.obtenirLienAide() +
                "\");\'>" +
                "Cliquer ici pour avoir plus de détails...</a><br><br>";
    };

    /**
     * Obtenir le panneau de résultat.
     * @method
     * @name Recherche#obtenirResultatPanneau
     * @returns {ExtJS} Fieldset de extJs
     */
    Recherche.prototype.obtenirResultatPanneau = function() {
        return  Ext.create({
            xtype: 'fieldset',
            title: 'Résultat',
            id: 'resul' + this.options.id,
            collapsible: true,
            hidden: true,
            items: [{html: '<p>Aucun resultat</p>'}]
        });
    };

    /**
     * Obtenir le panneau pour les éléments de la recherche
     * @method
     * @name Recherche#obtenirElementsRecherche
     * @returns {ExtJS}
     */
    Recherche.prototype.obtenirElementsRecherche = function() {
        var that = this;
        return [{
            xtype: 'textfield',
            fieldLabel: 'Texte',
            hideLabel: true,
            width: 260,
            id: 'RechercheTitle' + this.options.id,
            allowBlank: false,
            blankText: 'Vous devez saisir au moins 1 caractère...',
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
     * Obtenir le bouton de recherche
     * @method
     * @name Recherche#obtenirBoutonsRecherche
     * @returns {ExtJS}
     */
    Recherche.prototype.obtenirBoutonsRecherche = function() {
        var that=this;
        return [{
                id: 'rechercherButton' + this.options.id,
                text: 'Rechercher',
                tooltip: 'Lancer la recherche',
                scope: this,
                handler: function(){that.lancerRecherche()}
            },
            {
                id: 'reinitialiserButton' + this.options.id,
                text: 'Réinitialiser',
                tooltip: 'Réinitialiser les champs de recherche et la carte',
                scope: this,
                handler: function(){that.reinitialiserRecherche()}
            }
        ];
    };

    /**
     * Obtenir le checkbox pour l'épingle
     * @method
     * @name Recherche#obtenirEpingleCheckbox
     * @returns {ExtJS} checkbox
     */
    Recherche.prototype.obtenirEpingleCheckbox = function() {
        this.pineCheckbox = new Ext.create({
            xtype: 'checkbox',
            name: 'cb_showPine',
            ctCls: 'styleEpingle',
            id: 'cb_showPine' + this.options.id,
            boxLabel: "Afficher l'épingle",
            checked: true,
            scope: this,
            handler: function(e) {
                if (e.getValue())
                {
                    if (this.vecteur) {
                        this.vecteur.activer();
                    }
                }
                else
                {
                    if (this.vecteur) {
                        this.vecteur.desactiver();
                    }
                }
            }
        });
        return this.pineCheckbox;
    };

    Recherche.prototype.obtenirSauvegarderCheckbox = function() {
        this.saveCheckbox = new Ext.create({
            xtype: 'checkbox',
            name: 'cb_SaveVecteur',
            ctCls: 'styleEpingle',
            id: 'cb_SaveVecteur' + this.options.id,
            boxLabel: "Sauvegarder le résultat",
            checked: false,
            scope: this
        });
        return this.saveCheckbox;
    };


    /**
     * Appeler le service de recherche
     * Exécute ensuite {@link Recherche#lireReponse}
     * @method
     * @name Recherche#appelerService
     */
    Recherche.prototype.appelerService = function() {
        var textUser = this.obtenirValeursRecherche()['RechercheTitle' + this.options.id];
        if(!textUser){
            Aide.afficherMessage({titre: "Recherche", message:'Veillez entrer un texte à chercher'});
            return false;
        }
        this.textUser = textUser;
        Aide.afficherMessageChargement({message: 'Recherche en cours, patientez un moment...'});
        this.reinitialiserVecteur();
        var texte = '';
        if(this.obtenirRecherchePrefixe()){
            texte += this.obtenirRecherchePrefixe() + ' ';
        }
        texte += textUser;
        var typeRecherche = this.obtenirTypeRecherche();
        var tjrsProxy = this.options.cle ? true : false;
        $.ajax({
            url: Aide.utiliserProxy(this.options.service, tjrsProxy),
            data: {
                type: typeRecherche,
                texte: texte, //todo: encoder le texte //encodeURIComponent(texte),
                epsg_sortie: this.carte.obtenirProjection().split(":")[1],
                indDebut: this.indexDebut,
                indFin: this.indexDebut + this.indexFin,
                format: this.options.format, //"JSON",//"HTML",
                groupe: 1,
                urlappelant: this.options.cle ? undefined : this.options.urlAppelant,
                _cle: this.options.cle
                //epsg_entree :4326
            },
            //crossDomain: this.options.proxy,
            context: this,
            success: this.lireReponse,
            error: this.appelerServiceErreur
        });

        this.declencher({type: "appelerServiceRecherche", recherche: this});
    };

    Recherche.prototype.appelerServiceErreur = function(jqXHR){
        var messageErreur = jqXHR.responseText;
        if(jqXHR.responseJSON){
            messageErreur = jqXHR.responseJSON.message_erreur;

            if(jqXHR.responseJSON.detail_message){
                $.each(jqXHR.responseJSON.detail_message, function(key, value){
                    messageErreur += "<br>"+value;
                });
            }
        }
        if(jqXHR.status === 404){
            messageErreur = "Service introuvable.";
        }
        this.definirResultat(messageErreur);
    };

    Recherche.prototype.traiterResultatVecteur = function(vecteur){
        this.declencher({type: "resultatRecherche", vecteur: vecteur, texteRecherche: this.textUser});

        vecteur.garderHistorique = true;

        var occurence = vecteur.obtenirOccurences()[0];
        if(!occurence){
            return false;
        }
        vecteur.zoomerOccurence(occurence, this.options.zoom);
        occurence.selectionner();

        if(this.options.idResultatTable){
            var nav = Aide.obtenirNavigateur();
            var panneauTable = nav.obtenirPanneauParId(this.options.idResultatTable, -1);
            if(!panneauTable || !panneauTable.obtenirTypeClasse){return true};
            if (panneauTable.obtenirTypeClasse() === 'PanneauTable') {
                panneauTable.ouvrirTableVecteur(vecteur);
            } else if(panneauTable.obtenirTypeClasse() === 'PanneauOnglet'){
                var paginer = panneauTable.options.paginer?panneauTable.options.paginer:false;
                var limite = panneauTable.options.paginer_limite?parseInt(panneauTable.options.paginer_limite):undefined;
                var debut = panneauTable.options.paginer_debut?parseInt(panneauTable.options.paginer_debut):undefined;

                var nouvelleTable = new PanneauTable({
                    reductible: false,
                    fermable: true,
                    paginer : paginer,
                    paginer_debut: debut,
                    paginer_limite: limite,
                    outils_auto:true,
                    outils_selectionSeulement: true
                });

                panneauTable.ajouterPanneau(nouvelleTable);
                nouvelleTable.ouvrirTableVecteur(vecteur);
                panneauTable.activerPanneau(nouvelleTable);
            }
        }

        if(this.options.infobulleSurvol){
            vecteur.ajouterDeclencheur('occurenceSurvol', function(e){
                e.occurence.ouvrirInfobulle({html:e.occurence.proprietes.adresseLibre, aFermerBouton: false});
            },
            {scope: this});
            vecteur.ajouterDeclencheur('occurenceSurvolFin', function(e){
                e.occurence.fermerInfobulle();
            },
            {scope: this});
        }
    }

    Recherche.prototype.creerVecteurRecherche = function(styles, callback, paramsCallback) {
        var active = false;
        if (!this.pineCheckbox || this.pineCheckbox.checked) {
            active = true;
        };

        var visible = false;
        if (this.saveCheckbox && this.saveCheckbox.checked) {
            visible = true;
        };

        var vecteur = new Vecteur({legende: false, active: active, visible: visible , selectionnable: false, suppressionPermise: true, titre: "Resultats Recheche " + this.options.titre + " - " + this.obtenirValeursRecherche()['RechercheTitle' + this.options.id], styles: styles});
        if(callback){
            vecteur.ajouterDeclencheur("coucheAjoutee", callback, {scope: this, params: paramsCallback});
        }
        this.carte.gestionCouches.ajouterCouche(vecteur);
        return vecteur;
    };

    /**
     * Lire le résultat de la recherche
     * @method
     * @name Recherche#lireReponse
     * @param {Objet} response Réponse de la recherche
     */
    Recherche.prototype.lireReponse = function(response) {
        this.definirResultat("<p> Surcharger la fonction lireReponse </p>");
    };

    Recherche.prototype.ajouterPagination = function(nombreResultats) {
        var ajoutFleche = "";

        if (nombreResultats === (this.indexFin + 1)) {
            ajoutFleche += "<div align='center'><table>";
            ajoutFleche += "<tr>";

            if ((this.indexDebut - (this.indexFin + 1)) < 0) {
                ajoutFleche += "<td>Précédent</td>";
            } else {
                ajoutFleche += "<td><span id='precedentRecherche'>Précédent</span></td>";
            }
            ajoutFleche += "<td>&nbsp;&nbsp;&nbsp;</td>";
            ajoutFleche += "<td><span id='suivantRecherche'>Suivant</span></td>";
            ajoutFleche += "</tr>";
            ajoutFleche += "</table></div>";
        } else {
            if (this.indexDebut > 0) {
                ajoutFleche += "<div align='center'><table>";
                ajoutFleche += "<tr>";
                ajoutFleche += "<td><span id='precedentRecherche'>Précédent</span></td>";
                ajoutFleche += "<td>&nbsp;&nbsp;&nbsp;</td>";
                ajoutFleche += "<td>Suivant</td>";
                ajoutFleche += "</tr>";
                ajoutFleche += "</table></div>";
            }
        }
        return ajoutFleche;
    }

    Recherche.prototype.initEventResultat = function() {
        $(this.resultatPanneau.items.items[0].body.dom).find('#precedentRecherche')
            .click($.proxy(this.appelPrecedent, this));
        $(this.resultatPanneau.items.items[0].body.dom).find('#suivantRecherche')
            .click($.proxy(this.appelSuivant, this));
        $(this.resultatPanneau.items.items[0].body.dom).find('li.rechercheResultatsListe')
            .click($.proxy(this.eventResultatClique, this))
            .mouseover($.proxy(this.eventResultatMouseover, this))
            .mouseout($.proxy(this.eventResultatMouseout, this));
    };

    Recherche.prototype.eventResultatClique = function(e) {
        var id = $(e.target).parents('.rechercheResultatsListe').data('id');
        this.vecteur.deselectionnerTout();
        var occurence = this.vecteur.obtenirOccurenceParId(id);
        if(!occurence){
            return false;
        }
        this.vecteur.zoomerOccurence(occurence, this.options.zoom);
        occurence.selectionner();
    };

    Recherche.prototype.eventResultatMouseover = function(e) {
        var id = $(e.target).parents('.rechercheResultatsListe').data('id');
        var occurence = this.vecteur.obtenirOccurenceParId(id);
        if(!occurence){
            return false;
        }
        occurence.appliquerStyle('courant', true);
    };

    Recherche.prototype.eventResultatMouseout = function(e) {
        var id = $(e.target).parents('.rechercheResultatsListe').data('id');
        var occurence = this.vecteur.obtenirOccurenceParId(id);
        if(!occurence){
            return false;
        }
        occurence.appliquerStyle('courant', false);
    };

    /**
     * Préfixe de la recherche
     * @method
     * @name Recherche#obtenirRecherchePrefixe
     * @returns {String} Préfixe
     */
    Recherche.prototype.obtenirRecherchePrefixe = function() {
        return this.options.recherchePrefixe;
    };

    /**
     * Type de la recherche
     * @method
     * @name Recherche#obtenirTypeRecherche
     * @returns {String} Type de la recherche
     */
    Recherche.prototype.obtenirTypeRecherche = function() {
        return this.options.typeRecherche;
    };

    /**
     * Réinitialiser la recherche
     * @method
     * @name Recherche#reinitialiser
     */
    Recherche.prototype.reinitialiserVecteur = function() {
        if(!this.vecteur){return false;}
        if (!this.vecteur.options.visible) {
            this.carte.gestionCouches.enleverCouche(this.vecteur);
        }
    };

    /**
     * Lancer la recherche.
     * @method
     * @name Recherche#lancerRecherche
     */
    Recherche.prototype.lancerRecherche = function(texte) {
        if(texte){
            this._panel.items.get('RechercheTitle' + this.options.id).setValue(texte);
        }
        if (this.aidePanneau) {
            this.aidePanneau.collapse();
        };

        //nouvelle recherche, remettre le compteur à zéro
        this.indexDebut = 0;
        this.appelerService();
    };

    /**
     * Relancer la recherche avec une nouvelle valeur.
     * @method
     * @name Recherche#relancerRecherche
     * @param {String} requete Nouvelle valeur pour la recherche
     */
    Recherche.prototype.relancerRecherche = function(requete) {
        this.obtenirValeursRecherche()['RechercheTitle' + this.options.id] = requete;
        this._panel.items.items[0].setValue(requete);
        this.appelerService();
    };

    /**
     * Appeler le service pour obtenir les résultats suivants.
     * @method
     * @name Recherche#appelSuivant
     */
    Recherche.prototype.appelSuivant = function() {
        this.indexDebut = this.indexDebut + (this.indexFin + 1);
        this.appelerService();
    };

    /**
     * Appeler le service pour obtenir les résultats précédents.
     * @method
     * @name Recherche#appelPrecedent
     */
    Recherche.prototype.appelPrecedent = function() {
        this.indexDebut = this.indexDebut - (this.indexFin + 1);
        this.appelerService();
    };

    /**
     * Afficher le résultat.
     * @method
     * @name Recherche#definirResultat
     */
    Recherche.prototype.definirResultat = function(resultatTexte, callback, target) {
        //Masquer le message d'attente
        Aide.cacherMessageChargement();

        this.resultatPanneau.show().expand();
        this.resultatPanneau.items.items[0].body.update(resultatTexte);
        if (typeof callback === "function"){
            callback.call(target);
            this.activerCouchesAssociees();
        }
    };

    Recherche.prototype.verifierParamsUrl = function(){
        var recherche = Aide.obtenirParametreURL('recherche');
        if(recherche === this.obtenirTypeRecherche()){
            var texte = Aide.obtenirParametreURL('texte');
            if(texte){
                var that=this;
                var zoomP = Number(Aide.obtenirParametreURL('zoom'));
                if(zoomP){
                    this.options.zoom = zoomP;
                }
                var nav = Aide.obtenirNavigateur();
                if(nav.isReady){
                    that.traiterParamsUrl(texte);
                } else {
                    nav.ajouterDeclencheur('navigateurInit', function(){
                        that.traiterParamsUrl(texte);
                    });
                }
            }
        }
    };

    Recherche.prototype.traiterParamsUrl = function(texte){
        var that=this;
        this.parent.ajouterDeclencheur('ajouterPanneau', function(e){
            if(that === e.panneau){
                e.target.enleverDeclencheur('ajouterPanneau', 'rechercheTraiterParamsURL');
                e.panneau.ajouterDeclencheur(that.obtenirTypeClasse()+'Active', function(e2){
                    e2.target.enleverDeclencheur(that.obtenirTypeClasse()+'Active', 'rechercheTraiterParamsURL2');
                    e2.target.lancerRecherche(texte);
                }, {id: "rechercheTraiterParamsURL2"});
                e.target.activerPanneau(e.panneau);
            }
        }, {id: "rechercheTraiterParamsURL"});
        this.parent.ouvrir();
    };

    /**
     * Réinitialiser la recherche
     * @method
     * @name Recherche#reinitialiserRecherche
     */
    Recherche.prototype.reinitialiserRecherche = function(){
        this.reinitialiserVecteur();
        this.desactiverCouchesAssociees();
        this.textUser = undefined;
        $.each(this._panel.items.items, function(index, item){
           if(item.xtype == "textfield" || item.xtype == "numberfield" || item.xtype == "combo"){
               item.reset();
           }
        });

        if(this.resultatPanneau.isVisible()){
            this.definirResultat(this.obtenirAideHTML());
        }
    };

    Recherche.prototype.obtenirLienAide = function (){
        return (typeof this.options.lienAide == undefined)?this.defautOptions.lienAide:this.options.lienAide;
    }

    /**
     * Activer couches associées
     * @method
     * @name Recherche#activerCouchesAssociees
     */
    Recherche.prototype.activerCouchesAssociees = function() {
        var that = this;
        
        if(this.options.couchesAssociees === undefined)
            return true;
        
        var listeCouches = this.options.couchesAssociees.split(",");
        
        if(listeCouches === "")
            return true;
        
        $.each(listeCouches, function(index, coucheASelectionner){

            var couches = that.carte.gestionCouches.obtenirCouchesParNom(coucheASelectionner);
            $.each(couches, function(ind, couche){
                
                if(couche)  {
                couche.activer();
                }
            });
        });          
    };
    
    /**
     * Désacctiver couches associées
     * @method
     * @name Recherche#DesactiverCouchesAssociees
     */
    Recherche.prototype.desactiverCouchesAssociees = function() {
        var that = this;
        
        if(this.options.couchesAssociees === undefined)
            return true;
        
        var listeCouches = this.options.couchesAssociees.split(",");
        
        if(listeCouches === "")
            return true;
        
        $.each(listeCouches, function(index, coucheASelectionner){

            var couches = that.carte.gestionCouches.obtenirCouchesParNom(coucheASelectionner);
            $.each(couches, function(ind, couche){
                
                if(couche)  {
                    couche.desactiver();
                }           
            });   
        });
                   
    };

    return Recherche;

});
