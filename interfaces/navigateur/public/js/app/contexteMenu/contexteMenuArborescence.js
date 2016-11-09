require.ajouterConfig({
    paths: {
      dateTimeIntervalPicker: "libs/extension/Extjs/DateTimeIntervalPicker"
    }
});

define(['contexteMenu', 'aide', 'fonctions', 'panneauTable', 'dateTimeIntervalPicker'], function(ContexteMenu, Aide, Fonctions, PanneauTable, DateTimeIntervalPicker) {
  
    function ContexteMenuArborescence(options){
        this.options = options || {};   
        this.locale= {
            deleteLayerText : "Effacer la couche",
            deleteLayerConfirmationText : "Êtes-vous certain de vouloir effacer cette couche: ",
            changeOpacityText : "Changer l'opacité",
            changeStyleText: "Changer la couleur",
            bringToText: "Mettre en",
            frontText : "avant",
            backText : "arrière",
            closeText : "Fermer",
            metadataText : "Informations sur la couche"
        };
        this.init();
    };
    
    ContexteMenuArborescence.prototype = new ContexteMenu();
    ContexteMenuArborescence.prototype.constructor = ContexteMenuArborescence;
    
    ContexteMenuArborescence.prototype.init = function(){
        ContexteMenu.prototype.init.call(this);
        this.ajouterFonctionsConstruction(this.initOpaciteSubmenu);      
        this.ajouterFonctionsConstruction(this.initStyleSubmenu);
        this.ajouterFonctionsConstruction(this.initOrdreAffichageSubmenu);
        this.ajouterFonctionsConstruction(this.initOuvrirTableVecteur);
        this.ajouterFonctionsConstruction(this.initZoomEmprise);
        this.ajouterFonctionsConstruction(this.initSelectionnerTout);
        this.ajouterFonctionsConstruction(this.initActiverImportationSubmenu);
        this.ajouterFonctionsConstruction(this.initWMStime);
        this.ajouterFonctionsConstruction(this.initMetadonneeSubmenu);
        this.ajouterFonctionsConstruction(this.initSupprimerVecteurSubmenu);
        this.ajouterFonctionsConstruction(this.initFermerSubmenu);
        
    };
    
    ContexteMenuArborescence.prototype.obtenirInformation = function(e){
        var nodeHtml;
        var $target = $(e.target);
        if($target[0].attributes['ext:tree-node-id']){
            nodeHtml = $target;
        } else {
            nodeHtml = $target.parentsUntil(this.$selecteur, '.x-tree-node-el');
        }
        if(nodeHtml.length===0){ return false; }
        var id = nodeHtml[0].attributes['ext:tree-node-id'].value;
        var node = this.options.arborescence._panel.nodeHash[id];
        if(!node.layer){return false;}
        var gestionCouches=this.options.arborescence.carte.gestionCouches;
        var layer = gestionCouches.obtenirCoucheParId(node.attributes.layer.id);
        if(!layer){return false;}
        return {
            couche: layer,
            nodeHtml: nodeHtml
        };
    };


    ContexteMenuArborescence.prototype.initMetadonneeSubmenu = function(args){ 
        var that=args.scope;
        if (args.couche.options.metadonnee) {
            return {
                id: 'arborescenceMetadonnee',
                text : that.locale.metadataText,
                handler : function() {
                    require(['metadonnee'], function(Metadonnee){
                        Metadonnee.getLayerCapabilities(args.couche);
                    });
                }
            };
        }
    };

    ContexteMenuArborescence.prototype.initStyleSubmenu = function(args){ 
        var that=args.scope;
        if(!Aide.toBoolean(args.couche.options.styleSubmenu)) {return false;}
        return {
            id: 'arborescenceStyle',
            text : that.locale.changeStyleText,
            menu : {
                id: 'arborescenceStyleCouleur',
                plain : true,
                items : {
                    //html: "# <input type='text' id='picker'></input>", 
                    html: "<button id='picker'></button>", 
                    listeners: {
                        afterrender:function(){
                            var $picker = $('#picker');
                            if(!require.estDansConfig("colpick")){
                                require.ajouterConfig({
                                    paths: {
                                        colpick: 'libs/jquery/extensions/color-picker/js/colpick'
                                    },
                                    shim: {
                                        colpick: {
                                            deps: ['css!libs/jquery/extensions/color-picker/css/colpick']
                                        }
                                    }
                                });
                            }
                            
                            var couleur = args.couche.obtenirStyle().obtenirPropriete("couleur");
                            if (couleur[0] !== "#"){
                                var splitValeur = couleur.split(" ");
                                if(splitValeur.length === 3){
                                    couleur = Fonctions.rgbToHex(Number(splitValeur[0]), Number(splitValeur[1]), Number(splitValeur[2]));
                                } else {
                                    couleur = "";
                                }
                            }
                            requirejs(["colpick"], function(){
                               $picker.colpick({
                                    layout:'rgbhex',
                                    submit: true,
                                    submitText: "Appliquer",
                                    color: couleur.substr(1),
                                    onChange:function(hsb,hex,rgb,el,bySetColor) {
                                        $(el).css('background-color','#'+hex);
                                        //$(el).css('border-color','#'+hex);
                                        if(!bySetColor) $(el).val(hex);
                                    },
                                    onSubmit: function(){         
                                        args.couche.obtenirStyle().definirPropriete("couleur", "#"+$picker.val());
                                    }
                                }).keyup(function(){
                                    $(this).colpickSetColor(this.value);
                                });
                            });
                            $picker.val(couleur.substr(1));
                            $picker.css('background-color', couleur);
                            //$picker.css('border-color', couleur);
                            $picker.css('height', "25px");
                            $picker.css('width', "50px");
                            $picker.parent().css("padding", "2px");
                        }
                    },
                    handler: function(){
                      return false;
                    }
                }
            }
        };
    };

    ContexteMenuArborescence.prototype.initOpaciteSubmenu = function(args){ 
        if (args.couche.options.opaciteSlider !== false) {      
            var that=args.scope;
            var sliderOptions = {
                layer : args.couche._layer,
                width : 200
            };

            sliderOptions.plugins = new GeoExt.SliderTip();

            return {
                id: 'arborescenceOpacite',
                text : that.locale.changeOpacityText,
                menu : {
                    id: 'arborescenceOpacitySlider',
                    plain : true,
                    items : [ new GeoExt.LayerOpacitySlider(sliderOptions) ]
                }
            };
        }
    };
     ContexteMenuArborescence.prototype.initWMStime = function(args){ 
        if (args.couche.options.wms_timeextent) {        
            // This is a layer from the MSP map file. In which case we read the msp metadata.
            // Create the DatePicker
            var periode = Fonctions.obtenirPeriodeTemps(args.couche.options.wms_timeextent);
      
            var datePicker = new DateTimeIntervalPicker({
                id : 'datePicker',
                layer : args.couche._layer,
                allowIntervals : periode.allowIntervals,
                minStartDate : periode.min,
                maxEndDate : periode.max,
                mapServerTimeString : args.couche.options.wms_timedefault,
                precision : args.couche.options.wms_timeprecision || periode.precision
            });

            return {
                id: 'arborescenceWMST',
                text : datePicker.label,
                menu : {
                    plain : true,
                    items : [ datePicker ]
                }
            };
        }
        // This is a wms layer.
        else if (args.couche._layer.options.metadata && args.couche._layer.options.metadata.dimensions.time) {
            var startDate = null;
            var endDate = null;

            // In the case of a WMST layer version 1.1.1 as implemented by EC.
            // Requires the OpenLayer fix as implemented by F.Morin. 
            // OpenLayer ticket number 3607: http://trac.osgeo.org/openlayers/ticket/3607
            if (args.couche._layer.options.metadata.extents && args.couche._layer.options.metadata.extents.time) {
                // Read the extent and apply start and end dates.
                //ex of date extent: "2012-01-14T18:00:00Z/2012-01-17T06:00:00Z/PT6H"
                var timeExtentArray = args.couche._layer.options.metadata.extents.time.values[0].split("/");								
                startDate = Fonctions.createDateFromIsoString(timeExtentArray[0]);
                endDate = Fonctions.createDateFromIsoString(timeExtentArray[1]);

            // In the case of a WMST layer as implemented by MapServer
            }else if(args.couche._layer.options.metadata.dimensions.time.values){
                var timeExtentArray = args.couche._layer.options.metadata.dimensions.time.values[0].split("/");								
                startDate = Fonctions.createDateFromIsoString(timeExtentArray[0]);
                endDate = Fonctions.createDateFromIsoString(timeExtentArray[1]);
            }
            // Create the DatePicker
            var datePicker = new DateTimeIntervalPicker({
                id : 'datePicker',
                layer : args.couche._layer,
                allowIntervals : endDate!==null?true:false,
                minStartDate : startDate,
                maxEndDate : endDate,
                mapServerTimeString : args.couche._layer.options.metadata.dimensions.time['default'],
                precision : 'minute'
            });

            return {
                id: 'arborescenceWMST',
                text : datePicker.label,
                menu : {
                    plain : true,
                    items : [ datePicker ]
                }
            };
        }
    };
        
    ContexteMenuArborescence.prototype.initSupprimerVecteurSubmenu = function(args){ 
        var that=args.scope;
        if (args.couche._layer.allowDelete || args.couche.options.suppressionPermise) {
            return {
                id: 'arborescenceDeleteLayer',
                text : that.locale.deleteLayerText,
                handler : function() {
                    Aide.afficherMessage({
                        title: that.locale.deleteLayerText, 
                        message: that.locale.deleteLayerConfirmationText + args.couche.obtenirTitre(),
                        boutons: 'OUINON',
                        action :function(btn) {
                            if (btn == 'yes') {
                                var gestionCouches=that.options.arborescence.carte.gestionCouches;
                                gestionCouches.enleverCouche(args.couche);
                            }
                        }
                    });
                }
            };
        }
    };
        
    ContexteMenuArborescence.prototype.initActiverImportationSubmenu = function(args){ 
        if (args.couche.options.importationWFS) {
            var coucheWFS = args.couche;
            var coucheWFSActive = coucheWFS.carte.gestionCouches.coucheWFSActive;
            var text = "Activer importation";
            if(coucheWFSActive == coucheWFS){
                text = "Desactiver importation";
                coucheWFS = undefined;
            }
            return {
                id: 'arborescenceActiverImportation',
                text : text,
                handler : function() {
                    if(coucheWFSActive){
                        coucheWFSActive._nodeHtml.css('background-color', '');
                    }
                    
                    if(coucheWFS){
                        args.nodeHtml.css('background-color', '#c8dbc9');
                        coucheWFS._nodeHtml = args.nodeHtml;
                    } 
                    
                    args.couche.carte.gestionCouches.coucheWFSActive = coucheWFS;
                }
            };
        }
    };
    
    ContexteMenuArborescence.prototype.initZoomEmprise = function(args){
    	
    	if(args.couche.obtenirTypeClasse() === 'Vecteur' || args.couche.obtenirTypeClasse() === 'VecteurCluster' || args.couche.obtenirTypeClasse() === 'WFS') {
    	    return {
                id: 'arborescenceZoomEmpriseVecteur',
                text : 'Zoom sur l\'emprise',
                handler : function() {
                    args.couche.zoomerOccurences();
                }
            };
    	}
    	//TODO else if WMS
    	
    };

    ContexteMenuArborescence.prototype.initSelectionnerTout = function(args){
      
        if( args.couche.obtenirTypeClasse() === 'Vecteur' ) {
    	    return {
                id: 'arborescenceSelectionnerToutVecteur',
                text : 'Sélectionner tout',
                handler : function() {
                    args.couche.selectionnerTout();
                }
            };
    	}  
    };
    
    
    
    ContexteMenuArborescence.prototype.initOuvrirTableVecteur = function(args){      
        var that=args.scope;
        var arbo = that.options.arborescence;
        var aPanneauTable = false;
        var panneauTable;
        if(arbo.options.idResultatTable && (args.couche.obtenirTypeClasse() === 'Vecteur' || args.couche.obtenirTypeClasse() === 'WFS' || args.couche.obtenirTypeClasse() === 'VecteurCluster')){
            var nav = Aide.obtenirNavigateur();
            panneauTable = nav.obtenirPanneauParId(arbo.options.idResultatTable, -1);
            if(panneauTable && panneauTable.obtenirTypeClasse){aPanneauTable = true;}
            
        }
        if(aPanneauTable){
            return {
                id: 'OuvrirTableVecteur',
                text : 'Ouvrir table propriétés',
                handler : function() {
                    if (panneauTable.obtenirTypeClasse() === 'PanneauTable') {
                        panneauTable.ouvrirTableVecteur(args.couche);
                    } else if(panneauTable.obtenirTypeClasse() === 'PanneauOnglet'){
                        var existe = false;
                        $.each(panneauTable.listeOnglets, function(value, onglet){
                            if(onglet.donnees === args.couche){
                                panneauTable.activerPanneau(onglet);
                                existe = true;
                                return false;
                            }
                        });
                        
                        if(!existe){

                           //aller chercher les options passées dans le XML
                           //TODO faire une méthode pour ça
                            var options = {reductible: false,
                                            fermable: true,
                                            paginer: Aide.toBoolean(panneauTable.options.paginer),
                                            paginer_debut: panneauTable.options.paginer_debut,
                                            paginer_limite: panneauTable.options.paginer_limite,
                                            outils_auto: Aide.toBoolean(panneauTable.options.outils_auto),
                                            outils_contenupage: Aide.toBoolean(panneauTable.options.outils_contenupage),
                                            outils_selectionSeulement: Aide.toBoolean(panneauTable.options.outils_selectionSeulement)
                                          };

                            var nouvelleTable = new PanneauTable(options);
                            panneauTable.ajouterPanneau(nouvelleTable);
                            panneauTable.activerPanneau(nouvelleTable);
                            nouvelleTable.ouvrirTableVecteur(args.couche);                       
                        }
                    }
                }
            };
        }  
     };
    
    ContexteMenuArborescence.prototype.initOrdreAffichageSubmenu = function(args){ 
        var that=args.scope;
        if( args.couche.estFond()) {
            return false;
        }
        return {
            id: 'arborescenceOrdre',
            text : that.locale.bringToText,
            menu : {
                plain : true,
                items : [ {
                    text : that.locale.frontText,
                   // icon: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTxqG2vDXXruq8sCELRRVvk3EY5WHRdoi-y_94QJbyzL0PyzG3C',
                    handler : function() {
                        //todo: à améliorer... selon le type
                        args.couche.definirOrdreAffichage(29999);
                    }   
                }, { 
                    text : that.locale.backText,
                   // icon: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxQHBgkIBwgWCgkLFhYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJycfLT0tMTU3Ojo6KSs6Oz8zQy85NDcBCgoKDg0OGhAPGjclHyM1NzUuLDc3Njc1Nzg3NC03LjAyNzUuLTc3Ny40LSwrMjQ3NzQ3LDc0LjY3Kyw0Ny44N//AABEIADAAMAMBEQACEQEDEQH/xAAaAAEBAAIDAAAAAAAAAAAAAAAABgQFAgMH/8QAKRAAAQMDAgUDBQAAAAAAAAAAAQACAwQFERIxBhMhQVFxgbIiQmGhsf/EABoBAQACAwEAAAAAAAAAAAAAAAAEBQECAwb/xAArEQACAQMBBgQHAAAAAAAAAAAAAQIDBBHwBRIhMZHBFEFxgSIyM1FSYeH/2gAMAwEAAhEDEQA/APcUAQBAEAQBAEAQGhvvERtVcylbR87UwSajLpxkkY2PhV93feHmo7ueH3/hxqVdx4wd9gvRu7qhrqbkmHSekmrOrP4Hhb2d54jPDGDNOpv54G3U06hAEAQEPxqdN5a7GcRM+T157a/1V6d2Q7j5jM4HGJq/PiL+vXfY/Kft3N7fzKxXRJCAIDi9utjmOyA4EHS4g+xHULDWVgEBfrTJR1gNTM6oif8ATDUSvLj50HOx39dx3A81f21SE8yba8n2IVWm0+Jm8OWt1VIJmTPgpG9HvilcwzkfaMHYdcn1A7kSNnW05fFlqPTJvSg36For4lBAEB11DDLBJGyQxueC0Pbu0kbhayWYtJ4MPkTs3DEs8ZjnvLpIzu14kIPtzFWy2fUksSqtrX7OLpN83rqcouG5omsZHe3sYzAa1okAAHYDmY/S2jY1Y4xVevcyqUvy11KRWR2CAIAgCAIAgCA//9k=',
                    handler : function() {
                        args.couche.definirOrdreAffichage(10000);
                    }
                }]
            }
        };
    };
    
    ContexteMenuArborescence.prototype.initFermerSubmenu = function(args){ 
        var that=args.scope;
        return {
            id: 'arborescenceClose',
            text : that.locale.closeText
        };
    };
    
    return ContexteMenuArborescence;
    
});
