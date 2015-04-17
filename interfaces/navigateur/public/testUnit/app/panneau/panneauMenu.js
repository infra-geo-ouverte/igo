require(['panneauMenu', 'arborescence', 'carte', 'OSM'], function (PanneauMenu, Arborescence, Carte, OSM) {

    module('PanneauMenu',{
        setup: function() {
            this.panneau = new PanneauMenu({titre:'Test Unit'});
            var carte = new Carte();
            carte.ajouterCouche(new OSM());
            this.panneau.definirCarte(carte);
        }
    });
    test('création', function() {
        strictEqual(this.panneau.options.titre, 'Test Unit', 'succeed !');
        strictEqual(this.panneau.defautOptions.position, 'ouest', 'succeed !');
    });
    
  /*  test('ajout menus', function() {
        var menu = new Arborescence();
        var menu2 = new Arborescence();
        this.panneau.ajouter(menu);
        this.panneau.ajouter(menu2);
        strictEqual(this.panneau.menus.length, 2, 'succeed !');
        strictEqual(this.panneau.getMenus().length, 2, 'succeed !');
        strictEqual(this.panneau.getMenus()[0].constructor.name, 'Arborescence', 'succeed !');
        strictEqual(this.panneau.getMenuParId('tree_panneau').constructor.name, 'Arborescence', 'succeed !');
    });
    
    test('ajout/remove menus après init', function() {
        this.panneau.init();
        var menu = new Arborescence();
        var menu2 = new Arborescence({id:'test'});
        this.panneau.ajouter(menu);
        this.panneau.enleverMenu(menu);
        strictEqual(this.panneau.menus.length, 1, 'succeed !');
        strictEqual(this.panneau.menus[0].constructor.name, 'Arborescence', 'succeed !');
        strictEqual(this.panneau._getPanel().items.items[0].title, "Arborescence des couches", 'succeed !');
        strictEqual(this.panneau.menus[0].obtenirId(), "test", 'succeed !');
    });*/
   
    
});