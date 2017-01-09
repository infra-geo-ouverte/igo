/** 
 * Module pour les fonctions {@link helper.Aide}.
 * @module aide
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define([], function() {

    /** 
     * @name helper.Aide
     * @mixin helper.Aide
     * @alias aide:helper.Aide
     * @requires aide
    */
    function Aide(){};
    
    /** 
     * Convertir la région IGO en région ExtJS
     * @method 
     * @static
     * @param {String} region Région IGO
     * @name helper.Aide#_obtenirTermeAnglais
     * @returns {String} Région ExtJS
    */
    Aide._obtenirTermeAnglais = function(region){
        region = region.toLowerCase();
        switch(region){
            case "droite":
            case "est":
                return "east";
            case "gauche":
            case "ouest":
                return "west";
            case "bas":
            case "sud":
                return "south";
            case "haut":
            case "nord":
                return "north";
            default:
                return "";
        };
    };



    Aide.toBoolean =function(valeur){
        if (typeof valeur === 'boolean'){
            return valeur;
        } else if (typeof valeur === 'string'){
            switch(valeur.toLowerCase()){
                    case "true": case "oui": case "vrai": case "1": return true;
                    case "false": case "non": case "faux": case "0": case null: return false;
                    default: return false;
            }
        } else if (valeur === null) {
            return false;
        }
    }



    /** 
     * Obtenir le hote du navigateur
     * @method 
     * @static
     * @name helper.Aide#obtenirHote
     * @returns {String} Hote
    */
    Aide.obtenirHote = function(sansSlash){
        var hote = window.location.protocol + "//" + window.location.host;
        if(sansSlash){
            return hote;
        }
        return hote+ "/";
    };
    
    Aide.obtenirConfig = function(param){
        if (this.config && param){            
            var obj = this.config;
            var proprieteSplited = param.split('.');

            $.each(proprieteSplited, function(key, value) {
                if (!obj) {
                    return undefined;
                }
                obj = obj[value];
            });
            return obj;
        }
        return this.config;
    };

    Aide.definirConfig = function(config){
        this.config = config;
    };
    
    Aide.obtenirConfigXML = function(param){
        if (this.configXML && param){            
            var obj = this.configXML;
            var proprieteSplited = param.split('.');

            $.each(proprieteSplited, function(key, value) {
                if (!obj) {
                    return undefined;
                }
                obj = obj[value];
            });
            return obj;
        }
        return this.configXML;
    };

    Aide.definirConfigXML = function(configXML){
        this.configXML = configXML;
    };
    
    Aide.obtenirProfil = function(param){
        if (this.profil && param){            
            return this.profil[param];
        }
        return this.profil;
    };

    Aide.definirProfil = function(profil){
        this.profil = profil;
    };
    
    /** 
     * Obtenir le proxy
     * @method 
     * @static
     * @name helper.Aide#obtenirProxy
     * @returns {String} Proxy
    */
    Aide.obtenirProxy = function(avecParam){
        if(avecParam){
            return this.obtenirConfig('uri.api')+"service/?_service=";
        }
        return this.obtenirConfig('uri.api')+"service/";
    };
    
    Aide.utiliserProxy = function(url, toujoursUtiliser){
        url = this.utiliserBaseUri(url) || "";
        var r = new RegExp('^(http|https)', 'i');
        
        var urlExclusProxy= this.obtenirConfig("urlExclusProxy") || [];
        var exclu = false;
        $.each(urlExclusProxy, function(key, value){
            if(url.search(value) === 0){
                exclu = true;
                return false;
            }
        });
        if(exclu){
            return url;
        }
        
        var iAdresse = url.search(/\?|&/);
        
        var adresse, params, urlC;
        if(iAdresse === -1){
            adresse = url;
            urlC = adresse;
        } else {
            adresse = url.substr(0, iAdresse);
            params = url.substr(iAdresse+1);
            urlC = params ? adresse + '&' + params : adresse;
        }

        if(adresse[0] === '[' && adresse[adresse.length-1] === ']'){
            adresse = adresse.substr(1, adresse.length-2);
            urlC = params ? '?' + params : "";
            return this.obtenirProxy() + adresse + urlC;
        }
        if(toujoursUtiliser){
            if(!r.test(adresse)) {
                return this.obtenirProxy(true) + this.obtenirHote(true) + urlC;
            }
        }
        if (!toujoursUtiliser && (adresse.search(this.obtenirHote()) === 0 || (!r.test(adresse)))){
            return params ? adresse + '?' + params : adresse;
        }
        return this.obtenirProxy(true) + urlC;
    };
    
    
    Aide.utiliserBaseUri = function(url, cheminRacine){
        var lBracket = url.indexOf("[");  //[edition]
        var rBracket = lBracket !== -1 ? url.indexOf("]") : -1;
        if(rBracket !== -1){
            var uriConfig = url.substring(lBracket+1, rBracket);
            var uri = this.obtenirConfig('uri')[uriConfig];
            if(!uri){return url}
            url = url.substring(0, lBracket) + uri + url.substring(rBracket+1);
        };
        
        if(!url){
            return undefined;
        }
        var r = new RegExp('^(http|https|/)', 'i');
        if(r.test(url)) {
            return url;
        }

        if(cheminRacine === undefined || cheminRacine === true){
            return this.obtenirCheminRacine()+url;
        } else if(!cheminRacine){
            return url;
        }
        return cheminRacine+url;
    };
    
    /** 
     * Obtenir le chemin de la racine
     * @method 
     * @static
     * @name helper.Aide#obtenirCheminRacine
     * @returns {String} Racine
    */
    Aide.obtenirCheminRacine= function(){
        return this.obtenirConfig("uri.navigateur");
        //return this.cheminRacine;
    };
    
    
    /** 
     * Obtenir le paramètre dans un url
     * @method 
     * @static
     * @name helper.Aide#obtenirParametreURL
     * @param {String} sParam Paramètre voulu
     * @param {String} [url] Si absent, url du navigateur.
     * @param {Boolean} [array] Retourne un array
     * @returns {String} Valeur du paramètre
    */
    Aide.obtenirParametreURL = function(sParam, url, array) {
        if(url){
            var urlArray = url.split('?');
            if (urlArray.length===2){
                url=urlArray[1];
            }
        }
        var sPageURL = url || window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        var arrayValue = [];
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                if(array){
                    arrayValue.push(decodeURIComponent(sParameterName[1]));
                } else {
                    return decodeURIComponent(sParameterName[1]);
                }
            };
        };    
        return array ? arrayValue : undefined;    
    };
    
    /** 
     * Obtenir le navigateur
     * @method 
     * @static
     * @name helper.Aide#obtenirNavigateur
     * @returns {Navigateur} Navigateur
    */
    Aide.obtenirNavigateur = function(){
        return this.navigateur;
    };
    
    /** 
     * Définir le navigateur
     * @method 
     * @static
     * @name helper.Aide#definirNavigateur
     * @param {Navigateur} nav Navigateur
    */
    Aide.definirNavigateur = function(nav){
        this.navigateur = nav;
    };

    /** 
     * Définir la version
     * @method 
     * @static
     * @name helper.Aide#definirVersion
     * @param {Version} version Version
    */
    Aide.definirVersion = function(version){
        this.version = version;
    };    

    /** 
     * Obtenir la version
     * @method 
     * @static
     * @name helper.Aide#obtenirVersion
     * @returns {numeric} Version* 
    */
    Aide.obtenirVersion = function(){
        return this.version;
    };        

    /** 
     * Charger le css
     * @method 
     * @static
     * @name helper.Aide#chargerCSS
     * @param {String} url Lien vers le css
     * @param {Boolean} base Utiliser la base?
    */
    Aide.chargerCSS = function(url, base) {
        var windowIGO = typeof window !== 'undefined' ? window : null;
        if(!windowIGO){
            return true;
        }
        
        var link = windowIGO.document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        if (base){
            url = this.obtenirCheminRacine() + url;
        }
        link.href = url + "?version=" + Aide.obtenirVersion();
        if(!$("link[href='"+url+"']").length){
            windowIGO.document.getElementsByTagName("head")[0].appendChild(link);
        };
    };

    /** 
     * Charger le javascript
     * @method 
     * @static
     * @name helper.Aide#chargerJS
     * @param {String} url Lien vers le js
    */
    Aide.chargerJS = function(url, arg1, arg2) {
        var cache = true, callback = null;
        //arg1 and arg2 can be interchangable
        if ($.isFunction(arg1)){
          callback = arg1;
          cache = arg2 || cache;
        } else {
          cache = arg1 || cache;
          callback = arg2 || callback;
        }

        var load = true;
        //check all existing script tags in the page for the url
        jQuery('script[type="text/javascript"]')
          .each(function () { 
            return load = (url != $(this).attr('src')); 
          });
        if (load){
          //didn't find it in the page, so load it
          jQuery.ajax({
            type: 'GET',
            url: url,
            success: callback,
            dataType: 'script',
            cache: cache
          });
        } else {
          //already loaded so just call the callback
          if (jQuery.isFunction(callback)) {
            callback.call(this);
          };
        };
    };

    /** 
    * Afficher un message à l'utilisateur
    * @method 
    * @name Aide#afficherMessage
    * @param {String} titre Titre du message
    * @param {String} message Corps du message
    * @param {String} [boutons='OK'] Actions possibles pour l'utilisateur. Choix: OKCANCEL, YESNO, YESNOCANCEL, OK
    * @param {String} [icone='INFO'] Icone du message. Choix: QUESTION' WARNING, ERROR, INFO
    */
    Aide.afficherMessage = function(titre, message, boutons, icone) {
        var opt = {};
        if(titre instanceof Object){
            opt=titre;
            message = opt.message;
            boutons = opt.boutons;
            icone = opt.icone;
            titre = opt.titre;
        };
        
        var boutonExt = Ext.MessageBox.OK;
        if(boutons){
            switch(boutons.toUpperCase()){
                case "OKCANCEL":
                case "OKANNULER":
                    boutonExt = Ext.MessageBox.OKCANCEL;
                    break;
                case "YESNO":
                case "OUINON":
                    boutonExt = Ext.MessageBox.YESNO;
                    break;
                case "YESNOCANCEL":
                case "OUINONANNULER":
                    boutonExt = Ext.MessageBox.YESNOCANCEL;
                    break;
                case "OK":
                default:
                    boutonExt = Ext.MessageBox.OK;
            };
        };
        
        var iconeExt = Ext.MessageBox.INFO;
        if(icone){
            switch(icone.toUpperCase()){
                case "QUESTION":
                    iconeExt = Ext.MessageBox.QUESTION;
                    break;
                case "WARNING":
                case "ATTENTION":
                    iconeExt = Ext.MessageBox.WARNING;
                    break;
                case "ERROR":
                case "ERREUR":
                    iconeExt = Ext.MessageBox.ERROR;
                    break;
                case "INFO":
                default:
                    iconeExt = Ext.MessageBox.INFO;
            };
        };
        
        var extOptions = {
            title: titre,
            msg: message,
            buttons: boutonExt,
            icon: iconeExt
        };
        
        if(opt.action){
            extOptions.fn = opt.action;
        }
        
        Ext.MessageBox.show(extOptions);

        /*var windowTest = new Ext.Window({
            width: 300,
            height: 120,
            autoDestroy: true,
            title: titre,
            modal: true,
            layout: 'fit',
            bodyStyle: 'border:none; background-color: transparent;',
            buttonAlign: 'center',
            items: [{
                xtype: 'container',
                html: message
            }],
            buttons: [{
                text: 'Ok',
                listeners: {
                    click: {
                        fn: function (item, e) {
                            windowTest.close();
                        }
                    }
                }
            }]
        });
        
        windowTest.show();*/

    };

    Aide.afficherMessageChargement = function(opt){
        opt = opt || {};
        Ext.MessageBox.show({
            title: opt.titre || 'Chargement...',
            msg: opt.message || 'Patientez un moment...',
            progressText: 'Chargement...',
            width:300,
            wait:true,
            buttons: opt.boutons, //{cancel: 'Annuler'}
            fn: opt.callback,
            waitConfig: {interval:200}
        });
    };

    Aide.cacherMessageChargement = function(){
        Ext.MessageBox.hide();
    };
    
    Aide.getRequisObjet = function(listRequis, args, upperCase){
        var listRequireObj={};
        $.each(listRequis, function( key, value ) {
            if (upperCase !== false){
                var value = value.charAt(0).toUpperCase() + value.substring(1);
            }
            listRequireObj[value]=args[key];
        });
        return listRequireObj;
    };
    
    /** 
    * Afficher un message dans la console
    * @method 
    * @name Aide#afficherMessage
    * @param {String} message message à afficher
    * @param {String} niveau Niveau d'importance du message
    */
    Aide.afficherMessageConsole = function(message, niveau) {
        
        var opt = {};
        var bouton = Ext.get('boutonConsole');
        var boutonDiv = Ext.get('boutonConsoleDiv'); 
        var styleNiveauFaible = " style='color:black;'";
        var styleNiveauMoyen = " style='color:orange;'";
        var styleNiveauEleve = " style='color:red;'"; 
        
        if(message instanceof Object){
            opt=message;
            var message = opt.message;
            var niveau = opt.niveau;
        };
        
        switch(niveau){
            case 'faible':
                message = '<p' + styleNiveauFaible + '>' + message + '<p>'; 
            break;  
             case 'moyen':
                message = '<p' + styleNiveauMoyen + '>' + message + '<p>'; 
            break;
            case 'eleve':
                message = '<p' + styleNiveauEleve + '>' + message + '<p>'; 
            break;
            default:
                message = '<p' + styleNiveauFaible + '>' + message + '<p>';
        }
        if(!bouton){
            var nav = this.obtenirNavigateur();
            if(nav && nav.analyseur){
                nav.analyseur.avertissements.push(message);
            }
            return true;
        }
        
        if(!bouton.win){
            
            bouton.dom.textContent = 1;
                  
            bouton.win = new Ext.Window({
                applyTo:'windowConsole',
                layout:'fit',
                width:"40%",
                height:300,
                closeAction:'hide',
                title:'Log des messages IGO',
                plain: true,
                items: {
                    xtype: "htmleditor",
                    itemId: 'message',
                    hideLabel: true,
                    readOnly: true,
                    enableAlignments:false,
                    enableColors:false,
                    enableFont:false,
                    enableFontSize:false,
                    enableFormat:false,
                    enableLinks:false,
                    enableSourceEdit:false,
                    width: 500,
                    height: 50,
                    allowBlank: true,
                    value:message
                },

                buttons: [{
                    text: 'Fermer',
                    handler: function(){
                        bouton.win.hide();
                    }
                }]
            });
                
            bouton.win.getComponent('message').getToolbar().hide();
            
            bouton.on('click', function(){
                this.win.show(this);
            });
        }
        else{
            
            bouton.dom.textContent = Number(bouton.dom.textContent) + 1;
            bouton.win.getComponent('message').setValue(bouton.win.getComponent('message').getValue()+message);
        }
        
        boutonDiv.setVisible(true);

    };
    
    Aide.afficherFenetre = function(opt) {
        opt = opt || {};
        if(this.win){
           this.win.destroy(); 
        }
        this.win = new Ext.Window({
            title: opt.titre,
            width:300,
            closeAction:'destroy',
            resizable:true,
            minimizable:false,
            html: opt.message,
            padding: 5,
            buttons: [{
                text: 'Fermer',
                scope: this,
                handler: function(){this.win.destroy();}
            }]
        });
        this.win.show();
    };
    
    /** 
    * Afficher l'infobulle sur la carte
    * @method 
    * @name Aide#afficherInfobulle
    * @param {String} contenu Contenu à afficher dans l'infobulle (texte, image, etc.)
    * @param {String} options Options sur le style et l'emplacement de l'infobulle
    */
    Aide.afficherInfobulle = function(contenu, options) {
        options = options || {};
        var $divInfobulle = $('#divInfobulle');
        // Si l'infobulle n'est pas déjà créée, en faire la création
        if ($divInfobulle.length == 0){
            $('<div />').attr('id', 'divInfobulle').css({ 'position': 'absolute', 'height': 'auto', 'width': 'auto', 'z-index': '9000', 'display': 'none' }).appendTo(document.body);
            $divInfobulle = $('#divInfobulle');
        }
        
        // Mettre le contenu dans l'infobulle
        $divInfobulle.html(contenu);           
        
        // Si un style a été fourni, l'appliquer à l'infobulle
        if (options.css){
            $divInfobulle.css(options.css);
        }
        
        // Si une position a été fournie, postionner l'infobulle à l'endroit demandé. Par défaut, l'infobulle s'affiche à l'endroit où le curseur de la souris est positionné sur la carte
        if (options.x){
            $divInfobulle.css({ 'left': options.x + 'px' });
        } else {
            // Éviter que l'infobulle s'affiche en dehors de l'écran
            var x = this.obtenirNavigateur().obtenirPanneauxParType('PanneauCarte')[0]._panel.x + Math.round(this.obtenirNavigateur().carte.coordSouris.x);
            if (x + $divInfobulle.width() > $(window).width()){
                x -= $divInfobulle.width();
            }
            $divInfobulle.css({ 'left': x + 'px' });        
        }

        if (options.y){
            $divInfobulle.css({ 'top': options.y + 'px' });            
        } else {
            // Éviter que l'infobulle s'affiche en dehors de l'écran
            var y = Math.round(this.obtenirNavigateur().carte.coordSouris.y) + this.obtenirNavigateur().obtenirPanneauxParType('PanneauCarte')[0]._panel.y - $divInfobulle.height() - 4;
            if (this.obtenirNavigateur().obtenirBarreOutils()){
                y += this.obtenirNavigateur().obtenirBarreOutils()._panelContainer.getTopToolbar().getHeight();            
            }
            if (y - $divInfobulle.height() < 0){
                y += $divInfobulle.height();
            }
            $divInfobulle.css({ 'top': y + 'px' });
        }
        
        // Afficher l'infobulle
        $divInfobulle.show();
    };

    /** 
    * Cacher l'infobulle
    * @method 
    * @name Aide#cacherInfobulle
    */
    Aide.cacherInfobulle = function(){
        $('#divInfobulle').hide();
    };
   
    Aide.obtenirDebug = function(){
        return this.debug;
    };
    
    Aide.estDebug = function(){
        return !!this.debug;
    };
    
    Aide.definirDebug = function(debug){
        this.debug = debug;
    };
    
    return Aide;
});
