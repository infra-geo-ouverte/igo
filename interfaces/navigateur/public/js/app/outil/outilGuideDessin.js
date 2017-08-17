/** 
 * Module pour l'objet {@link Outil.OutilGuideDessin}.
 * @module OutilGuideDessin
 * @requires outil 
 * @requires aide 
 * @author Michael Lane, FADQ
 * @version 1.0
 */

define(['outil'], function(Outil) {
    function OutilGuideDessin(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: 'guide_dessin',
            id: 'guide_dessin-igo'+options.couche.options.nom,       
            infobulle: "Définir un guide pour aider au traçage" 
        });
        this.nomCouche = options.couche.options.nom;
    };

    OutilGuideDessin.prototype = new Outil();
    OutilGuideDessin.prototype.constructor = OutilGuideDessin;
    
    /** Action de l'outil
     * @method
     * @name OutilGuideDessin#executer
     */           
    OutilGuideDessin.prototype.executer = function()
    {                 
        var that = this;
        
        if(typeof this.myWin !== "undefined") {
            this.myWin.show();
            return true;
        }        
                 
        var frmGuideDessin= new Ext.FormPanel({
                id: "idFormGuideDessin"+this.nomCouche,
                width: 350,
                autoHeight: true,
                frame: true,
                bodyStyle: 'padding: 10px 10px 10px 10px;',
                standardSubmit:false,
                labelWidth: 120,
                defaults: {
                    msgTarget: 'side'               
                },
                items:[
                    {
                        xtype: 'numberfield',
                        id : 'dessinTailleGuide'+this.nomCouche,
                        fieldLabel: 'Taille en mètre',
                        value: 0,
                        allowDecimals: true,
                        allowNegative: true,
                        maxlength:2,
                        autoCreate: {tag: 'input', autocomplete: 'off', maxlength: '2'},
                        allowBlank: false,
                        width:100
                    }     
                ],
                buttons: [
                    {
                        text: 'Définir',
                        handler: function(){
                            that.definirGuide();
                            that.myWin.close();
                            that.myWin = undefined;
                        }
                    },
                    {
                        text:'Fermer',
                        handler: function(){
                            that.myWin.close();
                            that.myWin = undefined;
                        }
                    },
                    {
                        text:'Réinitialiser',
                        handler: function(){
                            that.reinitialiser();
                            that.myWin.close();
                            that.myWin = undefined;
                        }
                    }
                ]
            });

        this.myWin = new Ext.Window({
            id     : 'fenetreOutilGuideDessin'+this.nomCouche,
            title  : 'Définir le guide',
            autoHeight : true,
            width: 355,
            items  : [frmGuideDessin],
            modal  : true
        });

        this.myWin.show();   
    };
    
    /**
     * Définir le guide de dessin selon le paramètre utilisateur
     * @method
     * @name OutilGuideDessin#definirGuide
     */
    OutilGuideDessin.prototype.definirGuide = function() { 
        var that = this;
        var couche = this.options.couche;    
        this.couche = couche;
        this.tailleGuide = Ext.get('dessinTailleGuide'+that.nomCouche).getValue();
        var style = couche.obtenirStyle();
        var proprietes = style.propriete;
        var contexte = proprietes.contexte;
        if(typeof contexte === "undefined") {
            contexte = {};
        }
        
        proprietes.rayon ="${getSize}";
        contexte.getSize = function(occurence) {
            var couche = that.couche || occurence.vecteur;
            var dessinTailleGuide = that.tailleGuide;
            if (!couche || dessinTailleGuide == "") {return 6;} //Valeur par défaut                        
            var rayon = dessinTailleGuide / couche.carte.obtenirResolution();
            var controleEdition = couche.carte.controles.controleEdition;
            if(controleEdition) {
                
                if(typeof that.originalStyle === "undefined") {
                    that.originalStyle = controleEdition.virtualStyle;
                }
                controleEdition.virtualStyle = ({pointRadius: rayon, fillOpacity: 0});
            } 
            return rayon;
        };
        
        //Permettre de reseter les points virtuels lors des changements de zoom
        couche.carte.ajouterDeclencheur("survolerCarte", this._redefinirStylePointsVirtuels);
        
        proprietes.contexte = contexte;
        couche.definirStyle(proprietes);
        var styleCourant = couche.obtenirStyle();

        //Réinitialiser les filtres:
        styleCourant.reinitialiserFiltres();
        styleCourant.ajouterFiltres(style.filtres); 
        couche.rafraichir();    
    };
    
    /**
     * Redéfinir le style des points virtuels
     * @method
     * @private
     * @name OutilGuideDessin#_redefinirStylePointsVirtuels
     */
    OutilGuideDessin.prototype._redefinirStylePointsVirtuels = function() { 
        if(typeof this.controles.controleEdition !== "undefined") {
            this.controles.controleEdition.resetVertices();
        }
    };
    
    /**
     * Réinitialiser les paramètres d'ajustement du guide
     * @method
     * @name OutilGuideDessin#reinitialiser
     */
    OutilGuideDessin.prototype.reinitialiser = function() { 
        Ext.getCmp('dessinTailleGuide'+this.nomCouche).setValue("");
                
        var couche = this.options.couche;    
        this.couche = couche;
        var style = couche.obtenirStyle();
        var proprietes = style.propriete;
        var contexte = proprietes.contexte;
        if(typeof contexte === "undefined") {
            contexte = {};
        }
        
         //Retirer le déclencheur qui permett de reseter les points virtuels lors des changements de zoom
        couche.carte.enleverDeclencheur("survolerCarte", undefined, this._redefinirStylePointsVirtuels);
                       
        //Supprimer les propriétés de l'outil
        delete proprietes.rayon;
        delete contexte.getSize;
        proprietes.contexte = contexte;
        couche.definirStyle(proprietes);
        var styleCourant = couche.obtenirStyle();

        //Réinitialiser les styles des points virtuels
        var controleEdition = couche.carte.controles.controleEdition;
        if(controleEdition) {
            controleEdition.virtualStyle = this.originalStyle;
            this.originalStyle = undefined;
            controleEdition.resetVertices();
            controleEdition.deactivate();
            controleEdition.activate();          
        }  

        //Réinitialiser les filtres:
        styleCourant.reinitialiserFiltres();
        styleCourant.ajouterFiltres(style.filtres); 
        couche.rafraichir();    
    };

    return OutilGuideDessin;
    
});