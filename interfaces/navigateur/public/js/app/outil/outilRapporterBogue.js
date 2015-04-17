define(['outil', 'aide'], function(Outil, Aide) {
    function OutilRapporterBogue(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            infobulle: "Adresse, lieu introuvable ou bogue dans l'application : soumettre une incohérence",
            icone: 'bug',
            id: 'geomantis_msp'
            //lien: "http://geoegl.msp.gouv.qc.ca/mantis/login_page.php"
        });
    };

    OutilRapporterBogue.prototype = new Outil();
    OutilRapporterBogue.prototype.constructor = OutilRapporterBogue;
 
    OutilRapporterBogue.prototype.executer =  function () {
        var link = this.options.lien;
        window.open(link);
    };
    

    return OutilRapporterBogue;
    
});