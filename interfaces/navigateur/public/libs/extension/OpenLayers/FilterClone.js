OpenLayers.Filter.Function.prototype.clone = function() {
    return OpenLayers.Util.extend(new OpenLayers.Filter.Function(), this);
};