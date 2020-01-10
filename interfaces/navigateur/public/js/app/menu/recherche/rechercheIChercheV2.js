/** 
 * Module pour l'objet {@link Panneau.RechercheIChercheV2}.
 * @module RechercheIChercheV2
 * @author Michael Lane, pas FADQ mais MSP
 * @version 1.0
 * @requires recherche
 */
define(['recherche', 'aide', 'point', 'multiPolygone', 'multiLigne', 'style', 'limites'], 
        function(Recherche, Aide, Point, MultiPolygone, MultiLigne, Style, Limites) {
      /** 
     * Création de l'object Panneau.RechercheIChercheV2.
     * Objet à ajouter à un objet localisation.
     * @constructor
     * @name Panneau.RechercheIChercheV2
     * @class Panneau.RechercheIChercheV2
     * @alias RechercheIChercheV2:Panneau.RechercheIChercheV2
     * @extends Recherche
     * @requires RechercheIChercheV2
     * @param {string} [options.titre='Adr.'] Titre du panneau.
     * @returns {Panneau.RechercheIChercheV2} Instance de {@link Panneau.RechercheIChercheV2}
    */
    function RechercheIChercheV2(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {

            titre:"ICherche V2",
            typeRecherche:"adresses, anciennes-adresses, anciennes-municipalites, bornes-km, bornes-sumi, entreprises, routes, codes-postaux, municipalites, mrc, regadmin, sorties-autoroute, lieux"
        });
        this.defautOptions = $.extend({}, Aide.obtenirConfig('RechercheIChercheV2'), this.defautOptions);
    };

    RechercheIChercheV2.prototype = new Recherche();
    RechercheIChercheV2.prototype.constructor = RechercheIChercheV2;
    
     /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheIChercheV2#obtenirAideHTML
     * @returns {String} Aide
    */
    RechercheIChercheV2.prototype.obtenirAideHTML = function() {
        return  "<span style='color:red; font-size: 1.3em'>**ATTENTION**</span> <br>\n\
                Utilise le service 'ichercheV2'. <br><br> \n\
                Ce service permet de chercher plusieurs types d'éléments différents.<br><br> \n\
                <div><b>Au besoin, ajouter un des tags suivant pour préciser les résultats: </b><br/> \n\
                #bornes, #bornes-sumi, #bornes-km, #adresses, #codes-postaux, #routes, #municipalites, #lieux, #entreprises</div><br/> \n\
                <b>Exemple:</b> <br/> 252 #bornes-sumi<br/> \n\
                         50 252 #bornes-km <br/>255 #bornes <br>2525 #adresses <br><br/>\n\
                Commentaire: <a href=\"mailto:msp911@msp.gouv.qc.ca?subject=Commentaire sur " + this.obtenirTitre() +" (IGO)\">msp911@msp.gouv.qc.ca</a>"
    };


    RechercheIChercheV2.prototype.appelerService = function() {
      
   
        var texte = this.obtenirValeursRecherche()['RechercheTitle' + this.options.id];
        if(!texte){
            Aide.afficherMessage({titre: "Recherche", message:'Veuillez entrer un texte à chercher'});
            return false;
        }

        $.ajax({
            url: Aide.utiliserProxy(this.options.urlServiceRecherche, true),
            data: {
                q: texte,
                type:  (this.options.typeRecherche || this.defautOptions.typeRecherche),
                geometry: true,
                limit: 50
            },
            context: this,
            success: this.lireReponse,
            error: this.appelerServiceErreur
        }); 
        
    };
    
    RechercheIChercheV2.prototype.lireReponse = function(data, status) {
        if(status !== "success"){
            var erreur;
            if(status === "ZERO_RESULTS"){
                erreur = "Aucun résultat";
            } else {
                erreur = "Erreur lors de la recherche. <br>";
                if(status){
                    erreur += status;
                }
            }  
            this.definirResultat(erreur);
            return false;
        }
        
        var stylePoint = new Style({
            opacite: 1,
            iconeHauteur: 34,
            iconeLargeur: 20,
            iconeOffsetX: -10,
            iconeOffsetY: -34,
            icone:  Aide.utiliserBaseUri('images/marqueur/marker-yellow.png')
        });

        var stylePolygon = new Style({
            visible: true,
            couleur:'#2e8cd6',
            limiteCouleur: '#2e8cd6',
            limiteOpacite: 1,
            opacite: 0.05,
        });

        var styleLigne = new Style({
            visible: true,
            couleur:'#2e8cd6',
            opacite: 1,
            limiteEpaisseur: 2
        })

        var regle = new Style({
                filtres: [{
                        filtre:"[geometry.type]=='Point'",
                        style: stylePoint
                    },
                    {
                        filtre: "[geometry.type]=='MultiPolygon'",
                        style: stylePolygon
                    },
                    {
                        filtre: "[geometry.type]=='Polygon'",
                        style: stylePolygon
                    },
                    {
                        filtre: "[geometry.type]=='MultiLineString'",
                        style: styleLigne
                    },
                    {
                        filtre: "[geometry.type]=='LineString'",
                        style: styleLigne
                    }
                ]
        });

         var styleSelectionne = new Style({
            etiquetteAlignement : 'ct',
            opacite:0.80,
            limiteEpaisseur: 3,
            couleur:'#2e8cd6',
            limiteCouleur: '#2e8cd6',
            etiquette: '${label}',
            etiquetteLimiteCouleur: 'white',
            etiquetteLimiteEpaisseur: 2,
            etiquetteEpaisseur: 2,
            icone:  Aide.utiliserBaseUri('images/marqueur/marker-green.png')
        });

        var styles = {defaut: regle, select: styleSelectionne, survol: styleSelectionne};
        
        //Igo.nav.carte.gestionCouches.trouverCouches(/Resultats Recherche ICherche.*/).forEach(value => {
        //    this.carte.gestionCouches.enleverCouche(value);
        //});
        var couchesICherche = Igo.nav.carte.gestionCouches.trouverCouches(/Resultats Recherche ICherche.*/);
         for(i=0;i<couchesICherche.length;i++){
                this.carte.gestionCouches.enleverCouche(couchesICherche[0]);
         }
            
            
        var vecteur = this.creerVecteurRecherche(styles, this.ajouterOccurences, {data: data.features});

    };
   
    RechercheIChercheV2.prototype.ajouterOccurences = function(e) {
       
        var vecteur = e.target;
        var data = e.options.params.data;

        $.each(data, function(key, value) {  //data.results
            var occureence = undefined;
            switch(value.geometry.type){
                case 'Point':
                    if(value.geometry.coordinates.length > 0){
                        var x = value.geometry.coordinates[0];
                        var y = value.geometry.coordinates[1]; 
                        var point = new Point(x, y);
                        var projCarte = Aide.obtenirNavigateur().carte.obtenirProjection();
                        occurence = point.projeter("EPSG:4326", projCarte);
                    }else{
                        Aide.afficherMessageConsole(value.properties.nom  + " n'a pas de coordonnée.");
                    }
                   
                break;
                case 'MultiPolygon':
                case 'Polygon':
                    if(value.geometry.coordinates.length > 0){
                        var geom = new MultiPolygone(value.geometry.coordinates);
                        var projCarte = Aide.obtenirNavigateur().carte.obtenirProjection();
                        occurence = geom.projeter("EPSG:4326", projCarte);
                    }else{
                        Aide.afficherMessageConsole(value.properties.nom + " n'a pas de coordonnée.");
                    }
                   
                break;
                case 'MultiLineString':
                case 'LineString':
                    if(value.geometry.coordinates.length > 0){
                        var geom = new MultiLigne(value.geometry.coordinates);
                        var projCarte = Aide.obtenirNavigateur().carte.obtenirProjection();
                        occurence = geom.projeter("EPSG:4326", projCarte);
                    }
                    else{
                        Aide.afficherMessageConsole(value.properties.recherche + " n'a pas de coordonnée.");   
                    }
                    
                break;
            }
            
            vecteur.creerOccurence(occurence, value);
        });

        vecteur.templates.table = {
            colonnes: [{
                titre: 'id',
                triable: true,
                propriete: 'properties.nom'
            }]
        };

        this.traiterResultatVecteur(vecteur); 
    };
    
    RechercheIChercheV2.prototype.traiterResultatVecteur = function(vecteur) {
        var nombreResultats = vecteur.listeOccurences.length ;
            
        var resultat = "";
        var debut = this.indexDebut+1;
        var fin = this.indexDebut+vecteur.listeOccurences.length;
        if(fin === 0){
            this.definirResultat('Aucun résultat');
            return false;
        }
        resultat += "<h4><u>Résultats (" + debut + " - " + fin + ")</u></h4>";
        $.each(vecteur.listeOccurences, function(row, occurence) {
            //un CSS de extjs brise le <strong> 
            var title = occurence.proprietes.highlight.title2 ? occurence.proprietes.properties.nom + ' (' + occurence.proprietes.highlight.title2 + ')' : occurence.proprietes.properties.nom;
            occurence.definirPropriete('adresse', occurence.proprietes.properties.nom);
            occurence.definirPropriete('label', occurence.proprietes.highlight.title2 ? occurence.proprietes.properties.nom + ' (' + occurence.proprietes.highlight.title2 + ')' : occurence.proprietes.properties.nom);

            if(occurence.proprietes.doc_type === 'ancienne_adresse'){
                title = occurence.proprietes.properties.adresse_reference + " ( anciennement " + title + ')';
                occurence.definirPropriete('adresse', occurence.proprietes.properties.adresse_reference);
                occurence.definirPropriete('ancienne_adresse', occurence.proprietes.properties.recherche);   
                occurence.definirPropriete('label', occurence.proprietes.properties.adresse_reference);
            }

            

            var couleur = 'blue';        
            resultat += "<li data-id='" + occurence.id + 
                    "' class='rechercheResultatsListe'><font color='"+couleur+"'><b>» </b><u>" + 
                    title+"</u></font></li>";
        });

        vecteur.ajouterDeclencheur("occurenceClique", function(e){
            e.target.deselectionnerTout();
            e.target.zoomerOccurence(e.occurence);
            e.occurence.selectionner();
            
        });

        vecteur.ajouterDeclencheur("occurenceSurvol", function(e){
            var resultats = document.getElementsByClassName('rechercheResultatsListe')
            if(resultats.item){
                for (var i = resultats.length - 1; i >= 0; i--) {
                    if(resultats[i].dataset.id === e.occurence.id){
                        resultats[i].style.backgroundColor = '#8DB2E3';
                        if(resultats[i].scrollIntoView){
                            resultats[i].scrollIntoView();
                        }
                    }
                }
                
            }
        });

        vecteur.ajouterDeclencheur("occurenceSurvolFin", function(e){
           var resultats = document.getElementsByClassName('rechercheResultatsListe')
            if(resultats.item){
                for (var i = resultats.length - 1; i >= 0; i--) {
                    if(resultats[i].dataset.id === e.occurence.id){
                        resultats[i].style.backgroundColor = "";
                    }
                }
                
            }
        });

        

        this.vecteur = vecteur;
        this.definirResultat(resultat, this.initEventResultat, this);
        this.activerCouchesAssociees();
       // Recherche.prototype.traiterResultatVecteur.call(this, vecteur);

        this.declencher({type: "resultatRecherche", vecteur: vecteur, texteRecherche: this.textUser});

        vecteur.garderHistorique = true;

        var occurence = vecteur.obtenirOccurences()[0];
        if(!occurence){
            return false;
        }
       // vecteur.zoomerOccurence(occurence, this.options.zoom);
        //occurence.selectionner();

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
                e.occurence.ouvrirInfobulle({html:e.occurence.proprietes.highlight, aFermerBouton: false});
            },
            {scope: this});
            vecteur.ajouterDeclencheur('occurenceSurvolFin', function(e){
                e.occurence.fermerInfobulle();
            },
            {scope: this});
        }
    
    };

    /**
     * Obtenir le panneau pour les éléments de la recherche
     * @method
     * @name Recherche#obtenirElementsRecherche
     * @returns {ExtJS}
     */
    RechercheIChercheV2.prototype.obtenirElementsRecherche = function() {
        var that = this;
        return [{
            xtype: 'textfield',
            fieldLabel: 'Texte',
            hideLabel: true,
            width: 260,
            id: 'RechercheTitle' + this.options.id,
            allowBlank: false,
            enableKeyEvents: true,
            scope: this,
            listeners: {
                keyup: function(field, e) {
                    var key = e.getKey();
                    if(field.getValue() != ''){
                      that.lancerRecherche();
                    }
                }
            }
        }];
    };
  
    return RechercheIChercheV2;
    
});