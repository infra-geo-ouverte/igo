require(['panneau', 'carte'], function (Panneau, Carte) {

    module('Panneau',{
        setup: function() {
            this.panneau = new Panneau({titre:'Test Unit', position: 'sud'});
        }
    });
    test('création', function() {
        strictEqual(this.panneau.options.titre, 'Test Unit', 'succeed !');
    });
    
    test('init', function() {
        this.panneau.init();
        strictEqual(this.panneau._extOptions.region, 'south', 'succeed !');
        strictEqual(this.panneau.options.titre, 'Test Unit', 'succeed !');
        strictEqual(this.panneau._extOptions.minSize, 100, 'succeed !');
        strictEqual(this.panneau._extOptions.height, 100, 'succeed !');
        strictEqual(this.panneau.defautOptions.position, 'nord', 'succeed !');

    });
    test('obtenirId', function() {
        this.panneau.init();
        strictEqual(this.panneau.obtenirId(), 'panneau', 'succeed !');
    });
    
    test('_getPanel', function() {
        this.panneau.init();
        strictEqual(this.panneau._getPanel().title, 'Test Unit', 'succeed !');
    });
    
    test('definirCarte', function() {
        this.panneau.definirCarte(new Carte());
        strictEqual(this.panneau.carte.constructor.name, 'Carte', 'succeed !');
    });
});