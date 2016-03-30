
Ext.namespace("GeoExt");
 
GeoExt.ArcgisLegend = Ext.extend(GeoExt.LayerLegend, {
    getLegendUrl: function(layer) {
        var url = layer.url.substr(0, layer.url.lastIndexOf('/')) + '/legend';

        var params = {
            f: 'pjson'
        }

        return Ext.urlAppend(Igo.Aide.utiliserProxy(url), Ext.urlEncode(params));
    }, update: function() {
        var layer = this.layerRecord.getLayer();
        if (layer && layer.map) {
            GeoExt.WMSLegend.superclass.update.apply(this, arguments);

            this.items.each(function(cmp) {
                this.remove(cmp), cmp.destroy();
            }, this);

            var that=this;
            $.ajax({
                dataType: "json",
                url: this.getLegendUrl(layer),
                success: function(response){
                    if(response && response.layers && response.layers.length){
                        var layersName = layer.options.layers;
                        var layersNameArray = [];
                        if(layersName && layersName.search("show:") === 0){
                            layersNameArray = layersName.substr(5).split(",");
                        }

                        var html = "<div>";
                        $.each(response.layers, function(key, layer){
                            if (!layersName || layersNameArray.indexOf(String(key)) !== -1) {
                                html += "<span><b>" + layer.layerName + "</b></span><br/>"
                                $.each(layer.legend, function(key2, style){
                                    html += "<img src=\" data:image/png;base64," + style.imageData + "\" />";
                                    html += "<span>" + style.label + "</span><br/>";
                                });
                            }
                        });
                        html += "</div>"
                        that.add({
                            html: html
                        });
                    }
                    that.doLayout();
                }
            });
        }
    }
});

GeoExt.ArcgisLegend.supports = function(layerRecord) {
    return layerRecord.getLayer() instanceof OpenLayers.Layer.ArcGIS93Rest ? 1 : 0;
};

GeoExt.LayerLegend.types.gx_arcgislegend = GeoExt.ArcgisLegend;
Ext.reg("gx_arcgislegend", GeoExt.ArcgisLegend);