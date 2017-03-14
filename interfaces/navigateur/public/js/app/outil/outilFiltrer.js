/**
 * Module pour l'objet {@link ContexteMenu.wmsfilters}.
 * @module outilFiltrer
 * @author Michael Lane sur forte inspiration de wmsfilters de Thyn Bos (LGS-SYGIF)
 * @version 1.0
 * @requires aide, outil
 * @dependance modification couche.js pour afficher l'icône de filtre
 *                          interfaces\navigateur\public\images\app\filter.png
 *                          igo\modules\wmsfilters
 *                          igo\xml
 *                          Tag  filter="true" sur la couche
 */     

define(['aide', 'outil'], function (Aide, Outil) {
    
    function OutilFiltrer(options) {
        this.options = options || {};      
        this._init();
    };

    OutilFiltrer.prototype = new Outil();
    OutilFiltrer.prototype.constructor = OutilFiltrer;

    OutilFiltrer.prototype.getAide = function () {
        return  "1-> Choisir les attributs et leurs valeurs possibles pour chaque couche.<br>";
    };
    
    OutilFiltrer.prototype._init = function() {
        Outil.prototype._init.call(this);
        this._ajoutCallback(this,this._apresAffichage);
    };
    
    /**
     * Action d'après affichage permettant de gérer le menu filtre dans le menu contextuelle des couches
     * @method
     * @private
     * @name OutilFiltrer#_apresAffichage
     */
    OutilFiltrer.prototype._apresAffichage = function() {
        
        var that = this;
        
        var nav = Aide.obtenirNavigateur();

        var arbo = nav.obtenirPanneauxParType('Arborescence', 3)[0];
        if (arbo) {
            this.ajouterContexteSubmenu(arbo.contexteMenu);
            return true;
        }

        if (!nav.evenements.obtenirDeclencheur('initArborescence', 'filtrerAjouterContexteSubmenu').length) {
            nav.evenements.ajouterDeclencheur('initArborescence', function (e) {
                that.ajouterContexteSubmenu(e.target.contexteMenu);
                nav.evenements.enleverDeclencheur('initArborescence', 'filtrerAjouterContexteSubmenu');
            }, {id: 'filtrerAjouterContexteSubmenu'});
        }
        
        this.definirExtraParams();
    };

    /**
     * Obtenir la liste des filtres disponible pour la couche
     * @param {string} nomCouche Nom de la couche cliquée
     * @method
     * @name OutilFiltrer#obtenirListeFiltres
     */
    OutilFiltrer.prototype.obtenirListeFiltres = function (nomCouche) {

        var that = this;

        var tabFiltre = [];
        var tabObjAttributFiltre = [];
        var lstCouchesConfigWMSFilters;       
        
        //Obtenir la liste des layer du tag wmsfilters de la config XML        
        var lstConfigWMSFilters = Aide.obtenirConfigXML('wmsfilters');
        
        if(typeof lstConfigWMSFilters !== "undefined" &&  typeof lstConfigWMSFilters.layer !== "undefined") {
            lstCouchesConfigWMSFilters = lstConfigWMSFilters.layer;
        }
        else {
            return false;
        }

        //Pour chaque definition de filtre
        $.each(lstCouchesConfigWMSFilters, function (key, defCoucheFiltreXML) {
            if (!$.isEmptyObject(defCoucheFiltreXML)) {

                var layerNom;
                var layerBackend;
                var layerFrontend;

                if ($.isPlainObject(defCoucheFiltreXML)) {
                    layerNom = defCoucheFiltreXML["@attributes"].nom;
                    layerBackend = defCoucheFiltreXML["@attributes"].backend;
                    layerFrontend = defCoucheFiltreXML["@attributes"].frontend;                    
                }
                
                //Obtenir les filtres seulement pour la couche cliquée
                if(layerNom !== nomCouche) {
                    return true;
                }                   

                $.each(defCoucheFiltreXML, function (index, defFiltreXML) {
                    var filtres = that.ajouterFiltres(tabObjAttributFiltre, layerNom, layerBackend , layerFrontend , defFiltreXML);
                    if (typeof filtres !== "undefined") {
                        $.each(filtres, function (key1, defFiltreXML) {
                            //filtre unique
                            if ($.isPlainObject(defFiltreXML) && defFiltreXML["@attributes"]) {
                                that.ajouterAttribut(tabObjAttributFiltre, filtres.nom, filtres.comboUrl, filtres.childUrl, defFiltreXML);
                            }
                            //filtres multiples
                            if ($.isArray(defFiltreXML)) {
                                $.each(defFiltreXML, function (key2, defFiltreXML) {
                                    if ($.isPlainObject(defFiltreXML)) {
                                        that.ajouterAttribut(tabObjAttributFiltre, filtres.nom, filtres.comboUrl,filtres.childUrl, defFiltreXML);
                                    }
                                });
                            }
                            //pour un seul layer filtre unique
                            if (defFiltreXML.filtre) {
                                that.ajouterAttribut(tabObjAttributFiltre, filtres.nom, filtres.comboUrl, filtres.childUrl, defFiltreXML.filtre);
                            }
                            //pour un seul layer avec filtres multiple
                            if ($.isArray(defFiltreXML.filtre)) {
                                $.each(defFiltreXML.filtre, function (key2, defFiltreXML) {
                                    if ($.isPlainObject(defFiltreXML)) {
                                        that.ajouterAttribut(tabObjAttributFiltre, filtres.nom, filtres.comboUrl,filtres.childUrl, defFiltreXML);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        tabFiltre.push(new Ext.FormPanel({
            labelWidth: 100,
            frame: true,
            border: false,
            bodyStyle: 'padding:5px 5px 0',
            scope: this,
            items: [tabObjAttributFiltre]
        }));

        return  tabFiltre;
    };

    
    OutilFiltrer.prototype.ajouterFiltres = function (tabObjAttributFiltre, layerNom, layerBackend, layerFrontend , defFiltreXML) {

        if (typeof layerNom === "undefined"){
            layerNom = defFiltreXML["@attributes"].nom;
        }

        if (typeof layerBackend === "undefined") {
            layerBackend = defFiltreXML["@attributes"].backend;
        }

        if (typeof layerFrontend === "undefined") {
            layerFrontend = defFiltreXML["@attributes"].frontend;
        }

        var filtre;
        var lstComboUrl =  Aide.obtenirConfig('uri.api') + "wmsfilters/filter/" + layerBackend;
        var fltrComboUrl =  Aide.obtenirConfig('uri.api') + "wmsfilters/filter/" + layerFrontend;

        var nav = Aide.obtenirNavigateur();
        var couches = nav.carte.gestionCouches.obtenirCouchesParNom(layerNom);

        if (!couches[0]){
            var szErrMsg = "Veuillez mettre un nom de couche connu dans votre xml. La couche: " + layerNom + " n'existe pas parmi vos couches.";
            Aide.afficherMessageConsole("Erreur Modules OutilFiltrer: " + szErrMsg);
            return;
        }

        if (couches.length > 1){
            var szErrMsg = "Veuillez mettre un nom de couche unique dans votre xml. La couche: " + layerNom + " n'est pas unique parmi vos couches.";
            Aide.afficherMessageConsole("Erreur Modules OutilFiltrer: " + szErrMsg);
            return;
        }

        if (typeof couches[0].options.filter === "undefined"){
            couches[0].options.filter = true;
        }

        if (defFiltreXML.filtres) {
            filtre = defFiltreXML.filtres.filtre;
        } else {
            filtre = defFiltreXML;
        }

        return {filtres: filtre,
            nom: layerNom,
            comboUrl: lstComboUrl,
            childUrl : fltrComboUrl};
    };

    OutilFiltrer.prototype.ajouterAttribut = function (tabObjAttributFiltre, layerNom, lstComboUrl, fltrComboUrl, value) {

        var that = this;

        var fil = value["@attributes"] || value;
        var label = fil.texte || fil.attribut;
        var child = fil.child || fil.attribut;
        var childlabel = fil.childtexte || fil.attribut;

        var nav = Aide.obtenirNavigateur();
        var couches = nav.carte.gestionCouches.obtenirCouchesParNom(layerNom);

        if (fil.attribut !== "undefined") {
            //Cas ou les extraParams sont pas défini pour un filtre
            if (couches[0].options.filter) {
               
                if(typeof couches[0]._layer.mergeNewParams === 'undefined'){
                  //pour wfs mapserver
                  couches[0]._layer.protocol.options.url = couches[0]._layer.protocol.options.url  + "&" + fil.attribut + "=" + fil.defaut;
                }
                else{
                  couches[0]._layer.mergeNewParams(JSON.parse("{\"" + fil.attribut + "\":" + "\"" + fil.defaut + "\"" + "}"));
                }
            }

            tabObjAttributFiltre.push({
                xtype: 'combo',
                id: layerNom + fil.attribut,
                fieldLabel: label,
                labelStyle: ' white-space: nowrap;width: 200px;height:25px;',
                field_id: fil.attribut,
                store: that.creerSimpleStore(lstComboUrl, fil.attribut, fil.child),
                valueField: 'value',
                value: fil.defautTexte?fil.defautTexte:fil.defaut,
                emptyText: 'Selection... ' ,
                width: 175,
                displayField: 'text',
                editable: false,
                mode: 'remote',
                triggerAction: 'all',
                lazyRender: true,
                lazyInit: false,
                listWidth: 350,
                hidden: false,
                listeners: {
                    select: function (combo, record, index) {
                        if (typeof fil.child !== "undefined") {
                            var geoStorage = Ext.getCmp(layerNom + fil.child);
                            geoStorage.clearValue();
                            geoStorage.getStore().proxy.setUrl(fltrComboUrl +  '/' + child + '/' +  combo.getValue(), true);
                            geoStorage.getStore().load();
                            geoStorage.setDisabled(false);
                        }
                        that.ajouterExtraParams(combo);
                    }
                }
            });

            if (typeof fil.child !== "undefined") {
                tabObjAttributFiltre.push({
                    xtype: 'combo',
                    id: layerNom + fil.child,
                    fieldLabel:childlabel,
                    labelStyle: ' white-space: nowrap;width: 200px;height:25px;',
                    field_id: fil.child,
                    hiddenName: 'geoId',
                    hidden: false,
                    store: that.creerSimpleStore(lstComboUrl, fil.attribut, fil.child),
                    emptyText: 'Selection... ' ,
                    displayField: 'text',
                    disabled: true,
                    valueField: 'value',
                    typeAhead: true,
                    forceSelection: true,
                    triggerAction: 'all',
                    mode: 'local',
                    listWidth: 350,
                    editable: false,
                    listeners: {
                        select: function (combo, record, index) {
                            that.ajouterExtraParams(combo);
                        }
                    },
                    width: 175,
                    maxLength: 50,
                    selectOnFocus: true
                });
            }
        }
        return fil;
    };


    OutilFiltrer.prototype.ajouterExtraParams = function (combo) {

        var nav = Aide.obtenirNavigateur();
        var couches = nav.carte.gestionCouches.obtenirCouchesParNom(combo.id.replace(combo.field_id, ''));
        var val = combo.value;
        if(typeof combo.value === 'string'){
          val = combo.value.replace(/'/g, "\''");
        }

        if(typeof couches[0]._layer.mergeNewParams === 'undefined'){
          //pour wfs mapserver
          var re = new RegExp("(&"+combo.field_id.trim()+"=)([^&]*)");
          couches[0]._layer.protocol.options.url = couches[0]._layer.protocol.options.url.replace(re, '$1'+val+'&');
        }else{
          couches[0]._layer.mergeNewParams(JSON.parse("{\"" + combo.field_id.trim() + "\":" + "\"" + val + "\"" + "}"));
        }
        
        this.definirIndicateurFiltreActif(couches[0]);
        
        
    };


    OutilFiltrer.prototype.creerSimpleStore = function (url, attribut, child) {

        return new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            proxy: new Ext.data.HttpProxy({
                url: url + '/' + attribut + '/' + child,
                method: 'GET'
            })
        });
    };

    OutilFiltrer.prototype.ajouterContexteSubmenu = function (contexteMenu) {
            
        var that = this;    
        if (contexteMenu._filtrerBool) {
            return true;
        }
        contexteMenu._filtrerBool = true;                                    

        contexteMenu.ajouter({
            id: 'arborescenceFiltrer',
            titre: 'Filtrer la couche',
            action: function (el) {
                
                var contexte = el.couche;     
                
                if(typeof contexte.fenetreFiltreCouche === "undefined")
                {
                    el.couche.fenetreFiltreCouche = new Ext.Window({
                        id     : 'fenetreFiltreCouche' + contexte.id,
                        title  : "Filtrer la couche "+ contexte.options.titre,
                        autoHeight : true,
                        width: 450,
                        items  : [that.obtenirListeFiltres(contexte.options.nom)],
                        listeners: 
                                {
                                    beforeclose: function(){
                                        contexte.fenetreFiltreCouche.hide();
                                        return false;
                                    }
                        },
                        buttons: [ {
                            text:'Fermer',
                            handler: function(){
                                contexte.fenetreFiltreCouche.hide();
                            }
                        },
                        {
                            text: 'Réinitialiser',
                            handler: function(e,b,c,d) {
                                
                                //Pour chaque combobox du filtre, réinitialiser les valeurs
                                var lstCombobox = contexte.fenetreFiltreCouche.items.items[0].items.items;
                                $.each(lstCombobox, function(index, combo)
                                {
                                    if(typeof combo.getStore().data.items[0] !== "undefined") {
                                        combo.setValue("");
                                        that.ajouterExtraParams(combo);
                                    }
                                });
                                
                                that.reinitialiserIndicateurFiltreActif(el.couche);
                            }
                        }]
                    });
                }
                
                contexte.fenetreFiltreCouche.show();   

            },
            condition: function (args) {
                //return (args.couche.obtenirTypeClasse() === 'WMS' && args.couche.options.filter && args.couche.options.extraParams);
                return that.verifierAFiltre(args);
            },
            position: 3
        });

    };      
    
    /**
     * Vérifier si la couche a un filtre disponible
     * @method
     * @param args Objet de la condition du menu contextuelle de la couche
     * @name OutilFiltrer#verifierAFiltre
     */
    
    OutilFiltrer.prototype.verifierAFiltre = function(args) {   
        
        if(args.couche.obtenirTypeClasse() === 'WMS' && args.couche.options.filter && typeof args.couche.options.extraParams !== "undefined" && args.couche.options.extraParams === true) {
            return true;
        }
        else {        
            return false;
        }
    };
    
    /**
     * Définir le tag extraParams à true si la couche à un option de filtre disponible
     * @method
     * @name OutilFiltrer#definirExtraParams
     * @returns {Boolean}
     */
    OutilFiltrer.prototype.definirExtraParams = function() {
        var lstCouchesConfigWMSFilters;
        var lstConfigWMSFilters = Aide.obtenirConfigXML('wmsfilters');
        
        if(typeof lstConfigWMSFilters !== "undefined" &&  typeof lstConfigWMSFilters.layer !== "undefined") {
            lstCouchesConfigWMSFilters = lstConfigWMSFilters.layer;
        }
        else {
            return false;
        }
        
        $.each(lstCouchesConfigWMSFilters, function(index, defCoucheFiltreXML) {
           
            if(defCoucheFiltreXML["@attributes"].nom) {
                var couche;
                var lstCouche = Aide.obtenirNavigateur().carte.gestionCouches.obtenirCouchesParNom(defCoucheFiltreXML["@attributes"].nom);
                
                if(lstCouche.length > 0) {
                    couche = lstCouche[0];
                    couche.options.extraParams = true;
                }        
            } 
        });
    };
    
    /**
     * Définir l'indicateur de filtre actif
     * @method
     * @name OutilFiltrer#definirIndicateurFiltreActif
     * @param {Couche} couche Objet de type couche
     */
    OutilFiltrer.prototype.definirIndicateurFiltreActif = function(couche) {
        var div = couche.obtenirElementDivArbo();
        var image = $(div).find(".layerArboGetFiltre")[0];
        if(typeof image !== "undefined") {        
            image.src = Aide.utiliserBaseUri("images/app/filter_red.png");
        }
    };
    
    /**
     * Réinitialiser l'indicateur de filtre actif
     * @method
     * @name OutilFiltrer#reinitialiserIndicateurFiltreActif
     * @param {Couche} couche Objet de type couche
     */
    OutilFiltrer.prototype.reinitialiserIndicateurFiltreActif = function(couche) {
        var div = couche.obtenirElementDivArbo();
        var image = $(div).find(".layerArboGetFiltre")[0];
        if(typeof image !== "undefined") {   
            image.src = Aide.utiliserBaseUri("images/app/filter_blue.png");
        } 
    };    

    return OutilFiltrer;

});
