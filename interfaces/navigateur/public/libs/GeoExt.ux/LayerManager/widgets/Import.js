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
 * @include OpenLayers/Lang.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Util.js
 * @include LayerManager/ux/data/FormatStore.js
 * @include LayerManager/ux/widgets/LayerManagerImportPanel.js
 */

GeoExt.ux.data.importFeatures = null;

/** static: method[GeoExt.ux.data.Import]
 *  Import the data
 *
 * :param map ``OpenLayers.Map`` Map.
 * :param layer ``OpenLayers.Layer.Vector`` (Optional) Layer. If null, a layer named Import is created in the map.
 * :param format ``String`` Input format. Supported: KML, GML, GeoJSON and GeoRSS. Mandatory together with filecontent.
 * :param filecontent ``String`` The information contained in the import file. Mandatory together with format.
 * :param features ``Array(OpenLayers.Feature.Vector)`` (Optional) Array of features.
 *
 *  :return: ``OpenLayers.Layer.Vector`` The layer in which the data are imported.
 */
GeoExt.ux.data.Import = function(map, layer, format, filecontent, features) {
    GeoExt.ux.data.Import.importFeatures = [];

    if (format && filecontent) {
        if (format == 'KML') {
            var kmlReader = new OpenLayers.Format.KML(OpenLayers.Util.extend(
            {externalProjection: new OpenLayers.Projection("EPSG:4326"),internalProjection: map.getProjectionObject()},
                    GeoExt.ux.data.formats.getFormatConfig(format)));
            GeoExt.ux.data.importFeatures = kmlReader.read(filecontent);
        } else if (format == 'GPX') {
            var gpxReader = new OpenLayers.Format.GPX(OpenLayers.Util.extend(
            {externalProjection: new OpenLayers.Projection("EPSG:4326"),internalProjection: map.getProjectionObject()},
                    GeoExt.ux.data.formats.getFormatConfig(format)));
            GeoExt.ux.data.importFeatures = gpxReader.read(filecontent);
        } else if (format == 'GML') {
            var gmlReader = new OpenLayers.Format.GML(GeoExt.ux.data.formats.getFormatConfig(format));
            GeoExt.ux.data.importFeatures = gmlReader.read(filecontent);
        } else if (format == 'GeoJSON') {
            var geojsonReader = new OpenLayers.Format.GeoJSON(GeoExt.ux.data.formats.getFormatConfig(format));
            GeoExt.ux.data.importFeatures = geojsonReader.read(filecontent);
        } else if (format == 'GeoRSS') {
            var georssReader = new OpenLayers.Format.GeoRSS(OpenLayers.Util.extend(
                    {externalProjection: new OpenLayers.Projection("EPSG:4326"),internalProjection: map.getProjectionObject()},
            		GeoExt.ux.data.formats.getFormatConfig(format)));
            GeoExt.ux.data.importFeatures = georssReader.read(filecontent);
        } else {
            return 'Format ' + format + ' not supported. Patch welcome !';
        }
    }

    if (features) {
        GeoExt.ux.data.importFeatures = features;
    }

    if (!layer) {
        layer = new OpenLayers.Layer.Vector("Import", {
            projection: map.displayProjection
        });
        map.addLayer(layer);
    }

    layer.addFeatures(GeoExt.ux.data.importFeatures);
    return layer;
};

/** static: method[GeoExt.ux.data.Import.KMLImport]
 *  Shortcut to import as KML
 *
 * :param map ``OpenLayers.Map`` Map.
 * :param layer ``OpenLayers.Layer.Vector`` (Optional) Layer. If null, a layer named Import is created in the map.
 *
 */
GeoExt.ux.data.Import.KMLImport = function(map, layer) {
    GeoExt.ux.data.Export.format = 'KML';
    var importPanel = new GeoExt.ux.LayerManagerImportPanel({
        map: map,
        defaultFormat: 'KML',
        layer: layer
    });
    
    importPanel.on('dataimported', function(panel, format, filecontent, features) {
        alert(OpenLayers.i18n("Nombre d'objet(s) importé(s) : " + features.length));
        importWindow.close();
    });
    var importWindow = new Ext.Window({
        id: 'importwindow',
        modal: true,
        title: OpenLayers.i18n('Importation KML'),
        height: 135,
        width: 290,
        items: [
            importPanel
        ]
    });
    importWindow.show();
};
