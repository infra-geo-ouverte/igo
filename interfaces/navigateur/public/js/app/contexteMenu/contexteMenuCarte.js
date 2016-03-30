define(['contexteMenu', 'point', 'polygone', 'occurence', 'aide', 'analyseurGML', 'fonctions', 'vecteur'], function(ContexteMenu, Point, Polygone, Occurence, Aide, AnalyseurGML, Fonctions, Vecteur) {  
    function ContexteMenuCarte(options){
        this.options = options || {};   
        this.init();
    };
    
    ContexteMenuCarte.prototype = new ContexteMenu();
    ContexteMenuCarte.prototype.constructor = ContexteMenuCarte;
    
    ContexteMenuCarte.prototype.init = function(){
        var that=this;
        ContexteMenu.prototype.init.call(this);
         
        this.ajouterFonctionsConstruction(this.initCoordonneesSubmenu);
        this.ajouterFonctionsConstruction(this.initImporterOccurenceSubmenu);
        this.ajouterFonctionsConstruction(this.initOccurencesSubmenu);
        this.ajouterFonctionsConstruction(this.initSelectionSubmenu);
         
        this.$selecteur.on('mousedown',function(e){
            if (e.which === 1) {
                if(that.contexteMenu.isVisible()){
                    that.contexteMenu.hide();
                }
           }
        });
    };
    
    ContexteMenuCarte.prototype.obtenirInformation = function(e){
        var offset=this.$selecteur.offset();
        var pixel=new OpenLayers.Pixel(e.pageX-offset.left, e.pageY-offset.top);
        var lonlat = this.options.carte._carteOL.getLonLatFromViewPortPx(pixel);
        var point = new Point(lonlat.lon, lonlat.lat);
        var occurencesSurvolees = this.options.carte.gestionCouches.obtenirListeOccurencesSurvols().slice();
        var occurencesSelectionnees = this.options.carte.gestionCouches.obtenirOccurencesSelectionnees(false);
        
        return {
            point: point, 
            occurencesSurvolees: occurencesSurvolees, 
            occurencesSelectionnees:occurencesSelectionnees
        };
    };
    
    ContexteMenuCarte.prototype.initCoordonneesSubmenu = function(args){ 
        return {
            id: 'coordonneesSubmenu',
            text: 'Coordonnées',
            menu: {
                items: [{
                    id: 'coordonneesCarte',
                    text: "Projection de la carte",
                    handler: function(){
                        Aide.afficherMessage('Coordonnées', args.point.x + ', ' + args.point.y);
                    }
                }, {
                    id: 'coordonnees4326',
                    text: "Projection EPSG:4326",
                    handler: function(){
                        var pProj = args.point.projeter('EPSG:4326');
                        Aide.afficherMessage('Coordonnées', pProj.x + ', ' + pProj.y);
                    }
                }]
            }
        };
    };
    
    ContexteMenuCarte.prototype.initImporterOccurenceSubmenu = function(args){ 
        var that=args.scope;
        var coucheWFSActive = that.options.carte.gestionCouches.coucheWFSActive;
        if(!coucheWFSActive || !coucheWFSActive.estActive()){
            return false;
        }
        var carteEchelle = that.options.carte.obtenirEchelle();
        if(carteEchelle > coucheWFSActive.options.echelleMin || carteEchelle < coucheWFSActive.options.echelleMax){
            return false;
        }
        return {
            id: 'importerOccurenceSubmenu',
            text: 'Importer occurence',
            handler: function(){
                Aide.afficherMessageChargement({message: 'Importation en cours, patientez un moment...'});
                var pProj = args.point.projeter('EPSG:32198');
                //var filtre = "<Filter><Intersects><PropertyName>Geometry</PropertyName><gml:Point><gml:coordinates>"+pProj.x+" "+pProj.y+"</gml:coordinates></gml:Point></Intersects></Filter>";
                //var filtre = "<Filter><DWithin><PropertyName>Geometry</PropertyName><gml:Point><gml:coordinates>"+pProj.x+" "+pProj.y+"</gml:coordinates></gml:Point><Distance units='m'>100000</Distance></DWithin></Filter>";
                var resolution = that.options.carte._carteOL.getResolution()*3;
                var minX = pProj.x-resolution;
                var minY = pProj.y-resolution;
                var maxX = pProj.x+resolution;
                var maxY = pProj.y+resolution;
                
                var filtre = "<Filter><BBOX><PropertyName>Geometry</PropertyName><Box srsName='EPSG:32198'><coordinates>"+minX+","+minY+" "+maxX+","+maxY+"</coordinates></Box></BBOX></Filter>";
                //pour les attributs, dans le mapfile: "gml_include_items" "all"
                $.ajax({
                    url: coucheWFSActive.options.url,
                    data: {
                        MAP: coucheWFSActive.options.mapdir,
                        SERVICE:'WFS',
                        VERSION: '1.0.0',
                        REQUEST: 'getfeature',
                        TYPENAME: coucheWFSActive.options.nom, //'CASERNE',//'MELS_CS_FRANCO_S'
                        FILTER: filtre
                        //OUTPUTFORMAT: 'GEOJSON'
                    },
                    //crossDomain: true, //utilisation du proxy
                    //async:false,
                    context:this,
                    success:function(resultat){      
                        var id = "_"+coucheWFSActive.obtenirId()+'_Importation';
                        var couche = that.options.carte.gestionCouches.obtenirCoucheParId(id);
                        if(!couche){
                            couche = new Igo.Couches.Vecteur({id: id , titre:coucheWFSActive.obtenirTitre()+'-Importation', simplificationZoom: true, active:true, selectionnable: true, ordreAffichage: coucheWFSActive.obtenirOrdreAffichage()+1});
                            that.options.carte.gestionCouches.ajouterCouche(couche);
                        }
                        
                        //var formatXML = new AnalyseurGeoJSON({projectionCarte: that.options.carte.obtenirProjection()});
                        var formatXML = new AnalyseurGML({projectionCarte: that.options.carte.obtenirProjection()});
                        var features = formatXML.lire(resultat);
                        if(!Aide.obtenirNavigateur().obtenirCtrl()){
                            couche.enleverTout();
                        };
                        if(!features.length){
                            Aide.afficherMessage("Aucune donnée trouvée", "Aucune donnée n'a été trouvée");
                        }
                        $.each(features, function(key, feature){
                            couche.ajouterOccurence(feature);
                        });
                        Aide.cacherMessageChargement();
     
                    },
                    dataType: 'XML', //'JSON',
                    error:function(){alert("error...");}
                });
            }
        };
    }; 
        
    ContexteMenuCarte.prototype.initOccurencesSubmenu = function(args){
        var that=args.scope;
        if(args.occurencesSurvolees.length !== 0){
            var menu = {
                id: 'occurencesSubmenu',
                text: 'Occurences',
                menu: {
                    items: []
                }
            };

            menu.menu.items.push({
                id: 'occurencesInfo',
                text: 'Info',
                handler: function(){
                    Fonctions.afficherProprietes(args.occurencesSurvolees);
                }
            });        
            
            $.each(args.occurencesSurvolees, function(key, occurence){
                var submenu = {
                    id: 'occurence'+key,
                    text: occurence.vecteur.obtenirTitre(),
                    menu: {
                        items: []
                    },
                    listeners: {
                        afterrender: function(){
                            $('#occurence'+key).mouseover(function(){
                                occurence.appliquerStyle("courant", "survolPlus");
                            });
                            $('#occurence'+key).mouseout(function(){
                                occurence.appliquerStyle("courant");
                            });
                        }
                    }
                };
                var occurenceMenu = submenu.menu.items;
//                occurenceMenu.push({
//                    id: 'occurenceInfo' + key,
//                    text: "Info",
//                    handler: function(){                           
//                        var obtenirHTML = function(json){
//                            var html="";
//                            $.each(json, function(key, value){
//                                if(value instanceof Object){
//                                    var objetHtml = "<p class='popupObjet"+occurence.id+"' data-propriete='"+JSON.stringify(value).replace(/'/g, "\\'")+"'>"+key+" : +</p>";
//                                    html += objetHtml;    
//                                    return true;
//                                }
//                                html += "<p>"+key+" : "+value+"</p>";
//                            });
//                            
//                            occurence.ouvrirInfobulle({html: html});
//                            
//                            $('.popupObjet'+occurence.id).bind('click', function(e){
//                                var json = $(e.target).data('propriete');
//                                obtenirHTML(json);
//                            });
//                        }
//                        
//                        obtenirHTML(occurence.obtenirProprietes());
//      
//                        //Aide.afficherMessage('Informations', infos);
//                    }
//                });


                if(occurence.vecteur.options.selectionnable && occurence.vecteur.options.supprimable !== false && occurence.obtenirTypeClasse() !== 'Cluster' && occurence.vecteur.options.protege !== true){
                    occurenceMenu.push({
                        id: 'occurenceSupprimer' + key,
                        text: "Supprimer",
                        handler: function(){
                            occurence.vecteur.enleverOccurence(occurence);
                        }
                    });
                }

                if(occurence.type === 'Ligne'){
                    occurenceMenu.push('-');
                    occurenceMenu.push({
                        id: 'occurenceLongueur' + key,
                        text: "Longueur",
                        handler: function(){
                            var longueur = occurence.obtenirLongueur();
                            Aide.afficherMessage('Longueur', longueur + ' ' + that.options.carte._carteOL.getUnits());
                        }
                    });
                    
                    //Ajout du sous-menu pour fermer la ligne
                    //var subMenuFermerLigne = args.scope.fermerLigne(key, [occurence], that);
                
                    //if(subMenuFermerLigne){
                    //    occurenceMenu.push(subMenuFermerLigne);
                    //}
                    
                } else if(occurence.type === 'Polygone' || occurence.type === 'MultiPolygone'){
                    occurenceMenu.push('-');
                    occurenceMenu.push({
                        id: 'occurencePerimetre' + key,
                        text: "Périmètre",
                        handler: function(){
                            var perimetre = occurence.obtenirPerimetre();
                            Aide.afficherMessage('Périmètre', perimetre + ' ' + that.options.carte._carteOL.getUnits());
                        }
                    },{
                        id: 'occurenceSuperficie' + key,
                        text: "Superficie",
                        handler: function(){
                            var superficie = occurence.obtenirSuperficie();
                            Aide.afficherMessage('Superficie', superficie + ' ' + that.options.carte._carteOL.getUnits() + "²");
                        }
                    }); 
                }
                   
                var submenuCopieVers = that.initSubMenuCopieVers(key, occurence);
                
                if(submenuCopieVers){
                    occurenceMenu.push(submenuCopieVers);
                }
                               
                if(occurenceMenu.length !== 0){
                    menu.menu.items.push(submenu);
                }
                               
            });
        }
        return menu;
    };
    
    ContexteMenuCarte.prototype.initSelectionSubmenu = function(args){
        if(args.occurencesSelectionnees.length !== 0){
                 
            var type = "";
            var memeType = true;
            $.each(args.occurencesSelectionnees, function(index, occurence){   
               if(type === ""){
                   type=occurence.type;
               }
               else{
                   if(type !== occurence.type){
                       memeType = false;
                   }
               }                
            });
            
            var subSelection =  {
                id: 'selectionSubmenu',
                text: 'Selection',
                menu: {
                    items: [{
                        id: 'selectionCompter',
                        text: "Compter",
                        handler: function(){
                            Aide.afficherMessage('Informations', args.occurencesSelectionnees.length + ' occurences selectionnées');
                        }
                    }]
                }
            };
            subSelection.menu.items.push({
                id: 'selectionInfo',
                text: 'Info',
                handler: function(){
                    Fonctions.afficherProprietes(args.occurencesSelectionnees);
                }
            });        
            
            if(memeType){
                var submenuCopieVers = args.scope.initSubMenuCopieVers("-1", args.occurencesSelectionnees, type);
                
                if(submenuCopieVers){
                    subSelection.menu.items.push(submenuCopieVers);
                }
            }
            
            if(args.occurencesSelectionnees.length === 1 && args.occurencesSelectionnees[0]._obtenirGeometrie() === undefined ){
                 var submenuCreeGeometrie = {
                    id: 'creeGeo',
                    text: "Créer la geométrie ici!",
                    handler: function(){
                        args.occurencesSelectionnees[0].majGeometrie(args.point);
                    }
                };
                
                subSelection.menu.items.push(submenuCreeGeometrie);
            }
            
            
            return subSelection;         
        }
    };
    
    /**
     * Ajout du menu pour copier la géométrie vers un couche acceptant le type de la géométrie
     * @method
     * @name ContexteMenuCarte#initSubMenuCopieVers
     * @param {integer} key clé de l'occurence, "-1" si sélection d'occurrences
     * @param {Occurence} occurence instance de l'objet occurence || liste d'occurences
     * @param {string} type Type de géométrie pour la liste d'occurences
     * return {submenu} retourne un sous menu avec la liste des couches disponible
     */
    ContexteMenuCarte.prototype.initSubMenuCopieVers = function(key, occurence, type){
        if(!type){
            type = occurence.type;
        }
        //Obtenir la liste des couches vecteur
        var listeCouche = [];
        if(type === "Ligne" || type === "Polygone"){
            listeCouche = this.options.carte.gestionCouches.obtenirCouchesParTypePermis("Ligne");
            listeCouche = listeCouche.concat(this.options.carte.gestionCouches.obtenirCouchesParTypePermis("Polygone"));
            $.unique(listeCouche);
        } else {
            listeCouche = this.options.carte.gestionCouches.obtenirCouchesParTypePermis(type);  
        }
        //var listeCouche = this.options.carte.gestionCouches.obtenirCouchesParTypePermis(type);  
        //var listeCouche = this.options.carte.gestionCouches.obtenirCouchesParType("Vecteur");
                            //Si une seule occurence
        if(occurence.obtenirTypeClasse){
            occurence = [occurence];
        } 
        var coucheDe = [];
        
        for (var i = 0; i < occurence.length; i++) { 
            var occu = occurence[i];
            if(occu.obtenirTypeClasse() === "Occurence"){
                coucheDe.push(occu.vecteur);
            } else {
                occurence.remove(occu);
            }  
        }

        $.unique(coucheDe);
        if(coucheDe.length === 1){
            listeCouche.remove(coucheDe[0]);
        }
        
        if(listeCouche.length === 0 || occurence.length === 0){
            return false;
        }
         
        var submenuCopieVers = {
            id: 'copieVers'+key,
            text: "Copier vers la couche...",
            menu: {
                items: []
            }
        };

        //Ajouter un option pour chaque couche vecteur
        $.each(listeCouche, function(index, couche) {
            var titre = couche.obtenirTitre();
            submenuCopieVers.menu.items.push({
                id: 'coucheCopie' + key + titre,
                text: titre,
                handler: function(){                   
                    //Pour chaque occurence de la sélection
                    $.each(occurence, function(ind, occu){
                        var clone = occu.cloner();

                        //Si on copie vers la même couche, on nettoie les attributs pour contrer les doublons du ID
                        if(occu.vecteur === couche){
                            clone.reinitialiserAttributs();
                        }
                        
                        if(couche.options.typeGeometriePermise && couche.options.typeGeometriePermise !== clone.obtenirTypeGeometrie()){
                            if(couche.options.typeGeometriePermise === "Ligne"){
                                if(clone.obtenirTypeGeometrie() === "Polygone"){
                                    clone = clone.obtenirExterieur();
                                }
                            } else if (couche.options.typeGeometriePermise === "Polygone"){
                                if(clone.obtenirTypeGeometrie() === "Ligne"){
                                    clone = new Polygone(clone._obtenirGeometrie());
                                }
                            }
                        }
                        couche.ajouterOccurence(clone);
                    });
                } 
           });  
        });

        return submenuCopieVers;
    };
    
    /**
     * Création du sous-menu pour fermer une/des géométrie(s) de type ligne
     * @method
     * @name ContexteMenuCarte#fermerLigne
     * @param {integer} key clé de l'occurence, "-1" si sélection d'occurrences
     * @param {array} occurences tableau d'occurence
     * @param {contexte} contexte d'exécution
     * @returns {subMenu} un sous menu pour fermer la géométrie
     */
//    ContexteMenuCarte.prototype.fermerLigne = function(key, occurences, contexte){      
//        var that = contexte;
//        
//        var titre;
//        if(occurences.length >1){
//            titre = "Fermer les géométries";
//        } else{
//            titre = "Fermer la géométrie";
//        }
//               
//        var submenuFermerLigne = {
//            id: 'FermerLigne'+key,
//            text: titre,
//            handler: function(){               
//                var tabOccuFermeExcep = new Array();
//                
//                $.each(occurences, function(index, occurence){                   
//                    var polygone = new Polygone(occurence._obtenirGeometrie());
//                    var occurenceFerme = new Occurence(polygone, occurence.proprietes, occurence.styles);
//                    var result = occurence.vecteur.ajouterOccurence(occurenceFerme);
//                    
//                    //Si l'ajout de l'occurence n'est pas permis dans le même vecteur, on les pile
//                    if(result === false){                       
//                        tabOccuFermeExcep.push(occurenceFerme);                       
//                    }
//                });
//                
//                //Si des occurences n'ont pas pu être fermées
//                if(tabOccuFermeExcep.length > 0){
//                
//                    var coucheTemp = that.options.carte.gestionCouches.obtenirCouchesParTitre("couchePolygoneFerme")[0];
//                    if(!coucheTemp) {
//                        var coucheTemp = new Vecteur({id: "couchePolygoneFerme", titre: "couchePolygoneFerme", editable:true, active:true, visible:true});
//                        that.options.carte.gestionCouches.ajouterCouche(coucheTemp);
//                    }
//                    coucheTemp.ajouterOccurences(tabOccuFermeExcep);
//                }
//            }
//        };   
//
//        return submenuFermerLigne;
//    };
                
    return ContexteMenuCarte;
    
});
