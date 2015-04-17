define(['outil', 'limites'], function(Outil, Limites) {

    function OutilZoomEtendueMaximale(options){
        this.options = options || {};
        this.gauche = this.options.gauche || -9077974.0862465;
        this.droite = this.options.droite || -5988695.1516261;
        this.bas = this.options.bas || 5451617.843497;
        this.haut = this.options.haut || 7090427.7296376;

        this.defautOptions.infobulle = 'Zoom sur le Québec en entier';
        this.defautOptions.icone = 'zoomfull';
        this.defautOptions.id = 'zoom_qc';
    };

    OutilZoomEtendueMaximale.prototype = new Outil();
    OutilZoomEtendueMaximale.prototype.constructor = OutilZoomEtendueMaximale;
    
    
    OutilZoomEtendueMaximale.prototype.executer =  function () {
        var limites = new Limites(this.gauche, this.bas, this.droite, this.haut)
        this.carte.zoomer(limites);
    };
    

    return OutilZoomEtendueMaximale;
    
});

