define(['outil', 'aide'], function(Outil, Aide) {
    function OutilSelection_1(options){
        this.options = options || {};
    };
     
    OutilSelection_1.prototype = new Outil();
    OutilSelection_1.prototype.constructor = OutilSelection_1;
    
    OutilSelection_1.prototype._init = function() {
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
 
    OutilSelection_1.prototype.executer =  function () {
        var that=this;
        this.controleBox.activate();
        //this.carte.gestionCouches.controles.activerVecteursSelection();
    };
    
    OutilSelection_1.prototype.eteindre =  function () {
        this.controleBox.deactivate();
        //this.carte.gestionCouches.controles.desactiverVecteursSelection();   
    };

    OutilSelection_1.prototype.boxDone =  function (position) {
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
    
            //alert(bounds);
            //alert(bounds.transform(new OpenLayers.Projection(this.carte.projection), new OpenLayers.Projection("EPSG:4326")));
            
        } else if (position instanceof OpenLayers.Pixel) {

            //alert(this.carte.projection);
        }

        var that = this;
        var codeEPSG = this.carte.obtenirProjection();
        //var bounds = bounds.transform(new OpenLayers.Projection(this.carte.projection), new OpenLayers.Projection("EPSG:4326"))

        var url = "http://localhost:8080/igo/services/cptaq/SelectionMultiple.php?bbox=" + 
                   minXY.lon + "," + minXY.lat + "," + maxXY.lon + "," + maxXY.lat + "&epsg=" + this.carte.projection.substr(5);      
        console.log(url);
        var layers = this.carte.gestionCouches.obtenirCouchesParType(['WMS'], true);
        
        for(var l=0; l<layers.length; ++l) {
            var layer = layers[l];
            if (layer.estActive()) {
                alert(layer.obtenirId() + " " + layer.estActive())
                alert(url)
                Ext.Ajax.request({
                    url : url,
                    method: 'GET',
                    success: function ( result, request ) {
                        alert("OUI")
//                        that.AfficherCadastreReno(result);
                    },
                    failure: function ( result, request ) {
                        alert("NON")
                        //that.afficherMessageErreur();
                    }
               });
       
            }
       }
       
    }
      
    OutilSelection_1.prototype.AfficherCadastreReno = function(response){

    //Valeurs séparées seulement par un point virgule
    var Tabinfos = response.responseText.split(";"); 
   alert (Tabinfos);
    //Définir les données séparément
    var numCadastre = Tabinfos[0];
    var xmin = parseFloat(Tabinfos[1]);
    var ymin = parseFloat(Tabinfos[2]);
    var xmax = parseFloat(Tabinfos[3]);
    var ymax = parseFloat(Tabinfos[4]);
    var pointx = parseFloat(Tabinfos[5]);
    var pointy = parseFloat(Tabinfos[6]);
    var projection = parseFloat(Tabinfos[7]); 


    //TODO à vérifier pourquoi le message ne s'affiche pas
    //Si aucun point n'est retourné
    if(isNaN(xmin) || isNaN(ymin))
    {
        this.afficherMessageErreur();
        return false;
    }

    if(this.vecteur === undefined){
        this.creerCoucheVecteur();
    }
    else{
        this.vecteur.enleverMarqueurs();
    }

    point = new Point(pointx, pointy);

    this.vecteur.ajouterMarqueur(point);
    //this.vecteur.ajouterMarqueur(point, null, numCadastre);

    this.vecteur.zoomerMarqueurs();

    var couche = this.carte.gestionCouches.obtenirCouchesParTitre("Cadastre rénové - bas niveau")[0];

    if(couche !== undefined){
        couche.activer();                   
    }
            
    };  
      
    OutilSelection_1.prototype.afficherMessageErreur = function()
    {
        Aide.afficherMessage({titre: "Message", message:'Aucune donnée trouvée'});
    };
    
    return OutilSelection_1;
    
});

