Ext.namespace("GeoExt.ux.plugins");

GeoExt.ux.plugins.LayerTreeBuilderNodeAgent = Ext.extend(Ext.util.Observable, {

    /** private: property[tree]
     *  :class:`GeoExt.ux.LayerTreeBuilder`
     */
    tree: null,

    /** private: method[init]
     *  :param tree: :class:`GeoExt.ux.LayerTreeBuilder`
     */
    init: function(tree, config) {
        this.tree = tree;
        this.tree.on('layermanaged', this.onLayerManaged, this);
    },

    /** private: method[onLayerManaged]
     *  :param layer: :class:`OpenLayers.Layer`
     *
     *  Called when a "layermanaged" event is fired by the 
     *  :class:`GeoExt.ux.LayerTreeBuilder` widget.  Registers a
     *  "visibilitychanged" callback on the layer to manage the node visibility.
     */
    onLayerManaged: function(layer) {
        layer.events.on({"visibilitychanged": function(event) {
            var layer = event.object;
            if (layer.visibility) {
                if (layer.layerContainer) {
                    layer.layerContainer.ensureVisible();
                    layer.layerContainer.expand();
                } else if (layer.options && layer.options.group) {
                    var groups = layer.options.group.split('/');
                    this.expandTreeNodesFromGroup(
                        groups, this.tree.getRootNode(), layer);
                }
            }
        }, scope: this});
    },

    /** private: method[expandTreeNodesFromGroup]
     *  :param groups:     ``Array`` of node names following the depth of the
     *                               nodes
     *  :param parentNode: :class:`Ext.tree.TreeNode`
     *  :param layer:      :class:`OpenLayers.Layer`
     *
     *  Called when a "layermanaged" event is fired by the 
     *  :class:`GeoExt.ux.LayerTreeBuilder` widget.  Registers a
     *  "visibilitychanged" callback on the layer to manage the node visibility.
     */
    expandTreeNodesFromGroup: function(groups, parentNode, layer) {
        var group = groups.shift();
        var childNode = parentNode.findChild("text", group);
        if (childNode) {
            childNode.expand();
            if (groups.length > 0) {
                this.expandTreeNodesFromGroup(groups, childNode, layer);
            } else {
                layer.layerContainer = childNode;
            }
        }
    }
});
