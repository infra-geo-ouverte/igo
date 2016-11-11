define(['aide', 'WMS'], function(Aide, WMS) {
    function Contexte(options){
        this.defautOptions = $.extend({}, this.defautOptions, Aide.obtenirConfig(this.obtenirTypeClasse()));
        this.options = $.extend({}, this.defautOptions, this.options);
    };
    
    Contexte.prototype.charger = function(){
      //TODO: Neccessite de sauvegarder la config xml
      //todo: besoin de arborescence...le rendre indépendant...
        var idContexte = Aide.obtenirParametreURL('id') || this.options.contexte;
        if (idContexte) {
            this.carte = Aide.obtenirNavigateur().carte;
            var url = this.options.service + '?id='+idContexte;
            Ext.Ajax.request({
                url: Aide.utiliserProxy(url),
                success: function(response) {
                    if(!response.responseText) {
                        return;
                    }
                    var oJSON = Ext.util.JSON.decode(response.responseText);
                    if(oJSON && oJSON !== "") {
                        this.appliquerContexte(oJSON);
                    }
                },
                scope: this
            });
        }
    };

    // Fonction de chargement de contexte de base
     Contexte.prototype.appliquerContexte = function(contexte) {
        if(!contexte) {
            return;
        }

        // Chargement de chaque élément individuellement 
        if(contexte.center && contexte.center.length == 2 && contexte.zoomlevel && !this.options.ignorePosition){
            this.carte.definirCentre(contexte.center);
            this.carte.definirZoom(contexte.zoomlevel);
        }

        if(contexte.layers) {
            this.setContexteDesCouches(contexte.layers);
        }

  //      Aide.obtenirNavigateur().obtenirPanneauxParType('PanneauCarte')[0]._getMapComponent().fireEvent('loadcontext', contexte);
    };


    //Fonction pour charger un contexte et changer les couches
    Contexte.prototype.setContexteDesCouches = function(contexte){
        if(contexte.length <= 0){
            return;
        }

        // Boucle sur les couches du contexte
        for(var i=0; i<contexte.length; i++){
            var coucheContexte = contexte[i];
            
            // Trouver la même couche dans la carte
            var coucheCarte = this.carte.gestionCouches.obtenirCouchesParTitre(coucheContexte.name);
            if(coucheCarte) {
                var trouveCoucheCarte = null;
                //Il peut y avoir plusieurs layers avec le même nom mais dans des groupes différents dans l'Arbre
                for(var j=0; j<coucheCarte.length; j++) {
                    if(coucheCarte[j].options.groupe == coucheContexte.group ){
                        trouveCoucheCarte = coucheCarte[j];
                        break;
                    }
                }
                coucheCarte = trouveCoucheCarte;
            } else {
                coucheCarte = null;
            }
            
            if(coucheCarte) {
                // Changer la visibilité
                coucheCarte.activer(coucheContexte.visibility);

                // Changer l'opacité
                if(coucheContexte.opacity) {
                    coucheCarte.definirOpacite(coucheContexte.opacity);
                }

                // Changer le groupe
                if(coucheContexte.group && coucheCarte.options.groupe != coucheContexte.group) {
                    var nav = Aide.obtenirNavigateur();
                    var arborescence = nav.obtenirPanneauxParType('Arborescence')[0];
                    if (!arborescence){
                        var menu = nav.obtenirPanneauxParType('PanneauMenu');
                        for(var j=0; j<menu.length; j++) {
                            arborescence = menu[j].obtenirPanneauxParType('Arborescence')[0];
                            if(arborescence){
                                break;
                            }
                        }
                    }
                    var tree = arborescence._panel; //Ext.getCmp('tree_panneau');
                    var oldParent = tree.getNodeById('layercontainer_'+coucheCarte.options.groupe);
                    var newParent = tree.getNodeById('layercontainer_'+coucheContexte.group);

                    coucheCarte.options.groupe = coucheContexte.group;

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
                coucheIGO.activer(coucheContexte.visibility);
                coucheIGO.definirOrdreAffichage(coucheContexte.index);
                
                // Changer l'opacité
                if(coucheContexte.opacity) {
                    coucheIGO.definirOpacite(coucheContexte.opacity);
                }
            }
        }
    };
    
        /**
    * Obtenir le type de la classe
    * @method
    * @name Contexte#obtenirTypeClasse
    * @returns {String} Type de la classe
    */
    Contexte.prototype.obtenirTypeClasse = function(){
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };

    return Contexte;
});

