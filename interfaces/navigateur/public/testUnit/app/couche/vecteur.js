require(['vecteur', 'carte', 'occurence', 'point', 'polygone', 'OSM'], function (Vecteur, Carte, Occurence, Point, Polygone, OSM) {

    module('Vecteur',{
        setup: function() {
            this.couche = new Vecteur();
            this.coucheOpt = new Vecteur({nom: 'TestNom', groupe: 'Test/Couche', minScale: 500, zIndex: 1200});
        }
    });
    
    test('init sans options', function() {
        strictEqual(this.couche.defautOptions.groupe, 'Autres Couches', 'succeed !');
        strictEqual(this.couche._optionsOL.isBaseLayer, false, 'succeed !');
        strictEqual(this.couche._optionsOL.group, 'Autres Couches', 'succeed !');
        strictEqual(this.couche._layer.name, 'vector', 'succeed !');
    });

    test('init avec options', function() {
        strictEqual(this.coucheOpt.defautOptions.groupe, 'Autres Couches', 'succeed !');
        strictEqual(this.coucheOpt._optionsOL.isBaseLayer, false, 'succeed !');
        strictEqual(this.coucheOpt._optionsOL.group, 'Test/Couche', 'succeed !');
        strictEqual(this.coucheOpt._optionsOL.minScale, 500, 'succeed !');
        strictEqual(this.coucheOpt._layer.name, 'TestNom', 'succeed !');   
    });     

    test('_ajoutCallback avec options', function() {
        var cible;
        var opt;
        this.coucheOpt._ajoutCallback(this.coucheOpt, function(a,b){cible=a; opt=b;}, {name: 'Test'});
        strictEqual(cible, this.coucheOpt, 'succeed !');
        strictEqual(opt.name, 'Test', 'succeed !');
    });   

    test('_getLayer', function() {
        var couche = this.coucheOpt._getLayer();
        strictEqual(this.coucheOpt._getLayer().name, 'TestNom', 'succeed !');
    });   

    test('obtenirNom', function() {
        var name = this.coucheOpt.obtenirNom();
        strictEqual(name,'TestNom', 'succeed !');
    }); 


    test('definirCarte', function() {
        var carte = new Carte();
        this.coucheOpt.definirCarte(carte);
        strictEqual(this.coucheOpt.carte,carte, 'succeed !');
    }); 

    test('zIndex', function() {
        var carte = new Carte();
        this.coucheOpt.definirCarte(carte);
        strictEqual(this.coucheOpt.obtenirOrdreAffichageBase(),1125, 'succeed !');
        this.coucheOpt.definirOrdreAffichage();
        strictEqual(this.coucheOpt.obtenirOrdreAffichage(),2325 , 'succeed !');
        this.coucheOpt.definirOrdreAffichage(200);
        strictEqual(this.coucheOpt.obtenirOrdreAffichage(),200, 'succeed !');
    }); 


    test('estFond', function() {
        strictEqual(this.coucheOpt.estFond(),false, 'succeed !');
    }); 
    
    test('activer', function() {
        strictEqual(this.coucheOpt.estActive(),false, 'succeed !');
        this.coucheOpt.activer();
        strictEqual(this.coucheOpt.estActive(),true, 'succeed !');
        this.coucheOpt.desactiver();
        strictEqual(this.coucheOpt.estActive(),false, 'succeed !');
    }); 
    
    test('création occurences', function() {
        var occurence = new Point(50, 45);
        this.couche.creerOccurence(occurence);
        strictEqual(this.couche.obtenirOccurences()[0].x, 50, 'succeed !');
        strictEqual(this.couche.obtenirOccurences()[0].y, 45, 'succeed !');
        var o1 = new Polygone([[50, 45], [30,50], [60,30]]);
        this.couche.creerOccurence(o1);
        strictEqual(this.couche.obtenirOccurences()[1].ligne, o1.ligne, 'succeed !');
        var o2 = new Polygone([[[60, 25], [50,60], [70,80]]]);
        var o3 = new Occurence(o2);
        this.couche.ajouterOccurence(o3);
        
        var len = this.couche.obtenirOccurences().length;
        this.couche.enleverOccurence(o3);
        strictEqual(this.couche.obtenirOccurences().length, len-1, 'succeed !');
    }); 

    test('sélection occurences', function() {
        var carte = new Carte();
        this.couche.definirCarte(carte);
        var o1 = new Occurence(new Polygone([[50, 45], [30,50], [60,30]]));
        this.couche.ajouterOccurence(o1);
        var o2 = new Occurence(new Polygone([[[60, 25], [50,60], [70,80]]]));
        this.couche.ajouterOccurence(o2);
        var o3 = new Occurence(new Point(50, 45));
        this.couche.ajouterOccurence(o3);
        
        strictEqual(o2.selected, false, 'succeed !');
        this.couche.selectionnerOccurence(o2);
        strictEqual(o2.selected, true, 'succeed !'); 
        this.couche.selectionnerOccurence(o1);
        this.couche.selectionnerOccurence(o3);
        strictEqual(o3.selected, true, 'succeed !');
        this.couche.deselectionnerOccurence(o3);
        strictEqual(o3.selected, false, 'succeed !');
        strictEqual(o1.selected, true, 'succeed !');
        this.couche.deselectionnerTout();
        strictEqual(o2.selected, false, 'succeed !');
    }); 
    
    test('zoomerOccurence', function() {
         carte = new Carte();
        carte.ajouterCouche(new OSM());
        this.couche.definirCarte(carte);
         o = new Occurence(new Point(-4900000, 3500000));
         o2 = new Occurence(new Point(-5100000, 3700000));
        this.couche.ajouterOccurence(o);
        this.couche.ajouterOccurence(o2);
        this.couche.zoomerOccurences();
        strictEqual(Math.round(carte.obtenirLimites().gauche),-5588963, 'succeed !');
        strictEqual(Math.round(carte.obtenirLimites().haut),3795679, 'succeed !');
        strictEqual(Math.round(carte.obtenirLimites().droite),-4806248, 'succeed !');
        strictEqual(Math.round(carte.obtenirLimites().bas),3404321, 'succeed !');
        this.couche.zoomerOccurence(o);
        strictEqual(Math.round(carte.obtenirLimites().gauche),-4900006, 'succeed !');
        strictEqual(Math.round(carte.obtenirLimites().haut),3500003, 'succeed !');
        strictEqual(Math.round(carte.obtenirLimites().droite),-4899994, 'succeed !');
        strictEqual(Math.round(carte.obtenirLimites().bas),3499997, 'succeed !');
    }); 
});
