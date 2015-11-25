/**
 * Module pour l'objet {@link BarreOutils}.
 * @module barreOutils
 * @requires outil
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['outil'], function(Outil) {
    /**
     * Création de l'object BarreOutils.
     * @constructor
     * @name BarreOutils
     * @class BarreOutils
     * @alias barreOutils:BarreOutils
     * @requires barreOutils
     * @returns {BarreOutils} Instance de {@link BarreOutils}
     * @param {Carte} carte Carte reliée à la barre d'outils
     * @property {tableau} listeOutilsDroite Tableau des {@link Outil} alignés à droite
     * @property {tableau} listeOutilsGauche Tableau des {@link Outil} alignés à gauche
     * @property {Carte} carte Carte reliée à la barre d'outils
     */
    function BarreOutils(carte) {
        this.listeOutilsDroite = [];
        this.listeOutilsGauche = [];
        this.carte = carte;
    }

    /**
     * Ajouter des outils à la barre d'outils
     * @method
     * @name BarreOutils#ajouterOutils
     * @param {Tableau} outils Liste des {@link Outil} à ajouter
     * @param {String} [options.position='gauche'] Alignement des outils (gauche|droite)
     * @param {Boolean} [options.rafraichir=true] Rafraichir la barre d'outils après l'ajout
     */
    BarreOutils.prototype.ajouterOutils = function(outils, options) {
        var that = this;
        options = options || {};
        var rafraichir = options.rafraichir;
        $.each(outils, function(key, outil) {
            options.rafraichir = false;
            that.ajouterOutil(outil, options);
        });

        if (rafraichir !== false) {
            this.rafraichir();
        }
    };

    /**
     * Ajouter un outil à la barre d'outils
     * @method
     * @name BarreOutils#ajouterOutil
     * @param {Outil} outil L'outil à ajouter
     * @param {String} [options.position='gauche'] Alignement des outils (gauche|droite)
     * @param {Boolean} [options.rafraichir=true] Rafraichir la barre d'outils après l'ajout
     */
    BarreOutils.prototype.ajouterOutil = function(outil, options) {
        if (outil instanceof Outil) {
            outil.carte = this.carte;
            outil._init();
            outil.parent = this;
            outil._ajoutCallback(this, this._ajouterOutilCallback, options);
        } else if (outil === '-') {
            this.ajouterDivision(options);
        }
    };

    /**
     * Callback lors de l'ajout d'un outil.
     * La fonction {@link BarreOutils#ajouterOutil} est appelée de manière asynchrone.
     * @method
     * @private
     * @name BarreOutils#_ajouterOutilCallback
     * @param {Outil} outil
     * @param {String} [options.position=gauche] Alignement des outils (gauche|droite)
     * @param {Boolean} [options.rafraichir=true] Rafraichir la barre d'outils après l'ajout
     */
    BarreOutils.prototype._ajouterOutilCallback = function(outil, options) {
        var opt = options || {};
        if (this._panelContainer) {
            if (outil instanceof Outil) {
                if (opt.position !== 'droite') {
                    /* var items=this._panelContainer.topToolbar.items.items;
                     var component = this._panelContainer.topToolbar.createComponent(outil._getBouton());
                     var len=this.listeOutilsGauche.length;
                     items.splice(len, 0, component);*/
                    var len = this.listeOutilsGauche.length;
                    this._panelContainer.topToolbar.insert(len, outil._getBouton());

                } else {
                    this._panelContainer.topToolbar.add(outil._getBouton());
                }
            }
            /*else {
                            //this._panelContainer.topToolbar.add(outil);
                        }*/
            if (opt.rafraichir !== false) {
                this.rafraichir();
            }
        }
        if (opt.position === 'droite') {
            this.listeOutilsDroite.push(outil);
        } else {
            this.listeOutilsGauche.push(outil);
        }
    };


    BarreOutils.prototype.enleverTousOutils = function() {
        this._panelContainer.topToolbar.removeAll();
        this.listeOutilsDroite = [];
        this.listeOutilsGauche = [];
    };

    /**
     * Obtenir la liste des outils.
     * @method
     * @name BarreOutils#obtenirOutils
     * @param {String} [position] Obtenir seulement les outils alignés à (gauche|droite)
     * @returns {Tableau} Tableau de {@link Outil}
     */
    BarreOutils.prototype.obtenirOutils = function(position) {
        if (position === 'gauche') {
            return this.listeOutilsGauche;
        } else if (position === 'droite') {
            return this.listeOutilsDroite;
        }
        return this.listeOutilsGauche.concat('->').concat(this.listeOutilsDroite);
    };

    /**
     * Obtenir les outils d'un certain type
     * @method
     * @name BarreOutils#obtenirOutilsParType
     * @param {String} type Type de l'outil recherché
     * @returns {Tableau} Tableau de {@link Outil}
     */
    BarreOutils.prototype.obtenirOutilsParType = function(type, niveau) {
        niveau = niveau || 1;

        var outils = [];
        $.each(this.obtenirOutils(), function(key, value) {
            if (value.obtenirTypeClasse && value.obtenirTypeClasse() === type) {
                outils.push(value);
            }
            if ((niveau > 1 || niveau < 0) && value.obtenirOutilsParType) {
                outils = outils.concat(value.obtenirOutilsParType(type, niveau - 1));
            }
        });

        return outils;
    };

    BarreOutils.prototype.obtenirOutilParId = function(id, niveau) {
        niveau = niveau || 1;
        var outil;
        $.each(this.obtenirOutils(), function(key, value) {
            if (value.obtenirId && value.obtenirId() === id) {
                outil = value;
                return false;
            }
            if ((niveau > 1 || niveau < 0) && value.obtenirOutilParId) {
                outil = value.obtenirOutilParId(id, niveau - 1);
                if (outil) {
                    return false;
                }
            }
        });
        return outil;
    };

    BarreOutils.prototype.obtenirOutilsParChemin = function(chemin) {
        var that = this;
        var outils = [];
        var cheminSplit = chemin.split(',');
        $.each(cheminSplit, function(key, sChemin) {
            var indexFin;
            var outilsTemp = [that];
            do {
                var separator, nbCaractere;
                if (sChemin.search(/>| /) === 0) {
                    separator = sChemin[0];
                    sChemin = sChemin.substr(1);
                }
                var indexDeb = sChemin.search(/#|\.|>| /);
                var directive = sChemin[indexDeb];
                indexFin = sChemin.substr(indexDeb + 1).search(/#|\.|>| /);
                if (indexFin !== -1) {
                    nbCaractere = indexFin - indexDeb;
                }
                var identifiant = sChemin.substr(indexDeb + 1, nbCaractere);
                sChemin = sChemin.substr(indexFin + 1);

                var outilsLoop, niveau;
                if (directive === '#') {
                    niveau = -1;
                    if (separator === '>') {
                        niveau = 1;
                    }

                    if (!separator && outilsTemp[0].obtenirTypeClasse() !== that.obtenirTypeClasse()) {
                        outilsLoop = [];
                        $.each(outilsTemp, function(keyTemp, outilTemp) {
                            if (outilTemp.obtenirId() === identifiant) {
                                outilsLoop = outilsLoop.concat([outilTemp]);
                            }
                        });
                        outilsTemp = outilsLoop;
                    } else {
                        outilsLoop = [];
                        $.each(outilsTemp, function(keyTemp, outilTemp) {
                            if (outilTemp.obtenirOutilParId) {
                                var p = outilTemp.obtenirOutilParId(identifiant, niveau);
                                if (p) {
                                    outilsLoop = outilsLoop.concat([p]);
                                }
                            }
                        });
                        outilsTemp = outilsLoop;
                    }
                } else if (directive === ".") {
                    niveau = -1;
                    if (separator === '>') {
                        niveau = 1;
                    }

                    if (!separator && outilsTemp[0].obtenirTypeClasse() !== that.obtenirTypeClasse()) {
                        outilsLoop = [];
                        $.each(outilsTemp, function(keyTemp, outilTemp) {
                            if (outilTemp.obtenirTypeClasse() === identifiant) {
                                outilsLoop = outilsLoop.concat([outilTemp]);
                            }
                        });
                        outilsTemp = outilsLoop;
                    } else {
                        outilsLoop = [];
                        $.each(outilsTemp, function(keyTemp, outilTemp) {
                            if (outilTemp.obtenirOutilsParType) {
                                outilsLoop = outilsLoop.concat(outilTemp.obtenirOutilsParType(identifiant, niveau));
                            }
                        });
                        outilsTemp = outilsLoop;
                    }
                } else {
                    outilsTemp = [];
                }
                if (!outilsTemp.length) {
                    indexFin = -1;
                }
            } while (indexFin !== -1);
            outils = outils.concat(outilsTemp);
        });

        var outilsUniques = outils.filter(function(itm, i, a) {
            return i == a.indexOf(itm);
        });
        return outilsUniques;
    };

    /**
     * Obtenir la liste des boutons ExtJS
     * @method
     * @private
     * @name BarreOutils#_getToolbar
     * @returns {Tableau} Tableau des boutons ExtJS
     */
    BarreOutils.prototype._getToolbar = function() {
        var listeBoutons = [];
        $.each(this.obtenirOutils(), function(key, value) {
            if (value instanceof Outil) {
                if (value._getBouton()) {
                    listeBoutons.push(value._getBouton());
                }
            } else {
                listeBoutons.push(value);
            }
        });
        return listeBoutons;
    };

    /**
     * Ajouter une division dans la barre d'outils
     * @method
     * @name BarreOutils#ajouterDivision
     * @param {String} [options.position=gauche] Alignement des outils (gauche|droite)
     * @param {Boolean} [options.rafraichir=true] Rafraichir la barre d'outils après l'ajout
     */
    BarreOutils.prototype.ajouterDivision = function(options) {
        options = options || {};
        if (this._panelContainer) {
            if (options.position !== 'droite') {
                var items = this._panelContainer.topToolbar.items.items;
                //var division = items[0].cloneConfig();
                //var division = this._panelContainer.topToolbar.createComponent('-');
                this._panelContainer.topToolbar.add('-');
                var division = items.pop();
                var len = this.listeOutilsGauche.length;
                items.splice(len, 0, division);
            } else {
                this._panelContainer.topToolbar.add('-');
            }
            if (options.rafraichir !== false) {
                this.rafraichir();
            }
        }
        if (options.position === 'droite') {
            this.listeOutilsDroite.push('-');
        } else {
            this.listeOutilsGauche.push('-');
        }
    };

    /**
     * Aligner les autres outils à droite
     * @method
     * @name BarreOutils#alignerDroite
     */
    /* BarreOutils.prototype.alignerDroite = function(){
         if (this._panelContainer) {
             this._panelContainer.topToolbar.add('->');
         };
         this.listeOutilsGauche.push('->');
     };*/

    /**
     * Redessiner la barre d'outils
     * @method
     * @name BarreOutils#rafraichir
     */
    BarreOutils.prototype.rafraichir = function() {
        if (this._panelContainer) {
            this._panelContainer.topToolbar.doLayout();
        }
        this.carte._getCarte().updateSize();
    };

    /**
     * Lié le _panelContainer ExtJs à barreOutils
     * @method
     * @private
     * @name BarreOutils#_setPanelContainer
     * @param {Objet} panel ExtJS
     */
    BarreOutils.prototype._setPanelContainer = function(panel) {
        this._panelContainer = panel;
    };

    /**
     * Obtenir le type de la classe
     * @method
     * @name BarreOutils#obtenirTypeClasse
     * @returns {String} Type de la BarreOutils
     */
    BarreOutils.prototype.obtenirTypeClasse = function() {
        return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
    };

    /**
     * Éteindre tous les outils de la barre d'outils
     * method
     * @name BarreOutils#eteindreOutils
     */
    BarreOutils.prototype.eteindreOutils = function() {
        var outils = this.obtenirOutils();
        $.each(outils, function(key, outil) {

            if (outil.releverBouton !== undefined) {
                outil.releverBouton();
            }
        });

    };

    return BarreOutils;

});
