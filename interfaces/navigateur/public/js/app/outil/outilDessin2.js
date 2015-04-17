/*require.ajouterConfig({
    paths: {
        featureEditing: 'libs/GeoExt.ux/FeatureEditing/ux/FeatureEditingRequire'
    }
});*/

//define(['outil','featureEditing'], function(Outil,FeatureEditing) {
define(['outil', 'aide'], function(Outil, Aide) {
    function OutilDessin(options){
        this.options = options || {};
        this.defautOptions.id = 'idRedLine';
        this.defautOptions.infobulle = 'Outil de dessin/annotation sur la carte';
        this.defautOptions.icone =  Aide.obtenirCheminRacine()+"libs/GeoExt.ux/FeatureEditing/resources/images/silk/pencil.png";// 'gx-featureediting-editfeature';
    };
    
    OutilDessin.prototype = new Outil();
    OutilDessin.prototype.constructor = OutilDessin;
    
    OutilDessin.prototype._init = function() {
        this._extOptions = {map: this.carte._getCarte()};
        Outil.prototype._init.call(this);
    };
 
    OutilDessin.prototype.executer =  function () {
        var that=this;
        require(['libs/GeoExt.ux/FeatureEditing/ux/FeatureEditingRequire'], function() {
            if(!that.oRedLinePanelWindow){
                that.oRedLinePanelWindow = new Ext.Window({
                    id: "idRedLiningPanel",
                    title: "Outils de dessin",
                    height: 58,
                    width: 192,
                    closeAction: 'hide',
                    resizable: false,
                    minimizable: true,
                    items: [{
                        xtype: "gx_redliningpanel",
                        id: "outil_dessin",
                        toggleGroup: 'map',
                        height: 58,
                        width: 200,
                        resizable: false,
                        map: that.carte._getCarte()
                        }]
                });

                that.oRedLinePanelWindow.on('minimize', function(){
                    that.oRedLinePanelWindow.toggleCollapse();
                });

            }
            that.oRedLinePanelWindow.show();
        });
        
        this.declencher({ type: "executerBoutonDessin", bouton: this });  
    };
    


    return OutilDessin;
    
});

