
/**
 * @module Service
 * @require Limites
 * @require ccurence
 * @require AnalyseurGeoJSON
  */
define(['aide', 'analyseurGeoJSON'], function(Aide, AnalyseurGeoJSON){
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
                var occurences = analyseur.lire(data);
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

        if(occurence.obtenirTypeGeometrie()){
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
     * @name modifierOccurence
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
    
    /**
     * Effectuer les transactions des occurences ajoutées/modifiées/effacées
     * @method
     * @name Service#transaction
     * @param {object} couche
     * @param {object} occurencesCrees
     * @param {object} occurencesModifiees
     * @param {object} occurencesEffacees
     * @param {integer} fkId
     * @param {function} success
     * @param {function} error
     */
    Service.prototype.transaction = function(couche, occurencesCrees, occurencesModifiees, occurencesEffacees, fkId, success, error){
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
        var r = {request:"transaction", fkId: fkId, layer:couche, features:JSON.stringify(featureCollection)};
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
                that.error(xhr.status, thrownError);
            }            
        });  
    };
    
     /**
     * Permet d'obtenir les occurences d'une couche liée à un regroupement à partir d'une FK
     * @method
     * @name obtenirOccurencesFK
     * @param {String} couche Le nom de la couche.
     * @param {integer} fk Foreign key représentant le regroupement
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     */    
    Service.prototype.obtenirOccurencesFk = function(couche, fk, success, error){
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"getFeaturesFk", fk: fk, layer:couche};
        $.ajax({
            url:  this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                var analyseur = new AnalyseurGeoJSON({
                    projectionCarte: that.options.projectionCarte});
                var occurences = analyseur.lire(data);
                that.success(occurences);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError);
            }
        });
    };
    
    /**
     * Permet d'obtenir les couches associés à un type de Regroupement
     * @method
     * @name obtenirCouchesAssociees
     * @param {Objet} regroupement Données du regroupement
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     */    
    Service.prototype.obtenirCouchesAssociees = function(regroupement, success, error){
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"getAssocLayers", grouping: regroupement};
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
     * Permettre d'obtenir les regroupements selon un foreign key au besoin
     * @method
     * @name Service#obtenirRegroupement
     * @param {type} fkId Clé permettant d'obtenir les regroupements associés
     * @param {function} success Fonction appelée lorsque l'appel au service à fonctionné correctement. Attention, il se peut tout de même que le service ait retourne une erreur {result:"failure",error:"Une erreur s'est produite."}.
     * @param {function} error Fonction  appelé lorsque l'appel au service n'a pas fonctionné correctement.
     * @returns {undefined}
     */
    Service.prototype.obtenirRegroupement = function(fkId, success, error) {
        
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"getGrouping", fkId: fkId};
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
     * Obtenir la description des attributs d'un regroupement
     * @method
     * @name Service#decrireRegroupement
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */    
    Service.prototype.decrireRegroupement = function(success, error){
        
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"describeGrouping"};
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
     * Créer un regroupement
     * @method
     * @name Service#creerRegroupement
     * @param {object} regroupement Objet du regroupement à créer
     * @param {integer} fkId Foreign key associé à une table parent si existant
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.creerRegroupement = function(regroupement, fkId, success, error) {
        
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"createGrouping", grouping: regroupement, fkId:fkId};
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
     * Modifier les données d'un regroupement
     * @method
     * @name Service#modifierRegroupement
     * @param {object} regroupement Objet du regroupement à modifier
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.modifierRegroupement = function(regroupement, success, error) {
        
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"updateGrouping", grouping: regroupement};
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
     * Supprimer un regroupement
     * @method
     * @name Service#supprimerRegroupement
     * @param {object} regroupement Objet du regroupement à supprimer
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.supprimerRegroupement = function(regroupement, success, error) {
       
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"deleteGrouping", grouping: regroupement};
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
     * Dupliquer un regroupement à partir d'un ID
     * @method
     * @name Service#dupliquerRegroupement
     * @param {integer} idRegroupement id du regroupement à dupliquer
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.dupliquerRegroupement = function(idRegroupement, success, error) {
      
        var that = this;
        that.success = success;
        that.error = error;
        
        var r = {request:"duplicateGrouping", idGrouping: idRegroupement};
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
     * Associer un document à un regroupement
     * @method
     * @name Service#associerDocument
     * @param {object} regroupement objet du regroupement auquel le fichier doit être associé
     * @param {file} document Fichier à associer au regroupement
     * @param {string} nom nom du document
     * @param {string} extension Extension du document
     * @param {string} taille taille plysique du document
     * @param {string} mime mime du fichier (ex. image/png)
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.associerDocument = function(regroupement, document, nom, extension, taille, mime, success, error) {
      
        var that = this;
        that.success = success;
        that.error = error;
                                              
        var dataForm = new FormData();

        dataForm.append('uploadFile', document);
        dataForm.append('fileName', nom);
        dataForm.append('extension', extension);
        dataForm.append('size', taille);
        dataForm.append('mime', mime);
        dataForm.append('grouping', regroupement);
        dataForm.append('request',"associateDocument");
        
       //var r = {request:"associateDocument", grouping: regroupement, document: document};
        $.ajax({
            url:  this.options.url,
            type:"POST",
            data:dataForm,
            cache: false,
            contentType: false,
            processData: false,            
            success:function(data){
                that.success(data);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError);
            }
        });            
    };
    
    /**
     * Supprimer un document d'un regroupement
     * @method
     * @name Service#supprimerDocument
     * @param {object} document informations du document à supprimer
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.supprimerDocument = function(document, success, error) {
        
        var that = this;
        that.success = success;
        that.error = error; 
        
        var r = {request:"deleteDocument", document: document};
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
     * Visualiser un document d'un regroupement
     * @method
     * @name Service#visualiserDocument
     * @param {object} document informations du document à visualiser
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.visualiserDocumentOld = function(document, success, error) {
        
        var that = this;
        that.success = success;
        that.error = error; 
        
        var r = {request:"downloadDocument", document: document};
        $.ajax({
            url: this.options.url,
            type:"POST",
            data:r,
            cache: false,
            contentType: false,
            processData: false,
            success:function(data){
                that.success(data);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError);
            }
        });        
    };
/**
     * Visualiser un document d'un regroupement
     * @method
     * @name Service#visualiserDocument
     * @param {object} document informations du document à visualiser
     * @param {string} attrNomFichier Attribut correspond au nom du fichier dans l'objet document
     * @param {string} attrMimeFichier Attribut correspond au mime du fichier dans l'objet document
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.visualiserDocument = function(document, attrNomFichier, attrMimeFichier, success, error) {
        
        var that = this;
        if($("#iframeVisualiserDoc")){
                $("#iframeVisualiserDoc").remove();
        }

        /*Créer un iframe qui contiendra le form qui servira à soumettre les paramètres aux services de conversion
         * On doit faire ainsi afin de nous permettre de retourner plusieurs fichiers.
         */
        var iframe = $('<iframe id="iframeVisualiserDoc" style="visibility: collapse;"></iframe>');
        $('body').append(iframe);
        var content = iframe[0].contentDocument;

        var inputs = '';

        inputs+='<textarea id="document" class="form-control" type="hidden" name="document">'+ JSON.stringify(document) +'</textarea>';
        if(attrNomFichier){
            inputs+='<input id="name" name="outputName" value="' + attrNomFichier +'" class="form-control">';
        }
        inputs+='<input id="name" name="request" value="downloadDocument" class="form-control">';

        var form = '<form name=' + attrNomFichier + ' action="'+ this.options.url +'" method="post">'+inputs+'</form>';
        content.write(form);
        $('form', content).submit();
    };
    
    /**
     * Lister les documents associés
     * @method
     * @name Service#listerDocuments
     * @param {object} regroupement objet du regroupement auquel les documents doivent être listés
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.listerDocuments = function(regroupement, success, error) {
        var that = this;
        that.success = success;
        that.error = error; 
        
        var r = {request:"getDocumentList", grouping:regroupement};
        $.ajax({
            url: this.options.url,
            type:"POST",
            data:r,
            success:function(data){
                that.success(data.documentlist);
            },
            error:function(xhr,ajaxOptions,thrownError){
                that.error(xhr.status, thrownError);
            }
        });     
    };
    
    /**
     * Obtenir la descriptions des champs des documents associés
     * @method
     * @name Service#obtenirDescriptionDocument
     * @param {function} success Fonction à exécuter après le succès du ajax
     * @param {function} error Fonction à exécuter après l'échec du ajax
     */
    Service.prototype.obtenirDescriptionDocument = function(success, error) {
        var that = this;
        that.success = success;
        that.error = error; 
        
        var r = {request:"getdocumentdescription"};
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
    

    return Service;   
});

