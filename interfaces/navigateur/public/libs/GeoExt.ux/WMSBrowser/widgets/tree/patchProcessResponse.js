
Ext.override(GeoExt.tree.WMSCapabilitiesLoader, {

    processResponse : function(response, node, callback, scope){
        var content;
        if(Igo.BrowserDetect.browser == "Explorer"){
            content = response.responseText;
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            // required or IE will attempt to validate against DTD, which could fail
            // because the dtd is not accessibile and we don't really care
            // we will notice later if any layer was loaded from the response anyway
            xmlDoc.async = false;
            xmlDoc.validateOnParse = false;
            xmlDoc.resolveExternals = false;
            var parsed=xmlDoc.loadXML(content);
            if(!parsed) {
                var myErr = xmlDoc.parseError;
                alert(myErr.reason);
            } else {
                content=xmlDoc;
            }
        } else {
            content = response.responseXML || response.responseText;
        }
    
        var capabilities = new OpenLayers.Format.WMSCapabilities().read(content);
			
		//modif MAT, lance une erreur lorsque l'URL n'est pas bon
		// voir mantis #899
		if(!capabilities.capability){
			scope.loading = false;
			node.wmsbrowser.fireEvent('getcapabilitiesfail');
		}
		else{			
			this.processLayer(capabilities.capability,
				capabilities.capability.request.getmap.href, node);
			if (typeof callback == "function") {
				callback.apply(scope || node, [node]);
			}
		}
    }
});