require(['multiPolygone', 'polygone', 'ligne', 'point', 'limites'], function (MultiPolygone, Polygone, Ligne, Point, Limites) {

    module('MultiPolygone',{
        setup: function() {
            Igo = {
                Geometrie: {
                    Point: Point,
                    MultiPolygone: MultiPolygone,
                    Limites: Limites
                }
            }                  
            this.multiPolygone = new MultiPolygone([[[-7933887.5829941, 5909591.6735735], [-7633887.5529941, 5509591.6735735], [-7833887.5829941, 5709591.6735735]], [[-8933887.5829941, 8909591.6735735], [-7833887.5529941, 5809591.6735735], [-6833887.5829941, 6709591.6735735]]]);
        }
    });
    test('création', function() {
        //Création Simple
        strictEqual(this.multiPolygone.polygones[0].lignes[0].points[0].x, -7933887.5829941, 'Création simple - 1er poly x');
        strictEqual(this.multiPolygone.polygones[0].lignes[0].points[0].y, 5909591.6735735, 'Création simple - 1er poly y');
        strictEqual(this.multiPolygone.polygones[1].lignes[0].points[3].x, -8933887.5829941, 'Création simple - 2e poly x');
        strictEqual(this.multiPolygone.polygones[1].lignes[0].points[3].y, 8909591.6735735, 'Création simple - 2e poly y');
        strictEqual(this.multiPolygone.projection, 'EPSG:3857', 'Création simple - projection');

        //Création avec projection
        var multipoly1 = new MultiPolygone([[[45,50], [47,51], [48,54], [45,54]]], 'EPSG:4326');
        strictEqual(multipoly1.polygones[0].lignes[0].points[0].x, 45, 'Création avec projection - x');
        strictEqual(multipoly1.polygones[0].lignes[0].points[0].y, 50, 'Création avec projection - y');
        strictEqual(multipoly1.projection, 'EPSG:4326', 'Création simple - projection');

        //Création polygone troué
        var multipoly2 = new MultiPolygone([[[[45,50], [47,51], [48,54], [45,54]], [[46,51], [47,51], [47,52]]]], 'EPSG:4326');
        strictEqual(multipoly2.polygones[0].lignes[1].points[1].x, 47, 'Création polygone troué - trou x');
        strictEqual(multipoly2.polygones[0].lignes[1].points[1].y, 51, 'Création polygone troué - trou y');
        strictEqual(multipoly2.polygones[0].lignes[0].points[3].x, 45, 'Création polygone troué - contour x');
        strictEqual(multipoly2.polygones[0].lignes[0].points[3].y, 54, 'Création polygone troué - contour y');

        //Création multipolygone à partir de points
        var p1 = new Point(47,51, 'EPSG:4326');
        var p2 = new Point(47,30, 'EPSG:4326');
        var p3 = new Point(27,30, 'EPSG:4326');  
        var p4 = new Point(27,51, 'EPSG:4326');  
        var p5 = new Point(30,35, 'EPSG:4326');  
        var p6 = new Point(35,40, 'EPSG:4326');  
        var p7 = new Point(33,37, 'EPSG:4326');  
        var multipoly3 = new MultiPolygone([[p1,p2,p3,p4], [p5,p6,p7]], 'EPSG:4326');
        strictEqual(multipoly3.polygones[0].lignes[0].points[2].x, 27, 'Création multipolygone à partir de points - poly 1 - x');
        strictEqual(multipoly3.polygones[0].lignes[0].points[2].y, 30, 'Création multipolygone à partir de points - poly 1 - y');
        strictEqual(multipoly3.polygones[1].lignes[0].points[1].x, 35, 'Création multipolygone à partir de points- poly 1 - x');
        strictEqual(multipoly3.polygones[1].lignes[0].points[1].y, 40, 'Création multipolygone à partir de points- poly 1 - y');
        
        //Création trouée à partir de points
        var multipoly3 = new MultiPolygone([[[p1,p2,p3,p4], [p5,p6,p7]]], 'EPSG:4326');
        strictEqual(multipoly3.polygones[0].lignes[0].points[2].x, 27, 'Création troué à partir de points - contour x');
        strictEqual(multipoly3.polygones[0].lignes[0].points[2].y, 30, 'Création troué à partir de points - contour y');
        strictEqual(multipoly3.polygones[0].lignes[1].points[1].x, 35, 'Création troué à partir de points- trou x');
        strictEqual(multipoly3.polygones[0].lignes[1].points[1].y, 40, 'Création troué à partir de points- trou y');

        //Création à partir de lignes
        var ligne1 = new Ligne([[45,50], [46,78], [58,75], [58,50]], 'EPSG:4326');
        var ligne2 = new Ligne([[48,52], [49,53], [49,53], [48,52]], 'EPSG:4326');       
        var ligne3 = new Ligne([[50,62], [51,63], [50,68]], 'EPSG:4326');       
        var multipoly4 = new MultiPolygone([ligne1, ligne2, ligne3], 'EPSG:4326');
        strictEqual(multipoly4.polygones[0].lignes[0].points[2].x, 58, 'Création à partir de lignes - contour x');
        strictEqual(multipoly4.polygones[0].lignes[0].points[2].y, 75, 'Création à partir de lignes - contour y');
        strictEqual(multipoly4.polygones[2].lignes[0].points[1].x, 51, 'Création à partir de lignes - trou x');
        strictEqual(multipoly4.polygones[2].lignes[0].points[1].y, 63, 'Création à partir de lignes - trou y');
        strictEqual(multipoly4.polygones.length, 3, 'Création à partir de lignes -  nombre ligne');
          
        //Création OL
        var lOL1 = new OpenLayers.Geometry.LinearRing([new OpenLayers.Geometry.Point(-7833887.5829941, 5709591.6735735), new OpenLayers.Geometry.Point(-7933887.5829941, 5909591.6735735), new OpenLayers.Geometry.Point(-7633887.5529941, 5509591.6735735)]);
        var pOL1 = new OpenLayers.Geometry.Polygon([lOL1]);
        var mpOL1 = new OpenLayers.Geometry.MultiPolygon(pOL1);
        var multipoly5 = new MultiPolygone(mpOL1);
        strictEqual(multipoly5.polygones[0].lignes[0].points[2].x, -7633887.5529941, 'Création simple à partir de OL - x');
        strictEqual(multipoly5.polygones[0].lignes[0].points[2].y, 5509591.6735735, 'Création simple à partir de OL - y');

        throws(
            function(){
                new MultiPolygone([[45,50], [47,51], [48,54], [45,54]], 'EPSG:4326');
            },
            new Error("new Ligne : Paramètre invalide"),
            "Erreur: Paramètre vide"
        );

        throws(
            function(){
                new MultiPolygone([]);
            },
            new Error("new MultiPolygone : Le multipolygone doit être composé d'au moins 1 polygone"),
            "Erreur: Array vide"
        );

        throws(
            function(){
                new MultiPolygone([1,2,3]);
            },
            new Error("new Polygone : Paramètre invalide"),
            "Erreur: Paramètre invalide"
        );

        throws(
            function(){
                new MultiPolygone();
            },
            new Error("new MultiPolygone : Paramètre invalide"),
            "Erreur: Aucun paramètre"
        );
    });

    test('obtenirTypeClasse', function() {
        strictEqual(this.multiPolygone.obtenirTypeClasse(), 'MultiPolygone', 'succeed !');
    });
    
    test('obtenirProjection', function() {
        var proj = this.multiPolygone.obtenirProjection();
        strictEqual(proj, 'EPSG:3857', 'succeed !');
    });

    test('definirProjection', function() {
        this.multiPolygone.definirProjection('EPSG:4326');
        strictEqual(this.multiPolygone.projection, 'EPSG:4326', 'succeed !');

        throws(
            function(){
              this.multiPolygone.definirProjection('EPSG:4326d');
            },
            new Error("MultiPolygone.definirProjection : Projection EPSG invalide"),
            "Erreur: Projection invalide"
        );
    });
    
    test('obtenirPerimetre', function() {
        strictEqual(this.multiPolygone.obtenirPerimetre(), 5127292.842999999, 'Périmètre calculée en 3857');
        var p1 = new MultiPolygone([[[-73,46], [-72,45], [-74,47]]], 'EPSG:4326');  
        strictEqual(p1.obtenirPerimetre(), 541897.5380000001, 'Périmètre calculée en 4326');
    });
    
    test('obtenirSuperficie', function() {
        strictEqual(this.multiPolygone.obtenirSuperficie(), 738894201001.1514, 'Superficie calculée en 3857');
        var p1 = new MultiPolygone([[[-73,46], [-72,45], [-74,47]]], 'EPSG:4326');  
        strictEqual(p1.obtenirSuperficie(), 77788045.51221466, 'Superficie calculée en 4326');    
    });

    test('projeter', function() {
        var multiPolygone = this.multiPolygone.projeter('EPSG:4326');
        strictEqual(multiPolygone.polygones[0].lignes[0].points[0].x, -71.27132479281792 , 'Projection 1 paramètre - poly 1 - x');
        strictEqual(multiPolygone.polygones[0].lignes[0].points[0].y, 46.80062607030524, 'Projection 1 paramètre - poly 1 - y');
        strictEqual(multiPolygone.polygones[1].lignes[0].points[0].x, -80.2544776352636, 'Projection 1 paramètre - poly 2 - x');
        strictEqual(multiPolygone.polygones[1].lignes[0].points[0].y, 62.21201809769192, 'Projection 1 paramètre - poly 2 - y');
        strictEqual(multiPolygone.projection, 'EPSG:4326', 'Projection 1 paramètre - projection');
        
        var p1 = new MultiPolygone([[[-73, 46], [-74, 47], [-77, 45]]]);
        var p2 = p1.projeter('EPSG:4326', 'EPSG:900913');
        strictEqual(p2.polygones[0].lignes[0].points[1].x, -8237642.317555556, 'Projection 2 paramètres - x');
        strictEqual(p2.polygones[0].lignes[0].points[1].y, 5942074.071603965, 'Projection 2 paramètres - y');
        strictEqual(p2.polygones[0].lignes[0].projection, 'EPSG:900913', 'Projection 2 paramètres - projection');
        strictEqual(p1.polygones[0].lignes[0].points[1].x, -74, 'Projection 2 paramètres - x origine');
        strictEqual(p1.polygones[0].lignes[0].points[1].y, 47, 'Projection 2 paramètres - y origine');
        strictEqual(p1.projection, 'EPSG:3857', 'Projection 2 paramètres - projection origine');

        throws(
            function(){
              this.multiPolygone.projeter('EPSG:4326d');
            },
            new Error("MultiPolygone.projeter : Projection voulue invalide"),
            "Erreur: Projection voulue invalide"
        );
    
        throws(
            function(){
              this.multiPolygone.projeter('4326', 'EPSG:4326');
            },
            new Error("MultiPolygone.projeter : Projection source invalide"),
            "Erreur: Projection source invalide"
        );
    });
    
    test('_obtenirGeomOL', function() {
        var pOL = this.multiPolygone._obtenirGeomOL();
        strictEqual(pOL.components[0].components[0].components[2].x, -7833887.5829941, 'x');
        strictEqual(pOL.components[1].components[0].components[3].y, 8909591.6735735, 'y');
    });
    

});
