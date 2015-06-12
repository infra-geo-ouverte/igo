define(['outil', 'aide'], function(Outil, Aide) {
    function OutilItineraire(options){
        this.options = options || {};
    };
    
    OutilItineraire.prototype = new Outil();
    OutilItineraire.prototype.constructor = OutilItineraire;
    
    OutilItineraire.prototype._init = function() {
        this.defautOptions = $.extend({}, this.defautOptions, {
            titre: "Itinéraire",
            //icone: Aide.obtenirCheminRacine()+'images/toolbar/gui-pointer.gif',
            id: 'idItineraire',
            groupe: 'carte',
            _allowDepress: true,
            infobulle: "Contrôles pour l'itinéraire"
        });
        
        Outil.prototype._init.call(this);
    };
 
    OutilItineraire.prototype.executer =  function () {
        this.options.panneauItineraire.activerControles();
    };
    
    OutilItineraire.prototype.eteindre =  function () {
        this.options.panneauItineraire.desactiverControles();
    };

    return OutilItineraire;
    
});

