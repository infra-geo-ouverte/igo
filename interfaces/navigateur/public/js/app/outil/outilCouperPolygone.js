/** 
 * Module pour l'objet {@link Outil.OutilCouperPolygone}.
 * @module OutilCouperPolygone
 * @requires outil 
 * @requires aide 
 * @author Michael Lane, FADQ
 * @version 1.0
 */

define(['outil', 'aide', 'vecteur', 'point', 'ligne', 'polygone', 'occurence'], function(Outil, Aide, Vecteur, Point, Ligne, Polygone, Occurence) {
    function OutilCouperPolygone(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            groupe: 'carte',
            _allowDepress: true,
            icone: 'couper_polygone',
            id: 'couper-polygone-igo'+options.couche.options.nom,       
            infobulle: "Couper une surface"
            
        });
        this.nomCouche = options.couche.options.nom;
    };

    OutilCouperPolygone.prototype = new Outil();
    OutilCouperPolygone.prototype.constructor = OutilCouperPolygone;
    
    /** Action de l'outil
     * @method
     * @name OutilCouperPolygone#executer
     */           
    OutilCouperPolygone.prototype.executer = function()
    {                 
        var that = this;
        this.carte = Aide.obtenirNavigateur().carte;
        
        //Faire une sélection
        var occ = this.options.couche.obtenirOccurencesSelectionnees();
        if(occ.length !== 1) {
            Aide.afficherMessage("Message", "Vous devez sélectionner une surface.", "OK", "MESSAGE");
            this.relever();
            return false;
        }
        
        //Polygone à trou trop complexe pour la coupe
        if(occ[0].lignes.length > 1) {
            Aide.afficherMessage("Message", "Vous devez sélectionner une surface ne contenant pas d'exclusion.", "OK", "MESSAGE");
            this.relever();      
            return false;  
        }  
        this.occ = occ[0];
        
        //Définir la couche de l'outil qui servira à afficher un polygone dans le trou
        if(typeof this.coucheCouperPolygone === "undefined")
        {
            var couche = this.carte.gestionCouches.obtenirCoucheParId("coucheCouperPolygone");
            if(typeof couche !== "undefined") {
                this.coucheCouperPolygone = couche;
            }
            else{
                this.coucheCouperPolygone = new Vecteur({titre: "Exclusion de surface", 
                                                    id:'coucheCouperPolygone', 
                                                    active:true, 
                                                    visible:false, 
                                                    suppressionPermise:true,
                                                    editable: true,
                                                    geometrieNullePermise: true,
                                                    nom: "coucheCouperPolygone"});

                this.carte.gestionCouches.ajouterCouche(this.coucheCouperPolygone);   
            }
        }
        
        //Transférer le polygone en ligne pour permettre la coupe avec le split
        var ligne = new Ligne(this.occ.obtenirExterieur().points);
         var ligne = ligne.fermerLigne();
        this.coucheCouperPolygone.ajouterOccurence(ligne);
                
        //Activer les contrôle de coupe        
        this.mousePosition = new OpenLayers.Control.MousePosition();
        this.carte._carteOL.addControl(this.mousePosition);
        this.split = split = new OpenLayers.Control.Split({
                    layer: this.coucheCouperPolygone._layer,
            eventListeners: {
                aftersplit: function(event) {
                    if(event.object.handler.line.geometry.components.length !== 2) {
                        Aide.afficherMessage("Message", "Vous devez dessiner seulement 2 points.", "OK", "MESSAGE");
                        return false;
                    }
                    
                    that.couperPolygone(event.features, event.object.handler.line.geometry.components);
                }
            }
        });
                
        this.carte._carteOL.addControl(this.split);
        this.split.activate();            
    };
    
    /**
     * Couper le polygone selon l'évênement de coupe produit
     * @method
     * @name OutilCouperPolygone#couperPolygone
     * @param {object} features Liste des features produient pas la coupe
     * @param {object} ligne Lignes du polygone
     * @returns {Boolean}
     */
    OutilCouperPolygone.prototype.couperPolygone = function(features, ligne) {        
        
        //La coupe d'un polygone en plus de 2 polygones n'est pas géré
        if(features.length > 3) {
            Aide.afficherMessage("Message", "La surface ne peut qu'être coupé en 2.", "OK", "MESSAGE");
            return false;
        }
        
        var index1,index2;
        
        //Si on a 3 lignes de coupe
        if(features.length === 3) {
            //Ajouter les points du premier feature dans le 3e pour le fermer
            $.each(features[0].geometry.getVertices(), function(index, vertice) {
                features[2].geometry.addPoint(vertice);
            });            
            index1=1;
            index2=2;
        }
        else{
            index1=0;
            index2=1;
        }
        //Ajouter les 2 polygones créés à la couche avec les propriétés du polygone original
        this.options.couche.ajouterOccurence(new Occurence(new Polygone(features[index1].geometry), this.occ.obtenirProprietes()));
        this.options.couche.ajouterOccurence(new Occurence(new Polygone(features[index2].geometry)));
        this.relever();
        return true;
    };           
    
    /**
     * Méthode pour éteindre l'outil de coupe de polygone
     * @method
     * @name OutilCouperPolygone#eteindre
     */
    OutilCouperPolygone.prototype.eteindre =  function () {
        
        //Retirer l'outil split
        if(typeof this.split !== "undefined") {
            this.split.deactivate(); 
            this.carte._carteOL.removeControl(this.split);            
            this.split.destroy();  
            this.split = undefined;
        }
        
        //Retirer l'outil mousePosition
        if(typeof this.mousePosition !== "undefined") {
            this.mousePosition.deactivate();
            this.carte._carteOL.removeControl(this.mousePosition);            
            this.mousePosition.destroy(); 
            this.mousePosition = undefined;
        }
       
        //Retirer la couche de travail
        if(typeof this.coucheCouperPolygone !== "undefined") {
            this.coucheCouperPolygone.enlever();
            this.coucheCouperPolygone = undefined;
        }
        
        //Supprimer l'occurence original du traitement
        if(typeof this.occ !== "undefined") {
            this.options.couche.enleverOccurence(this.occ);
        }        
        return true;
    };

    return OutilCouperPolygone;
    
});