OpenLayers.Map.prototype.resetLayersZIndex = function() {
    for (var i=0, len=this.layers.length; i<len; i++) {
        var layer = this.layers[i];
        if(layer.z_index_default){
            layer.setZIndex(layer.z_index_default);
        } else {
            this.setLayerZIndex(layer, i);
        }
    }
};