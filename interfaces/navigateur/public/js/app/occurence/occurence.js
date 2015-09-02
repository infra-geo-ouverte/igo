/** 
 * Module pour l'objet {@link Occurence}.
 * @module occurence
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires limites
 * @requires style
 * @requires point
 * @requires style
 * @requires ligne
 * @requires polygone
 * @requires multiPolygone
 * @requires aide
 * @requires evenement
 */
define(['limites', 'style', 'point', 'ligne', 'polygone', 'multiPoint', 'multiLigne', 'multiPolygone', 'aide', 'evenement'], function(Limites, Style, Point, Ligne, Polygone, MultiPoint, MultiLigne, MultiPolygone, Aide, Evenement) {
    /** 
     * Création de l'object Occurence.
     * @constructor
     * @name Occurence
     * @class Occurence
     * @alias occurence:Occurence
     * @requires occurence
     * @extends Evenement
     * @returns {Occurence} Instance de {@link Occurence}
     * @param {Geometrie|Openlayers.Geometry} geometrie Géométrie de l'occurence
     * @param {Dictionnaire} [proprietes] Propriétés de l'occurence
     * @param {Style} [style] Style de l'occurence
     * @param {Objet} [opt] Option de l'occurence
     * @property {String} type Type de géométrie
     * @property {String} id id de l'occurence
     * @property {Dictionnaire} proprietes Propriétés de l'occurence
     * @example
     * new Occurence(new Point(45, 30, 'EPSG:4326'), {nom1:'value1', nom2:'value2'}, {couleur: '#f2f2f8'});
     */
    function Occurence(geometrie, proprietes, style, opt) {
        this._init(geometrie, proprietes, style, opt);
    }

    Occurence.prototype = new Evenement();
    Occurence.prototype.constructor = Occurence;

    Occurence.prototype._init = function(geometrie, proprietes, style, opt) {
        opt = opt || {};

        if (geometrie && geometrie.CLASS_NAME === "OpenLayers.Feature.Vector") {
            var vectorOL = geometrie;
            proprietes = proprietes || vectorOL.attributes;
            if(!opt._keepFeature){
                geometrie = vectorOL.geometry;
            } 
        }
        
        var typeGeometrie = opt.typeGeometrie?opt.typeGeometrie:null;

        this.styles = {};
        this._definirGeometrie(geometrie,typeGeometrie);
        this.definirProprietes(proprietes);
        this.accepterModifications();

        this.selectionnee = false;
        this.definirStyle(style);
    };

    /** 
     * Indique si l'occurence est sélectionnée
     * @method
     * @name Occurence#estSelectionne
     * @returns {Boolean} L'occurence est sélectionnée?
     */
    Occurence.prototype.estSelectionnee = function() {
        return this.selectionnee;
    };

    /** 
     * Selectionner l'occurence
     * @method
     * @name Occurence#selectionner
     * @fires Occurence#occurenceSelectionnee
     * @fires Couche.Vecteur#vecteurOccurenceSelectionnee
     */
    Occurence.prototype.selectionner = function() {
        if (!this.estDansCluster) {
            this.appliquerStyle('select');
        }
        this.selectionnee = true;
        /**
         * Événement lancée lorsque l'occurence est sélectionnée
         * @event Occurence#occurenceSelectionnee
         * @type {object}
         */
        this.declencher({type: "occurenceSelectionnee"});
        if (this.vecteur) {
            if(this.vecteur.obtenirTypeClasse() === "VecteurCluster"){
                this.vecteur.rafraichirClusters();
            }
            /**
             * Événement lancée lorsqu'une occurence du vecteur est sélectionnée
             * @event Couche.Vecteur#vecteurOccurenceSelectionnee
             * @type {object}
             * @property {Occurence} occurence L'occurence sélectionnée
             */
            this.vecteur.declencher({type: "vecteurOccurenceSelectionnee", occurence: this});
        }
    };

    /** 
     * Déselectionner l'occurence
     * @method
     * @name Occurence#deselectionner
     * @fires Occurence#occurenceDeselectionnee
     * @fires Couche.Vecteur#vecteurOccurenceDeselectionnee
     */
    Occurence.prototype.deselectionner = function() {
        if (!this.estDansCluster) {
            this.appliquerStyle('defaut');
        }
        this.selectionnee = false;
        /**
         * Événement lancée lorsque l'occurence est désélectionnée
         * @event Occurence#occurenceDeselectionnee
         * @type {object}
         */
        this.declencher({type: "occurenceDeselectionnee"});
        if (this.vecteur) {
            if(this.vecteur.obtenirTypeClasse() === "VecteurCluster"){
                this.vecteur.rafraichirClusters(true);
            }
            /**
             * Événement lancée lorsqu'une occurence du vecteur est désélectionnée
             * @event Couche.Vecteur#vecteurOccurenceDeselectionnee
             * @type {object}
             * @property {Occurence} occurence L'occurence désélectionnée
             */
            this.vecteur.declencher({type: "vecteurOccurenceDeselectionnee", occurence: this});
        }
    };

    /** 
     * Indique si l'occurence est visible à l'écran
     * @method
     * @name Occurence#estVisible
     * @returns {Boolean} L'occurence est visible
     */
    Occurence.prototype.estVisible = function() {
        return this._feature.onScreen();
    };

    /** 
     * Indique si l'occurence est affichée.
     * Il n'est pas nécessairement visible (peut être à l'extérieur de l'écran)
     * @method
     * @name Occurence#estAffichee
     * @returns {Boolean} L'occurence est affichée?
     */
    Occurence.prototype.estAffichee = function() {
        return this._feature.getVisibility();
    };

    /** 
     * Obtenir le type de géométrie de l'occurence
     * @method
     * @name Occurence#obtenirTypeGeometrie
     * @returns {String} Type de géométrie
     */
    Occurence.prototype.obtenirTypeGeometrie = function() {
        return this.type;
    };

    /** 
     * Obtenir les propriétés de l'occurence
     * @method
     * @name Occurence#obtenirProprietes
     * @returns {Dictionnaire} Propriétés de l'occurence
     */
    Occurence.prototype.obtenirProprietes = function() {
        if (!this._feature) {
            return undefined;
        }
        return this._feature.attributes;
    };

    /** 
     * Définir les propriétés de l'occurence
     * @method
     * @param {Dictionnaire} proprietes Propriétés de l'occurence
     * @name Occurence#definirProprietes
     * @throws Occurence.definirProprietes : Paramètre invalide
     */
    Occurence.prototype.definirProprietes = function(proprietes) {
        if (proprietes && !$.isPlainObject(proprietes)) {
            throw new Error("Occurence.definirProprietes : Paramètre invalide");
        }
              
        if (!this.proprietesOriginales) {
            this.modifiee = true;
            this.proprietesOriginales = $.extend(true, {}, this.obtenirProprietes());
        }
        this.proprietes = proprietes || {};
        this._feature.attributes = this.proprietes;
        this.rafraichir();
        this.declencher({type: "occurenceModifiee", modif: proprietes, modifType: 'objetProprietes'});
        if (this.vecteur) {
            this.vecteur.declencher({type: "vecteurOccurenceModifiee", occurence: this, modif: proprietes, modifType: 'objetProprietes'});
        }
    };

    /** 
     * Obtenir la valeur d'une propriété
     * @method
     * @name Occurence#obtenirPropriete
     * @param {String} propriete Nom ou path de la propriété voulue
     * @returns {*} Valeur de la propriété entrée en paramètre
     * @example occurence.obtenirPropriete('nom1');
     * @example occurence.obtenirPropriete('/id');
     * @example occurence.obtenirPropriete('objet.nom1');
     */
    Occurence.prototype.obtenirPropriete = function(propriete) {
        if (!propriete) {
            return undefined;
        }
        var obj = this._feature.attributes;
        if (propriete[0] === '/') {
            propriete = propriete.substr(1);
            obj = this;
        }
        var proprieteSplited = propriete.split('.');

        $.each(proprieteSplited, function(key, value) {
            if (!obj) {
                return undefined;
            }
            obj = obj[value];
        });
        return obj;
    };

    /** 
     * Ajouter une propriété à l'occurence
     * @method
     * @name Occurence#definirPropriete
     * @param {String} propriete Nom de la propriété 
     * @param {*} valeur Valeur de la propriété
     * @throws Occurence.definirPropriete : Nom de la propriété invalide
     */
    Occurence.prototype.definirPropriete = function(propriete, valeur) {
        if (typeof propriete !== 'string') {
            throw new Error("Occurence.definirPropriete : Nom de la propriété invalide");
        }       
        var obj = this._feature.attributes;
        if (propriete[0] === '/') {
            propriete = propriete.substr(1);
            obj = this;
        }
        var proprieteSplited = propriete.split('.');
        var dernierePropriete = proprieteSplited.pop();
        $.each(proprieteSplited, function(key, value) {
            if(obj[value]){
                obj = obj[value];
                if(!$.isPlainObject(obj) && !$.isArray(obj)){
                    throw new Error("Occurence.definirPropriete : Nom de la propriété invalide");
                }
            } else {
                obj[value] = {};
                obj = obj[value];
            }
        });

        if (!this.proprietesOriginales) {
            this.modifiee = true;
            this.proprietesOriginales = $.extend(true, {}, this.obtenirProprietes());
        }

        obj[dernierePropriete] = valeur;
        this.proprietes = this._feature.attributes;
        this.rafraichir();
        this.declencher({type: "occurenceModifiee", modif: {propriete: propriete, valeur: valeur}, modifType: 'propriete'});
        if (this.vecteur) {
            this.vecteur.declencher({type: "vecteurOccurenceModifiee", occurence: this, modif: {propriete: propriete, valeur: valeur}, modifType: 'propriete'});
        }
    };

    Occurence.prototype.obtenirErreurs = function() {
        return this.erreurs;
    };

    Occurence.prototype.obtenirErreur = function(propriete) {
        //erreurs.geometrie
        //erreurs.proprietes
        //erreurs.general?
        //une erreur = {titre:"propriete invalide", message: "nombre entier seulement"}
        if (!propriete) {
            return undefined;
        }
        var obj = this.erreurs;
        var proprieteSplited = propriete.split('.');

        $.each(proprieteSplited, function(key, value) {
            if (!obj) {
                return undefined;
            }
            obj = obj[value];
        });
        return obj;
    };

    Occurence.prototype.definirErreurs = function(erreurs, categorie) {
        if(categorie){
            if(!this.erreurs){
                this.erreurs = {};
            }
            this.erreurs[categorie] = erreurs;
        } else {
            this.erreurs = erreurs || {};
        }
    };

    Occurence.prototype.definirErreur = function(propriete, valeur) {
        if (typeof propriete !== 'string') {
            throw new Error("Occurence.definirErreur : Nom de la propriété invalide");
        }
        
        var obj = this.erreurs ? this.erreurs : this.erreurs={};
        var proprieteSplited = propriete.split('.');
        var dernierePropriete = proprieteSplited.pop();
        var premierePropriete;
        if(proprieteSplited){
            premierePropriete = proprieteSplited.shift();
            obj = obj[premierePropriete] ? obj[premierePropriete] : this.erreurs[premierePropriete] = {};
        }
        $.each(proprieteSplited, function(key, value) {
            obj = obj[value];
            if (!obj) {
                throw new Error("Occurence.definirErreur : Nom de la propriété invalide");
            }
        });

        obj[dernierePropriete] = valeur;
    };

    /** 
     * Obtenir le style de l'occurence
     * @method
     * @name Occurence#obtenirStyle
     * @param {String} [regle='courant'] règle du style désiré (defaut, select, survol, courant)
     * @returns {Geometrie.Style} Style de l'occurence
     */
    Occurence.prototype.obtenirStyle = function(regle, verifierVecteur, verifierFiltre) {
        regle = regle || 'courant';
        regle = regle === 'courant' ? this.regleCourant : regle;
        if (!this.styles[regle] || !this.styles[regle].obtenirTypeClasse || !this.styles[regle].obtenirTypeClasse() === 'Style') {
            var style;
            if(verifierVecteur == true && this.vecteur){
                style = this.vecteur.styles[regle];
                if(style && verifierFiltre === true){
                    style = style.obtenirStyleFiltreParOccurence(this);
                }
            }
            return style;
        }
        return this.styles[regle];
    };

    /** 
     * Définir un style de l'occurence
     * @method
     * @name Occurence#definirStyle
     * @param {Geometrie.Style} style Style de l'occurence
     * @param {String} [regle='defaut'] règle du style désiré (defaut, select, survol, ...)
     */
    Occurence.prototype.definirStyle = function(style, regle) {
        regle = regle || 'defaut';
        if (typeof regle !== 'string') {
            throw new Error("Occurence.definirStyle : Règle du style invalide");
        }
             
        if (style && style.obtenirTypeClasse && style.obtenirTypeClasse() === 'Style') {
            this.styles[regle] = style.cloner();
            this.styles[regle].parent = this;
        } else if ($.isPlainObject(style)) {
            this.styles[regle] = new Style(style);
            this.styles[regle].parent = this;
        } else {
            this.styles[regle] = undefined;
        }

        if (!this.regleCourant || this.regleCourant === regle) {
            this.appliquerStyle(this.regleCourant);
        }
    };

    /** 
     * Changer le style de l'occurence
     * @method
     * @name Occurence#appliquerStyle
     * @param {String} [regle='defaut'] règle du style désiré (defaut, select, courant)
     * @param {boolean} [survol] Modifier le style avec le style survol. Si absent, utilise la variable this.survolStyleActif
     */
    Occurence.prototype.appliquerStyle = function(regle, survol) {
        regle = regle || 'defaut';
      
        if (typeof regle !== 'string') {
            throw new Error("Occurence.appliquerStyle : Règle du style invalide");
        } else if (regle === 'courant') {
            regle = this.regleCourant;
        }
        this.regleCourant = regle;

        if (survol === false) {
            this.survolStyleActif = false;
        } else if (survol || this.survolStyleActif) {
            if(survol == true){
                this.survolStyleActif = true;
            }
            this._definirOverStyle(survol);
            regle = 'over';
        }

        if (!this.styles[regle]) {
            this._feature.style = undefined;
            regle = regle === 'defaut' ? 'default' : regle;
            this._feature.renderIntent = regle;
        } else {
            this._feature.style = this.styles[regle]._getStyleOptionsOL();
            this._feature.renderIntent = undefined;
        }
        
        this.rafraichir();
    };

    /** 
     * Définir le style over. 4 possibilités, en ordre d'essai:
     * 1) Utilisation du style 'survol' de l'occurance
     * 2) Changer l'opacité à 0.6 du style 'courant' de l'occurance
     * 3) Utilisation du style 'survol' du vecteur
     * 4) Changer l'opacité à 0.6 du style 'courant' du vecteur
     * @method
     * @name Occurence#_definirOverStyle
     * @private
     */
    Occurence.prototype._definirOverStyle = function(type) {
        type = type==="survolPlus" ? "survolPlus" : "survol";
        var opacite = type==="survolPlus" ? "0.7" : "0.6";
        var styleMap;
        try {
            styleMap = this.vecteur._layer.styleMap.styles;
        } catch (e) {
            return false;
        }
        if (this.obtenirStyle(type)) {
            var styleCourant;
            if (this.obtenirStyle('courant')) {
                styleCourant = this.obtenirStyle('courant').cloner();
            } else {
                styleCourant = new Style();
            }
            var styleSurvol = this.obtenirStyle(type);
            $.extend(styleCourant.propriete, styleSurvol.propriete);
            this.definirStyle(styleCourant, 'over');
        } else if (this.obtenirStyle('courant')) {
            var style = this.obtenirStyle('courant').cloner();
            style.propriete.opacite = opacite;
            this.definirStyle(style, 'over');
        } else {
            this.definirStyle(undefined, 'over');
            if (this.vecteur && this.vecteur.styles && this.vecteur.styles[type]) {
                var courantStyle = this.vecteur.styles[this.regleCourant] || this.vecteur.styles['defaut'];
                var survolStyle = this.vecteur.styles[type];
                if(courantStyle){
                    survolStyle.defautPropriete = $.extend({}, courantStyle.defautPropriete, courantStyle.propriete);
                }
                styleMap.over = survolStyle._getStyleOL();
            } else {
                try {
                    if (styleMap[this.regleCourant]) {
                        styleMap.over = styleMap[this.regleCourant].clone();
                    } else {
                        styleMap.over = styleMap['default'].clone();
                    }
                } catch (e) {
                    styleMap.over = new Style()._getStyleOL();
                }
                styleMap.over.defaultStyle.fillOpacity = opacite;
            }
        }
        return true;
    };

    /** 
     * Obtenir la valeur d'une propriété du style
     * @method
     * @name Occurence.Occurence#obtenirProprieteStyle
     * @param {String} nom Nom de la propriété voulue du style
     * @param {String} [regle='courant'] règle du style (defaut, select, courant)
     * @returns {*} Valeur de la propriété du style entrée en paramètre
     */
    Occurence.prototype.obtenirProprieteStyle = function(nom, regle, evaluer) {
        regle = regle || 'courant';
        regle = regle === 'courant' ? this.regleCourant : regle;
        var style= this.obtenirStyle(regle, true, true);
        if (style) {
            var propriete = style.obtenirPropriete(nom);
            var regex = /^\${.+}$/;
            if(evaluer && propriete !== undefined && regex.test(propriete)){
                return this.obtenirPropriete(propriete.substring(2, propriete.length-1));
            }
            return propriete;
        }
        return undefined;
    };


    /** 
     * Ajouter une propriété au style de l'occurence
     * @method
     * @name Style.Occurence#definirProprieteStyle
     * @param {String} nom Nom de la propriété du style
     * @param {*} valeur Valeur de la propriété du style
     * @param {String} [regle='courant'] règle du style (defaut, select, courant)
     */
    Occurence.prototype.definirProprieteStyle = function(nom, valeur, regle) {
        if (typeof nom !== 'string') {
            throw new Error("Occurence.definirProprieteStyle : Nom de la propriété invalide");
        }
        regle = regle || 'courant';
        regle = regle == 'courant' ? this.regleCourant : regle;      
        if (this.obtenirStyle(regle)) {
            this.obtenirStyle(regle).definirPropriete(nom, valeur);
        } else if (this.obtenirStyle(regle, true, true)) {
            var style = this.obtenirStyle(regle, true, true);
            $.extend(style.defautPropriete, style.propriete);
            style.propriete = {};
            this.definirStyle(style, regle);
            this.definirProprieteStyle(nom, valeur, regle);
        } else {
            var opt = {};
            opt[nom] = valeur;
            this.definirStyle(new Style(opt), regle);
        }
        if (this.styles[regle] && $.isEmptyObject(this.styles[regle].propriete)) {
            delete this.styles[regle];
        }
        this.appliquerStyle("courant")
    };

    /** 
     * Obtenir les limites de l'occurence
     * @method
     * @name Occurence#obtenirLimites
     * @returns {Geometrie.Limites} Limites de l'occurence
     */
    Occurence.prototype.obtenirLimites = function() {
        if (this.limites) {
            return this.limites;
        }
        var limitesOL = this._obtenirGeomOL().getBounds();
        return new Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
    };

    /** 
     * Cacher l'occurence
     * @method
     * @name Occurence#cacher
     * @param {boolean} tousLesStyles Cacher l'occurence pour tous les styles ou seulement le style courant
     */
    Occurence.prototype.cacher = function(tousLesStyles) {
      
        if(this.estAffichee()){
             this.definirProprieteStyle('visible', 'none', undefined);
            if (this.vecteur) {
                this.vecteur.carte.gestionCouches.enleverOccurenceSurvol(this);
            }
            
            if (tousLesStyles) {
                //todo: faire une boucle sur tous les styles
                this.definirProprieteStyle('visible', 'none', 'defaut');
                this.definirProprieteStyle('visible', 'none', 'select');
            }
        }
    };

    /** 
     * Afficher l'occurence
     * @method
     * @name Occurence#afficher
     * @param {boolean} tousLesStyles Afficher l'occurence pour tous les styles ou seulement le style courant
     */
    Occurence.prototype.afficher = function(tousLesStyles) {
                
        if(!this.estAffichee()){
            this.definirProprieteStyle('visible', undefined, undefined);
            
            if (tousLesStyles) {
                //todo: faire une boucle sur tous les styles
                this.definirProprieteStyle('visible', undefined, 'defaut');
                this.definirProprieteStyle('visible', undefined, 'select');
            }
        }
    };

    /** 
     * Rafraichir l'occurence sur la carte
     * @method
     * @name Occurence#rafraichir
     */
    Occurence.prototype.rafraichir = function() {
        if (this.vecteur) {
            this.vecteur.rafraichir(this);
        }
    };

    /** 
     * Ouvrir une infobulle attachée à l'occurence
     * @method
     * @name Occurence#ouvrirInfobulle
     * @param {dictionnaire} args Arguments de l'infobulle
     * @param {string} args.html Contenu de l'infobulle en html
     * @param {Boolean} args.aFermerBouton Y a-t-il une croix rouge pour fermer l'infobulle
     * @param {function} args.callbackFermeture Callback lors du click sur la croix rougede l'infobulle
     */
    Occurence.prototype.ouvrirInfobulle = function(args) {
        var that=this;
        args = args || {};
        if (!this.estAffichee() && !args.force) {
            return;
        }
        var position = OpenLayers.LonLat.fromString(this._obtenirGeomOL().getCentroid().toShortString());
        var dimension = args.dimension ? new OpenLayers.Size(args.dimension[0], args.dimension[1]) : null;
        var html = args.html || "<p>Aucun contenu.</p>";
        var callbackFermeture = args.callbackFermeture || null;
        var aFermerBouton = args.aFermerBouton === undefined ? true : Aide.toBoolean(args.aFermerBouton);

        this.fermerInfobulle();
        this._infobulle = new OpenLayers.Popup.FramedCloud(
            null,
            position,
            dimension,
            html,
            null,
            aFermerBouton,
            function(e){
                callbackFermeture.call(that, e);
            }
        );
        
        if(args.minDimension && args.minDimension.length===2){
            this._infobulle.minSize = new OpenLayers.Size(args.minDimension[0], args.minDimension[1]);
        }
        if(args.maxDimension && args.maxDimension.length===2){
            this._infobulle.maxSize = new OpenLayers.Size(args.maxDimension[0], args.maxDimension[1]);
        }

        if (this.vecteur) {
            this.vecteur.carte._carteOL.addPopup(this._infobulle);
        }
    };


    /** 
     * Fermer l'infobulle de l'occurence
     * @method
     * @name Occurence#fermerInfobulle
     */
    Occurence.prototype.fermerInfobulle = function() {
        if (this._infobulle) {
            if (this.vecteur) {
                this.vecteur.carte._carteOL.removePopup(this._infobulle);
            }
            this._infobulle = null;
        }
    };

    /** 
     * Définir la géométrie de l'occurence
     * @method
     * @name Occurence#_definirGeometrie
     * @private
     * @param {Geometrie|Openlayers.Geometry} geometrie Géométrie de l'occurence
     * @throws Occurence._definirGeometrie : La géométrie est invalide
     **/
    Occurence.prototype._definirGeometrie = function(geometrie, typeGeometrie) {
        var proprietes = this.obtenirProprietes();
        delete this._feature;
        delete this.x;
        delete this.y;
        delete this.points;
        delete this.lignes;
        delete this.polygones;
        delete this.gauche;
        delete this.droite;
        delete this.haut;
        delete this.bas;

        if (!geometrie) {
            this._feature = new OpenLayers.Feature.Vector();
            this.type = typeGeometrie;
        } else if (geometrie.CLASS_NAME !== undefined) {
            if (geometrie.CLASS_NAME === "OpenLayers.Feature.Vector") {
                this._feature = geometrie;
                geometrie = geometrie.geometry;
                this.id = this._feature.id;
            } else {
                this._feature = new OpenLayers.Feature.Vector(geometrie);
            }

            if (geometrie.CLASS_NAME === "OpenLayers.Geometry.Polygon") {
                this.type = "Polygone";
                geometrie = new Polygone(geometrie);
            } else if (geometrie.CLASS_NAME === "OpenLayers.Geometry.MultiPolygon") {
                this.type = "MultiPolygone";
                geometrie = new MultiPolygone(geometrie);
            } else if (geometrie.CLASS_NAME === "OpenLayers.Geometry.MultiLineString") {
                this.type = "MultiLigne";
                geometrie = new MultiLigne(geometrie);
            } else if (geometrie.CLASS_NAME === "OpenLayers.Geometry.MultiPoint") {
                this.type = "MultiPoint";
                geometrie = new MultiPoint(geometrie);
            } else if (geometrie.CLASS_NAME === "OpenLayers.Geometry.Point") {
                this.type = "Point";
                geometrie = new Point(geometrie);
            } else if (geometrie.CLASS_NAME === "OpenLayers.Geometry.LineString" || geometrie.CLASS_NAME === "OpenLayers.Geometry.LinearRing") {
                this.type = "Ligne";
                geometrie = new Ligne(geometrie);
            }
        } else if (geometrie._obtenirGeomOL) {
            var geomOL = geometrie._obtenirGeomOL();
            this._feature = new OpenLayers.Feature.Vector(geomOL);
            this.type = geometrie.obtenirTypeClasse();
        }

        if (!this._feature) {
            throw new Error("Occurence._definirGeometrie : La géométrie est invalide");
            return;
        }

        $.extend(this, geometrie, {projeter: Occurence.prototype.projeter});

        if (!this.id) {
            var type = this.type ? this.type + '_' : '';
            this.id = this.obtenirTypeClasse() + '_' + type + this._feature.id.substr(this._feature.id.lastIndexOf('_') + 1);
        }
        this._feature.id = this.id;

        this._feature.attributes = proprietes || {};
        
        return this;
    };

    /** 
     * Obtenir la géométrie de l'occurence. 
     * C'est une copie de la géométrie. Les modifications ne sont pas réflétées à la géométrie.
     * @method
     * @name Occurence#_obtenirGeometrie
     * @private
     * @returns {Geometrie} Géométrie de l'occurence
     */
    Occurence.prototype._obtenirGeometrie = function() {
        switch (this.obtenirTypeGeometrie()) {
            case "Point":
                if(this.x && this.y){
                    return new Point(this.x, this.y, this.obtenirProjection());
                }
                else{
                    return undefined;
                }
            case "Ligne":
                if(this.points){
                    return new Ligne(this.points, this.obtenirProjection());
                }
                else{
                    return undefined;
                }
            case "Polygone":
                if(this.lignes){
                    return new Polygone(this.lignes, this.obtenirProjection());
                }
                else{
                    return undefined;
                }
            case "MultiPolygone":
                if(this.polygones){
                    return new MultiPolygone(this.polygones, this.obtenirProjection());
                }
                else{
                    return undefined;
                }
            case "Limites":
                if(this.gauche && this.bas && this.droite && this.haut){
                    return new Limites(this.gauche, this.bas, this.droite, this.haut);
                }
                else{
                    return undefined;
                }
            default:
                return undefined;
        }    
    };

    /** 
     * Mise à jour de la géométrie de l'occurence
     * @method
     * @name Occurence#majGeometrie
     * @param {Geometrie|Openlayers.Geometry} geometrie Géométrie de l'occurence
     * @returns {Occurence} Retourne lui-même
     */
    Occurence.prototype.majGeometrie = function(geometrie) {
        if (this.vecteur) {
            this.vecteur.carte.gestionCouches.enleverOccurenceSurvol(this);
            this.vecteur._layer.removeFeatures(this._feature);
        }
        if (!this.geometrieOriginale) {
            this.modifiee = true;
            this.geometrieOriginale = this._obtenirGeometrie();
        }

        this._definirGeometrie(geometrie);
        if (this.vecteur) {
            this.vecteur._layer.addFeatures(this._feature);
            this.appliquerStyle(this.regleCourant, false);
        }
        
        /**
         * Événement lancée lorsque l'occurence est modifiée
         * @event Occurence#occurenceModifiee
         * @type {object}
         */
        this.declencher({type: "occurenceModifiee", modif: geometrie, modifType: 'géométrie'});
        if (this.vecteur) {
            /**
             * Événement lancée lorsqu'une occurence du vecteur est modifiée
             * @event Couche.Vecteur#vecteurOccurenceModifiee
             * @type {object}
             * @property {Occurence} occurence L'occurence modifiée
             */
            this.vecteur.declencher({type: "vecteurOccurenceModifiee", occurence: this, modifGeometrie: geometrie, modifType: 'géométrie'});
        }
        
        return this;
    };


    /** 
     * Annuler les modifications apportées à l'occurence.
     * Retourner l'occurence dans l'état qu'elle était la dernière fois que les modifications ont été acceptées.
     * @method
     * @name Occurence#annulerModifications
     */
    Occurence.prototype.annulerModifications = function() {
        if (this.modifiee) {
            if (this.geometrieOriginale) {
                this.majGeometrie(this.geometrieOriginale);
                this.geometrieOriginale = undefined;
            }
            if (this.proprietesOriginales) {
                this.definirProprietes($.extend(true, {}, this.proprietesOriginales));
                this.proprietesOriginales = undefined;
            }
            this.modifiee = false;
        }
        this.ajoutee = false;
        this.enlevee = false;
    };

    /** 
     * Accepter les modifications apportées à l'occurence. 
     * Elles ne pourront plus être annulées.
     * @method
     * @name Occurence#annulerModifications
     */
    Occurence.prototype.accepterModifications = function() {
        if (this.modifiee) {
            delete this.geometrieOriginale;
            delete this.proprietesOriginales;
            this.modifiee = false;
        }
        this.ajoutee = false;
        this.enlevee = false;
    };
    
    
    /**
     * Projecter une occurrence dans une nouvelle projection
     * @method
     * @name Occurence#projeterOccurence
     * @param {String} arg1 
     * Si !arg2, alors arg1 = Projection voulue. La projection source est la projection du polygone.
     * Si arg2, alors arg1 = Projection source
     * @param {String} [arg2] Projection voulue
     * @returns {Occurence} Occurence avec la nouvelle projection
     */
    Occurence.prototype.projeter = function(arg1, arg2) {        
        var geom = this._obtenirGeometrie().projeter(arg1, arg2);
        return this.cloner()._definirGeometrie(geom);
    };

    /**
     * Cloner l'occurence
     * @method
     * @name Occurence#cloner
     * return {Occurence} Occcurence clonée
     */
    Occurence.prototype.cloner = function(garderStyleVecteur) {   
        if(garderStyleVecteur){
            return new Occurence(this._obtenirGeometrie(), this.proprietes, this.obtenirStyle(this.regleCourant, true, true));
        }
        else{
            return new Occurence(this._obtenirGeometrie(), this.proprietes, this.styles);
        } 
    };
    
    /**
     * Réinitialiser les valeurs des attributs de l'occurence
     * @method
     * @name Occurence#reinitialiserAttributs   
     */
    Occurence.prototype.reinitialiserAttributs = function() {
        this.definirProprietes();
        delete this.proprietesOriginales;
        this.modifiee = this.geometrieOriginale ? true : false;
    }
    
    return Occurence;

});
