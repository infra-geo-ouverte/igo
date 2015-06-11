/** 
 * Module pour l'objet {@link Couche.WMS}.
 * @module wms
 * @requires couche 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['couche', 'aide', 'browserDetect'], function(Couche, Aide, BrowserDetect) {
    /** 
     * Création de l'object Couche.WMS.
     * Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.WMS
     * @class Couche.WMS
     * @alias wms:Couche.WMS
     * @extends Couche
     * @requires wms
     * @param {String} [options.titre] Titre de la couche
     * @param {String} [options.url] URL du WMS
     * @param {String} [options.nom] Nom du ou des layers WMS (Si plusieurs, les noms doivent être séparés par une virgule)
     * @returns {Couche.WMS} Instance de {@link Couche.WMS}
     * @exception Vérification de l'existance de d'un url et d'un nom
    */
    function WMS(options){
        this.options = options || {};
        if(!this.options.layerOL){
            if (!this.options.url) {
                throw new Error("Igo.WMS a besoin d'un url");
            }   
            
            if (!this.options.nom && !this.options.mode) {
                throw new Error("Igo.WMS a besoin d'un nom");
            }    
        }

        if(this.options.nom){
            this.options.nom = this.options.nom.replace(", ",",");
        }
        if(this.options.url && this.options.url.lastIndexOf("?")===-1){
            this.options.url=this.options.url+'?';
        }
        if(Aide.toBoolean(this.options.utiliserProxy)){
            this.options.url=Aide.utiliserProxy(this.options.url, true);
        }
        
        this.defautOptions.version = "1.1.1";
        
        this._optionsOL = {
            queryable: true,
            singleTile: true
        };
        
        if(!this.options.mode){
            this._init();
        }
    };
    
    WMS.prototype = new Couche();
    WMS.prototype.constructor = WMS;
    
    /** 
     * Initialisation de l'object WMS.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.WMS#_init
    */
    WMS.prototype._init = function(target, callback, optCalback){   
        if (!this.options.layerOL){
            Couche.prototype._init.call(this);
            
            var transparenceActi = true;
            
            if(this.options.format !== undefined && (this.options.format === "jpeg" || this.options.format === "jpg")){
                transparenceActi = false;
            }
            
            var parametreWMS = {
                layers: this.options.nom,
                transparent: transparenceActi, 
                version: this.options.version
            };
            if (this.options.mapdir){
                parametreWMS.map = this.options.mapdir;
            }

            this._layer = new OpenLayers.Layer.WMS(
                this.options.titre||this.options.nom,
                this.options.url,
                parametreWMS, 
                this._optionsOL
            );

            if(this.options.extraParams){
                if($.type(this.options.extraParams) === "string"){
                    var stringExtraParams = this.options.extraParams.replace("'","\"", 'g');
                    var arrayExtraParams = stringExtraParams.split(',');
                    for (var i = 0; i < arrayExtraParams.length; i++){
                        var splitExtraParams = arrayExtraParams[i].split('=');
                        this._layer.mergeNewParams(JSON.parse("{\"" + splitExtraParams[0] + "\":" + splitExtraParams[1] + "}"));
                    }
                } else {
                    this._layer.mergeNewParams(this.options.extraParams);
                }
            }
    
            if(this.options.mode){
                Couche.prototype._ajoutCallback.call(this, target, callback, optCalback);
            }
        } else {
            this._layer = this.options.layerOL;
        }
        
        this._layer.events.register('loadend',this,this._validerChargement);
    };

    /** 
     * Appelé lors de l'ajout de la couche à la carte si le mode GetCapabilities est activé.
     * @method 
     * @private
     * @name Couche.WMS#_getCapabilities
    */
    WMS.prototype._getCapabilities = function(target, callback, optCalback){
        var tjrsProxy = this.options.encodage ? true : false;
        $.ajax({
            url: Aide.utiliserProxy(this.options.url, tjrsProxy),//this.options.url.split('?')[0],
            data: {
                SERVICE: "WMS",
                VERSION: this.options.version || this.defautOptions.version,
                REQUEST: "GetCapabilities",
                _encodage: this.options.encodage //"wms_encoding" "ISO-8859-1"
            },
            //crossDomain: true, //utilisation du proxy
            async:false,
            context:this,
            dataType:'xml',
            success:function(response) {
                this._getCapabilitiesSuccess(response, target, callback, optCalback);
            },
            error:function(e){this._getCapabilitiesError(e, target, callback, optCalback);}
        });
    };
    
    WMS.prototype._getCapabilitiesSuccess = function(response, target, callback, optCalback){
        var that=this;
        if(!response){
            this._getCapabilitiesError();
            return false;
        }
        var xml=new OpenLayers.Format.WMSCapabilities().read(response);
        var i=0;
        var xmlOptions = {};
        var capabilityLayers, arrayLayers, len;
        //InfoFormat absent dans le fichier contexte alors on le prend 
        //dans le getCapabilities pour le nouveau GetInfo
        if(!this.options.infoFormat && xml.capability.request.getfeatureinfo !== undefined ){
           var arrayInfoFormat = xml.capability.request.getfeatureinfo.formats;
             for (var i = 0; i < arrayInfoFormat.length; i++){
                if (arrayInfoFormat[i] == "text/html"){
                   this.options.infoFormat= "html";
               } else if(arrayInfoFormat[i] == "application/vnd.ogc.gml") {
                   this.options.infoFormat= "gml";
               }
            }
        }
        if(!this.options.nom){
            capabilityLayers=xml.capability.nestedLayers;
        } else {
            arrayLayers = this.options.nom.split(',');
            len = arrayLayers.length;
            capabilityLayers=xml.capability.layers;
        }
        $.each(capabilityLayers, function(key,value){ 
            if((!that.options.nom) || jQuery.inArray(value.name, arrayLayers)>=0){
                i++;              
                if(!that.options._merge){                    

                   var parcourirLayerXML = function(value, groupe){
                        var layers=value;
                        if(value.nestedLayers.length!==0){
                            layers = value.nestedLayers;
                            groupe=value.title;
                            $.each(layers, function(key2, value2){
                                parcourirLayerXML(value2, groupe);
                            });
                        } else {
                            xmlOptions = {
                                titre: value.title,
                                droit: value.attribution ? value.attribution.href : undefined,
                                echelleMin: value.minScale,
                                echelleMax: value.maxScale
                            };
                            if(groupe){
                                xmlOptions.groupe=groupe;
                            }

                            if(value.dataURL && value.dataURL.format === 'msp'){ //"wms_dataurl_format" "text/xml"
                                var idMeta = value.dataURL.href;
                                //todo: utiliser config pour lien vers geonetwork
                                var mspClassMeta = idMeta;//"http://spssogl20.sso.msp.gouv.qc.ca/geonetwork/srv/eng/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&outputSchema=csw:IsoRecord&ID="+idMeta+"&elementSetName=full";
                                xmlOptions.metadonnee = mspClassMeta; //"wms_dataurl_href" "/path/to/metdata3.xml" ou numéro de mspClassMeta
                            }
                            $.extend(xmlOptions, that.options);
                            xmlOptions.mode=false;
                            xmlOptions.nom=value.name;
                            target.ajouterCouche(new WMS(xmlOptions));
                        } 
                    };

                    parcourirLayerXML(value, value.title);

                    if (len===1){
                        return false;
                    };
                } else if (i===1){
                    xmlOptions = {
                        titre: value.title,
                        droit: value.attribution ? value.attribution.href : undefined,
                        echelleMin: value.minScale,
                        echelleMax: value.maxScale,
                        groupe: "Couches WMS ajoutées" //Aide.obtenirParametreURL('layer',value.styles[0].legend.href).replace('_',' ','g')
                    };
                    if (len===1){
                            return false;
                    };
                } else {
                    xmlOptions.titre = xmlOptions.titre + ', ' + value.title;
                    if(!xmlOptions.echelleMin || value.minScale > xmlOptions.echelleMin){
                        xmlOptions.echelleMin = value.minScale;
                    }
                    if(!xmlOptions.echelleMax || value.maxScale < xmlOptions.echelleMax){
                        xmlOptions.echelleMax = value.maxScale;
                    }
                }
            }
        });
        if(i===0){
            throw new Error("Layers introuvables");
        }
        if(len===1 && that.options._merge){
            this.options=$.extend(xmlOptions, this.options);
            this._init(target, callback, optCalback);
        }
    }

    WMS.prototype._getCapabilitiesError = function(response, target, callback, optCalback){
        response = response || {};
        if(response.status != 200){    
            Aide.afficherMessageConsole('Erreur WMS: GetCapabilities: <br>Le GetCapabilities pour \''+this.options.url+'\' a échoué. <br>'+response.responseText);
            return false;
        }
        if(BrowserDetect.browser == "Explorer"){
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.validateOnParse = false;
            xmlDoc.resolveExternals = false;
            var parsed=xmlDoc.loadXML(response.responseText);
            
            if(!parsed) {
                var myErr = xmlDoc.parseError;
                Aide.afficherMessage('Erreur WMS: GetCapabilities', 'Le GetCapabilities pour \''+this.options.url+'\' a échoué. <br>'+myErr.reason, 'OK', 'ERREUR');
            } else {
                this._getCapabilitiesSuccess(xmlDoc, target, callback, optCalback);
            }
            return false;
        } 
        Aide.afficherMessage('Erreur WMS: GetCapabilities', 'Le GetCapabilities pour \''+this.options.url+'\' a échoué.', 'OK', 'ERREUR');
    }

    WMS.prototype._ajoutCallback = function(target, callback, optCallback){
        if(this.options.mode === 'getCapabilities'){
            this._getCapabilities(target, callback, optCallback);
        }else {
            Couche.prototype._ajoutCallback.call(this,target, callback, optCallback);
        }
    };
    
    WMS.prototype._validerChargement = function(e){
        if(e.object.div.innerHTML.indexOf("olImageLoadError")>-1){
            $.ajax({
                url: Aide.utiliserProxy(decodeURIComponent($('<textarea/>').html(/src="(.*)"/.exec(e.object.div.innerHTML)[1]).text())),
                    data: {
                        SERVICE: "WMS",
                        VERSION: this.options.version,
                        REQUEST: "GetMap"
                    },
                async:false,
                context:this,
                success:function(response) {
                    
                    var message = '<b>'+this.options.titre +':</b><br>';
                    
                    if(typeof response === 'object'){
                        
                        var tagError = response.getElementsByTagName("ServiceException");
                        if(tagError){
                            message += tagError.item(0).textContent;
                            Aide.afficherMessageConsole(message);
                        }
                    }
                    else {
                        message += response
                        Aide.afficherMessageConsole(message);
                    }
                    
                },
                error:function(e){
                    Aide.afficherMessageConsole(e.statusText);
                }
            
            });
        }
    };
    
    return WMS;
    
});