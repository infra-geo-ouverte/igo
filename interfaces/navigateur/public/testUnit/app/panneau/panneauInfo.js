require(['panneauInfo', 'carte'], function (PanneauInfo, Carte) {

    module('PanneauCarte',{
        setup: function() {
            this.panneau = new PanneauInfo({titre:'Test Unit'});
            this.panneau.definirCarte(new Carte());
        }
    });
    test('création', function() {
        strictEqual(this.panneau.options.titre, 'Test Unit', 'succeed !');
        strictEqual(this.panneau._timeUpdateCtrl, 0, 'succeed !');
        strictEqual(this.panneau.defautOptions.position, 'sud', 'succeed !');
    });
    
});