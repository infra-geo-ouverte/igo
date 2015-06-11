define(['point', 'ligne', 'polygone', 'multiPoint', 'multiLigne', 'multiPolygone', 'occurence'], function(Point, Ligne, Polygone, MultiPoint, MultiLigne, MultiPolygone, Occurence) {
    function AnalyseurGML(options){
        this.options = options || {};
        var carteProj = this.options.projectionCarte || 'EPSG:3857';
        var format = OpenLayers.Class(OpenLayers.Format.GML, {
            parseFeature: function(node) {
                // only accept one geometry per feature - look for highest "order"
                var order = ["MultiPolygon", "Polygon",
                             "MultiLineString", "LineString",
                             "MultiPoint", "Point"];
                // FIXME: In case we parse a feature with no geometry, but boundedBy an Envelope,
                // this code creates a geometry derived from the Envelope. This is not correct.
                var type, nodeList, geometry, parser;
                for(var i=0; i<order.length; ++i) {
                    type = order[i];
                    nodeList = this.getElementsByTagNameNS(node, this.gmlns, type);
                    if(nodeList.length > 0) {
                        // only deal with first geometry of this type
                        parser = this.parseGeometry[type.toLowerCase()];
                        if(parser) {
                            geometry = parser.apply(this, [nodeList[0]]);

                            var proj = nodeList[0].getAttribute('srsName');
                            if(proj){
                                this.externalProjection = new OpenLayers.Projection(proj);
                            }           
                            if (this.internalProjection && this.externalProjection) {
                                geometry.transform(this.externalProjection, 
                                                   this.internalProjection); 
                            }                       
                        } else {
                            throw new TypeError("Unsupported geometry type: " + type);
                        }
                        // stop looking for different geometry types
                        break;
                    }
                }
                // construct feature (optionally with attributes)
                var attributes;
                if(this.extractAttributes) {
                    attributes = this.parseAttributes(node);
                    delete attributes.boundedBy;
                    delete attributes.msGeometry;
                }

                var geometrie;
                if(geometry.CLASS_NAME == "OpenLayers.Geometry.MultiPolygon"){
                    geometrie = new MultiPolygone(geometry);
                } else if (geometry.CLASS_NAME == "OpenLayers.Geometry.MultiLineString") {
                    geometrie = new MultiLigne(geometry);
                } else if (geometry.CLASS_NAME == "OpenLayers.Geometry.MultiPoint") {
                    geometrie = new MultiPoint(geometry);
                } else if (geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon") {
                    geometrie = new Polygone(geometry);
                } else if (geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {
                    geometrie = new Ligne(geometry);
                } else if (geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
                    geometrie = new Point(geometry);
                } else {
                    console.log(geometry.CLASS_NAME);
                    return true;
                }
                var feature = new Occurence(geometrie, attributes);           

                return feature;
            }
        });
        this._parser = new format({internalProjection: new OpenLayers.Projection(carteProj)});
    }

    AnalyseurGML.prototype.lire = function(gml){
        return this._parser.read(gml);
    };

    AnalyseurGML.prototype.ecrire = function(occurences){
        if(!occurences){return false;}
        
        if(occurences.obtenirTypeClasse && occurences.obtenirTypeClasse() === "Vecteur"){
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
    
    
    return AnalyseurGML;
});