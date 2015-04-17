OpenLayers.Control.DrawFeatureEx = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
    initialize: function(handler, options) {
        var layer = options.handlerOptions.layer;
        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this, [layer, handler, options]);

        // configure the keyboard handler
        this.keyboardCallbacks = {
            keydown: this.handleKeyDown
        };
        this.keyboardHandler = new OpenLayers.Handler.Keyboard(this, this.keyboardCallbacks, {});
    },
    handleKeyDown: function(evt) {
        switch (evt.keyCode) {
            case 90: // z
                if (evt.metaKey || evt.ctrlKey) {
                    this.undo();
                }
                break;
            case 89: // y
                if (evt.metaKey || evt.ctrlKey) {
                    this.redo();
                }
                break;
            case 27: // esc
                this.cancel();
                break;
        }
    },
    
    activate: function() {
        OpenLayers.Control.DrawFeature.prototype.activate.apply(this, arguments);
        this.keyboardHandler.activate();
    },
    deactivate: function() {
        OpenLayers.Control.DrawFeature.prototype.deactivate.apply(this, arguments);
        this.keyboardHandler.deactivate();
    },
    
    CLASS_NAME: "OpenLayers.Control.DrawFeatureEx"
    
});