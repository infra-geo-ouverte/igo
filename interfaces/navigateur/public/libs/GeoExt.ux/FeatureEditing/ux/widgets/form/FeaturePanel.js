/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */
Ext.namespace("GeoExt.ux.form");

/** api: (define)
 *  module = GeoExt.ux.form
 *  class = FeaturePanel
 *  base_link = `Ext.form.FormPanel <http://extjs.com/deploy/dev/docs/?class=Ext.form.FormPanel>`_
 */

/**
 * @include OpenLayers/Lang.js
 */

/** api: constructor
 *  .. class:: FeaturePanel
 *
 *  Todo
 */
GeoExt.ux.form.FeaturePanel = Ext.extend(Ext.form.FormPanel, {

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
     *  ``String``  Default value.
     */
    width: 'auto',

    /** api: config[autoWidth]
     *  ``Boolean``  Default value.
     */
    autoWidth: true,

    /** api: config[height]
     *  ``String``  Default value.
     */
    height: 'auto',

    /** api: config[autoHeight]
     *  ``Boolean``  Default value.
     */
    autoHeight: true,

    /** api: config[defaults]
     *  ``Object``  Default value.
     */
    defaults: {width: 120},

    /** api: config[defaultType]
     *  ``String``  Default value.
     */
    defaultType: 'textfield',

    /** private: property[features]
     *  ``OpenLayers.Feature.Vector`` The feature currently being edited
     */
    features: null,

    /** api: config[layer]
     *  ``OpenLayers.Layer.Vector``
     *  The layer the features are binded to
     */
    layer: null,

    /** api: property[controler]
     *  ``GeoExt.ux.FeatureEditingControler``
     */
    controler: null,

    /** private: property[autoSave]
     *  ``Boolean`` Enable the auto-save of any changes made to the feature
     */
    autoSave: true,

    /** api: config[deleteAction]
     *  ``Ext.Action``
     *  The action created to delete the selected feature(s).
     */
    deleteAction: null,

    /** api: config[attributeFieldSetId]
     *  ``String``
     *  The id used when creating the FieldSet for the attribute fields.
     */
    attributeFieldSetId: "gx_featurepanel_attributefieldset_id",

    /** api: config[labelAttribute]
     *  ``String``
     *  The attribute name to use as a label
     */
    labelAttribute: "nom",

    /** private: property[useIcons]
     *  ``Boolean``
     *  If set to true, enables the use of image icons.  Must be combined with
     *  a .css (see in resources/css).
     */
    useIcons: true,

    /** api: property[styler]
     *  ``Styler``
     *  The styler type to use.  Possible values are :
     *  - 'combobox', refering to the 'GeoExt.ux.StyleSelectorComboBox' type
     */
    styler: null,

    /** private: method[initComponent]
     */
    initComponent: function() {
        this.initFeatures(this.features);
        this.initToolbar();
        this.initMyItems();

        //this.on("afterrender", this.onAfterRender, this);

        GeoExt.ux.form.FeaturePanel.superclass.initComponent.call(this);
    },

    /** private: method[initFeatures]
     *  :param features: ``Array(OpenLayers.Feature.Vector)``
     */
    initFeatures: function(features) {
        if (features instanceof Array) {
            this.features = features;
        } else {
            this.features = [features];
        }
    },

    /** private: method[initToolbar]
     *  Initialize the controls of the controler and create a toolbar from the
     *  actions created.
     */
    initToolbar: function() {
        this.initDeleteAction();

        // Add buttons and toolbar
        Ext.apply(this, {bbar: new Ext.Toolbar(this.getActions())});
    },

    /** private: method[initMyItems]
     *  Create field options and link them to the controler controls and actions
     *  and a styler (if one was defined in the 'styler' property)
     */
    initMyItems: function() {
        var oItems, oGroup, feature, field, oGroupItems;

        // todo : for multiple features selection support, remove this...
        if (this.features.length != 1) {
            return;
        } else {
            feature = this.features[0];
        }
        oItems = [];
        oGroupItems = [];
        oGroup = {
            id: this.attributeFieldSetId,
            xtype: 'fieldset',
            title: OpenLayers.i18n('Attributes'),
            layout: 'form',
            collapsible: true,
            autoHeight: this.autoHeight,
            autoWidth: this.autoWidth,
            defaults: this.defaults,
            defaultType: this.defaultType
        };

        for (var attribute in feature.attributes) {
            field = {
                'nom': attribute,
                'fieldLabel': attribute,
                'id': attribute,
                'value': feature.attributes[attribute]
            };
            oGroupItems.push(field);
        }

        oGroup.items = oGroupItems;

        oItems.push(oGroup);

        switch (this.styler)
        {
          case "combobox":

            if (!GeoExt.ux.LayerStyleManager) {
                break;
            }

            var styleStore = new Ext.data.SimpleStore(Ext.ux.util.clone(
                GeoExt.ux.data.FeatureEditingDefaultStyleStoreOptions));
            styleStore.sort('nom');
            var styler = new GeoExt.ux.LayerStyleManager(
                new GeoExt.ux.StyleSelectorComboBox({
                    store: styleStore,
                    comboBoxOptions: {
                        emptyText: OpenLayers.i18n("select a color..."),
                        fieldLabel: OpenLayers.i18n('color')
                    }
            }), {});

            oGroup = {
                xtype: 'fieldset',
                title: OpenLayers.i18n('Style'),
                layout: 'form',
                collapsible: true,
                autoHeight: this.autoHeight,
                autoWidth: this.autoWidth,
                defaults: this.defaults,
                defaultType: this.defaultType,
                items: [styler.createLayout().comboBox]
            };

            oItems.push(oGroup);

            styler.setCurrentFeature(this.features[0]);

            break;
        }

        Ext.apply(this, {items: oItems});
    },

    /** private: method[initDeleteAction]
     *  Create a Ext.Action object that is set as the deleteAction property
     *  and pushed to te actions array.
     */
    initDeleteAction: function() {
        var actionOptions = {
            handler: this.deleteFeatures,
            scope: this,
            tooltip: OpenLayers.i18n('Delete feature')
        };

        if (this.useIcons === true) {
            actionOptions.iconCls = "gx-featureediting-delete";
        } else {
            actionOptions.text = OpenLayers.i18n('Delete');
        }

        this.deleteAction = new Ext.Action(actionOptions);
    },

    /** private: method[deleteFeatures]
     *  Called when the deleteAction is triggered (button pressed).
     *  Destroy all features from all layers.
     */
    deleteFeatures: function() {

        Ext.MessageBox.confirm(OpenLayers.i18n('Delete Feature'), OpenLayers.i18n('Do you really want to delete this feature ?'), function(btn) {
            if (btn == 'yes') {
                for (var i = 0; i < this.features.length; i++) {
                    var feature = this.features[i];
                    if (feature.popup) {
                        feature.popup.close();
                        feature.popup = null;
                    }

                    feature.layer.destroyFeatures([feature]);
                }

                this.controler.reactivateDrawControl();
            }
        },
                this);
    },

    /** private: method[getActions]
     */
    getActions: function() {
        return [this.deleteAction];
    },

    /** private: method[triggerAutoSave]
     */
    triggerAutoSave: function() {
        if (this.autoSave) {
            this.save();
        }
    },

    /** private: method[save]
     */
    save: function() {
        var feature;

        if (this.features && this.features.length === 0) {
            return;
        }

        if (this.features.length != 1) {
            return;
        } else {
            feature = this.features[0];
        }

        this.parseFormFieldsToFeatureAttributes(feature);
        if (feature.isLabel === true) {
            if (feature.attributes[this.labelAttribute] != "") {
                feature.style.label = feature.attributes[this.labelAttribute];
                feature.style.graphic = false;
                feature.style.labelSelect = true;

                feature.layer.drawFeature(feature);
            } else {
                //this.controler.getSelectControl().unselect();
                feature.layer.destroyFeatures([feature]);
                if(this.controler.popup) {
                    this.controler.popup.close();
                    this.controler.popup = null;
                }
            }
        }
    },

    /** private: method[parseFeatureAttributesToFormFields]
     *  :param feature: ``OpenLayers.Feature.Vector``
     *  Copy each attribute values of a feature to its corresponding form field.
     */
    parseFeatureAttributesToFormFields: function(feature) {
        var aoElements, nElements, fieldSet;

        fieldSet = this.findById(this.attributeFieldSetId);
        aoElements = fieldSet.items.items;
        nElements = aoElements.length;

        for (var i = 0; i < nElements; i++) {
            var oElement = aoElements[i];
            var szAttribute = oElement.getName();
            var szValue = null;
            if (oElement.initialConfig.isfid)
            {
                szValue = feature.fid;
            }
            else
            {
                szValue = feature.attributes[szAttribute];
            }
            oElement.setValue(szValue);
        }
    },

    /** private: method[parseFormFieldsToFeatureAttributes]
     *  :param feature: ``OpenLayers.Feature.Vector``
     *  Copy each form field value attribute values to its corresponding
     *  attribute of a feature.
     */
    parseFormFieldsToFeatureAttributes: function(feature) {
        var field, id, value, fieldSet;

        fieldSet = this.findById(this.attributeFieldSetId);

        for (var i = 0; i < fieldSet.items.length; i++) {
            field = fieldSet.items.get(i);
            id = field.getName();
            value = field.getValue();
            feature.attributes[id] = value;
        }
    },

    /** private: method[onAfterRender]
     *  Called after this element was rendered.
     */
    onAfterRender : function() {
        var feature;

        if (this.features.length != 1) {
            return;
        } else {
            feature = this.features[0];
        }

        this.parseFeatureAttributesToFormFields(feature);
    },

    /** private: method[beforeDestroy]
     */
    beforeDestroy: function() {
        delete this.feature;
    }

});

/** api: xtype = gx_featurepanel */
Ext.reg("gx_featurepanel", GeoExt.ux.form.FeaturePanel);
