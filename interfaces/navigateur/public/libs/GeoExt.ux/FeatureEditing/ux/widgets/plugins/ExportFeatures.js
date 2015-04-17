Ext.namespace("GeoExt.ux");

/**
 * @include OpenLayers/Lang.js
 * @include LayerManager/ux/data/Export.js
 */

GeoExt.ux.ExportFeatures = Ext.extend(Ext.util.Observable, {

    controler: null,

    init: function(form) {
        this.controler = form.controler;

        var actionOptions = {
            handler: this.exportFeatures,
            scope: this,
            tooltip: OpenLayers.i18n('Export KML')
        };

        if(this.controler.useIcons === true) {
            actionOptions.iconCls = "gx-featureediting-export";
        } else {
            actionOptions.text = OpenLayers.i18n("Export");
        }

        var action = new Ext.Action(actionOptions);
        form.getTopToolbar().add(action);
        this.controler.actions.push(action);
    },

    exportFeatures: function() {
        var downloadService = this.controler.downloadService;
        GeoExt.ux.data.Export.KMLExport(this.controler.map, this.controler.layers, null, downloadService);
    }
});
