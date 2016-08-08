/** 
 * Module pour l'objet {@link Panneau.RechercheGPS}.
 * @module rechercheGPS
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires recherche
 */
define(['recherche', 'aide', 'point', 'polygone', 'occurence', 'style', 'limites'], function(Recherche, Aide, Point, Polygone, Occurence, Style, Limites) {
      /** 
     * Création de l'object Panneau.RechercheGPS.
     * Objet à ajouter à un objet localisation.
     * @constructor
     * @name Panneau.RechercheGPS
     * @class Panneau.RechercheGPS
     * @alias rechercheGPS:Panneau.RechercheGPS
     * @extends Recherche
     * @requires rechercheGPS
     * @param {string} [options.titre='GPS'] Titre du panneau.
     * @returns {Panneau.RechercheGPS} Instance de {@link Panneau.RechercheGPS}
    */
    function RechercheGPS(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            typeRecherche:"gps",
            titre:"GPS"
        });
    };

    RechercheGPS.prototype = new Recherche();
    RechercheGPS.prototype.constructor = RechercheGPS;
     
    /** 
     * Obtenir l'aide en format HTML
     * @method 
     * @name RechercheGPS#obtenirAideHTML
     * @returns {String} Aide
    */ 
    RechercheGPS.prototype.obtenirAideHTML = function() {
        return  "Ex: <br>"+
                "->UTM-fuseau X,Y (utm-18 mmmmmm, mmmmmmm)<br>"+
                "->MTM-fuseau X,Y (mtm-8 mmmmmm, mmmmmmm)<br>"+
                "->Degré décimal - lon, lat (dd.ddd, dd.ddd)<br>"+
                "->Degré minute décimale - lon, lat (dd mm.mmm, dd mm.mmm)<br>"+
                "->Degré minute seconde - lon, lat (dd mm ss.sss, dd mm ss.sss)<br>"+
                "->BELL (Lat: dd mm ss.s Long: dd mm ss.s UNC: CONF:)<br>"+
                this.obtenirLienPDF();
    };
    
    RechercheGPS.prototype.lireReponse = function(data, textStatus, jqXHR) {
        if(!jqXHR.responseJSON){
            this.definirResultat('Erreur lors de la recherche.');
            return false;
        }
        
        var responseJSON = jqXHR.responseJSON;

        var style = new Style({
            visible: true,
            icone: Aide.utiliserBaseUri('images/marqueur/marker-orange.png'),
            iconeHauteur: 34,
            iconeLargeur: 20,
            iconeOffsetX: -10,
            iconeOffsetY: -34,
            filtres: [ {
                    filtre: "[cercleIncertitude]==true",
                    style: {
                        opacite: 0.3,
                        visible: true
                    }
                }, {
                    filtre: "[coteCertitude]>0",
                    style: {icone: Aide.utiliserBaseUri('images/marqueur/marker-yellow.png')}
                }, {
                    filtre: "[coteCertitude]==100",
                    style: {icone: Aide.utiliserBaseUri('images/marqueur/marker-green.png')}
                }, {
                    style: {}
                }
            ]
        });

        var survolStyle = style.cloner();
        survolStyle.definirPropriete('opacite', 0.8);

        var defautStyle = new Style({
            filtres: [ {
                    filtre: "[cercleIncertitude]==true",
                    style: {
                        opacite: 0.3,
                        visible: true
                    }
                }
            ]
        })

        var styles = {defaut: defautStyle, select: style, survol: survolStyle};
        if(this.options.idResultatTable){
            styles.defaut = style;
        }
        var vecteur = this.creerVecteurRecherche(styles, this.ajouterOccurences, {responseJSON: responseJSON});
    };
   
    RechercheGPS.prototype.ajouterOccurences = function(e) {
        var vecteur = e.target;
        var responseJSON = e.options.params.responseJSON;
        var point;
        if (responseJSON.localisation && responseJSON.localisation.point.x && responseJSON.localisation.point.y) {
            point = new Point(responseJSON.localisation.point.x, responseJSON.localisation.point.y);
            vecteur.creerOccurence(point, responseJSON);

            if(responseJSON.rayonIncertitude){
                var cercleOL = OpenLayers.Geometry.Polygon.createRegularPolygon(point._obtenirGeomOL(), responseJSON.rayonIncertitude, 50);
                var cercle = new Occurence(new Polygone(cercleOL), {cercleIncertitude: true});
                cercle.definirInteraction(false);
                vecteur.ajouterOccurence(cercle);
            }
        } else {
            this.definirResultat('Aucun résultat');
            return false;
        }
        

        vecteur.templates.table = {
            proprietesBase: 'proprietes.localisation',
            colonnes: [{
                utiliserBase: false,
                titre: 'id',
                triable: true,
                propriete: 'id'
            }, { 
                titre: 'Municipalité',
                triable: true,
                propriete: 'municipalite'
            }, { 
                titre: 'Localité',
                triable: true,
                propriete: 'localite'
            }, { 
                titre: 'Distance',
                triable: true,
                propriete: 'distance'
            }]
        };

        this.traiterResultatVecteur(vecteur, responseJSON.nombreResultat);      
    };
    
    RechercheGPS.prototype.traiterResultatVecteur = function(vecteur, nombreResultats) {
        nombreResultats = nombreResultats || vecteur.listeOccurences.length ;
        
        var occurence = vecteur.listeOccurences[0];
        if(!occurence){
            this.definirResultat('Aucun résultat');
            return false;
        }
        var resultat = this.ajouterPagination(nombreResultats);
        resultat += "<font color='blue'><u id='convertirRechercheGPS' class='rechercheResultatsListe'>Convertir les coordonnées GPS</u></font></br></br>";
        
        resultat += "<h4><u>" + occurence.proprietes.patternCoordInput + "</u>";
        if (occurence.proprietes.rayonIncertitude && occurence.proprietes.coteCertitude ){
            resultat += "</br>Certitude de " + occurence.proprietes.coteCertitude + "% dans un rayon de " +occurence.proprietes.rayonIncertitude + " m"; 
        }
        resultat += "</br>("+occurence.proprietes.formatCoordInput+")</h4>";
        resultat += "<li data-id='" + occurence.id + 
                "' class='rechercheResultatsListe'><font color='blue'><b>» </b><u>";
        
        if(occurence.proprietes.localisation.municipalite){
            resultat += 'Dans la municipalité de ' + occurence.proprietes.localisation.municipalite + ', ';
        }
        if(occurence.proprietes.localisation.distance){
            resultat += 'à ' + occurence.proprietes.localisation.distance + ' km de ' +occurence.proprietes.localisation.localite;
        }
        
        resultat += "</u></font></li>";
        this.vecteur = vecteur;
        this.definirResultat(resultat, this.initEventResultat, this);
        Recherche.prototype.traiterResultatVecteur.call(this, vecteur);
    };
    
    RechercheGPS.prototype.initEventResultat = function() {   
        $(this.resultatPanneau.items.items[0].body.dom).find('#convertirRechercheGPS')
            .click($.proxy(this.convertirRechercheGPS, this));
        Recherche.prototype.initEventResultat.call(this);
    };
    
    RechercheGPS.prototype.convertirRechercheGPS = function(){
        var occurence = this.vecteur.listeOccurences[0];
        var p4326;
        try{
            p4326=occurence.projeter("EPSG:4326");
        } catch(e){
            Aide.afficherMessage({titre: "Coordonnées invalides", message: "Les coordonnées semblent invalides"});
            return false;
        }
        
        var xAbs = Math.abs(p4326.x);
        var yAbs = Math.abs(p4326.y);
        var lonD = Math.trunc(xAbs);
        var latD = Math.trunc(yAbs);

        var lonC = 'E'; 
        var latC = 'N';
        if(p4326.x < 0){lonC = 'W';}
        if(p4326.y < 0){latC = 'S';}

        var lonM = (xAbs - lonD)*60;
        var latM = (yAbs - latD)*60;

        var lonS = (lonM - Math.trunc(lonM))*60;
        var latS = (latM - Math.trunc(latM))*60;

        var lon4326 = Math.round(p4326.x*10000)/10000;
        var lat4326 = Math.round(p4326.y*10000)/10000;

        var lonD_DMS = lonD;
        var latD_DMS = latD;
        var lonM_DMS = Math.trunc(lonM);
        var latM_DMS = Math.trunc(latM);
        var lonS_DMS = Math.round(lonS);
        var latS_DMS = Math.round(latS);
        if(latS_DMS >= 60){
            latS_DMS = 0;
            latM_DMS++;
        }
        if(lonS_DMS >= 60){
            lonS_DMS = 0;
            lonM_DMS++;
        }
        if(latM_DMS >= 60){
            latM_DMS = 0;
            latD_DMS++;
        }
        if(lonM_DMS >= 60){
            lonM_DMS = 0;
            lonD_DMS++;
        }
//        lonD_DMS = lonD_DMS < 10 ? '0'+lonD_DMS : lonD_DMS;
//        latD_DMS = latD_DMS < 10 ? '0'+latD_DMS : latD_DMS;
        lonM_DMS = lonM_DMS < 10 ? '0'+lonM_DMS : lonM_DMS;
        latM_DMS = latM_DMS < 10 ? '0'+latM_DMS : latM_DMS;
        lonS_DMS = lonS_DMS < 10 ? '0'+lonS_DMS : lonS_DMS;
        latS_DMS = latS_DMS < 10 ? '0'+latS_DMS : latS_DMS;
        
        var lonDMS = lonC + lonD_DMS + ' ' + lonM_DMS + ' ' + lonS_DMS;
        var latDMS = latC + latD_DMS + ' ' + latM_DMS + ' ' + latS_DMS;

        var lonD_GPS = lonD;
        var latD_GPS = latD;
        var lonM_GPS = Math.round(lonM*1000)/1000;
        var latM_GPS = Math.round(latM*1000)/1000;
        if(latM_GPS >= 60){
            latM_GPS = 0;
            latD_GPS++;
        }
        if(lonM_GPS >= 60){
            lonM_GPS = 0;
            lonD_GPS++;
        }
//        lonD_GPS = lonD_GPS < 10 ? '0'+lonD_GPS : lonD_GPS;
//        latD_GPS = latD_GPS < 10 ? '0'+latD_GPS : latD_GPS;
        lonM_GPS = lonM_GPS < 10 ? '0'+lonM_GPS.toFixed(3) : lonM_GPS.toFixed(3);
        latM_GPS = latM_GPS < 10 ? '0'+latM_GPS.toFixed(3) : latM_GPS.toFixed(3);
        
        var lonGPS = lonC + ' ' + lonD_GPS + ' ' + lonM_GPS;
        var latGPS = latC + ' ' + latD_GPS + ' ' + latM_GPS;

        var zUTM = Math.trunc(((180+p4326.x)/6)+1);
        var xUTM, yUTM, zoneUTM;
        if(zUTM < 1 || zUTM > 60){
            zoneUTM = "invalide";
        } else {
            var epsgUTM = "EPSG:269"+zUTM;
            var pUTM;
            try{
                pUTM = occurence.projeter(epsgUTM);
            } catch(e){
                Aide.afficherMessage({titre: "Coordonnées invalides", message: "Les coordonnées semblent invalides"});
                return false;
            }
            xUTM = pUTM.x.toFixed();
            yUTM = pUTM.y.toFixed(); 
            zoneUTM = zUTM + latC;
        }
        
        var html = "";
        html += "<table border='0' style='width:100%'>";
        html +=   "<tr>";
        html +=     "<td colspan='2'><h4>Degrés décimaux (WGS84)</h4></td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td><u>Latitude</u></td>";
        html +=     "<td><u>Longitude</u></td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td>"+lat4326+"</td>";
        html +=     "<td>"+lon4326+"</td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td style='padding-bottom:5px'> </td>";        
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td colspan='2'><h4>Degrés Minutes Secondes</h4></td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td><u>Latitude</u></td>";
        html +=     "<td><u>Longitude</u></td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td>"+latDMS+"</td>";
        html +=     "<td>"+lonDMS+"</td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td style='padding-bottom:5px'> </td>";        
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td colspan='2'><h4>GPS</h4></td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td><u>Latitude</u></td>";
        html +=     "<td><u>Longitude</u></td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td>"+latGPS+"</td>";
        html +=     "<td>"+lonGPS+"</td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td style='padding-bottom:5px'> </td>";        
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td colspan='2'><h4>UTM (Zone "+zoneUTM+")</h4></td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td><u>X</u></td>";
        html +=     "<td><u>Y</u></td>";
        html +=   "</tr>";
        html +=   "<tr>";
        html +=     "<td>"+xUTM+"</td>";
        html +=     "<td>"+yUTM+"</td>";
        html +=   "</tr>";
        html += "</table>";
        var $convertirRechercheGPS = $("#convertirRechercheGPS");
        $convertirRechercheGPS.parent().parent().prepend(html);
        $convertirRechercheGPS.remove();
        //this.definirResultat(html+this.resultatPanneau.items.items[0].body.dom.innerHTML);
    };
        
    return RechercheGPS;
    
});