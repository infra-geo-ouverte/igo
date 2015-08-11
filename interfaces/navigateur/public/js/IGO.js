function Igo(options){
    this.options = options || {};
    this.init();
};

Igo.prototype.init = function(){
    var that=this;
    var debug= this.options.debug; 
    var baseUri = this.options.uri.navigateur;
    var version = this.options.version || '0.0.0';
    var buildIGO = ['build'];
    
    var sPageURL =window.location.search.substring(1),sURLVariables=sPageURL.split("&");
    for(var i=0; i<sURLVariables.length; i++){
        var sParameterName=sURLVariables[i].split("=");
        if(sParameterName[0]=='debug') {
            debug= isNaN(Number(sParameterName[1])) ? Boolean(sParameterName[1]) : Number(sParameterName[1]);
        };
    }
    
    if(debug){
        debugIGO=debug;
        buildIGO=[];
    };

    requirejs.onError = function (err) {
        Igo.Aide.afficherMessage('Erreur chargement ('+err.requireType+')', "Le module '" + err.requireModules + "' n'a pas été chargé", null, 'Erreur')
        throw new Error("Le module '" + err.requireModules + "' n'a pas été chargé: " + err.originalError.target.src);
    };
    
    
    require.config({
        baseUrl: baseUri,
        urlArgs: "version="+version,
        paths: {
            evenement: 'js/app/helper/evenement',
            requireAide: 'js/app/helper/requireAide',
            contexte: 'js/app/helper/contexte',
            metadonnee: 'js/app/helper/metadonnee',
            browserDetect: 'js/app/helper/browserDetect',
            ajaxProxy: 'js/app/helper/ajaxProxy',
            aide: 'js/app/helper/aide',
            fonctions: 'js/app/helper/fonctions',
            carte: 'js/app/carte',
            panneau: 'js/app/panneau/panneau',
            panneauAccordeon: 'js/app/panneau/panneauAccordeon',
            panneauInfo: 'js/app/panneau/panneauInfo',
            panneauMenu: 'js/app/panneau/panneauMenu',
            panneauTable_1: 'js/app/panneau/panneauTable_1',
            panneauTable: 'js/app/panneau/panneauTable',
            panneauEntete: 'js/app/panneau/panneauEntete',
            panneauCarte: 'js/app/panneau/panneauCarte',
            panneauOnglet: 'js/app/panneau/panneauOnglet',
            style: 'js/app/occurence/style',
            point: 'js/app/occurence/geometrie/point',
            limites: 'js/app/occurence/geometrie/limites',
            polygone: 'js/app/occurence/geometrie/polygone',
            ligne: 'js/app/occurence/geometrie/ligne',
            multiPoint: 'js/app/occurence/geometrie/multiPoint',
            multiLigne: 'js/app/occurence/geometrie/multiLigne',
            multiPolygone: 'js/app/occurence/geometrie/multiPolygone',
            occurence: 'js/app/occurence/occurence',
            cluster: 'js/app/occurence/cluster',
            gestionCouches: 'js/app/couche/gestionCouches',
            couche: 'js/app/couche/protocole/couche',
            TMS: 'js/app/couche/protocole/TMS',
            vecteur: 'js/app/couche/protocole/vecteur',
            vecteurCluster: 'js/app/couche/protocole/vecteurCluster',
            WMS: 'js/app/couche/protocole/WMS',
            blanc: 'js/app/couche/protocole/blanc',
            OSM: 'js/app/couche/protocole/OSM',
            google: 'js/app/couche/protocole/google',
            marqueurs: 'js/app/couche/protocole/marqueurs',
            localisation: 'js/app/menu/localisation',
            googleItineraire: 'js/app/menu/googleItineraire',
            arborescence: 'js/app/menu/arborescence',
            itineraire: 'js/app/menu/itineraire',
            googleStreetView: 'js/app/menu/googleStreetView',
            impression: 'js/app/menu/impression',
            recherche: 'js/app/menu/recherche/recherche',
            rechercheCadastreReno: 'js/app/menu/recherche/rechercheCadastreReno',
            rechercheGPS: 'js/app/menu/recherche/rechercheGPS',
            rechercheHQ: 'js/app/menu/recherche/rechercheHQ',
            rechercheInverseAdresse: 'js/app/menu/recherche/rechercheInverseAdresse',
            rechercheAdresse: 'js/app/menu/recherche/rechercheAdresse',
            rechercheLieu: 'js/app/menu/recherche/rechercheLieu',
            rechercheBorne: 'js/app/menu/recherche/rechercheBorne',
            exportImport: 'js/app/menu/exportImport/exportImport',
            export: 'js/app/menu/exportImport/export',
            import: 'js/app/menu/exportImport/import',
            contexteMenuCarte: 'js/app/contexteMenu/contexteMenuCarte',
            contexteMenu: 'js/app/contexteMenu/contexteMenu',
            contexteMenuArborescence: 'js/app/contexteMenu/contexteMenuArborescence',
            contexteMenuTable: 'js/app/contexteMenu/contexteMenuTable',
            analyseurConfig: 'js/app/analyseur/analyseurConfig',
            analyseurGML: 'js/app/analyseur/analyseurGML',
            analyseurGeoJSON: 'js/app/analyseur/analyseurGeoJSON',
            outilDessin2: 'js/app/outil/outilDessin2',
            outilEdition: 'js/app/outil/outilEdition',
            outilMenu: 'js/app/outil/outilMenu',
            outilRapporterBogue: 'js/app/outil/outilRapporterBogue',
            outilItineraire: 'js/app/outil/outilItineraire',
            outilHistoriqueNavigation: 'js/app/outil/outilHistoriqueNavigation',
            outilPartagerCarte: 'js/app/outil/outilPartagerCarte',
            outilInfo: 'js/app/outil/outilInfo',
            outilAjoutWMS: 'js/app/outil/outilAjoutWMS',
            outilDessin: 'js/app/outil/outilDessin',
            outilZoomPreselection: 'js/app/outil/outilZoomPreselection',
            outilControleMenu: 'js/app/outil/outilControleMenu',
            outilSelection: 'js/app/outil/outilSelection',
            outilSaaq: 'js/app/outil/outilSaaq',
            outilZoomEtendueMaximale: 'js/app/outil/outilZoomEtendueMaximale',
            outilDeplacerCentre: 'js/app/outil/outilDeplacerCentre',
            outilAide: 'js/app/outil/outilAide',
            outilAnalyseSpatiale: 'js/app/outil/outilAnalyseSpatiale',
            outil: 'js/app/outil/outil',
            outilMesure: 'js/app/outil/outilMesure',
            outilDeplacement: 'js/app/outil/outilDeplacement',
            outilZoomRectangle: 'js/app/outil/outilZoomRectangle',
            barreOutils: 'js/app/barreOutils',
            navigateur: 'js/app/navigateur',
            async : "libs/require/src/async",
            noAMD : "libs/require/src/noAMD",
            css : "libs/require/src/css",
            text : "libs/require/src/text",
            jquery: "libs/jquery/jquery-1.10.2.min",
            proj4js: 'libs/proj/Proj4js',
            epsgDef: 'libs/proj/epsgDef',
            build: "js/main-build"
        }, 
        shim: {
            build: {
                deps: ['requireAide']
            },
            epsgDef: {
                deps: ['proj4js']
            }
        }
    });
    
    require(buildIGO, function(){
        var igoNavReq = ['aide', 'browserDetect', 'carte', 'OSM', 'analyseurConfig'];
        var igoAideReq = ['requireAide', 'ajaxProxy', 'proj4js', 'epsgDef'];

        var igoReq = igoNavReq.concat(igoAideReq);
        require(igoReq, function (Aide) {
            var aReqSize = igoNavReq.length;
            var argsObj = $.map(arguments, function(value) {return [value];});
            Igo = $.extend({}, Aide.getRequisObjet(igoNavReq, argsObj.splice(0,aReqSize)));

            //=============================================
            
            //Config
            Aide.definirVersion(version);
            Aide.definirConfig(that.options);
            
            var c = new Igo.AnalyseurConfig({configuration: that.options.configuration });
            that = $.extend(that, c.charger());
            //Aide.definirNavigateur(that.nav);
/*
            that.nav = {};
            that.nav.carte = new that.Carte();
            that.nav.carte.gestionCouches.ajouterCouche(new that.OSM());
            that.nav.carte.zoomer(3);
            Aide.definirNavigateur(that.nav);
            that.Actions = {};
            require(['demoAction'], function(DemoAction){
                that.Actions.demoAction = DemoAction;
            });*/
        });
    });
}