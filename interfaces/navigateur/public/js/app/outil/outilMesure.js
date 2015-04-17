define(['outil', 'aide'], function(Outil, Aide) {
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
          eventListeners: {
              activate: function(e){
                  that.mesureSelection(undefined, 'Ligne');
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
            eventListeners: {
                activate: function(e){
                    that.mesureSelection(undefined, 'Polygone');        
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
    
    OutilMesure.prototype.executerMeasr = function(event) {
        if(event.order===1){ // LINEAR
            this.displayMeasr(event.measure.toFixed(3) + " " + event.units);
        }
        else // POLYGON
        {
            var area = event.measure.toFixed(3) + " " + event.units;
            var lengthObj = this.controle.getBestLength(event.geometry);
            var length = (lengthObj[0]).toFixed(3) + " " + lengthObj[1];
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
        if (!occurence || (type && occurence.type !== type)){
            var area, length='';
            if(type == 'Polygone'){
                area = ' ';
            }
            this.displayMeasr(length, area);
            return false;
        };
        if(occurence.type == 'Ligne'){
            var geometry = occurence._obtenirGeomOL();
            var lengthObj = this.controle.getBestLength(geometry);
            var length = (lengthObj[0]).toFixed(3) + " " + lengthObj[1];

            this.displayMeasr(length);
        } else if(occurence.type == 'Polygone'){
            var geometry = occurence._obtenirGeomOL();
            var lengthObj = this.controle.getBestLength(geometry);
            var length = (lengthObj[0]).toFixed(3) + " " + lengthObj[1];

            var areaObj = this.controle.getBestArea(geometry);
            var area = (areaObj[0]).toFixed(3) + " " + areaObj[1];
            this.displayMeasr(length, area);
        };
    };
    
    OutilMesure.prototype.displayMeasr = function(length, area) {
        // CREATE THE WINDOW ON THE FIRST CLICK AND REUSE ON SUBSEQUENT CLICKS
        if(!oWindowMeasr){
            this.oFormMeasr = new Ext.form.FormPanel({
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
                }, {
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

            Ext.override(Ext.form.Field, {
                setLabel: function(text){
                    if(this.label){
                        this.label.update(text+':');
                    }
                    this.fieldLabel=text;
            }});

            oWindowMeasr = new Ext.Window({
                title: 'Mesure',
                width: 230,
                height: 114,
                closeAction: 'hide',
                minimizable: true,
                resizable: true,
                layout: 'fit',
                plain:true,
                bodyStyle:'padding:5px;',
                items: this.oFormMeasr
            });
            
            var that=this;
            oWindowMeasr.on('show', function(win) {
                Aide.obtenirNavigateur().evenements.ajouterDeclencheur("occurenceSelectionnee", function(evt){
                    that.mesureSelection(evt, undefined);
                }, {scope: this, id: "outilMesureOccurenceSelectionnee"});   
            });
            oWindowMeasr.on('hide', function(win) {
                Aide.obtenirNavigateur().evenements.enleverDeclencheur("occurenceSelectionnee", "outilMesureOccurenceSelectionnee");
            });

            oWindowMeasr.on('minimize', function(){
                oWindowMeasr.toggleCollapse();
            });
        }
        // UPDATE MEASURES
        var oFormMeasr = oWindowMeasr.items.items[0];
        var l=oFormMeasr.get('length');
        l.setValue(length);

        var a=oFormMeasr.get('area');
        if(!area) {
            l.setLabel('Longueur');
            a.setValue(area);
            a.disable();
        } else {
            l.setLabel('Périmètre');
            var txtDeux = '2';
            if(area !== ' '){
                a.setValue(area + txtDeux.sup());
            }
            a.enable();
            if(a.iframe){
                a.getEditorBody().style.color="rgb(33,33,33)";
            }
            
        }
        oWindowMeasr.show();
    };
    


    return OutilMesure;
    
});

