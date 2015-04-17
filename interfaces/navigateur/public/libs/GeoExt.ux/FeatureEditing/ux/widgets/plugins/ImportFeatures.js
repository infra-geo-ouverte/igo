Ext.namespace("GeoExt.ux");

/**
 * @include OpenLayers/Lang.js
 * @include LayerManager/ux/data/Import.js
 */

GeoExt.ux.ImportFeatures = Ext.extend(Ext.util.Observable, {

    layer: null,

    controler: null,

    init: function(form) {
        this.layer = form.layer;
        this.controler = form.controler;

        var actionOptions = {
            handler: this.importFeatures,
            scope: this,
            tooltip: OpenLayers.i18n('Import KML')
        };

        if(this.controler.useIcons === true) {
            actionOptions.iconCls = "gx-featureediting-import";
        } else {
            actionOptions.text = OpenLayers.i18n("Import");
        }

        var action = new Ext.Action(actionOptions);
        form.getTopToolbar().add(action);
        this.controler.actions.push(action);
    },

    importFeatures: function() {
        GeoExt.ux.data.Import.KMLImport(this.layer.map, this.layer);
    }
});
