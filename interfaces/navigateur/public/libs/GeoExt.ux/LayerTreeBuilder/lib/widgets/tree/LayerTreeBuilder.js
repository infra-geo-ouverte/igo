Ext.namespace("GeoExt.ux.tree");

GeoExt.ux.tree.LayerTreeBuilder = Ext.extend(Ext.tree.TreePanel, {

    /** private: property[CUSTOM_EVENTS]
     *  ``Array(String)`` Array of custom events used by this widget
     */
    CUSTOM_EVENTS: ["layermanaged"],

    /* begin i18n */
    /** api: config[title] ``String`` i18n */
    title: "Layers",

    /** api: config[otherLayersText] ``String`` i18n */
    otherLayersText: "Autres couches",

    /** api: config[baseLayersText] ``String`` i18n */
    baseLayersText: "Fond de carte",
    /* end i18n */

    /** api: config[wmsLegendNodes]
     * ``Boolean``
     * Defaults to true.  Whether WMS layer nodes should have child legend
     * nodes or not.
     */
    wmsLegendNodes: true,

    /** api: config[vectorLegendNodes]
     * ``Boolean``
     * Defaults to true.  Whether vector layer nodes should have child legend
     * nodes or not.
     */
    vectorLegendNodes: true,

    /** api: config[checkableContainerGroupNodes]
     * ``Boolean``
     * Defaults to true.  Whether TreeNode nodes used as group directories 
     * should be checkable or not.  Doesn't include the last (leaf) group node.
     * See the 'checkableLeafGroupNodes' property for that.
     *
     * Can only be set to true if 'checkableLeafGroupNodes' is set to true as
     * well.
     */
    checkableContainerGroupNodes: true,

    /** api: config[checkableLeafGroupNodes]
     * ``Boolean``
     * Defaults to true.  Whether LayerContainer nodes used as group directories
     * should be checkable or not.  Only include the last (leaf) group nodes.
     * For the other nodes (containers), see 'checkableContainerGroupNodes'.
     */
    checkableLeafGroupNodes: true,

    /** api: config[layerStore]
     *  ``GeoExt.data.LayerStore``
     *  The layer store containing layers to be displayed in the tree. 
     *  If not provided it will be taken from the MapPanel.
     */
    layerStore: null,

    /** api: config[enableDD]
     * ``Boolean``
     *  This widget currently doesn't manage changing the order of layer nodes,
     *  so enableDD must be set to false.
     */
    enableDD: false,

    loader: {
        applyLoader: false,
        uiProviders: {"custom_ui": Ext.extend(
            GeoExt.tree.LayerNodeUI,
            new GeoExt.tree.TreeNodeUIEventMixin()
        )}
    },

    root: {
        nodeType: "async",
        children: []
    },

    initComponent: function(){
        this.addEvents(this.CUSTOM_EVENTS);

        this.plugins = this.plugins || [];
        this.plugins.push({ptype: "gx_treenodecomponent"});
        this.plugins.push(new GeoExt.ux.plugins.LayerTreeBuilderNodeAgent());

        GeoExt.ux.tree.LayerTreeBuilder.superclass.initComponent.call(this);
        if(!this.layerStore) {
            this.layerStore = GeoExt.MapPanel.guess().layers;
        }

        this.layerStore.on({
            "add": this.onLayerAdded,
            "remove": this.onLayerRemoved,
            scope: this
        });

        this.layerStore.treeBuilder = this;

        // after the layertree has been rendered, look for already added
        // layer records
        this.on({
            "afterrender": function() {
                this.layerStore.getCount() > 0 && this.onLayerAdded(
                    this.layerStore, this.layerStore.data.items);
            },
            scope: this
        });
    },

    onLayerRemoved: function(store, records, index){
        //todo: remove empty groups
    },

    onLayerAdded: function(store, records, index) {
        // first, validate all 'group' options
        Ext.each(records, function(record, index) {
            var layer = record.getLayer();

            if(layer.displayInLayerSwitcher === false) {
                if(layer.group && layer.options && layer.options.group) {
                    delete layer.group;
                    delete layer.options.group;
                }
                return;
            } else if(layer.options && layer.options.group === undefined) {
                layer.options.group = (layer.isBaseLayer)
                    ? this.baseLayersText : this.otherLayersText;
            }
        }, this);

        // then, create the nodes according to the records
        Ext.each(records, function(record, index) {
            var layer = record.getLayer();

            if(layer.displayInLayerSwitcher === false) {
                return;
            }

            var groupString = layer.options.group;

            // if layer has no GROUP
            if (groupString === "" || groupString == null) {
                var layerNode = {
                    nodeType: "gx_layer",
                    layer: layer.name,
                    layerStore: this.layerStore,
                    isLeaf: true,
                    allowDrag: false,
                    checked: layer.visibility
                };
                this.getRootNode().appendChild(layerNode);
            } else {
                var group = layer.options.group.split('/');
                this.addGroupNodes(
                    group, this.getRootNode(), groupString, record
                );
            }

            this.fireEvent('layermanaged', layer);
        }, this);
    },

    addGroupNodes: function(groups, parentNode, groupString, layerRecord){
        var that = this;

        var group = groups.shift();
        var childNode = this.getNodeByText(parentNode, group);
        var layer = layerRecord.getLayer();
        // if the childNode doesn't exist, we need to create and append it
        if (!childNode) {
            // if that's the last element of the groups array, we need a
            // 'LayerContainer'
            if (groups.length == 0) {
                var createNode;

                // default 'baseLayers' and 'otherLayers' groups don't have
                // checkboxes
                if (group == this.baseLayersText ||
                    group == this.otherLayersText)
                {
                    createNode = function(attr) {
                        return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
                    }
                }
                else {
                    createNode = function(attr) {
                        var layerRecord = this.store.getByLayer(attr.layer);
                        if(!layerRecord){
                            console.warn("Le groupe '"+attr.text+"' n'est pas compatible avec l'arborescence.");
                            attr.nodeType='node';
                            this.uiProviders= {"custom_ui": Ext.extend(
                                GeoExt.tree.LayerNodeUI,
                                new GeoExt.tree.TreeNodeUIEventMixin()
                            )};
                            return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
                        }
                        var layer = layerRecord.getLayer();
                        // WMS and Vector layers can have legend nodes if according
                        // property is enabled
                        if ((layer instanceof OpenLayers.Layer.WMS )&& that.wmsLegendNodes) {
                            attr.component = {
                                xtype: "gx_wmslegend",
                                layerRecord: layerRecord,
                                showTitle: false,
                                hidden: !layer.visibility || layer.hideInLegend
                                    || !layer.inRange || layer.legende===false,
                                cls: "gx-layertreebuilder-legend"
                            };
                            layer.hideInLegend && layerRecord.set(
                                "hideInLegend", layer.hideInLegend);
                        } else if (layer instanceof OpenLayers.Layer.Vector && that.vectorLegendNodes) {
                            attr.component = {
                                xtype: "gx_vectorlegend",
                                layerRecord: layerRecord,
                                showTitle: false,
                                hidden: !layer.visibility || layer.hideInLegend
                                    || !layer.inRange || layer.legende===false,
                                cls: "gx-layertreebuilder-legend"
                            };
                            layer.hideInLegend && layerRecord.set(
                                "hideInLegend", layer.hideInLegend);
                        } else if(layer instanceof OpenLayers.Layer.ArcGIS93Rest){
                            attr.component = {
                                xtype: "gx_arcgislegend",
                                layerRecord: layerRecord,
                                showTitle: false,
                                hidden: !layer.visibility || layer.hideInLegend
                                    || !layer.inRange || layer.legende===false,
                                cls: "gx-layertreebuilder-legend"
                            };
                            layer.hideInLegend && layerRecord.set(
                                "hideInLegend", layer.hideInLegend);
                        }
                        if (!layer.isBaseLayer) {
                            Ext.apply(attr, {
                                listeners: {
                                    checkchange: this.store.treeBuilder.checkChange
                                }
                            });
                        }
                        return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
                    }
                }

                childNode = {
                    text: group,
                    layerStore: this.layerStore,
                    allowDrag: false,
                    nodeType: 'gx_layercontainer',
                    leaf: false,
                    listeners: {
                      insert: this.onLayerContainerNodeAdded,
                      append: this.onLayerContainerNodeAdded,
                      scope: this
                    },
                    loader: {
                        filter: function(record) {
                            if(record.getLayer().options.group !== groupString && groupString.indexOf(record.getLayer().options.group) === 0){
                                //console.warn("Le groupe de la couche '"+record.getLayer().name+"' n'est pas compatible avec l'arborescence.");
                                return false;
                            }
                            return record.getLayer().options.group == groupString;
                        },
                        baseAttrs: {
                            uiProvider: "custom_ui"
                        },
                        createNode: createNode
                    }
                };
            } else {
                // else, create and append a simple node...
                childNode = {
                    text: group,
                    leaf: false,
                    listeners: {
                      append: this.onTreeNodeAppend,
                      scope: this
                    },
                    allowDrag: false,
                    nodeType: "node"
                };
            }

            var checkableNode;
            if (childNode.nodeType == "gx_layercontainer") {
                checkableNode = (this.checkableLeafGroupNodes);
            } else {
                checkableNode = (this.checkableContainerGroupNodes &&
                                 this.checkableLeafGroupNodes);
            }

            // apply checkbox if option is set
            if (checkableNode && group != this.baseLayersText &&
                group != this.otherLayersText && (!layer || !layer.isBaseLayer))
            {
                Ext.apply(childNode, {checked: false});
                Ext.apply(childNode.listeners, {
                    'checkchange' : function(node, checked) {
                        // If a parent node is unchecked, uncheck all
                        // the children
                        if (node.getUI().isChecked()) {
                            node.expand();
                            node.eachChild(function(child){
                               child.ui.toggleCheck(true);
                            });
                        }
                        if (!node.getUI().isChecked())
                        {
                            node.expand();
                            node.eachChild(function(child) {
                                child.ui.toggleCheck(false);
                            });
                        }
                    }
                });                    
            }

            parentNode.appendChild(childNode);
            //parentNode.insertBefore(childNode, parentNode.childNodes[0]);
            
            childNode = this.getNodeByText(parentNode, group);
        }

        // if node contains any child or grand-child with a visible layer,
        // expand it
        if (layer && layer.visibility) {
            childNode.expand();
        }
        
        if (groups.length != 0){
            this.addGroupNodes(groups, childNode, groupString, layerRecord);
        }
    },

    getNodeByText: function(node, text){
        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes[i]['text'] == text)
            {
                return node.childNodes[i];
            }
        }
        return false;
    },

    checkChange: function(node, checked) {
        // Map of all the node ids not yet visited by updateNodeCheckbox
        var unvisitedNodeIds = {};
        var tree = node.getOwnerTree();

        //
        // This function updates the node checkbox according to the status of
        // the descendants. It must be called on a node checkbox nodes only.
        //
        // It is called recursively and returns a boolean:
        // - If the node has no children checkboxes, the status of the checkbox
        //   is returned
        // - Otherwise, it returns true if all the children witch checkbox are
        //   checked or false in the other case.
        //
        // As a side effect, it will update the checkbox state of the node, and
        //  remove visited node ids from the unvisitedNodeIds variable, to
        //  prevent visiting nodes multiple times.

        tree.setNodeChecked=  function(nodeOrId, checked, fireEvent) {
            var node = (nodeOrId instanceof Ext.data.Node) ?
            nodeOrId : this.getNodeById(nodeOrId);

            if (!node || typeof(node.attributes.checked) != "boolean") {
                return;
            }

            if (checked === undefined) {
                checked = !node.attributes.checked;
            }

            // update model
            node.attributes.checked = checked;

            // sync ui
            if (node.ui && node.ui.checkbox) {
                node.ui.checkbox.checked = checked;
            }

            // fire event if required
            if (fireEvent || (fireEvent === undefined))  {
                node.fireEvent('checkchange', node, checked);
            }
        }

        function updateNodeCheckbox(node) {
            if (typeof(node.attributes.checked) != "boolean") {
                throw new Error(arguments.callee.name +
                                " should only be called on checkbox nodes");
            }

            var checkboxChildren = [];
            node.eachChild(function(child) {
                if (typeof(child.attributes.checked) == "boolean")
                    checkboxChildren.push(child);
            }, this);

            // If this node has no children with checkbox, its checked state
            // will be returned.
            if (checkboxChildren.length == 0) {
                return node.attributes.checked;
            }

            var allChecked = true;
            Ext.each(checkboxChildren, function(child) {
                    if (!updateNodeCheckbox(child)) {
                        allChecked = false;
                        return false;
                    }
                }, this);

            tree.setNodeChecked(node, allChecked, false);
            delete unvisitedNodeIds[node.id];

            return allChecked;
        }

        var checkboxNodes = [];

        tree.getRootNode().cascade(function(node) {
                if (typeof(node.attributes.checked) == "boolean") {
                    checkboxNodes.push(node);
                    unvisitedNodeIds[node.id] = true;
                }
            }, this);

        // taking node from the tree order (using shift) should be more
        // efficient
        var node;
        while (node = checkboxNodes.shift()) {
            if (unvisitedNodeIds[node.id])
                updateNodeCheckbox(node);
        }
    },

    onLayerContainerNodeAdded: function(tree, parentNode, childNode) {
        this.validateLayerContainerStatus(parentNode);
    },

    validateLayerContainerStatus: function(node) {
        var show;
        Ext.each(node.childNodes, function(childNode, index) {
            show = true;

           // visibility = childNode.layer.visibility;
            if (!childNode.layer|| !childNode.layer.visibility) {
                show = false;
                return false;
            }
        });

        // check the checkbox (if any)
        var checkbox = node.getUI().checkbox;
        if (checkbox) {
            checkbox.checked = (show) ? true : false;
        }

        // expand this node and all its parents
        show && node.ensureVisible();

        node.parentNode && this.validateTreeNodeStatus(node.parentNode);
    },

    onTreeNodeAppend: function(tree, parentNode, childNode, index) {
        this.validateTreeNodeStatus(parentNode);
    },

    validateTreeNodeStatus: function(node) {
        var show;
        if (!this.checkableContainerGroupNodes || node.isRoot) {
            return;
        }

        Ext.each(node.childNodes, function(childNode, index) {
            show = true;
            if (!childNode.getUI().isChecked()) {
                show = false;
                return false;
            }
        });

        var checkbox = node.getUI().checkbox;
        if (checkbox) {
            checkbox.checked = (show) ? true : false;
        }

        node.parentNode && this.validateTreeNodeStatus(node.parentNode);
    }

});
