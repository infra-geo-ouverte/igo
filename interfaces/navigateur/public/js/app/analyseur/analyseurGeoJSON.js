define(['occurence'], function(Occurence) {

    function AnalyseurGeoJSON(options){
        this.options = options || {};
        var carteProj = this.options.projectionCarte || 'EPSG:3857';
        var format = OpenLayers.Class(OpenLayers.Format.GeoJSON, {
            parseFeature: function(obj) {
                var feature, geometry, attributes, bbox;
                attributes = (obj.properties) ? obj.properties : {};
                try {
                    geometry = this.parseGeometry(obj.geometry);
                } catch(err) {
                    // deal with bad geometries
                    throw err;
                }
       
                if (this.internalProjection && this.externalProjection && geometry !== null) {
                    geometry.transform(this.externalProjection, 
                                       this.internalProjection); 
                }     
                feature = new Occurence(geometry, attributes);       
                
                return feature;

            },
            
            read: function (json, type, filter) {
                type = (type) ? type : "FeatureCollection";
                var results = null;
                var obj = null;
                if (typeof json == "string") {
                    obj = OpenLayers.Format.JSON.prototype.read.apply(this,
                                                                      [json, filter]);
                } else { 
                    obj = json;
                }    

                if(!obj) {
                    OpenLayers.Console.error("Bad JSON: " + json);
                } else if(typeof(obj.type) != "string") {
                    OpenLayers.Console.error("Bad GeoJSON - no type: " + json);
                } else if(this.isValidType(obj, type)) {
                    switch(type) {
                        case "Geometry":
                            var resultsOL = [];
                            try {
                                resultsOL = this.parseGeometry(obj);
                            } catch(err) {
                                OpenLayers.Console.error(err);
                            }
                            for(var i=0, len=resultsOL.length; i<len; ++i) {
                                results.push(new Occurence(resultsOL[i]));       
                            }
                            break;
                        case "Feature":
                            try {
                                results = this.parseFeature(obj);
                                results.type = "Feature";
                            } catch(err) {
                                OpenLayers.Console.error(err);
                            }
                            break;
                        case "FeatureCollection":
                            // for type FeatureCollection, we allow input to be any type
                            results = [];
                            switch(obj.type) {
                                case "Feature":
                                    try {
                                        results.push(this.parseFeature(obj));
                                    } catch(err) {
                                        results = null;
                                        OpenLayers.Console.error(err);
                                    }
                                    break;
                                case "FeatureCollection":
                                    var proj='EPSG:4326'; // projection défaut de geoJson.
                                    if(obj.crs){
                                        var crs = obj.crs.properties.name;
                                        proj = 'EPSG:'+crs.substr(crs.search("EPSG::")+6).split(':')[0];
                                    }
                                    
                                    this.externalProjection = new OpenLayers.Projection(proj); 
                                    for(var i=0, len=obj.features.length; i<len; ++i) {
                                        try {
                                            results.push(this.parseFeature(obj.features[i]));
                                        } catch(err) {
                                            results = null;
                                            OpenLayers.Console.error(err);
                                        }
                                    }
                                    break;
                                default:
                                    try {
                                        var resultsOL = [];
                                        var geom = this.parseGeometry(obj);
                                        resultsOL.push(new OpenLayers.Feature.Vector(geom));
                                        for(var i=0, len=resultsOL.length; i<len; ++i) {
                                            results.push(new Occurence(resultsOL[i]));       
                                        }
                                    } catch(err) {
                                        results = null;
                                        OpenLayers.Console.error(err);
                                    }
                            }
                        break;
                    }
                }
                return results;
            }
        });
        this._parser = new format({internalProjection: new OpenLayers.Projection(carteProj)});
    }

    AnalyseurGeoJSON.prototype.lire = function(geoJson){
        return this._parser.read(geoJson);
    };
    
    AnalyseurGeoJSON.prototype.lireUrl = function(opt){
        opt = opt || {};
        var url = opt.url;
        var callback = opt.callback;
        if(!callback || !url){
            return false;
        }
        var that = this;
        $.ajax({
            url: url, 
            success: function(result, status, xhr){
                var rep = that.lire(result);
                if(callback){
                    callback.call(that, rep, status, xhr);
                }       
            }, 
            error: function(xhr, status, error){
                if(callback){
                    callback.call(that, error, status, xhr);
                }       
            }
        });
    };
    
    AnalyseurGeoJSON.prototype.ecrire = function(occurences){
        if(!occurences){return true;}
        if(occurences.obtenirTypeClasse && (occurences.obtenirTypeClasse() === "Vecteur" || occurences.obtenirTypeClasse() === "VecteurCluster" || occurences.obtenirTypeClasse() === "WFS")){
            occurences = occurences.obtenirOccurences();
        }
        
        if (occurences.obtenirTypeClasse && occurences.obtenirTypeClasse() === "Occurence"){
            occurences = [occurences];  
        } else if (occurences._obtenirGeomOL){ //géométrie
            return this._parser.write(occurences._obtenirGeomOL());
        }
        
        var listFeaturesOL=[];
        $.each(occurences, function(key, value){
            if(!value.obtenirTypeClasse || value.obtenirTypeClasse() !== 'Occurence'){
                return true;
            }
            listFeaturesOL.push(value._feature);
        });
        return this._parser.write(listFeaturesOL);
    };
    
    return AnalyseurGeoJSON;
});