  require.config({
    paths: {
        "WMSBrowser-fr": "libs/GeoExt.ux/WMSBrowser/locale/WMSBrowser-fr"
    },
    shim: {
        'WMSBrowser-fr': {
            deps: [
                'libs/Ext.ux/statusbar/StatusBar',
                'css!libs/Ext.ux/statusbar/css/statusbar',
                'libs/GeoExt.ux/WMSBrowser/data/Store',
                'libs/GeoExt.ux/WMSBrowser/data/WMSBrowserWMSCapabilitiesStore',
                'libs/GeoExt.ux/WMSBrowser/plugins/WMSBrowserAlerts',
                'libs/GeoExt.ux/WMSBrowser/widgets/WMSBrowser',
                'libs/GeoExt.ux/WMSBrowser/widgets/WMSBrowserStatusBar',
                'libs/GeoExt.ux/WMSBrowser/widgets/grid/WMSBrowserGridPanel',
                'libs/GeoExt.ux/WMSBrowser/widgets/tree/WMSBrowserRootNode',
                'libs/GeoExt.ux/WMSBrowser/widgets/tree/WMSBrowserTreePanel',
                'libs/GeoExt.ux/WMSBrowser/widgets/tree/patchProcessResponse'
            ]
        }
    }
  });

define(['WMSBrowser-fr'], function() {
});
