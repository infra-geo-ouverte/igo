define(['aide'], function(Aide){
    return{
        load : function(name, req, onLoad, config){
            var deps = [];
            if (config.shim[name]){
                deps = config.shim[name].deps;
            }
            
            req(deps, function(){
                if(name.substr(0,4) === 'css/'){
                    name = '././' + name;
                }
                
                var path = req.toUrl(name);
                var cssPath = path;
                var indexOfQueryString = path.indexOf("?");
                if(indexOfQueryString  > -1){
                    cssPath = path.substring(0,indexOfQueryString);
                }
                
                Aide.chargerCSS(cssPath+'.css', false);
                onLoad(null);
            });
        }
    };
});
