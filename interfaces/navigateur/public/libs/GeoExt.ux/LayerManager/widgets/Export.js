/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace("GeoExt.ux.data");

/**
 * @include OpenLayers/Format/GeoJSON.js
 * @include OpenLayers/Format/GeoRSS.js
 * @include OpenLayers/Format/GML.js
 * @include OpenLayers/Format/KML.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Util.js
 * @include LayerManager/ux/data/FormatStore.js
 * @include LayerManager/ux/utils/flash.js
 * @include LayerManager/ux/widgets/LayerManagerExportWindow.js
 */

/** static: method[GeoExt.ux.data.Export]
 *  Export the data
 *
 * :param map ``OpenLayers.Map`` Map.
 * :param format ``String`` Output format. Supported: KML, GeoJSON, GeoRSS, GML
 * :param layers ``Array(OpenLayers.Layer)`` (Optional) Array of layers. Supported: 'OpenLayers.Layer.Vector','OpenLayers.Layer.WFS','OpenLayers.Layer.GML','OpenLayers.Layer.GeoRSS'. If null, all supported layers of thd map are exported.
 * :param features ``Array(OpenLayers.Feature.Vector)`` (Optional) Array of features. If null, all features of the layers are exported.
 *
 *  :return: ``String`` Exported data.
 */
GeoExt.ux.data.Export = function(map, format, layers, features) {
    var exportLayers = [];
    var exportFeatures = [];

    // Export first the features
    if (features) {
        exportFeatures = features;
    } else {
        // If no features set, export the layers
        if (layers) {
            exportLayers = layers;
        } else {
            for (var i = 0; i < map.layers.length; i++) {
                var layer = map.layers[i];
                if (layer.CLASS_NAME) {
                    if (GeoExt.ux.data.Export.isLayerSupported(layer.CLASS_NAME)) {
                        exportLayers.push(layer);
                    }
                }
            }
        }
        for (var j = 0; j < exportLayers.length; j++) {
            var exportLayer = exportLayers[j];
            if (exportLayer.features) {
                for (var k = 0; k < exportLayer.features.length; k++) {
                    exportFeatures.push(exportLayer.features[k]);
                }
            }
        }
    }

    if (format == 'KML') {
        var kmlWriter = new OpenLayers.Format.KML(OpenLayers.Util.extend(
        {externalProjection: new OpenLayers.Projection("EPSG:4326"),internalProjection: map.getProjectionObject()},
                GeoExt.ux.data.formats.getFormatConfig(format)));
        return kmlWriter.write(exportFeatures);
    } else if (format == 'GeoJSON') {
        var geojsonWriter = new OpenLayers.Format.GeoJSON(GeoExt.ux.data.formats.getFormatConfig(format));
        return geojsonWriter.write(exportFeatures);
    } else if (format == 'GeoRSS') {
        var georssWriter = new OpenLayers.Format.GeoRSS(GeoExt.ux.data.formats.getFormatConfig(format));
        return georssWriter.write(exportFeatures);
    } else if (format == 'GML') {
        var gmlWriter = new OpenLayers.Format.GML(GeoExt.ux.data.formats.getFormatConfig(format));
        return gmlWriter.write(exportFeatures);
    } else {
        return 'Format ' + format + ' not supported. Patch welcome !';
    }
};

/** static: property[GeoExt.ux.data.Export.content]
 *  ``String`` Export content
 */
GeoExt.ux.data.Export.content = null;

/** static: property[GeoExt.ux.data.Export.format]
 *  ``String`` Export format
 */
GeoExt.ux.data.Export.format = null;

/** static: property[GeoExt.ux.data.Export.format]
 *  ``GeoExt.ux.LayerManagerExportWindow`` Export window
 */
GeoExt.ux.data.Export.exportWindow = null;

/** static: property[GeoExt.ux.data.Export.SupportedLayerType]
 *  ``Array(String)`` Array of supported layer type: 'OpenLayers.Layer.Vector','OpenLayers.Layer.WFS','OpenLayers.Layer.GML','OpenLayers.Layer.GeoRSS'
 */
GeoExt.ux.data.Export.SupportedLayerType = [
    ['OpenLayers.Layer.Vector'],
    ['OpenLayers.Layer.WFS'],
    ['OpenLayers.Layer.GML'],
    ['OpenLayers.Layer.GeoRSS']
];

/** static: method[GeoExt.ux.data.Export.isLayerSupported]
 *  Defines if a layer class is supported
 *
 * :param className ``String`` OpenLayers class name.
 *
 *  :return: ``Boolean``
 */
GeoExt.ux.data.Export.isLayerSupported = function(className) {
    for (var i = 0; i < GeoExt.ux.data.Export.SupportedLayerType.length; i++) {
        if (GeoExt.ux.data.Export.SupportedLayerType[i][0] === className) {
            return true;
        }
    }
    return false;
};

/** static: method[GeoExt.ux.data.Export.OpenWindowDownloadify]
 *  Open an export window with downloadify flash add-in
 *
 */
GeoExt.ux.data.Export.OpenWindowDownloadify = function() {
    GeoExt.ux.data.Export.exportWindow = new GeoExt.ux.LayerManagerExportWindow({
        filename: 'export.' + GeoExt.ux.data.Export.format.toLowerCase(),
        filecontent: GeoExt.ux.data.Export.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    });
    GeoExt.ux.data.Export.exportWindow.show();
};

/** static: method[GeoExt.ux.data.Export.KMLExport]
 *  Shortcut to export as KML
 *
 * :param map ``OpenLayers.Map`` Map.
 * :param layers ``Array(OpenLayers.Layer)`` (Optional) Array of layers. Supported: 'OpenLayers.Layer.Vector','OpenLayers.Layer.WFS','OpenLayers.Layer.GML','OpenLayers.Layer.GeoRSS'. If null, all supported layers of thd map are exported.
 * :param features ``Array(OpenLayers.Feature.Vector)`` (Optional) Array of features. If null, all features of the layers are exported.
 * :param features ``Array(OpenLayers.Feature.Vector)`` (Optional) Array of features. If null, all features of the layers are exported.
 *
 */
GeoExt.ux.data.Export.KMLExport = function(map, layers, features, downloadService) {
    GeoExt.ux.data.Export.format = 'KML';
    GeoExt.ux.data.Export.content = GeoExt.ux.data.Export(map, GeoExt.ux.data.Export.format, layers, features);

    if (downloadService) {
        var form = document.createElement("form");
        form.setAttribute("method", 'POST');
        form.setAttribute("action", downloadService);

        var formatField = document.createElement("input");
        formatField.setAttribute("type", "hidden");
        formatField.setAttribute("name", "format");
        formatField.setAttribute("value", GeoExt.ux.data.Export.format);

        var contentField = document.createElement("input");
        contentField.setAttribute("type", "hidden");
        contentField.setAttribute("name", "content");
        contentField.setAttribute("value", GeoExt.ux.data.Export.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));

        form.appendChild(formatField);
        form.appendChild(contentField);

        document.body.appendChild(form);
        form.submit();
    } else {
        if (GetFlashVersion() > 10.00) {
            GeoExt.ux.data.Export.OpenWindowDownloadify();
        } else {
            alert('Please install Flash 10 in order to use the following window.');
            GeoExt.ux.data.Export.OpenWindowDownloadify();
        }
    }
};
