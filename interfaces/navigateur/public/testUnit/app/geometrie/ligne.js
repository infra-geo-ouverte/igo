require(['ligne', 'point', 'limites'], function (Ligne, Point, Limites) {

    module('Ligne',{
        setup: function() {
            Igo = {
                Geometrie: {
                    Point: Point,
                    Ligne: Ligne,
                    Limites: Limites
                }
            }
            this.ligne = new Ligne([[-7933887.5829941, 5909591.6735735], [-7633887.5529941, 5509591.6735735], [-7833887.5829941, 5709591.6735735]]);
        }
    });
    test('création', function() {
        //Création Simple
        strictEqual(this.ligne.points[1].x, -7633887.5529941, 'Création simple - x');
        strictEqual(this.ligne.points[1].y, 5509591.6735735, 'Création simple - y');
        strictEqual(this.ligne.projection, 'EPSG:3857', 'Création simple - projection');
        
        //Création Simple avec projection
        var l1 = new Ligne([[-73,46],[-73.5,46.2],[-72,45],[-74.2, 48]], 'EPSG:4326');
        strictEqual(l1.points[3].x, -74.2, 'Création simple avec proj - x');
        strictEqual(l1.points[3].y, 48, 'Création simple avec proj - y');
        strictEqual(l1.projection, 'EPSG:4326', 'Création simple avec proj - projection');
        
        //Création à partir de points
        var p1 = new Point(47, 51, 'EPSG:4326');
        var p2 = new Point(37, 30, 'EPSG:4326');
        var p3 = new Point(27, 30, 'EPSG:4326');
        var l2 = new Ligne([p1,p2,p3], 'EPSG:4326');
        strictEqual(l2.points[0], p1, 'Création avec points - p1');
        strictEqual(l2.points[1], p2, 'Création avec points - p2');
        strictEqual(l2.points[2], p3, 'Création avec points - p3');
        strictEqual(l1.projection, 'EPSG:4326', 'Création avec points - projection');
        
        //Création OL
        var lOL = new OpenLayers.Geometry.LineString([new OpenLayers.Geometry.Point(-7933887.5829941, 5909591.6735735), new OpenLayers.Geometry.Point(-7633887.5529941, 5509591.6735735)]);
        var l3 = new Ligne(lOL);
        strictEqual(l3.points[1].x, -7633887.5529941, 'Création OL - x');
        strictEqual(l3.points[1].y, 5509591.6735735, 'Création OL - y');
        strictEqual(l3.projection, 'EPSG:3857', 'Création OL - projection');
        
        //Création OL
        var l4 = new Ligne([new OpenLayers.Geometry.Point(-7933887.5829941, 5909591.6735735), new OpenLayers.Geometry.Point(-7633887.5529941, 5509591.6735735)]);
        strictEqual(l4.points[1].x, -7633887.5529941, 'Création OL points - x');
        strictEqual(l4.points[1].y, 5509591.6735735, 'Création OL points - y');
        
        throws(
            function(){
                new Ligne();
            },
            new Error("new Ligne : Paramètre invalide"),
            "Erreur: Aucun paramètre"
        );

        throws(
            function(){
                new Ligne([-72, 46],[-73,46]);
            },
            new Error("new Ligne : Projection EPSG invalide"),
            "Erreur: Projection EPSG invalide"
        );

        throws(
            function(){
                new Ligne([p1], 'EPSG:4326');
            },
            new Error("new Ligne : La ligne doit être composée d'au moins 2 points"),
            "Erreur: Ligne avec moins que 2 points"
        );

        throws(
            function(){
                new Ligne([p1, 'patate', p3], 'EPSG:4326');
            },
            new Error("new Ligne : Paramètre invalide"),
            "Erreur: Paramètre invalide"
        );

        throws(
            function(){
                new Ligne([p1, p2, p3]);
            },
            new Error("new Ligne : Les Points ne sont pas dans la même projection"),
            "Erreur: Point dans une projection différente"
        );
        
    });

    test('obtenirTypeClasse', function() {
        strictEqual(this.ligne.obtenirTypeClasse(), 'Ligne', 'succeed !');
    });
    
    test('obtenirProjection', function() {
        var proj = this.ligne.obtenirProjection();
        strictEqual(proj, 'EPSG:3857', 'succeed !');
    });

    test('definirProjection', function() {
        this.ligne.definirProjection('EPSG:4326');
        strictEqual(this.ligne.projection, 'EPSG:4326', 'succeed !');

        throws(
            function(){
              this.ligne.definirProjection('EPSG:4326d');
            },
            new Error("Ligne.definirProjection : Projection EPSG invalide"),
            "Erreur: Projection invalide"
        );
    });
    
    test('obtenirLongueur', function() {
        strictEqual(this.ligne.obtenirLongueur(), 550203.511, 'Longueur calculée en 3857');
        var l1 = new Ligne([[-73,46],[-72,45]], 'EPSG:4326');  
        strictEqual(l1.obtenirLongueur(), 135869.091, 'Longueur calculée en 4326');
    });
    
    test('ajouterPoint', function() {
        var p1 = new Point(-73, 46, 'EPSG:4326');
        var p2 = new Point(-7773887.5829941, 5999591.67357);
        var ligne = this.ligne.ajouterPoint(p2);
        strictEqual(this.ligne.points[3].x, -7773887.5829941, 'Point: x ajouté');
        strictEqual(this.ligne.points[3].y, 5999591.67357, 'Point: y ajouté');
        strictEqual(ligne.points[3], p2, 'point ajouté');
  
        var ligne2 = this.ligne.ajouterPoint([-7773888.5829941, 5999592.67357]);
        strictEqual(ligne2.points[4].x, -7773888.5829941, 'Coord: x ajouté');
        strictEqual(ligne2.points[4].y, 5999592.67357, 'Coord: y ajouté');
  
        var geomOL;
        this.ligne._feature = {geometry: {addPoint: function(p){geomOL = p;}}};
        var ligne2 = this.ligne.ajouterPoint(p2);
        strictEqual(geomOL.x, -7773887.5829941, '_feature.geometry.addPoint - x');
        strictEqual(geomOL.y, 5999591.67357, '_feature.geometry.addPoint - y');
        
        throws(
            function(){
              this.ligne.ajouterPoint();
            },
            new Error("Ligne.ajouterPoint : L'argument n'est pas un point"),
            "Erreur: Argument vide"
        );

        throws(
            function(){
              this.ligne.ajouterPoint(p1);
            },
            new Error("Ligne.ajouterPoint : Le point n'est pas dans la même projection"),
            "Erreur: Projection différente"
        );
    });
    
    test('estFerme', function() {
        strictEqual(this.ligne.estFerme(), false, "N'est pas fermé");
        var ligne = this.ligne.fermerLigne();
        strictEqual(this.ligne.estFerme(), true, "Est fermé");
    });
    
    test('fermerLigne', function() {
        var ligne = this.ligne.fermerLigne();
        strictEqual(this.ligne.points[3].x, -7933887.5829941, 'x');
        strictEqual(this.ligne.points[3].y, 5909591.6735735, 'y');
        strictEqual(ligne.points[3], this.ligne.points[0], 'Point');
    });
    
    test('projeter', function() {
        var ligne = this.ligne.projeter('EPSG:4326');
        strictEqual(ligne.points[0].x, -71.27132479281792 , 'Projection 1 paramètre - x');
        strictEqual(ligne.points[0].y, 46.80062607030524, 'Projection 1 paramètre - y');
        strictEqual(ligne.projection, 'EPSG:4326', 'Projection 1 paramètre - projection');
        
        var l1 = new Ligne([[-73, 46], [-74, 47]]);
        var l2 = l1.projeter('EPSG:4326', 'EPSG:900913');
        strictEqual(l2.points[1].x, -8237642.317555556, 'Projection 2 paramètres - x');
        strictEqual(l2.points[1].y, 5942074.071603965, 'Projection 2 paramètres - y');
        strictEqual(l2.projection, 'EPSG:900913', 'Projection 2 paramètres - projection');
        strictEqual(l1.points[1].x, -74, 'Projection 2 paramètres - x origine');
        strictEqual(l1.points[1].y, 47, 'Projection 2 paramètres - y origine');
        strictEqual(l1.projection, 'EPSG:3857', 'Projection 2 paramètres - projection origine');

        throws(
            function(){
              this.ligne.projeter('EPSG:4326d');
            },
            new Error("Ligne.projeter : Projection voulue invalide"),
            "Erreur: Projection voulue invalide"
        );
    
        throws(
            function(){
              this.ligne.projeter('4326', 'EPSG:4326');
            },
            new Error("Ligne.projeter : Projection source invalide"),
            "Erreur: Projection source invalide"
        );
    });
    
    
    test('simplifier', function() {
        var l1 = new Ligne([[-7933887.5829941, 5909591.6735735], [-7633887.8529941, 5509591.7735735],  [-7633887.5529941, 5509591.6735735], [-7833887.5829941, 5709591.6735735]]);
        var l2 = l1.simplifier(1);
        var l3 = l1.simplifier(0.1);
        strictEqual(l1.points.length, 4, 'original');
        strictEqual(l2.points.length, 3, 'simplifié');
        strictEqual(l3.points.length, 4, 'non-simplifié');
    });
     
    test('_obtenirGeomOL', function() {
        var lsOL = this.ligne._obtenirGeomOL();
        strictEqual(lsOL.components[1].x, -7633887.5529941, 'x');
        strictEqual(lsOL.components[1].y, 5509591.6735735, 'y');
        strictEqual(lsOL.CLASS_NAME, "OpenLayers.Geometry.LineString" , 'CLASS_NAME');
    });
    
    test('_obtenirGeomFermeOL', function() {
        var lrOL = this.ligne._obtenirGeomFermeOL();
        strictEqual(lrOL.components[0].x, -7933887.5829941, '1er x');
        strictEqual(lrOL.components[0].y, 5909591.6735735, '1er y');
        strictEqual(lrOL.components[3].x, -7933887.5829941, 'dernier x');
        strictEqual(lrOL.components[3].y, 5909591.6735735, 'dernier y');
        strictEqual(lrOL.CLASS_NAME, "OpenLayers.Geometry.LinearRing" , 'CLASS_NAME');
    });
    
});
