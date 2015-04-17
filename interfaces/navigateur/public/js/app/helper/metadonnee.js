define(['aide', 'browserDetect'], function(Aide, BrowserDetect) {
    function Metadonnee() {};
 
    Metadonnee.getLayerCapabilities = function(layer){   
        var nomClasse = layer.mspClassMeta;
        var szFnParse = this.parseXML;

        // Patch pour gérer les métadonnées des cartes de glace Radarsat-2.	
        if (nomClasse.match(/R2_.*/)) // Quand une couche a R2_ dans son nom, on lui impose un nom de métadonnées dans GeoNetwork de MSP_RADARSAT.
        {
            nomClasse = "MSP_RADARSAT";
        }


        var szURL = Aide.utiliserProxy(Aide.obtenirUrlServices()+"metaGN/meta_requete_gn.php?id="+ encodeURIComponent(nomClasse));
        if(nomClasse.search("://") !== -1){
            szURL = Aide.utiliserProxy(Aide.obtenirUrlServices()+"metaGN/meta_requete_gn.php?url_metadata="+ encodeURIComponent(nomClasse));
        }

        OpenLayers.Request.GET({
            url: szURL,
            scope: this,
            callback: szFnParse
        });
    };

    Metadonnee.parseXML = function(response){
       // console.log(response);
        var liste_id = response.responseXML.getElementsByTagName('geonetwork_metaid');
        var id_nomClasse = liste_id[0].getElementsByTagName('nomClasseid')[0].textContent;
        var id_GN = liste_id[0].getElementsByTagName('id')[0].textContent;

        if(BrowserDetect.browser == "Explorer"){
            id_GN = liste_id[0].getElementsByTagName('id')[0].text;
        }
        
        //si pas de resultat avec geonetwork
        if (id_GN == -99 || id_GN == null) {
            var message = {responseText: "Aucune information disponible.\r\n"}
            this.parse(message);
           /* OpenLayers.Request.GET({
                 url: Igo.Aide.utiliserProxy(szURL),
                 scope: this,
                 callback: parse
             });*/
    	
	} else {   
            if(BrowserDetect.browser == "Explorer") {
                id_nomClasse = liste_id[0].getElementsByTagName('nomClasseid')[0].text;
            }
            var szURL_GN2 = Aide.utiliserProxy(Aide.obtenirUrlServices()+"metaGN/iframewrapper.php");
            
            var metaURL = Aide.obtenirUrlServices()+"metaGN/meta_gn-details.php?id="+ encodeURIComponent(id_nomClasse);
            if(id_nomClasse.search("://") !== -1){
                metaURL = Aide.obtenirUrlServices()+"metaGN/meta_gn-details.php?url_metadata="+ encodeURIComponent(id_nomClasse);
            }
            OpenLayers.Request.GET({
                url: szURL_GN2,
                params: {url_iframe: Aide.utiliserProxy(metaURL)},
                scope: this,
                callback: this.parse
            });
	}
    }

    /**
     * Function: parse
     *
     * Displays the getMetadata query result in a Ext.Window.
     *
     * Parameters:
     * response - AJAX response
     */
    Metadonnee.parse = function(response){
        var szResponse = response.responseText;
        var aMetadata = szResponse;//.split("#");

        // Ext.Window creation
        var oMetadataWindow = new Ext.Window({
            title    : 'Information de la couche ',
            closable : true,
            width: 800,
            autoHeight: true, 
            border : false,
            modal: true,
            plain    : true,
            resizable : true,
            autoScroll: true,
            constrain: true,
            region: 'center'
        });

        var szHTML = szResponse;

        // Ext.Panel creation
        var oMetadataPanel = new Ext.Panel({
            html: szHTML,
            border: false
        });

        // add panneau to window and show 
        oMetadataWindow.add(oMetadataPanel);
        oMetadataWindow.show();    
    };

    return Metadonnee;
});