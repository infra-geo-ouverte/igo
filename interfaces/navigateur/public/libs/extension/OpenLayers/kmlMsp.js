
OpenLayers.Format.KML_MSP = OpenLayers.Class(OpenLayers.Format.KML, {
    
    /* écrit un KML avec un <folder> par layer et un <document> au début 
     * pour que OGR puisse lire correctement le KML.
     * fortement inspiré de OpenLayers.Format.KML.write() 
     * */
    writeLayers: function(layers) {

        if(!(OpenLayers.Util.isArray(layers))) {
                layers = [layers];
        }

        var kml = this.createElementNS(this.kmlns, "kml");
        var document = this.createElementNS(this.kmlns, "Document");
        var folder = this.createFolderXML();
        
        for (var i = 0; i < layers.length; ++i) {

            for(var j=0; j<layers[i].listeOccurences.length; ++j) {
                
                var feature = layers[i].listeOccurences[j].cloner(true);
                var layer = layers[i];
                var fillColor = 'FF0000FF';
                var strokeColor = 'FF0000FF';
                var width = '1';
                var r="FF";
                var g="00";
                var b="00";
                var alpha="FF";
                                   
                if(typeof(feature.obtenirStyle("courant", true, true, true)) === 'undefined' || !layers[i].listeOccurences[j].estAffichee()){
                    continue;
                }
                
                fillColor = this.convertColorKml(feature.obtenirProprieteStyle('couleur', "courant", true), feature.obtenirProprieteStyle('opacite',"courant", true));  
                strokeColor = this.convertColorKml(feature.obtenirProprieteStyle('limiteCouleur', "courant", true), feature.obtenirProprieteStyle('limiteOpacite', "courant", true));  
              
                var style = this.createElementNS(this.kmlns, "Style");
                style.setAttribute("id",feature.id+"style");
                var styleLineType = this.createElementNS(this.kmlns, "LineStyle");
                var width = this.createElementNS(this.kmlns,"width");
                width.appendChild(this.createTextNode(feature.obtenirProprieteStyle('limiteEpaisseur', "courant", true)));
                var color = this.createElementNS(this.kmlns,"color");
                color.appendChild(this.createTextNode(strokeColor));  
                styleLineType.appendChild(color);
                styleLineType.appendChild(width);
                style.appendChild(styleLineType);
                
                //couleur étiquette
                if(feature.obtenirProprieteStyle('etiquetteCouleur', "courant", true)){
                    color = this.convertColorKml(feature.obtenirProprieteStyle('etiquetteCouleur', "courant", true));
                    var labelStyle = this.createElementNS(this.kmlns, "LabelStyle");
                    var colorLabel = this.createElementNS(this.kmlns, "color");
                    colorLabel.appendChild(this.createTextNode(color));
                    labelStyle.appendChild(colorLabel);
                    //le mapfile plante lors de l'ajout
                    //style.appendChild(labelStyle);
                }

                switch(feature.obtenirTypeGeometrie()){
                    case "Point":
                    case "MultiPoint":

                        if(feature.obtenirProprieteStyle('icone', "courant", true)){
                            
                            var styleIconType = this.createElementNS(this.kmlns, "IconStyle");
                                
                            //grosseur icone TODO: HARDCODE À 10
                            var scale = this.createElementNS(this.kmlns,"scale");
                            scale.appendChild(this.createTextNode(10));
                            var urlImage = feature.obtenirProprieteStyle('icone', "courant", true);
                            if(urlImage.substring(0,1) == '/'){
                                urlImage = Igo.Aide.obtenirHote() + urlImage;
                            }
                            
                             //extension de l'icone
                            var match = urlImage.match(/\.([0-9a-z]+)(?:[\?#]|$)/);
                            var doitEtreDeplacer = false;
                            if(match.indexOf('png') > -1 || match.indexOf('jpeg') > -1 
                                    || match.indexOf('jpg') > -1 || match.indexOf('gif') > -1){
                                doitEtreDeplacer = true;
                            }
                            
                            //icone
                            var icon = this.createElementNS(this.kmlns,"Icon");
                            var href = this.createElementNS(this.kmlns,"href");
                            href.appendChild(this.createTextNode(urlImage));
                            icon.appendChild(href);
                                                             
                             //direction icone
                            var heading = this.createElementNS(this.kmlns,"heading");
                            var rotation = 0;
                            if(feature.obtenirProprieteStyle('rotation', "courant", true)){
                                rotation = parseFloat(feature.obtenirProprieteStyle('rotation', "courant", true));
                                heading.appendChild(this.createTextNode(360-rotation));
                            }

                            //offset icone
                            var hotSpot = this.createElementNS(this.kmlns,"hotSpot");
                            hotSpot.setAttribute('x', 0);
                            hotSpot.setAttribute('y', 0.5);
                            hotSpot.setAttribute('xunits', 'fraction');
                            hotSpot.setAttribute('yunits', 'fraction');
                            /*PATCH : le tag hotSpot n'est pas pris en compte 
                             * soit par mapserver ou ogr 
                             * en attendant une solution, nous devons recalculer 
                             * les coordonnées du placemark pour les JPEG et PNG
                             * Pour le KML le 0,0 d'une icone est son centre
                            */ 
                            if(doitEtreDeplacer){
                                var deltaX = 0;
                                var deltaY = 0;
                                var iconeLargeur = 0;
                                var iconeHauteur = 0;
                                
                                if(feature.obtenirProprieteStyle('iconeLargeur', "courant", true)){
                                    iconeLargeur = (feature.obtenirProprieteStyle('iconeLargeur', "courant", true)) * Igo.nav.carte.obtenirResolution();
                                }
                                if(feature.obtenirProprieteStyle('iconeHauteur', "courant", true)){
                                    iconeHauteur = (feature.obtenirProprieteStyle('iconeHauteur', "courant", true)) * Igo.nav.carte.obtenirResolution();                        
                                }
                                
                                 //recalculer un angle entre 0 et 360 si
                                if(rotation > 360 || rotation < -360){
                                    rotation = rotation-(360*Math.floor(rotation/360));
                                }
                                                                
                                if(feature.obtenirProprieteStyle('iconeOffsetY', "courant", true)){
                                    deltaY = -feature.obtenirProprieteStyle('iconeOffsetY', "courant", true) * 
                                                Igo.nav.carte.obtenirResolution() 
                                                ;//+ iconeHauteur/2;
                                }
                                if(feature.obtenirProprieteStyle('iconeOffsetX', "courant", true)){
                                    deltaX = -(feature.obtenirProprieteStyle('iconeOffsetX', "courant", true) * 
                                                Igo.nav.carte.obtenirResolution()) 
                                                ;//+iconeLargeur/2
                                } 
                                
                                var hypo = Math.sqrt((deltaX*deltaX)+(deltaY*deltaY));
                                
                                
                                deltaX =  hypo * Math.sin(rotation*Math.PI/180);
                                deltaY =  hypo * Math.cos(rotation*Math.PI/180);
                                

                                if(!isNaN(deltaX) && !isNaN(deltaY)){
                                   feature.deplacerDe(deltaX, deltaY);     
                                }
                                
                                
                                deltaX = iconeLargeur/2;
                                deltaY = iconeHauteur/2;
                                
                                var hypo = Math.sqrt((deltaX*deltaX)+(deltaY*deltaY));
                                
                                
                               deltaX =  hypo * Math.sin(rotation*Math.PI/180);
                               deltaY =  hypo * Math.cos(rotation*Math.PI/180);
                                

                                if(!isNaN(deltaX) && !isNaN(deltaY)){
                                     feature.deplacerDe(-deltaX, -deltaY);     
                                }                                
                            }

                            styleIconType.appendChild(scale);
                           // styleIconType.appendChild(hotSpot);
                            styleIconType.appendChild(icon);
                            styleIconType.appendChild(heading);
                            style.appendChild(styleIconType);
                            document.appendChild(style);
                            folder.appendChild(this.createPlacemarkXML(feature));
                        }
                        else{
                            var stylePolyType = this.createElementNS(this.kmlns, "PolyStyle");
                            color = this.createElementNS(this.kmlns,"color");
                            color.appendChild(this.createTextNode(fillColor));  
                            stylePolyType.appendChild(color);
                            style.appendChild(stylePolyType);
                            document.appendChild(style);

                            var clone = feature.cloner();
                            var featureTransform = clone._obtenirGeomOL().transform(layer.obtenirProjection(), this.externalProjection);
                            var x = featureTransform.x;
                            var y = featureTransform.y;
                            var radius = feature.obtenirProprieteStyle('rayon', "courant", true);
                            var name = feature.id;
                            var description = "";

                            var kmlCircle = this.kml_ring_with_placeMark(x,y,Igo.nav.carte.obtenirResolution()*radius,20,0,name,description);                 
                            var domParser = new DOMParser();
                            var kmlCircleDOM = domParser.parseFromString(kmlCircle, "application/xml");

                            //ajouter le point en polygone
                            folder.appendChild(kmlCircleDOM.firstChild);
                            //ajouter le point en point pour annotation
                            folder.appendChild(this.createPlacemarkXML(feature));
                        }

                        break;

                    case "Ligne":
                        document.appendChild(style);
                        folder.appendChild(this.createPlacemarkXML(feature));
                        break;
                    case "Polygone":
                    case "MultiPolygone":

                        var stylePolyType = this.createElementNS(this.kmlns, "PolyStyle");
                        color = this.createElementNS(this.kmlns,"color");
                        color.appendChild(this.createTextNode(fillColor));  
                        stylePolyType.appendChild(color);
                        style.appendChild(stylePolyType);

                        document.appendChild(style);

                        folder.appendChild(this.createPlacemarkXML(feature));
                        break;
                }
            }
        };

        document.appendChild(folder);
        kml.appendChild(document);

        return OpenLayers.Format.XML.prototype.write.apply(this, [kml]);
    },

    /**
     * Method: createPlacemarkXML
     * Creates and returns a KML placemark node representing the given feature. 
     * 
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>}
     * 
     * Returns:
     * {DOMElement}
     */
    createPlacemarkXML: function(feature) {        
        // Placemark name
        var placemarkName = this.createElementNS(this.kmlns, "name");
        var label = (feature.obtenirProprieteStyle('etiquette', "courant", true)) ? 
                            feature.obtenirProprieteStyle('etiquette', "courant", true) : 
                            feature.id;
        
         //petit patch pour les icones de recherche d'adresse (feature.proprietes.adresse_libre)
        var desc = feature.proprietes.adresseLibre || label || feature.proprietes.description;
        
        // Placemark description
        var placemarkDesc = this.createElementNS(this.kmlns, "description");
              
        var name = feature.proprietes.name || feature.proprietes.id || desc;
        placemarkName.appendChild(this.createTextNode(name));
         
        placemarkDesc.appendChild(this.createTextNode(desc));
        
        // Placemark style
        var placemarkStyleUrl = this.createElementNS(this.kmlns, "styleUrl");
        desc = "#"+feature.id + "style";
        placemarkStyleUrl.appendChild(this.createTextNode(desc));
        
        // Placemark
        var placemarkNode = this.createElementNS(this.kmlns, "Placemark");
        if(feature.fid != null) {
            placemarkNode.setAttribute("id", feature.fid);
        }
        placemarkNode.appendChild(placemarkName);
        placemarkNode.appendChild(placemarkDesc);
        placemarkNode.appendChild(placemarkStyleUrl);

        // Geometry node (Point, LineString, etc. nodes)
        var geometryNode = this.buildGeometryNode(feature._obtenirGeomOL());
        placemarkNode.appendChild(geometryNode);        
        
        // output attributes as extendedData
        if (feature.proprietes) {
            var edNode = this.buildExtendedData(feature.proprietes);
            if (edNode) {
                placemarkNode.appendChild(edNode);
            }
        }
        
        return placemarkNode;
    },
    
    /* http://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes 
     * Permet de changer une couleur(string) en hex
     * */
    
    colourNameToHex : function (colour){
        var colours = {"aliceblue":"f0f8ff","antiquewhite":"faebd7","aqua":"00ffff","aquamarine":"7fffd4","azure":"f0ffff",
        "beige":"f5f5dc","bisque":"ffe4c4","black":"000000","blanchedalmond":"ffebcd","blue":"0000ff","blueviolet":"8a2be2","brown":"a52a2a","burlywood":"deb887",
        "cadetblue":"5f9ea0","chartreuse":"7fff00","chocolate":"d2691e","coral":"ff7f50","cornflowerblue":"6495ed","cornsilk":"fff8dc","crimson":"dc143c","cyan":"00ffff",
        "darkblue":"00008b","darkcyan":"008b8b","darkgoldenrod":"b8860b","darkgray":"a9a9a9","darkgreen":"006400","darkkhaki":"bdb76b","darkmagenta":"8b008b","darkolivegreen":"556b2f",
        "darkorange":"ff8c00","darkorchid":"9932cc","darkred":"8b0000","darksalmon":"e9967a","darkseagreen":"8fbc8f","darkslateblue":"483d8b","darkslategray":"2f4f4f","darkturquoise":"00ced1",
        "darkviolet":"9400d3","deeppink":"ff1493","deepskyblue":"00bfff","dimgray":"696969","dodgerblue":"1e90ff",
        "firebrick":"b22222","floralwhite":"fffaf0","forestgreen":"228b22","fuchsia":"ff00ff",
        "gainsboro":"dcdcdc","ghostwhite":"f8f8ff","gold":"ffd700","goldenrod":"daa520","gray":"808080","green":"008000","greenyellow":"adff2f",
        "honeydew":"f0fff0","hotpink":"ff69b4",
        "indianred ":"cd5c5c","indigo":"4b0082","ivory":"fffff0","khaki":"f0e68c",
        "lavender":"e6e6fa","lavenderblush":"fff0f5","lawngreen":"7cfc00","lemonchiffon":"fffacd","lightblue":"add8e6","lightcoral":"f08080","lightcyan":"e0ffff","lightgoldenrodyellow":"fafad2",
        "lightgrey":"d3d3d3","lightgreen":"90ee90","lightpink":"ffb6c1","lightsalmon":"ffa07a","lightseagreen":"20b2aa","lightskyblue":"87cefa","lightslategray":"778899","lightsteelblue":"b0c4de",
        "lightyellow":"ffffe0","lime":"00ff00","limegreen":"32cd32","linen":"faf0e6",
        "magenta":"ff00ff","maroon":"800000","mediumaquamarine":"66cdaa","mediumblue":"0000cd","mediumorchid":"ba55d3","mediumpurple":"9370d8","mediumseagreen":"3cb371","mediumslateblue":"7b68ee",
        "mediumspringgreen":"00fa9a","mediumturquoise":"48d1cc","mediumvioletred":"c71585","midnightblue":"191970","mintcream":"f5fffa","mistyrose":"ffe4e1","moccasin":"ffe4b5",
        "navajowhite":"ffdead","navy":"000080",
        "oldlace":"fdf5e6","olive":"808000","olivedrab":"6b8e23","orange":"ffa500","orangered":"ff4500","orchid":"da70d6",
        "palegoldenrod":"eee8aa","palegreen":"98fb98","paleturquoise":"afeeee","palevioletred":"d87093","papayawhip":"ffefd5","peachpuff":"ffdab9","peru":"cd853f","pink":"ffc0cb","plum":"dda0dd","powderblue":"b0e0e6","purple":"800080",
        "red":"ff0000","rosybrown":"bc8f8f","royalblue":"4169e1",
        "saddlebrown":"8b4513","salmon":"fa8072","sandybrown":"f4a460","seagreen":"2e8b57","seashell":"fff5ee","sienna":"a0522d","silver":"c0c0c0","skyblue":"87ceeb","slateblue":"6a5acd","slategray":"708090","snow":"fffafa","springgreen":"00ff7f","steelblue":"4682b4",
        "tan":"d2b48c","teal":"008080","thistle":"d8bfd8","tomato":"ff6347","turquoise":"40e0d0",
        "violet":"ee82ee",
        "wheat":"f5deb3","white":"ffffff","whitesmoke":"f5f5f5",
        "yellow":"ffff00","yellowgreen":"9acd32"};

        if (typeof colours[colour.toLowerCase()] != 'undefined')
            return colours[colour.toLowerCase()];

        return false;
    },
    
    /**
     * Created with JetBrains WebStorm.
     * User: Jeff Lehnert
     * Date: 9/10/13
     * Time: 7:44 PM
     *
     */
    /*
    The MIT License

     Copyright (c) 2013 by Jeff Lehnert
     original done in python 2007 by Nick Galbreath
     https://code.google.com/p/kmlcircle/

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included in
     all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     THE SOFTWARE.

     */
     //Convert (x,y,z) on unit sphere
     //back to (long, lat)
     //
     //p is vector of three elements
    toEarth : function (p) {
        var longitude, latitude, DEG, colatitude;
        if (p.x == 0) {
            longitude = Math.PI / 2.0;
        } else {
            longitude = Math.atan(p.y / p.x);
        }
        colatitude = Math.acos(p.z);
        latitude = (Math.PI / 2.0 - colatitude);
        if (p.x < 0.0) {
            if (p.y <= 0.0) {
                longitude = -(Math.PI - longitude);
            } else {
                longitude = Math.PI + longitude;
            }
        }
        DEG = 180.0 / Math.PI;
        return {longitude: longitude * DEG, latitude: latitude * DEG};
    },

    toCart : function (longitude, latitude){
        var theta = longitude;
        var phi = Math.PI/2.0 - latitude;
        // spherical coordinate use "co-latitude", not "lattitude"
        // latitude = [-90, 90] with 0 at equator
        // co-latitude = [0, 180] with 0 at north pole
        return {x:Math.cos(theta)*Math.sin(phi),y:Math.sin(theta)*Math.sin(phi),z:Math.cos(phi)};
    },


    spoints : function (longitude,latitude,meters,n,offset){
        //constant to convert to radians
        var RAD = Math.PI/180.0;
        //mean radius of earth in meters
        var MR = 6378.1 * 1000.0;
        var offsetRadians = offset * RAD;
        // compute long degrees in rad at a given lat
        var r = (meters/(MR * Math.cos(latitude * RAD)));
        var vec = this.toCart(longitude*RAD, latitude* RAD);
        var pt = this.toCart(longitude*RAD + r, latitude*RAD);
        var pts = [];
        for(i=0;i<=n;i++){
            pts.push(this.toEarth(this.rotPoint(vec,pt,offsetRadians + (2.0 * Math.PI/n)*i)));
        }
        //add another point to connect back to start
        pts.push(pts[0]);
        return pts;
    },

    rotPoint : function (vec,pt,phi){
        //remap vector for clarity
        var u, v, w, x, y,z;
        u=vec.x;
        v=vec.y;
        w=vec.z;
        x=pt.x;
        y=pt.y;
        z=pt.z;
        var a, d,e;
        a=u*x + v*y + w*z;
        d = Math.cos(phi);
        e=Math.sin(phi);
        return {x:(a*u + (x-a*u)*d+ (v*z-w*y)*e),y:(a*v + (y - a*v)*d + (w*x - u*z) * e),z:(a*w + (z - a*w)*d + (u*y - v*x) * e)};
    },

    kml_regular_polygon : function (longitude,latitude,meters,segments,offset){
        var s = '<Polygon>\n';
        s += '  <outerBoundaryIs><LinearRing><coordinates>\n';
        var pts = this.spoints(longitude,latitude,meters,segments,offset);
        var len = pts.length;
        for(i=0;i<len;i++){
            s += "    " + pts[i].longitude + "," + pts[i].latitude + "\n";
        }

        s += '  </coordinates></LinearRing></outerBoundaryIs>\n';
        s += '</Polygon>\n';
        return s;
    },

    kml_ring_with_placeMark : function (longitude,latitude,meters,segments,offset,name,description){
        var s = '<Placemark>';
            s+='<name>' + name + '</name>\n';
            s+='<description>'+ description + '</description>'
            s+='<styleUrl>#'+name+'style</styleUrl>';
            s+=this.kml_regular_polygon(longitude,latitude,meters,segments,offset);
            s+='</Placemark>';
        return s;
    },

    kml_header : function (documentName){
        var s='<?xml version="1.0" encoding="UTF-8"?>';
        s+='<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">';
        s+='<Document>';
        s+='<name>'+ documentName+'</name>';
        return s;
    },

    kml_footer : function (){
        return '</Document></kml>';
    },
    
    /** 
     * Convertir une couleur compatible KML
     * @name convertColorKml
     * @param {*} [couleur] la couleur a convertir (format hex ou human-readable)
     * @param {number} [opacite] opacité de la couleur entre 0 et 1
    */
    convertColorKml : function (couleur, opacite){
        var output = null;
        if(typeof(couleur) == 'undefined'){
           return "FF0000FF";
        }
        if(typeof(opacite) == 'undefined'){
            opacite = 50;
        }
        
        if(couleur.match(/^#[A-z0-9]{6}$/)){
            r = couleur.substring(1,3);
            g = couleur.substring(3,5);
            b = couleur.substring(5,7);
            alpha = parseInt(opacite*255).toString(16);
            if(alpha.length < 2){
                alpha = "0"+alpha;
            }
            output = alpha+b+g+r;
        }
        else{
            if(output = this.colourNameToHex(couleur)){
                r = output.substring(0,2);
                g = output.substring(2,4);
                b = output.substring(4,6);
                alpha = parseInt(opacite*255).toString(16);
                if(alpha.length < 2){
                    alpha = "0"+alpha;
                }   
                output = alpha+b+g+r;
            }else{
                output = "FF0000FF";
            }
        }
        
        return output;
    }


});

