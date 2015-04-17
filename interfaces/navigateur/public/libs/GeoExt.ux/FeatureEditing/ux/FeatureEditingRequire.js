var path = "libs/GeoExt.ux/FeatureEditing/ux/";
define([
    path+"widgets/FeatureEditingControler",
    path+"widgets/form/FeatureEditingPanel",
    path+"widgets/form/RedLiningPanel",
    path+"widgets/form/FeaturePanel",
    path+"data/FeatureEditingDefaultStyleStore",
    path+"util/Clone",
    path+"widgets/plugins/ImportFeatures",
    path+"widgets/plugins/ExportFeatures",
    path+"widgets/plugins/ExportFeature",
    path+"widgets/plugins/CloseFeatureDialog",
    "libs/GeoExt.ux/LayerManager/LayerManagerRequire",
    "libs/GeoExt.ux/FeatureEditing/resources/lang/fr"
], function() {
    Igo.Aide.chargerCSS("libs/GeoExt.ux/FeatureEditing/resources/css/feature-editing.css", true);
});