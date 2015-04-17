
define(['outil'], function(Outil) {
    var oNavigationCtrl;
    
    function OutilHistoriqueNavigation(options){
        this.options = options || {};
    };

    OutilHistoriqueNavigation.prototype = new Outil();
    OutilHistoriqueNavigation.prototype.constructor = OutilHistoriqueNavigation;
    
    OutilHistoriqueNavigation.prototype._init = function() {
        var opt = this.options;
        if(!oNavigationCtrl){
            oNavigationCtrl = new OpenLayers.Control.NavigationHistory();
            this.carte._getCarte().addControl(oNavigationCtrl);
            oNavigationCtrl.activate();
        };
        if (opt.type == 'precedent') {
            this.defautOptions = $.extend({}, this.defautOptions, {
                icone: 'back',
                id: 'idBackHistory',
                infobulle: 'Navigation rapide : reculer',
                executer: oNavigationCtrl.previous.trigger
            });
        } else {
            this.defautOptions = $.extend({}, this.defautOptions, {
                icone: 'next',
                id: 'idNextHistory',
                infobulle: 'Navigation rapide : avancer',
                executer: oNavigationCtrl.next.trigger
            });
        }
        Outil.prototype._init.call(this);
    };
 
    return OutilHistoriqueNavigation;
    
});

