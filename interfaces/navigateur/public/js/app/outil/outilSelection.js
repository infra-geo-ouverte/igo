define(['outil', 'aide'], function(Outil, Aide) {
    function OutilSelection(options){
        this.options = options || {};
    };
    
    OutilSelection.prototype = new Outil();
    OutilSelection.prototype.constructor = OutilSelection;
    
    OutilSelection.prototype._init = function() {
        this.controleBox = new OpenLayers.Handler.Box(this, {done: this.boxDone}, {boxDivClassName: "olHandlerBoxSelectFeature"});        
        this.controleBox.setMap(this.carte._carteOL);
        this.defautOptions = $.extend({}, this.defautOptions, {
            //controle: this.carte.gestionCouches.controles.initSelection(),
            icone: Aide.obtenirCheminRacine()+'images/toolbar/gui-pointer.gif',
            id: 'idSelection',
            groupe: 'carte',
            _allowDepress: true,
            infobulle: 'Sélection'
        });
        
        //this.carte.gestionCouches.ajouterDeclencheur('activerVecteursSelection', this.enfoncerBouton, {scope: this});
        //this.carte.gestionCouches.ajouterDeclencheur('desactiverVecteursSelection', this.releverBouton, {scope: this});
        
        Outil.prototype._init.call(this);
    };
 
    OutilSelection.prototype.executer =  function () {
        var that=this;
        this.controleBox.activate();
        //this.carte.gestionCouches.controles.activerVecteursSelection();
    };
    
    OutilSelection.prototype.eteindre =  function () {
        this.controleBox.deactivate();
        //this.carte.gestionCouches.controles.desactiverVecteursSelection();   
    };

    OutilSelection.prototype.boxDone =  function (position) {
        if (position instanceof OpenLayers.Bounds) {
            var minXY = this.carte._carteOL.getLonLatFromPixel({
                x: position.left,
                y: position.bottom
            });
            var maxXY = this.carte._carteOL.getLonLatFromPixel({
                x: position.right,
                y: position.top
            });
            var bounds = new OpenLayers.Bounds(
                minXY.lon, minXY.lat, maxXY.lon, maxXY.lat
            );
            
            var layers = this.carte.gestionCouches.obtenirCouchesParType(['Vecteur', 'VecteurCluster'], true);
            var ctrlPressed = Aide.obtenirNavigateur().obtenirCtrl();
            
            for(var l=0; l<layers.length; ++l) {
                var layer = layers[l];
                if (!layer.estActive() || !layer.options.selectionnable) {
                    continue;
                }
                
                if (!ctrlPressed) {
                    layer.deselectionnerTout();
                }
                
                var listeOccurences = layer.listeOccurences;
                if(layer.listeClusters){
                    listeOccurences = listeOccurences.concat(layer.listeClusters);
                }
                for(var i=0, len = listeOccurences.length; i<len; ++i) {
                    var feature = listeOccurences[i];
                    if (!feature.estVisible() || !feature.estAffichee()) {
                        continue;
                    }

                    if (bounds.toGeometry().intersects(feature._obtenirGeomOL())) {
                        if(feature.estSelectionnee()){
                            layer.deselectionnerOccurence(feature);
                            continue;
                         }
                        layer.selectionnerOccurence(feature);
                    }
                }
            } 
        } else if (position instanceof OpenLayers.Pixel) {
            if (!Aide.obtenirNavigateur().obtenirCtrl()) {
                this.carte.gestionCouches.deselectionnerToutesOccurences();
            }
            
            $.each(this.carte.gestionCouches.obtenirListeOccurencesSurvols(), function(key, occurence){
                if(!occurence.vecteur.options.selectionnable){
                    return true;
                }
                if(occurence.estSelectionnee()){
                    occurence.vecteur.deselectionnerOccurence(occurence);
                    return true;
                }
                occurence.vecteur.selectionnerOccurence(occurence);
            });
        }
    }
      
    return OutilSelection;
    
});

