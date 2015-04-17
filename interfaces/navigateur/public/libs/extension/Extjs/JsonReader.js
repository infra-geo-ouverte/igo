Ext.data.JsonReader.prototype.extractValues = function (data, items, len) {
    var f, values = {};
    for(var j = 0; j < len; j++){
        f = items[j];
        var v; 
        try {
            v = this.ef[j](data);
        } catch(e){
            v = undefined;
        }
        values[f.name] = f.convert((v !== undefined) ? v : f.defaultValue, data);
    }
    return values;
}