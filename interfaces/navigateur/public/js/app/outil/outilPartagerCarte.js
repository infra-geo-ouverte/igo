define(['outil', 'aide', 'browserDetect', 'WMS'], function(Outil, Aide, BrowserDetect, WMS) {
    function OutilPartagerCarte(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            titre: 'Partager la carte',
            id:'btnSaveContext',
            icone:  Aide.utiliserBaseUri('images/toolbar/mActionFileSave.png'),
            infobulle: 'Sauvegarder ou partager cette carte'
        });
        var contexteConfig = Aide.obtenirConfig('Contexte');
        if (contexteConfig && contexteConfig.service){
            this.defautOptions.service = contexteConfig.service;
        }
        this._extOptions={
            scale: 'medium'
        };
    };
    
    OutilPartagerCarte.prototype = new Outil();
    OutilPartagerCarte.prototype.constructor = OutilPartagerCarte;
    
    OutilPartagerCarte.prototype.executer =  function () {
        var that=this;
        require(['libs/Ext.ux/statusbar/StatusBar', 'css!libs/Ext.ux/statusbar/css/statusbar'], function() {
            that.wizardSauvegarderContexte();
        });
    };
    
    
    // This is a shared function that simulates a load action on a StatusBar.
    OutilPartagerCarte.prototype.showBusy = function(statusBar, status, message) {
            statusBar = Ext.getCmp(statusBar);
            statusBar.setVisible( true );
            if( status === 'busy' ) {
                    statusBar.addClass('x-statusbar');
                    statusBar.showBusy();
            } else if( status === 'notbusy' ) {
                    statusBar.clearStatus();
                    statusBar.setStatus({text: message});
                    statusBar.addClass('x-statusbarSucces');
            } else { //erreur
                    statusBar.clearStatus();
                    statusBar.setStatus({text: message});
                    statusBar.addClass('x-statusbarErreur');
            };
    };

    OutilPartagerCarte.prototype.wizardSauvegarderContexte = function() {
        this.goSauvegardeContexteJSON = {};
        if(!this.windowWizardContexte) {
            this.frmWizardContexte = new Ext.form.FormPanel({
                labelWidth: 50,
                width: 600,
                height: 100,
                autoHeight: false,
                bodyStyle: 'padding:0 10px 0;',
                items: [{
                    id: 'msgLien',
                    width: 450,
                    xtype: 'textfield',
                    fieldLabel: 'Lien',
                    name: 'lien'
                }],
                buttons: [/*{
                    text: 'Ajouter au presse papier',
                    formBind: true,
                    id:'pressePapier',
                    handler: function(btn, e){
                        var lien = Ext.getCmp('msgLien');
                        var bCopied = ClipBoard( lien.getValue() );
                        if(!bCopied){
                            alert("Le lien n'a pu être ajouté au presse-papier parce que votre navigateur n'y a pas accès.  Vous pouvez changer cette configuration dans les options de votre navigateur.");
                        }
                    }
                },*/{
                    text: 'Ajouter aux favoris',
                    formBind: true,
                    id:'favoris',           
                    handler: function(btn, e){
                            var lien = Ext.getCmp('msgLien');
                            var bCopied = lien.getValue();
                            if (BrowserDetect.browser === "Explorer") { // IE Favorite
                                window.external.AddFavorite(bCopied, document.title);
                            }
                        }
                },{
                    text: 'Envoyer par courriel',
                    formBind: true,
                    handler: function() {
                        var lien = Ext.getCmp('msgLien');
                        location.href = "mailto:?body=" + escape(lien.getValue());
                    }
                },{
                    text: 'Fermer',
                    scope: this,
                    handler: function() {
                        this.windowWizardContexte.hide();
                    }
                }],
                bbar: new Ext.ux.StatusBar({
                    defaultText: '',
                    id: 'frmWizardContexte-statusbar',
                    busyText: 'Construction de l\'adresse...',
                    hidden: true,
                    hideMode: 'visibility'
                })//fin du bbar
                ,monitorValid: true
            });

            this.windowWizardContexte = new Ext.Window({
                title: 'Partager le contexte',
                autoHeight: true,
                width: 575,
                closeAction: 'hide',
                layout: 'fit',
                plain:true,
                bodyStyle:'padding:5px;',
                items: this.frmWizardContexte,
                modal: true
            });
        }
        
        var fav = Ext.getCmp('favoris');

        if (BrowserDetect.browser === "Explorer") {
            fav.setVisible(true);
        } else {
            fav.setVisible(false);
        }
        
        this.windowWizardContexte.show();

        this.showBusy('frmWizardContexte-statusbar', 'busy', 'construction de l\'adresse en cours');
        // Cet evenement popule la variable goSauvegardeContexteJSON avec le contexte de l'application
        //TODO getPanneauParType
        this.sauvegardeContexte();
    //nav.obtenirPanneauParId('carte-panneau')._getMapComponent().fireEvent('savecontext');
    //mapPanel.fireEvent('savecontext');

        // Ici, le contexte est envoyé au serveur pour la sauvegarde sur le disque
        //todo: remplacer url par 
        var url = Aide.utiliserProxy(this.options.service);
        Ext.Ajax.request({
            url: url,
            jsonData: Ext.util.JSON.encode(this.goSauvegardeContexteJSON),
            success: function(response) {
                var szContexteURL = '';
                if(response.responseText){
                    // Construire l'URL avec cet ID
                    szContexteURL = window.location.href;

                    // Ici on enlà¨ve le parametre id=... de l'URL
                    // TODO: Valider que cette vérification est assez
                    szContexteURL = szContexteURL.replace(/[?&]id=\w+/, '');
                    if(szContexteURL.indexOf('?') > 0){
                        szContexteURL += '&';
                    } else {
                        szContexteURL += '?';
                    }

                    var oJSON;
                    try {
                        oJSON= Ext.util.JSON.decode(response.responseText);
                    } catch(e){
                        this.erreurContexteRequete('La sauvegarde n\'a pas fonctionner. Veuillez réessayer plus tard.');
                    }
                    
                    if(oJSON && oJSON.length > 0 && oJSON[0] && oJSON[0].id) {
                        szContexteURL += 'id='+oJSON[0].id;
                    }
                }

                if(!szContexteURL) {
                    this.showBusy('frmWizardContexte-statusbar', 'notbusy', 'La sauvegarde n\'a pas fonctionner. Veuillez réessayer plus tard.');
                    return;
                }

                // Populer la boite de texte avec cet URL
                var lien = Ext.getCmp('msgLien');
                lien.setValue(szContexteURL);
                this.showBusy('frmWizardContexte-statusbar', 'notbusy', 'Utilisez l\'adresse suivante pour réouvrir le présent contexte de la carte.');
            },
            failure: function(e){
                this.erreurContexteRequete("L'utilisation de l'outil 'partager carte' n'est pas permise.<br>" + e.responseText);
            },
            scope: this
        });
    };

    OutilPartagerCarte.prototype.erreurContexteRequete = function(erreur) {
        Aide.afficherMessage("Outil indisponible", erreur);
        this.windowWizardContexte.hide();
        this.windowWizardContexte = undefined;
        this.desactiver();
    }
    
    // Fonction de sauvegarde contexte de base
    OutilPartagerCarte.prototype.sauvegardeContexte = function() {
        var options = {
            // Sauvegarde des informations de la carte
            'center':  [ this.carte.obtenirCentre().x, this.carte.obtenirCentre().y],
            'zoomlevel': this.carte.obtenirZoom(),

            // Sauvegarde des couches de base
            'layers':    this.getContexteDesCouches()
        };

        this.goSauvegardeContexteJSON = OpenLayers.Util.applyDefaults(options, this.goSauvegardeContexteJSON);
    };

    // Fonction qui retourne l'information à  sauvegarder sur les couches
    OutilPartagerCarte.prototype.getContexteDesCouches = function() {
        var listeCouches = [];

        // Pour chaque couches, extraire les infos intéressantes
        //TODO tilisation de IGO
        //for(var i=0; i<Aide.obtenirNavigateur().carte.obtenirCouches().length; i++)
        for(var i=0; i<this.carte._carteOL.getNumLayers(); i++) {
            //var couche = Aide.obtenirNavigateur().carte.obtenirCouches()[i];
            var couche = this.carte._carteOL.layers[i];
            listeCouches[i] = {
                //'name': couche.options.nom,
                'name': couche.name,
                'visibility': couche.getVisibility(),
                'opacity': couche.opacity,
                'index': Aide.obtenirNavigateur().obtenirPanneauxParType('PanneauCarte')[0]._getMapComponent().map.getLayerIndex(couche)
            };

            if(couche.options.group){
                listeCouches[i].group = couche.options.group;
            }

            
            //if(couche.options.typecontexte && couche.options.typecontexte == 'ajout'){
            if(couche.options.typeContexte != 'contexte'){
                listeCouches[i].wmsurl = couche.url;
                listeCouches[i].wmsparams = couche.params;
                listeCouches[i].wmsoptions = couche.options;
            }
        }
        return listeCouches;
    };
    
    
    
    
    //Fonction pour charger un contexte et changer les couches
    /*OutilPartagerCarte.prototype.setContexteDesCouches = function(contexte){
        if(contexte.length <= 0){
            return;
        }

        // Boucle sur les couches du contexte
        for(var i=0; i<contexte.length; i++){
            var coucheContexte = contexte[i];
            
            // Trouver la màªme couche dans la carte
            var coucheCarte = Aide.obtenirNavigateur().obtenirPanneauxParType('PanneauCarte')[0]._getMapComponent().map.getLayersByName(coucheContexte.name);
            if(coucheCarte && coucheCarte.length >= 1) {
                if( coucheCarte.length == 1 ){
                    coucheCarte= coucheCarte[0];
                } else {		
                    var trouveCoucheCarte = null;
                    //Il peut y avoir plusieurs layers avec le même nom mais dans des groupes différents dans l'Arbre
                    for(var j=0; j<coucheCarte.length; j++) {
                        if( coucheCarte[j].name == coucheContexte.name && coucheCarte[j].group == coucheContexte.group ){
                                trouveCoucheCarte = coucheCarte[j];
                                break;
                        }
                    }
                    coucheCarte = trouveCoucheCarte;
                }
            } else {
                coucheCarte = null;
            }

            if(coucheCarte) {
                // Changer la visibilité
                if(coucheCarte.isBaseLayer && coucheContexte.visibility) {
                    Aide.obtenirNavigateur().obtenirPanneauxParType('PanneauCarte')[0]._getMapComponent().map.setBaseLayer(coucheCarte);
                } else {
                    coucheCarte.setVisibility(coucheContexte.visibility);
                    
                    // Fermer les couches de base lorsque d'autres couches sont visibles
                    if(coucheContexte.visibility == true && !coucheCarte.isBaseLayer) {
                            //TODO 
                            //var tree = Ext.getCmp('tree_panneau');
                            //var tree=nav.obtenirPanneauParId('menu-panneau').obtenirPanneauParId('tree_panneau')._getPanel();
                            //var nodeCoucheDeBase = tree.getRootNode().findChild("text", 'Couches de base');
                            //if( !nodeCoucheDeBase )//si browser anglais
                            //	nodeCoucheDeBase = tree.getRootNode().findChild("text", 'Base layers');
                            //if(nodeCoucheDeBase && nodeCoucheDeBase.isExpanded()) {
                            //	nodeCoucheDeBase.collapse();
                            //}
                    }
                }

                // Changer l'opacité
                if(!coucheCarte.isBaseLayer && coucheContexte.opacity) {
                    coucheCarte.setOpacity(coucheContexte.opacity);
                }

                // Changer le groupe
                if(coucheContexte.group && coucheCarte.options.group != coucheContexte.group) {
                    //todo: detecter que le panneau arborescence est chargé...
                    var tree = Ext.getCmp('tree_panneau');
                    var oldParent = tree.getNodeById('layercontainer_'+coucheCarte.options.group);
                    var newParent = tree.getNodeById('layercontainer_'+coucheContexte.group);

                    coucheCarte.options.group = coucheContexte.group;

                    // Il faut s'assurer que l'arbre ce redessine avec les bons noeuds.
                    if(oldParent && oldParent.isExpanded()) {
                            oldParent.reload();//render
                    }
                    if(newParent && newParent.isExpanded()) {
                            newParent.reload();
                    }
                }
            };

            
            // Dans certain cas, il faut ajouter la couche manuellement
            if(!coucheCarte && coucheContexte && coucheContexte.wmsurl) {

                var coucheAjouter = new OpenLayers.Layer.WMS(coucheContexte.name, 
                                                             coucheContexte.wmsurl, 
                                                             coucheContexte.wmsparams, 
                                                             coucheContexte.wmsoptions);
                // Ajout et configuration de la couche
                var coucheIGO = new WMS({layerOL:coucheAjouter});
                this.carte.gestionCouches.ajouterCouche(coucheIGO);
                coucheIGO._layer.setVisibility(coucheContexte.visibility);
                this.carte._carteOL.setLayerIndex(coucheAjouter, coucheContexte.index);
                
                // Changer l'opacité
                if(!coucheAjouter.isBaseLayer && coucheContexte.opacity) {
                    coucheAjouter.setOpacity(coucheContexte.opacity);
                }
            }
        }//fin du for
     
        //OnGolocContextLoaded();
    };


   OutilPartagerCarte.prototype.loadContexte = function(){
      //TODO: Neccessite de sauvegarder la config xml
        var idContexte = Aide.obtenirParametreURL('id');
        if (idContexte) {
            var url = this.options.service + '?id='+idContexte;
            Ext.Ajax.request({
                url: Aide.utiliserProxy(url),
                success: function(response) {
                    var contexteFailed = false;
                    if(!response.responseText) {
                        contexteFailed = true;
                        return;
                    }

                    var oJSON = Ext.util.JSON.decode(response.responseText);
                    if(oJSON && oJSON !== "") {
                        this.appliquerContexte(oJSON);
                    } else {
                        contexteFailed = true;
                    }

                    if(contexteFailed && this.options.defaultIdContexte != null) {
                        Ext.Ajax.request({
                            url: url+this.options.defaultIdContexte,
                            success: function(response) {
                                if(!response.responseText) {
                                    return;
                                }
                                var oJSON = Ext.util.JSON.decode(response.responseText);
                                if(oJSON && oJSON != "") {
                                    this.appliquerContexte(oJSON);
                                }
                            },
                            scope: this
                        });
                    }
                },
                scope: this
            });
        }
    };
    
    // Fonction de chargement de contexte de base
     OutilPartagerCarte.prototype.appliquerContexte = function(contexte) {
        if(!contexte) {
            return;
        }

        var ignoreMapPosition = false;
        if(typeof golocOptions != 'undefined' && 'ignore_contexte_map_position' in golocOptions) {
                ignoreMapPosition = golocOptions['ignore_contexte_map_position'];
        }

        // Chargement de chaque élément individuellement
        if(contexte.center && contexte.center.length == 2 && contexte.zoomlevel && !ignoreMapPosition){
            this.carte.definirCentre(contexte.center);
            this.carte.definirZoom(contexte.zoomlevel);
        }

        if(contexte.layers) {
            this.setContexteDesCouches(contexte.layers);
        }

        Aide.obtenirNavigateur().obtenirPanneauxParType('PanneauCarte')[0]._getMapComponent().fireEvent('loadcontext', contexte);
    };*/

    return OutilPartagerCarte;
    
});
