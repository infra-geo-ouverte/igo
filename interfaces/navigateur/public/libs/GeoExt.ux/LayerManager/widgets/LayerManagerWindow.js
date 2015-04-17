/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace('GeoExt.ux');

/**
 * @include OpenLayers/Lang.js
 * @include LayerManager/ux/widgets/LayerManagerExportPanel.js
 * @include LayerManager/ux/widgets/LayerManagerImportPanel.js
 */

/** api: (define)
 *  module = GeoExt.ux
 *  class = LayerManagerWindow
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Window>`_
 */

GeoExt.ux.LayerManagerWindow = Ext.extend(Ext.Window, {
    /** api: config[map]
     *  ``OpenLayers.Map``  A configured map
     */
    /** private: property[map]
     *  ``OpenLayers.Map``  The map object.
     */
    map: null,

    /** api: config[downloadService]
     *  ``String``  URL used in order to use a server download service. The attributes "format", "content" are sent (POST) to this service.
     */
    /** private: property[defaultFormat]
     *  ``String``  URL used in order to use a server download service. The attributes "format", "content" are sent (POST) to this service.
     */
    downloadService: null,

    /** private: property[id]
     *  ``String``  id set to layermanagerwindow (don't change it)
     */
    id: 'layermanagerwindow',

    /** private: property[modal]
     *  ``Boolean``  Define the window as modal.
     */
    modal: true,

    /** private: property[title]
     *  ``String``  Define the title of the window: OpenLayers.i18n('Layer Manager')
     */
    title: OpenLayers.i18n('Layer Manager'),

    /** private: property[width]
     *  ``Number``  Width of the window: 275
     */
    width: 275,

    /** private: property[height]
     *  ``Number``  Height of the window: 400
     */
    height: 400,

    /** private: property[layout]
     *  ``String``  Layout set to accordion
     */
    layout: 'accordion',

    /** private: property[layoutConfig]
     *  ``Object``  Layout config set to animate:true
     */
    layoutConfig: {animate:true},

    /** property[exportPanel]
     *  ``GeoExt.ux.LayerManagerExportPanel``  Export panel
     */
    exportPanel: null,

    /** property[importPanel]
     *  ``GeoExt.ux.LayerManagerImportPanel``  Import panel
     */
    importPanel: null,

    /** private: method[initComponent]
     *  Private initComponent override.
     */
    initComponent: function() {

        this.exportPanel = new GeoExt.ux.LayerManagerExportPanel({
            map: this.map,
            downloadService: this.downloadService,
            defaultFormat: 'KML'
        });

        this.importPanel = new GeoExt.ux.LayerManagerImportPanel({
            map: this.map,
            defaultFormat: 'KML'
        });

        this.importPanel.on('dataimported', function(panel, format, filecontent, features) {
            alert(OpenLayers.i18n("KML data sucessfully imported in layer: " + panel.layer.name + " !" + " Number of imported features: " + features.length));
        });

        this.items = [
            {
                title: OpenLayers.i18n('Export'),
                items: [
                    this.exportPanel
                ]
            },
            {
                title: OpenLayers.i18n('Import'),
                items: [
                    this.importPanel
                ]
            }
        ];
        GeoExt.ux.LayerManagerWindow.superclass.initComponent.call(this);
    }
});

/** api: xtype = gxux_layermanagerwindow */
Ext.reg('gxux_layermanagerwindow', GeoExt.ux.LayerManagerWindow);
