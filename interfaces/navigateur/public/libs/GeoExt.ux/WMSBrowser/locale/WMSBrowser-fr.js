Ext.namespace("GeoExt.ux")
if (GeoExt.ux.WMSBrowser) {
    Ext.apply(GeoExt.ux.WMSBrowser.prototype, {
        inputURLText: "Sélectionner ou entrer une adresse de serveur (URL)",
        connectText: "Connexion",
        pleaseInputURLText: "Veuillez sélectionner ou entrer une adresse de serveur (URL) dans la boîte déroulante d'abord.",
        srsCompatibleText: "SRS compatible",
        extentCompatibleText: "Extent compatible",
        titleText: "Titre",
        nameText: "Nom",
        queryableText: "Interrogeable",
        descriptionText: "Description",
        yesText: "Oui",
        noText: "Non",
        addLayerText: "Ajouter",
        addSelectedLayersText: "Ajouter les couches présentement sélectionnées en tant qu'une seule couche.",
        mapPanelPreviewTitleText: "Aperçu de la carte",
        layerCantBeAddedText: "Cette couche ne peut être ajoutée : ",
        srsNotSupportedText: "Cette couche ne peut être ajoutée à la présente carte parce qu'elle ne supporte pas sa projection.",
        srsNotSupportedShortText: "elle ne supporte pas la projection de la carte",
        extentNotSupportedShortText: "elle est en dehors de l'extent de la carte",
        pleaseSelectALayerText: "Veuillez sélectionner une ou plusieurs couches dans la grille d'abord.",
        pleaseCheckALayerInTreeText: "Veuillez cocher une ou plusieurs couches dans l'arbre d'abord.",
        closeWindowText: "Fermer cette fenêtre",
        closeText: "Fermer",
        inputURLInvalidText: "L'adresse (url) entrée n'est pas valide.",
        layerNameText: "Nom de la couche :",
        noLayerReturnedText: "L'adresse entrée est valide mais n'a retourné aucune couches.",
        layersSuccessfullyLoadedText: "Couches chargées avec succès.",
        layerAddedText: "Couche(s) ajoutée(s) avec succès à la carte",
        urlInvalidText: "L'adresse de serveur (url) n'est pas valide ou n'est pas un serveur WMS valide.",
        pleaseInputLayerNameText: "Veuillez saisir un nom de couche dans la boîte de texte ci-dessous.",
        warningText: "Avertissement",
        errorText: "Erreur"
    });
}

if (GeoExt.ux.WMSBrowserStatusBar) {
    Ext.apply(GeoExt.ux.WMSBrowserStatusBar.prototype, {
        text: 'Prêt',
        defaultText: 'Prêt',
        busyText: 'Chargement des couches...'
    });
}
