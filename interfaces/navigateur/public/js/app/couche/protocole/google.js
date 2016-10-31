/** 
 * Module pour l'objet {@link Couche.Google}.
 * @module google
 * @requires couche 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */

define(['couche', 'aide'], function(Couche, Aide) {
    var trafficLayer = false;
    /** 
     * Création de l'object Couche.Google.
     * Pour la liste complète des paramètres, voir {@link Couche}
     * @constructor
     * @name Couche.Google
     * @class Couche.Google
     * @alias google:Couche.Google
     * @extends Couche
     * @requires google
     * @param {String} [options.titre="Google"] Nom de la couche
     * @param {String} [options.nom="route"] Type de la carte {terrain | satellite | hybride | route}.
     * @param {Boolean} [options.useTiltImages="false"] Utilisation des images à 45°.
     * @returns {Couche.Google} Instance de {@link Couche.Google}
    */
    function Google(options){
            this.options = options || {};
            this.options.fond = true;
            this.options.opaciteSlider = false;
    
            this._optionsOL = {
                sphericalMercator: true, 
                numZoomLevels: 20,
                printOptions: false,
                visibility: true
            };

            //this._init();
    };

    Google.prototype = new Couche();
    Google.prototype.constructor = Google;

    /** 
     * Initialisation de l'object Couche.Google.
     * Appelé lors de la création.
     * @method 
     * @private
     * @name Couche.Google#_init
    */
    Google.prototype._init = function(){
        var type = google.maps.MapTypeId.ROADMAP;
        if (this.options.nom){
            switch (this.options.nom.toLowerCase()){
                case "terrain":
                    type = google.maps.MapTypeId.TERRAIN;
                    break;
                case "satellite":
                    type = google.maps.MapTypeId.SATELLITE;
                    break;
                case "hybride":
                    type = google.maps.MapTypeId.HYBRID;
                    break;
                case "route":
                default:
                    type = google.maps.MapTypeId.ROADMAP;
            };
        };
        this._optionsOL.type = type;

        Couche.prototype._init.call(this);
        if(!this.options.titre){this.options.titre='Google';};
        this._layer = new OpenLayers.Layer.Google(
            this.options.titre, 
            this._optionsOL
        );

        if(Aide.toBoolean(!this.options.useTiltImages) && (type === google.maps.MapTypeId.SATELLITE)){
        
            var nav = Aide.obtenirNavigateur();
        
            nav.evenements.ajouterDeclencheur('ajouterCouche', function(e){
                e.couche._layer.mapObject.setTilt(0);
                this.enleverDeclencheur(e.type, e.options.id);
            }, {id: this._layer.id+'desactiveTilt'});
        }
    };

    Google.prototype._ajoutCallback = function(target, callback, optCallback){
        var that=this;
        var options = $.extend({}, that.defautOptions, Aide.obtenirConfig(that.obtenirTypeClasse()), that.options);
        var googleConnexion = options.url ? window.location.protocol + options.url : window.location.protocol + '//maps.google.com/maps/api/js?';
        if(options.client){
            googleConnexion += "&client=" + options.client;
            if(options.signature){
                googleConnexion += "&signature=" + options.signature;
            }
            if(options.channel){
                googleConnexion += "&channel=" + options.channel;
            }
        } else if (options.key){
            googleConnexion += "&key=" + options.key;
        }

        require(['async!'+googleConnexion], function(){
            that._init();
            Couche.prototype._ajoutCallback.call(that, target, callback, optCallback);

            var nav = Aide.obtenirNavigateur();
            var arbo = nav.obtenirPanneauxParType('Arborescence', 2)[0];
            if(arbo){
                that._ajouterContexteSubmenu(arbo.contexteMenu);
                return true;
            } else {
                if(!nav.evenements.obtenirDeclencheur('initArborescence', 'googleAjouterContexteSubmenu').length){
                    nav.evenements.ajouterDeclencheur('initArborescence', function(e){
                        that._ajouterContexteSubmenu(e.target.contexteMenu);
                        nav.evenements.enleverDeclencheur('initArborescence', 'googleAjouterContexteSubmenu');
                    }, {id: 'googleAjouterContexteSubmenu'});
                }
            }
        }, function (err) {
            Aide.afficherMessage("Google indisponible", "Impossible d'ajouter la couche Google", 'Ok', 'Error');
        });
    }
        
    Google.prototype.activerTrafic = function(){
        if(!trafficLayer){
            trafficLayer = new google.maps.TrafficLayer();
        }
        trafficLayer.setMap(this._layer.mapObject);
    }
    
    Google.prototype.desactiverTrafic = function(){
        trafficLayer.setMap();
    }
    
    Google.prototype.aTrafic = function(){
        return trafficLayer;
    }
    
    Google.prototype._ajouterContexteSubmenu = function(contexteMenu){
        if(contexteMenu._googleSubmenuBool){return true;}
        contexteMenu._googleSubmenuBool=true;
        var that=this;
        contexteMenu.ajouter({
            id: 'afficherTraficGoogle',
            titre: 'Afficher traffic', 
            action: function(args){
                args.couche.activerTrafic();
                args.couche.activer();
            }, 
            condition: function(args){
                return (args.couche.obtenirTypeClasse()==='Google' && (!trafficLayer || !trafficLayer.getMap()));
            },
            position: 3
        });
        contexteMenu.ajouter({
            id: 'cacherTraficGoogle',
            titre: "Cacher traffic", 
            action: function(args){
                args.couche.desactiverTrafic();
            }, 
            condition: function(args){
                return (args.couche.obtenirTypeClasse()==='Google' && trafficLayer && trafficLayer.getMap());
            },
            position: 3
        });
    }
    
    return Google;
});