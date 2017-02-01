/**
 * Module pour l'objet {@link Couche.Vecteur.WFS}.
 * @module WFS
 * @requires vecteur
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['vecteur', 'occurence', 'aide', 'style'], function(Vecteur, Occurence, Aide, Style) {
    function WFS(options){
        this.options = options || {};
        this.options.supprimable = false;
        this.garderHistorique = this.options.garderHistorique;
        this._historiqueOccurencesAjoutees=[];
        this._historiqueOccurencesEnlevees=[];
        this.defautOptions.selectionnable = true;
        this.defautOptions.projection = Aide.obtenirNavigateur().carte.obtenirProjection();
        this.listeOccurences = [];
        this.styles={};
        this.templates={};
        this._init();
    }

    WFS.prototype = new Vecteur();
    WFS.prototype.constructor = WFS;

    WFS.prototype._init = function(){
        this._optionsOL = {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
                url: this.options.url,//"http://demo.boundlessgeo.com/geoserver/wfs"
                srsName: typeof this.options.projection == 'undefined' ?
                                    this.defautOptions.projection:
                                    this.options.projection,
                featureType: this.options.nom // "states"
                //featureNS: "http://www.openplans.org/topp"
            }),
            projection: typeof this.options.projection == 'undefined' ?
                                new OpenLayers.Projection(this.defautOptions.projection):
                                new OpenLayers.Projection(this.options.projection) 
        };

        Vecteur.prototype._init.call(this);
    };


    WFS.prototype._ajoutCallback = function(target, callback, optCallback){
        var that=this;
        this._layer.events.register('featuresadded', this._layer, function(event){
            if(!event.features[0].utilisateur){
                that.enleverTout();
                that.ajouterOccurences(event.features, {existe: true});
            }
        });

        Vecteur.prototype._ajoutCallback.call(this, target, callback, optCallback);
    };

    return WFS;
});
