/** 
 * Module pour l'objet {@link Couche.Vecteur.VecteurCluster}.
 * @module vecteurCluster
 * @requires vecteur
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['vecteur', 'occurence', 'aide', 'style', 'cluster'], function(Vecteur, Occurence, Aide, Style, Cluster) {
    function VecteurCluster(options){
        this.options = options || {};
        this.garderHistorique = this.options.garderHistorique;
        this._historiqueOccurencesAjoutees=[];
        this._historiqueOccurencesEnlevees=[];
        this.defautOptions.selectionnable = true;
        this.listeOccurences = [];
        this.listeClusters = [];
        this.styles={};
        this.templates={};
        this._init();
    };
    
    VecteurCluster.prototype = new Vecteur();
    VecteurCluster.prototype.constructor = VecteurCluster;
    
    VecteurCluster.prototype._init = function(){
        var that=this;
        this.defautOptions.styles = {
            defaut:{
                rayon: "${radius}",
                couleur: "#ffcc66",
                opacite: 0.8,
                limiteCouleur: "#cc6633",
                contexte: {
                    radius: function(occurence) {
                        var rayonMin = that.options.rayonMin || 2;
                        var rayonMax = that.options.rayonMax || 7;
                        var pix = rayonMin;
                        if(!occurence){
                            pix = Number(rayonMin)+2;
                        } else if(occurence.obtenirTypeClasse() === 'Cluster') {
                            pix = Math.min(occurence.obtenirPropriete('count'), rayonMax) + rayonMin;
                        }
                        return pix;
                    }
                }
            }
        };
 
        this._optionsOL = {
            strategies: [new OpenLayers.Strategy.Cluster({
                    threshold: this.options.seuilCluster || 1,
                    distance: this.options.distance || 20,
                    shouldCluster: $.proxy( this._shouldCluster, this )
            })]   
        };
        Vecteur.prototype._init.call(this);
    };


    VecteurCluster.prototype._shouldCluster = function(cluster, feature){
        if(this.options.clusteriser){
            var clusterIgo = new Cluster(cluster, undefined, undefined, undefined, {_keepFeature: true});
            return this.options.clusteriser(clusterIgo, this.obtenirOccurenceParId(feature.id));
        }
        
        var zoom = this.carte.obtenirZoom();
        if(this.options.clusterZoomMax && this.options.clusterZoomMax < zoom){
            return false;
        }
        
        var strategie = this._optionsOL.strategies[0];
        var cc = cluster.geometry.getBounds().getCenterLonLat();
        var fc = feature.geometry.getBounds().getCenterLonLat();
        var distance = (
            Math.sqrt(
                Math.pow((cc.lon - fc.lon), 2) + Math.pow((cc.lat - fc.lat), 2)
            ) / strategie.resolution
        );
        return (distance <= strategie.distance);
    }

    VecteurCluster.prototype._ajoutCallback = function(target, callback, optCallback){
        var that=this;
        this._layer.events.register('moveend', this._layer.strategies[0], function(event){
            that._layer.events.unregister('moveend', this, this.cluster);
            if(that.carte.obtenirZoom() === that.zoomPrecedent) {
                return true;
            }
            that.zoomPrecedent = that.carte.obtenirZoom();
            if(that.listeOccurences.length && !this.clustering && (!event || event.zoomChanged) && this.features) {
                var resolution = this.layer.map.getResolution();
                if(resolution != this.resolution || !this.clustersExist()) {
                    this.cluster();
                    that.definirClusters();
                }
            }
        });
        
        Vecteur.prototype._ajoutCallback.call(this, target, callback, optCallback);
    };
    
    VecteurCluster.prototype.appliquerCluster = function(){ 
        var listFeatures = [];
        if(!this._layer.map){
            console.warn("Cette couche n'est pas associée à la carte, impossible d'appliquer les clusters.");
            return false;
        }
        $.each(this.listeOccurences, function(key, value){
            listFeatures.push(value._feature);	
        });
	this._layer.removeAllFeatures();
	this._layer.addFeatures(listFeatures);
        this.definirClusters();
    };

    VecteurCluster.prototype.definirClusters = function(){
        var that=this;
        var cluster = [];
        $.each(this.listeClusters, function(key, value){
            value.vecteur = undefined;
            that.carte.gestionCouches.enleverOccurenceSurvol(value);
        });
        $.each(this._layer.features, function(key, value){
            var listeOccurences = [];
            if(value.cluster){
                $.each(value.cluster, function(key2, value2){
                    var occ = that.obtenirOccurenceParId(value2.id); 
                    if(occ){
                        occ.estDansCluster = true;
                        listeOccurences.push(occ);
                    }
                });
                var clusterT = new Cluster(value, listeOccurences, undefined, undefined, {_keepFeature: true});
                clusterT.vecteur = that;
                cluster.push(clusterT);	
            } else {
                var occ = that.obtenirOccurenceParId(value.id);                
                occ.estDansCluster = false;
            }
        });
        this.listeClusters = cluster;
        this.rafraichirClusters();
        return cluster;
    };
    
    VecteurCluster.prototype.rafraichirClusters = function(reset){ 
        $.each(this.obtenirClusters(), function(key, cluster){
            var doitSelectionner = reset ? false : cluster.estSelectionnee();
            if(!doitSelectionner){
                $.each(cluster.listeOccurences, function(key2, occ){
                    if(occ.estSelectionnee()){
                        doitSelectionner = true;
                        return false;
                    }
                });
            }
            if(doitSelectionner && !cluster.estSelectionnee()){
                cluster.selectionner();
            } else if(!doitSelectionner && cluster.estSelectionnee()){
                cluster.deselectionner();
            }
        });
        
        this.rafraichir();
    };
    
        
    VecteurCluster.prototype.obtenirClusters = function(){ 
        return this.listeClusters;
    };
    
    VecteurCluster.prototype.obtenirClusterParId = function(id) { 
        var cluster;
        $.each(this.obtenirClusters(), function(key, value){
            if(value.id===id){
                cluster = value;
                return false;
            };
        });
        return cluster;
    };
    
    VecteurCluster.prototype.obtenirClusterParOccurence = function(occurence) { 
        var cluster;
        $.each(this.obtenirClusters(), function(key, clusterT){
            $.each(clusterT.listeOccurences, function(key2, value){
                if(value.id===occurence.id){
                    cluster = clusterT;
                    return false;
                };
            });
            if(cluster){return false;}
        });
        return cluster;
    };
    
    VecteurCluster.prototype.ajouterOccurence = function(occurence, opt) {
        opt = opt || {};
        Vecteur.prototype.ajouterOccurence.call(this, occurence, opt);
        if(!opt.tableauOccurences){
            this.appliquerCluster();
        }
    };  

    VecteurCluster.prototype.ajouterOccurences = function(occurences, opt) {
        opt = opt || {};
        opt.tableauOccurences = true;
        Vecteur.prototype.ajouterOccurences.call(this, occurences, opt);
        this.appliquerCluster();
    };

    VecteurCluster.prototype.enleverOccurence = function(occurence, opt) { 
        opt = opt || {};
        Vecteur.prototype.enleverOccurence.call(this, occurence, opt);
        if(!opt.tableauOccurences){
            this.appliquerCluster();
        }
    };
    
    VecteurCluster.prototype.enleverOccurences = function(occurences, opt) { 
        opt = opt || {};
        opt.tableauOccurences = true;
        Vecteur.prototype.enleverOccurences.call(this, occurences, opt);
        this.appliquerCluster();
    };

    VecteurCluster.prototype.enleverTout = function(opt) {
        this.enleverOccurences(this.listeOccurences, opt);
    };
    
//    VecteurCluster.prototype.rafraichir = function(occurence) {
//        this.rafraichirClusters();
//        Vecteur.prototype.rafraichir.call(this, occurence);
//    };
    
    return VecteurCluster;    
});