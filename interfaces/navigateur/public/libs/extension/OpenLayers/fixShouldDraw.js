OpenLayers.Tile.prototype.shouldDraw = function() {     
    if(!this.layer){
        return false;
    }
    var withinMaxExtent = false,
        maxExtent = this.layer.maxExtent;
    if (maxExtent) {
        var map = this.layer.map;
        var worldBounds = map.baseLayer.wrapDateLine && map.getMaxExtent();
        if (this.bounds.intersectsBounds(maxExtent, {inclusive: false, worldBounds: worldBounds})) {
            withinMaxExtent = true;
        }
    }
    
    return withinMaxExtent || this.layer.displayOutsideMaxExtent;
}