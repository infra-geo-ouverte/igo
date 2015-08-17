define(['aide','occurence', 'style'], function(Aide, Occurence, Style) {
    var geocodagePostScript = function(id){
        
            var panneauTemplate = { table : {
                        colonnes: [
                            {
                                titre: 'id',
                                triable: true,
                                propriete: 'idStat'
                            },
                            
                            { 
                                titre: 'Entrée',
                                triable: true,
                                propriete: 'entree'
                            },
                            { 
                                titre: 'Sortie',
                                triable: true,
                                propriete: 'adresseLibre'
                            },
                            { 
                                titre: 'Numéro civique',
                                triable: true,
                                propriete: 'noCiviq'
                            },
                            { 
                                titre: 'Numéro civique suffixe',
                                triable: true,
                                propriete: 'noCivqSuffx'
                            },
                            { 
                                titre: 'Numéro d\'appartement',
                                triable: true,
                                propriete: 'noApprt'
                            },
                            { 
                                titre: 'Numéro d\'appartement suffixe',
                                triable: true,
                                propriete: 'noApprtSuffx'
                            },
                             { 
                                titre: 'Rue',
                                triable: true,
                                propriete: 'nomRue'
                            },  
                            { 
                                titre: 'Municipalité',
                                triable: true,
                                propriete: 'mun'
                            },                            
                            { 
                                titre: 'Code Postal',
                                triable: true,
                                propriete: 'codePostal'
                            },
                            { 
                                titre: 'Coordonnée X',
                                triable: true,
                                propriete: 'x'
                            },
                            { 
                                titre: 'Coordonnée Y',
                                triable: true,
                                propriete: 'y'
                            },
                            { 
                                titre: 'Code de projection',
                                triable: true,
                                propriete: 'codeEPSG'
                            },
                            { 
                                titre: 'Date de mise à jour',
                                triable: true,
                                propriete: 'dateMiseAJour'
                            },
                            { 
                                titre: 'Index de similarité (Rue)',
                                triable: true,
                                propriete: 'similarityRue'
                            },  
                             { 
                                titre: 'Index de similarité (Municipalité)',
                                triable: true,
                                propriete: 'similarityMun'
                            }
                        ]
                    }
                };
        
        var modifierGeom = function(e){
                var projPoint = e.occurence.obtenirProjection();
                var projPropriete = projPoint;
                if(e.occurence.proprietes.codeEPSG){
                    var projPropriete = 'EPSG:'+e.occurence.proprietes.codeEPSG;
                }
                else{
                    e.occurence.proprietes.codeEPSG = projPropriete.substring(5);
                }
                                
                if(projPoint === projPropriete){
                    e.occurence.proprietes.x = e.occurence.x;
                    e.occurence.proprietes.y = e.occurence.y;
                }
                else{
                    var pointProjeter = e.occurence.projeter(projPropriete);
                    e.occurence.proprietes.x = pointProjeter.x;
                    e.occurence.proprietes.y = pointProjeter.y;
                }
                
                Igo.nav.obtenirPanneauxParType('PanneauTable')[0].rafraichir();
                
            };
        
        var selectionnerOccurencePanneauTable = function(e){
            this.deselectionnerTout();
            Igo.nav.obtenirPanneauxParType('PanneauTable')[0].selectionnerParOccurences(e.occurence);
        };
        
        var couche1a1 = new Igo.Couches.Vecteur({
                titre : '1 à 1',
                id: 'couche1a1',
                editable: true,
                typeGeometriePermise: 'Point',
                groupe: "Résultat"           
            });
            
            couche1a1.templates = panneauTemplate;
            
            couche1a1.ajouterDeclencheur("occurenceClique", selectionnerOccurencePanneauTable);
            
            couche1a1.ajouterDeclencheur("vecteurOccurenceModifiee", modifierGeom);
            
            var couche1a0 = new Igo.Couches.Vecteur({
                titre : '1 à 0',
                id: 'couche1a0',
                editable: true,
                typeGeometriePermise: 'Point',
                groupe: "Résultat",
                geometrieNullePermise: true

            });
            
            couche1a0.templates = panneauTemplate;
            
            couche1a0.ajouterDeclencheur("occurenceClique", selectionnerOccurencePanneauTable);
            
            couche1a0.ajouterDeclencheur("vecteurOccurenceModifiee", modifierGeom);
            
            var couche1aN = new Igo.Couches.Vecteur({
                titre : '1 à N',
                id: 'couche1aN',
                editable: true,
                supprimable: true,
                typeGeometriePermise: 'Point',
                groupe: "Résultat"
                             
            });
            
            couche1aN.templates = panneauTemplate;
            
            couche1aN.ajouterDeclencheur("occurenceClique", selectionnerOccurencePanneauTable);
            
            couche1aN.ajouterDeclencheur("vecteurOccurenceModifiee", modifierGeom);
            
            /*var couche1aNCluster = new Igo.Couches.VecteurCluster({
                titre : '1 à N Cluster',
                id: 'couche1aNCluster',
                editable: true,
                supprimable: true,
                typeGeometriePermise: 'Point',
                groupe: "Résultat",
                clusterZoomMax: 15
                             
            });
            couche1aNCluster.templates = panneauTemplate;
            */
           
            this.gestionCouches.ajouterCouches([couche1a1, couche1a0,couche1aN]);   

             OpenLayers.Request.GET({
                 url: this.gestionCouches.obtenirCoucheParId('resultatGeo').options.source,
                 success: geocodagePostScript.lireReponse,
                 error: geocodagePostScript.appelerServiceErreur
             });        
    };
    
    geocodagePostScript.lireReponse = function(data, status, b){

        var json = new OpenLayers.Format.JSON().read( data.responseText );

        if(json.etat !== undefined && json.commentaire !== undefined){
            Igo.Aide.afficherMessageChargement({message: "Revenez plus tard : "+json.commentaire});
        }
        else{ 

            $.each(json, function(key, value){
                if(value){
                    if(value.geocoderReponseListe !== undefined && value.nombreResultat !== undefined ){
                        if(value.nombreResultat === 1){

                            $.each(value.geocoderReponseListe, function(key2, value2) {

                                var x=value2.x;
                                var y=value2.y;
                                var proj="EPSG:"+ value2.codeEPSG;
                                var geom = new Igo.Geometrie.Point(x,y,proj);
                                geom = geom.projeter('EPSG:3857');

                                var style = new Style({
                                    visible: true,
                                    icone: Aide.utiliserBaseUri('images/marqueur/marker-green.png'),
                                    iconeHauteur: 34,
                                    iconeLargeur: 20,
                                    iconeOffsetX: -10,
                                    iconeOffsetY: -34
                                });
                                
                                 var valeur = {"entree":value.entree};
                                $.extend(valeur, value2);
                                
                                var occurence = new Occurence(geom,valeur,style,{});
                                Igo.nav.carte.gestionCouches.obtenirCoucheParId('couche1a1').ajouterOccurence(occurence);
                            });
                        }
                        if(value.nombreResultat > 1){

                            var couleurAleatoire = '#'+Math.floor(Math.random()*16777215).toString(16);

                            $.each(value.geocoderReponseListe, function(key2, value2) {

                                var x=value2.x;
                                var y=value2.y;
                                var proj="EPSG:"+ value2.codeEPSG;
                                var geom = new Igo.Geometrie.Point(x,y,proj);
                                geom = geom.projeter('EPSG:3857');
                                                    
                                var style = new Style({
                                    visible: true,
                                    couleur : couleurAleatoire
                                });
                                
                                var valeur = {"entree":value.entree};
                                $.extend(valeur, value2);
                                
                                var occurence = new Occurence(geom,valeur,style,{});
                                Igo.nav.carte.gestionCouches.obtenirCoucheParId('couche1aN').ajouterOccurence(occurence);                            
                               
                            });
                        }
                        if(value.nombreResultat === 0){
                            var x = null;
                            var y = null;
                            var proj =null;
                            
                            var occurence = new Occurence(null,value,{},{typeGeometrie:'Point'});
                            Igo.nav.carte.gestionCouches.obtenirCoucheParId('couche1a0').ajouterOccurence(occurence);
                        }
                    }
                }
            });
        }
    };
        
    geocodagePostScript.appelerServiceErreur = function(data, status) {
            alert('Erreur lors de l\'appel au serveur. Veuillez rafraichir la page.');
    };

    return geocodagePostScript;
});