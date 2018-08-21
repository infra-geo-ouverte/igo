define(['outil', 'aide', 'fonctions'], function(Outil, Aide, Fonctions) {
    var oWindowMeasr;
    function OutilMesure(options){
        this.options = options || {};
        if (this.options.type === 'lineaire') {
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
                    
                    if(that.$mesureComboDistancePointUnite) {
                        that.$mesureComboDistancePointUnite.off('change');
                        that.$mesureComboDistancePointUnite = undefined;
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
                    that.displayMeasr('', '', '');
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
                    if(that.$mesureComboDistancePointUnite){
                        that.$mesureComboDistancePointUnite.off('change');
                        that.mesureComboDistancePointUnite = undefined;
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
        
        if(!this.$mesureComboDistancePointUnite){
            this.$mesureComboDistancePointUnite = $("#mesureComboDistancePointUnite");
            this.$mesureComboDistancePointUnite.on('focus', function () {
                //previous = this.value;
            }).change(function(e) {
                that.changeUniteEvent("distance");
                //previous = this.value;
            });
        }        
        
        var $mesureComboUnite;
        if(type === "lineaire"){
            $mesureComboUnite = this.$mesureComboPeriUnite;
        } else if(type === "surface"){
            $mesureComboUnite = this.$mesureComboAireUnite;
        }
        else if(type === "distance") {
            $mesureComboUnite = this.$mesureComboDistancePointUnite;
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
        var distance = oFormMeasr.get('distance').value;

        if(type === "lineaire"){
            $mesureComboUnite = this.$mesureComboPeriUnite;
            oldUnite = this.lengthUnitOL;
            mesure = this.lengthOL;
        } else if(type === "surface") {
            $mesureComboUnite = this.$mesureComboAireUnite;
            oldUnite = this.areaUnitOL;
            mesure = this.areaOL;
        }
        else if(type === "distance") {
            $mesureComboUnite = this.$mesureComboDistancePointUnite;
            oldUnite = 'm';
            mesure = this.distanceDerniersPoints;
        }

        if(mesure){
            mesure = this.traiterMeasr(mesure, oldUnite, type, false);
        }

        if(type === "lineaire"){
            length = mesure;
        } else if(type === "surface" && area !== undefined){
            area = mesure;
        } else if(type === "distance") {
            distance = mesure;
        }
        else {
            return false;
        }
        this.displayMeasr(length, area,distance);
    };
    
    OutilMesure.prototype.executerMeasr = function(event) {
        if(event.order===1){ // LINEAR
            this.lengthOL = event.measure;
            this.lengthUnitOL = event.units;
            this.areaOL = undefined;
            var length = this.traiterMeasr(event.measure, event.units, "lineaire");
            var resultDistance = 0;
            if(event.geometry.components.length>2) {
                resultDistance = event.geometry.components[event.geometry.components.length-2].distanceTo(event.geometry.components[event.geometry.components.length-1]);
            }
            else if(event.geometry.components.length === 2) { //Contrer le bug des valeur différentes lorsque 2 points seulement
                resultDistance = event.measure; //Utiliser périmètre
            }
            
            var distance = this.traiterMeasr(resultDistance, 'm', "distance");
            this.distanceDerniersPoints = distance;
            
            this.displayMeasr(length, undefined, distance);
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
            
            var nbPoints = event.geometry.components[0].components.length;
            var resultDistance = 0;
            if(nbPoints>2) {
                resultDistance = event.geometry.components[0].components[nbPoints-2].distanceTo(event.geometry.components[0].components[nbPoints-3]);
            }
           
            var distance = this.traiterMeasr(resultDistance, 'm', "distance");
            this.distanceDerniersPoints = distance;
            
            this.displayMeasr(length, area, distance);
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
            var distance = '';
            if(type === 'Polygone'){
                area = "";
            }
            this.displayMeasr(length, area, distance);
            return false;
        };
        
        //Définir la distance entre les 2 derniers points
        if(typeof occurence.lignes !== "undefined" && occurence.lignes.points !== "undefined") {
            var nbPoints = occurence.lignes[0].points.length;
        }
        else {
            var nbPoints = 0;
        }
        if(nbPoints > 2 ) {
            var geometry = occurence._obtenirGeomOL();            
            var lengthObj = this.controle.getBestLength(geometry);
            var resultDistance = occurence.lignes[0].points[nbPoints-2].distanceDe(occurence.lignes[0].points[nbPoints-3]);  //Dernier point est le même que le premier
            this.distanceDerniersPoints = this.traiterMeasr(resultDistance, 'm', "lineaire");
        }
        else {
            this.distanceDerniersPoints = 0;
        }
        distance = this.distanceDerniersPoints;
        
        if(occurence.type === 'Ligne' || occurence.type === 'MultiLigne'){
            var geometry = occurence._obtenirGeomOL();
            var lengthObj = this.controle.getBestLength(geometry);
            var length = this.traiterMeasr(lengthObj[0], lengthObj[1], "lineaire");
            this.lengthOL = lengthObj[0];
            this.lengthUnitOL = lengthObj[1];
            this.areaOL = undefined;
            
            //Définir la distance entre les 2 derniers points
            if(typeof occurence.points !== "undefined") {
                var nbPoints = occurence.points.length;
            }
            else {
                var nbPoints = 0;
            }
            if(nbPoints > 1 ) {
                var resultDistance = occurence.points[nbPoints-1].distanceDe(occurence.points[nbPoints-2]); 
                this.distanceDerniersPoints = this.traiterMeasr(resultDistance, 'm', "distance");
            }
            else {
                this.distanceDerniersPoints = 0;
            }
            distance = this.distanceDerniersPoints;   
            
            this.displayMeasr(length, undefined, distance);            
            
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
            
            //Définir la distance entre les 2 derniers points
            if(typeof occurence.lignes !== "undefined" && occurence.lignes.points !== "undefined") {
                var nbPoints = occurence.lignes[0].points.length;
            }
            else {
                var nbPoints = 0;
            }
            if(nbPoints > 2 ) {
                var resultDistance = occurence.lignes[0].points[nbPoints-2].distanceDe(occurence.lignes[0].points[nbPoints-3]);  //Dernier point est le même que le premier pour fermer le polygone
                this.distanceDerniersPoints = this.traiterMeasr(resultDistance, 'm', "distance"); 
            }
            else {
                this.distanceDerniersPoints = 0;
            }
            distance = this.distanceDerniersPoints;                  
            
            this.displayMeasr(length, area, distance);
        };
    };
    
    OutilMesure.prototype.displayMeasr = function(length, area, distance) {
        // CREATE THE WINDOW ON THE FIRST CLICK AND REUSE ON SUBSEQUENT CLICKS
        if(!oWindowMeasr){
                

            this.oFormMeasr = new Ext.form.FormPanel({
                columnWidth: 1,
                baseCls: 'x-plain',
                labelWidth: 100,
                defaultType: 'textfield',
                items: [
                {
                    id: 'distance',
                    fieldLabel: 'Distance entre les 2 derniers points',
                    anchor: '100%',
                    readOnly: 'readonly',
                    xtype: 'htmleditor',
                    enableFont : false,
                    enableAlignments : false,
                    enableColors : false,
                    enableFontSize : false,
                    enableFormat : false,
                    enableLinks : false,
                    enableLists : false,
                    enableSourceEdit : false,
                    height:32
                },
                {
                    id: 'length',
                    fieldLabel: 'Longueur',
                    anchor: '100%',
                    readOnly: 'readonly',
                    xtype: 'htmleditor',
                    enableFont : false,
                    enableAlignments : false,
                    enableColors : false,
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
                            html:  "<select id='mesureComboDistancePointUnite' class='mesureComboUnite'>\n\ <option value='auto'>auto (m)</option> \n\                                        <option value='m'>m</option> \n\                                        <option value='km'>km</option>  \n\                                        <option value='mile'>miles</option>\n\                                    <option value='pied'>pied</option>\n\ </select>"
                        },
                        {
                            baseCls: '',
                            html:  "<select id='mesureComboPeriUnite' class='mesureComboUnite'>\n\ <option value='auto'>auto (km)</option> \n\                                        <option value='m'>m</option> \n\                                        <option value='km'>km</option>  \n\                                        <option value='mile'>miles</option>\n\                                    <option value='pied'>pied</option>\n\ </select>"
                        },
                        {
                            baseCls: '',
                            html:  "<select id='mesureComboAireUnite' class='mesureComboUnite'>\n\                                        <option value='auto'>auto (km²)</option> \n\                                        <option value='m'>m²</option> \n\                                        <option value='km²'>km²</option>  \n\                                        <option value='mile²'>mile²</option> \n\                                        <option value='acre'>acre</option> \n\                                        <option value='hectare'>hectare</option>\n\                                    <option value='pied²'>pied²</option>\n\ </select>"
                        }
                       ]
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
                width: 360,
                height: 160,
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
                Aide.obtenirNavigateur().carte.MAJTexteCurseur("");
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
        
        var a=oFormMeasr.get('distance');
        a.setValue(distance);
        Aide.obtenirNavigateur().carte.MAJTexteCurseur(distance);
        
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
    };


    return OutilMesure;
    
});