/** api: (define)
 *  module = GeoExt.ux.form
 *  class = RedLiningPanel
 *  base_link = `GeoExt.ux.form.FeatureEditingPanel <>`_
 */
define(['libs/GeoExt.ux/FeatureEditing/ux/widgets/form/FeatureEditingPanel'], function() {

Ext.namespace("GeoExt.ux.form");

/** api: example
 *  Sample code to create a RedLiningPanel object
 * 
 *  .. code-block:: javascript
 *     
 *      var redLiningPanel = new GeoExt.ux.form.RedLiningPanel({
 *          title: "RedLining Panel"
 *          map: map
 *      });
 */

/**
 * @requires geoext.ux.addons/MapGears_geoext.ux/FeatureEditing/ux/widgets/form/FeatureEditingPanel.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Style.js
 * @include OpenLayers/StyleMap.js
 * @include OpenLayers/Util.js
 */

/** api: constructor
 *  .. class:: RedLiningPanel
 * 
 *  Create a FeatureEditingPanel automatically linked to a cosmetic vector layer
 *  object.  Features created automatically have the "title" and "description"
 *  attributes.
 *
 *  So it's a convenience object to quickly generate a RedLining complete tool
 *  with all required controls and features.
 */

GeoExt.ux.form.RedLiningPanel = Ext.extend(GeoExt.ux.form.FeatureEditingPanel, {

    /** api: property[map]
     *  ``OpenLayers.Map``  A configured map object.
     */
    map: null,

    /** api: property['import']
     *  ``Boolean``
     *  If set to true, automatically creates and add Import(s) pluggins.
     */
    'import': true,

    /** api: property['export']
     *  ``Boolean``
     *  If set to true, automatically creates and add Import(s) pluggins.
     */
    'export': true,

    /** api: property[toggleGroup]
     *  ``String``
     *  The name of the group used for the buttons created.  If none is
     *  provided, it's set to this.map.id.
     */
    toggleGroup: null,

    /** api: property[popupOptions]
     *  ``Object``
     *  The options hash used when creating GeoExt.Popup objects.
     */
    popupOptions: {},

    /** api: property[selectControlOptions]
     *  ``Object``
     *  The options hash used when creating OpenLayers.Control.ModifyFeature
     */
    selectControlOptions: {},

    /** private: method[initComponent]
     */
    initComponent: function() {
        this.initMap();
        this.initControler();
        GeoExt.ux.form.RedLiningPanel.superclass.initComponent.call(this);
    },

    /** private: method[initMap]
     *  Convenience method to make sure that the map object is correctly set.
     */
    initMap: function() {
        if (this.map instanceof GeoExt.MapPanel) {
            this.map = this.map.map;
        }

        if (!this.map) {
            this.map = GeoExt.MapPanel.guess().map;
        }
    },

    /** private: method[initMap]
     *  Automatically create a FeatureEditingControler.
     */
    initControler: function() {
        this.controler = new GeoExt.ux.FeatureEditingControler({
            'cosmetic': true,
            'map': this.map,
            'import': this['import'],
            'export': this['export'],
            'toggleGroup': this.toggleGroup,
            'popupOptions': this.popupOptions,
            'selectControlOptions': this.selectControlOptions
        });
    }
});

/** api: xtype = gx_featureform */
Ext.reg("gx_redliningpanel", GeoExt.ux.form.RedLiningPanel);


});