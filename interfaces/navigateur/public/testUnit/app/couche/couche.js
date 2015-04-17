require(['couche', 'carte'], function (Couche, Carte) {

    module('Couche',{
        setup: function() {
            this.couche = new Couche();
            this.coucheOpt = new Couche({type: 'Fond', name: 'Test', groupe: 'Test/Couche', minScale: 500});
        }
    });
    test('init sans options', function() {
        this.couche._init();
        strictEqual(this.couche.defautOptions.groupe, 'Autres Couches', 'succeed !');
        strictEqual(this.couche._optionsOL.isBaseLayer, false, 'succeed !');
        strictEqual(this.couche._optionsOL.group, 'Autres Couches', 'succeed !');
        strictEqual(this.couche._optionsOL.minScale, undefined, 'succeed !');
    });

    test('init avec options', function() {
        this.coucheOpt._init();
        strictEqual(this.coucheOpt.defautOptions.groupe, 'Fonds', 'succeed !');
        strictEqual(this.coucheOpt._optionsOL.isBaseLayer, true, 'succeed !');
        strictEqual(this.coucheOpt._optionsOL.group, 'Test/Couche', 'succeed !');
        strictEqual(this.coucheOpt._optionsOL.minScale, 500, 'succeed !');
    });     

    test('_ajoutCallback', function() {
        var cible;
        var opt;
        this.couche._ajoutCallback(this.couche, function(a,b){cible=a; opt=b;}, {name: 'Test'});

        strictEqual(cible, this.couche, 'succeed !');
        strictEqual(opt.name, 'Test', 'succeed !');
    });   

    test('_getLayer', function() {
        var couche = this.couche._getLayer();
        strictEqual(couche,undefined, 'succeed !');
    });   

    test('obtenirNom', function() {
        var name = this.couche.obtenirNom();
        strictEqual(name,undefined, 'succeed !');
    }); 

    test('definirCarte', function() {
        var carte = new Carte();
        this.couche.definirCarte(carte);
        strictEqual(this.couche.carte,carte, 'succeed !');
    }); 

    test('estFondVrai', function() {
        strictEqual(this.coucheOpt.estFond(),true, 'succeed !');
    }); 

    test('estFondFaux', function() {
        strictEqual(this.couche.estFond(),false, 'succeed !');
    }); 

});
