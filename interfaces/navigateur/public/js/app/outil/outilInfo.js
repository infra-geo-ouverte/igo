/** 
 * Module pour l'objet {@link Outil.OutilInfo}.
 * @module outilInfo
 * @requires outil 
 * @requires aide 
 * @author Thyn Bos (LGS-SYGIF)
 * @based on Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['outil', 'aide', 'browserDetect', 'point'], function (Outil, Aide, BrowserDetect, Point) {

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
        this.carte.ajouterDeclencheur('desactiverClique', this.releverBouton, {scope: this});
        this.carte.ajouterDeclencheur("clique", this.cliqueCarte, {scope: this});
    };

    OutilInfo.prototype.desactiverEvent = function () {
        this.carte.enleverDeclencheur('desactiverClique', this.releverBouton);
        this.carte.enleverDeclencheur("clique", this.cliqueCarte);
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
        this.activerToggleItem();

        this.couchesInterroger = [];
        this.features = [];
        this.featuresHbars = [];
        this.requetes = 0;
        this.erreurs = 0;
        this.px;
    };

    OutilInfo.prototype.eteindre = function () {
        this.desactiverEvent();
        this.carte.controles.desactiverClique();
        this.desactiverToggleItem();
        this.reinitialiser();
    };

    OutilInfo.prototype.reinitialiser = function () {
        this.couchesInterroger = [];
        this.features = [];
        this.featuresHbars = [];
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
            var szErrMsg = "Veuillez sélectionner au moins une couche avant d'effectuer une requête.";
            Aide.afficherMessage("Outil Information", szErrMsg, "OK", "Info");
            return;
        }

        //Appller la fonction pour obtenir les gabarit Handlebars pour les couche qui en ont
        this.obtCouchesHbars(this.couchesInterroger);
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
                    'infoDeclencheur': couche.options.infoDeclencheur,
                    'infoUrl': couche.options.infoUrl,
                    'infoGabarit': couche.options.infoGabarit,
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


    OutilInfo.prototype.obtCouchesHbars = function (couches) {
        var that = this;

        //On va chercher tous les templates nécessaires pour faire un seul require
        var doitRequire = [];
        for (var d = 0; d < couches.length; ++d) {
            var couche = couches[d];
            if (couche.infoGabarit !== undefined && couche.infoGabarit.substring(couche.infoGabarit.lastIndexOf(".")) !== ".xsl") {
                doitRequire.push('hbars!' + couche.infoGabarit);
            }
        }

        var i = 0;

        require(doitRequire, function () {
            for (var c = 0; c < couches.length; ++c) {
                var couche = couches[c];
                //On obtient toutes les couches avec un gabarit 
                if (couche.infoGabarit !== undefined) {
                    couche._template = arguments[i];
                    i++;
                };
            }

            //Appller la fonction pour obtenir les declencheures pour les couche qui en ont
            that.obtCouchesDeclencheur(couches);
        });
    };

    OutilInfo.prototype.obtCouchesDeclencheur = function (couches) {
        var that = this;

        //On va chercher tous les declencheur nécessaires pour faire un seul require
        var doitRequire = [];
        for (var d = 0; d < couches.length; ++d) {
            var couche = couches[d];
            if (couche.infoDeclencheur !== undefined) {
                doitRequire.push(couche.infoDeclencheur + '.js');
            }
        }

        var i = 0;

        require(doitRequire, function () {
            for (var c = 0; c < couches.length; ++c) {
                var couche = couches[c];
                //On obtient toutes les couches avec un gabarit 
                if (couche.infoDeclencheur !== undefined) {
                    couche._declencheur = arguments[i];
                    i++;
                };
            }

            //Appeler la fonction pour le traitement ajax
            that.appelerGetInfo(couches);

        });
    };

    OutilInfo.prototype.appelerGetInfo = function (couchesInterroger) {
        var that = this;
        var jqXHRs = [];

        for (var j = 0; j < couchesInterroger.length; j++) {
            var oCoucheObtnInfo = couchesInterroger[j];
            var nomCoucheLegende = oCoucheObtnInfo.titre;
            var Template = oCoucheObtnInfo._template;
            var Declencheur = oCoucheObtnInfo._declencheur;

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
                    coucheDataType = "xml";
                    break;
                default:
                    coucheInfoFormat = "application/vnd.ogc.gml";
                    coucheDataType = "xml";
                    break;
            }

            //Exceptionellement IE on doit passer par le proxy pour encodage
            if (BrowserDetect.browser === "Explorer") {
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

                //Formatter l'url
                var infoUrlFormat = this.formatUrl(oCoucheObtnInfo.infoUrl, [prmt[0].name, prmt[0].projection, prmt[0].x, prmt[0].y]);

                jqXHRs.push($.ajax({
                    url: Aide.utiliserProxy(decodeURIComponent(infoUrlFormat)),
                    context: this,
                    dataType: coucheDataType,
                    success: this.traiterRetourInfo(nomCoucheLegende, coucheInfoFormat, coucheDataType, Template),
                    error: this.gestionRetourErreur(nomCoucheLegende)
                }));

            } else {
                //Appliquer Url WMS GetFeatureInfo
                jqXHRs.push($.ajax({
                    url: Aide.utiliserProxy(decodeURIComponent(oCoucheObtnInfo.url)),
                    data: {
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
                        _encodage: encodage,
                        xsl_template: xslTemplate
                    },
                    context: this,
                    dataType: coucheDataType,
                    beforeSend: function (jqXHR) {
                        if (oCoucheObtnInfo.infoEncodage !== undefined) {
                            if (jqXHR.overrideMimeType) {
                                jqXHR.overrideMimeType(coucheInfoFormat + "; charset=" + oCoucheObtnInfo.infoEncodage);
                            }
                        }
                    },
                    success: this.traiterRetourInfo(nomCoucheLegende, coucheInfoFormat, coucheDataType, Declencheur, Template),
                    error: this.gestionRetourErreur(nomCoucheLegende)
                }));
            }
        }


        $(function () {
            Aide.afficherMessageChargement({message: "Chargement de votre requête, patientez un moment..."});
            $.when.apply(null, jqXHRs).done(function () {
                that.afficherResultats();
                Aide.cacherMessageChargement();
            }).fail(function (jqXHRs, textStatus, errorThrown) {
                Aide.afficherMessageConsole('Erreur Critique: ' + textStatus + " : " + jqXHRs.url + " : " + errorThrown);
                Aide.cacherMessageChargement();
            });
        });
    };



    OutilInfo.prototype.traiterRetourInfo = function (nomCoucheLegende, coucheInfoFormat, coucheDataType, coucheDeclencheur, nomGabarit) {

        // On traduit le format de sortie en GeoJson peu import l'appel xml,gml ou gml311
        var oGeoJSON = new OpenLayers.Format.GeoJSON();

        return function gestionRetour(data, textStatus, jqXHR) {

            // nomCouche et son retour ajax html
            if (coucheInfoFormat === "text/html") {
                //Si html est vide ne pas ajouter onglet
                if (this.gestionRetourHtml(data)) {
                    this.features = this.features.concat([nomCoucheLegende, data, coucheDataType]);
                }
            }

            // nomCouche et son retour ajax xml et applique Hbars si defini
            if (coucheDataType === "xml" && coucheInfoFormat === "application/vnd.ogc.wms_xml") {
                var oFormat = new OpenLayers.Format.WMSGetFeatureInfo();
                var oFeatures = oFormat.read_FeatureInfoResponse(data);

                if (nomGabarit !== undefined) {
                    if (this.gestionRetourXml(oFeatures)) {
                        this.featuresHbars = this.featuresHbars.concat([nomCoucheLegende, oGeoJSON.write(oFeatures), nomGabarit]);
                    }
                } else {
                    if (this.gestionRetourXml(oFeatures)) {
                        this.features = this.features.concat([nomCoucheLegende, oGeoJSON.write(oFeatures), coucheDeclencheur]);
                    }
                }
            }
            // nomCouche et son retour ajax text et applique Hbars si defini
            if (coucheDataType === "xml" && coucheInfoFormat === "application/vnd.ogc.gml") {

                var oFeatures = this.lireGetInfoGml(data);

                if (nomGabarit !== undefined) {
                    if (this.gestionRetourXml(oFeatures)) {
                        this.featuresHbars = this.featuresHbars.concat([nomCoucheLegende, oGeoJSON.write(oFeatures), nomGabarit]);
                    }
                } else {
                    if (this.gestionRetourXml(oFeatures)) {
                        this.features = this.features.concat([nomCoucheLegende, oGeoJSON.write(oFeatures), coucheDeclencheur]);
                    }
                }
            }

            // nomCouche et son retour ajax text et applique Hbars si defini
            if (coucheInfoFormat === "application/vnd.ogc.gml/3.1.1") {

                var oFeatures = this.lireGetInfoGml3(data);

                if (nomGabarit !== undefined) {
                    if (this.gestionRetourXml(oFeatures)) {
                        this.featuresHbars = this.featuresHbars.concat([nomCoucheLegende, oGeoJSON.write(oFeatures), nomGabarit]);
                    }
                } else {
                    if (this.gestionRetourXml(oFeatures)) {
                        this.features = this.features.concat([nomCoucheLegende, oGeoJSON.write(oFeatures), coucheDeclencheur]);
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

        var that = this;
        var tabExist = false;

        if (this.features.length === 0 && this.featuresHbars.length === 0) {
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

        var tabs = new Ext.TabPanel({
            activeTab: 0
                    //,autoHeight: true
            , defaults: {autoScroll: true}
            , enableTabScroll: true
            , height: 490
        });

        var oResultWindow = new Ext.Window({
            title: 'Résultats de la requête',
            id: 'divGetInfo',
            width: 600,
            height: 600,
            border: false,
            modal: true,
            plain: true,
            closable: true,
            resizable: true,
            autoScroll: true,
            constrain: true,
            layout: 'fit',
            items: [tabs]
        });

        //Iteration par 3 : array contient nomCouche, le retour ajax en json et un declencheur s il y en as
        for (var i = 0; i < this.features.length; i += 3)
        {
            var nonCouche = this.features[i];
            var oFeature = this.features[i + 1];
            var monDeclencheur = this.features[i + 2];

            if (String(oFeature).length > 0 && monDeclencheur === undefined && monDeclencheur !== "html") {

                try {

                    oFeature = $.parseJSON(oFeature);

                    //Gestion du retour type Gml et Xml            
                    if ($.isArray(oFeature.features)) {

                        var oFeaturesXml = oFeature.features;

                        var aoStores = {}, aoColumns = {}, nStores = 0, aNbItem = [];
                        for (var j = 0; j < oFeaturesXml.length; j++)
                        {
                            var oFeatureXml = oFeaturesXml[j];
                            var szType = oFeatureXml.type;
                            var aColumns = [];

                            if (!aoStores[szType])
                            {

                                aoStores[szType] = new Ext.data.GroupingStore(
                                        {
                                            fields: [/*'Couche',*/ 'Item', 'Attribut', 'Valeur'],
                                            sortInfo: {field: 'Item', direction: 'DESC'},
                                            groupOnSort: true,
                                            remoteGroup: false,
                                            groupField: 'Item'
                                        }
                                );

                                aNbItem[szType] = 0;
                                aColumns.push({header: 'Item', sortable: true, dataIndex: 'Item', width: 50});
                                aColumns.push({header: 'Attribut', sortable: false, dataIndex: 'Attribut', width: 150});
                                aColumns.push(
                                        {id: 'Valeur', header: 'Valeur', sortable: false, dataIndex: 'Valeur',
                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                metaData.css = 'multilineColumn';
                                                return value;
                                            }
                                        });

                                aoColumns[szType] = aColumns;
                                nStores++;
                            }
                        }


                        var RecordTemplate = Ext.data.Record.create([/*{name:'Couche'}, */{name: 'Item'}, {name: 'Attribut'}, {name: 'Valeur'}]);
                        for (var k = 0; k < oFeaturesXml.length; k++)
                        {
                            var oFeatureXml = oFeaturesXml[k];
                            var szType = oFeatureXml.type;
                            aNbItem[szType]++;//numéro unique Couche-feature

                            for (var szAttribute in oFeatureXml.properties)
                            {
                                var newRecord = new RecordTemplate({/*Couche: szType, */Item: aNbItem[szType], Attribut: szAttribute, Valeur: oFeatureXml.properties[szAttribute]});
                                aoStores[szType].add(newRecord);
                            }
                        }

                        var nGridHeight;
                        if (nStores > 2) {
                            nGridHeight = 200;
                        } else {
                            nGridHeight = 570 / nStores;
                        }


                        var aoGrids = {};
                        for (var szType in aoStores)
                        {
                            var gridTitle = '';
                            if (aNbItem[szType] == 1)
                                gridTitle = nonCouche + ' (' + aNbItem[szType] + ' item)';
                            else
                                gridTitle = nonCouche + ' (' + aNbItem[szType] + ' items)';

                            aoGrids[szType] = new Ext.grid.GridPanel({
                                store: aoStores[szType],
                                columns: aoColumns[szType],
                                title: gridTitle,
                                stripeRows: true,
                                autoExpandColumn: 'Valeur',
                                height: 500,
                                disableSelection: true,
                                trackMouseOver: false,
                                enableHdMenu: false,
                                view: new Ext.grid.GroupingView(
                                        {
                                            scrollOffset: 30,
                                            hideGroupedColumn: true,
                                            startCollapsed: false,
                                            getRowClass: function (record, index, rowParams)
                                            {
                                                if (record.get('Item') % 2.0 == 0.0)
                                                    return 'background-bleupale-row';
                                                else
                                                    return 'background-white-row';
                                            }
                                        })
                            });
                        }
                        //Ajout du retour getFeatureInfo  Gml,Xml
                        for (var szType in aoStores)
                        {
                            tabs.add(aoGrids[szType]);
                        }
                    }
                }
                catch (e) {
                    Aide.afficherMessageConsole('Erreur: GetFeatureInfo: <br> Solution possible ajouté le paramètre infoEncodage pour la couche \'' + nonCouche + '<br>' + oFeature + '\' a échoué. <br>' + e);
                }
                
            } else {

                if (monDeclencheur === 'html')
                {
                    //Ajout du retour getFeatureInfo html
                    tabExist = true;
                    tabs.add({title: nonCouche,
                        html: oFeature
                    });
                }

                if (monDeclencheur !== undefined && monDeclencheur !== 'html') {

                    try {
                        //Le declencheur recoit toujours un json en parapètre
                        monDeclencheur(oFeature);
                    }
                    catch (e) {
                        Aide.afficherMessageConsole('Erreur: GetFeatureInfo: <br>Le Declencheur pour \'' + nonCouche + '<br>' + oFeature + '\' a échoué. <br>' + e);
                    }

                }

            }
        }


        if (tabs.items.length > 0) {
            tabExist = true;
            oResultWindow.add(tabs);
        }

        //Si nous avons des gabarit Handlebars on appel la fonction
        if (this.featuresHbars.length > 0) {

            var hbarTabs = this.afficherResultatsGabaritHbars(tabs);
            tabExist = true;
            oResultWindow.add(hbarTabs);
            hbarTabs.setActiveTab(0);
        }

        //Afficher le résultat seulemnt si nous avons des résultats
        if (tabExist) {
            oResultWindow.show();
        }

        //Fin du clique on reinitialise
        that.reinitialiser();

    };


    OutilInfo.prototype.afficherResultatsGabaritHbars = function (content) {
        var that = this;

        //Iteration par 3 array contiens nomCouche, son gabarit et son retour ajax
        for (var i = 0; i < that.featuresHbars.length; i += 3)
        {
            var nonCouche = that.featuresHbars[i];
            var oFeature = $.parseJSON(that.featuresHbars[i + 1]);
            var nomGabarit = that.featuresHbars[i + 2];
            var result = nomGabarit(oFeature);

            content.add({title: nonCouche,
                html: result
            });

        }

        return content;

    };


    /** 
     * Activer le toggle l'item du GetInfo
     * @method 
     * @name OutilInfo#activerToggleItem
     */
    OutilInfo.prototype.activerToggleItem = function () {
        $(document).on('click', '.toggleItem', function (ev) {
            var that = $(this);
            ev.stopPropagation();
            ev.preventDefault();
            $(that).next().toggle('fast', function () {
                if ($(that).parent().hasClass('x-grid-group-collapsed')) {
                    $(that).parent().removeClass('x-grid-group-collapsed');
                } else {
                    $(that).parent().addClass('x-grid-group-collapsed');
                }
            });
        });
    };
    /** 
     * Desactiver le toggle l'item du GetInfo
     * @method 
     * @name OutilInfo#desactiverToggleItem
     */
    OutilInfo.prototype.desactiverToggleItem = function () {
        $(document).off('click', '.toggleItem');
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