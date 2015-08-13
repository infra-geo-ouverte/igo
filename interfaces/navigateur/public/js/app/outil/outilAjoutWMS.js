require.ajouterConfig({
    paths: {
        WMSBrowserBuild: 'libs/GeoExt.ux/WMSBrowser/WMSBrowser%-build%'
    },
    shim: {
        WMSBrowserBuild: {
            deps: ['libs/Ext.ux/statusbar/StatusBar', 'css!libs/Ext.ux/statusbar/css/statusbar']
        }
    }
});

/*
 * TODO L'ajout des couches n'est pas fait en mode IGO
 * 
 */
define(['outil', 'aide'], function(Outil, Aide) {

    function OutilAjoutWMS(options){
        this.options = options || {};
        if (!this.options.urlPreenregistre){this.options.urlPreenregistre = "";};
        this.defautOptions = $.extend({}, this.defautOptions, {
            id:'wmsbrowser',
            titre: 'Ajout de services Web',
            icone: Aide.utiliserBaseUri('images/toolbar/mActionAddLayer.png'),
            infobulle: 'Outil d\'ajout de couches à la carte'
        });
        
        this._extOptions = {
            scale: 'medium'
        };
        this.configPhp = Aide.obtenirConfig(this.obtenirTypeClasse());
    };
    

    OutilAjoutWMS.prototype = new Outil();
    OutilAjoutWMS.prototype.constructor = OutilAjoutWMS;

    OutilAjoutWMS.prototype.executer =  function () {
        var that = this;
        if(!this._MyWMSBrowser){
            this.chargerUrlPreenregistre();
        };
        require(['WMSBrowserBuild'], function() {
            that.openWindow();
        });
    };
    OutilAjoutWMS.prototype.chargerUrlPreenregistre = function() {
        this._MyWMSBrowser = {};
        if(this.configPhp && this.configPhp.urlPreenregistre && Aide.toBoolean(this.options.ajoutUrl)!== false){
            if(this.options.urlPreenregistre === ""){
                this.options.urlPreenregistre = this.configPhp.urlPreenregistre;
            } else {
                this.options.urlPreenregistre = this.configPhp.urlPreenregistre.concat(',').concat(this.options.urlPreenregistre);
            }
        }
        var datastore_wms_msp = this.options.urlPreenregistre.split(',') || [];

        $.each(datastore_wms_msp, function(key, value){
            datastore_wms_msp[key] = [value];
        });
        this._MyWMSBrowser.Store  = new Ext.data.SimpleStore({
            fields: ['url'],
            data : datastore_wms_msp
        });
        
    };

    /**
     * Methode : openWindow
     * Appelé lorsque le bouton "Ajout de couches" est cliquée.  Ouvre la fenêtre
     *     du widget de WMSBrowser.  Si le widget n'a pas été initialisé (lors du
     *     premier click), il est d'abord créé.
     */
    OutilAjoutWMS.prototype.openWindow = function() {
        if(!this._MyWMSBrowser.Window) {
            this._MyWMSBrowser.Browser = new GeoExt.ux.WMSBrowser({
                border: false,
                zoomOnLayerAdded: false,
                closeOnLayerAdded: true,
                gridPanelOptions: {'height': 300},
                serverStore: this._MyWMSBrowser.Store,
                layerStore: this.carte.parent._getMapComponent().layers
            });

            // listen to the WMSBrowser "beforelayeradded" event.
            this._MyWMSBrowser.Browser.on({"beforelayeradded": function(args){
                var layer;

                if (args.layerRecord) {
                    layer = args.layerRecord.getLayer();
                } else if (args.layer){
                    layer = args.layer;
                } else {
                    return false;
                }

                // support for the "Contexte" widget
                layer.options.typeContexte = 'ajout';

                // support for the "ContextMenuPlugin", allow delete and opacity
                // change
                layer.allowDelete = true;
                if (!layer.opacity) {
                    layer.opacity = 1;
                }

                // support for the wms2pdf print widget & also kept by the context
                // widget thereafter
                layer.printOptions = {'fromLayer': true};
                layer.options.printOptions = {'fromLayer': true};

                // have a unique group for WMS layers added by WMSBrowser.  This
                // allows GetLegendGraphic requests for layer nodes added in
                // LayerTreeBuilder widget.
                layer.options.group = "Couches WMS ajoutées";

                return true;
            }, scope: this._MyWMSBrowser});

            this._MyWMSBrowser.Window = new Ext.Window({
                id:'wmsBrowserWindow',
                resizable: false,
                modal: true,
                closeAction: 'hide',
                width: 600,
                height: 400,
                title: OpenLayers.i18n("Ajout de couches WMS"),
                layout: 'fit',
                items: [this._MyWMSBrowser.Browser]
            });

        }
        
        this._MyWMSBrowser.Window.show();
    };

    /**
     * Methode : saveContext
     * Appelée lors d'un déclanchement d'un événement 'savecontext'.
     *
     * Ajoute la liste des serveurs wms dans l'object global de sauvegarde de 
     *     contexte.
     */
    
    //TODO Lancer MyWMSBrowser.saveContext pour partager Carte??
    /*
     * 
     *     oMapComponent.on({"savecontext": sauvegardeContexte});
    oMapComponent.on({"savecontext": MyWMSBrowser.saveContext});
    oMapComponent.on({"loadcontext": MyWMSBrowser.loadContext});
    main.js ligne 603
     */
    
   /* MyWMSBrowser.saveContext = function() {
        var options = { 'wmsservers': MyWMSBrowser.getWMSServersContext() };
        goSauvegardeContexteJSON = 
            OpenLayers.Util.applyDefaults(options, goSauvegardeContexteJSON);
    };*/

    /**
     * Methode : getWMSServersContext
     * Retourne la liste de serveurs wms contenu dans l'objet 'Store'.  Toutes les
     *      urls sont retournées : celles du départ et celles ajoutées par
     *      l'usager.
     *
     * Retourne:
     * {Array} Liste d'urls des serveurs wms.
     */
   /* MyWMSBrowser.getWMSServersContext = function() {
        var aszUrls = [];
        var nUrls = MyWMSBrowser.Store.getCount();

        for(var i=0; i<nUrls; i++) {
            aszUrls.push(MyWMSBrowser.Store.getAt(i).get('url'));
        }

        return aszUrls;
    };*/


    return OutilAjoutWMS;
    
});