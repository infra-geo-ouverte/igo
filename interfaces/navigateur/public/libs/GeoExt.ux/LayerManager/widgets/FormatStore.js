/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace("GeoExt.ux.data");

/** static: property[GeoExt.ux.data.formats]
 *  ``Array(Array(String))`` Array of format desctiption with shortName, OpenLayers class and format config
 */
GeoExt.ux.data.formats = [
    ['KML', 'OpenLayers.Format.KML', {
        extractStyles: true,
        extractAttributes: true,
        kmlns: "http://www.opengis.net/kml/2.2"
    }],
    ['GPX', 'OpenLayers.Format.GPX', {
         //extractWaypoints: true,
         extractTracks: true,
         //extractRoutes: true,
         extractAttributes: true
    }],/*,
    ['GeoJSON', 'OpenLayers.Format.GeoJSON',{}],*/
    ['GeoRSS', 'OpenLayers.Format.GeoRSS',{
    	extractStyles: true,
        extractAttributes: true}]/*,
    ['GML', 'OpenLayers.Format.GML',{}]*/
];

/** static: method[GeoExt.ux.data.formats.getFormatConfig]
 *  Get the format config object
 *
 * :param format ``String`` Format short name.
 *
 *  :return: ``Object`` Config object
 */
GeoExt.ux.data.formats.getFormatConfig = function(format) {
    for (var i = 0; i < GeoExt.ux.data.formats.length; i++) {
        if (GeoExt.ux.data.formats[i][0] == format) {
            return GeoExt.ux.data.formats[i][2];
        }
    }
};

/** static: property[GeoExt.ux.data.FormatStore]
 *  ``Ext.data.SimpleStore`` Store containing the formats. Three attributes: 'shortName', 'openLayersClass' and 'formatConfig'
 */
GeoExt.ux.data.FormatStore = new Ext.data.SimpleStore({
    fields: ['shortName', 'openLayersClass', 'formatConfig'],
    data: GeoExt.ux.data.formats
});



