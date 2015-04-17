/** api: (define)
 *  module = GeoExt.ux.form
 *  class = FeatureEditingPanel
 *  base_link = `Ext.form.FormPanel <http://extjs.com/deploy/dev/docs/?class=Ext.form.FormPanel>`_
 */
Ext.namespace("GeoExt.ux.form");

/** api: example
 *  Sample code to create a FeatureEditingPanel object
 * 
 *  .. code-block:: javascript
 *     
 *      var featureEditingPanel = new GeoExt.ux.form.FeatureEditingPanel({
 *          title: "FeatureEditingPanel"
 *          controler: controler
 *      });
 */

/**
 * @include OpenLayers/Lang.js
 * @include GeoExt/widgets/MapPanel.js
 * @include geoext.ux.addons/MapGears_geoext.ux/FeatureEditing/ux/widgets/FeatureEditingControler.js
 */

/** api: constructor
 *  .. class:: FeatureEditingPanel
 * 
 *  Create a FeatureEditingPanel automatically linked to a cosmetic vector layer
 *  object.  Features created automatically have the "title" and "description"
 *  attributes.
 *
 *  So it's a convenience object to quickly generate a RedLining complete tool
 *  with all required controls and features.
 */
GeoExt.ux.form.FeatureEditingPanel = Ext.extend(Ext.form.FormPanel, {

    /** api: config[labelWidth]
     *  ``Number``  Default value.
     */
    labelWidth: 100,

    /** api: config[border]
     *  ``Boolean``  Default value.
     */
    border: false,

    /** api: config[bodyStyle]
     *  ``String``  Default value.
     */
    bodyStyle:'padding:5px 5px 5px 5px',

    /** api: config[width]
     *  ``Number``  Default value.
     */
    width: 300,

    /** api: config[defaults]
     *  ``Object``  Default value.
     */
    defaults: {width: 120},

    /** api: config[defaultType]
     *  ``String``  Default value.
     */
    defaultType: 'textfield',

    /** api: property[controler]
     *  ``GeoExt.ux.FeatureEditingControler``
     */
    controler: null,

    /** api: config[downloadService]
     *  ``String``  URL used in order to use a server download service. The attributes "format" and "content" are sent (POST) to this service.
     */
    /** private: property[defaultFormat]
     *  ``String``  URL used in order to use a server download service. The attributes "format" and "content" are sent (POST) to this service.
     */
    downloadService: null,
    
    /** private: method[initComponent]
     */
    initComponent: function() {
        if(this.controler) {
            this.initToolbar();
            //this.initForm(); modification pour GOLOC
        }

        GeoExt.ux.form.FeatureEditingPanel.superclass.initComponent.call(this);
    },

    /** private: method[initToolbar]
     *  
     */
    initToolbar: function() {
        // Add buttons and toolbar
        Ext.apply(this, {tbar: new Ext.Toolbar(this.controler.actions)});
    },

    /** private: method[initForm]
     *  Create field options and link them to the controler controls and actions
     */
    initForm: function() {
        oItems = [];
        oItems.push({
              id: "testid",
                    fieldLabel: OpenLayers.i18n("myOption"),
                    maxLength: 50,
                    xtype: "checkbox"
                });

        Ext.apply(this, {items: oItems});
    },
    
    /** private: method[beforeDestroy]
     */
    beforeDestroy: function() {
        delete this.controler;
    }
    
});

/** api: xtype = gx_featureform */
Ext.reg("gx_featureeditingpanel", GeoExt.ux.form.FeatureEditingPanel);
