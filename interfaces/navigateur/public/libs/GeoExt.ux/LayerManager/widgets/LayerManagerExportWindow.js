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
 * @include LayerManager/ux/downloadify/js/downloadify.min.js
 * @include LayerManager/ux/utils/flash.js
 */

/** private: property[scriptSource]
 *  ``String``  Source of this script: complete URL
 */
/*scriptSourceLayerManagerExportWindow = (function() {
    var scripts = document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1];

    if (script.getAttribute.length !== undefined) {
        return script.src;
    }

    return script.getAttribute('src', -1);
}());*/

/** api: (define)
 *  module = GeoExt.ux
 *  class = LayerManagerExportWindow
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Window>`_
 */

GeoExt.ux.LayerManagerExportWindow = Ext.extend(Ext.Window, {
    /** private: property[id]
     *  ``String``  id set to layermanagerexportwindow (don't change it)
     */
    id: 'layermanagerexportwindow',

    /** private: property[modal]
     *  ``Boolean``  Define the window as modal.
     */
    modal: true,

    /** private: property[title]
     *  ``String``  Define the title of the window: OpenLayers.i18n('Export Window')
     */
    title: OpenLayers.i18n('Export Window'),

    /** private: property[width]
     *  ``Number``  Width of the window: 500
     */
    width: 500,

    /** private: property[height]
     *  ``Number``  Height of the window: 300
     */
    height:300,

    /** private: property[minWidth]
     *  ``Number``  Minimal width of the window: 300
     */
    minWidth: 300,

    /** private: property[minHeight]
     *  ``Number``  Minimal height of the window: 200
     */
    minHeight: 200,

    /** private: property[layout]
     *  ``String``  Layout set to absolute
     */
    layout:'absolute',

    /** private: property[plain]
     *  ``Boolean``  Plain set to true
     */
    plain:true,

    /** private: property[bodyStyle]
     *  ``String``  Body style set to 'padding:5px;'
     */
    bodyStyle:'padding:5px;',

    /** private: property[filename]
     *  ``String``  Export filename set by the window
     */
    filename: null,

    /** private: property[filecontent]
     *  ``String``  Export filecontent
     */
    filecontent: null,

    /** private: property[downloadifyBox]
     *  ``Ext.BoxComponent``  Box use to present the downloadify button
     */
    downloadifyBox: null,

    /** private: property[downloadifyLoaded]
     *  ``Boolean``  Flag used to check that downloadify has been used
     */
    downloadifyLoaded: false,

    /** api: config[baseUrl]
     *  ``Boolean``  Base URL in order to get the images from the donwloadify directory. Has to be set if this file is integrated in a JS build.
     */
    /** private: property[baseUrl]
     *  ``String``  Base URL in order to get the images from the donwloadify directory
     */
    baseUrl: '',// scriptSourceLayerManagerExportWindow.replace('/widgets/LayerManagerExportWindow.js', ''),
    baseUrldownloadify:'', //scriptSourceLayerManagerExportWindow.replace('/widgets/', ''),
    /** private: method[initComponent]
     *  Private initComponent override.
     */
    initComponent: function() {
        this.downloadifyBox = new Ext.BoxComponent({
            x: 405,
            y: 6,
            width: 66,
            height: 21,
            id: 'downloadify',
            anchor:'',
            autoEl:{
                tag:'p',
                style:"text-align:right"
            }
        });


        this.items = [
            {
                x: 10,
                y: 5,
                xtype: 'textfield',
                id: 'filename',
                name: 'filename',
                value: this.filename,
                width: 384
            },
            this.downloadifyBox,
            {
                x: 10,
                y: 35,
                xtype: 'textarea',
                id: 'data',
                name: 'data',
                value: this.filecontent,
                anchor: '100% 100%'  // anchor width and height
            }
        ];
        var downloadify_swf=Igo.Aide.obtenirCheminRacine()+"libs/GeoExt.ux/LayerManager/widgets/downloadify/downloadify.swf";
        var downloadify_image=Igo.Aide.obtenirCheminRacine()+"libs/GeoExt.ux/LayerManager/widgets/downloadify/download.png";
        GeoExt.ux.LayerManagerExportWindow.superclass.initComponent.call(this);
        this.on(
                'afterlayout', function() {
            var el = Ext.get('downloadify');
            if (el && !this.downloadifyLoaded && GetFlashVersion() >= 10.00) {
                Downloadify.create('downloadify', {
                    filename: function() {
                        return document.getElementById('filename').value;
                    },
                    data: function() {
                        return document.getElementById('data').value;
                    },
                    onComplete: function() {
                        Ext.getCmp('layermanagerexportwindow').close();
                    },
                    onCancel: function() {
                    },
                    onError: function() {
                        alert('Error occured during storage');
                    },
                    transparent: false,
                    swf: downloadify_swf,
                    downloadImage: downloadify_image,
                    width: 66,
                    height: 21,
                    append: false
                });
                this.downloadifyLoaded = true;
            }
        },
                this);

    }
});

/** api: xtype = gxux_layermanagerexportwindow */
Ext.reg('gxux_layermanagerexportwindow', GeoExt.ux.LayerManagerExportWindow);
