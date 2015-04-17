require(['navigateur', 'carte', 'panneauCarte', 'panneauMenu'], function (Navigateur, Carte, PanneauCarte, PanneauMenu) {

    module('Navigateur',{
        setup: function() {
            this.nav = new Navigateur(null,{div:'center'});
        }
    });
    test('création', function() {
        strictEqual(this.nav.carte.constructor.name, 'Carte', 'succeed !');
        strictEqual(this.nav.options.div, 'center', 'succeed !');
    });

    test('init', function() {
        this.nav.init();
        strictEqual(this.nav.listePanneaux.length, 1, 'succeed !');
    });

    test('init avec callback', function() {
        var iPanneau = new PanneauMenu();
        var cPanneau = new PanneauCarte();
        this.nav.ajouterPanneau(iPanneau);
        this.nav.ajouterPanneau(cPanneau);
        this.nav.init(function(){
            if (this.nav.isReady) {
                console.log('Test: succeed');
            } else {
                console.log('Test: fail');
            }
        }, this);
        strictEqual(this.nav.listePanneaux.length, 2, 'succeed !');
    });
    
    test('creerBarreOutils', function() {
        this.nav.creerBarreOutils();
        strictEqual(this.nav.toolBar.constructor.name, 'BarreOutils', 'succeed !');
    });

    test('creerBarreOutils', function() {
        this.nav.init();
        this.nav.creerBarreOutils();
        strictEqual(this.nav.toolBar.carte.constructor.name, 'Carte', 'succeed !');
    });
   
    test('obtenirBarreOutils', function() {
        this.nav.creerBarreOutils();
        strictEqual(this.nav.obtenirBarreOutils().constructor.name, 'BarreOutils', 'succeed !');
    });
    
    test('ajout panneau', function() {
        var iPanneau = new PanneauMenu();
        var cPanneau = new PanneauCarte();
        this.nav.ajouterPanneau(iPanneau);
        this.nav.ajouterPanneau(cPanneau);
        strictEqual(this.nav.obtenirPanneaux().length, 2, 'succeed !');
        strictEqual(this.nav.obtenirPanneauParId('menu-panneau').constructor.name, 'PanneauMenu', 'succeed !');
    });
    
    
});