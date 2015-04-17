define(['aide'], function(Aide){

    return{
        load : function(name, req, onLoad, config){
            var deps = [];
            if (config.shim[name]){
                deps = config.shim[name].deps;
            }
            
            req(deps, function(){
                Aide.chargerJS(req.toUrl(name)+'.js', function(){
                    onLoad(null);
                });
            });
        }
    };
});
