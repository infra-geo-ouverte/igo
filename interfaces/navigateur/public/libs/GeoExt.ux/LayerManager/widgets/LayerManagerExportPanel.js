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
 * @include LayerManager/ux/data/Export.js
 * @include LayerManager/ux/data/FormatStore.js
 * @include LayerManager/ux/utils/flash.js
 */

/** api: (define)
 *  module = GeoExt.ux
 *  class = LayerManagerExportPanel
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */

GeoExt.ux.LayerManagerExportPanel = Ext.extend(Ext.Panel, {
    /** api: config[map]
     *  ``OpenLayers.Map``  A configured map
     */
    /** private: property[map]
     *  ``OpenLayers.Map``  The map object.
     */
    map: null,

    /** api: config[border]
     *  ``Boolean``  Default to false
     */
    /** private: property[border]
     *  ``Boolean``  Default to false
     */
    border: false,

    /** api: config[defaultFormat]
     *  ``String``  Default export format. Default: KML
     */
    /** private: property[defaultFormat]
     *  ``String``  Default export format. Default: KML
     */
    defaultFormat: 'KML',

    /** api: config[downloadService]
     *  ``String``  URL used in order to use a server download service. The attributes "format", "content" are sent (POST) to this service.
     */
    /** private: property[defaultFormat]
     *  ``String``  URL used in order to use a server download service. The attributes "format", "content" are sent (POST) to this service.
     */
    downloadService: null,

    /** private: property[formatCombo]
     *  ``Ext.form.ComboBox``  Combo box with format information
     */
    formatCombo: null,

    /** private: property[exportLinkBox]
     *  ``Ext.BoxComponent``  Box used to show a link in Firefox, if Flash is not installed
     */
    exportLinkBox: null,

    /** private: method[initComponent]
     *  Private initComponent override.
     */
    initComponent: function() {

        this.formatCombo = new Ext.form.ComboBox({
            id: 'layermanagerexportformat',
            fieldLabel: OpenLayers.i18n('Format'),
            store: GeoExt.ux.data.FormatStore,
            displayField:'shortName',
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText:'Select a format...',
            selectOnFocus:true,
            resizable:true
        });

        this.formatCombo.setValue(this.defaultFormat);

        this.exportLinkBox = new Ext.BoxComponent({
            id: 'exportlink',
            autoEl: {
                html: '<a href=""></a>'
            }
        });

        this.items = [
            {
                layout: 'form',
                border:false,
                items: [
                    {
                        layout: 'column',
                        border: false,
                        defaults:{
                            layout:'form',
                            border:false,
                            bodyStyle:'padding:5px 5px 5px 5px'
                        },
                        items:[
                            {
                                columnWidth:1,
                                defaults:{
                                    anchor:'100%'
                                },
                                items: [
                                    this.formatCombo
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                layout: 'column',
                border: false,
                defaults:{
                    layout:'form',
                    border:false,
                    bodyStyle:'padding:5px 5px 5px 5px'
                },
                items: [
                    {
                        columnWidth: 1,
                        bodyCfg: {tag:'center'},
                        items: [
                            {
                                xtype:'button',
                                text: OpenLayers.i18n('Export'),
                                handler: function() {
                                    GeoExt.ux.data.Export.content = GeoExt.ux.data.Export(this.map, this.formatCombo.getValue(), null, null);
                                    GeoExt.ux.data.Export.format = this.formatCombo.getValue();
                                    if (this.downloadService) {
                                        var form = document.createElement("form");
                                        form.setAttribute("method", 'POST');
                                        form.setAttribute("action", this.downloadService);

                                        var formatField = document.createElement("input");
                                        formatField.setAttribute("type", "hidden");
                                        formatField.setAttribute("name", "format");
                                        formatField.setAttribute("value", this.formatCombo.getValue());

                                        var contentField = document.createElement("input");
                                        contentField.setAttribute("type", "hidden");
                                        contentField.setAttribute("name", "content");
                                        contentField.setAttribute("value", GeoExt.ux.data.Export.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));

                                        form.appendChild(formatField);
                                        form.appendChild(contentField);

                                        document.body.appendChild(form);
                                        form.submit();

                                    } else {
                                        if (Ext.isIE || Ext.isChrome || Ext.isSafari) {
                                            if (GetFlashVersion() > 10.00) {
                                                GeoExt.ux.data.Export.OpenWindowDownloadify();
                                            } else {
                                                alert('Please install Flash 10 in order to use the following window');
                                                GeoExt.ux.data.Export.OpenWindowDownloadify();
                                            }
                                        } else if (Ext.isGecko) {
                                            if (GetFlashVersion() > 10.00) {
                                                GeoExt.ux.data.Export.OpenWindowDownloadify();
                                            } else {
                                                this.exportLinkBox.getEl().dom.innerHTML = '<a href="data:text/xml,' + GeoExt.ux.data.Export.content.replace(/"/g, '\'') + '" target="new">Right mouse click, Save As...</a>';
                                            }
                                        } else {
                                            alert('Your browser is not supported. Patch welcome !');
                                        }
                                    }
                                    if (Ext.getCmp('layermanagerwindow')) {
                                        Ext.getCmp('layermanagerwindow').close();
                                    }

                                },
                                scope: this
                            }
                        ]
                    }
                ]
            },
            {
                layout: 'column',
                border: false,
                defaults:{
                    layout:'form',
                    border:false,
                    bodyStyle:'padding:5px 5px 5px 5px'
                },
                items: [
                    {
                        columnWidth: 1,
                        bodyCfg: {tag:'center'},
                        items: [
                            this.exportLinkBox
                        ]
                    }
                ]
            }

        ];
        GeoExt.ux.LayerManagerExportPanel.superclass.initComponent.call(this);
    }
});

/** api: xtype = gxux_layermanagerexportpanel */
Ext.reg('gxux_layermanagerexportpanel', GeoExt.ux.LayerManagerExportPanel);
