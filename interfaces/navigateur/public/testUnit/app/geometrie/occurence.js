require(['occurence', 'point', 'ligne', 'polygone', 'multiPolygone', 'limites', 'style'], function (Occurence, Point, Ligne, Polygone, MultiPolygone, Limites, Style) {

    module('Occurence',{
        setup: function() {
            this.occurenceP = new Occurence(new Point(45, 30, 'EPSG:4326'), {nom1:'value1', nom2:'value2', objet: {o1n1: 'v1', o1n2: 'v2'}}, {couleur: '#f2f2f8'});
            this.occurenceL = new Occurence(new Ligne([[44,33],[22,53]]));
        }
    });
    test('création', function() {
        strictEqual(this.occurenceP.type, 'Point', 'Type Point');
        strictEqual(this.occurenceL.type, 'Ligne', 'Type Ligne');
        strictEqual(this.occurenceL.obtenirLongueur(), 29.642, 'Longueur');
        strictEqual(this.occurenceL.selectionnee, false, 'Selectionnee');
        strictEqual(this.occurenceL.regleCourant, 'defaut', 'regleCourant');
        strictEqual(this.occurenceP.proprietes.nom2, 'value2', 'Proprietes');
        strictEqual(this.occurenceP.styles.defaut.propriete.couleur, '#f2f2f8', 'Style');
  
        var vectorOL = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(22,33), {key1:'test1'});
        var occurence1 = new Occurence(vectorOL);
        strictEqual(occurence1.type, 'Point', 'Vecteur OL - type');
        strictEqual(occurence1.y, 33, 'Vecteur OL - extend Geometrie');
        strictEqual(occurence1._feature.attributes.key1, 'test1', 'Vecteur OL - propriete OL');
        strictEqual(occurence1.proprietes.key1, 'test1', 'Vecteur OL - propriete');

        var occurence2 = new Occurence(vectorOL, {key2: 'test2'});
        strictEqual(occurence2._feature.attributes.key2, 'test2', 'Vecteur OL avec proprietes - propriete OL');
        strictEqual(occurence2.proprietes.key2, 'test2', 'Vecteur OL avec proprietes - propriete');
    
    });

    test('obtenirTypeClasse', function() {
        strictEqual(this.occurenceP.obtenirTypeClasse(), 'Occurence', 'succeed !');
    });
    
    test('estSelectionnee', function() {
        strictEqual(this.occurenceL.estSelectionnee(), false, 'faux');
        this.occurenceL.selectionnee=true;
        strictEqual(this.occurenceL.estSelectionnee(), true, 'vrai');
    });
    
    test('selectionner', function() {
        var declencheur = false;
        var declencheurOccurence;
        this.occurenceL.ajouterDeclencheur('occurenceSelectionnee', function(e){
            declencheur = true;
            declencheurOccurence = e.target.id;
        });
        this.occurenceL.selectionner();
        strictEqual(this.occurenceL.estSelectionnee(), true, 'estSelectionnee');
        strictEqual(this.occurenceL.regleCourant, 'select', 'regleCourant');
        strictEqual(declencheur, true, 'declencheur occurenceSelectionnee');
        strictEqual(declencheurOccurence, this.occurenceL.id, 'declencheur.occurence');

        var event;
        this.occurenceP.vecteur = {
            declencher: function(e){event = e;}, 
            rafraichir:function(){},
            obtenirTypeClasse: function(){return "Vecteur"}
        };
        this.occurenceP.selectionner();
        strictEqual(event.type, 'vecteurOccurenceSelectionnee', 'event vecteurOccurenceSelectionnee');
        strictEqual(event.occurence.id, this.occurenceP.id, 'event vecteurOccurenceSelectionnee - occurence'); 
    });
    
    test('deselectionner', function() {
        this.occurenceL.selectionner();
        var declencheur = false;
        var declencheurOccurence;
        this.occurenceL.ajouterDeclencheur('occurenceDeselectionnee', function(e){
            declencheur = true;
            declencheurOccurence = e.target.id;
        });
        this.occurenceL.deselectionner();
        strictEqual(this.occurenceL.estSelectionnee(), false, 'estSelectionnee');
        strictEqual(this.occurenceL.regleCourant, 'defaut', 'regleCourant');
        strictEqual(declencheur, true, 'declencheur occurenceDeselectionnee');
        strictEqual(declencheurOccurence, this.occurenceL.id, 'declencheur.occurence');
        
        /*var event;
        this.occurenceP.vecteur = {
            declencher: function(e){event = e;}, 
            rafraichir:function(){},
            obtenirTypeClasse: function(){return "Vecteur"}
        };
        this.occurenceP.deselectionner();
        console.log(event);
        strictEqual(event.type, 'vecteurOccurenceDeselectionnee', 'event vecteurOccurenceDeselectionnee');
        strictEqual(event.occurence.id, this.occurenceP.id, 'event vecteurOccurenceDeselectionnee - occurence');  */
    });
    
    test('estVisible', function() {
        strictEqual(this.occurenceL.estVisible(), false, 'false');
    });
    
    test('estAffichee', function() {
        strictEqual(this.occurenceL.estAffichee(), false, 'false');
    });
     
    test('obtenirTypeGeometrie', function() {
        strictEqual(this.occurenceL.obtenirTypeGeometrie(), 'Ligne', 'false');
        strictEqual(this.occurenceP.obtenirTypeGeometrie(), 'Point', 'false');
    });
       
    test('obtenirProprietes', function() {
        strictEqual($.isEmptyObject(this.occurenceL.obtenirProprietes()), true, 'vide');
        strictEqual(this.occurenceP.obtenirProprietes().nom1, 'value1', 'value1');
    }); 
    
    test('definirProprietes', function() {
        this.occurenceP.definirProprietes({'test1': 'yes'});
        strictEqual(this.occurenceP.obtenirProprietes().nom1, undefined, 'undefined');
        strictEqual(this.occurenceP.obtenirProprietes().test1, 'yes', 'value1');

        strictEqual(this.occurenceP.modifiee, true, 'modifiee');
        strictEqual(this.occurenceP.proprietesOriginales.nom1, 'value1', 'proprietes Originales');
        
        throws(
            function(){
                this.occurenceP.definirProprietes('faux');
            },
            new Error("Occurence.definirProprietes : Paramètre invalide"),
            "Erreur: Paramètre invalide"
        );
    }); 
    
    test('obtenirPropriete', function() {
        strictEqual(this.occurenceP.obtenirPropriete(), undefined, 'undefined');
        strictEqual(this.occurenceP.obtenirPropriete('nom1'), 'value1', 'value1');
        strictEqual(this.occurenceP.obtenirPropriete('/id'), this.occurenceP.id, 'id');
        strictEqual(this.occurenceP.obtenirPropriete('objet.o1n2'), 'v2', 'objet');
        strictEqual(this.occurenceP.obtenirPropriete('objet.o1n3'), undefined, 'path inexistant');
        strictEqual(this.occurenceP.obtenirPropriete('/proprietes.objet.o1n1'), 'v1', 'path absolu');
    }); 
    
    test('definirPropriete', function() {
        this.occurenceP.definirPropriete('nom3', 'value3');
        strictEqual(this.occurenceP.obtenirPropriete('nom3'), 'value3', 'succeed');

        this.occurenceP.definirPropriete('objet.o1n2', 'newV2');
        strictEqual(this.occurenceP.obtenirPropriete('objet.o1n2'), 'newV2', 'objet');

        this.occurenceP.definirPropriete('/proprietes.objet.o1n1', 'newV1');
        strictEqual(this.occurenceP.obtenirPropriete('/proprietes.objet.o1n1'), 'newV1', 'path absolu');

        strictEqual(this.occurenceP.modifiee, true, 'modifiee');
        strictEqual(this.occurenceP.proprietesOriginales.objet.o1n2, 'v2', 'proprietes Originales');
        
        throws(
            function(){
                this.occurenceP.definirPropriete(1, 'faux');
            },
            new Error("Occurence.definirPropriete : Nom de la propriété invalide"),
            "Erreur: Nom de la propriété invalide"
        );

        throws(
            function(){
                this.occurenceP.definirPropriete('nom3.o2n1', 'faux');
            },
            new Error("Occurence.definirPropriete : Nom de la propriété invalide"),
            "Erreur: Nom de la propriété complexe invalide"
        );

    }); 
    
    test('obtenirStyle', function() {
        this.occurenceP.styles.select = new Style({couleur: '#99ff99'});
        strictEqual(this.occurenceP.obtenirStyle('defaut').propriete.couleur, '#f2f2f8', 'defaut');
        strictEqual(this.occurenceP.obtenirStyle('select').propriete.couleur, '#99ff99', 'select');
        strictEqual(this.occurenceP.obtenirStyle().propriete.couleur, '#f2f2f8', 'vide');
        strictEqual(this.occurenceP.obtenirStyle('courant').propriete.couleur, '#f2f2f8', 'courant');

        this.occurenceP.regleCourant = 'select';
        strictEqual(this.occurenceP.obtenirStyle().propriete.couleur, '#99ff99', 'vide - courant select');
        strictEqual(this.occurenceP.obtenirStyle('2'), undefined, 'undefined');

        strictEqual(this.occurenceL.obtenirStyle('courant'), undefined, 'courant undefined');
    
        this.occurenceP.styles.invalide = 'test';
        strictEqual(this.occurenceP.obtenirStyle('invalide'), undefined, 'invalide');      
    }); 
    
    test('definirStyle', function() {
        var appliquerStyle = false;
        this.occurenceL.appliquerStyle= function(regle){appliquerStyle = regle};
        
        this.occurenceL.definirStyle({couleur: '#ffff99'});
        strictEqual(this.occurenceL.obtenirStyle('defaut').propriete.couleur, '#ffff99', 'defaut');
        strictEqual(appliquerStyle, 'defaut', 'appliquerStyle(defaut)');

        appliquerStyle = false;
        this.occurenceL.definirStyle({couleur: '#99ff99', limiteEpaisseur: 10}, 'select');
        strictEqual(this.occurenceL.obtenirStyle('select').propriete.couleur, '#99ff99', 'select couleur');
        strictEqual(this.occurenceL.obtenirStyle('select').propriete.limiteEpaisseur, 10, 'select limiteEpaisseur');
        strictEqual(appliquerStyle, false, 'appliquerStyle(select)');
        
        var style = new Style({couleur: '#999999'});
        this.occurenceL.definirStyle(style, 'survol');
        style.definirPropriete('rayon', 10);
        this.occurenceL.obtenirStyle('survol').definirPropriete('etiquette', 'test');
        strictEqual(this.occurenceL.obtenirStyle('survol').propriete.couleur, '#999999', 'survol');
        strictEqual(this.occurenceL.obtenirStyle('survol').propriete.rayon, undefined, 'rayon');
        strictEqual(this.occurenceL.obtenirStyle('survol').propriete.etiquette, 'test', 'etiquette');
        strictEqual(style.propriete.rayon, 10, 'origine rayon');
        strictEqual(style.propriete.etiquette, undefined, 'origine etiquette');
        strictEqual(this.occurenceL.obtenirStyle('survol').parent.id, this.occurenceL.id, 'parent');
        
        this.occurenceP.definirStyle();
        strictEqual(this.occurenceP.obtenirStyle('defaut'), undefined, 'retirer style');

        throws(
            function(){
               this.occurenceP.definirStyle({}, 1);
            },
            new Error("Occurence.definirStyle : Règle du style invalide"),
            "Erreur: Règle invalide"
        );
    }); 
    
    test('appliquerStyle', function() {
        this.occurenceL.appliquerStyle();
        strictEqual(this.occurenceL.regleCourant, 'defaut', 'regle par defaut');
        strictEqual(this.occurenceL.survolStyleActif, undefined, 'survol non defini');
        strictEqual(this.occurenceL._feature.style, undefined, '_feature.style defaut');
        strictEqual(this.occurenceL._feature.renderIntent, 'default', 'renderIntent defaut');

        this.occurenceL.appliquerStyle('select');
        strictEqual(this.occurenceL.regleCourant, 'select', 'regle select');
        strictEqual(this.occurenceL._feature.style, undefined, '_feature.style select');
        strictEqual(this.occurenceL._feature.renderIntent, 'select', 'renderIntent select');

        this.occurenceL.appliquerStyle('courant');
        strictEqual(this.occurenceL.regleCourant, 'select', 'regle courant');

        this.occurenceL.appliquerStyle('select', true);
        strictEqual(this.occurenceL.regleCourant, 'select', 'regle select avec survol');
        strictEqual(this.occurenceL.survolStyleActif, true, 'survol = true');

        this.occurenceL.appliquerStyle('defaut');
        strictEqual(this.occurenceL.survolStyleActif, true, 'this.survolStyleActif = true');
        strictEqual(this.occurenceL._feature.renderIntent, 'over', 'renderIntent over');

        this.occurenceL.appliquerStyle('select', false);
        strictEqual(this.occurenceL.survolStyleActif, false, 'survol = false');

        this.occurenceL.appliquerStyle('inexistant', false);
        strictEqual(this.occurenceL._feature.style, undefined, 'regle inexistant');
        strictEqual(this.occurenceL._feature.renderIntent, 'inexistant', 'renderIntent inexistant');

        this.occurenceP.appliquerStyle();
        strictEqual(this.occurenceP.regleCourant, 'defaut', 'regle par defaut');
        strictEqual(this.occurenceP._feature.style.fillColor, "#f2f2f8", '_feature.style.fillColor');
        strictEqual(this.occurenceP._feature.renderIntent, undefined, 'renderIntent defaut');
        
        this.occurenceP.definirStyle({couleur: '#99ff99', rayon:10}, 'select');
        strictEqual(this.occurenceP._feature.style.fillColor, "#f2f2f8", '_feature.style.fillColor avant');
        
        this.occurenceP.appliquerStyle('select');
        strictEqual(this.occurenceP._feature.style.fillColor, "#99ff99", '_feature.style.fillColor');
        strictEqual(this.occurenceP._feature.style.pointRadius, 10, '_feature.style.pointRadius');
        strictEqual(this.occurenceP._feature.renderIntent, undefined, 'renderIntent defaut');      

        throws(
            function(){
               this.occurenceP.appliquerStyle({}, true);
            },
            new Error("Occurence.appliquerStyle : Règle du style invalide"),
            "Erreur: Règle invalide"
        );
    }); 

    test('_definirOverStyle', function() {
        var t1 = this.occurenceL._definirOverStyle();
        strictEqual(t1, false, 'vecteur absent');
        
        this.occurenceP.vecteur = {
            _layer: {
                styleMap: {
                    styles: {}
                }
            }
        };
        
        var t2 = this.occurenceL._definirOverStyle();
        strictEqual(t2, false, 'style absent');
        
        this.occurenceL.vecteur = {
            _layer: {
                styleMap: new OpenLayers.StyleMap()
            }
        };
       
        var t3 = this.occurenceL._definirOverStyle();
        strictEqual(t3, true, 'return true');
        strictEqual(this.occurenceL.vecteur._layer.styleMap.styles.over.defaultStyle.fillOpacity, '0.6', 'pas de style survol défini');

        this.occurenceL.vecteur.styles = {survol: new Style({limiteEpaisseur: 2})};        this.occurenceL._definirOverStyle();
        strictEqual(this.occurenceL.vecteur._layer.styleMap.styles.over.defaultStyle.fillOpacity, 0.4, 'style survol défini dans vecteur - opacité');
        strictEqual(this.occurenceL.vecteur._layer.styleMap.styles.over.defaultStyle.fillColor, '#ee9900', 'style survol défini dans vecteur - couleur');
        strictEqual(this.occurenceL.vecteur._layer.styleMap.styles.over.defaultStyle.strokeWidth, 2, 'style survol défini dans vecteur - strokeWidth');
        strictEqual(this.occurenceL.styles.over, undefined, 'style survol défini dans vecteur - style occurence undefined');

        this.occurenceL.regleCourant = 'select';
        this.occurenceL._definirOverStyle();
        strictEqual(this.occurenceL.vecteur._layer.styleMap.styles.over.defaultStyle.fillOpacity, 0.4, 'style survol défini dans vecteur - opacité');
        strictEqual(this.occurenceL.vecteur._layer.styleMap.styles.over.defaultStyle.fillColor, '#ee9900', 'style survol défini dans vecteur - couleur');
        strictEqual(this.occurenceL.vecteur._layer.styleMap.styles.over.defaultStyle.strokeWidth, 2, 'style survol défini dans vecteur - strokeWidth');

        this.occurenceL.appliquerStyle= function(regle){};
        this.occurenceL.definirStyle({couleur: '#99ff99', limiteEpaisseur: 10}, 'select');
        this.occurenceL._definirOverStyle();
        strictEqual(this.occurenceL.styles.over.propriete.opacite, "0.6", 'style défini dans occurence - opacité');
        strictEqual(this.occurenceL.styles.over.propriete.couleur, '#99ff99', 'style défini dans occurence - couleur');
        strictEqual(this.occurenceL.styles.over.propriete.limiteEpaisseur, 10, 'style défini dans occurence - limiteEpaisseur');

        this.occurenceL.definirStyle({limiteEpaisseur: 20}, 'survol');
        this.occurenceL._definirOverStyle();
        strictEqual(this.occurenceL.styles.over.propriete.opacite, undefined, 'style survol défini dans occurence - opacité');
        strictEqual(this.occurenceL.styles.over.propriete.couleur, '#99ff99', 'style survol défini dans occurence - couleur');
        strictEqual(this.occurenceL.styles.over.propriete.limiteEpaisseur, 20, 'style survol défini dans occurence - limiteEpaisseur');
    }); 

    test('obtenirProprieteStyle', function() {
        this.occurenceP.appliquerStyle= function(regle){};
        this.occurenceP.definirStyle({couleur: '#99ff99', limiteEpaisseur: 10}, 'select');
        this.occurenceP.regleCourant = 'select';
        strictEqual(this.occurenceP.obtenirProprieteStyle(), undefined, 'vide');
        strictEqual(this.occurenceP.obtenirProprieteStyle('nom1'), undefined, 'undefined');
        strictEqual(this.occurenceP.obtenirProprieteStyle('couleur', 'defaut'), "#f2f2f8", 'style occurence - couleur defaut');
        strictEqual(this.occurenceP.obtenirProprieteStyle('couleur'), "#99ff99", 'style occurence - couleur courant');
        strictEqual(this.occurenceP.obtenirProprieteStyle('limiteEpaisseur'), 10, 'style occurence - limiteEpaisseur courant');
       
        this.occurenceP.vecteur = {
            styles: {
                select: new Style({couleur: '#f2f2f2', rayon: 5})
            }
        };
        strictEqual(this.occurenceP.obtenirProprieteStyle('rayon'), 6, 'style occurence - rayon courant');

        var that=this;
        this.occurenceL.vecteur = {
            styles: {
                select: new Style({couleur: '#f2f2f2', rayon: 5})
            },
            obtenirStyle: function(regle){
                return that.occurenceL.vecteur.styles[regle];
            }
        };

        strictEqual(this.occurenceL.obtenirProprieteStyle('couleur', 'defaut'), undefined, 'style vecteur - couleur defaut');
        strictEqual(this.occurenceL.obtenirProprieteStyle('couleur', 'select'), "#f2f2f2", 'style vecteur - couleur select');
        this.occurenceL.regleCourant = 'select';
        strictEqual(this.occurenceL.obtenirProprieteStyle('couleur'), "#f2f2f2", 'style vecteur - couleur courant');
    }); 
    
    test('definirProprieteStyle', function() {
        
        this.occurenceP.definirProprieteStyle('rayon', 10);
        strictEqual(this.occurenceP.obtenirProprieteStyle('couleur'), "#f2f2f8", 'style occurence - couleur defaut');
        strictEqual(this.occurenceP.obtenirProprieteStyle('rayon'), 10, 'style occurence - rayon defaut');

        this.occurenceP.definirProprieteStyle('rayon', 9, 'select');
        strictEqual(this.occurenceP.obtenirProprieteStyle('couleur', 'select'), "#ee9900", 'style occurence - couleur select');
        strictEqual(this.occurenceP.obtenirProprieteStyle('rayon', 'select'), 9, 'style occurence - rayon select');

        this.occurenceP.regleCourant = 'select';
        this.occurenceP.definirProprieteStyle('couleur', '#999999');
        strictEqual(this.occurenceP.obtenirProprieteStyle('couleur', 'select'), "#999999", 'style occurence - couleur courant');

        var that=this;
        this.occurenceL.appliquerStyle= function(regle){};
        this.occurenceL.vecteur = {
            styles: {
                select: new Style({couleur: '#f2f2f2', rayon: 7})
            },
            obtenirStyle: function(regle){
                return that.occurenceL.vecteur.styles[regle];
            },
            rafraichir:function(){}
        };
        this.occurenceL.definirProprieteStyle('rayon', 11, 'select');
        strictEqual(this.occurenceL.obtenirProprieteStyle('couleur', 'select'), "#f2f2f2", 'style vecteur - couleur select');
        strictEqual(this.occurenceL.obtenirProprieteStyle('rayon', 'select'), 11, 'style vecteur - rayon select');


        this.occurenceP.definirProprieteStyle('rayon', undefined, 'select');
        strictEqual(this.occurenceP.styles.select.propriete.rayon, undefined, 'retirer une propriete');

        this.occurenceP.definirProprieteStyle('couleur', undefined, 'select');
        strictEqual(this.occurenceP.styles.select, undefined, 'retirer la dernière propriété');
        
        throws(
            function(){
                this.occurenceP.definirProprieteStyle();
            },
            new Error("Occurence.definirProprieteStyle : Nom de la propriété invalide"),
            "Erreur: Nom de la propriété invalide"
        );
          
    }); 
    
   test('obtenirLimites', function() {
        strictEqual(this.occurenceP.obtenirLimites().bas, 30, 'point - bas');
        strictEqual(this.occurenceP.obtenirLimites().droite, 45, 'point - droite');
        strictEqual(this.occurenceL.obtenirLimites().bas, 33, 'ligne - bas');
        strictEqual(this.occurenceL.obtenirLimites().droite, 44, 'ligne - droite');
        strictEqual(this.occurenceL.obtenirLimites().gauche, 22, 'ligne - gauche');
        strictEqual(this.occurenceL.obtenirLimites().haut, 53, 'ligne - haut');
    });
    
  /* test('cacher', function() {
        this.occurenceP.cacher();
        strictEqual(this.occurenceP.obtenirProprieteStyle('visible'), 'none', 'Cacher defaut');
        strictEqual(this.occurenceP.obtenirProprieteStyle('visible', 'select'), undefined, 'Cacher select');
    
        this.occurenceP.cacher(true);
        strictEqual(this.occurenceP.obtenirProprieteStyle('visible'), 'none', 'Cacher tous styles defaut');
        strictEqual(this.occurenceP.obtenirProprieteStyle('visible', 'select'), 'none', 'Cacher tous styles select');
   });
    
   test('afficher', function() {
        this.occurenceP.cacher(true);
        this.occurenceP.afficher();
        strictEqual(this.occurenceP.obtenirProprieteStyle('visible'), undefined, 'Cacher defaut');
        strictEqual(this.occurenceP.obtenirProprieteStyle('visible', 'select'), 'none', 'Cacher select');
    
        this.occurenceP.afficher(true);
        strictEqual(this.occurenceP.obtenirProprieteStyle('visible'), undefined, 'Cacher tous styles defaut');
        strictEqual(this.occurenceP.obtenirProprieteStyle('visible', 'select'), undefined, 'Cacher tous styles select');
   });*/
    
   test('ouvrirInfobulle', function() {
        this.occurenceP.estAffichee = function(){return true};
        this.occurenceP.ouvrirInfobulle();
        
        strictEqual(this.occurenceP._infobulle.contentHTML, "<p>Aucun contenu.</p>", 'Defaut - html');
        notStrictEqual(this.occurenceP._infobulle.closeDiv, null, 'Defaut - aFermerBouton');

        this.occurenceP.ouvrirInfobulle({html:'test', aFermerBouton: false});
        strictEqual(this.occurenceP._infobulle.contentHTML, "test", 'Params - html');
        strictEqual(this.occurenceP._infobulle.closeDiv, null, 'Params - aFermerBouton');
   });
   
   test('ouvrirInfobulle', function() {
        this.occurenceP._infobulle='test';
        this.occurenceP.fermerInfobulle();
        strictEqual(this.occurenceP._infobulle, null, 'Fermer');
   });
   
   test('_definirGeometrie', function() {
        var occurence = this.occurenceP;
        var id = occurence.id;
        occurence._definirGeometrie(new Point(-73, 46, 'EPSG:4326'));
        strictEqual(occurence.type, 'Point', 'Point IGO - type');
        strictEqual(occurence._feature.id, id, 'Point IGO - id');
        strictEqual(occurence.x, -73, 'Point IGO - extend Geometrie');
        strictEqual(occurence._feature.attributes.nom1, 'value1', 'Point IGO - propriete');
        strictEqual(occurence._feature.geometry.CLASS_NAME, 'OpenLayers.Geometry.Point', 'Point IGO - geom');

        var geomOL = new OpenLayers.Geometry.LineString([new OpenLayers.Geometry.Point(22,33), new OpenLayers.Geometry.Point(44,31)]);
        occurence._definirGeometrie(geomOL);
        strictEqual(occurence.type, 'Ligne', 'Ligne OL - type');
        strictEqual(occurence.points[1].x, 44, 'Ligne OL - extend Geometrie');
        strictEqual(occurence._feature.geometry.CLASS_NAME, 'OpenLayers.Geometry.LineString', 'Ligne OL - geom');
        strictEqual(occurence.x, undefined, 'Ligne OL - ancienne Geometrie');

        occurence._definirGeometrie();
        strictEqual(occurence.type, undefined, 'Sans géométrie');
        
        throws(
            function(){
               occurence._definirGeometrie('patate');
            },
            new Error("Occurence._definirGeometrie : La géométrie est invalide"),
            "Erreur: Géométrie invalide"
        );
   }); 
   
   test('_obtenirGeometrie', function() {
       var point = this.occurenceP._obtenirGeometrie();
       var ligne = this.occurenceL._obtenirGeometrie();
       var poly = new Occurence(new Polygone([[44,33], [42,43], [22,53]], 'EPSG:4326'))._obtenirGeometrie();
       var multiPoly = new Occurence(new MultiPolygone([[[44,33], [42,43], [22,53]], [[60,70], [60,60], [70,70]]], 'EPSG:4326'))._obtenirGeometrie();
       var limites = new Occurence(new Limites(40, 30, 50, 60, 'EPSG:4326'))._obtenirGeometrie();
       strictEqual(point.obtenirTypeClasse(), 'Point', 'point');
       strictEqual(point.x, 45, 'point - x');
       strictEqual(point.obtenirProjection(), 'EPSG:4326', 'projection');
       strictEqual(ligne.obtenirTypeClasse(), 'Ligne', 'ligne');
       strictEqual(ligne.points[1].x, 22, 'ligne - geom');
       strictEqual(poly.obtenirTypeClasse(), 'Polygone', 'polygone');
       strictEqual(poly.lignes[0].points[0].y, 33, 'polygone - geom');
       strictEqual(multiPoly.obtenirTypeClasse(), 'MultiPolygone', 'multiPolygone');
       strictEqual(multiPoly.polygones[1].lignes[0].points[0].y, 70, 'multiPolygone - geom');
       strictEqual(limites.obtenirTypeClasse(), 'Limites', 'limites');
       strictEqual(limites.bas, 30, 'limites - geom');
   }); 
   
   test('majGeometrie', function() {
        var declencheur = false;
        var declencheurOccurence;
        this.occurenceL.ajouterDeclencheur('occurenceModifiee', function(e){
            declencheur = true;
            declencheurOccurence = e.target.id;
        });
        
        var occurence = this.occurenceL;
        occurence.majGeometrie(new Point(-73, 46, 'EPSG:4326'));
        strictEqual(occurence.type, 'Point', 'Point IGO - type');
        strictEqual(occurence.x, -73, 'Point IGO - extend Geometrie');
        strictEqual(occurence._feature.geometry.CLASS_NAME, 'OpenLayers.Geometry.Point', 'Point IGO - geom');
        strictEqual(occurence.modifiee, true, 'Point IGO - modifiee');
        strictEqual(occurence.geometrieOriginale.points[0].x, 44, 'Point IGO - geometrieOriginale');
   
        occurence.majGeometrie(new Point(-83, 46, 'EPSG:4326'));
        strictEqual(occurence.geometrieOriginale.points[0].x, 44, 'Point IGO - geometrieOriginale 2');
   
        occurence.accepterModifications();
        strictEqual(occurence.geometrieOriginale, undefined, 'Point IGO - geometrieOriginale accepté');

        strictEqual(declencheur, true, 'declencheur occurenceModifiee');
        strictEqual(declencheurOccurence, this.occurenceL.id, 'declencheur.occurence');
   }); 
   
   test('annulerModifications', function() {
        this.occurenceP.definirPropriete('nom2', 'test2');
        this.occurenceP.definirPropriete('nom3', 'value3');
        this.occurenceP.majGeometrie(new Point(40, 30, 'EPSG:4326'));
        this.occurenceP.annulerModifications();
        
        strictEqual(this.occurenceP.x, 45, 'x');
        strictEqual(this.occurenceP.obtenirPropriete('nom3'), undefined, 'nouvelle propriete');
        strictEqual(this.occurenceP.obtenirPropriete('nom2'), 'value2', 'propriete');
        strictEqual(this.occurenceP.proprietesOriginales, undefined, 'proprietes originales');
        strictEqual(this.occurenceP.geometrieOriginale, undefined, 'geometrie originale');
        strictEqual(this.occurenceP.modifiee, false, 'modifiee');
   }); 
   
   test('accepterModifications', function() {
        this.occurenceP.definirPropriete('nom2', 'test2');
        this.occurenceP.definirPropriete('nom3', 'value3');
        this.occurenceP.majGeometrie(new Point(40, 30, 'EPSG:4326'));
        this.occurenceP.accepterModifications();
        
        strictEqual(this.occurenceP.x, 40, 'x');
        strictEqual(this.occurenceP.obtenirPropriete('nom3'), 'value3', 'nouvelle propriete');
        strictEqual(this.occurenceP.obtenirPropriete('nom2'), 'test2', 'propriete');
        strictEqual(this.occurenceP.proprietesOriginales, undefined, 'proprietes originales');
        strictEqual(this.occurenceP.geometrieOriginale, undefined, 'geometrie originale');
        strictEqual(this.occurenceP.modifiee, false, 'modifiee');
   }); 
   
});
