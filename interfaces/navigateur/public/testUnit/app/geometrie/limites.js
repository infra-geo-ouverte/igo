require(['limites', 'point'], function (Limites, Point) {

    module('Limites',{
        setup: function() {
            this.limites = new Limites(40, 30, 50, 60, 'EPSG:4326');
        }
    });
    test('création', function() {
        strictEqual(this.limites.gauche, 40, 'gauche');
        strictEqual(this.limites.bas, 30, 'bas');
        strictEqual(this.limites.droite, 50, 'droite');
        strictEqual(this.limites.haut, 60, 'haut');
        strictEqual(this.limites.projection, 'EPSG:4326', 'projection');

        var limites = new Limites('-7933887.5829941', '5909591.6735735', '-7933857.5829941', '5909681.6735735');
        strictEqual(limites.gauche, -7933887.5829941, 'string - gauche');
        strictEqual(limites.bas, 5909591.6735735, 'string - bas');
        strictEqual(limites.droite, -7933857.5829941, 'string - droite');
        strictEqual(limites.haut, 5909681.6735735, 'string - haut');
        strictEqual(limites.projection, 'EPSG:3857', 'string - projection');

        throws(
            function(){
                new Limites(40, 20, 30, 'EPSG:4326');
            },
            new Error("new Limites : Paramètre absent"),
            "Erreur: Paramètre absent"
        );

        throws(
            function(){
                new Limites();
            },
            new Error("new Limites : Paramètre absent"),
            "Erreur: Aucun paramètre"
        );

        throws(
            function(){
                new Limites(40, 20, 30, 50, '3857');
            },
            new Error("new Limites : Projection EPSG invalide"),
            "Erreur: Projection EPSG invalide"
        );
    });

    test('obtenirTypeClasse', function() {
        strictEqual(this.limites.obtenirTypeClasse(), 'Limites', 'succeed !');
    });
    
    test('obtenirProjection', function() {
        var proj = this.limites.obtenirProjection();
        strictEqual(proj, 'EPSG:4326', 'succeed !');
    });

    test('definirProjection', function() {
        this.limites.definirProjection('EPSG:3857');
        strictEqual(this.limites.projection, 'EPSG:3857', 'succeed !');

        throws(
            function(){
              this.limites.definirProjection('EPSG:4326d');
            },
            new Error("Limites.definirProjection : Projection EPSG invalide"),
            "Erreur: Projection invalide"
        );
    });
    
    test('contientPoint', function() {
        var p1 = new Point(45,50, 'EPSG:4326');
        var p2 = new Point(40,30, 'EPSG:4326');
        var p3 = new Point(30,40, 'EPSG:4326');
        var p4 = new Point(-45,-50, 'EPSG:4326');
        var p5 = new Point(-7933887.5829941, 5909681.6735735);
        strictEqual(this.limites.contientPoint(p1), true, 'succeed !');
        strictEqual(this.limites.contientPoint(p2), true, 'succeed !');
        strictEqual(this.limites.contientPoint(p3), false, 'succeed !');
        strictEqual(this.limites.contientPoint(p4), false, 'succeed !');
        
        throws(
            function(){
              this.limites.contientPoint();
            },
            new Error("Limites.contientPoint : L'argument n'est pas un point"),
            "Erreur: Argument vide"
        );

        throws(
            function(){
              this.limites.contientPoint([11, 22]);
            },
            new Error("Limites.contientPoint : L'argument n'est pas un point"),
            "Erreur: Argument Invalide"
        );

        throws(
            function(){
              this.limites.contientPoint(p5);
            },
            new Error("Limites.contientPoint : Le point n'est pas dans la même projection"),
            "Erreur: Projection invalide"
        );
    });

   test('projeter', function() {
        var limites = this.limites.projeter('EPSG:3857');
        strictEqual(limites.droite, 5565974.538888888  , 'Projection 1 paramètre - x');
        strictEqual(limites.haut, 8399737.888649108, 'Projection 1 paramètre - y');
        strictEqual(limites.projection, 'EPSG:3857', 'Projection 1 paramètre - projection');
        
        var l1 = new Limites(-73, 46, -74, 47);
        var l2 = l1.projeter('EPSG:4326', 'EPSG:900913');
        strictEqual(l2.gauche, -8126322.826777778, 'Projection 2 paramètres - x');
        strictEqual(l2.bas, 5780349.219451725, 'Projection 2 paramètres - y');
        strictEqual(l2.projection, 'EPSG:900913', 'Projection 2 paramètres - projection');
        strictEqual(l1.gauche, -73, 'Projection 2 paramètres - x origine');
        strictEqual(l1.bas, 46, 'Projection 2 paramètres - y origine');
        strictEqual(l1.projection, 'EPSG:3857', 'Projection 2 paramètres - projection origine');

        throws(
            function(){
              this.limites.projeter('EPSG:4326d');
            },
            new Error("Limites.projeter : Projection voulue invalide"),
            "Erreur: Projection voulue invalide"
        );
    
        throws(
            function(){
              this.limites.projeter('4326', 'EPSG:4326');
            },
            new Error("Limites.projeter : Projection source invalide"),
            "Erreur: Projection source invalide"
        );
    });
    
    test('_obtenirGeomOL', function() {
        var lsOL = this.limites._obtenirGeomOL();
        strictEqual(lsOL.components[0].components[1].x, 50, 'x');
        strictEqual(lsOL.components[0].components[1].y, 30, 'y');
        strictEqual(lsOL.CLASS_NAME, "OpenLayers.Geometry.Polygon" , 'CLASS_NAME');
    });
    
    test('_obtenirBoundsOL', function() {
        var lsOL = this.limites._obtenirBoundsOL();
        strictEqual(lsOL.left, 40, 'x');
        strictEqual(lsOL.top, 60, 'y');
        strictEqual(lsOL.CLASS_NAME, "OpenLayers.Bounds" , 'CLASS_NAME');
    });

});