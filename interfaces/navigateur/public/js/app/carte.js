/**
 * Module pour l'objet {@link Carte}.
 * @module carte
 * @requires point
 * @requires limites
 * @requires gestionCouches
 * @requires evenement
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['point', 'occurence', 'limites', 'gestionCouches', 'evenement', 'aide', 'browserDetect', 'contexteMenuCarte', 'html2canvas', 'html2canvassvg', 'canvg', 'es6promise', 'libs/extension/OpenLayers/fixOpenLayers'], function(Point, Occurence, Limites, GestionCouches, Evenement, Aide, BrowserDetect, ContexteMenuCarte, html2canvas, html2canvassvg) {
    /**
     * Création de l'object Carte.
     * @constructor
     * @name Carte
     * @class Carte
     * @alias carte:Carte
     * @requires carte
     * @param {String} [options.projection=EPSG:900913] Projection de la carte
     * @param {String} [options.projectionAffichage=EPSG:4326] Projection utilisée pour l'affichage des coordonnées
     * @returns {Carte} Instance de {@link Carte}
     * @property {GestionCouches} gestionCouches Gestionnaire des couches
     * @property {Dictionnaire} options Options de la carte.
     */
    function Carte(options) {
        this.isReady = false;
        this.gestionCouches = new GestionCouches(this);
        this.options = options || {};
        this._init();
        this.controles = new Carte.Controles(this);
    }

    Carte.prototype = new Evenement();
    Carte.prototype.constructor = Carte;

    /**
     * Initialisation de l'object Carte.
     * Appelé lors de la création.
     * @method
     * @private
     * @name Carte#_init
     */
    Carte.prototype._init = function() {
        /**
         * Forcer le dictionnaire francais pour les label
         * entre autres pour le label  Échelle = 1: dans la zone d'info en bas...
         */
        OpenLayers.Lang.setCode('fr');
        OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
        OpenLayers.Util.onImageLoadErrorColor = "transparent";
        OpenLayers.ProxyHost = Aide.obtenirProxy(true);

        this.projection = this.options.projection || "EPSG:3857";
        this.projectionAffichage = this.options.displayProjection || "EPSG:4326";
        this.limiteEtendue;

        var etendueMax, resolutions, resolutionMax;

        if (this.options.etendueMax) {

            if (this.options.etendueMax === "aucune") {
                etendueMax = undefined;
            } else {
                etendueMax = new OpenLayers.Bounds(this.options.etendueMax.split(","));
            }
        } else {
            etendueMax = new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34).transform(new OpenLayers.Projection("EPSG:3857"), this.projection);
        }

        if (this.options.resolutions) {
            resolutions = this.options.resolutions.split(/,/).map(parseFloat); //Met les valeurs dans un array de float au lieu d'un string
        }

        if (this.options.limiteEtendue) {
            if (this.options.limiteEtendue === "aucune") {
                this.limiteEtendue = undefined;
            } else {
                this.limiteEtendue = new OpenLayers.Bounds(this.options.limiteEtendue.split(","));
            }
        } else {
            this.limiteEtendue = new OpenLayers.Bounds(-11000000, 3397938, -4806248, 9512143).transform(new OpenLayers.Projection("EPSG:3857"), this.projection);
        }

        if (this.options.resolutionMax) {
            resolutionMax = parseFloat(this.options.resolutionMax);
        }

        var mapOptions = {
            numZoomLevels: this.options.niveauZoom || 20,
            projection: new OpenLayers.Projection(this.projection),
            displayProjection: new OpenLayers.Projection(this.projectionAffichage),
            units: 'm',
            zoomMethod: null,
            restrictedExtent : this.limiteEtendue,
            maxExtent: etendueMax,
            resolutions: resolutions,
            maxResolutions: resolutionMax,
            controls: [],
            Z_INDEX_BASE: {
                BaseLayer: 100,
                Overlay: 11000,
                Vecteur: 20000,
                Feature: 30000,
                Popup: 40000,
                Control: 50000
            },
            eventListeners: this._initEvents(),
            fallThrough: true
        };
        //todo: pouvoir donner un div, un centre et un niveau de zoom a la carte
        this._carteOL = new OpenLayers.Map('igoInstance', mapOptions);
        //this.gestionCouches.ajouterCouche(new Blanc({visible:true, active:true}));

        //Controles
        this._carteOL.addControl(new OpenLayers.Control.Attribution({separator: ', '}));
        this._carteOL.addControl(new OpenLayers.Control.PanPanel());
        this._carteOL.addControl(new OpenLayers.Control.ZoomPanel());
        this._carteOL.addControl(new OpenLayers.Control.Navigation({
            type: OpenLayers.Control.TYPE_TOGGLE,
            zoomWheelEnabled: true
        }));
        var scaleLine = new OpenLayers.Control.ScaleLine({
            'bottomOutUnits': "",
            geodesic: true
        });
        this._carteOL.addControl(scaleLine);
        //var lPanel = new OpenLayers.Control.LoadingPanel();
        // Enlever le panneau avec la barre de chargement, car gèle l'application en https.
        //this.carteOL.addControl(lPanel);
    };


    Carte.prototype._initEvents = function() {
        var that = this;
        return {
            featureover: function(e) {
                var couche = that.gestionCouches.obtenirCoucheParId(e.feature.layer.id);
                if (!couche) {
                    return false;
                }
                if (!that.controles.occurenceEvenement.actif &&
                    that.controles.occurenceEvenement.exception !== couche) {
                    return true;
                }
                var occurence = couche.obtenirOccurenceParId(e.feature.id);
                if (!occurence && couche.obtenirTypeClasse() === "VecteurCluster") {
                    occurence = couche.obtenirClusterParId(e.feature.id);
                }
                if (!occurence) {
                    return false;
                }

                if(occurence.obtenirInteraction('survol') === false){
                    return false;
                }
                that.gestionCouches.ajouterOccurenceSurvol(occurence);
            },
            featureout: function(e) {
                if(!e.feature.layer){
                    return false;
                }
                var couche = that.gestionCouches.obtenirCoucheParId(e.feature.layer.id);
                if (!couche) {
                    return false;
                }
                if (!that.controles.occurenceEvenement.actif &&
                    that.controles.occurenceEvenement.exception !== couche) {
                    return true;
                }
                var occurence = couche.obtenirOccurenceParId(e.feature.id);
                if (!occurence && couche.obtenirTypeClasse() === "VecteurCluster") {
                    occurence = couche.obtenirClusterParId(e.feature.id);
                }
                if (!occurence) {
                    return false;
                }

                if(occurence.obtenirInteraction('survol') === false){
                    return false;
                }

                that.gestionCouches.enleverOccurenceSurvol(occurence);
            },
            featureclick: function(e) {
                var couche = that.gestionCouches.obtenirCoucheParId(e.feature.layer.id);
                if (!couche) {
                    return false;
                }
                if (!that.controles.occurenceEvenement.actif &&
                    that.controles.occurenceEvenement.exception !== couche) {
                    return true;
                }
                var occurence = couche.obtenirOccurenceParId(e.feature.id);
                if (!occurence && couche.obtenirTypeClasse() === "VecteurCluster") {
                    occurence = couche.obtenirClusterParId(e.feature.id);
                }
                if (!occurence) {
                    return false;
                }

                if(occurence.obtenirInteraction('cliquable') === false){
                    return false;
                }

                var dessus = false;
                var occSurvolArray = that.gestionCouches.obtenirListeOccurencesSurvols();
                if(occSurvolArray.length){
                    var lastOccSurvol = occSurvolArray[occSurvolArray.length-1];
                    if(lastOccSurvol.id === occurence.id){
                        dessus = true;
                    }
                }
                couche.declencher({
                    type: "occurenceClique",
                    occurence: occurence,
                    dessus: dessus
                });
            },
            moveend: function() {
                that.declencher({
                    type: "limitesModifiees"
                });
            },
            zoomend: function() {
                that.declencher({
                    type: "zoomEnd"
                });
            },
            mouseout: function() {
                that.declencher({
                    type: "quitterSurvolCarte"
                });
                clearTimeout(that._timerEvenementPauseSurvol);
            },
            mousemove: function(e) {
                that.coordSouris = e.xy;
                var lonlat = that._carteOL.getLonLatFromViewPortPx(that.coordSouris);
                if (!lonlat) {
                    return false;
                }
                that.declencher({
                    type: "survolerCarte",
                    x: lonlat.lon,
                    y: lonlat.lat
                });
                clearTimeout(that._timerEvenementPauseSurvol);
                that._timerEvenementPauseSurvol = setTimeout(function() {
                    clearTimeout(that._timerEvenementPauseSurvol);
                    that.declencher({
                        type: "pauseSurvolCarte",
                        x: that._carteOL.getLonLatFromViewPortPx(that.coordSouris).lon,
                        y: that._carteOL.getLonLatFromViewPortPx(that.coordSouris).lat
                    });
                }, 500);
            },
            changelayer: function(e) {
                if (e.property === "visibility") {
                    var couche = that.gestionCouches.obtenirCoucheParId(e.layer.id);
                    if (!couche) {
                        return false;
                    }
                    that.gestionCouches.declencher({
                        type: "coucheVisibilitéChangée",
                        couche: couche
                    });
                }
            },
            changebaselayer: function(e) {
                var restrictedExtent;
                if(e.layer.options.limiteEtendue){
                    restrictedExtent = e.layer.options.limiteEtendue;
                } else if(that.limiteEtendue) {
                    restrictedExtent = that.limiteEtendue;
                } else {
                    restrictedExtent = undefined;
                }
                if(that._carteOL.restrictedExtent !== restrictedExtent){
                    that._carteOL.restrictedExtent = restrictedExtent;
                    var zoom = that.obtenirZoom();
                    that.zoomer(zoom - 1);
                    that.zoomer(zoom);
                }
            }
        };
    };

    /**
     * Permet d'exporter un canvas de la carte
     * @method
     * @name Carte#exporterCanvas
     * @return {Canvas} Une version canvas de la carte
     */
    Carte.prototype.exporterCanvas = function() {
        var that = this;
        var deferred = jQuery.Deferred();
        var options = {
             useCORS: true,
             allowTaint: false
             // proxy: Aide.obtenirConfig('uri.services') + '/proxy/html2canvasproxy.php', // useCORS doit être à false
        };

        // Correctif pour support Internet Explorer et RequireJS
        html2canvas.svg = html2canvassvg;
        window.html2canvas = html2canvas;

        var carteDiv = this._carteOL.div;
        var $carteDiv = $(carteDiv);
        this._canvasAddSvgFirefox($carteDiv);

        $('body').addClass("media-print-igo");

        // Cross-origin pour les images
        $carteDiv.find("img:visible").each(function(k,v){
            if(v.src.substring(0, 5)=== "data:" || v.getAttribute("crossorigin") === "anonymous") {return true;} 
            v.srcBeforePrint = v.src;
            v.src=Aide.utiliserProxy(v.src);
        })

        html2canvas(carteDiv, options).then(function(canvas) {
            $('body').removeClass("media-print-igo");
            $carteDiv.find("img:visible").each(function(k,v){
                if(v.srcBeforePrint) {
                    v.src = v.srcBeforePrint;
                } 
            })
            that._canvasRemoveSvgFirefox($carteDiv);
            that._canvasAddSvgImage($carteDiv, canvas, deferred);
        })

        return deferred.promise();
    };

    /**
     * Permet d'exporter une image de la carte au format PNG.
     * @method
     * @name Carte#exporterImage
     * @param {function} callbackPreprocesseurCanvas
     *        Callback de modification du canvas avant la convertion en image.
     * @return {Image} Une version image PNG de la carte
     */
    Carte.prototype.exporterImage = function(callbackPreprocesseurCanvas) {
        var deferred = jQuery.Deferred();

        this.exporterCanvas().then(function(canvas) {
            var image = new Image();

            try {
                if(callbackPreprocesseurCanvas) {
                    canvas = callbackPreprocesseurCanvas(canvas);
                    if(!canvas) {
                        return false;
                    }
                }

                image.src = canvas.toDataURL("image/png");
            } catch(e) {
                deferred.reject(e);
            }

            image.onload = function () {
                deferred.resolve(image);
            }
            image.onerror = function(error) {
                deferred.reject(error);
            };

        }).fail(function(erreur) {
            deferred.reject(erreur);
        });

        return deferred.promise();
    };


    Carte.prototype._canvasAddSvgImage = function($div, canvas, deferred) {
        var svgElements = $div.find("svg image");
        var length = svgElements.length;
        svgElements.each(function (k, svg) {
            var source = new Image();
            source.src = svg.getAttribute("xlink:href");
            var ctx = canvas.getContext('2d'); 

            var dx = 0;
            var dy = 0;
            var transform = svg.parentElement.parentElement.transform.baseVal;
            if (transform.length) {
                dx = transform[0].matrix['e'];
                dy = transform[0].matrix['f'];
            }

            var x = Number(svg.getAttribute("x")) + dx;
            var y = Number(svg.getAttribute("y")) + dy;
            var height = Number(svg.getAttribute("height"));
            var width = Number(svg.getAttribute("width"));

            source.onload = function(){
                ctx.drawImage(source, x, y, width, height);
                if (k >= length-1) {
                    deferred.resolve(canvas);
                }
            }
        });
        if (length === 0) {
            deferred.resolve(canvas);
        }
    };


    Carte.prototype._canvasAddSvgFirefox = function($div) {
        if (BrowserDetect.browser !== 'Firefox') {
            return true;
        }
        var svgElements = $div.find("svg");

        svgElements.each(function () {
            var canvas, xml;
            canvas = document.createElement("canvas");
            canvas.className = "screenShotTempCanvas";

            // Retrait des images pour imprimer les labels
            var $svg = $(this).clone();
            $svg.find('image').each(function (k, item) {
                $item = $(item);
                $parent = $item.parent();
                $item.remove();
                if (!$parent.children().length) {
                    $parent.remove();
                }
            });

            //convert SVG into a XML string
            xml = (new XMLSerializer()).serializeToString($svg[0]);

            // Removing the name space as IE throws an error
            xml = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');

            //draw the SVG onto a canvas
            canvg(canvas, xml);
            $(canvas).insertAfter(this);
            //hide the SVG element
            this.tempHide = true;
            $(this).hide();
        });
    };

    Carte.prototype._canvasRemoveSvgFirefox = function($div) {
        if (BrowserDetect.browser !== 'Firefox') {
            return true;
        }
        $div.find('.screenShotTempCanvas').remove();
        $div.find('svg');
        var svgElements = $div.find("svg");

        svgElements.each(function () {
            if (this.tempHide === true){
                this.tempHide = false;
                $(this).show();
            }
        });
    }

    /**
     * Obtenir la projection de la carte. (Format EPSG)
     * @method
     * @name Carte#obtenirProjection
     * @returns {String} Projection
     */
    Carte.prototype.obtenirProjection = function() {
        return this.projection;
    };

    /**
     * Obtenir la projection d'afficahge de la carte. (Format EPSG)
     * @method
     * @name Carte#obtenirProjectionAffichage
     * @returns {String} Projection
     */
    Carte.prototype.obtenirProjectionAffichage = function() {
        return this.projectionAffichage;
    };

    /**
     * Obtenir le centre de la carte.
     * @method
     * @name Carte#obtenirCentre
     * @returns {Geometrie.Point} Centre de la carte
     */
    Carte.prototype.obtenirCentre = function() {
        if (this._carteOL.getCenter() === null) {
            return null;
        }
        return new Point(this._carteOL.getCenter().lon, this._carteOL.getCenter().lat);
    };

    /**
     * Définir le centre de la carte.
     * @method
     * @name Carte#definirCentre
     * @param {Geometrie.Point} centre Centre de la carte désiré
     */
    Carte.prototype.definirCentre = function(centre) {
        if (!centre) {
            return;
        }
        var centreArray = centre;
        if (centre instanceof Point) {
            centreArray = [centre.x, centre.y];
        }
        this._carteOL.setCenter(centreArray);
    };

    /**
     * Définir la couche de base.
     * @method
     * @name Carte#definirCoucheDeBase
     * @param {couche} couche Couche désiré comme couche de base
     */
    Carte.prototype.definirCoucheDeBase = function(couche) {
        if (!couche) {
            return;
        }
        this._carteOL.setBaseLayer(couche._layer);
    };

    /**
     * Définir la projection d'affichage de la carte.
     * @method
     * @name Carte#definirProjectionAffichage
     * @param {String} projDemande
     */
    Carte.prototype.definirProjectionAffichage = function(projDemande) {

        if (!projDemande) {
            return;
        }

        var projActuel = this.obtenirProjectionAffichage();

        if (projActuel !== projDemande) {
            this.projectionAffichage = projDemande;
            this._carteOL.displayProjection = new OpenLayers.Projection(projDemande);
            this._carteOL.options.displayProjection = new OpenLayers.Projection(projDemande);
            var controlsMousePosition = this._carteOL.getControlsByClass("OpenLayers.Control.MousePosition");

            for (var i = 0; i < controlsMousePosition.length; i++) {
                controlsMousePosition[i].displayProjection = new OpenLayers.Projection(projDemande);
                if (controlsMousePosition[i].displayProjection.getUnits() === 'm') {
                    controlsMousePosition[i].numDigits = 2;
                } else {
                    controlsMousePosition[i].numDigits = 6;
                }
                if (!controlsMousePosition[i].lastXy) {
                    continue;
                }
                //reconstruction du HTML contenant les coordonnées
                controlsMousePosition[i].redraw({
                    xy: {
                        x: controlsMousePosition[i].lastXy.x,
                        y: controlsMousePosition[i].lastXy.y
                    }
                });
            }
        }
    };

    /**
     * Déplacer, avec effet, le centre de la carte vers un point.
     * @method
     * @name Carte#centrer
     * @param {Geometrie.Point} centre Centre de la carte désiré
     */
    Carte.prototype.centrer = function(centre) {
        if (!centre) {
            return;
        }
        if (this.obtenirCentre() === null) {
            return;
        }
        this._carteOL.panTo([centre.x, centre.y]);
    };

    /**
     * Obtenir le niveau de zoom de la carte.
     * @method
     * @name Carte#obtenirZoom
     * @returns {Entier} Niveau de zoom de la carte
     */
    Carte.prototype.obtenirZoom = function() {
        return this._carteOL.getZoom();
    };

    /**
     * Définir le niveau de zoom de la carte.
     * @method
     * @name Carte#definirZoom
     * @param {Entier} zoom Niveau de zoom désiré
     * @example
     * Carte.definirZoom(8);
     */
    Carte.prototype.definirZoom = function(zoom) {
        this._carteOL.zoomTo(zoom);
    };


    Carte.prototype.obtenirResolution = function() {
        return this._carteOL.resolution;
    };

    Carte.prototype.obtenirEchelle = function(approximative) {
        if (approximative) {
          var scale = this._carteOL.getScale();
          scale = Math.round(scale);
          if (scale < 10000) {
            return scale;
          }
          scale = Math.round(scale/1000);
          if (scale < 1000) {
            return scale + 'K';
          }
          scale = Math.round(scale/1000);
          return scale + 'M';
        }
        return this._carteOL.getScale();
    };

    /**
     * Obtenir les limites visibles de la carte;
     * @method
     * @name Carte#obtenirLimites
     * @returns {Geometrie.Limites} Limites visibles de la carte
     */
    Carte.prototype.obtenirLimites = function() {
        var limitesOL = this._carteOL.getExtent();
        return new Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
    };


    /*Carte.prototype.obtenirLimitesRestreintes = function() {
        var limitesOL = this._carteOL.restrictedExtent;
        return new Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
    };*/

    /**
     * Obtenir les limites maximuns de la carte;
     * @method
     * @name Carte#obtenirLimitesMax
     * @returns {Geometrie.Limites} Limites maximuns de la carte
     */
    Carte.prototype.obtenirLimitesMax = function() {
        var limitesOL = this._carteOL.restrictedExtent ||  this._carteOL.getMaxExtent();
        return new Limites(limitesOL.left, limitesOL.bottom, limitesOL.right, limitesOL.top);
    };

    /**
     * Zoomer sur les limites maximuns de la carte;
     * @method
     * @name Carte#zoomerLimitesMax
     */
    Carte.prototype.zoomerLimitesMax = function() {
        this._getCarte().zoomToMaxExtent();
    };

    /**
     * Zoomer la carte. Peut prendre en paramètre le niveau de zoom désiré ou
     * une {Geometrie.Limites}.
     * @method
     * @name Carte#zoomer
     * @param {Geometrie.Limites | Entier} param Nouvelles limites
     */
    //TODO: Permettre de rentrer d'autres géométries qu'une limite?
    Carte.prototype.zoomer = function(param, maxZoom) {
        if (param instanceof Limites) {
            var limitesOL = new OpenLayers.Bounds(param.gauche, param.bas, param.droite, param.haut);
            this._getCarte().zoomToExtent(limitesOL);
            if (this.obtenirZoom() > maxZoom) {
                this.definirZoom(maxZoom);
            }
            return;
        }
        this.definirZoom(param);
    };


    /**
     * Obtenir la carte de Openlayers;
     * @method
     * @private
     * @name Carte#_getCarte
     * @returns {objet} Carte de Openlayers
     */
    Carte.prototype._getCarte = function() {
        return this._carteOL;
    };


    Carte.Controles = function(_) {
        this._ = _;
        this.activerOccurenceEvenement();
        if (Aide.toBoolean(this._.options.aContexteMenu) !== false) {
            var nav = Aide.obtenirNavigateur();
            var initContexteMenuCarte = function(e) {
                var scope = e.options.scope;
                scope.contexteMenu = new ContexteMenuCarte({
                    carte: scope._,
                    cible: '#mapComponent .olMapViewport'
                });
            };
            if (nav && nav.isReady) {
                initContexteMenuCarte({
                    options: {
                        scope: this
                    }
                });
            } else {
                this._.ajouterDeclencheur('carteInit', initContexteMenuCarte, {
                    scope: this
                });
            }
        }
    };

    Carte.Controles.prototype.initDeplacement = function() {
        if (!this._deplacementControle) {
            this._deplacementControle = new OpenLayers.Control.DragPan({
                isDefault: true
            });
        }
    };

    Carte.Controles.prototype.activerDeplacement = function() {
        this.initDeplacement();
        this._deplacementControle.activate();
    };

    Carte.Controles.prototype.desactiverDeplacement = function() {
        if (this._deplacementControle) {
            this._deplacementControle.deactivate();
        }
    };

    Carte.Controles.prototype.initClique = function() {
        var that = this;
        if (!this._cliqueControle) {
            OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },
                handleRightClicks: true,
                initialize: function() {
                        this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                        OpenLayers.Control.prototype.initialize.apply(
                            this, arguments
                        );
                        this.handler = new OpenLayers.Handler.Click(
                            this, this.eventMethods, this.handlerOptions
                        );
                    }
                    /*,
                                     trigger: function(e) {
                                         that.clique(e);
                                     }*/
            });


            this._cliqueControle = new OpenLayers.Control.Click({
                eventMethods: {
                    'click': function(e) {
                            that.clique(e);
                        }
                        //                    'rightclick': function (e) {
                        //                        if(that._$viewport.data('contextMenu')){
                        //                            that._$viewport.contextMenu("hide");
                        //                            that._$viewport.contextMenu({x:e.clientX, y:e.clientY});
                        //                        }
                        //                    }
                }
            });
            this._._carteOL.addControl(this._cliqueControle);
        }
    };

    Carte.Controles.prototype.activerClique = function() {
        this.initClique();
        this._cliqueControle.activate();
        this._.declencher({
            type: "activerClique"
        });
    };

    Carte.Controles.prototype.desactiverClique = function() {
        if (this._cliqueControle) {
            this._cliqueControle.deactivate();
            this._.declencher({
                type: "desactiverClique"
            });
        }
    };


    Carte.Controles.prototype.clique = function(e) {
        var lonlat = this._._carteOL.getLonLatFromPixel(e.xy);
        var point = new Point(lonlat.lon, lonlat.lat);
        this._.declencher({
            type: "clique",
            point: point
        });
    };


    Carte.Controles.prototype.activerOccurenceEvenement = function() {
        this.occurenceEvenement = {
            actif: true
        };
    };

    Carte.Controles.prototype.desactiverOccurenceEvenement = function(couche) {
        this.occurenceEvenement = {
            actif: false,
            exception: couche
        };
    };

    Carte.Controles.prototype.activerDeplacementVecteur = function(couche) {
        var that = this;
        couche = couche === "active" ? this._.gestionCouches.coucheVecteurActive : couche;
        if(!couche){return false;}

        if (this.controleDrag && (this.controleDrag.layer !== couche._layer)){
            this.desactiverDeplacementVecteur();
        }

        if(!this.controleDrag){
            var cacherVertex = function(){
                if(that.controleEdition && that.controleEdition.vertices.length && !that.controleEdition.vertices[0].style){
                    $.each(that.controleEdition.vertices, function(key, value){
                        value.style = new OpenLayers.Style({fillOpacity: 0, strokeOpacity: 0});
                    });
                    $.each(that.controleEdition.virtualVertices, function(key, value){
                        value.style = new OpenLayers.Style({fillOpacity: 0, strokeOpacity: 0});
                    });
                    that.controleEdition.layer.redraw()
                }
            };

            var $olMapViewport = $('.olMapViewport');
            this.controleDrag = new OpenLayers.Control.DragFeature(couche._layer, {
                onStart: function(feature){
                    var occurence = couche.obtenirOccurenceParId(feature.id);
                    if(occurence && occurence.obtenirInteraction('editable') === false){
                        that.controleDrag.cancel();
                        return false;
                    }
                    cacherVertex();
                    that._.curseur = 'move';
                    if(occurence){
                        couche.declencher({ type: "debutDeplacementOccurence", occurence: occurence });
                    }
                },
                onDrag: function(feature){
                    cacherVertex();
                    var occurence = couche.obtenirOccurenceParId(feature.id);
                    if(occurence){
                        occurence.majGeometrie(feature.geometry, {lancerDeclencheur: false});
                        couche.declencher({ type: "deplacementOccurence", occurence: occurence });
                    }
                },
                onComplete: function(feature){
                    if(that.controleEdition){
                        that.controleEdition.resetVertices();
                    }
                    that._.curseur = undefined;
                    var occurence = couche.obtenirOccurenceParId(feature.id);
                    if(occurence){
                        occurence.majGeometrie(feature.geometry);
                        $olMapViewport.removeClass('olControlDragFeatureOver');
                        couche.declencher({ type: "finDeplacementOccurence", occurence: occurence });
                    }
                },
                onEnter: function(feature){
                    var occurence = couche.obtenirOccurenceParId(feature.id);
                    if(occurence && occurence.obtenirInteraction('editable') === false){
                        var $dragFeature = $('.olControlDragFeatureOver');
                        if($dragFeature.length){
                            $dragFeature.removeClass('olControlDragFeatureOver');
                        }
                        return false;
                    }
                },
                scope: this
            });
        }

        if(this.controleEdition && this.controleEdition.active){
            this.controleEdition.deactivate();
            this.controleDrag.handlers['drag'].stopDown = false;
            this.controleDrag.handlers['drag'].stopUp = false;
            this.controleDrag.handlers['drag'].stopClick = false;
            this._._carteOL.addControl(this.controleDrag);
            this.controleDrag.activate();
            this.controleEdition.activate();
        } else {
            this._._carteOL.addControl(this.controleDrag);
            this.controleDrag.activate();
        }
        this.controleDrag.coucheIgo = couche;

        if (this.snap) {
            this.activerSnap(couche);
        }
    }

    Carte.Controles.prototype.desactiverDeplacementVecteur = function() {
        if (this.controleDrag) {
            var couche = this.controleDrag.coucheIgo;
            this.desactiverSnap();
            this.controleDrag.deactivate();
            this._._carteOL.removeControl(this.controleDrag);
            this.controleDrag.destroy();
            this.controleDrag = undefined;
            if (couche) {
                couche.definirOrdreAffichage(couche._layer.z_index_default);
                couche.declencher({
                    type: 'controleDeplacementVecteurDesactiver'
                });
            }
        }
    }

    Carte.Controles.prototype.activerEdition = function(couche, options) {
        var that = this;
        options = options  || {};
        couche = couche === "active" ? this._.gestionCouches.coucheVecteurActive : couche;
        if(!couche){return false;}

        if (this.controleEdition && (this.controleEdition.layer !== couche._layer || this.controleEdition.optionsIgo !== options)){
            this.desactiverEdition();
        }

        if(this.controleDrag){
            this.controleDrag.handlers['drag'].stopDown = false;
            this.controleDrag.handlers['drag'].stopUp = false;
            this.controleDrag.handlers['drag'].stopClick = false;
        }

        if (!this.controleEdition) {
            var modeEdit = 0;
            if(options.editVertex !== false){
                modeEdit = OpenLayers.Control.ModifyFeature.RESHAPE ;
            }
            if(options.rotation){
                modeEdit += OpenLayers.Control.ModifyFeature.ROTATE ;
            }
            if(options.editDimension){
                modeEdit += OpenLayers.Control.ModifyFeature.RESIZE ;
            }

            if(modeEdit){
                this.controleEdition = new OpenLayers.Control.ModifyFeature(couche._layer, {
                    mode: modeEdit
                });
                this._._carteOL.addControl(this.controleEdition);
                this.controleEdition.optionsIgo = options;
                this.controleEdition.coucheIgo = couche;
            }
        }

        if(this.controleEdition){
            this.controleEdition.activate();

            this.desactiverOccurenceEvenement(couche);

            this._initEventsEdition(couche);
            this._activerEventsEdition();

            this._editionEvents.fnVecteurOccurenceSelectionnee({
                occurence: couche.obtenirOccurencesSelectionnees()[0],
                options:{
                    scope: this
                }
            });

            couche.declencher({
                type: 'controleEditionActiver'
            });

            if (this.snap) {
                this.activerSnap(couche);
            }
        }

        this.controleEdition.handlers.drag.callbacks.move = function (pixel) {
            that._.curseur = 'move';
            delete this._unselect;
            if (this.vertex) {
                this.dragVertex(this.vertex, pixel);
            }

            if(this.feature){
                var occ = new Occurence(this.feature.geometry);
                couche.declencher({
                    type: 'mesurePartielle',
                    occurence: occ
                });
            }
        }

        this.controleEdition.handlers.drag.callbacks.done = function(pixel){
            that._.curseur = undefined;
            if (this.vertex) {
                this.dragComplete(this.vertex);
            }
        }
    };

    Carte.Controles.prototype.desactiverEdition = function() {
        if (this.controleEdition) {
            var couche = this.controleEdition.coucheIgo;
            this.desactiverSnap();
            this._desactiverEventsEdition();
            this.controleEdition.deactivate();
            this._._carteOL.removeControl(this.controleEdition);
            this.controleEdition.destroy();
            this.controleEdition = undefined;
            this._editionEvents.oModifification = undefined;
            this._editionEvents.oModifificationTerminee = undefined;
            this.activerOccurenceEvenement();
            if (couche) {
                couche.definirOrdreAffichage(couche._layer.z_index_default);
                couche.deselectionnerTout();
                couche.declencher({
                    type: 'controleEditionDesactiver'
                });
            }
        }
    };

    Carte.Controles.prototype._activerEventsEdition = function() {
        this.controleEdition.layer.events.register('featuremodified', this._editionEvents.couche, this._editionEvents.fnFeatureModified);
        this.controleEdition.layer.events.register('beforefeaturemodified', this._editionEvents.couche, this._editionEvents.fnBeforeFeatureModified);
        this.controleEdition.layer.events.register('afterfeaturemodified', this._editionEvents.couche, this._editionEvents.fnAfterFeatureModified);
        this._editionEvents.couche.ajouterDeclencheur('vecteurOccurenceSelectionnee', this._editionEvents.fnVecteurOccurenceSelectionnee, {
            scope: this
        });
        this._editionEvents.couche.ajouterDeclencheur('vecteurOccurenceDeselectionnee', this._editionEvents.fnVecteurOccurenceDeselectionnee, {
            scope: this
        });
    };

    Carte.Controles.prototype._desactiverEventsEdition = function() {
        if (this.controleEdition) {
            this.controleEdition.layer.events.remove('featuremodified');
            this.controleEdition.layer.events.remove('beforefeaturemodified');
            this.controleEdition.layer.events.remove('afterfeaturemodified');
            this._editionEvents.couche.enleverDeclencheur('vecteurOccurenceSelectionnee', undefined, this._editionEvents.fnVecteurOccurenceSelectionnee);
            this._editionEvents.couche.enleverDeclencheur('vecteurOccurenceDeselectionnee', undefined, this._editionEvents.fnVecteurOccurenceDeselectionnee);
        }
    };

    Carte.Controles.prototype._initEventsEdition = function(couche) {
        this._editionEvents = {};
        this._editionEvents.couche = couche;
        this._editionEvents.oModifification = undefined;
        this._editionEvents.oModifificationTerminee = this._editionEvents.occurenceModifification;
        var that = this;
        this._editionEvents.fnFeatureModified = function(e) {
            if (!e.feature) {
                return true;
            }
            var occurence = couche.obtenirOccurenceParId(e.feature.id);
            if (!occurence) {
                return true;
            }
            occurence.majGeometrie(e.feature.geometry);
        };

        this._editionEvents.fnBeforeFeatureModified = function(e) {
            if (!e.feature) {
                return true;
            }
            var occurence = couche.obtenirOccurenceParId(e.feature.id);
            if (!occurence) {
                return true;
            }


            if(occurence.obtenirInteraction('editable') === false){
                if(occurence.obtenirTypeGeometrie() === 'Point'){
                    //la carte n'est plus focus pour un déplacement
                    that.controleEdition.handlers.drag.dragend(e)
                }
                return false;
            }

            occurence._resetVertex = function(){if(that.controleEdition){that.controleEdition.resetVertices()}};

            occurence._controle = that.controleEdition;
            that._editionEvents.oModifificationTerminee = that._editionEvents.oModifification;
            that._editionEvents.oModifification = occurence;

            that._desactiverEventsEdition();
            occurence.selectionner();
            that._activerEventsEdition();
        };

        this._editionEvents.fnAfterFeatureModified = function() {
            var occurence;
            if (that._editionEvents.oModifificationTerminee) {
                occurence = that._editionEvents.oModifificationTerminee;
                that._editionEvents.oModifificationTerminee = undefined;
                if (that._editionEvents.oModifification.id === occurence.id) {
                    //garder sélectionner l'occurence si on l'édit 2x de suite
                    occurence = undefined;
                }
            } else {
                occurence = that._editionEvents.oModifification;
                that._editionEvents.oModifification = undefined;
            }

            if (!occurence) {
                return true;
            }
            if (!occurence.vecteur) {
                //dans le cas que l'occurence a été supprimer entre-temps
                couche._layer.removeFeatures(occurence._feature);
            }

            delete occurence._resetVertex;
            that._desactiverEventsEdition();
            occurence.deselectionner();
            that._activerEventsEdition();
        };


        this._editionEvents.fnVecteurOccurenceSelectionnee = function(e) {
             //e.options.scope._desactiverEventsEdition();
            if (couche.obtenirOccurencesSelectionnees().length > 1) {
                couche.deselectionnerTout({exceptions: [e.occurence]});
            }
            if(e.occurence){
                e.options.scope.controleEdition.selectFeature(e.occurence._feature);
            }
            //e.options.scope._activerEventsEdition();
        };

        this._editionEvents.fnVecteurOccurenceDeselectionnee = function(e) {
            if (e.occurence._feature === e.options.scope.controleEdition.feature) {
               // e.options.scope._desactiverEventsEdition();
                e.options.scope.controleEdition.unselectFeature(e.occurence._feature);
               // e.options.scope._activerEventsEdition();
            }
        };
    };


    Carte.Controles.prototype.activerDessin = function(couche, type, options) {
        options = options  || {};
        //todo: créer si pas de couche? avertissement?
        couche = couche === "active" ? this._.gestionCouches.coucheVecteurActive : couche;

        if(couche && typeof couche.activer==='function'){
            couche.activer(true);
        }

        if (options.releverBoutonOutil !== false) {
            var boutonActif = Ext.ButtonToggleMgr.getPressed('carte');
            if (boutonActif) {
                Ext.ButtonToggleMgr.getPressed('carte').toggle();
            }
        }
        this._.declencher({
            type: 'controleCarteActiver'
        });

        var typeHandler = OpenLayers.Handler.Point;
        if (type === "polygone") {
            typeHandler = OpenLayers.Handler.Polygon;
        } else if (type === "ligne") {
            typeHandler = OpenLayers.Handler.Path;
        } else if (type === "regulier") {
            typeHandler = OpenLayers.Handler.RegularPolygon;
        } else if (type === "cercle") {
            typeHandler = OpenLayers.Handler.CircleToMeasure;
            options.cotes = options.cotes ||  50;
        }

        var typeControl = OpenLayers.Control.DrawFeatureEx;
        if (options.mesure) { //la couche n'est pas requise, aucun undo/redo
            if (type === "cercle") {
                typeControl = OpenLayers.Control.MeasureCircle;
            } else if (typeHandler !== OpenLayers.Handler.Point) {
                typeControl = OpenLayers.Control.Measure;
            } else {
                options.mesure = false;
            }
        }
        if (!options.mesure && !couche) {
            throw new Error("Carte.Controles.activerDessin : La couche est obligatoire");
        } else if (!options.mesure && (!couche.obtenirTypeClasse || couche.obtenirTypeClasse() !== 'Vecteur')){
            throw new Error("Carte.Controles.activerDessin : La couche doit être de type Vecteur");
        }

        if (this.controleDessin &&
            (options.detruireControle ||
                !couche ||
                this.controleDessin.layer !== couche._layer ||
                this.controleDessin.handler.CLASS_NAME !== typeHandler.prototype.CLASS_NAME ||
                this.controleDessin.CLASS_NAME !== typeControl.prototype.CLASS_NAME)) {
            this._._carteOL.removeControl(this.controleDessin);
            this.controleDessin.destroy();
            this.controleDessin = undefined;
        }
        if (!this.controleDessin) {
            this.controleDessin = new typeControl(typeHandler, {
                persist: couche ? false : true,
                immediate: true,
                geodesic: true,
                handlerOptions: {
                    holeModifier: "ctrlKey",
                    sides: Number(options.cotes) > 2 && Number(options.cotes) <= 100 ? Number(options.cotes) : undefined,
                    irregular: Aide.toBoolean(options.irregulier),
                    layer: couche ? couche._layer : undefined,
                    layerOptions: {
                        styleMap: couche ? couche._layer.styleMap : undefined
                    }
                },
                featureAdded: function(feature) {
                    var occurence = new Occurence(feature);
                    couche.declencher({
                        type: 'mesure',
                        occurence: occurence
                    });
                    couche._layer.removeFeatures(feature);
                    couche.ajouterOccurence(occurence, {
                        existe: false
                    });
                    occurence.rafraichir();
                }
            });

            if (options.mesure) {
                this.controleDessin.events.on({
                    "measure": function(e) {
                        var occ = new Occurence(e.geometry);
                        if (couche) {
                            couche.declencher({
                                type: 'mesure',
                                occurence: occ
                            });
                            couche.ajouterOccurence(occ);
                        } else {
                            this._.declencher({
                                type: 'mesure',
                                occurence: occ
                            });
                        }
                    },
                    "measurepartial": function(e) {
                        var occ = new Occurence(e.geometry);
                        if (couche) {
                            couche.declencher({
                                type: 'mesurePartielle',
                                occurence: occ
                            });
                        }
                    },
                    scope: this
                });
            } else if(typeHandler !== OpenLayers.Handler.Point){
                this.controleDessin.handler.callbacks.modify = function(vertex, feature) {
                    this.layer.events.triggerEvent(
                        "sketchmodified", {vertex: vertex, feature: feature}
                    );
                    if(feature.geometry.CLASS_NAME === "OpenLayers.Geometry.LineString" && feature.geometry.components.length < 2){
                        return false;
                    } else if (feature.geometry.CLASS_NAME === "OpenLayers.Geometry.Polygon" && feature.geometry.components[0].components.length < 3){
                        return false;
                    }
                    var occ = new Occurence(feature.geometry);
                    couche.declencher({
                        type: 'mesurePartielle',
                        occurence: occ
                    });
                }
            }

            this._._carteOL.addControl(this.controleDessin);
            this.controleDessin.coucheIgo = couche;
        }

        Aide.obtenirNavigateur().evenements.ajouterDeclencheur('controleCarteActiver', function(e) {
            e.options.scope.desactiverDessin();
        }, {
            scope: this,
            id: 'activerDessin-OutilExecuter'
        });
        this.controleDessin.activate();
        if (this.snap) {
            this.activerSnap(couche);
        }
    };

    Carte.Controles.prototype.desactiverDessin = function() {
        if (this.controleDessin) {
            Aide.obtenirNavigateur().evenements.enleverDeclencheur('controleCarteActiver', 'activerDessin-OutilExecuter');
            this.controleDessin.deactivate();
        }
    };

    Carte.Controles.prototype.activerSnap = function(couche) {
        this.desactiverSnap();
        this.snap = true;
        couche = couche === "active" ? this._.gestionCouches.coucheVecteurActive : couche;
        if (!couche) {
            return true;
        }
        if (!this.controleSnap) {
            this.controleSnap = new OpenLayers.Control.Snapping({
                layer: undefined,
                targets: [],
                greedy: false
            });

        }
        this.controleSnap.setLayer(couche._layer);
        var listeVecteurs = this._.gestionCouches.obtenirCouchesParType(["Vecteur", "VecteurCluster", "WFS"]);
        var listLayerOL = [];
        $.each(listeVecteurs, function(key, value) {
            if (value.estActive()) {
                listLayerOL.push(value._layer);
            }
        });
        this.controleSnap.setTargets(listLayerOL);
        this.controleSnap.activate();

        this._.gestionCouches.ajouterDeclencheur("coucheVisibilitéChangée", function(e) {
            if (e.couche.obtenirTypeClasse() === "Vecteur" ||  e.couche.obtenirTypeClasse() === "VecteurCluster" ||  e.couche.obtenirTypeClasse() === "WFS") {
                if (e.couche.estActive()) {
                    this.controleSnap.addTargetLayer(e.couche._layer);
                } else {
                    this.controleSnap.removeTargetLayer(e.couche._layer);
                }
            }
        }, {
            scope: this,
            id: 'carteActiverSnap'
        });

    };

    Carte.Controles.prototype.desactiverSnap = function() {
        if (this.controleSnap) {
            this.snap = false;
            this._.gestionCouches.enleverDeclencheur('coucheVisibilitéChangée', 'carteActiverSnap');
            this.controleSnap.deactivate();
        }
    };

    return Carte;
});
