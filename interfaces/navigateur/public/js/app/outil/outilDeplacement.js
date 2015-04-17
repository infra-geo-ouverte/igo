define(['outil'], function(Outil) {
    function OutilDeplacement(options){
        this.options = options || {};
    };
    
    OutilDeplacement.prototype = new Outil();
    OutilDeplacement.prototype.constructor = OutilDeplacement;
    
    OutilDeplacement.prototype._init = function() {
        this.carte.controles.initDeplacement();
        this.defautOptions = $.extend({}, this.defautOptions, {
            controle: this.carte.controles._deplacementControle,
            icone: 'pan',
            id: 'idDragPan',
            groupe: 'carte',
            _allowDepress: true,
            infobulle: 'Déplacement : garder le bouton de gauche de la souris enfoncé et déplacer la carte'
        });
        
        Outil.prototype._init.call(this);
    };
 

    return OutilDeplacement;
    
});

