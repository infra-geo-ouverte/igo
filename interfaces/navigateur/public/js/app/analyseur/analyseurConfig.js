/**
 * Module pour l'objet {@link AnalyseurConfig}.
 * @module analyseurConfig
 * @requires aide
 * @requires navigateur
 * @requires carte
 * @requires contexte
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['aide', 'navigateur', 'carte', 'contexte', 'evenement', 'serveur'], function(Aide, Navigateur, Carte, Contexte, Evenement, Serveur) {
    /**
     * Création de l'object AnalyseurConfig.
     * @constructor
     * @name AnalyseurConfig
     * @class AnalyseurConfig
     * @alias analyseurConfig:AnalyseurConfig
     * @requires analyseurConfig
     * @param {object} options Liste des options possibles
     * @param {object | string} [options.configuration='defaut'] La
     * configuration dans le format json en paramètre ou appelle l'api
     * ([api]/configuration/[options.configuration]) pour obtenir
     * le json ou le xml.  (voir la documentation du XML)
     * @param {string} [options.configuration] todo: à complèter
     * @param {function} [options.callback] Function appelée lorsque l'initialisation
     * du navigateur est terminé.
     * @returns {AnalyseurConfig} Instance de {@link AnalyseurConfig}
    */
    function AnalyseurConfig(options) {
        this.options = options || {};
        this.defautOptions = {
            configuration: 'defaut'
        };
        this.fin = {};
        this._init();
        this.igo = {};
    };


    /**
     * Initialisation de l'object AnalyseurConfig.
     * @method
     * @private
     * @name AnalyseurConfig#_init
    */
    AnalyseurConfig.prototype._init = function() {
        this.options = $.extend({}, this.defautOptions, this.options);
    };

    /**
     * Sert à charger le navigateur selon la configuration donnée lors de la création de {@link AnalyseurConfig}.
     * Si la configuration est un string, appelle l'api ([api]/configuration/[options.configuration]) pour obtenir
     * le json ou le xml.
     * @method
     * @name AnalyseurConfig#charger
     * @returns {Navigateur} Le navigateur construit: @link Navigateur
    */
    AnalyseurConfig.prototype.charger = function() {
        this.avertissements = this.options.avertissements ? [this.options.avertissements] : [];
        if ($.isPlainObject(this.options.configuration)) {
            this._chargementConfigSuccess(this.options.configuration);
        } else if (this.options.configuration && Aide.obtenirConfig('uri.api')){
            var url = Aide.obtenirConfig('uri.api')+"configuration/" + this.options.configuration;
            $.ajax({
                url: url,
                data: {
                    mode: Aide.obtenirParametreURL('mode')
                },
                context: this,
                success: function(data){
                    this._chargementConfigSuccess(data);
                },
                error: this._chargementConfigError,
                async: false,
                dataType: 'json'
            });
        }
        return this.igo;
    };

    /**
     * Fonction appelée si l'api retourne un erreur lors de l'obtention de la configuration.
     * Affiche les erreurs obtenues.
     * @method
     * @private
     * @name AnalyseurConfig#_chargementError
    */
    AnalyseurConfig.prototype._chargementConfigError = function(XMLHttpRequest, textStatus, errorThrown) {
        $("#igoLoading").remove();
        var message = XMLHttpRequest.responseJSON ? XMLHttpRequest.responseJSON.error : undefined;
        if(!message){message = "Erreur lors du chargement de la configuration XML. (" + textStatus +")";}
        Aide.afficherMessage("Erreur chargement de la configuration XML", message, null, 'ERROR');
    };

    /**
     * Fonction appelée si la configuration est obtenue.
     * @param {object} config La configuration en format json ou xml
     * @method
     * @private
     * @name AnalyseurConfig#_chargementConfigSuccess
    */
    AnalyseurConfig.prototype._chargementConfigSuccess = function(config) {
        var that=this;
        if (this.dataType == 'xml') {
            config = this._xml2Json(config).root;
        }
        Aide.definirConfigXML(config);
        var presentation = config.presentation || {};
        this.avertissements.concat(config.avertissements);

        this.chargerContexte(0);
        this._analyserActions(config.actions);
        this._analyserPanneaux(presentation.panneaux);
        this._analyserOutils(presentation.outils);
    };


    AnalyseurConfig.prototype.chargerContexte = function(index) {
        var that=this;
        var config = Aide.obtenirConfigXML();
        var contexte = config.contexte || {};
        contexte = $.isArray(contexte) ? contexte[index] : contexte;
        var couchesApp = config.couches || [];
        var groupeCouches = [];
        if (couchesApp) {
            var cAttributs = couchesApp["@attributes"] || couchesApp["attributs"];
            if(couchesApp.couche){
                groupeCouches.push({"@attributes": cAttributs, couche: couchesApp.couche});
            }
            var c1 = couchesApp["groupe-couches"];
            if(c1){
                var c2 = $.isArray(c1) ? c1 : [c1];
                $.each(c2, function(key, value){
                    if(value["attributs"]){
                        value["attributs"] = $.extend({}, cAttributs, value["attributs"]);
                    } else {
                        value["@attributes"] = $.extend({}, cAttributs, value["@attributes"]);
                    }
                });
                groupeCouches = groupeCouches.concat(c2);
            }
        }
        this.contexteAttributs = {};
        if(contexte){
            var couchesContexte = contexte.couches || contexte || [];
            if (couchesContexte) {
                var cAttributs = couchesContexte["@attributes"] || couchesContexte["attributs"];
                if(couchesContexte.couche){
                    groupeCouches.push({"@attributes": cAttributs, couche: couchesContexte.couche});
                }
                var c1 = couchesContexte["groupe-couches"];
                if(c1){
                    var c2 = $.isArray(c1) ? c1 : [c1];
                    $.each(c2, function(key, value){
                        if(value["attributs"]){
                            value["attributs"] = $.extend({}, cAttributs, value["attributs"]);
                        } else {
                            value["@attributes"] = $.extend({}, cAttributs, value["@attributes"]);
                        }
                    });
                    groupeCouches = groupeCouches.concat(c2);
                }
            }
            this.contexteAttributs = contexte["@attributes"] || contexte["attributs"] || {};
        }

        if(!this.igo.nav){
            this.igo.nav = new Navigateur(new Carte(this.contexteAttributs), Aide.obtenirConfigXML("attributs"));
            this.igo.nav.analyseur = this;
            this.igo.nav.evenements = new Evenement();
            if(Aide.obtenirConfigXML('client')){
                new Serveur();
            }
            this._analyserCouches(groupeCouches);
        } else {
            Aide.afficherMessageChargement({titre: "Chargement des couches"});

            require(['point'], function(Point){
                if (that.contexteAttributs.centre){
                    var x,y;
                    var centre = that.contexteAttributs.centre.split(/[,;]/);
                    x = centre[0];
                    y = centre[1];
                    var centreProj = centre[2];
                    var igoPoint = new Point(x,y,centreProj);
                    if(centreProj){
                        igoPoint = igoPoint.projeter(that.igo.nav.carte.obtenirProjection());
                    }
                    that.igo.nav.carte.centrer(igoPoint);
                };
                if(that.contexteAttributs.zoom){
                    that.igo.nav.carte.zoomer(that.contexteAttributs.zoom);
                }

                that.igo.nav.carte.gestionCouches.enleverToutesLesCouches();
                that._analyserCouches(groupeCouches);
            });
        }
    }

    /**
     * Convertie la configuration xml en json.
     * @param {object} xml Configuration dans le format xml.
     * @method
     * @private
     * @name AnalyseurConfig#_chargementConfigSuccess
     * @returns {object} Configuration dans le format json
    */
    AnalyseurConfig.prototype._xml2Json = function(xml) {
        var obj = {};
        if (xml.nodeType == 1) {
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) {
            obj = xml.nodeValue;
        }
        if (xml.hasChildNodes()) {
            //obj['@enfants'] = [];
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                var itemJson;
                if (typeof (obj[nodeName]) == "undefined") {
                    itemJson = this.xml2Json(item);
                    obj[nodeName] = itemJson;
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    itemJson = this.xml2Json(item);
                    obj[nodeName].push(itemJson);
                }
                /*if(nodeName.substr(0,1).search(/[#@]/) === -1){
                 obj['@enfants'].push({tag: nodeName ,elements: itemJson});
                 }*/
            }
        }
        return obj;
    };

    /**
     * Obtenir les modules requis pour le json en paramètre
     * @param {object} json Partie de la configuration à analyser
     * @param {tableau} [modulesReq = []] Tableau des modules requis
     * @param {entier} [niveauForage = 1] Nombre de niveau du json à analyser
     * @method
     * @private
     * @name AnalyseurConfig#_analyserRequire
     * @returns {array} Tableau des modules requis
    */
    AnalyseurConfig.prototype._analyserRequire = function(json, modulesReq, niveauForage) {
        var that = this;
        niveauForage = niveauForage || 1;
        modulesReq = modulesReq || [];
        if (!json) {
            return modulesReq;
        }
        ;

        if ($.isArray(json)) {
            $.each(json, function(key, value) {
                modulesReq = that._analyserRequire(value, modulesReq, niveauForage);
            });
            return modulesReq;
        }

        $.each(json, function(key, propriete) {
            if (key.substr(0, 1).search(/[#@]/) !== -1) {
                return true;
            }
            propriete = $.isArray(propriete) ? propriete : [propriete];
            $.each(propriete, function(key, enfant) {
                var attributs = enfant["@attributes"] || enfant["attributs"];
                if (attributs && (attributs.classe || attributs.protocole)) {
                    var classe = attributs.classe || attributs.protocole;
                    var classeLowerCase = classe;
                    if (classe !== classe.toUpperCase()) {
                        classeLowerCase = classe.charAt(0).toLowerCase() + classe.slice(1);
                    }
                    if ($.inArray(classeLowerCase, modulesReq) == -1) {
                        modulesReq.push(classeLowerCase);
                    }
                    if (attributs.urlModule) {
                        var paths = {};
                        paths[classeLowerCase] = attributs.urlModule;
                        require.ajouterConfig({
                            paths: paths
                        });
                    }
                }
                if (niveauForage > 1) {
                    modulesReq = that._analyserRequire(enfant, modulesReq, niveauForage - 1);
                }
            });
        });
        return modulesReq;
    };

    /**
     * Analyser la section "panneaux" de la config
     * @param {object} json Partie de la configuration concernant les panneaux
     * @param {Panneau|Navigateur} [panneauOccurence = Navigateur] Parent des panneaux
     * @method
     * @private
     * @name AnalyseurConfig#_analyserRequire
    */
    AnalyseurConfig.prototype._analyserPanneaux = function(json, panneauOccurence) {
        var that = this;
        var parent = panneauOccurence || this.igo.nav;
        var tagPermis = ['panneau', 'element-accordeon', 'element'];
        var modulesReq = ['panneau', 'panneauCarte'];
        modulesReq = this._analyserRequire(json, modulesReq);

        require(modulesReq, function() {
            Igo.Panneaux = $.extend(Igo.Panneaux, Aide.getRequisObjet(modulesReq, arguments));
            if (json) {
                $.each(json, function(key, propriete) {
                    if ($.inArray(key, tagPermis) === -1) {
                        return true;
                    }
                    propriete = $.isArray(propriete) ? propriete : [propriete];
                    $.each(propriete, function(key, panneau) {
                        var options = panneau["@attributes"] || panneau["attributs"];
                        var classe = options.classe || 'Panneau';
                        if (!Igo.Panneaux[classe]) {
                            throw new Error("Erreur: " + classe + " n'existe pas. Veuillez entrer un urlModule.");
                            return;
                        } else if (classe === 'PanneauCarte') {
                            if (!options.centre) {
                                options.centre = that.contexteAttributs.centre;
                            };
                            if (!options.zoom) {
                                options.zoom = that.contexteAttributs.zoom;
                            };
                        };

                        var panneauOccurenceT = new Igo.Panneaux[classe](options);
                        parent.ajouterPanneau(panneauOccurenceT);

                        if (panneau.element || panneau["element-accordeon"]) {
                            that._analyserPanneaux(panneau, panneauOccurenceT);
                        }
                    });
                });
            }
            if (!panneauOccurence) {
                if(!parent.obtenirPanneauxParType("PanneauCarte").length){
                    parent.ajouterPanneau(new Igo.Panneaux.PanneauxCarte({
                        centre: that.contexteAttributs.centre,
                        zoom: that.contexteAttributs.zoom
                    }));
                }
                that.igo.nav.init(function() {
                    that.fin.panneaux = true;
                    that._analyserContexte();
                    $("#igoLoading").remove();
                });
            }
            ;
        });
    };

    /**
     * Charger le contexte enregistré
     * @method
     * @private
     * @name AnalyseurConfig#_analyserContexte
    */
    AnalyseurConfig.prototype._analyserContexte = function() {
        if (this.fin.panneaux && this.fin.couches && this.fin.actions) {
            if(window.arboLoadingNb === 0) {
                var contexte = new Contexte();
                contexte.charger();
                this._fin();
            } else {
                var that = this;
                setTimeout(function(){that._analyserContexte()}, 500);
            }
        }
    };

    AnalyseurConfig.prototype._fin = function() {
        if(this.fin.analyse){
            Aide.cacherMessageChargement();
            return true;
        }
        this.fin.analyse = true;
        this._analyserDeclencheurs(Aide.obtenirConfigXML('declencheurs'));
        $("#igoLoading").remove();

        if(this.options.callback){
            this.options.callback.call(this.igo.nav);
        }
        this._analyserAvertissements();
    };

    /**
     * Analyser la section "outils" de la config
     * @param {object} json Partie de la configuration concernant les outils
     * @param {BarreOutil|OutilMenu} [outilOccurence] Parent des outils
     * @method
     * @private
     * @name AnalyseurConfig#_analyserOutils
    */
    AnalyseurConfig.prototype._analyserOutils = function(json, outilOccurence) {
        var that = this;
        if (!json) {
            return false;
        }
        var barreOutils = outilOccurence || this.igo.nav.creerBarreOutils();
        var tagPermis = ['outil', 'menu'];
        var modulesReq = ['outil', 'outilMenu'];
        modulesReq = this._analyserRequire(json, modulesReq, 2);

        require(modulesReq, function() {
            Igo.Outils = $.extend(Igo.Outils, Aide.getRequisObjet(modulesReq, arguments));
            var arrayGroupeOutils;
            if (json["groupe-outils"]) {
                arrayGroupeOutils = json["groupe-outils"];
            } else {
                arrayGroupeOutils = [json];
            }

            arrayGroupeOutils = $.isArray(arrayGroupeOutils) ? arrayGroupeOutils : [arrayGroupeOutils];
            $.each(arrayGroupeOutils, function(key, groupeOutils) {
                var listOutils = [];
                var groupeOutilsOptions = groupeOutils["@attributes"] || groupeOutils["attributs"] || {};
                if (Aide.toBoolean(groupeOutilsOptions.division) !== false) {
                    listOutils.push('-');
                }
                $.each(groupeOutils, function(tag, propriete) {
                    if ($.inArray(tag, tagPermis) === -1) {
                        return true;
                    }
                    propriete = $.isArray(propriete) ? propriete : [propriete];
                    $.each(propriete, function(key, outil) {
                        var options = outil["@attributes"] || outil["attributs"];
                        options = $.extend({}, groupeOutilsOptions, options);
                        var classe = options.classe;
                        if (!classe) {
                            if (tag === 'menu') {
                                classe = 'OutilMenu';
                            } else {
                                classe = 'Outil';
                            }
                        }
                        if (!Igo.Outils[classe]) {
                            throw new Error("Erreur: " + classe + " n'existe pas. Veuillez entrer un urlModule.");
                            return;
                        }
                        if(options.action){
                            options.action = that._pathShortToLong(options.action);
                        }
                        if(options.actionScope){
                            options.actionScope = that._pathShortToLong(options.actionScope);
                        }
                        var outilOccurence = new Igo.Outils[classe](options);
                        listOutils.push(outilOccurence);

                        if (outil.outil || outil["groupe-outils"]) {
                            delete outil["@attributes"];
                            delete outil.attributes;
                            that._analyserOutils(outil, outilOccurence);
                        }
                    });
                });
                groupeOutilsOptions.rafraichir = false;
                barreOutils.ajouterOutils(listOutils, groupeOutilsOptions);
            });
            if (!outilOccurence) {
                barreOutils.rafraichir();
            }
        });
    };

    /**
     * Analyser la section "couches" de la config
     * @param {object} json Partie de la configuration concernant les couches
     * @method
     * @private
     * @name AnalyseurConfig#_analyserCouches
    */
    AnalyseurConfig.prototype._analyserCouches = function(json) {
        var that = this;
        var igoGeometrieReq = ['occurence', 'point', 'ligne', 'polygone', 'multiPoint', 'multiLigne', 'multiPolygone', 'collection', 'limites', 'style'];
        var modulesReq = ['google', 'blanc', 'OSM', 'TMS', 'WMS', 'vecteur', 'vecteurCluster', 'marqueurs'];
        modulesReq = this._analyserRequire(json, modulesReq);
        var igoGeoReq = igoGeometrieReq.concat(modulesReq);
        that.listCouchesApresContexte = [];
        window.arboLoadingNb = 0;

        require(igoGeoReq, function() {
            var gReqSize = igoGeometrieReq.length;
            var cReqSize = modulesReq.length;
            var argsObj = $.map(arguments, function(value) {
                return [value];
            });
            Igo.Geometrie = Aide.getRequisObjet(igoGeometrieReq, argsObj.splice(0, gReqSize));
            Igo.Couches = Aide.getRequisObjet(modulesReq, argsObj.splice(0, cReqSize));

            var listCouches = [];
            var listCouchesApresContexte = [];

            var arrayCouches = $.isArray(json) ? json : [json];
            $.each(arrayCouches, function(key, couches) {
                if (!couches || !couches.couche) {
                    return true;
                };

                var couchesOptions = couches["@attributes"] || couches["attributs"];
                var propriete = $.isArray(couches.couche) ? couches.couche : [couches.couche];
                $.each(propriete, function(key, couche) {
                    var options = couche["@attributes"] || couche["attributs"];
                    if(options.infoAction){
                        options.infoAction = that._pathShortToLong(options.infoAction);
                    }
                    options.droit = options.droit || couche.droit;
                    options = $.extend({}, couchesOptions, options);
                    var classe = options.protocole;
                    options.typeContexte = 'contexte';
                    if (options.mode === 'getCapabilities') {
                        window.arboLoadingNb++;
                    }
                    var coucheOccurence = new Igo.Couches[classe](options);
                    if(!Aide.toBoolean(options.chargementApresContexte)){
                        listCouches.push(coucheOccurence);
                    } else {
                        listCouchesApresContexte.push(coucheOccurence);
                    }
                });
            });

            if (listCouches.length === 0 || !listCouches[0].estFond() || listCouches[0].obtenirTypeClasse()==='Google') {
                that._ajouterCoucheBlanc(listCouches);
                return true;
            }

            that.listCouchesApresContexte = listCouchesApresContexte;
            that._analyserCouchesSuccess(listCouches);
        });
    };

    /**
     * Appeler lorsque l'analyse des couches est terminée
     * @param {tableau} listCouches Tableau de {@link Couche} à ajouter à la carte
     * @method
     * @private
     * @name AnalyseurConfig#_analyserCouches
    */
    AnalyseurConfig.prototype._analyserCouchesSuccess = function(listCouches) {
        this.igo.nav.carte.gestionCouches.ajouterCouches(listCouches);
        if (this.options.coucheId) {
            this._analyserCoucheBD(this.options.coucheId);
        } else {
            this._analyserContexteBD();
        }
    };

    /**
     * Ajouter la couche 'Blanc' lorsque la carte n'a pas de couche de fond.
     * @param {tableau} listCouches Tableau de {@link Couche} à ajouter à la carte
     * @method
     * @private
     * @name AnalyseurConfig#_ajouterCoucheBlanc
    */
    AnalyseurConfig.prototype._ajouterCoucheBlanc = function(listCouches) {
        listCouches.unshift(new Igo.Couches.Blanc({visible: false}));
        this._analyserCouchesSuccess(listCouches);
    };

    /**
     * Sert à charger le contexte de la BD. Utilise le contexte.attributes.id ou le contexte.attributes.code du json
     * Si id, appelle l'api ([api]/contexte/[contexte.attributes.id]) pour obtenir les couches de la bd.
     * Si code, appelle l'api ([api]/contexteCode/[contexte.attributes.code]) pour obtenir les couches de la bd.
     * @method
     * @private
     * @name AnalyseurConfig#_analyserContexteBD
    */
    AnalyseurConfig.prototype._analyserContexteBD = function() {
        var that=this;
        var contexteId = this.contexteAttributs.id;
        var contexteCode = this.contexteAttributs.code;

        if($.isArray(this.options.contexteCode)){
            if(this.contexteAttributs.code && this.contexteAttributs.code !== 'null'){
                $.each(this.options.contexteCode, function(key, value){
                    if(that.contexteAttributs.code === value.split("?v=")[0]){
                        contexteCode = value;
                        return false;
                    }
                });
            }
        } else if(this.options.contexteCode) {
            contexteCode = this.options.contexteCode;
        }

        if($.isArray(this.options.contexteId)){
            if(this.contexteAttributs.id && this.contexteAttributs.id !== 'null'){
                $.each(this.options.contexteId, function(key, value){
                    if(that.contexteAttributs.id === value.split("?v=")[0]){
                        contexteId = value;
                        return false;
                    }
                });
            }
        } else if(this.options.contexteId) {
            contexteId = this.options.contexteId;
        }

        var contexteUrl;
        if (contexteId && contexteId !== "null") {
            contexteUrl = Aide.obtenirConfig('uri.api')+"contexte/" + contexteId;
        } else if (contexteCode && contexteCode !== "null"){
            contexteUrl = Aide.obtenirConfig('uri.api')+"contexteCode/" + contexteCode;
        } else {
            this.fin.couches = true;
            setTimeout(function () {
                that.igo.nav.carte.gestionCouches.ajouterCouches(that.listCouchesApresContexte);
                that._analyserContexte();
            }, 1);

            return true;
        }

        $.ajax({
            url: contexteUrl,
            data: {
                trier: this.contexteAttributs.trier
            },
            context: this,
            success: this._analyserContexteBDSuccess,
            error: this._analyserContexteBDError,
            dataType: 'json'
        });
    };

    /**
     * Fonction appelée si l'api retourne un erreur lors de l'obtention des couches du contexte.
     * Affiche les erreurs obtenues.
     * @method
     * @private
     * @name AnalyseurConfig#_analyserContexteBDError
    */
    AnalyseurConfig.prototype._analyserContexteBDError = function(XMLHttpRequest, textStatus, errorThrown) {
        $("#igoLoading").remove();
        var message = XMLHttpRequest.responseJSON ? XMLHttpRequest.responseJSON.error : XMLHttpRequest.responseText;
        if(!message){message = "Erreur lors du chargement du contexte. (" + textStatus +")";}
        Aide.afficherMessage("Erreur chargement contexte", message, null, 'ERROR');
        this.fin.couches = true;
        this._analyserContexte();
    };

    /**
     * Analyser les couches reçues de la BD
     * @param {object} data Json des couche à ajouter à la carte
     * @method
     * @private
     * @name AnalyseurConfig#_analyserContexteBDSuccess
    */
    AnalyseurConfig.prototype._analyserContexteBDSuccess = function(data) {
        var that = this;
        var listCouches = [];
        var couches = $.isArray(data) ? data : data.couches || [];
        var layernamePermis = Aide.obtenirParametreURL("layername");
        if(layernamePermis){
            layernamePermis = layernamePermis.split(',');
        }
        var layerActif = Aide.obtenirParametreURL("layeractif");
        if(layerActif){
            layerActif = layerActif.split(',');
        }
        $.each(couches, function(key, couche) {
            var layername = couche.mf_layer_name || couche.mf_layer_meta_name;
            if(layernamePermis){
                if(layernamePermis.indexOf(layername) === -1){
                    return true;
                }
                couche.est_active = true;
            } else if (layerActif){
                if(layerActif.indexOf(layername) !== -1){
                    couche.est_active = true;
                }
            }
            var options = {
                id: couche.couche_id,
                url: couche.mf_map_meta_onlineresource || data.mf_map_meta_onlineresource,
                nom: layername,
                titre: couche.mf_layer_meta_title,
                active: couche.est_active,
                visible: couche.est_visible,
                ordreAffichage: couche.mf_layer_meta_z_order,
                fond: couche.est_fond_de_carte,
                echelleMin: couche.mf_layer_maxscale_denom,
                echelleMax: couche.mf_layer_minscale_denom,
                opacite: couche.mf_layer_opacity,
                groupe: couche.mf_layer_meta_group_title || undefined,
                metadonnee: couche.fiche_csw_id,
                typeContexte: couche.type_contexte || "contexte",
                impression_url: couche.print_option_url,
                impression_nom: couche.print_option_layer_name,
                zoomMax: couche.max_zoom_level,
                zoomMin:couche.min_zoom_level,
                droit: couche.mf_layer_meta_attribution_title,
                wms_timeitem: couche.wms_timeitem,
                wms_timeextent: couche.wms_timeextent,
                msp_wmst_multiplevalues: couche.msp_wmst_multiplevalues,
                wms_timeformat: couche.wms_timeformat
            };

            if(Aide.obtenirConfig("uri.mapserver")){
                if(Aide.obtenirConfig("uri.mapserver") !== true){
                    options.url = Aide.obtenirConfig("uri.mapserver") + options.url;
                }
            } else {
                options.url = Aide.obtenirConfig("uri.api") + "wms/" + data.id;
            }
            var classe = couche.protocole;
            options = $.extend({}, that.contexteAttributs, options);
            var coucheOccurence = new Igo.Couches[classe](options);

            listCouches.push(coucheOccurence);
        });

        this.igo.nav.carte.gestionCouches.ajouterCouches(listCouches);

        if(data.avertissements){
            this.avertissements = this.avertissements.concat(data.avertissements);
        }
        this.fin.couches = true;

        setTimeout(function () {
            that.igo.nav.carte.gestionCouches.ajouterCouches(that.listCouchesApresContexte);
            that._analyserContexte();
        }, 1);
    };


    AnalyseurConfig.prototype._pathShortToLong = function(objet){
        if(objet && (objet[0] === '/' || objet[0] === '#' || objet[0] === '@')){
            var prefix = 'Igo.Aide.obtenirNavigateur()';
            var objetR = objet.substr(1);
            if(objet[0] === '@'){
                prefix += ".actions";
            } else if(objet[0] === '#'){
                var nav = Aide.obtenirNavigateur();
                var index = objet.indexOf('.');
                index = index !== -1 ? index-1 : undefined;
                var id = objet.substr(1, index);
                var panneau = nav.obtenirPanneauParId(id, -1);
                if(panneau){
                    prefix += ".obtenirPanneauParId('"+id+"', -1)";
                    if(index){
                        objetR = objet.substr(index+2);
                    } else {
                        objetR = "";
                    }
                } else {
                    var outil = nav.barreOutils.obtenirOutilParId(id, -1);
                    if(outil){
                        prefix += ".barreOutils.obtenirOutilParId('"+id+"', -1)";
                        if(index){
                            objetR = objet.substr(index+2);
                        } else {
                            objetR = "";
                        }
                    }
                }
            }
            if(objetR.length !== 0){
                prefix += '.';
            }
            objet = prefix + objetR;
        }
        return objet;
    }

    /**
     * Analyser la section "declencheurs" de la config
     * @param {object} json Partie de la configuration concernant les déclencheurs
     * @method
     * @private
     * @name AnalyseurConfig#_analyserDeclencheurs
    */
    AnalyseurConfig.prototype._analyserDeclencheurs = function(declencheurs) {
        if (!declencheurs) {
            return true;
        }
        var that=this;
        var arrayDeclencheurs = $.isArray(declencheurs.declencheur) ? declencheurs.declencheur : [declencheurs.declencheur];
        $.each(arrayDeclencheurs, function(key, declencheur) {
            if(!declencheur){return false;};
            var options = declencheur["@attributes"] || declencheur["attributs"] || {};
            if(!options.evenement || !options.action){return true;}
            var objet = options.objet || '/evenements';
            objet = that._pathShortToLong(objet);
            var action = that._pathShortToLong(options.action);
            var scope = that._pathShortToLong(options.scope);
            var code = objet + ".ajouterDeclencheur('" + options.evenement + "', " + action +
                    ", {scope:" + scope + ", avant:" + options.avant + ", id:" + options.id + "})";
            new Function(code)();
        });
    };

    /**
     * Analyser la section "actions" de la config
     * @param {object} json Partie de la configuration concernant les actions
     * @method
     * @private
     * @name AnalyseurConfig#_analyserActions
    */
    AnalyseurConfig.prototype._analyserActions = function(actions) {
        var that=this;
        if (!actions) {
            this.fin.actions = true;
            return true;
        }
        var arrayActions = $.isArray(actions.action) ? actions.action : [actions.action];
        var listActionsReq = [];
        $.each(arrayActions, function(key, action) {
            var options = action["@attributes"] || action["attributs"];
            var id = options.id;
            listActionsReq.push(id);
            if (options.source) {
                var source = options.source;
                var aJSExt = source.lastIndexOf('.js');
                if (aJSExt !== -1) {
                    source = source.substr(0, aJSExt);
                }

                var paths = {};
                paths[id] = source;
                require.ajouterConfig({
                    paths: paths
                });
            }
        });
        require(listActionsReq, function() {
            that.igo.nav.actions = Aide.getRequisObjet(listActionsReq, arguments, false);
            that.fin.actions = true;
            that._analyserContexte();
        });
    };


    /**
     * Sert à charger une couche de la bd selon son ID
     * Appelle l'api ([api]/couche/[coucheId]) pour obtenir les informations sur la couche
     * @param {string} coucheId Le ID de la couche
     * @method
     * @name AnalyseurConfig#_analyserCoucheBD
    */
    AnalyseurConfig.prototype._analyserCoucheBD = function(coucheId) {
        var contexteUrl = Aide.obtenirConfig('uri.api')+"couche/" + coucheId;
        $.ajax({
            url: contexteUrl,
            context: this,
            success: this._analyserContexteBDSuccess,
            error: this._analyserContexteBDError,
            dataType: 'json'
        });
    };

    /**
     * Sert à analyser les avertissements subvenus lors du chargement de la config
     * Affiche la liste des avertissements à l'utilisateur
     * @param {tableau} avertissements Tableau d'avertissements (string) à afficher.
     * @method
     * @name AnalyseurConfig#_analyserAvertissements
    */
    AnalyseurConfig.prototype._analyserAvertissements = function(avertissements){
        avertissements = avertissements || [];
        if(this.avertissements){
            avertissements = avertissements.concat(this.avertissements);
        }

        if(avertissements.length > 0){
            $.each(avertissements, function(key, avertissement) {
               Aide.afficherMessageConsole(avertissement);
            });


        }
    };

    return AnalyseurConfig;

});
