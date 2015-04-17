/**
 * Outil permettant l'exportation d'un sélection de géométrie ver un fichier GPX
 */
require.ajouterConfig({
    paths: {
            togpx: '[librairies]ext/extension/togpx/togpx'
    }
});
define(['outil', 'aide', 'analyseurGeoJSON', 'togpx'], function(Outil, Aide, AnalyseurGeoJSON, togpx) {
    function OutilExportGPX(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: Aide.obtenirCheminRacine()+'images/toolbar/gps_up.png',
            infobulle: "Exporter en GPX"
        });
    };

    OutilExportGPX.prototype = new Outil();
    OutilExportGPX.prototype.constructor = OutilExportGPX;
        
    OutilExportGPX.prototype.executer = function() {
        var that = this;     
        var result, geojson;
        this.tabOccu = new Array();       
        var analyseur = new AnalyseurGeoJSON({
            projectionCarte: this.carte.obtenirProjection()
        });
 
        var occurencesSelect = this.carte.gestionCouches.obtenirOccurencesSelectionnees();
        
        $.each(occurencesSelect, function(index, occurrences) {    
            $.each(occurrences, function(ind, occu) {                     
                that.tabOccu.push(occu.projeter("EPSG:4326"));
            });            
        });
                        
        if(this.tabOccu.length == 0){
            Aide.afficherMessage("Aucune sélection", "S.V.P. faites une sélection");
            return false;
        }
        
        geojson = JSON.parse(analyseur.ecrire(that.tabOccu));        
        result = togpx(geojson); 
        
        var lien = document.createElement('a');
        document.body.appendChild(lien); //Nécessaire pour Firefox
        var data = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(result);
        lien.setAttribute('href', data);
        lien.setAttribute('download', "fichier.gpx");
        lien.click();
    };

    return OutilExportGPX;
    
});

