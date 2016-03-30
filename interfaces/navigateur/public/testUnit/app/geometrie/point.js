require(['point', 'limites'], function (Point, Limites) {

    module('Point',{
        setup: function() {
            Igo = {
                Geometrie: {
                    Point: Point,
                    Limites: Limites
                }
            }
            this.point = new Point(-7933887.5829941, 5909591.6735735);
        }
    });
    test('création', function() {
        //Création Simple
        strictEqual(this.point.x, -7933887.5829941, 'Création simple - x');
        strictEqual(this.point.y, 5909591.6735735, 'Création simple - y');
        strictEqual(this.point.projection, 'EPSG:3857', 'Création simple - projection');
        
        //Création Array
        var p1 = new Point([10, 30]);
        strictEqual(p1.x, 10, 'Création array - x');
        strictEqual(p1.y, 30, 'Création array - y');
        strictEqual(p1.projection, 'EPSG:3857', 'Création array - projection');
        
        //Création OL
        var pOL = new OpenLayers.Geometry.Point(55,33);
        var p2 = new Point(pOL);
        strictEqual(p2.x, 55, 'Création OL - x');
        strictEqual(p2.y, 33, 'Création OL - y');
        strictEqual(p2.projection, 'EPSG:3857', 'Création OL - projection');
                
        //Création simple avec proj
        var p3 = new Point('20.55', '40.11', 'EPSG:4326');
        strictEqual(p3.x, 20.55, 'Création simple avec proj - x');
        strictEqual(p3.y, 40.11, 'Création simple avec proj - y');
        strictEqual(p3.projection, 'EPSG:4326', 'Création simple avec proj - projection');
        
        //Création Array avec proj
        var p4 = new Point([30.52, 30.21], 'EPSG:4326');
        strictEqual(p4.x, 30.52, 'Création array avec proj - x');
        strictEqual(p4.y, 30.21, 'Création array avec proj - y');
        strictEqual(p4.projection, 'EPSG:4326', 'Création array avec proj - projection');
   
        //Création OL
        var p5 = new Point(pOL, 'EPSG:4326');
        strictEqual(p5.x, 55, 'Création OL avec proj - x');
        strictEqual(p5.y, 33, 'Création OL avec proj - y');
        strictEqual(p5.projection, 'EPSG:4326', 'Création OL avec proj - projection');
  
        throws(
            function(){
                new Point();
            },
            new Error("new Point : Paramètres obligatoires"),
            "Erreur: Paramètres absents"
        );
         
        throws(
            function(){
              new Point(22);
            },
            new Error("new Point : Paramètres invalides"),
            "Erreur: y manquant"
        );

        throws(
            function(){
              new Point([]);
            },
            new Error("new Point : Paramètres invalides"),
            "Erreur: array vide"
        );

        throws(
            function(){
              new Point(22,33,'4326');
            },
            new Error("new Point : Projection EPSG invalide"),
            "Erreur: Projection invalide"
        );
        
    });

    test('obtenirTypeClasse', function() {
        strictEqual(this.point.obtenirTypeClasse(), 'Point', 'succeed !');
    });
    
    test('obtenirProjection', function() {
        var proj = this.point.obtenirProjection();
        strictEqual(proj, 'EPSG:3857', 'succeed !');
    });

    test('definirProjection', function() {
        this.point.definirProjection('EPSG:4326');
        strictEqual(this.point.projection, 'EPSG:4326', 'succeed !');

        throws(
            function(){
              this.point.definirProjection('EPSG:4326d');
            },
            new Error("Point.definirProjection : Projection EPSG invalide"),
            "Erreur: Projection invalide"
        );
    });

    test('projeter', function() {
        var point = this.point.projeter('EPSG:4326');
        strictEqual(point.x, -71.27132479281792 , 'Projection 1 paramètre - x');
        strictEqual(point.y, 46.80062607030524, 'Projection 1 paramètre - y');
        strictEqual(point.projection, 'EPSG:4326', 'Projection 1 paramètre - projection');
        
        var p1 = new Point(-73, 46);
        var p2 = p1.projeter('EPSG:4326', 'EPSG:900913');
        strictEqual(p2.x, -8126322.826777778, 'Projection 2 paramètres - x');
        strictEqual(p2.y, 5780349.219451725, 'Projection 2 paramètres - y');
        strictEqual(p2.projection, 'EPSG:900913', 'Projection 2 paramètres - projection');
        strictEqual(p1.x, -73, 'Projection 2 paramètres - x origine');
        strictEqual(p1.y, 46, 'Projection 2 paramètres - y origine');
        strictEqual(p1.projection, 'EPSG:3857', 'Projection 2 paramètres - projection origine');

        throws(
            function(){
              this.point.projeter('EPSG:4326d');
            },
            new Error("Point.projeter : Projection voulue invalide"),
            "Erreur: Projection voulue invalide"
        );
    
        throws(
            function(){
              this.point.projeter('4326', 'EPSG:4326');
            },
            new Error("Point.projeter : Projection source invalide"),
            "Erreur: Projection source invalide"
        );
    });
    
    test('_obtenirGeomOL', function() {
        var p = this.point._obtenirGeomOL();
        strictEqual(p.x, -7933887.5829941, 'x');
        strictEqual(p.y, 5909591.6735735 , 'y');
        strictEqual(p.CLASS_NAME, "OpenLayers.Geometry.Point" , 'CLASS_NAME');
    });
    
    test('_obtenirLonLatOL', function() {
        var ll = this.point._obtenirLonLatOL();
        strictEqual(ll.lon, -7933887.5829941, 'lon');
        strictEqual(ll.lat, 5909591.6735735 , 'lat');
        strictEqual(ll.CLASS_NAME, "OpenLayers.LonLat" , 'CLASS_NAME');
    });
    
    test('estEgal', function() {
        var p1 = new Point(50,45);
        var p2 = new Point(-7933887.5829941, 5909591.6735735);
        var p3 = new Point(50, 45, 'EPSG:4326');
        strictEqual(this.point.estEgal(p1), false, "N'est pas égal");
        strictEqual(this.point.estEgal(p2), true, 'Est egal');
        strictEqual(this.point.estEgal("string"), false, "Pas un Point");
        strictEqual(p1.estEgal(p2), false, "Projection différente");
    });
    
    test('distanceDe', function() {
        var p1 = new Point(-75, 45, 'EPSG:4326');
        var p2 = new Point(-7933897.5829941, 5909581.6735735);
        var p3 = new Point(-73, 48, 'EPSG:4326');
        
        strictEqual(this.point.distanceDe(p2), 14.142135623730951, "Distance en mètre (3857)");
        strictEqual(p3.distanceDe(p1), 3.605551275463989, 'Distance en degré (4326)');
       
        throws(
            function(){
              this.point.distanceDe(p1);
            },
            new Error("Point.distanceDe : Les points ne sont pas dans la même projection"),
            "Erreur: Points dans des projections différentes"
        );

        throws(
            function(){
              this.point.distanceDe();
            },
            new Error("Point.distanceDe : L'argument n'est pas un point"),
            "Erreur: Argument invalide"
        );
    });   
    
    test('deplacer', function() {
        var p1 = new Point(-75, 45, 'EPSG:4326');
        var p2 = new Point(-7933897.5829941, 5909581.6735735);
        var p3 = new Point(-73, 48, 'EPSG:4326');
        
        var pD1 = this.point.deplacer(p2);
        p3.deplacer(p1);
        strictEqual(pD1.x, -7933897.5829941, "Déplacer en 3857 - x");
        strictEqual(pD1.y, 5909581.6735735, "Déplacer en 3857 - y");
        strictEqual(p3.x, -75, 'Déplacer en 4326 - x');
        strictEqual(p3.y, 45, 'Déplacer en 4326 - y');
              
        throws(
            function(){
              this.point.deplacer(p1);
            },
            new Error("Point.deplacer : Les points ne sont pas dans la même projection"),
            "Erreur: Points dans des projections différentes"
        );

        throws(
            function(){
              this.point.deplacer();
            },
            new Error("Point.deplacer : L'argument est obligatoire"),
            "Erreur: Argument invalide"
        );
    }); 
    
});
