define(['outil', 'aide'], function(Outil, Aide) {
    function OutilEdition(options){
        this.options = options || {};
        this.couche = this.options.couche;
        
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: Aide.obtenirCheminRacine()+'images/toolbar/shape_square_red.png',
            id: 'idEdition',
            infobulle: "Outil d'édition"
        });
        
        this.defautOptions.groupe = 'carte';
    };
    
    OutilEdition.prototype = new Outil();
    OutilEdition.prototype.constructor = OutilEdition;
    
    OutilEdition.prototype._init = function() {
        this.initEvent();
        Outil.prototype._init.call(this);
    };
    
    OutilEdition.prototype.initEvent =  function () {
        var that=this;
        if(this.options.couche){return true};
        
        if(this.parent){
            this.parent.desactiver();
        } else {
            this.desactiver();
        }
        
        that.carte.ajouterDeclencheur('changerCoucheEdition', function(e){
            that.changerCoucheEdition(e.couche);
        });

        var nav = Aide.obtenirNavigateur();
        var arbo = nav.obtenirPanneauxParType('Arborescence',2)[0];
        if(arbo){
            this._ajouterContexteSubmenu(arbo.contexteMenu);
            return true;
        }
        
        if(!nav.evenements.obtenirDeclencheur('initArborescence', 'outilEditionAjouterContexteSubmenu').length){
            nav.evenements.ajouterDeclencheur('initArborescence', function(e){
                that._ajouterContexteSubmenu(e.target.contexteMenu);
                nav.evenements.enleverDeclencheur('initArborescence', 'outilEditionAjouterContexteSubmenu');
            }, {id: 'outilEditionAjouterContexteSubmenu'});
        }
    }; 
    
    OutilEdition.prototype._ajouterContexteSubmenu =  function (contexteMenu) {
        if(contexteMenu._edtionSubmenuBool){return true;}
        contexteMenu._edtionSubmenuBool=true;
        var that=this;
        contexteMenu.ajouter({
            id: 'startEditVecteur',
            titre: 'Éditer', 
            action: function(args){
                if(that.carte.gestionCouches.coucheVecteurActive){
                    that.carte.gestionCouches.coucheVecteurActive.editionActif = false;              
                    that.carte.gestionCouches.coucheVecteurActive._nodeHtml.css('background-color', '');
                }
                args.couche._nodeHtml = args.nodeHtml;
                that.carte.gestionCouches.coucheVecteurActive = args.couche;
                args.nodeHtml.css('background-color', '#c8dadb');
                that.carte.declencher({type: 'changerCoucheEdition', couche: args.couche});
            }, 
            condition: function(args){
                return (args.couche.obtenirTypeClasse()=='Vecteur' || args.couche.obtenirTypeClasse()=='VecteurCluster') && that.carte.gestionCouches.coucheVecteurActive !== args.couche && Aide.toBoolean(args.couche.options.editable) !== false;
            }, 
            position: 4
        });
        contexteMenu.ajouter({
            id: 'stopEditVecteur',
            titre: "Arrêter l'édition", 
            action: function(args){
                args.couche.editionActif = false;
                that.carte.gestionCouches.coucheVecteurActive = undefined;
                args.nodeHtml.css('background-color', '');
                that.carte.declencher({type: 'changerCoucheEdition', couche: undefined});
            }, 
            condition: function(args){
                return(args.couche.obtenirTypeClasse()=='Vecteur' || args.couche.obtenirTypeClasse()=='VecteurCluster') && that.carte.gestionCouches.coucheVecteurActive === args.couche;
            }, 
            position: 5
        });
    };
    
    OutilEdition.prototype.executer =  function () {
        this.couche.editionActif = true;
        this.carte.controles.activerEdition(this.couche);
    };
    
    OutilEdition.prototype.eteindre =  function () {
        if(this.couche){
            this.couche.editionActif = false;
        }
        this.carte.controles.desactiverEdition(this.couche);
    };
 
    OutilEdition.prototype.changerCoucheEdition =  function (couche) {
        if(!couche){
            if(this.parent){
                this.parent.desactiver();
                if(this.parent.estEnfonce()){
                    this.parent.eteindre();
                }
            } else {
                this.desactiver();
                if(this.estEnfonce()){ 
                    this.eteindre();
                }
            }     
            this.couche = undefined;
            return true;
        }
        if(this.parent){
            this.parent.activer();
        } else {
            this.activer();
        }
        this.couche = couche;

        if(this.parent){
            this.parent.activer();
        } else {
            this.activer();
        }

        if(this.estEnfonce() || (this.parent && this.parent.estEnfonce() && this.parent.outilActif === this)){
             //this.eteindre();
             //this.controle.layer = couche._layer;
             this.executer();
         } /*else {
             this.controle.layer = couche._layer;
         }*/
    };
    
    return OutilEdition;
    
});

