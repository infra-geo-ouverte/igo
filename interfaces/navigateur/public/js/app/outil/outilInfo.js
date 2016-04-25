/** 
 * Module pour l'objet {@link Outil.OutilInfo}.
 * @module outilInfo
 * @requires outil 
 * @requires aide 
 * @author Thyn Bos (LGS-SYGIF)
 * @based on Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['outil', 'aide', 'browserDetect', 'fonctions', 'point'], function (Outil, Aide, BrowserDetect, Fonctions, Point) {

    /** 
     * Création de l'object Outil.OutilInfo.
     * Pour la liste complète des paramètres, voir {@link Outil}
     * @constructor
     * @name Outil.OutilInfo
     * @class Outil.OutilInfo
     * @alias outilInfo:Outil.OutilInfo
     * @extends Outil
     * @requires outilInfo
     * @returns {Outil.OutilInfo} Instance de {@link Outil.OutilInfo}
     */
    function OutilInfo(options) {
        this.options = options || {};

        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: 'getinfo',
            id: 'getinfo_msp',
            groupe: 'carte',
            infobulle: 'Information : sélectionner une couche additionnelle dans ' +
                    'l\'arborescence des couches puis cliquer à l\'endroit voulu sur la carte'
        });
    }
    ;

    OutilInfo.prototype = new Outil();
    OutilInfo.prototype.constructor = OutilInfo;

    OutilInfo.prototype._init = function () {
        Outil.prototype._init.call(this);

    };

    OutilInfo.prototype.activerEvent = function () {
        this.carte.ajouterDeclencheur('desactiverClique', this.relever, {scope: this});
        this.carte.ajouterDeclencheur("clique", this.cliqueCarte, {scope: this});
        
        //Désactiver la sélection sur les couches vecteur afin de permettre en tout temps le getInfo à travers une géométrie
        var couches = this.carte.gestionCouches.obtenirCouchesParType("Vecteur");
        
        $.each(couches, function(index, couche) {
            if(couche.options.selectionnable)
            {
                couche.controles.desactiverSelection();
            }
        });
        
    };

    OutilInfo.prototype.desactiverEvent = function () {
        this.carte.enleverDeclencheur('desactiverClique', this.relever);
        this.carte.enleverDeclencheur("clique", this.cliqueCarte);
        
        //Réactiver la sélection sur les couches vecteur
        var couches = this.carte.gestionCouches.obtenirCouchesParType("Vecteur");
        
        $.each(couches, function(index, couche) {
            if(couche.options.selectionnable)
            {
                couche.controles.activerSelection();
            }
        });
        
    };

    /** 
     * Action de l'outil.
     * 
     * @method
     * @name Outil.OutilInfo#executer
     */
    OutilInfo.prototype.executer = function () {
        this.activerEvent();
        this.carte.controles.activerClique();

        this.couchesInterroger = [];
        this.afficherProprietes = [];
        this.executerAction = [];
        this.requetes = 0;
        this.erreurs = 0;
        this.px;
    };

    OutilInfo.prototype.eteindre = function () {
        this.desactiverEvent();
        this.carte.controles.desactiverClique();
        this.reinitialiser();
    };

    OutilInfo.prototype.reinitialiser = function () {
        this.couchesInterroger = [];
        this.afficherProprietes = [];
        this.executerAction = [];
        this.requetes = 0;
        this.erreurs = 0;
        this.px;
    };

    OutilInfo.prototype.cliqueCarte = function (e) {

        var lonlat = e.point._obtenirLonLatOL();
        this.px = this.carte._carteOL.getViewPortPxFromLonLat(lonlat);

        //Appeller la fonction pour obtenir les couche interrogable
        this.couchesInterroger = this.obtCouchesInterrogable();

        if (this.couchesInterroger.length === 0) {
            // TODO : this is HARDCODED
            var occurencesSurvolees = this.carte.gestionCouches.obtenirListeOccurencesSurvols().slice();
            if(occurencesSurvolees.length){
                Fonctions.afficherProprietes(occurencesSurvolees);
            } else {
                var szErrMsg = "Veuillez sélectionner au moins une couche avant d'effectuer une requête.";
                Aide.afficherMessage("Outil Information", szErrMsg, "OK", "Info");
            }
            return;
        }

       //Appller la fonction pour obtenir les gabarit Handlebars pour les couche qui en ont
       //this.obtCouchesHbars(this.couchesInterroger);
       this.appelerGetInfo(this.couchesInterroger);
    };

    OutilInfo.prototype.obtCouchesInterrogable = function () {
        var that = this;
        var couchesInterrogable = [];
        var couches = that.carte.gestionCouches.obtenirCouchesParType('WMS', true);

        for (var l = 0; l < couches.length; ++l) {
            var couche = couches[l];

            couche.options.estInterrogable = couche._layer.queryable;

            //Seule les couche activ qui sont pas des fond de carte
            //qui sont queryable, visible et inrange
            if (couche.estActive() && !couche.estFond() &&
                    couche._layer.getVisibility() && couche._layer.calculateInRange() &&
                    couche._layer.queryable && couche._layer.inRange) {

                couchesInterrogable.push({
                    'layer': couche,
                    'id': couche.id,
                    'infoFormat': couche.options.infoFormat,
                    'infoEncodage': couche.options.infoEncodage,
                    'infoAction': couche.options.infoAction,
                    'infoUrl': couche.options.infoUrl,
                    'infoGabarit': couche.options.infoGabarit,
                    'extraParams': couche.options.extraParams,
                    'estInterrogable': couche.options.estInterrogable,
                    'url': couche.options.url,
                    'nom': couche.options.nom,
                    'titre': couche.options.titre,
                    'version': couche.options.version
                });
            }
        }

        //On fait trier pour faire les appels ajax dans un ordre logique gml,xml et html ensuite Hbars
        couchesInterrogable.sort(function (a) {
            return (a.infoFormat === "html" ? 1 :
                    a.infoFormat === "gml" ? -1 :
                    a.infoFormat === "gml311" ? -1 :
                    a.infoFormat === "xml" ? -1 : 0);
        });

        return couchesInterrogable;
    };

 OutilInfo.prototype.formatUrl = function (url, args) {

        var s = url,
                i = args.length + 1;
        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), args[i]);
        }
        //Caractère de remplacement pour QS '&' pas permis dans xml de context
        s = s.replace(/\$/g, '&');
        return s;
    };


    OutilInfo.prototype.appelerGetInfo = function (couchesInterroger) {
        var that = this;
        var jqXHRs = [];

        for (var j = 0; j < couchesInterroger.length; j++) {
            var oCoucheObtnInfo = couchesInterroger[j];
            var nomCoucheLegende = oCoucheObtnInfo.titre;

            var Template = oCoucheObtnInfo.infoGabarit;
            var Declencheur = oCoucheObtnInfo.infoAction;

            var coucheInfoFormat;

            var coucheDataType;
            var encodage;
            var xslTemplate;

            switch (oCoucheObtnInfo.infoFormat)
            {
                case "html":
                    coucheInfoFormat = "text/html";
                    coucheDataType = "html";
                    break;
                case "gml":
                    coucheInfoFormat = "application/vnd.ogc.gml";
                    coucheDataType = "xml";
                    break;
                case "gml311":
                    coucheInfoFormat = "application/vnd.ogc.gml/3.1.1";
                    coucheDataType = "text";
                    break;
                case "xml":
                    coucheInfoFormat = "application/vnd.ogc.wms_xml";
                    coucheDataType = "text";
                    break;
                default:
                    coucheInfoFormat = "application/vnd.ogc.gml";
                    coucheDataType = "xml";
                    break;
            }

            //Exceptionellement IE on doit passer par le proxy pour encodage
            if (oCoucheObtnInfo.layer.options.encodage) {
                encodage = oCoucheObtnInfo.layer.options.encodage;
            } else if (BrowserDetect.browser === "Explorer") {
                encodage = (oCoucheObtnInfo.infoEncodage === undefined) ? 'UTF-8' : oCoucheObtnInfo.infoEncodage;
            }

            //Appliquer un xsl ESRI
            if (oCoucheObtnInfo.infoGabarit !== undefined && oCoucheObtnInfo.infoGabarit.substring(oCoucheObtnInfo.infoGabarit.lastIndexOf(".")) === ".xsl") {
                xslTemplate = oCoucheObtnInfo.infoGabarit;
            }

            //Appliquer infoUrl au lieu de celui du WMS GetFeatureInfo
            if (oCoucheObtnInfo.infoUrl !== undefined) {

                var prmt = [];
                var lonlat = this.carte._carteOL.getLonLatFromPixel(this.px);
                var point = new Point(lonlat.lon, lonlat.lat);

                prmt.push({
                    'name': oCoucheObtnInfo.nom,
                    'projection': this.carte._carteOL.getProjection(),
                    'x': Math.floor(point.x),
                    'y': Math.floor(point.y)
                });

                var infoUrlFormat = this.formatUrl(oCoucheObtnInfo.infoUrl, [prmt[0].name, prmt[0].projection, prmt[0].x, prmt[0].y]);

                if (oCoucheObtnInfo.infoAction !== undefined) {
                    this.executerAction = this.executerAction.concat({
                        scope: oCoucheObtnInfo,
                        action: Declencheur,
                        params: infoUrlFormat
                    });
                    
                } else {

                    jqXHRs.push($.ajax({
                        url: Aide.utiliserProxy(decodeURIComponent(infoUrlFormat)),
                        context: this,
                        dataType: coucheDataType,
                        success: this.traiterRetourInfo(nomCoucheLegende, coucheInfoFormat, coucheDataType, Template, oCoucheObtnInfo.id),
                        error: this.gestionRetourErreur(nomCoucheLegende)
                    }));

                }
                
            } else {
                //Appliquer Time extent WMS GetFeatureInfo 
                var timeExtent;
                if(oCoucheObtnInfo.layer._layer && oCoucheObtnInfo.layer._layer.params){
                    timeExtent = oCoucheObtnInfo.layer._layer.params.TIME;
                }
                //Trouver filter WMS GetFeatureInfo
                var filterParams = {};
                if(oCoucheObtnInfo.layer._layer && oCoucheObtnInfo.layer._layer.params){
                     $.each(oCoucheObtnInfo.layer._layer.params, function (name, value)
                        {
                            if (name !== 'LAYERS' && name !== 'TRANSPARENT' && name !== 'FORMAT' && name !== 'SRS' && name !== 'SERVICE' &&
                                    name !== 'VERSION' && name !== 'STYLES' && name !== 'REQUEST') {
                            filterParams =  $.extend({}, filterParams, filterParams[name] = value );
                            }
                        });
                }
                
                //Appliquer Url WMS GetFeatureInfo 
                 var getInfoData = {
                            LAYERS: oCoucheObtnInfo.nom,
                            SERVICE: 'WMS',
                            REQUEST: "GetFeatureInfo",
                            EXCEPTIONS: "application/vnd.ogc.se_xml",
                            VERSION: oCoucheObtnInfo.version,
                            SRS: this.carte._carteOL.getProjection(),
                            BBOX: this.carte._carteOL.getExtent().toBBOX(),
                            QUERY_LAYERS: oCoucheObtnInfo.nom,
                            X: Math.floor(this.px.x),
                            Y: Math.floor(this.px.y),
                            INFO_FORMAT: coucheInfoFormat,
                            FEATURE_COUNT: 100,
                            WIDTH: this.carte._carteOL.size.w,
                            HEIGHT: this.carte._carteOL.size.h,
                            TIME: timeExtent,
                            _encodage: encodage,
                            xsl_template: xslTemplate
                        };
                
                  //Appliquer filtre en plus du WMS GetFeatureInfo
                  getInfoData =  $.extend({}, getInfoData, filterParams );
                
                jqXHRs.push($.ajax({
                    url: Aide.utiliserProxy(decodeURIComponent(oCoucheObtnInfo.url )),
                    data:getInfoData ,
                    context: this,
                    dataType: coucheDataType,
                    beforeSend: function (jqXHR) {
                        if (oCoucheObtnInfo.infoEncodage !== undefined) {
                            if (jqXHR.overrideMimeType) {
                                jqXHR.overrideMimeType(coucheInfoFormat + "; charset=" + oCoucheObtnInfo.infoEncodage);
                            }
                        }
                    },
                    success: this.traiterRetourInfo(nomCoucheLegende, coucheInfoFormat, coucheDataType, Declencheur, Template, oCoucheObtnInfo.id),
                    error: this.gestionRetourErreur(nomCoucheLegende)
                }));
            }
        }


        $(function () {
            Aide.afficherMessageChargement({message: "Chargement de votre requête, patientez un moment..."});
            $.when.apply(null, jqXHRs).done(function () {
                that.afficherResultats();
            }).fail(function (jqXHRs, textStatus, errorThrown) {
                Aide.afficherMessageConsole('Erreur: ' + textStatus + " : " + jqXHRs.responseText + " : " + errorThrown);
                Aide.cacherMessageChargement();
            });
        });
    };



    OutilInfo.prototype.traiterRetourInfo = function (nomCoucheLegende, coucheInfoFormat, coucheDataType, coucheAction, nomGabarit, idCouche) {

        // On traduit le format de sortie en GeoJson peu import l'appel xml,gml ou gml311
        var oGeoJSON = new OpenLayers.Format.GeoJSON();
        var couche = this.carte._carteOL.getLayer(idCouche);
      
        return function gestionRetour(data, textStatus, jqXHR) {

            // nomCouche et son retour ajax html
            if (coucheInfoFormat === "text/html") {
                //Si html est vide ne pas ajouter onglet
                if (this.gestionRetourHtml(data)) {
                    this.afficherProprietes = this.afficherProprietes.concat({
                            titre: nomCoucheLegende,
                            html: data
                        });
                    
                }
            }

            // nomCouche et son retour ajax xml et applique Hbars si defini
            if (coucheDataType === "text" && coucheInfoFormat === "application/vnd.ogc.wms_xml") {
                var oFormat = new OpenLayers.Format.WMSGetFeatureInfo();
                var oFeatures = oFormat.read(data);

                if (coucheAction === undefined) {
                    if (this.gestionRetourXml(oFeatures)) {
                      this.afficherProprietes = this.afficherProprietes.concat({
                            titre: nomCoucheLegende,
                            gabarit: nomGabarit,
                            occurences: oGeoJSON.write(oFeatures)
                        });
                    }
                } else {
                    if (this.gestionRetourXml(oFeatures)) {
                           this.executerAction = this.executerAction.concat({
                            scope: couche,
                            action: coucheAction,
                            params: oGeoJSON.write(oFeatures)
                        });
     
                    }
                }
            }
            // nomCouche et son retour ajax text et applique Hbars si defini
            if (coucheDataType === "xml" && coucheInfoFormat === "application/vnd.ogc.gml") {

                var oFeatures = this.lireGetInfoGml(data);

                if (coucheAction === undefined) {
                    if (this.gestionRetourXml(oFeatures)) {
                       this.afficherProprietes = this.afficherProprietes.concat({
                            titre: nomCoucheLegende,
                            gabarit: nomGabarit,
                            occurences: oGeoJSON.write(oFeatures)
                        });
                    }
                } else {
                    if (this.gestionRetourXml(oFeatures)) {
                          this.executerAction = this.executerAction.concat({
                            scope: couche,
                            action: coucheAction,
                            params:oGeoJSON.write(oFeatures)
                        });
                    }
                }
            }

            // nomCouche et son retour ajax text et applique Hbars si defini
            if (coucheInfoFormat === "application/vnd.ogc.gml/3.1.1") {

                var oFeatures = this.lireGetInfoGml3(data);

                if (coucheAction === undefined) {
                    if (this.gestionRetourXml(oFeatures)) {
                    this.afficherProprietes = this.afficherProprietes.concat({
                            titre: nomCoucheLegende,
                            gabarit: nomGabarit,
                            occurences: oGeoJSON.write(oFeatures)
                        });
                    }
                } else {
                    if (this.gestionRetourXml(oFeatures)) {
                          this.executerAction = this.executerAction.concat({
                            scope: couche,
                            action: coucheAction,
                            params:oGeoJSON.write(oFeatures)
                        });
                    }
                }

            }
        };
    };

    OutilInfo.prototype.lireGetInfoGml = function (gml) {

        //Cas GeoServer
        var gmlOptions = {
            featureType: "feature",
            featureName: "featureMember",
            featureNS: "http://www.opengis.net/gml"
        };
        var gmlOptionsIn = OpenLayers.Util.extend(
                OpenLayers.Util.extend({}, gmlOptions)
                );

        var format = new OpenLayers.Format.GML(gmlOptionsIn);

        var oFeatures = format.read(gml);
        //Cas MapServer
        if (oFeatures.length == 0) {
            var oFormat = new OpenLayers.Format.WMSGetFeatureInfo();
            var oFeatures = oFormat.read_msGMLOutput(gml);
        }
        return oFeatures;

    };

    OutilInfo.prototype.lireGetInfoGml3 = function (gml) {

        var gmlOptions = {
            featureType: "feature",
            featureName: "featureMembers",
            featureNS: "http://www.opengis.net/gml"
        };
        var gmlOptionsIn = OpenLayers.Util.extend(
                OpenLayers.Util.extend({}, gmlOptions)
                );

        var format = new OpenLayers.Format.GML(gmlOptionsIn);

        return  format.read(gml);

    };

    OutilInfo.prototype.gestionRetourXml = function (data) {

        var xmlCheck = false;

        //Erreur Serveur WMS
        if (data.toString().toLowerCase().indexOf('wms server error') > -1) {
            xmlCheck = false;
        }
        if (data === "") {
            xmlCheck = false;
        }
        if (data.length !== 0) {
            xmlCheck = true;
        }
        return xmlCheck;
    };

    OutilInfo.prototype.gestionRetourHtml = function (data) {

        var htmlCheck = false;

        var strip = data.replace(/<(?:.|\n)*?>/gm, '');
        var tbl = $('<div/>').html(data).find('table');

        //GeoServer 
        if (tbl.length === 0 && strip.toLowerCase().indexOf('geoserver getfeatureinfo output') > -1) {
            strip = "";
        }
        //ESRI
        if (tbl.length === 0 && data.toLowerCase().indexOf('esri_wms') > -1) {
            strip = "";
        }
        //Erreur Serveur WMS
        if (strip.toLowerCase().indexOf('wms server error') > -1) {
            strip = "";
        }

        if (tbl.length !== 0) {
            htmlCheck = true;
        }
        if (strip.length !== 0) {
            htmlCheck = true;
        }
        if (data === "") {
            htmlCheck = false;
        }

        return htmlCheck;
    };

    OutilInfo.prototype.gestionRetourErreur = function (nomCoucheLegende) {

        Aide.cacherMessageChargement();

        return function gestionRetour(data, textStatus, jqXhr) {
            this.erreurs++;
            var responseBody = data.responseText;
            var status = data.statusText + " (" + data.status + ")";
            if (data.status === 200) {
                status = "XML invalide";
                responseBody = "La donnée originale n'est pas valide pour cet outil.";
                Aide.afficherMessageConsole(textStatus + ": " + jqXhr.message);
            }
            //alert("ERROR: " + textStatus + " : " + textStatus + " : " + contentType + " : " + responseBody);
            Aide.afficherMessage(status, responseBody, "OK", "ERROR");
        };
    };

    OutilInfo.prototype.afficherResultats = function () {
        var occurencesSurvolees = this.carte.gestionCouches.obtenirListeOccurencesSurvols().slice();
        if(occurencesSurvolees.length){
            this.afficherProprietes.push(occurencesSurvolees);
        }
        
        if (this.afficherProprietes.length === 0 && this.executerAction.length === 0) {
            Aide.cacherMessageChargement();
            // TODO : this is HARDCODED
            var szErrMsg = "Aucun enregistrement n'a été trouvé.";
            var szErrTitle = "Aucun enregistrement trouvé";
            var szIcon = "INFO";

            if (this.erreurs === 1) {
                szErrMsg += "  De plus, " + this.erreurs +
                        " erreur est survenue.";
                szErrTitle += " et erreur";
                szIcon = "ERROR";
            } else if (this.erreurs > 1) {
                szErrMsg += "  De plus, " + this.erreurs +
                        " erreurs sont survenues.";
                szErrTitle += " et erreurs";
                szIcon = "ERROR";
            }
            Aide.afficherMessage(szErrTitle, szErrMsg, "OK", szIcon);

            this.reinitialiser();
            return;
        }
 
        if (this.afficherProprietes.length > 0) {
            Fonctions.afficherProprietes(this.afficherProprietes);
        }


        if (this.executerAction.length > 0) {

            $.each(this.executerAction, function (key, value) {
                Fonctions.executerAction({
                    scope: value.scope,
                    action: value.action,
                    params: value.params
                });

            });
        }

        Aide.cacherMessageChargement();

        //Fin du clique on reinitialise
        this.reinitialiser();

    };


    /** 
     * Cacher le GetInfo
     * @method 
     * @name OutilInfo#cacherGetInfo
     */
    OutilInfo.prototype.cacherGetInfo = function () {
        $('#divGetInfo').hide();
    };

    /** 
     * Cacher le GetInfo
     * @method 
     * @name OutilInfo#afficherGetInfo
     */
    OutilInfo.prototype.afficherGetInfo = function () {
        $('#divGetInfo').show();
    };

    return OutilInfo;

});
