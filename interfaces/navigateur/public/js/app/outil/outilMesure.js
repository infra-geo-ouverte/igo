define(['outil', 'aide', 'fonctions'], function(Outil, Aide, Fonctions) {
    var oWindowMeasr;
    function OutilMesure(options){
        this.options = options || {};
        if (this.options.type == 'lineaire') {
            this.defautOptions = $.extend({},this.defautOptions, {
                    controle: this.outilMesureLineaire(),
                    id:'mesure_lineraire',
                    infobulle: 'Outil de mesure linéaire',
                    groupe: 'carte',
                    _allowDepress: true,
                    icone: 'measrlinear'
            });
        } else {
            this.defautOptions = $.extend({},this.defautOptions, {
                    controle: this.outilMesureSurfacique(),
                    id: 'mesure_surface',
                    infobulle: 'Outil de mesure de surface',
                    groupe: 'carte',
                    _allowDepress: true,
                    icone:'measrpolgn'
            });
        }
    };

    OutilMesure.prototype = new Outil();
    OutilMesure.prototype.constructor = OutilMesure;
 
    OutilMesure.prototype.outilMesureLineaire =  function () {
        var that = this;
        var oMeasrLinearCtrlOptions = {
            title: "Effectuer une mesure linéaire.",
            geodesic: true,
            immediate: true,
            eventListeners: {
                activate: function(e){
                    that.displayMeasr('');
                    that.mesureSelection(undefined, 'Ligne');
                },
                deactivate: function(e){
                    if(that.$mesureComboPeriUnite){
                        that.$mesureComboPeriUnite.off('change');
                        that.$mesureComboPeriUnite = undefined;
                    }
                    if(that.$mesureComboAireUnite){
                        that.$mesureComboAireUnite.off('change');
                        that.$mesureComboAireUnite = undefined;
                    }
                },
                measure: function(e){that.executerMeasr(e);},
                measurepartial: function(e){that.executerMeasr(e);}
            },
            handlerOptions: {
                persist: true
            }
        };

        this.controle = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, oMeasrLinearCtrlOptions);
        return this.controle;
    };
    
    OutilMesure.prototype.outilMesureSurfacique =  function () {
        var that = this;
        var oMeasrPolgnCtrlOptions = {
            title: "Effectuer une mesure surfacique.",
            geodesic: true,
            immediate: true,
            eventListeners: {
                activate: function(e){
                    that.displayMeasr('', '');
                    that.mesureSelection(undefined, 'Polygone');        
                },
                deactivate: function(e){
                    if(that.$mesureComboPeriUnite){
                        that.$mesureComboPeriUnite.off('change');
                        that.$mesureComboPeriUnite = undefined;
                    }
                    if(that.$mesureComboAireUnite){
                        that.$mesureComboAireUnite.off('change');
                        that.$mesureComboAireUnite = undefined;
                    }
                },
                measure: function(e){that.executerMeasr(e);},
                measurepartial: function(e){that.executerMeasr(e);} 
            },
            handlerOptions: {
                persist: true
            }
        };

        this.controle = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, oMeasrPolgnCtrlOptions);
        return this.controle;
    };
    
    OutilMesure.prototype.traiterMeasr = function(mesure, unite, type, changeAuto) {
        var that=this;
        if(!this.$mesureComboPeriUnite){
            this.$mesureComboPeriUnite = $("#mesureComboPeriUnite");
            var previous;
            this.$mesureComboPeriUnite.on('focus', function () {
                //previous = this.value;
            }).change(function(e) {
                that.changeUniteEvent("lineaire");
                //previous = this.value;
            });
        }

        if(!this.$mesureComboAireUnite){
            this.$mesureComboAireUnite = $("#mesureComboAireUnite");
            this.$mesureComboAireUnite.on('focus', function () {
                //previous = this.value;
            }).change(function(e) {
                that.changeUniteEvent("surface");
                //previous = this.value;
            });
        }
        var $mesureComboUnite;
        if(type === "lineaire"){
            $mesureComboUnite = this.$mesureComboPeriUnite;
        } else {
            $mesureComboUnite = this.$mesureComboAireUnite;
        }
        if(changeAuto !== false){
            if(!$mesureComboUnite.children()[0]){
                return 0;
            }
            $mesureComboUnite.children()[0].text= "auto ("+unite+")";
        }
        var typeChoisi = $mesureComboUnite.val();
        if(typeChoisi === "auto"){
            var text = $mesureComboUnite.children()[0].text;
            typeChoisi = text.substring(6, text.length-1);
        }
        mesure = Fonctions.convertirMesure(mesure, unite, typeChoisi);
        return Math.round(mesure * 1000) / 1000;
    };
    
    
    OutilMesure.prototype.changeUniteEvent = function(type) {
        var $mesureComboUnite;
        var oldUnite;
        var mesure = 0;
        var oFormMeasr = oWindowMeasr.items.items[0].items.items[0];
        var length = oFormMeasr.get('length').getValue();
        var area = oFormMeasr.get('area').value;

        if(type === "lineaire"){
            $mesureComboUnite = this.$mesureComboPeriUnite;
            oldUnite = this.lengthUnitOL;
            mesure = this.lengthOL;
        } else {
            $mesureComboUnite = this.$mesureComboAireUnite;
            oldUnite = this.areaUnitOL;
            mesure = this.areaOL;
        }

        if(mesure){
            mesure = this.traiterMeasr(mesure, oldUnite, type, false);
        }

        if(type === "lineaire"){
            length = mesure;
        } else if(area !== undefined){
            area = mesure;
        } else {
            return false;
        }
        this.displayMeasr(length, area);
    };
    
    OutilMesure.prototype.executerMeasr = function(event) {
        if(event.order===1){ // LINEAR
            this.lengthOL = event.measure;
            this.lengthUnitOL = event.units;
            this.areaOL = undefined;
            var length = this.traiterMeasr(event.measure, event.units, "lineaire");
            this.displayMeasr(length);
        }
        else // POLYGON
        {        
            var area = this.traiterMeasr(event.measure, event.units + "²", "surface");
            var lengthObj = this.controle.getBestLength(event.geometry);
            var length = this.traiterMeasr(lengthObj[0], lengthObj[1], "lineaire");
            this.lengthOL = lengthObj[0];
            this.lengthUnitOL = lengthObj[1];
            this.areaOL = event.measure;
            this.areaUnitOL = event.units + "²";
            this.displayMeasr(length, area);
        }
    };
    
    OutilMesure.prototype.mesureSelection = function(event, type) {
        var occurence;
        if(event){
            occurence = event.target;
        } else {
            this.controle.handler.layer.setZIndex(this.carte._carteOL.Z_INDEX_BASE.Feature);
            occurence = this.carte.gestionCouches.obtenirOccurencesSelectionnees(false)[0];
        }

        if (!occurence || (type && occurence.type !== type && occurence.type !== 'Multi'+type)){
            var area;
            var length = '';
            if(type === 'Polygone'){
                area = "";
            }
            this.displayMeasr(length, area);
            return false;
        };
        if(occurence.type === 'Ligne' || occurence.type === 'MultiLigne'){
            var geometry = occurence._obtenirGeomOL();
            var lengthObj = this.controle.getBestLength(geometry);
            var length = this.traiterMeasr(lengthObj[0], lengthObj[1], "lineaire");
            this.lengthOL = lengthObj[0];
            this.lengthUnitOL = lengthObj[1];
            this.areaOL = undefined;
            this.displayMeasr(length);
        } else if(occurence.type === 'Polygone' || occurence.type === 'MultiPolygone'){
            var geometry = occurence._obtenirGeomOL();
            var lengthObj = this.controle.getBestLength(geometry);
            var length = this.traiterMeasr(lengthObj[0], lengthObj[1], "lineaire");

            var areaObj = this.controle.getBestArea(geometry);
            var area = this.traiterMeasr(areaObj[0], areaObj[1] + "²", "surface");
            
            this.lengthOL = lengthObj[0];
            this.lengthUnitOL = lengthObj[1];
            this.areaOL = areaObj[0];
            this.areaUnitOL = areaObj[1] + "²";
            this.displayMeasr(length, area);
        };
    };
    
    OutilMesure.prototype.displayMeasr = function(length, area) {
        // CREATE THE WINDOW ON THE FIRST CLICK AND REUSE ON SUBSEQUENT CLICKS
        if(!oWindowMeasr){
                

            this.oFormMeasr = new Ext.form.FormPanel({
                columnWidth: 1,
                baseCls: 'x-plain',
                labelWidth: 75,
                defaultType: 'textfield',
                items: [{
                    id: 'length',
                    fieldLabel: 'Longueur',
                    anchor: '100%',
                    readOnly: 'readonly',
                    xtype: 'htmleditor',
                    enableFont : false,
                    enableAlignments : false,
                    enableColors : false,
                    enableFont : false,
                    enableFontSize : false,
                    enableFormat : false,
                    enableLinks : false,
                    enableLists : false,
                    enableSourceEdit : false,
                    height:32
                },
                {
                    id: 'area',
                    fieldLabel: 'Superficie',
                    anchor: '100%',
                    readOnly: 'readonly',
                    xtype: 'htmleditor',
                    enableFont : false,
                    enableAlignments : false,
                    enableColors : false,
                    enableFont : false,
                    enableFontSize : false,
                    enableFormat : false,
                    enableLinks : false,
                    enableLists : false,
                    enableSourceEdit : false,
                    height:32
                }]
            });


            var oFormMeasrPanel = new Ext.Panel({
                baseCls: 'x-plain',
                layout:'column',
                items: [
                    this.oFormMeasr,
                    {
                        width: 83,
                        baseCls: '',
                        items: [{
                            baseCls: '',
                            html:  "<select id='mesureComboPeriUnite' class='mesureComboUnite'>\n\
                                        <option value='auto'>auto (km)</option> \n\
                                        <option value='m'>m</option> \n\
                                        <option value='km'>km</option>  \n\
                                        <option value='mile'>miles</option>\n\
                                    </select>"
                        },
                        {
                            baseCls: '',
                            html:  "<select id='mesureComboAireUnite' class='mesureComboUnite'>\n\
                                        <option value='auto'>auto (km²)</option> \n\
                                        <option value='m'>m²</option> \n\
                                        <option value='km²'>km²</option>  \n\
                                        <option value='mile²'>mile²</option> \n\
                                        <option value='acre'>acre</option> \n\
                                        <option value='hectare'>hectare</option>\n\
                                    </select>"
                        }]
                    }                      
                ]
            });


            Ext.override(Ext.form.Field, {
                setLabel: function(text){
                    if(this.label){
                        this.label.update(text+':');
                    }
                    this.fieldLabel=text;
            }});

            oWindowMeasr = new Ext.Window({
                title: 'Mesure',
                width: 280,
                height: 120,
                closeAction: 'hide',
                minimizable: true,
                resizable: true,
                layout: 'fit',
                plain:true,
                bodyStyle:'padding:5px;',
                items: oFormMeasrPanel
            });
            
            var that=this;
            oWindowMeasr.on('show', function(win) {
                Aide.obtenirNavigateur().evenements.ajouterDeclencheur("occurenceSelectionnee", function(evt){
                    that.mesureSelection(evt, undefined);
                }, {scope: this, id: "outilMesureOccurenceSelectionnee"});   

                Aide.obtenirNavigateur().evenements.ajouterDeclencheur("occurenceModifiee", function(evt){
                    that.mesureSelection(evt, undefined);
                }, {scope: this, id: "outilMesureOccurenceModifiee"});   

              /*  Aide.obtenirNavigateur().evenements.ajouterDeclencheur("mesure", function(evt){
                    that.mesureSelection(evt, undefined);
                }, {scope: this, id: "outilMesureOccurenceCreation"});  

                Aide.obtenirNavigateur().evenements.ajouterDeclencheur("mesurePartielle", function(evt){
                    that.mesureSelection(evt, undefined);
                }, {scope: this, id: "outilMesureOccurenceCreationPartielle"});  */
            });
            oWindowMeasr.on('hide', function(win) {
                Aide.obtenirNavigateur().evenements.enleverDeclencheur("occurenceSelectionnee", "outilMesureOccurenceSelectionnee");
                Aide.obtenirNavigateur().evenements.enleverDeclencheur("occurenceModifiee", "outilMesureOccurenceModifiee");
            });

            oWindowMeasr.on('minimize', function(){
                oWindowMeasr.toggleCollapse();
            });
        }
        // UPDATE MEASURES
        var oFormMeasr = oWindowMeasr.items.items[0].items.items[0];
        var l=oFormMeasr.get('length');
        l.setValue(length);

        var a=oFormMeasr.get('area');

        if(area === undefined) {
            l.setLabel('Longueur');
            a.setValue(area);
            a.disable();
        } else {
            l.setLabel('Périmètre');
            a.setValue(area);
            a.enable();
            if(a.iframe){
                a.getEditorBody().style.color="rgb(33,33,33)";
            }
            
        }
        this.oWindowMeasr = oWindowMeasr;
        this.afficherFenetre();
    };
    
    /**
     * Afficher la fenêtre de l'outil
     * @method
     * @returns {bool} true/false si la fenêtre a été affiché ou non
     */
    OutilMesure.prototype.afficherFenetre = function() {
        
        if(this.oWindowMeasr)
        {
            this.oWindowMeasr.show();
            return true;
        }
        else
            return false;
    };
    
    /**
     * Masquer la fenêtre de l'outil
     * @method
     * @returns {bool} true/false si la fenêtre a été masqué ou non
     */
    OutilMesure.prototype.cacherFenetre = function() {
        if(this.oWindowMeasr)
        {
            this.oWindowMeasr.hide();
            return true;
        }
        else 
            return false;
    };
    
    /**
     * Positionner la fenêtre selon les coordonnées gauche, haut
     * @method
     * @param {integer} gauche Coordonnée de position gauche de la fenêtre
     * @param {integer} haut Coordonnée de la position droite de la fenêtre
     */
    OutilMesure.prototype.positionnerFenetre = function(gauche,haut) {
        this.oWindowMeasr.setPosition(gauche, haut);
    };
    
    /**
     * Obtenir l'objet de la fenêtre
     * @method
     * @returns {object} Objet Ext de la fenêtre
     */
    OutilMesure.prototype.obtenirFenetre = function() {
        return this.oWindowMeasr;
    }


    return OutilMesure;
    
});