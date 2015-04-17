require(['panneauCarte', 'carte', 'barreOutils'], function (PanneauCarte, Carte, BarreOutils) {

    module('PanneauCarte',{
        setup: function() {
            this.panneau = new PanneauCarte({titre:'Test Unit', z:9});
            this.panneau.definirCarte(new Carte());
        }
    });
    test('création', function() {
        strictEqual(this.panneau.options.titre, 'Test Unit', 'succeed !');
        strictEqual(this.panneau.options.z, 9, 'succeed !');
    });
    
    test('init sans barreOutils', function() {
        this.panneau.init();
        strictEqual(this.panneau._panel.region, 'center', 'succeed !');
    });
    
    test('init avec barreOutils', function() {
        this.panneau.barreOutils = new BarreOutils();
        this.panneau.init();
        strictEqual(this.panneau.barreOutils.constructor.name, 'BarreOutils', 'succeed !');
    });
    
    test('obtenirId', function() {
        this.panneau.init();
        strictEqual(this.panneau.obtenirId(), 'centerContainer', 'succeed !');
    });
    
    test('_getPanel', function() {
        this.panneau.init();
        strictEqual(this.panneau._getPanel().id, 'centerContainer', 'succeed !');
    });
    
    test('_getMapComponent', function() {
        this.panneau.init();
        strictEqual(this.panneau._getMapComponent().id, 'mapContainer', 'succeed !');
        strictEqual(this.panneau._getMapComponent().zoom, 9, 'succeed !');
    });
});