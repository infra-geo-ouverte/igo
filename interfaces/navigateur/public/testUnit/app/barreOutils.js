require(['barreOutils', 'outil', 'carte'], function (BarreOutils, Outil, Carte) {

    module('BarreOutils',{
        setup: function() {
            this.barreOutils = new BarreOutils(new Carte());
        }
    });
    test('ajouterOutils', function() {
        this.barreOutils.ajouterOutils([new Outil(), '-']);
        strictEqual(this.barreOutils.listeOutils.length, 2, 'succeed !');
        strictEqual(this.barreOutils.obtenirOutils()[0].constructor.name, 'Outil', 'succeed !');
    });
    
    test('ajouterOutils', function() {
        this.barreOutils.ajouterDivision();
        this.barreOutils.alignerDroite();
        strictEqual(this.barreOutils.listeOutils.length, 2, 'succeed !');
    });

    test('_getToolbar', function() {
        this.barreOutils.ajouterOutils([new Outil(), '-']);
        strictEqual(this.barreOutils._getToolbar()[0].tooltip, 'Description', 'succeed !');
    });
    

});