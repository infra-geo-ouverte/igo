GeoExt.tree.LayerLoader.prototype.addLayerNode=function(node, layerRecord, index){
    if (this.filter(layerRecord) === true) {
    var child = this.createNode({
        nodeType: 'gx_layer',
        layer: layerRecord.getLayer(),
        layerStore: this.store
    });

    var index = layerRecord.data.layer.options.zTree;
    var sibling;
    var find;
    if(index){
        var diffIndex;
        for(var i=0; i<node.childNodes.length; ++i) {
            if(!node.childNodes[i].layer.options.zTree){
                continue;
            }
            var diffIndexCourant = index-node.childNodes[i].layer.options.zTree;
            if (diffIndexCourant < 0) {
                if((!diffIndex) || (diffIndexCourant > diffIndex)) {
                    sibling = node.childNodes[i];
                    diffIndex = diffIndexCourant;
                    find = true;
                    if(diffIndexCourant==-1){
                        break;
                    }
                }
            } else if(!find){
                sibling = node.childNodes[i+1];
                if(diffIndexCourant==1 || !sibling){
                    find = true;
                    break;
                }

            }
        }

        if(!sibling && !find){
            sibling = node.childNodes[0];
        }  
    }

    if(sibling) {
        node.insertBefore(child, sibling);
    } else {
        node.appendChild(child);
    }
    child.on("move", this.onChildMove, this);
}
};
