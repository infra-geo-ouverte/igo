require.config({
    paths: {
        "fixOpenLayersRequire": "libs/extension/OpenLayers/DrawFeatureEx"
    },
    shim: {
        'fixOpenLayersRequire': {
            deps: [
				'libs/extension/OpenLayers/CircleToMeasure', 
				'libs/extension/OpenLayers/MeasureCircle', 
				'libs/extension/OpenLayers/resetLayersZIndex', 
				'libs/extension/OpenLayers/fixShouldDraw'
            ]
        }
    }
});

define(['fixOpenLayersRequire'], function() {
});



