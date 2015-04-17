/*
 * Custom handler to notify while making circle (added this.callback "modify"...).
 */
OpenLayers.Handler.CircleToMeasure = OpenLayers.Class(OpenLayers.Handler.RegularPolygon, {
    move: function(evt) {
        var maploc = this.layer.getLonLatFromViewPortPx(evt.xy);
        var point = new OpenLayers.Geometry.Point(maploc.lon, maploc.lat);
        if (this.irregular) {
            var ry = Math.sqrt(2) * Math.abs(point.y - this.origin.y) / 2;
            this.radius = Math.max(this.map.getResolution() / 2, ry);
        } else if (this.fixedRadius) {
            this.origin = point;
        } else {
            this.calculateAngle(point, evt);
            this.radius = Math.max(this.map.getResolution() / 2,
                    point.distanceTo(this.origin));
        }
        this.modifyGeometry();
        if (this.irregular) {
            var dx = point.x - this.origin.x;
            var dy = point.y - this.origin.y;
            var ratio;
            if (dy == 0) {
                ratio = dx / (this.radius * Math.sqrt(2));
            } else {
                ratio = dx / dy;
            }
            this.feature.geometry.resize(1, this.origin, ratio);
            this.feature.geometry.move(dx / 2, dy / 2);
        }
        this.layer.drawFeature(this.feature, this.style);

        this.callback("modify", [this.origin, this.feature, 1]);
    },
    
    CLASS_NAME: "OpenLayers.Handler.CircleToMeasure"
});