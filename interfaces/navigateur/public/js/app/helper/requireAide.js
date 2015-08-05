/** 
 * Module pour les fonctions {@link helper.require}.
 * @module requireAide
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['aide'], function(Aide) {
    /** 
     * @name helper.require
     * @mixin helper.require
     * @alias requireAide:helper.require
     * @requires requireAide
    */
   
   
    require.estDansConfig = function(indice){
        if(require.s.contexts._.config.paths[indice]){
            return true;
        }
        return false;
    }
   
    /** 
     * Ajout d'une config à require
     * @method 
     * @static
     * @param {dictionnaire} conf Config à ajouter
     * @param {String} conf.baseUrl Remplacer le path de base
     * @param {String} conf.relativePath Path à ajouter à baseUrl de require
     * @param {dictionnaire} conf.paths Dictionnaire des paths à ajouter. La clé est le surnom du module, et la valeur est le path du js (sans le '.js').
     * @name helper.require#ajouterConfig
    */
    require.ajouterConfig = function(conf){
        var debug = Aide.obtenirDebug();
        var base = '';// require.s.contexts._.config.baseUrl;
        if (conf.baseUrl){
            base = Aide.utiliserBaseUri(conf.baseUrl);
        };
        
        var paths = {};
        $.each(conf.paths, function(key, value) {
            if(debug && ((!conf.scope && require.s.contexts._.config.paths[key]) || (require.s.contexts._.config.map && require.s.contexts._.config.map[conf.scope] && require.s.contexts._.config.map[conf.scope][key]))){
                console.warn(key+" existe déjà dans la config");
            } else {
                var path = Aide.utiliserBaseUri(value, base);
                if(debug){
                    path = path.replace('%-build%', 'Require');
                } else {
                    path = path.replace('%-build%', '-build');
                }
                paths[key]=path;
                
                if(conf.shim){
                    if(conf.shim[key] && conf.shim[key].depsEnOrdre){
                        for(var i=conf.shim[key].depsEnOrdre.length-1; i>0; i--){
                            var plugin="";
                            var dep = conf.shim[key].depsEnOrdre[i];
                            if (!dep.match(/:\/\//)){
                                var splitPath = dep.split('!');
                                if(splitPath.length === 2){
                                    plugin = splitPath[0]+'!';
                                    dep = base+splitPath[1];
                                } else {
                                    dep = base+dep;
                                }
                            };
                            if(require.s.contexts._.config.paths[key+i] && debug){
                                console.warn(key+1+" existe déjà dans la config");
                            }

                            paths[key+i] = dep;
                            if(i === conf.shim[key].depsEnOrdre.length-1){
                                if(require.s.contexts._.config.shim[key] && debug){
                                    console.warn("Il y a déjà des dépendances pour " + key);
                                }
                                conf.shim[key].deps = [plugin+key+i];  
                            } else {
                                if(require.s.contexts._.config.shim[key+(i+1)] && debug){
                                    console.warn("Il y a déjà des dépendances pour " + key+(i+1));
                                }
                                conf.shim[key+(i+1)] = {deps: [plugin+key+i]};  
                            }                         
                        };
                    }                    
                }
            }
        });

        var config = {};
        if(conf.scope){
            config.map = {};
            config.map[conf.scope] = paths;
        } else {
            config.paths = paths;
        }
        
        if(conf.shim){
            config.shim = conf.shim;
        }
        
        if(conf.map){
            config.map = conf.map;
        }
        
        require.config(config);
    };
    
    require.enOrdre = function(modules, callback) {
        if(!modules){return;}
        
        var shim = require.s.contexts._.config.shim[modules[0]];
        if (shim) {
            modules = shim.deps.concat(modules);
        }

        function load(queue, results) {
            if (queue.length) {
                require([queue.shift()], function(result) {
                    results.push(result);
                    load(queue, results);
                });
            } else {
                console.log(callback);
                callback.apply(null, results);
            }
        }

        load(modules, []);
    };
    
});