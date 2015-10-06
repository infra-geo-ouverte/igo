/** 
 * Module pour l'objet {@link Geometrie.Style}.
 * @module style
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['evenement', 'fonctions', 'aide', 'libs/extension/OpenLayers/FilterClone'], function(Evenement, Fonctions, Aide) {
     /** 
     * Création de l'object Geometrie.Style.
     * @constructor
     * @name Geometrie.Style
     * @class Geometrie.Style
     * @alias style:Geometrie.Style
     * @requires style
     * @param {dictionnaire} style Liste des options du style
     * @param {String} [options.cursor='inherit'] Style du cursor
     * @param {Nombre} [options.rayon=6] Rayon d'un point
     * @param {String} [options.couleur='#ee9900'] Couleur de la géométrie
     * @param {Décimal} [options.opacite=0.4] Opacité de la géométrie (0 invisible, 1 visible)
     * @param {Décimal} [options.limiteOpacite=1]  Opacité du contour de la géométrie (0 invisible, 1 visible)
     * @param {String} [options.limiteCouleur='#ee9900'] Couleur du contour de la géométrie
     * @param {Nombre} [options.limiteEpaisseur=1] Épaisseur du contour
     * @param {String} [options.limiteStyleExtremite='arrondi'] Style des extrémités du contour. Possibilités: 
     * @param {String} [options.limiteStyle='plein'] Style du contour Possibilités: 
     * @returns {Geometrie.Style} Instance de {@link Geometrie.Style}
     * @property {dictionnaire} propriete Liste des options du style
     * @property {dictionnaire} defautPropriete Liste par défaut des options du style
    */
    function Style(style){
        this.propriete = style || {};
        
        this.defautPropriete = {
            cursor: 'inherit',
            rayon: 6,
            couleur: '#ee9900',
            opacite: 0.4,
            limiteOpacite: 1,
            limiteCouleur: '#ee9900',
            limiteEpaisseur: 1,
            limiteStyleExtremite: 'round',  //round  possible: butt, round, square (francais)
            limiteStyle: 'solid'//, //solid  possible: dot, dash, dashdot, longdash, longdashdot, solid
        };
        if(this.propriete.icone){
            this.defautPropriete.opacite=1;
        }
        
        this._lookupOptionsOL = { 
            cursor: 'cursor',
            rayon: 'pointRadius',
            opacite: 'fillOpacity',
            couleur: 'fillColor',
            limiteOpacite: 'strokeOpacity',
            limiteCouleur: 'strokeColor',
            limiteEpaisseur: 'strokeWidth',
            limiteStyle: 'strokeDashstyle',
            limiteStyleExtremite: 'strokeLinecap',
            icone: 'externalGraphic',
            iconeHauteur: 'graphicHeight',
            iconeLargeur: 'graphicWidth',
            iconeOffsetX: 'graphicXOffset',
            iconeOffsetY: 'graphicYOffset',
            etiquette: 'label',
            etiquetteOffsetX: 'labelXOffset',
            etiquetteOffsetY: 'labelYOffset',
            etiquetteAlignement: 'labelAlign',
            etiquetteCouleur: 'fontColor',
            etiquetteEpaisseur: 'fontWeight',
            etiquetteTaille: 'fontSize',
            etiquettePolice: 'fontFamily',
            visible: 'display',
            rotation: 'rotation'
        };
        
        this.contexte = this.propriete.contexte || undefined;
        this._filtresOL=[];
        this.filtres=[];
        
        if(this.propriete.filtres){
            this.ajouterFiltres(this.propriete.filtres);
        }
    };

    Style.prototype = new Evenement();
    Style.prototype.constructor = Style;
    
    /** 
    * Obtenir les options pour le style Openlayers;
    * @method
    * @private 
    * @name Geometrie.Style#_getStyleOptionsOL
    * @returns {objet} Options de style de Openlayers
    */
    Style.prototype._getStyleOptionsOL = function() {
        var that=this;
        var opt = $.extend({}, this.defautPropriete, this.propriete);
        var _optionsOL = {};
        $.each(this._lookupOptionsOL, function(valueIGO, valueOL){
            var vTemp = opt[valueIGO];
            vTemp = that._traiterValeurIGO(valueIGO, vTemp);
            _optionsOL[valueOL] = vTemp;
        });

        return _optionsOL;
    };
    
    
    Style.prototype._traiterValeurIGO = function(propriete, valeur) {
        if((propriete === "couleur" || propriete === "limiteCouleur" || propriete === "etiquetteCouleur") && valeur){
            if(valeur === "aleatoire"){
                var min = 0;
                var max = 255;
                valeur = Fonctions.rgbToHex(Math.floor(Math.random() * (max - min + 1) + min), Math.floor(Math.random() * (max - min + 1) + min), Math.floor(Math.random() * (max - min + 1) + min));
            } else if (valeur[0] !== "#"){
                var splitValeur = valeur.split(" ");
                if(splitValeur.length === 3){
                    valeur = Fonctions.rgbToHex(Number(splitValeur[0]), Number(splitValeur[1]), Number(splitValeur[2]));
                } 
            }
            return valeur;
        }
        if(propriete === "visible"){
            return Aide.toBoolean(valeur) === false ? "none": '';
        }

       return valeur;
    }
    
    /** 
    * Obtenir le style Openlayers;
    * @method
    * @private 
    * @name Geometrie.Style#_getStyleOL
    * @returns {objet} Style de Openlayers
    */
    Style.prototype._getStyleOL = function() {
        var that=this;
        var contexte;
        if(this.contexte){
            contexte = {};
            $.each(this.contexte, function(key, value){
                contexte[key] = function(feature){
                    var occ;
                    if(that.parent){
                        occ = that.parent.obtenirOccurenceParId(feature.id);
                        if(!occ && that.parent.obtenirClusterParId){
                            occ = that.parent.obtenirClusterParId(feature.id);
                        }
                    }
                    return that.contexte[key](occ);
                }
            });
        }
        var styleOL = new OpenLayers.Style(this._getStyleOptionsOL(), {context: contexte});
        styleOL.addRules(this._filtresOL);
        styleOL.title = this.propriete.titre || "Style";
        return styleOL;
    };
    
    
     /** 
     * Obtenir la valeur au style
     * @method
     * @name Geometrie.Style#obtenirPropriete
     * @param {String} nom Nom de la propriété voulue
     * @returns {*} Valeur de la propriété entrée en paramètre
    */
    Style.prototype.obtenirPropriete = function(nom){
        var opt = $.extend({}, this.defautPropriete, this.propriete);
        return opt[nom];
    };
    
     /** 
     * Ajouter une propriété au style
     * @method
     * @name Geometrie.Style#definirPropriete
     * @param {String} nom Nom de la propriété 
     * @param {*} valeur Valeur de la propriété
    */
    Style.prototype.definirPropriete = function(nom, valeur){
        if(!valeur){
            delete this.propriete[nom];
        } else {
            this.propriete[nom] = valeur;
        }
                
        if (this.parent){
            var nomOL = this._lookupOptionsOL[nom];
            var vTemp = this._traiterValeurIGO(nom, valeur);
            if(this.parent.obtenirTypeClasse() === 'Vecteur' || this.parent.obtenirTypeClasse() === 'VecteurCluster' || this.parent.obtenirTypeClasse() === 'WFS'){
                if(this.regle==='defaut'){
                    this.parent._layer.styleMap.styles['default'].defaultStyle[nomOL] = vTemp;
                };
                this.parent._layer.styleMap.styles[this.regle].defaultStyle[nomOL] = vTemp;
                this.parent.rafraichir();       
            } else if (this.parent.obtenirTypeClasse() === 'Occurence'){
                if(!this.parent._feature.style){
                    this.parent._feature.style = {};
                }
                if(!vTemp){
                    delete this.parent._feature.style[nomOL];
                } else {
                    this.parent._feature.style[nomOL] = vTemp;
                }
                if($.isEmptyObject(this.propriete)){
                    this.parent._feature.style = undefined;
                }
                this.parent.rafraichir();              
            } 
        }
    };
    
    
     /** 
     * Ajouter plusieurs filtres aux occurences pour leur attribuer un style différent selon un attribut de l'occurence
     * @method
     * @name Geometrie.Style#ajouterFiltres
     * @param {Dictionnaire} filtres Filtre à ajouter
    */
    Style.prototype.ajouterFiltres = function(filtres){
        var that=this;
        $.each(filtres, function(key, value){
            that.ajouterFiltre(value);
        });
    };
    
     /** 
     * Ajouter un filtre aux occurences pour leur attribuer un style différent selon un attribut de l'occurence
     * @method
     * @name Geometrie.Style#ajouterFiltre
     * @param {String} filtre Opération de comparaison Exemple: [propriete]>valeur
     * @param {Geometrie.Style} style Style à appliquer aux occurences filtrés
    */
    Style.prototype.ajouterFiltre = function(options){
        var filtre = options.filtre;
        var style = options.style;
        var that=this;
        //dernier filtre qui est respecté qui est pris en compte
        //! (not) et parenthèse pas implanté
        //filtre.split(/\(|\)/g);
        //this.filtre;
        var comparatorArray = [], logicSeparator;
        if(filtre){
            filtre = filtre.replace(/ /g, '');

            logicSeparator = filtre.match(/&&|\|\|/g);
            comparatorArray = filtre.split(/&&|\|\|/g);
        };
        var filterLast;
        $.each(comparatorArray, function(key, value){
            if (value === ''){return true};
            var propriete = value.substring(1,value.indexOf("]")); 
            // [propriete] == null
            // [propriete] == 'undefined'
            //Si l'occurence n'est pas filtré, il ne sera pas visible...
            //todo tester si oparator est null
            var operatorMatch = value.match(/==|!=|<=|>=|<|>/); 
            if(!operatorMatch){
                throw new Error("Style.ajouterFiltre : Opérateur invalide");
            }
            var operator = operatorMatch[0];
            var rule = {};
            /* if (operator === 'BETWEEN'){
                var valeur = value.split(operator)[1].split('AND');
                operator = '..';
                rule.lowerBoundary = valeur[0];
                rule.upperBoundary = valeur[1];
            } else {
                rule.value = value.split(operator)[1];
            };*/
            
            rule.value = value.split(operator)[1];
            rule.type = operator;
            rule.property = propriete;

            var filterComparison = new OpenLayers.Filter.Function({
                evaluate: function(attributes) {
                    var obj = attributes;
                    var proprieteSplited = rule.property.split('.');

                    $.each(proprieteSplited, function(key, value){
                        if(!obj){
                            return undefined;
                        }
                        obj = obj[value];
                    });
                    return eval('obj' + operator + rule.value);
                }
            });
            //  var filterComparison = new OpenLayers.Filter.Comparison(rule);
            
            if(key !== 0){
                var filterLogical=new OpenLayers.Filter.Logical({
                    type: logicSeparator[key-1],
                    filters:[filterLast, filterComparison]
                });
            };
            
            filterLast = filterLogical || filterComparison;
        }); 
        
        var _optionsOL = {};
        if (style instanceof Style){
            _optionsOL = style._getStyleOptionsOL();
        } else {
            $.each(this._lookupOptionsOL, function(valueIGO, valueOL){
                var vTemp = style[valueIGO];
                vTemp = that._traiterValeurIGO(valueIGO, vTemp);
                _optionsOL[valueOL] = vTemp;
            });
        }
        var filtreCombinaison;
        if(filterLast){
            filtreCombinaison= new OpenLayers.Rule({
                name: options.titre,
                filter: filterLast,
                maxScaleDenominator: options.echelleMax,
                minScaleDenominator: options.echelleMin,
                symbolizer: _optionsOL
            });
        } else {
            filtreCombinaison= new OpenLayers.Rule({
                name: options.titre,
                elseFilter: true,
                maxScaleDenominator: options.echelleMax,
                minScaleDenominator: options.echelleMin,
                symbolizer: _optionsOL
            });
        }
        
        this._filtresOL.push(filtreCombinaison);
        this.filtres.push({filtre:filtre, style:style});
        
        if(this.parent && (this.parent.obtenirTypeClasse() === 'Vecteur' || this.parent.obtenirTypeClasse() === 'VecteurCluster' || this.parent.obtenirTypeClasse() === 'WFS')){
            if(this.regle==='defaut'){
                this.parent._layer.styleMap.styles['default'].rules=this._filtresOL;
            };
            this.parent._layer.styleMap.styles[this.regle].rules=this._filtresOL;
            this.parent.rafraichir();
        };
    };
    
     /** 
     * Cloner le style
     * @method
     * @name Geometrie.Style#cloner
     * @returns {Geometrie.Style} Instance de {@link Geometrie.Style}
    */
    Style.prototype.cloner = function(){
        return jQuery.extend(true, {}, this);  
    };
    
     /**
     * Réinitialiser les filtres
     * @method
     * @name Geometrie.Style#reinitialiserFiltres
     */
    Style.prototype.reinitialiserFiltres = function(){
        this._filtresOL=[];
        this.filtres=[];
        if(this.parent && (this.parent.obtenirTypeClasse() === 'Vecteur' || this.parent.obtenirTypeClasse() === 'VecteurCluster' || this.parent.obtenirTypeClasse() === 'WFS')){
            if(this.regle==='defaut'){
                this.parent._layer.styleMap.styles['default'].rules=this._filtresOL;
            };
            this.parent._layer.styleMap.styles[this.regle].rules=this._filtresOL;
            this.parent.rafraichir();
        };
    };  
    
    Style.prototype.evaluerFiltre = function(filtre, occurence){
        var that=this;
        var out = false;
        $.each(this.filtres, function(key, value){
            if(value === filtre){
                if(that._filtresOL[key] && that._filtresOL[key].evaluate && occurence){
                    out = that._filtresOL[key].evaluate(occurence._feature);
                }
                return false;
            }      
        });
        return out;
    };  
    
    Style.prototype.obtenirStyleFiltreParOccurence = function(occurence){
        var that=this;
        if(!this.filtres.length){ return this;}
        var styleFiltre = $.extend({}, this.propriete);
        var estDansUnFiltre = false;
        $.each(this.filtres, function(key, value){
            if(that._filtresOL[key] && that._filtresOL[key].evaluate && occurence){
                if(that._filtresOL[key].evaluate(occurence._feature)){
                    estDansUnFiltre = true;
                    var styleFiltreT = value.style;
                    if(styleFiltreT && styleFiltreT.propriete){
                        styleFiltreT = styleFiltreT.propriete;
                    }
                    $.extend(styleFiltre, styleFiltreT);
                }
            }
        });
        
        if($.isEmptyObject(styleFiltre)){return false};
        var style = new Style($.extend({}, this.propriete, styleFiltre));
        style.defautPropriete = this.defautPropriete;
        return style;
    };  
    
    return Style;
});
