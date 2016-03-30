define([], function(){

    function IgoNav(options){
        this.options = options || {};
        this.init();
    };

    IgoNav.prototype.init = function(){
        var that=this;
        this.debug= this.options.debug || false; 
        this.baseUri = this.options.uri.navigateur;
        this.version = this.options.version || '0.0.0';
        this.buildIGO = ['build'];
        this.listeCallback = this.options.callbackInitIGO !== null ? [this.options.callbackInitIGO] : []; 
        this.messageAvertissement = this.options.messageAvertissement;

        this.utilisateur = this.options.utilisateur;
        this.profil = this.options.profil;
        this.nbProfil = this.options.nbProfil;

        this.configuration = this.options.configuration;
        this.contexteId = this.options.contexteId;
        this.contexteCode = this.options.contexteCode;
        this.coucheId = this.options.coucheId;

        this.configClient = this.options.configClient;

        this.modulesFct = this.options.modulesFct || [];

        this.verifDebugUrl();
        this.setDebugParam();

        this.requireError();

        if(this.options.requireConfigFct){
            this.options.requireConfigFct(this.version, this.debug, this.options.uri);
            this.requireBuildIgo();
        } else if (this.options.requireConfigUrl){
            require([this.options.requireConfigUr], function(requireConfigFct){
                requireConfigFct(this.version, this.debug, this.options.uri);
                that.requireBuildIgo();
            });
        } else {
            this.requireBuildIgo();
        }
    }

    IgoNav.prototype.requireError = function(){
        var that = this;
        requirejs.onError = function (err) {
            console.log(err);
            var messageErreur = "Erreur chargement ("+err.requireType+"): Le module '" + err.requireModules + "' n'a pas été chargé";
            console.warn(messageErreur);

            if(!that.nav || !that.nav.nav || !that.nav.nav.isReady){
                setTimeout(function(){
                    if($("#igoLoading").length !== 0){
                        $("#igoLoading").remove();
                        var html = "<p style=\"padding:10px;font-size: 20px;\"><b>503 Site temporairement indisponible ou en maintenance</b></p>";
                        html += "<p style=\"padding:10px;\">" + messageErreur + "</p>"
                        $("#igoInstance").html(html);
                    }
                }, 1500);
            }

            throw new Error("Le module '" + err.requireModules + "' n'a pas été chargé: " + err.originalError.target.src);
        };
    }

    IgoNav.prototype.requireBuildIgo = function(){
        var that = this;
        require(this.buildIGO, function(){
            that.igoNavReq = ['aide', 'browserDetect', 'fonctions', 'analyseurConfig'];
            var igoAideReq = ['requireAide', 'proj4js', 'epsgDef' ];
            var igoReq = that.igoNavReq.concat(igoAideReq);
            require(igoReq, $.proxy(that.creerIgoInstance, that));
        });
    };

    IgoNav.prototype.creerProfil = function(Aide){
        var titreProfil = this.utilisateur;
        if(titreProfil === ''){
            titreProfil = "Invité";
        }
        if(this.profil && this.profil !== ""){
            titreProfil += " - " + this.profil;
        }

        Aide.profil = {
            titre: titreProfil,
            utilisateur: this.utilisateur,
            profil: this.profil,
            nbProfils: this.nbProfil
        }
    }

    IgoNav.prototype.creerIgoInstance = function(Aide){
        var aReqSize = this.igoNavReq.length;
        var argsObj = $.map(arguments, function(value) {return [value];});
        
        Igo = $.extend({}, Aide.getRequisObjet(this.igoNavReq, argsObj.splice(0,aReqSize)));

        //=============================================
       
        //Config
        Aide.definirVersion(this.version);
        Aide.definirDebug(this.debug); 
            
        this.creerProfil(Aide);
        this.setConfigClient(Aide);
        this.executerModulesFct(Aide);

        this.analyserConfig();
    };


    IgoNav.prototype.setConfigClient = function(Aide){
        var that = this;
        define("configuration", [], function() {
            return that.configClient;
        })

        Aide.definirConfig(this.configClient);
    }

    IgoNav.prototype.executerModulesFct = function(Aide){
        var that = this;
        $.each(this.modulesFct, function(key, fct){
            fct.call(that, that.configClient, Aide);
        });
    }


    IgoNav.prototype.analyserConfig = function(){
        var analyseur = new Igo.AnalyseurConfig({
            configuration: this.configuration !== 'null' ? this.configuration : undefined, 
            contexteId: this.contexteId !== 'null' ? this.contexteId : undefined, 
            contexteCode: this.contexteCode !== 'null' ? this.contexteCode : undefined, 
            coucheId: this.coucheId !== 'null' ? this.coucheId : undefined, 
            avertissements: this.messageAvertissement, 
            callback: $.proxy(this.executerCallback, this)
        });
        this.nav = analyseur.charger();
        Igo = $.extend(Igo, this.nav);  

    };

    IgoNav.prototype.verifDebugUrl = function(){
        var that = this;
        var sPageURL =window.location.search.substring(1),sURLVariables=sPageURL.split("&");
        for(var i=0; i<sURLVariables.length; i++){
            var sParameterName=sURLVariables[i].split("=");
            if(sParameterName[0]=='debug') {
                that.debug= isNaN(Number(sParameterName[1])) ? Boolean(sParameterName[1]) : Number(sParameterName[1]);
            };
        }
    };

    IgoNav.prototype.setDebugParam = function(){
        if(this.debug){
            if(this.version === 'aleatoire'){
                this.version=new Date().getTime();
            }
            this.buildIGO=[];
        };
    };

    IgoNav.prototype.executerCallback = function(){
        $.each(this.listeCallback, function(key, callback){
            callback();
        });
    }

    IgoNav.prototype.ajouterCallback = function(fct){
        this.listeCallback.push(fct);
    }

    return IgoNav;
});
