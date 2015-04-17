//require: extjs, carte.js, message.js, point.js, limite.js

define(['outil', 'point', 'aide'], function(Outil, Point, Aide) {
    function OutilDeplacerCentre(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            id:'moveTo',
            icone: 'moveto',
            infobulle: 'Position du centre de la carte'
        });
    };

    OutilDeplacerCentre.prototype = new Outil();
    OutilDeplacerCentre.prototype.constructor = OutilDeplacerCentre;

    
    OutilDeplacerCentre.prototype.getControlX = function(){
        return Ext.ComponentMgr.get('xcoord');
    };

    OutilDeplacerCentre.prototype.getControlY = function(){
        return Ext.ComponentMgr.get('ycoord');
    };

    OutilDeplacerCentre.prototype.getControlProj = function(){
        return Ext.ComponentMgr.get('outputProjList');
    };

    OutilDeplacerCentre.prototype.getProj = function(){
        return this.getControlProj().getValue();
    };

    OutilDeplacerCentre.prototype.setX = function(x){
        this.getControlX().setValue(x.toFixed(6));
    };

    OutilDeplacerCentre.prototype.setY = function(y){
        this.getControlY().setValue(y.toFixed(6));
    };

    OutilDeplacerCentre.prototype.displayCoord = function(point){
        this.setX(point.x);
        this.setY(point.y);
    };

    OutilDeplacerCentre.prototype.updtWindowMoveTo = function(){
          var point = this.carte.obtenirCentre();
          var pointProj = point.projeter(this.getProj());
          this.displayCoord(pointProj);
    };

    OutilDeplacerCentre.prototype.moveMapTo = function(){  
        var fieldX = this.getControlX();
        fieldX = fieldX.setValue(fieldX.getValue().replace(",", "."));
        if (isNaN(fieldX.getValue())){
            Aide.afficherMessage('Erreur', 'La coordonnée [' + fieldX.fieldLabel + '] est invalide.', 'OK','ERROR' );
            return;
        }

        var fieldY = this.getControlY();
        fieldY = fieldY.setValue(fieldY.getValue().replace(",", "."));
        if (isNaN(fieldY.getValue())){
            Aide.afficherMessage('Erreur', 'La coordonnée [' + fieldY.fieldLabel + '] est invalide.', 'OK', 'ERROR' );
            return;
        }

        var xf = parseFloat(fieldX.getValue());
        var yf = parseFloat(fieldY.getValue());

        var point = new Point(xf, yf, this.getProj());
        var pointProj = point.projeter(this.carte.obtenirProjection());
        
        if (this.carte.obtenirLimitesMax().contientPoint(pointProj)){
            this.carte.definirCentre(pointProj);
        } else {
            Aide.afficherMessage('Erreur', "Les coordonnées saisies sont à l'extérieur des limites permises.", 'OK', 'ERROR' );
        }
    };
    
    OutilDeplacerCentre.prototype.creeWindow = function(){
        var thisOutil=this;
        if (!this.windowMoveTo) {
                // outputformat
                var oOutputProjStore = new Ext.data.SimpleStore({
                  fields: ['value', 'text'],
                  data : [['EPSG:32198', 'Lambert-LCC-QC'],
                          ['EPSG:4326', 'Géographique - WGS84'],
                          ['EPSG:900913', 'Google']]
                  });
                  
                var szDefaultProj = oOutputProjStore.data.items[1].data.value;

                var oOutputProjComboBox = new Ext.form.ComboBox({
                    id : 'outputProjList',
                    fieldLabel: 'Proj',
                    anchor: '100%',
                    store: oOutputProjStore,
                    valueField: 'value',
                    value: szDefaultProj,
                    displayField:'text',
                    editable: false,
                    mode: 'local',
                    triggerAction: 'all',
                    lazyRender: true,
                    lazyInit: false//,
                    //listWidth: 100
                });

                oOutputProjComboBox.on('select', function(){
                    var point = new Point(thisOutil.carte.obtenirCentre().x.toFixed(6), thisOutil.carte.obtenirCentre().y.toFixed(6));
                    var pointProj = point.projeter(this.value);
                    thisOutil.displayCoord(pointProj);

                });

                var oFormMoveTo = new Ext.form.FormPanel
                ({
                    baseCls: 'x-plain',
                    labelWidth: 25,
                    defaultType: 'textfield',
                    items:
                    [
                    {
                        id: 'xcoord',
                        fieldLabel: 'X',
                        anchor: '100%',
                        allowBlank: false,
                        setSelectOnFocus: true,
                        maskRe: /^[-0-9.,]$/
                    },
                    {
                        id: 'ycoord',
                        fieldLabel: 'Y',
                        anchor: '100%',
                        allowBlank: false,
                        maskRe: /^[-0-9.,]$/
                    },
                    oOutputProjComboBox
                    ],
                    buttons:
                    [{
                        text: 'Ok',
                        handler: function(){
                            thisOutil.moveMapTo();
                        }
                    }]
                });

                this.windowMoveTo = new Ext.Window
                ({
                    title: 'Centre de la carte',
                    width: 220, 
                    height: 165,
                    closeAction: 'hide',
                    minimizable: true,
                    resizable: false,
                    layout: 'fit',
                    plain:true,
                    bodyStyle:'padding:5px;',
                    items: oFormMoveTo,
                    listeners:{
                        hide: function(){thisOutil.carte._carteOL.events.unregister('moveend', thisOutil, thisOutil._moveMapEvent)},
                        scope:this
                    }
                });

                this.windowMoveTo.on('minimize', function(){
                    this.toggleCollapse();
                });

                this.windowMoveTo.on('activate', function(){
                    thisOutil.updtWindowMoveTo();
                    thisOutil.carte._carteOL.events.register("moveend", thisOutil, thisOutil._moveMapEvent);
                });
   
                
        };
    };
    
    OutilDeplacerCentre.prototype._moveMapEvent =  function () {
        this.updtWindowMoveTo();
    };
    
    OutilDeplacerCentre.prototype.executer =  function () {
        this.creeWindow(); 
        this.windowMoveTo.show();
    };


    return OutilDeplacerCentre;
    
});

