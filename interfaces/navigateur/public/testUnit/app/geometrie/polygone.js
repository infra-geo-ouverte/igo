require(['polygone','ligne', 'point', 'limites'], function (Polygone, Ligne, Point, Limites) {

    module('Polygone',{
        setup: function() {
            Igo = {
                Geometrie: {
                    Point: Point,
                    Polygone: Polygone,
                    Limites: Limites
                }
            }            
            this.polygone = new Polygone([[-7933887.5829941, 5909591.6735735], [-7633887.5529941, 5509591.6735735], [-7833887.5829941, 5709591.6735735]]);
            this.polygoneTroue = new Polygone([[[-7933887.5829941, 5909591.6735735], [-7633887.5529941, 5909591.6735735], [-7633887.5529941, 5609591.6735735], [-7833887.5829941, 5709591.6735735]], [[-7833887.5829941, 5809591.6735735], [-7733887.5529941, 5809591.6735735], [-7833887.5829941, 5709591.6735735]]]);
        }
    });
    test('création', function() {
        //Création Simple
        strictEqual(this.polygone.lignes[0].points[0].x, -7933887.5829941, 'Création simple - 1er x');
        strictEqual(this.polygone.lignes[0].points[0].y, 5909591.6735735, 'Création simple - 1er y');
        strictEqual(this.polygone.lignes[0].points[3].x, -7933887.5829941, 'Création simple - 4e x');
        strictEqual(this.polygone.lignes[0].points[3].y, 5909591.6735735, 'Création simple - 4e y');
        strictEqual(this.polygone.projection, 'EPSG:3857', 'Création simple - projection');

        //Création avec projection
        var poly1 = new Polygone([[45,50], [47,51], [48,54], [45,54]], 'EPSG:4326')
        strictEqual(poly1.lignes[0].points[0].x, 45, 'Création avec projection - x');
        strictEqual(poly1.lignes[0].points[0].y, 50, 'Création avec projection - y');
        strictEqual(poly1.projection, 'EPSG:4326', 'Création simple - projection');

        //Création polygone troué
        strictEqual(this.polygoneTroue.lignes[1].points[1].x, -7733887.5529941, 'Création polygone troué - trou x');
        strictEqual(this.polygoneTroue.lignes[1].points[1].y, 5809591.6735735, 'Création polygone troué - trou y');
        strictEqual(this.polygoneTroue.lignes[0].points[3].x, -7833887.5829941, 'Création polygone troué - contour x');
        strictEqual(this.polygoneTroue.lignes[0].points[3].y, 5709591.6735735, 'Création polygone troué - contour y');
        strictEqual(this.polygone.projection, 'EPSG:3857', 'Création polygone troué - projection');

        //Création simple à partir de points
        var p1 = new Point(47,51, 'EPSG:4326');
        var p2 = new Point(47,30, 'EPSG:4326');
        var p3 = new Point(27,30, 'EPSG:4326');  
        var poly4 = new Polygone([p1,p2,p3], 'EPSG:4326');
        strictEqual(poly4.lignes[0].points[2].x, 27, 'Création simple à partir de points - x');
        strictEqual(poly4.lignes[0].points[2].y, 30, 'Création simple à partir de points - y');
        strictEqual(poly4.projection, 'EPSG:4326', 'Création simple à partir de points - projection');  
        
        //Création trouée à partir de points
        var p4 = new Point(27,51, 'EPSG:4326');  
        var p5 = new Point(30,35, 'EPSG:4326');  
        var p6 = new Point(35,40, 'EPSG:4326');  
        var p7 = new Point(33,37, 'EPSG:4326');  
        var poly5 = new Polygone([[p1,p2,p3,p4], [p5,p6,p7]], 'EPSG:4326');
        strictEqual(poly5.lignes[0].points[2].x, 27, 'Création troué à partir de points - contour x');
        strictEqual(poly5.lignes[0].points[2].y, 30, 'Création troué à partir de points - contour y');
        strictEqual(poly5.lignes[1].points[1].x, 35, 'Création troué à partir de points- trou x');
        strictEqual(poly5.lignes[1].points[1].y, 40, 'Création troué à partir de points- trou y');
        strictEqual(poly5.projection, 'EPSG:4326', 'Création troué à partir de points - projection');
        
        //Création simple à partir de lignes
        var ligne1 = new Ligne([[45,50], [46,78], [58,75], [58,50]], 'EPSG:4326');
        var poly6 = new Polygone(ligne1, 'EPSG:4326');
        var poly7 = new Polygone([ligne1], 'EPSG:4326');
        strictEqual(poly6.lignes[0].points[2].x, 58, 'Création simple à partir de lignes - 3e x');
        strictEqual(poly6.lignes[0].points[2].y, 75, 'Création simple à partir de lignes - 3e y');
        strictEqual(poly7.lignes[0].points[1].x, 46, 'Création simple à partir de lignes - 2e x');
        strictEqual(poly7.lignes[0].points[1].y, 78, 'Création simple à partir de lignes - 2e y');
        strictEqual(poly7.projection, 'EPSG:4326', 'Création simple à partir de lignes - projection');      

        //Création trouée à partir de lignes
        var ligne2 = new Ligne([[48,52], [49,53], [49,53], [48,52]], 'EPSG:4326');       
        var ligne3 = new Ligne([[50,62], [51,63], [50,68]], 'EPSG:4326');       
        var poly8 = new Polygone([ligne1, ligne2, ligne3], 'EPSG:4326');
        strictEqual(poly8.lignes[0].points[2].x, 58, 'Création troué à partir de lignes - contour x');
        strictEqual(poly8.lignes[0].points[2].y, 75, 'Création troué à partir de lignes - contour y');
        strictEqual(poly8.lignes[2].points[1].x, 51, 'Création troué à partir de lignes - trou x');
        strictEqual(poly8.lignes[2].points[1].y, 63, 'Création troué à partir de lignes - trou y');
        strictEqual(poly8.lignes.length, 3, 'Création troué à partir de lignes -  nombre ligne');
        strictEqual(poly8.projection, 'EPSG:4326', 'Création troué à partir de lignes - projection');
          
        //Création OL
        var lOL1 = new OpenLayers.Geometry.LinearRing([new OpenLayers.Geometry.Point(-7833887.5829941, 5709591.6735735), new OpenLayers.Geometry.Point(-7933887.5829941, 5909591.6735735), new OpenLayers.Geometry.Point(-7633887.5529941, 5509591.6735735)]);
        var pOL1 = new OpenLayers.Geometry.Polygon([lOL1]);
        var poly9 = new Polygone(pOL1);
        strictEqual(poly9.lignes[0].points[2].x, -7633887.5529941, 'Création simple à partir de OL - x');
        strictEqual(poly9.lignes[0].points[2].y, 5509591.6735735, 'Création simple à partir de OL - y');
        strictEqual(poly9.projection, 'EPSG:3857', 'Création simple à partir de OL - projection');  
        
        //Création OL troué
        var lOL2 = new OpenLayers.Geometry.LinearRing([new OpenLayers.Geometry.Point(-7733887.5829941, 5809591.6735735), new OpenLayers.Geometry.Point(-7783887.5829941, 5809591.6735735), new OpenLayers.Geometry.Point(-7733887.5529941, 5859591.6735735)]);
        var pOL2 = new OpenLayers.Geometry.Polygon([lOL1, lOL2]);
        var poly10 = new Polygone(pOL2);
        strictEqual(poly10.lignes[0].points[2].x, -7633887.5529941, 'Création troué à partir de OL - contour x');
        strictEqual(poly10.lignes[0].points[2].y, 5509591.6735735, 'Création troué à partir de OL - contour y');
        strictEqual(poly10.lignes[1].points[1].x, -7783887.5829941, 'Création troué à partir de OL - trou x');
        strictEqual(poly10.lignes[1].points[1].y, 5809591.6735735, 'Création troué à partir de OL - trou y');
        strictEqual(poly10.projection, 'EPSG:3857', 'Création troué à partir de OL - projection');
          
        //Création OL à partir de ligne
        var poly11 = new Polygone([lOL1]);
        var poly12 = new Polygone(lOL1);
        strictEqual(poly11.lignes[0].points[2].x, -7633887.5529941, 'Création OL array ligne - x');
        strictEqual(poly11.lignes[0].points[2].y, 5509591.6735735, 'Création OL array ligne - y');
        strictEqual(poly12.lignes[0].points[2].x, -7633887.5529941, 'Création OL ligne - x');
        strictEqual(poly12.lignes[0].points[2].y, 5509591.6735735, 'Création OL ligne - y');

        //Création OL à partir de points
        var poly13 = new Polygone([new OpenLayers.Geometry.Point(-7833887.5829941, 5709591.6735735), new OpenLayers.Geometry.Point(-7933887.5829941, 5909591.6735735), new OpenLayers.Geometry.Point(-7633887.5529941, 5509591.6735735)]);
        strictEqual(poly13.lignes[0].points[2].x, -7633887.5529941, 'Création OL point - x');
        strictEqual(poly13.lignes[0].points[2].y, 5509591.6735735, 'Création OL point - y');
        
        throws(
            function(){
                new Polygone();
            },
            new Error("new Polygone : Le paramètre est obligatoire"),
            "Erreur: Paramètre vide"
        );

        throws(
            function(){
                new Polygone([]);
            },
            new Error("new Ligne : La ligne doit être composée d'au moins 2 points"),
            "Erreur: Array vide"
        );

        throws(
            function(){
                new Polygone([1,2,3]);
            },
            new Error("new Ligne : Paramètre invalide"),
            "Erreur: Paramètre invalide"
        );

        throws(
            function(){
                new Polygone([-72, 46],[-73,46]);
            },
            new Error("new Polygone : Projection EPSG invalide"),
            "Erreur: Projection EPSG invalide"
        );

        throws(
            function(){
                new Polygone([p1], 'EPSG:4326');
            },
            new Error("new Ligne : La ligne doit être composée d'au moins 2 points"),
            "Erreur: Ligne avec moins que 2 points"
        );

        throws(
            function(){
                new Polygone([[p1, 'patate', p3]], 'EPSG:4326');
            },
            new Error("new Ligne : Paramètre invalide"),
            "Erreur: Paramètre invalide"
        );

        throws(
            function(){
                new Polygone([p1, p2, p3]);
            },
            new Error("new Ligne : Les Points ne sont pas dans la même projection"),
            "Erreur: Point dans une projection différente"
        );
        
        throws(
            function(){
                new Polygone([ligne1]);
            },
            new Error("new Polygone : Les lignes ne sont pas dans la même projection"),
            "Erreur: Lignes dans une projection différente"
        );
    });

    test('obtenirTypeClasse', function() {
        strictEqual(this.polygone.obtenirTypeClasse(), 'Polygone', 'succeed !');
    });
    
    test('obtenirProjection', function() {
        var proj = this.polygoneTroue.obtenirProjection();
        strictEqual(proj, 'EPSG:3857', 'succeed !');
    });

    test('definirProjection', function() {
        this.polygoneTroue.definirProjection('EPSG:4326');
        strictEqual(this.polygoneTroue.projection, 'EPSG:4326', 'succeed !');

        throws(
            function(){
              this.polygoneTroue.definirProjection('EPSG:4326d');
            },
            new Error("Polygone.definirProjection : Projection EPSG invalide"),
            "Erreur: Projection invalide"
        );
    });
    
    test('obtenirPerimetre', function() {
        strictEqual(this.polygone.obtenirPerimetre(), 704892.0440000001, 'Périmètre calculée en 3857');
        strictEqual(this.polygoneTroue.obtenirPerimetre(), 963934.5610000001, 'Périmètre poly troué calculée en 3857');
        var p1 = new Polygone([[-73,46], [-72,45], [-74,47]], 'EPSG:4326');  
        strictEqual(p1.obtenirPerimetre(), 541897.5380000001, 'Périmètre calculée en 4326');
    });
    
    test('obtenirSuperficie', function() {
        strictEqual(this.polygone.obtenirSuperficie(), 4574463393.428245, 'Superficie calculée en 3857');
        strictEqual(this.polygoneTroue.obtenirSuperficie(), 26503599753.747646, 'Superficie poly troué calculée en 3857');
        var p1 = new Polygone([[-73,46], [-72,45], [-74,47]], 'EPSG:4326');  
        strictEqual(p1.obtenirSuperficie(), 77788045.51221466, 'Superficie calculée en 4326');    });
    
    test('obtenirExterieur', function() {
        strictEqual(this.polygoneTroue.obtenirExterieur().points[0].x, -7933887.5829941, 'x');
        strictEqual(this.polygoneTroue.obtenirExterieur().points[0].y, 5909591.6735735, 'y');
    });
    
    test('obtenirInterieurs', function() {
        strictEqual(this.polygone.obtenirInterieurs().length, 0, 'sans trou');
        strictEqual(this.polygoneTroue.obtenirInterieurs()[0].points[1].x, -7733887.5529941, 'x');
        strictEqual(this.polygoneTroue.obtenirInterieurs()[0].points[1].y, 5809591.6735735, 'y');
    });
    
    test('projeter', function() {
        var polygone = this.polygone.projeter('EPSG:4326');
        strictEqual(polygone.lignes[0].points[0].x, -71.27132479281792 , 'Projection 1 paramètre - x');
        strictEqual(polygone.lignes[0].points[0].y, 46.80062607030524, 'Projection 1 paramètre - y');
        strictEqual(polygone.projection, 'EPSG:4326', 'Projection 1 paramètre - projection');
        
        var p1 = new Polygone([[-73, 46], [-74, 47], [-77, 45]]);
        var p2 = p1.projeter('EPSG:4326', 'EPSG:900913');
        strictEqual(p2.lignes[0].points[1].x, -8237642.317555556, 'Projection 2 paramètres - x');
        strictEqual(p2.lignes[0].points[1].y, 5942074.071603965, 'Projection 2 paramètres - y');
        strictEqual(p2.lignes[0].projection, 'EPSG:900913', 'Projection 2 paramètres - projection');
        strictEqual(p1.lignes[0].points[1].x, -74, 'Projection 2 paramètres - x origine');
        strictEqual(p1.lignes[0].points[1].y, 47, 'Projection 2 paramètres - y origine');
        strictEqual(p1.projection, 'EPSG:3857', 'Projection 2 paramètres - projection origine');

        var polygoneTroue = this.polygoneTroue.projeter('EPSG:4326');
        strictEqual(polygoneTroue.lignes[0].points[0].x, -71.27132479281792 , 'Projection 1 paramètre poly troué - ext x');
        strictEqual(polygoneTroue.lignes[0].points[0].y, 46.80062607030524, 'Projection 1 paramètre poly troué - ext y');
        strictEqual(polygoneTroue.lignes[1].points[0].x, -70.37300950857336, 'Projection 1 paramètre poly troué - int y');
        strictEqual(polygoneTroue.lignes[1].points[0].y, 46.18217852714825 , 'Projection 1 paramètre poly troué - int y');
        strictEqual(polygone.projection, 'EPSG:4326', 'Projection 1 paramètre - projection');

        throws(
            function(){
              this.polygone.projeter('EPSG:4326d');
            },
            new Error("Polygone.projeter : Projection voulue invalide"),
            "Erreur: Projection voulue invalide"
        );
    
        throws(
            function(){
              this.polygone.projeter('4326', 'EPSG:4326');
            },
            new Error("Polygone.projeter : Projection source invalide"),
            "Erreur: Projection source invalide"
        );
    });
    
    
    test('simplifier', function() {
        var p1 = new Polygone([[-7933887.5829941, 5909591.6735735], [-7633887.8529941, 5509591.7735735], [-7633887.5529941, 5509591.6735735], [-7833887.5829941, 5709591.6735735]]);
        var p2 = p1.simplifier(1);
        var p3 = p1.simplifier(0.1);
        strictEqual(p1.lignes[0].points.length, 5, 'original');
        strictEqual(p2.lignes[0].points.length, 4, 'simplifié');
        strictEqual(p3.lignes[0].points.length, 5, 'non-simplifié');
        
        //Polygone troué
        var p4 = new Polygone([[[-7933887.5829941, 5909591.6735735], [-7633887.8529941, 5509591.7735735], [-7633887.5529941, 5509591.6735735], [-7833887.5829941, 5709591.6735735]], [[-7833887.5829941, 5809591.6735735], [-7733887.8529941, 5609591.7735735], [-7733887.8929941, 5609591.8735735], [-7733889.5529941, 5609593.6735735]]]);
        var p5 = p4.simplifier(0.5);
        var p6 = p4.simplifier(1);
        strictEqual(p5.lignes[0].points.length, 4, 'poly troué - contour');
        strictEqual(p5.lignes[1].points.length, 4, 'poly troué - trou');
        strictEqual(p6.lignes.length, 1, 'poly troué - trou effacé');
    });    

    test('_obtenirGeomOL', function() {
        var pOL = this.polygoneTroue._obtenirGeomOL();
        strictEqual(pOL.components[0].components[2].x, -7633887.5529941 , 'x');
        strictEqual(pOL.components[1].components[3].y, 5809591.6735735 , 'y');
    });
    

});
