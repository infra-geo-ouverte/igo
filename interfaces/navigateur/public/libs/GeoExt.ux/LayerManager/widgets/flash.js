/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** function[GetFlashVersionActivex]
 *  Private static function to check if a version is installed for IE
 *
 * :param i ``Number`` Version number
 */
function GetFlashVersionActivex(i) {
    try {
        var control = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
        var version = control.GetVariable("$version");
        var temp = version.split(" ");
        var version_array = temp[1].split(",");
        return parseFloat(version_array[0] + "." + version_array[2]);
    }
    catch(e) {
        return 0.0;
    }
}

/** function[GetFlashVersionPlugin]
 *  Private static function to get the version of the flash plug-in
 *
 */
function GetFlashVersionPlugin() {
    var flash_version = 0.0;
    if (navigator.plugins !== null && navigator.plugins.length > 0) {
        if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
            var plugin_name = navigator.plugins["Shockwave Flash 2.0"] ? "Shockwave Flash 2.0" : "Shockwave Flash";
            var flash_desc = navigator.plugins[plugin_name].description;
            var desc_segments = flash_desc.split(" ");
            var major_segments = desc_segments[2].split(".");
            var major = major_segments[0];
            var minor_segments = (desc_segments[3] != "") ? desc_segments[3].split("r") : desc_segments[4].split("r");
            var minor = minor_segments[1] > 0 ? minor_segments[1] : 0;
            flash_version = parseFloat(major + "." + minor);
        }
        else {
            flash_version = -1;
        }
    }
    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) {
        flash_version = 4;
    }
    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) {
        flash_version = 3;
    }
    else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) {
        flash_version = 2;
    }
    else {
        flash_version = -1;
    }
    return flash_version;
}

/** function[GetFlashVersion]
 *  Static function to get the installed flash version
 *
 */
function GetFlashVersion() {
    var is_ie = navigator.appVersion.toLowerCase().indexOf("msie") != -1;
    var is_win = navigator.appVersion.toLowerCase().indexOf("win") != -1;
    var is_opera = navigator.userAgent.toLowerCase().indexOf("opera") != -1;
    for (i = 12; i > 0; i--) {
        var flash_version = (is_ie && is_win && !is_opera) ? GetFlashVersionActivex(i) : GetFlashVersionPlugin();
        if (flash_version !== 0) {
            return flash_version;
        }
    }
    return 0.0;
}