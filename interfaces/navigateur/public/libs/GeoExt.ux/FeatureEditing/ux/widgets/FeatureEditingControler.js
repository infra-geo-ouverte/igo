/** api: (define)
 *  module = GeoExt.ux
 *  class = FeatureEditingControler
 *  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GeoExt.ux");

// FIXME: add DeleteFeature control when available
/**
 * @include OpenLayers/Control/DrawFeature.js
 * @include OpenLayers/Control/ModifyFeature.js
 * @include OpenLayers/Control/SelectFeature.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Polygon.js
 * @include OpenLayers/Lang.js
 * @include GeoExt/widgets/Action.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/Popup.js
 * @include FeatureEditing/ux/widgets/form/FeaturePanel.js
 * @include FeatureEditing/ux/widgets/plugins/CloseFeatureDialog.js
 * @include FeatureEditing/ux/widgets/plugins/ExportFeature.js
 * @include LayerManager/ux/data/Export.js
 * @include LayerManager/ux/data/Import.js
 */

/** api: constructor
 *  .. class:: FeatureEditingControler(config)
 *
 *      Create a FeatureEditing main controler.
 */
GeoExt.ux.FeatureEditingControler = Ext.extend(Ext.util.Observable, {

    /** api: property[map]
     *  ``OpenLayers.Map``  A configured map object.
     */
    map: null,

    /** api: config[drawControls]
     *  ``Array(OpenLayers.Control.DrawFeature)``
     *  An array of DrawFeature controls automatically created from the current
     *  activeLayer
     */
    drawControls: null,

    /** api: config[lastDrawControl]
     *  ``OpenLayers.Control.DrawFeature``
     *  The last active draw control.
     */
    lastDrawControl: null,

    /** api: config[deleteAllAction]
     *  ``Ext.Action``
     *  The action created to delete all features.
     */
    deleteAllAction: null,

    /** api: config[actions]
     *  ``Array(GeoExt.Action or Ext.Action)``
     *  An array of actions created from various controls or tasks that are to
     *  be added to a toolbar.
     */
    actions: null,

    /** api: config[featureControl]
     *  ``OpenLayers.Control.ModifyFeature or OpenLayers.Control.SelectFeature``
     *  The OpenLayers control responsible of selecting the feature by clicks
     *  on the screen and, optionnaly, edit feature geometry.
     */
    featureControl: null,

    /** api: config[layers]
     *  ``Array(OpenLayers.Layer.Vector)``
     *  An array of OpenLayers.Layer.Vector objects
     */
    layers: null,

    /** api: config[activeLayer]
     *  ``OpenLayers.Layer.Vector``  The current layer being edited.
     */
    activeLayer: null,

    /** api: config[featurePanel]
     *  ``GeoExt.ux.form.FeaturePanel``
     *  A reference to the FeaturePanel object created
     */
    featurePanel: null,

    /** api: config[popup]
     *  ``GeoExt.Popup``
     *  A reference to the Popup object created
     */
    popup: null,

    /** private: property[useIcons]
     *  ``Boolean``
     *  If set to true, enables the use of image icons.  Must be combined with
     *  a .css (see in resources/css).
     */
    useIcons: true,

    /** api: config[downloadService]
     *  ``String``  URL used in order to use a server download service. The
     *              attributes "format" and "content" are sent (POST) to this
     *              service.
     */
    /** private: property[downloadService]
     *  ``String``  URL used in order to use a server download service. The
     *              attributes "format" and "content" are sent (POST) to this
     *              service.
     */
    downloadService: null,

    /** private: property[useDefaultAttributes]
     *  ``Boolean``
     *  If set to true, defaultAttributes are set to new features added with
     *  no attributes.
     */
    useDefaultAttributes: true,

    /** api: config[defaultAttributes]
     *  ``Array(String)``
     *  An array of attribute names to used when a blank feature is added
     *  to the map if useDefaultAttributes is set to true.
     */
	 // Changement de langue MSP
    defaultAttributes: ['nom','description'],

    /** private: property[autoSave]
     *  ``Boolean``
     *  If set to true, automatically saves modifications on specific kind of
     *  events.
     */
    autoSave: true,

    /** private: property[style]
     *  ``Object`` Feature style hash to use when creating a cosmetic layer.
     *   If none is defined, OpenLayers.Feature.Vector.style['default'] is used
     *   instead.
     */
    style: null,

    /** private: property[defaultStyle]
     *  ``Object`` Feature style hash to apply to the default 
     *   OpenLayers.Feature.Vector.style['default'] if no style was specified.
     */
    defaultStyle: {
        fillColor: "red",
        strokeColor: "red"
    },

    /** api: config[layerOptions]
     *  ``Object``
     *  Options to be passed to the cosmetic OpenLayers.Layer.Vector
     *  constructor.
     */
    layerOptions: {},

    /** api: property[cosmetic]
     *  ``Boolean``
     *  If set to true, a blank OpenLayers.Layer.Vector object will be created
     *  and added to this controler.
     */
    cosmetic: false,

    /** api: config[fadeRatio]
     *  ``Numeric``
     *  The fade ratio to apply when features are not selected.
     */
    fadeRatio: 0.4,

    /** api: config[opacityProperties]
     *  ``Array(String)``
     *  The style properties refering to opacity.
     */
    opacityProperties: [
        "fillOpacity", "hoverFillOpacity",
        "strokeOpacity", "hoverStrokeOpacity"
    ],

    /** api: config[defaultOpacity]
     *  ``Numeric``
     *  Default opacity maximum value
     */
    defaultOpacity: 1,

    /** api: property['import']
     *  ``Boolean``
     *  If set to true, automatically creates and add Import(s) pluggins.
     */
    'import': true,

    /** api: property['export']
     *  ``Boolean``
     *  If set to true, automatically creates and add Export(s) pluggins.
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

    /** private: property[popupOptions]
     *  ``Object``
     *  The default popup options.
     */
    defaultPopupOptions: {
	// Changement de terme en fran�ais - MSP
        title: OpenLayers.i18n('Modifier Objet'),
        layout: 'fit',
        width: 280
    },

    /** api: property[selectControlOptions]
     *  ``Object``
     *  The options hash used when creating OpenLayers.Control.ModifyFeature
     */
    selectControlOptions: {},

    /** api: property[styler]
     *  ``Styler``
     *  The styler type to use in the FeaturePanel widget.
     */
    styler: null,

    /** private: method[constructor]
     *  Private constructor override.
     */
    constructor: function(config) {
        Ext.apply(this, config);

        this.addEvents([
            /** api: events[activelayerchanged]
             *  Triggered when the active layer is changed
             *
             *  Listener arguments:
             */
            "activelayerchanged"
        ]);

        this.drawControls = [];
        this.actions = [];
        this.layers = [];

        this.initMap();

        // Manage layers manually created
        if(config['layers'] != null) {
            this.addLayers(config['layers']);
            delete config['layers'];
        }

        // if set, automatically creates a "cosmetic" layer
        if(this.cosmetic === true) {
            var style = this.style || OpenLayers.Util.applyDefaults(
                this.defaultStyle, OpenLayers.Feature.Vector.style["default"]);
            var styleMap = new OpenLayers.StyleMap(style); 
            var layerOptions = OpenLayers.Util.applyDefaults(
                this.layerOptions, {
                  styleMap: styleMap,
                  displayInLayerSwitcher: false
            });
            layer = new OpenLayers.Layer.Vector("Cosmetic", layerOptions);
            this.addLayers([layer]);
        }

        if(this.layers.length > 0) {
            this.setActiveLayer(this.layers[0]);
        }

        GeoExt.ux.FeatureEditingControler.superclass.constructor.apply(this, arguments);
    },

    /** private: method[addLayers]
     *  :param layers: ``Array(OpenLayers.Layer.Vector)``
     *  For each layers, add them with the addLayer method.
     */
    addLayers: function(layers) {
        for (var i = 0; i < layers.length; i++) {
            this.addLayer(layers[i]);
        }
    },

    /** private: method[addLayer]
     *  :param layer: ``OpenLayers.Layer.Vector``
     *  Add layer to the map object, to this layers array and register some
     *  events for feature modification.
     */
    addLayer: function(layer) {
        if (!layer.map) {
            this.map.addLayer(layer);
        }
        this.layers.push(layer);

        layer.events.on({
            "beforefeatureselected": this.onBeforeFeatureSelect,
            "featureunselected": this.onFeatureUnselect,
            "featureselected": this.onFeatureSelect,
            "beforefeaturemodified": this.onModificationStart,
            "featuremodified": this.onModification,
            "afterfeaturemodified": this.onModificationEnd,
            "beforefeatureadded": this.onBeforeFeatureAdded,
            scope: this
        });
    },

    /** private: method[setActiveLayer]
     *  :param layer: ``OpenLayers.Layer.Vector``
     *  Change activeLayer to this layer.
     */
    setActiveLayer: function(layer) {
        this.activeLayer = layer;
        this.fireEvent("activelayerchanged", this, layer);

        // 1st, destroy the old controls/actions

        // 2nd, create new ones from the current active layer
        this.initDrawControls(layer);
        this.initFeatureControl(layer);
        this.initDeleteAllAction();

        // 3rd, create import/export pluggins
        this.initImport();
        this.initExport();
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

        // if no toggleGroup was defined, set to this.map.id
        if (!this.toggleGroup) {
            this.toggleGroup = this.map.id;
        }
    },

    /** private: method[initFeatureControl]
     *  :param layer: ``OpenLayers.Layer.Vector``
     *  Create a ModifyFeature control linked to the passed layer and
     *  add it to the map.  An GeoExt.Action is also created and pushed to the
     *  actions array.
     */
    initFeatureControl: function(layer) {
        var control, actionOptions;

        control = new OpenLayers.Control.ModifyFeature(
                layer, this.selectControlOptions);

        this.featureControl = control;
        this.map.addControl(control);

        actionOptions = {
            control: control,
            map: this.map,
            // button options
            toggleGroup: this.toggleGroup,
            allowDepress: false,
            pressed: false,
					// Changement de terme en fran�ais - MSP
            tooltip: OpenLayers.i18n("Modifier Objet"),
            // check item options
            group: this.toggleGroup,
            checked: false
        };

        if (this.useIcons === true) {
            actionOptions.iconCls = "gx-featureediting-editfeature";
        } else {
		// Changement de terme en fran�ais - MSP
            actionOptions.text = OpenLayers.i18n("Modifier Objet");
        }

        var action = new GeoExt.Action(actionOptions);

        this.actions.push(action);
    },

    /** private: method[destroyFeatureControl]
     *  Destroy the current featureControl and all related objects.
     */
    destroyFeatureControl: function() {
    },

    /** private: method[initDrawControls]
     *  :param layer: ``OpenLayers.Layer.Vector``
     *  Create DrawFeature controls linked to the passed layer and
     *  depending on its geometryType property and add them to the map.
     *  GeoExt.Action are also created and pushed to the actions array.
     */
    initDrawControls: function(layer) {
        var control, handler, geometryTypes, geometryType,
                options, action, iconCls, actionOptions, tooltip;

        geometryTypes = [];
        options = {};

        if (OpenLayers.i18n(layer.geometryType)) {
            geometryTypes.push(OpenLayers.i18n(layer.geometryType));
        } else {
            geometryTypes.push(OpenLayers.i18n("Point"));
            geometryTypes.push(OpenLayers.i18n("LineString"));
            geometryTypes.push(OpenLayers.i18n("Polygon"));
            geometryTypes.push(OpenLayers.i18n("Label"));
        }

        for (var i = 0; i < geometryTypes.length; i++) {
            geometryType = geometryTypes[i];

            switch (geometryType) {
                case OpenLayers.i18n("LineString"):
                case OpenLayers.i18n("MultiLineString"):
                    handler = OpenLayers.Handler.Path;
                    iconCls = "gx-featureediting-draw-line";
                    tooltip = OpenLayers.i18n("Create line");
                    break;
                case OpenLayers.i18n("Point"):
                case OpenLayers.i18n("MultiPoint"):
                    handler = OpenLayers.Handler.Point;
                    iconCls = "gx-featureediting-draw-point";
                    tooltip = OpenLayers.i18n("Create point");
                    break;
                case OpenLayers.i18n("Polygon"):
                case OpenLayers.i18n("MultiPolygon"):
                    handler = OpenLayers.Handler.Polygon;
                    iconCls = "gx-featureediting-draw-polygon";
                    tooltip = OpenLayers.i18n("Create polygon");
                    break;
                case OpenLayers.i18n("Label"):
                    handler = OpenLayers.Handler.Point;
                    iconCls = "gx-featureediting-draw-label";
                    tooltip = OpenLayers.i18n("Create label");
                    break;
            }

            control = new OpenLayers.Control.DrawFeature(
                    layer, handler, options);

            this.drawControls.push(control);
            this.map.addControl(control);

            if (geometryType == OpenLayers.i18n("Label")) {
                control.events.on({
                    "featureadded": this.onLabelAdded,
                    scope: this
                });
            }

            control.events.on({
                "featureadded": this.onFeatureAdded,
                scope: this
            });

            actionOptions = {
                control: control,
                map: this.map,
                // button options
                toggleGroup: this.toggleGroup,
                allowDepress: false,
                pressed: false,
                tooltip: tooltip,
                // check item options
                group: this.toggleGroup,
                checked: false
            };

            // use icons or text for the display
            if (this.useIcons === true) {
                actionOptions.iconCls = iconCls;
            } else {
                actionOptions.text = geometryType;
            }

            action = new GeoExt.Action(actionOptions);

            this.actions.push(action);
        }
    },

    /** private: method[destroyDrawControls]
     *  Destroy all drawControls and all their related objects.
     */
    destroyDrawControls: function() {
        for (var i = 0; i < this.drawControls.length; i++) {
            this.drawControls[i].destroy();
        }
        this.drawControls = [];
    },

    /** private: method[initDeleteAllAction]
     *  Create a Ext.Action object that is set as the deleteAllAction property
     *  and pushed to te actions array.
     */
    initDeleteAllAction: function() {
        var actionOptions = {
            handler: this.deleteAllFeatures,
            scope: this,
            tooltip: OpenLayers.i18n('Delete all features')
        };

        if (this.useIcons === true) {
            actionOptions.iconCls = "gx-featureediting-delete";
        } else {
            actionOptions.text = OpenLayers.i18n('DeleteAll');
        }

        var action = new Ext.Action(actionOptions);

        this.deleteAllAction = action;
        this.actions.push(action);
    },

    /** private: method[deleteAllFeatures]
     *  Called when the deleteAllAction is triggered (button pressed).
     *  Destroy all features from all layers.
     */
    deleteAllFeatures: function() {
        Ext.MessageBox.confirm(OpenLayers.i18n('Delete All Features'), OpenLayers.i18n('Do you really want to delete all features ?'), function(btn) {
            if (btn == 'yes') {
                if (this.popup) {
                    this.popup.close();
                    this.popup = null;
                }

                for (var i = 0; i < this.layers.length; i++) {
                    this.layers[i].destroyFeatures();
                }
            }
        },
                this);
    },

    initImport: function(layer) {
        if(this['import'] === true) {
            var actionOptions = {
                handler: this.importFeatures,
                scope: this,
                tooltip: OpenLayers.i18n('Import KML')
            };

            if(this.useIcons === true) {
                actionOptions.iconCls = "gx-featureediting-import";
            } else {
                actionOptions.text = OpenLayers.i18n("Import");
            }

            var action = new Ext.Action(actionOptions);
            this.actions.push(action);
        }
    },

    importFeatures: function() {
        GeoExt.ux.data.Import.KMLImport(this.map, this.activeLayer);
    },

    initExport: function() {
        if(this['export'] === true) {
            var actionOptions = {
                handler: this.exportFeatures,
                scope: this,
                tooltip: OpenLayers.i18n('Export KML')
            };

            if(this.useIcons === true) {
                actionOptions.iconCls = "gx-featureediting-export";
            } else {
                actionOptions.text = OpenLayers.i18n("Export");
            }

            var action = new Ext.Action(actionOptions);
            this.actions.push(action);
        }
    },

    exportFeatures: function() {
        GeoExt.ux.data.Export.KMLExport(this.map, this.layers, null, this.downloadService);
    },

    /** private: method[getSelectControl]
     *  :return: ``OpenLayers.Control.Select``
     *  Convenience method to return the SelectFeature control from
     *  this.featureControl object.
     */
    getSelectControl: function() {
        var control = false;
        switch (this.featureControl.CLASS_NAME) {
            case "OpenLayers.Control.SelectFeature":
                control = this.featureControl;
                break;
            case "OpenLayers.Control.ModifyFeature":
            case "OpenLayers.Control.DeleteFeature":
                control = this.featureControl;
                break;
        }
        return control;
    },

    /** private: method[getActiveDrawControl]
     *  :return: ``OpenLayers.Control.DrawFeature or false``
     *  Get the current active DrawFeature control.  If none is active, false
     *  is returned.
     */
    getActiveDrawControl: function() {
        var control = false;

        for (var i = 0; i < this.drawControls.length; i++) {
            if (this.drawControls[i].active) {
                control = this.drawControls[i];
                break;
            }
        }

        return control;
    },

    /** private: method[onLabelAdded]
     *  :param event: ``event``
     *  Called when a new label feature is added to the activeLayer.  Set a flag
     *  to let the controler know it's a label.
     */
    onLabelAdded: function(event) {
        var feature = event.feature;
        feature.isLabel = true;
    },

    /** private: method[onFeatureAdded]
     *  :param event: ``event``
     *  Called when a new feature is added to the activeLayer.  Change the state
     *  of the feature to INSERT and select it.
     */
    onFeatureAdded: function(event) {
        var feature, drawControl;

        feature = event.feature;
        feature.state = OpenLayers.State.INSERT;

        drawControl = this.getActiveDrawControl();
        if (drawControl) {
            drawControl.deactivate();
            this.lastDrawControl = drawControl;
        }

        this.featureControl.activate();
 
        //TODO: bug ici !
      //  this.getSelectControl().selectFeature(feature);
       // this.getSelectControl().deactivate();
    },

    /** private: method[onModificationStart]
     *  :param event: ``event``
     *  Called when a feature is selected.  Display a popup that contains the
     *  FeaturePanel.
     */
    onModificationStart: function(event) {
        var feature = (event.geometry) ? event : event.feature;

        // to keep the state before any modification, useful when hitting the
        // 'cancel' button
        /*
         if(feature.state != OpenLayers.State.INSERT){
         feature.myClone = feature.clone();
         feature.myClone.fid = feature.fid;
         }
         */

        // if the user clicked on an other feature while adding a new one,
        // deactivate the draw control.
        var drawControl = this.getActiveDrawControl();
        if (drawControl) {
            drawControl.deactivate();
            this.featureControl.activate();
        }

        var options = {
            autoSave: this.autoSave,
            features: [feature],
            controler: this,
            useIcons: this.useIcons,
            styler: this.styler
        };

        if(this['export'] === true) {
            options['plugins'] = [new GeoExt.ux.ExportFeature(), new GeoExt.ux.CloseFeatureDialog()];
        }

        this.featurePanel = new GeoExt.ux.form.FeaturePanel(options);

        // display the popup
        popupOptions = {
            location: feature,
            controler: this,
            items: [this.featurePanel]
        };
        popupOptions = OpenLayers.Util.applyDefaults(popupOptions,
                                                     this.popupOptions);
        popupOptions = OpenLayers.Util.applyDefaults(popupOptions,
                                                     this.defaultPopupOptions);
        var popup = new GeoExt.Popup(popupOptions);
        feature.popup = popup;
        this.popup = popup;
        popup.show();
        popup.on({
            close: function() {
                if (OpenLayers.Util.indexOf(this.controler.activeLayer.selectedFeatures, this.feature) > -1) {
                    this.controler.getSelectControl().unselect(this.feature);
                }
            }
        });
        

    },

    /** private: method[onModification]
     *  :param event: ``event``
     */
    onModification: function(event) {
        var feature = (event.geometry) ? event : event.feature;
        //we could execute commits here
    },

    /** private: method[onModificationEnd]
     *  :param event: ``event``
     */
    onModificationEnd: function(event) {
        var feature = (event.geometry) ? event : event.feature;
        // or we could execute commits here also

        if (!feature) {
            return;
        }

        this.triggerAutoSave();

        if (feature.popup) {
            feature.popup.close();
            feature.popup = null;
        }

        this.reactivateDrawControl();
    },

    /** private: method[onBeforeFeatureAdded]
     *  :param event: ``event``
     *  Called when a new feature is added to the layer.
     */
    onBeforeFeatureAdded: function(event) {
        var feature = event.feature;
        this.parseFeatureStyle(feature);
        this.parseFeatureDefaultAttributes(feature);
    },

    /** private: method[parseFeatureStyle]
     */
    parseFeatureStyle: function(feature) {
        var symbolizer = this.activeLayer.styleMap.createSymbolizer(feature);
        feature.style = symbolizer;
    },

    /** private: method[parseFeatureDefaultAttributes]
     *  :param event: ``OpenLayers.Feature.Vector``
     *  Check if the feature has any attributes.  If not, add those defined in
     *  this.defaultAttributes.
     */
    parseFeatureDefaultAttributes: function(feature) {
        var hasAttributes;

        if(this.useDefaultAttributes === true) {
            hasAttributes = false;

            for (var key in feature.attributes) {
                hasAttributes = true;
                break;
            }

            if(!hasAttributes) {
                for(var i=0; i<this.defaultAttributes.length; i++) {
                    feature.attributes[this.defaultAttributes[i]] = '';
                }
            }
        }
    },

    /** private: method[reactivateDrawControl]
     */
    reactivateDrawControl: function() {
        if (this.lastDrawControl && this.activeLayer.selectedFeatures.length === 0) {
            this.featureControl.deactivate();
            this.lastDrawControl.activate();
            this.lastDrawControl = null;
        }
    },

    /** private: method[triggerAutoSave]
     */
    triggerAutoSave: function() {
        if (this.autoSave) {
            this.featurePanel.triggerAutoSave();
        }
    },

    /** private: method[onBeforeFeatureSelect]
     *  :param event: ``event``
     *  Called before a feature is selected
     */
    onBeforeFeatureSelect: function(event) {
        var feature = (event.geometry) ? event : event.feature;

        // if it's the first feature that is selected
        if(feature.layer.selectedFeatures.length === 0) {
            this.applyStyles('faded', {'redraw': true});
        }
    },

    /** private: method[onFeatureUnselect]
     *  :param event: ``event``
     *  Called when a feature is unselected.
     */
    onFeatureUnselect: function(event) {
        var feature = (event.geometry) ? event : event.feature;
        this.applyStyle(feature, 'faded', {'redraw': true});

        // if it's the last feature that is unselected
        if(feature.layer.selectedFeatures.length === 0) {
            this.applyStyles('normal', {'redraw': true});
        }
    },

    /** private: method[onFeatureSelect]
     *  :param event: ``event``
     *  Called when a feature is selected
     */
    onFeatureSelect: function(event) {
        var feature = (event.geometry) ? event : event.feature;
        this.applyStyle(feature, 'normal', {'redraw': true});
    },

    /** private: method[applyStyles]
     *  :param style: ``String`` Mandatory.  Can be "normal" or "faded".
     *  :param options: ``Object`` Object of options.
     *  Apply a specific style to all layers of this controler.  If 
     *  'redraw': true was specified in the options, the layer is redrawn after.
     */
    applyStyles: function(style, options) {
        style = style || "normal";
        options = options || {};
        for(var i=0; i<this.layers.length; i++) {
            layer = this.layers[i];
            for(var j=0; j<layer.features.length; j++) {
                feature = layer.features[j];
                // don't apply any style to features coming from the 
                // ModifyFeature control
                if(!feature._sketch) {
                    this.applyStyle(feature, style);
                }
            }

            if(options['redraw'] === true) {
                layer.redraw();
            }
        }
    },

    /** private: method[applyStyle]
     *  :param feature: ``OpenLayers.Feature.Vector``
     *  :param style: ``String`` Mandatory.  Can be "normal" or "faded".
     *  :param options: ``Object`` Object of options.
     *  Apply a specific style to a specific feature.  If 'redraw': true was 
     *  specified in the options, the layer is redrawn after.
     */
    applyStyle: function(feature, style, options) {
        var fRatio;
        options = options || {};

        switch (style) {
          case "faded":
            fRatio = this.fadeRatio;
            break;
          default:
            fRatio = 1 / this.fadeRatio;
        }   

        for(var i=0; i<this.opacityProperties.length; i++) {
            property = this.opacityProperties[i];
            if(feature.style[property]) {
                feature.style[property] *= fRatio;
            }
        }

        if(options['redraw'] === true) {
            feature.layer.drawFeature(feature);
        }
    },

    CLASS_NAME: "GeoExt.ux.FeatureEditingControler"
});
