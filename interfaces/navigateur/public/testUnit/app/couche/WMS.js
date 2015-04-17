require(['wms', 'carte'], function (WMS, Carte) {

    module('WMS',{
        setup: function() {
            this.couche = new WMS();
            this.coucheOptFond = new WMS({layers:'lay1, lay2', url: 'test', type: 'Fond', nom: 'TestNom', groupe: 'Test/Couche', minScale: 500, zIndex: 200});
            this.coucheOpt = new WMS({layers:'lay1, lay2', url: 'test', nom: 'TestNom', groupe: 'Test/Couche', minScale: 500, zIndex: 1200});
        }
    });
    
    test('init sans options', function() {
        strictEqual(this.couche._layer, undefined, 'succeed !');
    });

    test('init avec options', function() {
        strictEqual(this.coucheOptFond.defautOptions.groupe, 'Fonds', 'succeed !');
        strictEqual(this.coucheOptFond._optionsOL.isBaseLayer, true, 'succeed !');
        strictEqual(this.coucheOptFond._optionsOL.group, 'Test/Couche', 'succeed !');
        strictEqual(this.coucheOptFond._optionsOL.minScale, 500, 'succeed !');
        strictEqual(this.coucheOptFond._layer.name, 'TestNom', 'succeed !');
        strictEqual(this.coucheOptFond._layer.params.LAYERS, 'lay1,lay2', 'succeed !');
   
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
        strictEqual(this.coucheOpt._getLayer().params.LAYERS, 'lay1,lay2', 'succeed !');
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
        this.coucheOptFond.definirCarte(carte);
        strictEqual(this.coucheOpt.obtenirOrdreAffichageBase(),1125, 'succeed !');
        this.coucheOpt.definirOrdreAffichage();
        strictEqual(this.coucheOpt.obtenirOrdreAffichage(),2325, 'succeed !');
        strictEqual(this.coucheOptFond.obtenirOrdreAffichageBase(),100, 'succeed !');
        this.coucheOptFond.definirOrdreAffichage();
        strictEqual(this.coucheOptFond.obtenirOrdreAffichage(),300, 'succeed !');
        this.coucheOptFond.definirOrdreAffichage(200);
        strictEqual(this.coucheOptFond.obtenirOrdreAffichage(),200, 'succeed !');
    }); 


    test('estFond', function() {
        strictEqual(this.coucheOptFond.estFond(),true, 'succeed !');
        strictEqual(this.coucheOpt.estFond(),false, 'succeed !');
    }); 
    
    test('activer', function() {
        strictEqual(this.coucheOpt.estActive(),false, 'succeed !');
        this.coucheOpt.activer();
        strictEqual(this.coucheOpt.estActive(),true, 'succeed !');
        this.coucheOpt.desactiver();
        strictEqual(this.coucheOpt.estActive(),false, 'succeed !');
    }); 

});
