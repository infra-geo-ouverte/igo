define(['aide', 'browserDetect'], function(Aide, BrowserDetect) {
    function Metadonnee() {};
 
    Metadonnee.getLayerCapabilities = function(couche){   
        this.couche=couche;
        var nomClasse = couche.options.metadonnee;
        if(Aide.toBoolean(nomClasse) === true){
            nomClasse = couche.options.nom;
        }

        var lienExt = couche.options.metadonneeLien || Aide.obtenirConfig("Metadonnee.lien");
        if(couche.options.metadonneeExterne && couche.options.metadonneeExterne.toLowerCase() !== "false") {
            if(!lienExt){
                lienExt = couche.options.metadonneeExterne;
            }
            if(lienExt && Aide.toBoolean(lienExt) !== true){
                lienExt = decodeURIComponent(lienExt).replace("{id}", nomClasse);
                window.open(lienExt, 'Métadonnees','resizable=yes,scrollbars=yes,toolbar=yes,status=yes');
                return true;
            }
        }
        
        if(lienExt && Aide.toBoolean(lienExt) !== true){
            lienExt = decodeURIComponent(lienExt).replace("{id}", nomClasse);
            this.parse({responseText: "<iframe style='width:800px; height:800px;' src='"+lienExt+"'></iframe>"});
            return true; 
        }  
        
        var szURL = Aide.utiliserProxy(Aide.obtenirUrlServices()+"metaGN/meta_requete_gn.php?id="+ encodeURIComponent(nomClasse));
        var catalogue = Aide.obtenirConfig("Metadonnee.catalogueUrl") || couche.options.metadonneeCatalogueUrl;
        if(catalogue){
            nomClasse = decodeURIComponent(catalogue).replace("{id}", nomClasse);
        }
        if(decodeURIComponent(nomClasse).search("://") !== -1){
            szURL = Aide.utiliserProxy(Aide.obtenirUrlServices()+"metaGN/meta_requete_gn.php?url_metadata="+ encodeURIComponent(decodeURIComponent(nomClasse)));
        }

        OpenLayers.Request.GET({
            url: szURL,
            scope: this,
            callback: this.parseXML
        });
    };

    Metadonnee.parseXML = function(response){
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
	} else {   
            if(BrowserDetect.browser == "Explorer") {
                id_nomClasse = liste_id[0].getElementsByTagName('nomClasseid')[0].text;
            }
            var szURL_GN2 = Aide.utiliserProxy(Aide.obtenirUrlServices()+"metaGN/iframewrapper.php");
            
            var metaURL = Aide.obtenirUrlServices()+"metaGN/meta_gn-details.php?id="+ encodeURIComponent(id_nomClasse);

            if(decodeURIComponent(id_nomClasse).search("://") !== -1){
                metaURL = Aide.obtenirUrlServices()+"metaGN/meta_gn-details.php?url_metadata="+ encodeURIComponent(decodeURIComponent(id_nomClasse));
            }

            if(this.couche.options.metadonneeExterne){
                window.open(metaURL, 'Métadonnees','resizable=yes,scrollbars=yes,toolbar=yes,status=yes');
                return true;
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

        // Ext.Panel creation
        var oMetadataPanel = new Ext.Panel({
            html: szResponse,
            border: false
        });

        // add panneau to window and show 
        oMetadataWindow.add(oMetadataPanel);
        oMetadataWindow.show();    
    };

    return Metadonnee;
});