
/**
 * @module Service
 * @require Limites
 * @require ccurence
 * @require AnalyseurGeoJSON
  */
define(['aide', 'limites', 'occurence', 'analyseurGeoJSON'], function(Aide, Limites, Occurence, AnalyseurGeoJSON){
    /**
     * Initialise une nouvelle instance de service d'édition.
     * @constructor
     * @name Service
     * @class Service
     * @param {dictionnaire} options Liste des options du service
     * @param {String} [options.url='/edition/api'] Url du service.
     * @param {String} [options.projectionCarte='EPSG:3857'] Projection de la carte
     */
    function Service(options){
        this.options = options || {};
    };
    
    Service.prototype = new Service();
    Service.prototype.constructor = Service;
    
    /**
     * Permet d'obtenir la description des couches du service d'édition.
     * @method
     * @name obtenirCouches
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     */
    Service.prototype.obtenirCouches = function(success, error){
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"getCapabilities"};
        $.ajax({
            url: this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                that.success(data);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError);
            }
        });
    };

    /**
     * Permet d'obtenir la description du type d'occurence pour une couche.
     * @method
     * @name decrireCouche
     * @param {String} couche Le nom de la couche.
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     */
    Service.prototype.decrireCouche = function(couche, success, error, occurence){
        var that = this;
        that.success = success;
        that.error = error;

        var r = {request:"describeFeatureType", layer:couche};
        if(occurence){
            var format = new OpenLayers.Format.GeoJSON();
            //var geometry = occurence._obtenirGeomOL();
            var geometry = occurence.projeter(
                this.options.projectionCarte, 
                'EPSG:4326')._obtenirGeomOL();
            var geoJson = format.write(geometry);
            r.geometry = geoJson;
        }
        
        $.ajax({
            url:  this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                that.success(data);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError);
            }
        });
    };
    
    /**
     * Permet d'obtenir les occurences d'une couche à l'intérieur d'une limite.
     * @method
     * @name obtenirOccurences
     * @param {String} couche Le nom de la couche.
     * @param {Igo.Geometrie.Limite} limites La limite à appliquer sur la requête.
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     */    
    Service.prototype.obtenirOccurences = function(couche, limites, success, error){
        var that = this;
        that.success = success;
        that.error = error;

        var format = new OpenLayers.Format.GeoJSON();
        limites = limites.projeter(that.options.projectionCarte, "EPSG:4326");
        var geometry = limites._obtenirGeomOL();
        var geoJson = format.write(geometry);
        
        var r = {request:"getFeatures", geometry: geoJson, layer:couche};
        $.ajax({
            url:  this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                var analyseur = new AnalyseurGeoJSON({
                    projectionCarte: that.options.projectionCarte});
                var occurences = analyseur.lire(data)
                that.success(occurences);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError);
            }
        });
    };

     /**
     * Permet de supprimer une occurence.
     * @method
     * @name supprimerOccurence
     * @param {String} couche Le nom de la couche.
     * @param {Igo.Geometrie.Occurence} occurence L'occurence à créer.
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     */   
    Service.prototype.supprimerOccurence = function(couche, occurence, success, error){
        var that = this;
        that.success = success;
        that.error = error;
        var openLayersFeature = occurence._feature.clone();
        openLayersFeature.geometry = occurence.projeter(
                this.options.projectionCarte, 
                'EPSG:4326')._obtenirGeomOL();
        
        var format = new OpenLayers.Format.GeoJSON();    
        var feature = format.write(openLayersFeature);        
        var r = {layer:couche, request:"delete", feature:feature};
        $.ajax({
            url: this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                that.success(data);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError);
            }
        });
    };
    
     /**
     * Permet de créer une occurence.
     * @method
     * @name creerOccurence
     * @param {String} couche Le nom de la couche.
     * @param {Igo.Geometrie.Occurence} occurence L'occurence à créer.
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     */  
    Service.prototype.creerOccurence = function(couche, occurence, success, error){
        var that = this;
        that.success = success;
        that.error = error;

        var openLayersFeature = occurence._feature.clone();
        if(occurence.projeter){
            openLayersFeature.geometry = occurence.projeter(
                    this.options.projectionCarte, 
                    'EPSG:4326')._obtenirGeomOL();
        }
        var format = new OpenLayers.Format.GeoJSON();    
        var feature = format.write(openLayersFeature);        
        var r = {request:"create", layer:couche, feature:feature};
        $.ajax({
            url: this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                that.success(data);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError, JSON.parse(xhr.responseText));
            }            
        });
    };
    
     /**
     * Permet de modifier une occurence.
     * @method
     * @name creerOccurence
     * @param {String} couche Le nom de la couche.
     * @param {Igo.Geometrie.Occurence} occurence L'occurence à modifier.
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     */ 
    Service.prototype.modifierOccurence = function(couche, occurence, success, error){
        var that = this;
        that.success = success;
        that.error = error;

        var openLayersFeature = occurence._feature.clone();
        openLayersFeature.geometry = occurence.projeter(
                this.options.projectionCarte, 
                'EPSG:4326')._obtenirGeomOL();
        
        var format = new OpenLayers.Format.GeoJSON();    
        var feature = format.write(openLayersFeature);        
        var r = {request:"update", layer:couche, feature:feature};
        $.ajax({
            url: this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                that.success(data);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError, JSON.parse(xhr.responseText));
            }            
        });        
    };    
    
    Service.prototype.transaction = function(couche, occurencesCrees, occurencesModifiees, occurencesEffacees, success, error){
        var that = this;
        that.success = success;
        that.error = error;
        var features = [];
        
        for(var i = 0; i < occurencesCrees.length; i++){
            var occurence = occurencesCrees[i];
            var openLayersFeature = occurence._feature.clone();
            openLayersFeature.geometry = occurence.projeter(
                    this.options.projectionCarte, 
                    'EPSG:4326')._obtenirGeomOL();
            var format = new OpenLayers.Format.GeoJSON();    
            var feature = format.write(openLayersFeature);   
            var f = JSON.parse(feature);
            f.no_seq = occurence.id;
            f.action = "create";            
            features.push(f);            
        }
        for(var i = 0; i < occurencesModifiees.length; i++){
            var occurence = occurencesModifiees[i];
            var openLayersFeature = occurence._feature.clone();
            openLayersFeature.geometry = occurence.projeter(
                    this.options.projectionCarte, 
                    'EPSG:4326')._obtenirGeomOL();
            var format = new OpenLayers.Format.GeoJSON();    
            var feature = format.write(openLayersFeature);   
            var f = JSON.parse(feature);
            f.no_seq = occurence.id;
            f.action = "update";            
            features.push(f);

        }
        for(var i = 0; i < occurencesEffacees.length; i++){
            var occurence = occurencesEffacees[i];
            var openLayersFeature = occurence._feature.clone();
            openLayersFeature.geometry = occurence.projeter(
                    this.options.projectionCarte, 
                    'EPSG:4326')._obtenirGeomOL();
            var format = new OpenLayers.Format.GeoJSON();    
            var feature = format.write(openLayersFeature);   
            var f = JSON.parse(feature);
            f.no_seq = occurence.id;
            f.action = "delete";            
            features.push(f);
        }
        
        var featureCollection = {type:"FeatureCollection", features:features};
        Aide.afficherMessageChargement({titre:"Transaction en cours..."});
        var r = {request:"transaction", layer:couche, features:JSON.stringify(featureCollection)};
        $.ajax({
            url: this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                Aide.cacherMessageChargement();
                that.success(data);
            },
            error:function(xhr,ajaxOptions,thrownError){
                Aide.cacherMessageChargement();
                that.error(xhr.status, thrownError, JSON.parse(xhr.responseText));
            }            
        });  
    };

    return Service;
    
});

