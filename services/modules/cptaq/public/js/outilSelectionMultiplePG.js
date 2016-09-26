define(['navigateur','panneau','point','marqueurs','outil', 'aide','occurence', 'vecteur', 'style','recherche'], function(Navigateur, Panneau, Point, Marqueurs, Outil, Aide, Occurence, Vecteur, Style, Recherche) {
    function OutilSelectionMultiplePG(options){
        this.options = options || {};
    };
     
    OutilSelectionMultiplePG.prototype = new Outil();
    OutilSelectionMultiplePG.prototype.constructor = OutilSelectionMultiplePG;
    
    OutilSelectionMultiplePG.prototype._init = function() {
        this.controleBox = new OpenLayers.Handler.Box(this, {done: this.boxDone}, {boxDivClassName: "olHandlerBoxSelectFeature"});        
        this.controleBox.setMap(this.carte._carteOL);
        this.defautOptions = $.extend({}, this.defautOptions, {
            //controle: this.carte.gestionCouches.controles.initSelection(),
            icone: Aide.obtenirCheminRacine()+'images/toolbar/info.png',
            id: 'idSelectionMultiplePG',
            groupe: 'carte',
            _allowDepress: true,
            infobulle: 'Sélection spatiale: Dessiner un rectangle en conservant le bouton gauche enfoncé ou cliquer sur la carte'
        });
        
        //this.carte.gestionCouches.ajouterDeclencheur('activerVecteursSelection', this.enfoncerBouton, {scope: this});
        //this.carte.gestionCouches.ajouterDeclencheur('desactiverVecteursSelection', this.releverBouton, {scope: this});
        
        Outil.prototype._init.call(this);
    };
 
    OutilSelectionMultiplePG.prototype.executer =  function () {
        var that=this;
        this.controleBox.activate();
        //this.carte.gestionCouches.controles.activerVecteursSelection();
    };

    OutilSelectionMultiplePG.prototype.eteindre =  function () {
        this.controleBox.deactivate();
        //this.carte.gestionCouches.controles.desactiverVecteursSelection();   
    };

    OutilSelectionMultiplePG.prototype.boxDone =  function (position) {
        if (position instanceof OpenLayers.Bounds) {
            var minXY = this.carte._carteOL.getLonLatFromPixel({
                x: position.left,
                y: position.bottom
            });
            var maxXY = this.carte._carteOL.getLonLatFromPixel({
                x: position.right,
                y: position.top
            });
            //var bounds = new OpenLayers.Bounds(minXY.lon, minXY.lat, maxXY.lon, maxXY.lat);
            //alert(bounds.transform(new OpenLayers.Projection(this.carte.projection), new OpenLayers.Projection("EPSG:4326")));
            
        } else if (position instanceof OpenLayers.Pixel) {
            var minXY = this.carte._carteOL.getLonLatFromPixel({
                x: position.x,
                y: position.y
            });
            var maxXY = this.carte._carteOL.getLonLatFromPixel({
                x: position.x,
                y: position.y
            });
        }

        Aide.afficherMessageChargement({message: "Chargement de votre requête, patientez un moment..."});
        var that = this;
        
        var codeEPSG = this.carte.obtenirProjection();       
        that.VerifierCoucheVecteur();
        
        var layers = this.carte.gestionCouches.obtenirCouches(true);

        for(var l=0; l<layers.length; ++l) {
            var layer = layers[l];
            if (layer.estActive() && layer.options.selectionmultiplepg) {
//                var url =  this.options.url + "?bbox=" + minXY.lon + "," + minXY.lat + "," + maxXY.lon + "," + maxXY.lat +  //bbox pour utiliser avec ST_MakeEnvelope
                var url =  this.options.url + "?bbox=" + minXY.lon + " " + minXY.lat + ", " + maxXY.lon + " " + maxXY.lat + 
                "&epsg=" + this.carte.projection.substr(5) + 
                "&layer=" + layer.options.nom_table +
                "&titre=" + layer.options.titre;
                
                console.log(url);

                Ext.Ajax.request({
                    url : url,
                    method: 'GET',   
                    success: function ( result, request ) {
                        that.OutilSelectionMultiplePG(result);
                        var vecteur = that.carte.gestionCouches.obtenirCouchesParTitre('Sélection spatiale')[0];
                        Recherche.prototype.traiterResultatVecteur.call(that, vecteur);
                        vecteur.zoomerOccurences();
//                        alert(result);
                    },
                    failure: function ( result, request ) {
//                        alert("NON" + url)
                        that.afficherMessageErreur();
                    }
               });
       
            }
       }
       
       Aide.cacherMessageChargement();
       
    };

    OutilSelectionMultiplePG.prototype.VerifierCoucheVecteur =  function () {
        var vecteur = this.carte.gestionCouches.obtenirCouchesParTitre('Sélection spatiale')[0];
         
         if(vecteur === undefined){
            var style = new Style({               
                couleur:'#00FFFF', 
                limiteCouleur: '#00FFFF',
                opacite:0.05,
                limiteEpaisseur: 5,
                titre:'Entité sélectionée'
            });
            
            var vecteur = new Vecteur({active: true, titre:'Sélection spatiale',styles:{defaut:style}});  
            this.carte.gestionCouches.ajouterCouche(vecteur);
            
        }
        else{
              vecteur.enleverTout();
        }
        
        vecteur.templates.table = {
            colonnes: [{
                //utiliserBase: false,
                titre: 'Couche',
                triable: true,
                propriete: 'Couche'
            }, { 
                titre: 'Information',
                triable: true,
                propriete: 'Information'
            }, { 
                titre: '',
                triable: true,
                propriete: 'Document'
            }]
        };
   };

    OutilSelectionMultiplePG.prototype.OutilSelectionMultiplePG = function(response){

        var vecteur = this.carte.gestionCouches.obtenirCouchesParTitre('Sélection spatiale')[0];

        //Valeurs séparées seulement par  ZZZ
        var arrayInfo = response.responseText.split("ZZZ"); 

    
//         if( arrayInfo.length < 2)
//        {
//            Aide.afficherMessage({titre: "Message", message:'Aucune donnée trouvée'});
//            return false;
//        }

        //Boucle à travers valeurs séparées seulement par un point virgule
        for (var i = 0; i < arrayInfo.length - 1; i++){
             var Tabinfos = arrayInfo[i].split(";");
                     
            //Définir les données séparément
            var gid = Tabinfos[0];
            var xmin = parseFloat(Tabinfos[1]);
            var ymin = parseFloat(Tabinfos[2]);
            var xmax = parseFloat(Tabinfos[3]);
            var ymax = parseFloat(Tabinfos[4]);
            var pointx = parseFloat(Tabinfos[5]);
            var pointy = parseFloat(Tabinfos[6]);
            var geom = Tabinfos[7];
            var projection = parseFloat(Tabinfos[8]);
            var valeur1 = Tabinfos[9]; 
            var valeur2 = Tabinfos[10]; 
            var valeur3 = Tabinfos[11];

            var wkt = new OpenLayers.Format.WKT();
            var featureOL = wkt.read(geom);          
            var occurences = new Occurence(featureOL.geometry,{Couche: valeur3, Document: valeur1.replace("WWW",  Aide.obtenirCheminRacine()) ,Information: valeur2});
            vecteur.ajouterOccurence(occurences);
        }

        Aide.obtenirNavigateur().obtenirPanneauParId('resultatRechercheSpatiale',-1).ouvrir();
//        Recherche.prototype.traiterResultatVecteur.call(this, vecteur);
    };

    /**
    * Afficher le message d'erreur
    * @todo Lier à une classe de gestion des messages
    * @method
    * @name RechercheMatricule#afficherMessageErreur
    */
     
    OutilSelectionMultiplePG.prototype.afficherMessageErreur = function()
    {
        Aide.afficherMessage({titre: "Message", message:'Un problème est survenu lors de la requête.'});
    };
    
        /** 
     * Initialisation de la couche vecteur
     * @method 
     * @name Recherche#_creerCoucheVecteur
    */
    OutilSelectionMultiplePG.prototype.creerCoucheVecteur = function(){
        this.vecteur = new Marqueurs({nom:'couche'+this.typeRecherche, displayInLayerSwitcher:false, visible:true});
        this.carte.gestionCouches.ajouterCouche(this.vecteur);
        if (!this.pineCheckbox || this.pineCheckbox.checked){
            this.vecteur.activer();
        }
    };
    
    return OutilSelectionMultiplePG;
    
});

