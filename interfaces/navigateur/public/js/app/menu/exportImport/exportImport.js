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
     * @returns {Panneau.Recherche} Instance de {@link Panneau.Recherche}
     * @property {dictionnaire} options Liste des options de la couche
     * @property {Couche.Vecteur} vecteur Vecteur pour le résultat de la recherche
     */
    function ExportImport(options) {
        this.vecteur;
        this.options = options || {};
        this.defautOptions = {
            recherchePrefixe: "",
            typeRecherche: "",
            maxEnreg: 40,
            proxy: true,
            epingle: true,
            sauvegarder: true,
            id: 'exportimport',
            init: false,
            zoom: 15
        };
        this.oOutputInputFormatStore = new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            data : [['BNA', 'bna'],
                    ['CSV', 'csv'],
                    ['DGN', 'dgn'],
                    ['DXF', 'dxf'],
                    ['ESRI Shapefile', 'ESRI Shapefile'],
                    ['Geoconcept', 'Geoconcept'],
                    ['GeoJSON', 'GeoJSON'],
                    ['GeoRSS', 'GeoRSS'],
                    ['GML', 'GML'],
                    ['GMT', 'GMT'],
                    ['GPX', 'GPX'],
                    ['KML', 'KML'],
                    ['MapInfo File', 'MapInfo File'],
                    ['TIGER', 'TIGER'],
                    ['PGDump', 'PGDump'],
                    ['VRT', 'VRT']                   
                    ]
        });
        
        this.oEPSGStore = new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            data : [['32198', 'EPSG:32198'],
                    ['3857', 'EPSG:3857'],
                    ['4326', 'EPSG:4326']                 
                    ]
        });
        
        this.items = [
             {
                xtype: 'checkbox',
                id : 'skipfailureCheckBox',
                fieldLabel : ' Ne pas prendre en compte les erreurs.'
            }            
        ]
    };

    ExportImport.prototype = new Panneau();
    ExportImport.prototype.constructor = ExportImport;

    /** 
     * Initialisation de l'object recherche. 
     * @method 
     * @name Recherche#_init
     */
    ExportImport.prototype._init = function() {
        var that = this;
        this.defautOptions = $.extend({}, Aide.obtenirConfig('ExportImport'), this.defautOptions);
        Panneau.prototype._init.call(this);

       
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
     * Obtenir les valeurs des champs de recherche.
     * @method 
     * @name Recherche#obtenirValeursRecherche
     * @returns {array} Tableau des valeurs de recherche
     */
    ExportImport.prototype.obtenirValeursRecherche = function() {
        //Retourner la valeur des éléments contenus dans le formulaire
        return this._panel.getForm().getValues();
    };

    /**
     * Obtenir le panneau d'aide.
     * @method
     * @name Recherche#obtenirPanneauAide
     * @returns {ExtJS} Fieldset de extJs
     */
    ExportImport.prototype.obtenirPanneauAide = function() {
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
    ExportImport.prototype.obtenirAideHTML = function() {
        return false;
    };

    /**
     * Obtenir le lien pdf pour l'aide
     * @method
     * @name Recherche#obtenirLienPDF
     * @returns {String} Lien pdf
     */
    ExportImport.prototype.obtenirLienPDF = function() {
        return  "<a href=\'#here\' onclick=\'window.open(\"" +
                Aide.utiliserBaseUri("guides/200_Guide_Localisation_GeoCOG_V10_OMSC-ANALYSTE.pdf") +
                "\");\'>" +
                "Cliquer ici pour avoir plus de détails...</a><br><br>";
    };

    /**
     * Obtenir le panneau de résultat.
     * @method
     * @name Recherche#obtenirResultatPanneau
     * @returns {ExtJS} Fieldset de extJs
     */
    ExportImport.prototype.obtenirResultatPanneau = function() {
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
    ExportImport.prototype.obtenirElementsRecherche = function() {
        var that = this;
        return [{
            xtype: 'textfield',
            fieldLabel: 'Texte',
            hideLabel: true,
            width: 260,
            id: 'ExportImport' + this.options.id,
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
    ExportImport.prototype.obtenirBoutonLancer = function() {
        var that=this;
        return [{
                id: 'exportImportButton' + this.options.id,
                text: 'Lancer',
                tooltip: 'Lancer',
                scope: this,
                handler: function(){that.lancerRecherche()}
            }
        ];
    };
    
    
    /**
     * Obtenir et exporter la sélection
     * @method
     * @name OutilExportSHP#exporter
     * @returns {Boolean}
     */
    Export.prototype.exporter = function(){    
        var that = this;     
        var geojson;
        this.tabOccu = new Array();       
        var analyseur = new AnalyseurGeoJSON({
            projectionCarte: this.carte.obtenirProjection()
        });
        var nbFichier=0;
        var couchesOccurencesSelect = this.carte.gestionCouches.obtenirOccurencesSelectionnees();
        this.tabMethod = new Array();
        
        //Pour chaque couches dans la carte 
        $.each(couchesOccurencesSelect, function(index, couche) {             
            that.tabOccu = new Array(); 
            
            //Pour chaque occurence de la couche
            $.each(couche, function(ind, occu) {
                //convertir les occurence en 4326 pour le shapeFile
                that.tabOccu.push(occu.projeter("EPSG:4326"));
            }); 
            
            /*Si des occurences sont sélectionnées pour la couche, on les convertit en json et on appelle la fonction
             * de conversion en shapeFile
             */
            if(that.tabOccu.length !== 0){
                geojson = JSON.parse(analyseur.ecrire(that.tabOccu));
                //that.download("http://ogre.adc4gis.com/convertJson", "post", JSON.stringify(geojson), index);
                that.appelerService(that.options.urlService, JSON.stringify(geojson), index, nbFichier);
                nbFichier++;
            }
        });
        
        //Si aucun fichier n'a été créé
        if(nbFichier === 0){
            Aide.afficherMessage("Aucune sélection", "Vous devez sélectionner au moins un élément avant de pouvoir l’exporter.");
            return false;
        }             
    };  
    
     /**
     * Appeler le service qui retournera le fichier zip de shapeFile selon les géométries sélectionnés de la couche
     * @method
     * @name OutilExportSHP#appelerService
     * @param {string} url URL du service à de conversion shapeFile
     * @param {json} json contenant les géométries à convertir en shapeFile
     * @param {string} outputName le nom du fichier de sortie
     * @returns {file} Retour le fichier selon outputName + shape.zip
     */
    Export.prototype.appelerService = function(url, json, outputName, nbFichier){
        if( url && json ){
            
            //Retirer l'instance du iframe précédent
            /**Ne pas faire avec le setTimeOut à la fin car cause des problème si l'usager prend du temps à enregistrer
             * setTimeout((function(iframe) {
                return function() { 
                    iframe.remove(); 
                };
            })(iframe), 4000);
             */
            if($("#iframeExportShp"+nbFichier-1)){
                $("#iframeExportShp"+nbFichier-1).remove();
            }
            
            /*Créer un iframe qui contiendra le form qui servira à soumettre les paramètres aux services de conversion
             * On doit faire ainsi afin de nous permettre de retourner plusieurs fichiers.
             */
            var iframe = $('<iframe id="iframeExportShp"'+nbFichier+ ' style="visibility: collapse;"></iframe>');
            $('body').append(iframe);
            var content = iframe[0].contentDocument;
                 
            var inputs = '';
            
            inputs+='<textarea id="json" class="form-control" type="hidden" name="json">'+ json +'</textarea>';
            inputs+='<textarea id="formatOutput" class="form-control" type="hidden" name="format">'+ this.this.obtenirValeursRecherche()['exportOutpuFormat' + this.options.id]; +'</textarea>';
            inputs+='<textarea id="targetSrs" class="form-control" type="hidden" name="targetSrs">'+ this.this.obtenirValeursRecherche()['exportEPSGOutput' + this.options.id]; +'</textarea>';
            inputs+='<textarea id="sourceSrs" class="form-control" type="hidden" name="sourceSrs">'+ this.this.obtenirValeursRecherche()['exportEPSGInput' + this.options.id]; +'</textarea>';
            
            if(outputName){
                inputs+='<input id="name" name="outputName" value="' + outputName +  'Shape.zip" class="form-control">';
            }
            
            var form = '<form name=' + outputName + ' action="'+ url +'" method="post">'+inputs+'</form>';
            content.write(form);
            $('form', content).submit();
          /*  setTimeout((function(iframe) {
                return function() { 
                    iframe.remove(); 
                };
            })(iframe), 4000);*/
        };
    };
    
    ExportImport.prototype.appelerServiceErreur = function(jqXHR){
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

    ExportImport.prototype.traiterResultatVecteur = function(vecteur){
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
                var nouvelleTable = new PanneauTable({reductible: false, fermable: true});        
                panneauTable.ajouterPanneau(nouvelleTable);
                nouvelleTable.ouvrirTableVecteur(vecteur);
                panneauTable.activerPanneau(nouvelleTable);        
            }
        }
    }

    ExportImport.prototype.creerVecteurRecherche = function(styles) {
        var active = false;
        if (!this.pineCheckbox || this.pineCheckbox.checked) {
            active = true;
        };
        
        var visible = false;
        if (this.saveCheckbox && this.saveCheckbox.checked) {
            visible = true;
        };
        
        var vecteur = new Vecteur({active: active, visible: visible , selectionnable: false, suppressionPermise: true, titre: "Resultats Recheche " + this.options.titre + " - " + this.obtenirValeursRecherche()['RechercheTitle' + this.options.id], styles: styles});         
        this.carte.gestionCouches.ajouterCouche(vecteur);
        return vecteur;
    };

    /**
     * Lire le résultat de la recherche
     * @method
     * @name Recherche#lireReponse
     * @param {Objet} response Réponse de la recherche
     */
    ExportImport.prototype.lireReponse = function(response) {
        this.definirResultat("<p> Surcharger la fonction lireReponse </p>");
    };

    ExportImport.prototype.ajouterPagination = function(nombreResultats) {
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
    
    ExportImport.prototype.initEventResultat = function() {       
        $(this.resultatPanneau.items.items[0].body.dom).find('#precedentRecherche')
            .click($.proxy(this.appelPrecedent, this));
        $(this.resultatPanneau.items.items[0].body.dom).find('#suivantRecherche')
            .click($.proxy(this.appelSuivant, this));
        $(this.resultatPanneau.items.items[0].body.dom).find('li.rechercheResultatsListe')
                .click($.proxy(this.eventResultatClique, this));
    };

    ExportImport.prototype.eventResultatClique = function(e) {
        var id = $(e.target).parents('.rechercheResultatsListe').data('id');
        this.vecteur.deselectionnerTout();
        var occurence = this.vecteur.obtenirOccurenceParId(id);
        if(!occurence){
            return false;
        }
        this.vecteur.zoomerOccurence(occurence, this.options.zoom);
        occurence.selectionner();
    };
    
    /**
     * Préfixe de la recherche
     * @method
     * @name Recherche#obtenirRecherchePrefixe
     * @returns {String} Préfixe
     */
    ExportImport.prototype.obtenirRecherchePrefixe = function() {
        return this.options.recherchePrefixe;
    };

    /**
     * Type de la recherche
     * @method
     * @name Recherche#obtenirTypeRecherche
     * @returns {String} Type de la recherche
     */
    ExportImport.prototype.obtenirTypeRecherche = function() {
        return this.options.typeRecherche;
    };

    /**
     * Réinitialiser la recherche
     * @method
     * @name Recherche#reinitialiser
     */
    ExportImport.prototype.reinitialiserVecteur = function() {
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
    ExportImport.prototype.lancerRecherche = function(texte) {
        if(texte){
            this._panel.items.get('ExportImportTitle' + this.options.id).setValue(texte);
        }
        if (this.aidePanneau) {
            this.aidePanneau.collapse();
        };

        //nouvelle recherche, remettre le compteur à zéro
        this.indexDebut = 0;
        this.exporter();
    };

    /**
     * Relancer la recherche avec une nouvelle valeur.
     * @method
     * @name Recherche#relancerRecherche
     * @param {String} requete Nouvelle valeur pour la recherche
     */
    ExportImport.prototype.relancerRecherche = function(requete) {
        this.obtenirValeursRecherche()['RechercheTitle' + this.options.id] = requete;
        this._panel.items.items[0].setValue(requete);
        this.appelerService();
    };

    /**
     * Appeler le service pour obtenir les résultats suivants.
     * @method
     * @name Recherche#appelSuivant
     */
    ExportImport.prototype.appelSuivant = function() {
        this.indexDebut = this.indexDebut + (this.indexFin + 1);
        this.appelerService();
    };

    /**
     * Appeler le service pour obtenir les résultats précédents.
     * @method
     * @name Recherche#appelPrecedent
     */
    ExportImport.prototype.appelPrecedent = function() {
        this.indexDebut = this.indexDebut - (this.indexFin + 1);
        this.appelerService();
    };

    /**
     * Afficher le résultat.
     * @method
     * @name Recherche#definirResultat
     */
    ExportImport.prototype.definirResultat = function(resultatTexte, callback, target) {
        //Masquer le message d'attente
        Aide.cacherMessageChargement();
        
        this.resultatPanneau.show().expand();
        this.resultatPanneau.items.items[0].body.update(resultatTexte);
        if (typeof callback === "function"){
            callback.call(target);
        }
    };
    
    ExportImport.prototype.verifierParamsUrl = function(){
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
    
    ExportImport.prototype.traiterParamsUrl = function(texte){
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
    ExportImport.prototype.reinitialiserRecherche = function(){
        this.reinitialiserVecteur();
        $.each(this._panel.items.items, function(index, item){
           if(item.xtype == "textfield" || item.xtype == "numberfield" || item.xtype == "combo"){
               item.reset();
           }   
        });
        
        if(this.resultatPanneau.isVisible()){
            this.definirResultat(this.obtenirAideHTML());
        }
    };
    
    return ExportImport;

});

