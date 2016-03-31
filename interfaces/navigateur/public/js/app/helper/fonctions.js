/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define([], function() {

    function Fonctions(){

    };

    Fonctions.afficherProprietes = function(input, options){
        require(['aide', 'analyseurGeoJSON', 'handlebars'], function(Aide, AnalyseurGeoJSON, Handlebars) {
            //input: [occurences] ou vecteur ou [{titre: "test", occurences: geoJSON}]
            options = options || {};
            var defautTitre = "Couche inconnue";
            var defautGabarit = "template/afficherProprietes";
            var messageErreur = options.messageErreur || "Aucun enregistrement n'a été trouvé";
            var titreErreur = options.messageTitre || "Propriétés";
            if(!input){
                Aide.afficherMessage(titreErreur, messageErreur);
                return false;
            }

            if (input.obtenirTypeClasse && (input.obtenirTypeClasse() === "Vecteur" || input.obtenirTypeClasse() === "VecteurCluster" || input.obtenirTypeClasse() === "WFS")){
                var occGroupe = {};
                occGroupe[input.id] = input.obtenirOccurences();
                input = occGroupe;
            } else if (!$.isArray(input)){
                input = [input];
            }   

            if(input.length === 0 && !$.isPlainObject(occGroupe)){
                Aide.afficherMessage(titreErreur, messageErreur);
                return false;
            }

            if(input[0] && input[0].obtenirTypeClasse && input[0].obtenirTypeClasse() === "Occurence"){
                var occGroupe = {};
                $.each(input, function(key, value){
                    var id = value.vecteur ? value.vecteur.id : "sansCouche";
                    if(!occGroupe[id]){
                        occGroupe[id] = [];
                    }
                    occGroupe[id].push(value);
                });
                input = occGroupe;
            }

            var analyseur = new AnalyseurGeoJSON();
            var arrayOccGeoJson = [];
            var gabarits = [];
            $.each(input, function(key, value){
                var obj;
                if ($.isArray(value)){
                    if(!value[0]){
                        return true;
                    }
                    var infoTemplate;
                    var titre;
                    if(!value[0].vecteur){
                       infoTemplate = {};
                       titre = defautTitre;
                    } else {
                        if(value[0].vecteur.options.estInterrogeable === false){
                            return true;
                        }
                        infoTemplate = value[0].vecteur.templates.info || {};
                        titre = value[0].vecteur.obtenirTitre();
                    }
                    obj = {
                        titre: titre,
                        gabarit: infoTemplate.gabarit || defautGabarit,
                        alias: infoTemplate.alias,
                        occurencesGeoJSON: JSON.parse(analyseur.ecrire(value))
                    };         
                } else if(value.html){
                    obj = {
                        titre: value.titre || defautTitre,
                        html: value.html
                    };
                } else {
                    if(!value.occurences){
                        value = {occurences: value};
                    }
                    var occ = value.occurences;
                    if(typeof value.occurences === "string"){
                        occ = JSON.parse(value.occurences);
                    } else if(value.occurences.obtenirTypeClasse && (value.occurences.obtenirTypeClasse() === "Vecteur" || value.occurences.obtenirTypeClasse() === "VecteurCluster" || value.occurences.obtenirTypeClasse() === "WFS")){
                        value.occurences = value.occurences.obtenirOccurences();
                    } 

                    if (value.occurences[0] && value.occurences[0].obtenirTypeClasse && value.occurences[0].obtenirTypeClasse() === "Occurence"){
                        occ = JSON.parse(analyseur.ecrire(value.occurences));
                        if(value.occurences[0].vecteur){
                           if(!value.titre){
                               value.titre = value.occurences[0].vecteur.obtenirTitre();
                           }
                           if(!value.gabarit && value.occurences[0].vecteur.templates.info){
                               value.gabarit = value.occurences[0].vecteur.templates.info.gabarit;
                           }
                        }
                    } 
                    if (!occ.features || !occ.features.length){
                        return true;
                    }
                    obj = {
                        titre: value.titre || defautTitre,
                        gabarit: value.gabarit || defautGabarit,
                        alias: value.alias,
                        occurencesGeoJSON: jQuery.extend({}, occ)
                    };
                }
                if(!obj.gabarit){
                    gabarits.push(null);
                } else {
                    gabarits.push("hbars!"+obj.gabarit);
                }
                arrayOccGeoJson.push(obj);       
            });

            if(!arrayOccGeoJson.length){
                Aide.afficherMessage(titreErreur, messageErreur);
                return false;
            }

            var oResultWindow = Ext.getCmp("occurencesResultatsWindow");
            if(!Ext.get("occurencesResultatsWindow")){
                var height = $(window).height()/2;
                var width = $(window).width()/2.5;
                height = height < 215 ? 215 : height;
                width = width < 350 ? 350 : width;
                var tabs = new Ext.TabPanel({
                    activeTab: 0,
                    enableTabScroll: true,
                    height : height
                });
                oResultWindow = new Ext.Window({
                    id: 'occurencesResultatsWindow',
                    title    : 'Résultats de la requête',
                    width    : width,
                    minWidth: 350,
                    minHeight: 300,
                    height   : height+85,
                    border : false,
                    modal: true,
                    plain    : true,
                    closable : true,
                    resizable : true,
                    autoScroll: false,
                    constrain: true,
                    layout:'fit',
                    items: [tabs]
                });
            }

            if(!('utiliserAlias' in Handlebars.helpers)) {
                Handlebars.registerHelper('utiliserAlias', function(key, alias, opts) {
                    if(!alias){return key}
                    if(alias[key]){
                        return alias[key];
                    }

                    var keySplit = key.split(".");
                    var firstKey = keySplit.shift();
                    var out = alias[firstKey] || firstKey;
                    while (keySplit.length) {
                        var nextKey = keySplit.shift();
                        out += ".";
                        out += alias["*"+nextKey] || nextKey;
                    }
                    return out;
                });

                Handlebars.registerHelper('requireJS', function(js) {
                    require([js], function(){}) 
                });

                Handlebars.registerHelper('ifObjet', function(content, opts) {
                    if($.isPlainObject(content) || $.isArray(content)){
                        return opts.fn(content);
                    }
                    return opts.inverse(content);
                });

                var loopRecursiveObjet = function(children, options, audaciousFn, previousKey, previousIndex){
                    var out = "";
                    var index = 0;
                    $.each(children, function(key, child){
                        out += audaciousFn({
                            index: previousIndex + "." + index,
                            key: previousKey + "." + key,
                            value: child,
                            visible: false
                        });

                        if($.isPlainObject(child) || $.isArray(child)){
                            out += loopRecursiveObjet(child, options, audaciousFn, previousKey + "." + key, previousIndex + "." + index);
                        }
                        index ++;
                    });

                    return out;
                };

                Handlebars.registerHelper('recursive', function(children, options) {
                    var audaciousFn;
                    if (options.fn !== undefined) {
                        audaciousFn = options.fn;
                    }

                    var out = audaciousFn({
                        index: options.data.index,
                        key: options.data.key,
                        value: children,
                        visible: true
                    });

                    if(!$.isPlainObject(children) && !$.isArray(children)){
                        return out;
                    }        

                    out += loopRecursiveObjet(children, options, audaciousFn, options.data.key, options.data.index);
                    return out;
                });
            }

            require(gabarits, function(){
                var args = arguments;
                $.each(arrayOccGeoJson, function(key, value){
                    var html = value.html;
                    if(value.occurencesGeoJSON){
                        value.occurencesGeoJSON.alias = value.alias;
                        html = args[key](value.occurencesGeoJSON);
                    }
                    var pan = oResultWindow.items.get(0);
                    if(pan.items.getCount() === 0){
                        pan.add({
                        title: value.titre,
                        html: html
                     });
                     }
                     else{ //Tri alphabétique des onglets
                         var newIndex = 0;
                         $.each(pan.items.items, function(index, tabPan){
                             if(value.titre > tabPan.title){
                                 newIndex = index+1;
                             }
                         });
                         
                         pan.insert(newIndex, {
                            title: value.titre,
                            html: html
                         });
                     }

                });
                oResultWindow.show();
            });
        });
    };
    
    Fonctions.createDateFromIsoString = function(isoDateString){		
    	var date = new Date();
    	var strArray = isoDateString.split("-");
    	switch(strArray.length){
                case 0:
                    alert("Le format de la date pour cette couche n'est pas supporté.");
                    break;
                case 1:
                    date.setUTCFullYear(strArray[0]);
                    break;
                case 2:
                    date.setUTCFullYear(strArray[0]);
                    date.setUTCMonth(strArray[1] - 1);
                break;
                case 3:     
                    if(strArray[2].split("T")[1]){
                        date.setUTCHours(strArray[2].split("T")[1].split(":")[0]);
                    }
                    date.setUTCDate(strArray[2].split("T")[0]);
                    date.setUTCMonth(strArray[1] - 1);
                    date.setUTCFullYear(strArray[0]);
                    break;
    	}
            
    	return date;
    };    
    
    Fonctions.rgbToHex = function(r, g, b){
        var componentToHex = function(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };
    
    Fonctions.convertirMesure = function(mesure, uniteDepart, uniteConvertie){
        if(!mesure || !uniteDepart || !uniteConvertie){return 0;}
        
        var metresParUniteDepart = this.obtenirMetresParUnite(uniteDepart);
        var metresParUniteConvertie = this.obtenirMetresParUnite(uniteConvertie);
        
        if(!metresParUniteDepart || !metresParUniteConvertie){return 0;}

        return mesure*metresParUniteDepart/metresParUniteConvertie;
    };
    
    
    Fonctions.obtenirPeriodeTemps = function(isoTimeString){
                   
            var timeExtentArray = isoTimeString.split("/");							
            var startDate = this.createDateFromIsoString(timeExtentArray[0]);
            var endDate=null;
            var allowIntervals=null;
            var defautPrecision;
            if(timeExtentArray.length>1){
                endDate = this.createDateFromIsoString(timeExtentArray[1]);
                allowIntervals = true;
                if(timeExtentArray[2]){
                    switch (timeExtentArray[2][timeExtentArray[2].length-1]){
                        case 'S':
                            defautPrecision = 'seconde';
                        break;
                        case 'M':
                            defautPrecision = 'minute';
                        break;
                        case 'H':
                            defautPrecision = 'heure';
                        break;
                        case 'D':
                            defautPrecision = 'jour';
                        break;
                        case 'M':
                            defautPrecision = 'mois';
                        break;
                        case 'Y':
                            defautPrecision = 'annee';
                        break;
                    }
                }
            } else{
                endDate = null;
                allowIntervals = false;
            }
            
             if(!defautPrecision){
                var strArray = timeExtentArray[0].split("-");
                var heureArray;
                switch(strArray.length){
                    case 1:
                        defautPrecision = 'annee';
                        break;
                    case 2:
                        defautPrecision = 'mois';
                        break;
                    case 3:   
                        defautPrecision = 'jour';
                        if(strArray[2].split("T")[1]){
                            heureArray = strArray[2].split("T")[1].split(':');
                        }
                        break;
                }
                if(heureArray){
                    switch(heureArray.length){
                        case 1:
                            defautPrecision = 'heure';
                            break;
                        case 2:
                            defautPrecision = 'minute';
                            break;
                        case 3:   
                            defautPrecision = 'seconde';
                            break;
                    }
                }
            }
            
              return {min: startDate,
                      max: endDate,
                      allowIntervals: allowIntervals,
                      precision: defautPrecision};
    };
    
   
    Fonctions.obtenirMetresParUnite = function(unite){
        var metres;
        switch(unite) {
            case 'm':
            case 'mètre':    
                metres = 1;
                break;    
            case 'km':
            case 'kilomètre':    
                metres = 1000;
                break; 
            case 'pied':
                metres = 0.304799999536704;
                break;         
            case 'mile':
                metres = 1609.3440;
                break;  
            case 'm²':
            case 'mètre²':    
                metres = 1;
                break;    
            case 'km²':
            case 'kilomètre²':    
                metres = 1000000;
                break; 
            case 'pied²':
                metres = 0.09290304;
                break;         
            case 'mile²':
                metres = 2589988.110336;
                break;  
            case 'acre':
                metres = 4046.85642; 
                break;  
            case 'hectare':
                metres = 10000; 
                break;  
        }
        return metres;
    };
    
    Fonctions.executerAction =  function (options) {
        var action = options.action; 
        var scope = options.scope || this;
        var params = options.params || undefined;
        if(typeof(action) === "string"){
            var actionLength=action.length;
            var isActionJs = action.substr(actionLength-3, actionLength) === '.js';
        };
        if(isActionJs){
            var action = action.substr(0, actionLength-3);
            var idAction = options.requireId || action;
            if(!requirejs.estDansConfig(idAction)){
                var path = {};
                path[idAction] = action;
                require.ajouterConfig({
                    paths: path
                });
            }
            var requireFct =  options.requireFct || function(actionJs) {
                if (actionJs){
                    Fonctions.executerAction({
                        action: actionJs,
                        params: params,
                        scope: scope
                    });
                }
            };
            require([idAction], requireFct); 
        } else {
            if(typeof(scope) === "string"){
                scope = new Function("params", "\
                        return " + scope + ";\n\
                    ").call(this, params);
            }
            if(options.paramsStr){
                params = new Function("params", "\
                        return " + options.paramsStr + ";\n\
                    ").call(scope, params);
            }
            
            if (typeof(action) !== "function"){
                var fn = (new Function("params", "\
                        return " + action + ";\n\
                     ")
                ).call(scope, params);

                if (typeof(fn) === "function"){
                    fn.call(scope, params); 
                }
                return;
            };
            action.call(scope, params);
        };
    };
    
    return Fonctions;
    
});