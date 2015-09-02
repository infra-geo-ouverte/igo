define(['outil', 'aide'], function(Outil, Aide) {
    function OutilTableSelection(options){
        this.options = options || {};       
        
        if (this.options.type === 'efface'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'selection_effacer',
                titre: 'Effacer la sélection',
                infobulle: 'Effacer la sélection',
                icone: Aide.obtenirCheminRacine()+'images/toolbar/gui-pointer.gif'
            });
        } else if (this.options.type === 'inverse'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'selection_inverse',
                allowDepress: false,
                infobulle: 'Inverser la selection',
                titre: 'Inverser la sélection',
                icone: Aide.obtenirCheminRacine()+'images/toolbar/gui-pointer.gif'
            });
        } else if (this.options.type === 'complet'){
            this.defautOptions = $.extend({},this.defautOptions, {
               id:'selection_tout',
               infobulle: 'Tout sélectionner',
               titre: 'Tout sélectionner',
               icone: Aide.obtenirCheminRacine()+'images/toolbar/gui-pointer.gif'
            });
        } else if (this.options.type === 'zoom'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'zoom_selection',
                titre: 'Zoom sur la sélection',
                infobulle: 'Zoom sur la sélection',
                icone: Aide.obtenirCheminRacine()+'images/toolbar/moveto.png'   
            });
         } else if (this.options.type === 'pan'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'pan_selection',
                titre: 'Zoom sur la sélection',
                infobulle: 'Zoom sur la sélection',
                icone: Aide.obtenirCheminRacine()+'images/toolbar/icon_pan.png'     
            });
        } else if (this.options.type === 'auto'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'zoom_auto',
                xtype:'menucheckitem',
                titre: 'Zoom auto sur la sélection',
                infobulle: 'Zoom auto sur la sélection'
                
           });
       // } else {
       //     throw new Error("OutilTableSelection a besoin d'un type");
        }  else if (this.options.type === 'selectionSeulement'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'affiche_selection_seulement',
                xtype:'menucheckitem',
                titre: 'Afficher la sélection seulement',
                infobulle: 'Affiche seulement la sélection'                
           });
        } 
    };
    
    OutilTableSelection.prototype = new Outil();
    OutilTableSelection.prototype.constructor = OutilTableSelection;
   
   
    OutilTableSelection.prototype._init = function() {
        this.initEvent();
        Outil.prototype._init.call(this);
    };
   
    OutilTableSelection.prototype.executer =  function () {
       
        if (this.options.type === 'efface'){
            this.options.couche.deselectionnerTout();
        } else if (this.options.type === 'inverse'){
             this.options.couche.selectionnerInverse();
        } else if (this.options.type === 'complet'){
            this.options.couche.selectionnerTout();
        } else if (this.options.type === 'zoom'){
            this.options.couche.zoomerOccurences(this.options.couche.obtenirOccurencesSelectionnees());
        } else if (this.options.type === 'auto'){
            this.options.couche.zoomAuto = !this._bouton.checked;
        } else if (this.options.type === 'selectionSeulement'){
            this.options.couche.options.selectionSeulement = !this._bouton.checked;
            this.options.couche.declencher({ type: "occurenceClique", occurence:this.options.couche.obtenirOccurencesSelectionnees()});
        }
    };
    
    OutilTableSelection.prototype.initEvent =  function () {
        var that=this;
        if (this.options.type === 'inverse' || this.options.type === 'complet'){
            this.options.couche.ajouterDeclencheur('controleEditionActiver', function(){
                that.desactiver();
            });
            this.options.couche.ajouterDeclencheur('controleEditionDesactiver', function(){
                that.activer();
            });
        }
    }; 

     return OutilTableSelection;

});

