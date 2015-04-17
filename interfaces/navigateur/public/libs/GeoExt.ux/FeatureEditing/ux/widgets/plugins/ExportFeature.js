Ext.namespace("GeoExt.ux");

/**
 * @include OpenLayers/Lang.js
 * @include LayerManager/ux/data/Export.js
 */

GeoExt.ux.ExportFeature = Ext.extend(Ext.util.Observable, {

    controler: null,

    editFeatureForm: null,

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

        var bbar = form.getBottomToolbar();
        if (bbar.rendered || !bbar.buttons) {
            bbar.add(action);
        } else {
            bbar.buttons.push(action);
        }

        this.editFeatureForm = form;
    },

    exportFeatures: function() {
        var map = this.controler.map;
        var downloadService = this.controler.downloadService;
        var features = this.editFeatureForm.features;

        this.controler.triggerAutoSave();
        GeoExt.ux.data.Export.KMLExport(map, null, features, downloadService);
    }
});
