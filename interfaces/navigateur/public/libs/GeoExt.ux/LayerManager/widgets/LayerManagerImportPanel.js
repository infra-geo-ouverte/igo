/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace('GeoExt.ux');
var filecontent;
/**
 * @include LayerManager/ux/data/FormatStore.js
 * @include LayerManager/ux/data/Import.js
 * @include OpenLayers/Lang.js
 */

/** api: (define)
 *  module = GeoExt.ux
 *  class = LayerManagerImportPanel
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */

GeoExt.ux.LayerManagerImportPanel = Ext.extend(Ext.Panel, {
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

    layer: null,

    /** private: property[formatCombo]
     *  ``Ext.form.ComboBox``  Combo box with format information
     */
    formatCombo: null,


    /** private: method[initComponent]
     *  Private initComponent override.
     */
    initComponent: function() {

        this.formatCombo = new Ext.form.ComboBox({
            id: 'layermanagerimportformat',
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

        this.fileSelectorBox = new Ext.BoxComponent({
            id: 'fileSelectorBox',
            autoEl: {
                // http://www.quirksmode.org/dom/inputfile.html
                html: '<input type="file" name="fileselector" id="fileselector"/>'
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
                            this.fileSelectorBox
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
                                text: OpenLayers.i18n('Import'),
                                handler: function() {
                                    if (document.getElementById('fileselector').value == "") {
                                        alert(OpenLayers.i18n('Select a file to import'));
                                    } else {

                                        if (window.File && window.FileReader && window.FileList && window.Blob){
											// The new standard for managing files is supported.
											filecontent = null;
                                        	reader = new FileReader();
                                        	filecontentselector = document.getElementById('fileselector').files[0];
 
											function updateProgress(evt){
												if (evt.lengthComputable){
													// evt.loaded and evt.total are ProgressEvent properties
													var loaded = (evt.loaded / evt.total);
												}
											}
											var me = this;
											function loaded(evt){
												// Obtain the read file data
												filecontent = this.result;
												me.layer = GeoExt.ux.data.Import(me.map, me.layer, me.formatCombo.getValue(), filecontent, null);
												me.fireEvent('dataimported', me, me.formatCombo.getValue(), filecontent, GeoExt.ux.data.importFeatures);
											}

											function errorHandler(evt){
												if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR){
													alert("Error reading file...");
												}
											}
                                        	
                                        	var filereadAsText = reader.readAsText(filecontentselector);
                                           	reader.onload = loaded;
                                        	reader.onerror = errorHandler;
                                        	reader = null;
										}else{
											alert("Désolé, Fureteur non-supporté pour l'instant. Essayez avec Firefox 4 ou Chrome ");
										}
										
                                        this.fireEvent('beforedataimported', this, this.formatCombo.getValue(), filecontent);
                                    }
                                },
                                scope: this
                            }
                        ]
                    }
                ]
            }
        ];
        this.addEvents(
            /** api: event[dataimported]
             *  Fires after data have been imported
             *
             *  Listener arguments:
             *  * comp - :class:`GeoExt.ux.LayerManagerImportPanel`` This component.
             *  * format - import format
             *  * filecontent - content of the imported file
             *  * features - imported features
             *  *
             */
                'dataimported',
            /** api: event[beforedataimported]
             *  Fires before data have been imported
             *
             *  Listener arguments:
             *  * comp - :class:`GeoExt.ux.LayerManagerImportPanel`` This component.
             *  * format - import format
             *  * filecontent - content of the imported file
             *  *
             */
                'beforedataimported');
        GeoExt.ux.LayerManagerImportPanel.superclass.initComponent.call(this);
    }
});

/** api: xtype = gxux_layermanagerimportpanel */
Ext.reg('gxux_layermanagerimportpanel', GeoExt.ux.LayerManagerImportPanel);
