/*
 * Custom measure control to get measure while making circle.
 */
OpenLayers.Control.MeasureCircle = OpenLayers.Class(OpenLayers.Control.Measure, {
    measureImmediate: function(point, feature, drawing) {

        this.cancelDelay();
        this.measure(point, "measurepartial");
    },
    CLASS_NAME: "OpenLayers.Control.MeasureCircle"
});
