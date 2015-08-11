<?php echo $this->getContent(); ?>


(function(){
    var debug=false;
    <?php if(isset($this->config->application->debug) && $this->config->application->debug){
        echo 'debug='.$this->config->application->debug.';';
    }
    ?>
   
    var sPageURL =window.location.search.substring(1),sURLVariables=sPageURL.split("&");
    for(var i=0; i<sURLVariables.length; i++){
        var sParameterName=sURLVariables[i].split("=");
        if(sParameterName[0]=='debug') {
            debug= isNaN(Number(sParameterName[1])) ? Boolean(sParameterName[1]) : Number(sParameterName[1]);
        };
    }
    
    var baseUri = "<?php echo $this->url->getBaseUri() ?>";
    var version = "<?php echo $this->config->application->version ?>";
    var buildIGO = ['build'];
    if(debug){
        if(version === 'aleatoire'){
            version=new Date().getTime();
        }
        buildIGO=[];
    };
    
    {% include "partials/requireConfig.volt" %}

    require(buildIGO, function(){
        var igoNavReq = ['aide', 'browserDetect', 'fonctions', 'analyseurConfig'];
        var igoAideReq = ['requireAide', 'proj4js', 'epsgDef' ];

        var igoReq = igoNavReq.concat(igoAideReq);
        require(igoReq, function (Aide) {
            var aReqSize = igoNavReq.length;
            var argsObj = $.map(arguments, function(value) {return [value];});
            
            Igo = Aide.getRequisObjet(igoNavReq, argsObj.splice(0,aReqSize));

            //=============================================
           
            //Config
            Aide.definirVersion(version);
            Aide.definirDebug(debug);
            
            {% include "partials/configClient.volt" %}
                
            var utilisateur = "<?php echo $utilisateur?>";
            var profil = "<?php echo $profil?>";
            var titreProfil = utilisateur;
            if("<?php echo $utilisateur ?>" === ''){
                titreProfil = "Invité";
            }
            if(profil && profil !== ""){
                titreProfil += " - " + profil;
            }
            
            Aide.profil = {
                titre: titreProfil,
                utilisateur: utilisateur,
                profil: "<?php echo $profil?>",
                nbProfils: "<?php echo $nbProfil ?>"
            }
            var messageAvertissement = "";
            {% if avertissement is defined %}
                messageAvertissement = "{{avertissement|escape}}";
            {% endif %}
            var analyseur = new Igo.AnalyseurConfig({
                configuration: configuration !== 'null' ? configuration : undefined, 
                contexteId: contexteId !== 'null' ? contexteId : undefined, 
                contexteCode: contexteCode !== 'null' ? contexteCode : undefined, 
                coucheId: coucheId !== 'null' ? coucheId : undefined, 
                avertissements: messageAvertissement, 
                callback: callbackInitIGO !== 'null' ? callbackInitIGO : undefined
            });
            Igo = $.extend(Igo, analyseur.charger());  
        });
    });
})();
