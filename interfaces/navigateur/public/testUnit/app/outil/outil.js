require(['outil', 'carte'], function (Outil, Carte) {

    module('Outil',{
        setup: function() {
            this.outil = new Outil({id:'test', titre:'test Unit', icone: 'http://test.com'});
            this.outil2 = new Outil({description:'test Unit', icone: 'test'});
        }
    });
    test('création', function() {
        strictEqual(this.outil2.options.icone, 'test', 'succeed !');
        strictEqual(this.outil.options.titre, 'test Unit', 'succeed !');
    });
    
    test('init', function() {
        this.outil.init();
        this.outil2.init();
        strictEqual(this.outil._extOptions.icon, 'http://test.com', 'succeed !');
        strictEqual(this.outil2._extOptions.iconCls, 'test', 'succeed !');
        strictEqual(this.outil._extOptions.tooltip, 'Description', 'succeed !');
        strictEqual(this.outil2._extOptions.tooltip, 'test Unit', 'succeed !');
    });
    
    
    test('obtenirId', function() {
        this.outil.init();
        strictEqual(this.outil.obtenirId(), 'test', 'succeed !');
    });
    
    test('_getBouton', function() {
        this.outil.init();
        strictEqual(this.outil._getBouton().tooltip, 'Description', 'succeed !');
    });
    

});