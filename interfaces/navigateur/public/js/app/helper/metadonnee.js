define(['aide'], function(Aide) {
    function Metadonnee() {};
 
    Metadonnee.getLayerCapabilities = function(couche){   
        var externe = this.getLayerCapabilitiesExterne(couche);
        if(!externe){
            Aide.afficherMessage("Métadonnée invalide", "La métadonnée associée à la couche n'est pas valide.")
        }
    }

    Metadonnee.getLayerCapabilitiesExterne = function(couche){   
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
            //lienExt = Aide.utiliserProxy(lienExt);
            this.parse({responseText: "<iframe style='width:800px; height:800px;' src='"+lienExt+"'></iframe>"});
            return true; 
        }  
        return false;
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