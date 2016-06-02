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

OpenLayers.Map.prototype.setLayerZIndex = function (layer, zIdx) {
	var type = 'Overlay';
	if(layer.CLASS_NAME === "OpenLayers.Layer.Vector" || layer.CLASS_NAME === "OpenLayers.Layer.Markers"){
		type = "Vecteur";
	}
	layer.setZIndex(
	    this.Z_INDEX_BASE[layer.isBaseLayer ? 'BaseLayer' : type]
	    + zIdx * 5 
    );
};