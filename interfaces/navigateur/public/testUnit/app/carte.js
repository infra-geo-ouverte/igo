require(['carte', 'OSM', 'google', 'point', 'limites'], function (Carte, OSM, Google, Point, Limites) {

    module('Carte',{
        setup: function() {
            this.carte = new Carte();
            this.carte._init();
        }
    });
    
    test('init', function() {
        strictEqual(this.carte.projection, "EPSG:900913", 'succeed !');
    });

    test('getCarte', function() {
        strictEqual(this.carte._getCarte().Z_INDEX_BASE.Overlay, 1125, 'succeed !');
    });     

    test('zoom', function() {
        var osm = new OSM();
        this.carte.ajouterCouches([osm]);
        this.carte.definirZoom(7);
        strictEqual(this.carte.obtenirZoom(), 7, 'succeed !');
    });  
    
    test('projection', function() {
        strictEqual(this.carte.obtenirProjection(), "EPSG:900913", 'succeed !');
    });  
    
    test('gestion couches', function() {
        var osm = new OSM();
        var google = new Google();
        this.carte.ajouterCouches([osm, google]);
        strictEqual(this.carte.obtenirCouches()[0].obtenirNom(), "OpenStreetMap", 'succeed !');
        strictEqual(this.carte.obtenirCouches()[1].obtenirNom(), "Google", 'succeed !');
        var g = this.carte.obtenirCouchesParNom('Google')[0];
        strictEqual(g.obtenirNom(), "Google", 'succeed !');
        var o = this.carte.obtenirCouchesParNom('OpenStreetMap')[0];
        var len = this.carte.obtenirCouches().length;
        this.carte.enleverCouche(o);
        strictEqual(this.carte.obtenirCouches().length, len-1, 'succeed !');
        strictEqual(this.carte.obtenirCouches()[0].obtenirNom(), "Google", 'succeed !');
    });  
    
    test('limites', function() {
        var osm = new OSM();
        this.carte.ajouterCouches([osm]);
        var lim=new Limites(-4900000, 3500000, -4700000, 3700000);
        this.carte.zoomer(lim);
        strictEqual(this.carte.obtenirLimites().bas, 3404321.2076172, 'succeed !');
        strictEqual(this.carte.obtenirLimites().droite, -4806248, 'succeed !');
        strictEqual(this.carte.obtenirLimites().gauche, -5588963.1695312, 'succeed !');
        strictEqual(this.carte.obtenirLimites().haut, 3795678.7923828, 'succeed !');
        strictEqual(this.carte.obtenirLimitesMax().bas, -20037508.34, 'succeed !');
    });  
    
    test('centre', function() {
        var osm = new OSM();
        this.carte.ajouterCouches([osm]);
        var p1=new Point(-7994004,6034079);
        var p2=new Point(-7996004,6036079);
        this.carte.centrer(p1);
        strictEqual(this.carte.obtenirCentre(), null, 'succeed !');
        this.carte.definirCentre(p1);
        strictEqual(this.carte.obtenirCentre().x, -7994004, 'succeed !');
        this.carte.centrer(p2);
        strictEqual(this.carte.obtenirCentre().x, -7996004, 'succeed !');
    });  
});
