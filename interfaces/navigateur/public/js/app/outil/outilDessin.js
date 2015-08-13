define(['outil', 'aide'], function(Outil, Aide) {
    function OutilDessin(options){
        this.options = options || {};

        this._type;
        if (this.options.type === 'ligne'){
            this.defautOptions = $.extend({}, this.defautOptions, {
                icone: Aide.obtenirCheminRacine()+'images/toolbar/dessiner_ligne_20.png',
                id: 'idDessinLigne',
                infobulle: "Outil de dessin - Ligne"
            });
        } else if (this.options.type === 'polygone'){
            this.defautOptions = $.extend({}, this.defautOptions, {
                icone: Aide.obtenirCheminRacine()+'images/toolbar/dessiner_polygone_20.png',
                id: 'idDessinPolygone',
                infobulle: "Outil de dessin - Polygone"
            });
        } else if (this.options.type === 'regulier') {
            this.defautOptions = $.extend({}, this.defautOptions, {
                icone: Aide.obtenirCheminRacine()+'images/toolbar/dessiner_polygone_20.png',
                id: 'idDessinRegulier',
                infobulle: "Outil de dessin - Polygone réguilier"
            });
        } else {
            this.defautOptions = $.extend({}, this.defautOptions, {
                icone: Aide.obtenirCheminRacine()+'images/toolbar/dessiner_point_20.png',
                id: 'idDessinPoint',
                infobulle: "Outil de dessin - Point"
            });
        }
        this.defautOptions.groupe = 'carte';
    };
    
    OutilDessin.prototype = new Outil();
    OutilDessin.prototype.constructor = OutilDessin;
    
    OutilDessin.prototype._init = function() {
        Outil.prototype._init.call(this);
        if(this.options.couche){
            if(typeof this.options.couche === "string"){
                this.options.couche = this.carte.gestionCouches.obtenirCoucheParId(this.options.couche);
            }
            if(this.options.couche.obtenirTypeClasse && (this.options.couche.obtenirTypeClasse() === "Vecteur" || this.options.couche.obtenirTypeClasse() === "VecteurCluster" || this.options.couche.obtenirTypeClasse() === "WFS")){
                this.couche = this.options.couche;
            } else {
                this.options.couche = undefined;
            }
        }
        
        this.initEvent();
    };
 
    
    OutilDessin.prototype.initEvent =  function () {
        var that=this;
        if(this.options.couche){return true};
        
        if(this.parent){
            this.parent.desactiver();
        } else {
            this.desactiver();
        }
                
        that.carte.ajouterDeclencheur('changerCoucheEdition', function(e){
            that.changerCoucheDessin(e.couche);
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
    
    OutilDessin.prototype._ajouterContexteSubmenu =  function (contexteMenu) {
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
                return (args.couche.obtenirTypeClasse()==='Vecteur' || args.couche.obtenirTypeClasse()==='VecteurCluster') && that.carte.gestionCouches.coucheVecteurActive !== args.couche && Aide.toBoolean(args.couche.options.editable) !== false;
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
                return (args.couche.obtenirTypeClasse()==='Vecteur' || args.couche.obtenirTypeClasse()==='VecteurCluster') && that.carte.gestionCouches.coucheVecteurActive === args.couche;
            }, 
            position: 5
        });
    };
    
    OutilDessin.prototype.executer =  function () {
        this.carte.controles.activerDessin(
            this.couche,
            this.options.type,
            {
                sides: this.options.cote,
                irregular: this.options.irregulier,
                releverBoutonOutil: false
            }
        );
    };
    
    OutilDessin.prototype.eteindre =  function () {
        this.carte.controles.desactiverDessin();
    };
    
    OutilDessin.prototype.changerCoucheDessin =  function (couche) {
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
            this.couche = this.options.couche;
            return true;
        }

        this.couche = couche;
        
        if(this.parent){
            this.parent.activer();
        } else {
            this.activer();
        }

        if(this.estEnfonce() || (this.parent && this.parent.estEnfonce() && this.parent.outilActif === this)){
             this.executer();
        }
        
    };
    
    return OutilDessin;
    
});

