define(['panneau','vecteur','aide','point','style','occurence'], function(Panneau,Vecteur,Aide,Point,Style,Occurence) {
    function GoogleStreetView(options){
        this.options = options || {};
    };
    
    GoogleStreetView.prototype = new Panneau();
    GoogleStreetView.prototype.constructor = GoogleStreetView;
    
    GoogleStreetView.prototype._init = function(){
        this._panel = {						
            title: 'Google Street View', 
            id: 'Google_StreetV_panneau',
            hidden: false,
            border: true,
            width: 200,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            autoScroll: true,
            items:[this.getContentPanel()]
        };
    };
    
    GoogleStreetView.prototype.getAide = function() {
        return  "<br>1->Zoomer sur le secteur avec ou sans l'outil de localisation.<br>"+
                "2->Cliquer sur le bouton LIEU à voir puis sur le lieu choisi.<br>"+
                "3->Cliquer sur LANCER StreetView pour voir le lieu à l’échelle de la rue :<br>"+
                "le résultat apparaîtra dans la fenêtre de Google Street View.<br><br>"+
                "***Si l'écran est gris, c’est que le secteur n'est pas disponible dans Google Street View.***<br>";
    };
    
    GoogleStreetView.prototype.ol_streetview = function(){
        //on va récupérer les derniers points de l'usager user...
        var streetview = 'http://maps.google.com/maps?q=&layer=c&cbll='+this.marqueurs.depart.obtenirCentroide().projeter("EPSG:4326").y +
                            ','+this.marqueurs.depart.obtenirCentroide().projeter("EPSG:4326").x+'&cbp=11,0,0,0,0';

         Ext.Msg.alert("Fonction Google Street View.",
                       "**ATTENTION** Cette vue provient de Google Street View, donc il n'utilise pas les données gouvernementales. Cette fonction est fournie en support, doit être utilisée avec précaution et n'est pas un outil officiel en mesures d'urgence du MSP.");

        window.open(streetview, "Google_StreetView", 'resizable=yes,scrollbars=yes,toolbar=yes,status=yes');
    };
    
    GoogleStreetView.prototype.getContentPanel = function() {
        var that = this;
        return new Ext.FormPanel({
            labelWidth: 100,
            frame:true,
            border: false,
            bodyStyle:'padding:5px 5px 0',
            width: 300,
            scope:this,
            items: [        
                {
                    hideLabel: true,
                    html: "<b>Zoomer à l'échelle de la rue</b>",
                    id: 'txtSTV3',
                    height: 13,       
                    width: 288   
                }, {    
                    html: this.getAide(),
                    id: 'resul7_google_itin'
                }, {    
                    id: 'resul5_google_itin'
                }, {
                    html: '<br>',      
                    id: 'aide_iti3'
                }
            ],
            buttons: [
                {
                    text: 'LIEU à voir',
                    tooltip: 'Lieu à voir',
                    minWidth: '5',
                    maxWidth: '10',
                    style: {
                        marginBottom: '5px'
                    },
                    handler: function(){
                        if(that.marqueurs){
                            that.marqueurs.supprimerTout();
                            that.marqueurs.activerControles();
                        }else{
                            that.marqueurs = new GoogleStreetView.Marqueurs(that); 
                        }    
                        
                    }
                }, {
                    text: "LANCER StreetView",
                    tooltip: "Voir à l'échelle de la rue",
                    minWidth: '5',
                    maxWidth: '10',
                    style: {
                        marginBottom: '5px'
                    },
                    handler: function(){
                         that.ol_streetview();
                    }
                }
            ]
        });
    };

    //=====================================================================//
    
    GoogleStreetView.Marqueurs = function(_) {
            this._ = _;
            this.depart;
            this.iPixels = 0;
            this.vecteur = new Vecteur({titre: 'marqueursGoogleStreetView', active: true, visible:false, selectionnable: false});
            this._.carte.gestionCouches.ajouterCouche(this.vecteur);
            this.initEvent();
    };
    
    //
    GoogleStreetView.Marqueurs.prototype.initEvent = function() {   
        this.initCliqueMarqueurs();
        this.initDeplacementMarqueurs();
        this.activerControles();
    };

    GoogleStreetView.Marqueurs.prototype.activerControles = function() {

        this._.carte.ajouterDeclencheur('clique', this.cliqueCarte, {scope: this});
        this._.carte.controles.activerClique();
        this.vecteur.controles.activerDeplacement({combinaisonClique: true});
    };

    GoogleStreetView.Marqueurs.prototype.desactiverControles = function() {
        this._.carte.enleverDeclencheur('clique', null, this.cliqueCarte);
    };

    //
    GoogleStreetView.Marqueurs.prototype.initCliqueMarqueurs = function() {
        this.vecteur.ajouterDeclencheur('occurenceClique', this.marqueursClique, {scope: this});
    };
    
    //
    GoogleStreetView.Marqueurs.prototype.initDeplacementMarqueurs = function() {
        this.vecteur.controles.activerDeplacement();
        this.vecteur.ajouterDeclencheur('finDeplacementOccurence', this.finDeplacementMarqueurs, {scope: this});
    };

    GoogleStreetView.Marqueurs.prototype.obtenirIcone = function(type) {
        return Aide.utiliserBaseUri("images/marqueur/marker-green.png");
    };

    //todo: objet en parametre
    GoogleStreetView.Marqueurs.prototype.ajouter = function(x, y, type, origine, titre) {
        var icon = this.obtenirIcone(type);

        var point = new Point(x, y);
        var propriete = {type: type, origine: origine};
        var style = new Style({icone: icon, iconeLargeur: 20, iconeHauteur: 34, iconeOffsetY: -34});
                
        var occurence = new Occurence(point, propriete, style);
        this.vecteur.ajouterOccurence(occurence);

        if(titre){
            occurence.definirPropriete('titre', titre);
        };
        
        this.depart = occurence;
           
        this.desactiverControles();
        return occurence;
    };

    //
    GoogleStreetView.Marqueurs.prototype.cliqueCarte = function(e) {
        var that = e.options.scope;
        var feature = that.ajouter(e.point.x, e.point.y, 'depart');     
    };

    GoogleStreetView.Marqueurs.prototype.marqueursClique = function(e) {
        var occurence = e.occurence;
        var that = e.options.scope;
        
        that.vecteur.controles.desactiverDeplacement();
        var type = occurence.obtenirPropriete('type');
        that.supprimerOccurences(occurence);
        that.vecteur.controles.activerDeplacement({combinaisonClique: true});
    };

    GoogleStreetView.Marqueurs.prototype.supprimerOccurences = function(occurences) {
        var that=this;
        if(!$.isArray(occurences)){occurences = [occurences];};
        
        $.each(occurences, function(key, value) {
            that.vecteur.enleverOccurence(value);
            var type = value.obtenirPropriete('type');
            if (type === 'depart'){
                that.depart = null;
            } else if (type === 'arrivee'){
                that.arrivee = null;
            } else {
                that.intermediaires.remove(value);
            };
        });
    };
       
    GoogleStreetView.Marqueurs.prototype.finDeplacementMarqueurs = function(e) {
        var that = e.options.scope;
        that.depart = e.occurence;
    };
    
    //
    GoogleStreetView.Marqueurs.prototype.supprimerTout = function() {
        this.vecteur.enleverTout();
        this.depart = null;
        this.arrivee = null;
        this.intermediaires = [];
    };

    return GoogleStreetView;
    
});