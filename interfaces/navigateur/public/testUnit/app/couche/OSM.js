require(['OSM', 'carte'], function (OSM, Carte) {

    module('OSM',{
        setup: function() {
            this.couche = new OSM();
            this.coucheOpt = new OSM({nom: 'osm', osmType:"velo", zIndex:200});
        }
    });
    
    test('init sans options', function() {
        strictEqual(this.couche.defautOptions.groupe, 'Fonds', 'succeed !');
        strictEqual(this.couche._optionsOL.isBaseLayer, true, 'succeed !');
        strictEqual(this.couche._optionsOL.group, 'Fonds', 'succeed !');
        strictEqual(this.couche._layer.name, 'OpenStreetMap', 'succeed !');
    });

    test('init avec options', function() {
        strictEqual(this.coucheOpt.defautOptions.groupe, 'Fonds', 'succeed !');
        strictEqual(this.coucheOpt._optionsOL.isBaseLayer, true, 'succeed !');
        strictEqual(this.coucheOpt._optionsOL.group, 'Fonds', 'succeed !');
        strictEqual(this.coucheOpt._layer.name, 'osm', 'succeed !');
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
        strictEqual(this.coucheOpt._getLayer().name, 'osm', 'succeed !');
    });   

    test('obtenirNom', function() {
        var name = this.coucheOpt.obtenirNom();
        strictEqual(name,'osm', 'succeed !');
    }); 


    test('definirCarte', function() {
        var carte = new Carte();
        this.coucheOpt.definirCarte(carte);
        strictEqual(this.coucheOpt.carte,carte, 'succeed !');
    }); 

    test('zIndex', function() {
        var carte = new Carte();
        this.coucheOpt.definirCarte(carte);
        strictEqual(this.coucheOpt.obtenirOrdreAffichageBase(),100, 'succeed !');
        this.coucheOpt.definirOrdreAffichage();
        strictEqual(this.coucheOpt.obtenirOrdreAffichage(),300, 'succeed !');
        this.coucheOpt.definirOrdreAffichage(200);
        strictEqual(this.coucheOpt.obtenirOrdreAffichage(),200, 'succeed !');
    }); 


    test('estFond', function() {
        strictEqual(this.coucheOpt.estFond(),true, 'succeed !');
    }); 
    
    test('activer', function() {
        strictEqual(this.coucheOpt.estActive(),false, 'succeed !');
        this.coucheOpt.activer();
        strictEqual(this.coucheOpt.estActive(),true, 'succeed !');
        this.coucheOpt.desactiver();
        strictEqual(this.coucheOpt.estActive(),false, 'succeed !');
    }); 

});
