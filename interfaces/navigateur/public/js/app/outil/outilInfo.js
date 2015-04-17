/** 
 * Module pour l'objet {@link Outil.OutilInfo}.
 * @module outilInfo
 * @requires outil 
 * @requires aide 
 * @author Thyn Bos (LGS-SYGIF)
 * @based on Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['outil', 'aide', 'browserDetect'], function(Outil, Aide, BrowserDetect) {
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
    };

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

        this.couchesInterroger = [];
        this.features = [];
        this.requetes = 0;
        this.erreurs = 0;
    };

    OutilInfo.prototype.eteindre = function () {
        this.desactiverEvent();
        this.carte.controles.desactiverClique();
        this.reinitialiser();
    };

    OutilInfo.prototype.reinitialiser = function () {
        this.couchesInterroger = [];
        this.features = [];
        this.requetes = 0;
        this.erreurs = 0;
    };

    OutilInfo.prototype.cliqueCarte = function (e) {
        Aide.afficherMessageChargement({message: "Chargement de votre requête, patientez un moment..."});

        var lonlat = e.point._obtenirLonLatOL();
        var px = this.carte._carteOL.getViewPortPxFromLonLat(lonlat);

        this.couchesInterroger = this.obtCouchesInterrogable();

        if (this.couchesInterroger.length == 0) {
            // TODO : this is HARDCODED
            var szErrMsg = "Veuillez sélectionner au moins une couche avant d'effectuer une requête.";
            Aide.afficherMessage("Erreur", szErrMsg, "OK", "ERROR");
            return;
        }

        for (var j = 0; j < this.couchesInterroger.length; j++) {
            var oLayerToQuery = this.couchesInterroger[j];
            var nomCoucheLegende = oLayerToQuery.titre;
            var coucheInfoFormat;
            var coucheDataType;
            var encodage;

            //Vous devez ajouter l'attribut infoFormat dans la balise XML 
            //de couche pour cet outil dans votre XML de context
            //pour le moment c'est le gml si pas défini.
            if (oLayerToQuery.infoFormat === undefined) {
                oLayerToQuery.infoFormat = "gml";
            }

            switch (oLayerToQuery.infoFormat)
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
                    coucheDataType = "xml";
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
            if (BrowserDetect.browser == "Explorer") {               
                encodage = oLayerToQuery.infoEncodage ;
            }
                
            $.ajax({
                url: Aide.utiliserProxy(decodeURIComponent(oLayerToQuery.url)),
                data:  {
                    LAYERS: oLayerToQuery.nom,
                    SERVICE: 'WMS',
                    REQUEST: "GetFeatureInfo",
                    EXCEPTIONS: "application/vnd.ogc.se_xml",
                    VERSION: oLayerToQuery.version,
                    SRS: this.carte._carteOL.getProjection(),
                    BBOX: this.carte._carteOL.getExtent().toBBOX(),
                    QUERY_LAYERS: oLayerToQuery.nom,
                    X: Math.floor(px.x),
                    Y: Math.floor(px.y),
                    INFO_FORMAT: coucheInfoFormat,
                    FEATURE_COUNT: 100,
                    WIDTH: this.carte._carteOL.size.w,
                    HEIGHT: this.carte._carteOL.size.h,
                    _encodage: encodage
                },
                context: this, 
                dataType: coucheDataType,
                beforeSend: function (jqXHR) {
                    if (oLayerToQuery.infoEncodage !== undefined) {
                        if (jqXHR.overrideMimeType) {
                            jqXHR.overrideMimeType(coucheInfoFormat + "; charset=" + oLayerToQuery.infoEncodage); 
                        }
                    }
                },
                success: this.traiterRetourInfo(nomCoucheLegende, coucheDataType),
                error: this.gestionRetourErreur()
            });
        }
    };

    OutilInfo.prototype.obtCouchesInterrogable = function () {

        var couchesInterrogable = [];
        var couches = this.carte.gestionCouches.obtenirCouchesParType('WMS', true);

        for (var l = 0; l < couches.length; ++l) {
            var couche = couches[l];

            if (couche.estActive() &&
                    couche._layer.getVisibility() && couche._layer.calculateInRange() &&
                    (!couche.estFond() || couche._layer.inRange)) {
                couchesInterrogable.push({
                    'layer': couche,
                    'infoFormat': couche.options.infoFormat,
                    'infoEncodage': couche.options.infoEncodage,
                    'url': couche.options.url || couche._layer.url,
                    'nom': couche.options.nom || couche._layer.params.LAYERS,
                    'titre': couche.options.titre || couche._layer.name,
                    'version': couche.options.version || couche._layer.params.VERSION
                });
            }
        }
        return couchesInterrogable;
    };


    OutilInfo.prototype.traiterRetourInfo = function (nomCoucheLegende, coucheDataType) {
        
        return function gestionRetour(data, textStatus, jqXhr) {
            if (coucheDataType == "html") {
                if (this.gestionRetourHtml(data)){   //Si html est vide ne pas ajouter onglet
                    this.features = this.features.concat([nomCoucheLegende, data]);//nomCouche et son retour ajax html
                }
                this.couchesInterroger.splice(-1, 1)
            }
            if (coucheDataType == "xml") {
                var oFormat = new OpenLayers.Format.WMSGetFeatureInfo();
                var oFeatures = oFormat.read_msGMLOutput(data);
                if (this.gestionRetourXml(oFeatures)){
                    this.features = this.features.concat([nomCoucheLegende, oFeatures]);// nomCouche et son retour ajax xml
                }
                this.couchesInterroger.splice(-1, 1);
            }

            if (this.couchesInterroger.length == 0) {
                this.afficherResultats();
            }
        };
    };



    OutilInfo.prototype.gestionRetourXml = function (data) {

        var htmlCheck = false;

        //Erreur Serveur WMS
        if (data.toString().toLowerCase().indexOf('wms server error') > -1){
            htmlCheck = false;
        }
        if (data == ""){
            htmlCheck = false;
        }
        if (data.length != 0){
            htmlCheck = true;
        }
        return htmlCheck;
    };


    OutilInfo.prototype.gestionRetourHtml = function (data) {

        var htmlCheck = false;

        var strip = data.replace(/<(?:.|\n)*?>/gm, '');
        var tbl = $('<div/>').html(data).find('table');

        //GeoServer 
        if (tbl.length == 0 && strip.toLowerCase().indexOf('geoserver getfeatureinfo output') > -1){
            strip = "";
        }
        //ESRI
        if (tbl.length == 0 && data.toLowerCase().indexOf('esri_wms') > -1){
            strip = "";
        }
        //Erreur Serveur WMS
        if (strip.toLowerCase().indexOf('wms server error') > -1){
            strip = "";
        }

        if (tbl.length != 0){
            htmlCheck = true;
        }
        if (strip.length != 0){
            htmlCheck = true;
        }
        if (data == ""){
            htmlCheck = false;
        }

        return htmlCheck;
    };


    OutilInfo.prototype.gestionRetourErreur = function (nomCoucheLegende) {
        return function gestionRetour(data, textStatus, jqXhr) {
            this.erreurs++;
            var responseBody = jqXhr.responseText;
            //alert("ERROR: " + textStatus + " : " + textStatus + " : " + contentType + " : " + responseBody);
            Aide.afficherMessage(textStatus, responseBody, "OK", "ERROR");
        };
    };
    
    OutilInfo.prototype.afficherResultats = function () {

        if (this.features.length == 0) {
            Aide.cacherMessageChargement();
            // TODO : this is HARDCODED
            var szErrMsg = "Aucun enregistrement n'a été trouvé.";
            var szErrTitle = "Aucun enregistrement trouvé";
            var szIcon = "INFO";

            if (this.erreurs == 1) {
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

        //Iteration par 2 array contiens nomCouche et son retour ajax
        for (var i = 0; i < this.features.length; i += 2)
        {
            var nonCouche = this.features[i];
            var oFeature = this.features[i + 1];

            if (oFeature.length > 0) {
                //Gestion du retour type Gml et Xml
                if ($.isArray(oFeature)) {

                    var oFeaturesXml = oFeature;

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

                        for (var szAttribute in oFeatureXml.attributes)
                        {
                            var newRecord = new RecordTemplate({/*Couche: szType, */Item: aNbItem[szType], Attribut: szAttribute, Valeur: oFeatureXml.attributes[szAttribute]});
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
                } else {
                    //Ajout du retour getFeatureInfo html
                    tabs.add({title: nonCouche,
                        html: oFeature
                    });
                }
            }
        }

        oResultWindow.add(tabs);
        Aide.cacherMessageChargement();
 
        oResultWindow.show();
        this.reinitialiser();

    };

    return OutilInfo;

});