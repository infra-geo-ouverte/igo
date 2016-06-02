/**
 * Module pour l'objet {@link Navigateur}.
 * @module navigateur
 * @requires barreOutils
 * @requires panneau
 * @requires carte
 * @requires panneauCarte
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['barreOutils', 'panneau', 'carte', 'panneauCarte', 'aide', 'evenement'], function(BarreOutils, Panneau, Carte, PanneauCarte, Aide, Evenement) {
    /**
     * Création de l'object Navigateur.
     * @constructor
     * @name Navigateur
     * @class Navigateur
     * @alias navigateur:Navigateur
     * @requires navigateur
     * @param {Carte} [carte] Carte du navigateur. Si absent, une carte par défaut est définie.
     * @param {dictionnaire} [options] Liste des options de la carte
     * @param {string} [options.div] Le navigateur sera construit dans cette div et prendra la taille de celle-ci.
     * Si l'option n'est pas définie, alors le navigateur prendra le plein écran.
     * @param {boolean} [options.aBordure=false] Présence d'une bordure autour du navigateur. Seulement possible lorsque l'option 'div' est définie.
     * @returns {Navigateur} Instance de {@link Navigateur}
     * @property {Carte} carte Carte du navigateur
     * @property {BarreOutils} barreOutils Barre d'outils du navigateur
     * @property {tableau} listePanneaux Liste des {@link Panneau}
     * @property {dictionnaire} options Dictionnaire des options du navigateur
     * @exception L'intrant carte est du bon type
     */
    function Navigateur(carte, options) {
        this.options = options || {};
        Aide.definirNavigateur(this);
        if (!carte) {
            carte = new Carte();
        }
        if (carte.constructor.name !== 'Carte') {
            //pour ie
            if (carte.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1] !== 'Carte') {
                throw new Error("new Igo.Navigateur(carte) a besoin d'un objet de type Igo.Carte()");
            }
        }
        this.carte = carte;
        this.listePanneaux = [];
    }

    Navigateur.prototype = new Evenement();
    Navigateur.prototype.constructor = Navigateur;

    /**
     * Callback après l'initiation du navigateur.
     * @callback Navigateur~initCallback
     * @param {dictionnaire} opt Options
     */
    /**
     * Initialisation de l'object Navigateur. Les panneaux principaux doivent être ajoutés avant.
     * Si panneauCarte est absent, alors le panneau par défaut sera créé.
     * Retourne un callback après l'initialisation du Navigateur
     * @method
     * @name Navigateur#init
     * @param {Navigateur~initCallback} [callback] Callback
     * @param {*} [cible] 'This' dans la fonction callback
     * @param {dictionnaire} [optCallback] Options du callback
     */
    Navigateur.prototype.init = function(callback, cible, optCallback) {
        //Fenêtre de la carte et des outils
        var that = this;
        Ext.QuickTips.init();
        Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

        var listePanelExt = [];

        //Ajouter les panneaux dans le panel du navigateur
        var aPanneauCarte = false;
        $.each(this.listePanneaux, function(key, value) {
            if (value.obtenirTypeClasse() === 'PanneauCarte') {
                aPanneauCarte = true;
            }
            if (value._getPanel()) {
                listePanelExt.push(value._getPanel());
            }
        });

        //Si pas de panneauCarte, alors le creer
        if (aPanneauCarte === false) {
            var panneauCarte = new PanneauCarte();
            this.ajouterPanneau(panneauCarte);
            listePanelExt.push(panneauCarte._getPanel());
        }

        //Initialisation du viewport.
        if (this.options.div) {
            require(['libs/Ext.ux/FitToParent'], function() {
                this._viewport = new Ext.Panel({
                    layout: 'border',
                    id: 'monNavigateurIGO',
                    items: listePanelExt,
                    renderTo: that.options.div,
                    border: that.options.aBordure || false,
                    plugins: ['fittoparent'],
                    scope: that,
                    listeners: {
                        afterrender: function(e) {
                            e.scope.isReady = true;
                            e.scope.carte.isReady = true;
                            if (typeof callback === "function") {
                                callback.call(cible, optCallback);
                            }
                            e.scope.carte.declencher({
                                type: "carteInit"
                            });
                            e.scope.declencher({
                                type: "navigateurInit"
                            });
                        }
                    }
                });
            });
        } else {
            this._viewport = new Ext.Viewport({
                layout: 'border',
                id: 'monNavigateurIGO',
                items: listePanelExt,
                scope: this,
                listeners: {
                    afterrender: function(e) {
                        e.scope.isReady = true;
                        e.scope.carte.isReady = true;
                        if (typeof callback === "function") {
                            callback.call(cible, optCallback);
                        }
                        e.scope.carte.declencher({
                            type: "carteInit"
                        });
                        e.scope.declencher({
                            type: "navigateurInit"
                        });
                    }
                }
            });
        }

        $(document).on('keyup keydown', function(e) {
            that.ctrlPressed = e.ctrlKey;
        });
    };

    /* Navigateur.prototype.ready = function(){

     };*/

    Navigateur.prototype.obtenirCtrl = function() {
        return this.ctrlPressed;
    };

    /**
     * Création de l'object {@link BarreOutils}.
     * @method
     * @name Navigateur#creerBarreOutils
     * @returns {BarreOutils} Instance de {@link BarreOutils}
     */
    Navigateur.prototype.creerBarreOutils = function() {
        var that = this;
        this.barreOutils = new BarreOutils(this.carte);
        //Si présence du PanneauCarte, alors établir le lien avec la barre d'outil.
        $.each(this.obtenirPanneaux(), function(key, panneau) {
            if (panneau.obtenirTypeClasse() === 'PanneauCarte') {
                that.barreOutils._setPanelContainer(panneau._getMapComponent());
            }
        });
        return this.barreOutils;
    };

    /**
     * Obtenir la barreOutils liée au navigateur
     * @method
     * @name Navigateur#obtenirBarreOutils
     * @returns {BarreOutils} Instance de {@link BarreOutils}
     */
    Navigateur.prototype.obtenirBarreOutils = function() {
        return this.barreOutils;
    };

    /**
     * Ajouter un panneau au navigateur.
     * Doit être fait avant {navigateur.init).
     * @method
     * @name Navigateur#ajouterPanneau
     * @param {Panneau} panneau Panneau à ajouter.
     * @exception L'intrant panneau est du bon type
     */
    Navigateur.prototype.ajouterPanneau = function(panneau) {
        if (panneau instanceof Panneau === false) {
            throw new Error("Igo.Navigateur.ajouterPanneau(panneau) a besoin d'un objet de type Igo.Panneaux");
        }

        panneau.definirCarte(this.carte);
        if (panneau.obtenirTypeClasse() === 'PanneauCarte') {
            panneau.barreOutils = this.barreOutils;
        }
        panneau._init();
        this.listePanneaux.push(panneau);
    };

    /**
     * Obtenir la liste des panneaux
     * @method
     * @name Navigateur#obtenirPanneaux
     * @returns {Tableau} Liste de {@link Panneau}
     */
    Navigateur.prototype.obtenirPanneaux = function() {
        return this.listePanneaux;
    };

    Navigateur.prototype.obtenirPanneauxParChemin = function(chemin) {
        var that = this;
        var panneaux = [];
        var cheminSplit = chemin.split(',');
        $.each(cheminSplit, function(key, sChemin) {
            var indexFin;
            var panneauxTemp = [that];
            do {
                var separator;
                if (sChemin.search(/>| /) === 0) {
                    separator = sChemin[0];
                    sChemin = sChemin.substr(1);
                }
                var indexDeb = sChemin.search(/#|\.|>| /);
                var directive = sChemin[indexDeb];
                indexFin = sChemin.substr(indexDeb + 1).search(/#|\.|>| /);
                var nbCaractere;
                if (indexFin !== -1) {
                    nbCaractere = indexFin - indexDeb;
                }
                var identifiant = sChemin.substr(indexDeb + 1, nbCaractere);
                sChemin = sChemin.substr(indexFin + 1);

                var panneauxLoop, niveau;
                if (directive === '#') {
                    niveau = -1;
                    if (separator === '>') {
                        niveau = 1;
                    }
                    if (!separator && panneauxTemp[0].obtenirTypeClasse() !== that.obtenirTypeClasse()) {
                        panneauxLoop = [];
                        $.each(panneauxTemp, function(keyTemp, panneauTemp) {
                            if (panneauTemp.obtenirId() === identifiant) {
                                panneauxLoop = panneauxLoop.concat([panneauTemp]);
                            }
                        });
                        panneauxTemp = panneauxLoop;
                    } else {
                        panneauxLoop = [];
                        $.each(panneauxTemp, function(keyTemp, panneauTemp) {
                            if (panneauTemp.obtenirPanneauParId) {
                                var p = panneauTemp.obtenirPanneauParId(identifiant, niveau);
                                if (p) {
                                    panneauxLoop = panneauxLoop.concat([p]);
                                }
                            }
                        });
                        panneauxTemp = panneauxLoop;
                    }
                } else if (directive === ".") {
                    niveau = -1;
                    if (separator === '>') {
                        niveau = 1;
                    }

                    if (!separator && panneauxTemp[0].obtenirTypeClasse() !== that.obtenirTypeClasse()) {
                        panneauxLoop = [];
                        $.each(panneauxTemp, function(keyTemp, panneauTemp) {
                            if (panneauTemp.obtenirTypeClasse() === identifiant) {
                                panneauxLoop = panneauxLoop.concat([panneauTemp]);
                            }
                        });
                        panneauxTemp = panneauxLoop;
                    } else {
                        panneauxLoop = [];
                        $.each(panneauxTemp, function(keyTemp, panneauTemp) {
                            if (panneauTemp.obtenirPanneauxParType) {
                                panneauxLoop = panneauxLoop.concat(panneauTemp.obtenirPanneauxParType(identifiant, niveau));
                            }
                        });
                        panneauxTemp = panneauxLoop;
                    }
                } else {
                    panneauxTemp = [];
                }
                if (!panneauxTemp.length) {
                    indexFin = -1;
                }
            } while (indexFin !== -1);
            panneaux = panneaux.concat(panneauxTemp);
        });

        var panneauxUniques = panneaux.filter(function(itm, i, a) {
            return i == a.indexOf(itm);
        });
        return panneauxUniques;
    };

    /**
     * Obtenir le panneau ayant l'identifiant fourni en intrant
     * @method
     * @name Navigateur#obtenirPanneauParId
     * @param {String} id Identifiant du panneau recherché
     * @returns {Panneau} Instance de {@link Panneau}
     */
    Navigateur.prototype.obtenirPanneauParId = function(id, niveau) {
        niveau = niveau || 1;
        var panneau;
        $.each(this.listePanneaux, function(key, value) {
            if (value.obtenirId() === id) {
                panneau = value;
                return false;
            }
            if ((niveau > 1 || niveau < 0) && value.obtenirPanneauParId) {
                panneau = value.obtenirPanneauParId(id, niveau - 1);
                if (panneau) {
                    return false;
                }
            }
        });
        return panneau;
    };

    /**
     * Obtenir les panneaux d'un certain type
     * @method
     * @name Navigateur#obtenirPanneauxParType
     * @param {String} type Type du panneau recherché
     * @returns {Tableau} Tableau de {@link Panneau}
     */
    Navigateur.prototype.obtenirPanneauxParType = function(type, niveau) {
        niveau = niveau || 1;
        var panneau = [];
        $.each(this.listePanneaux, function(key, value) {
            if (value.obtenirTypeClasse() === type) {
                panneau.push(value);
            }
            if ((niveau > 1 || niveau < 0) && value.obtenirPanneauxParType) {
                panneau = panneau.concat(value.obtenirPanneauxParType(type, niveau - 1));
            }
        });
        return panneau;
    };

    return Navigateur;

});
