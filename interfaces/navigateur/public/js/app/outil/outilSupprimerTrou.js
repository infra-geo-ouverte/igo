/** 
 * Module pour l'objet {@link Outil.OutilSupprimerTrou}.
 * @module OutilSupprimerTrou
 * @requires outil 
 * @requires aide 
 * @author Michael Lane, FADQ
 * @version 1.0
 */

require.ajouterConfig({
    paths: {
            multiSelect: 'libs/Ext.ux/multiSelect/MultiSelect',
            multiSelectCss: 'libs/Ext.ux/multiSelect/css/MultiSelect'
        },
        shim: {
            multiSelect: {
                deps: ['css!multiSelectCss']
            }
        }
});

define(['outil', 'aide', 'vecteur', 'polygone', 'multiSelect'], function(Outil, Aide, Vecteur, Polygone) {
    function OutilSupprimerTrou(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: 'supprimer_trou',
            id: 'supprimer_trou-igo'+options.couche.options.nom,       
            infobulle: "Réinclure une surface exclue" 
        });
        this.nomCouche = options.couche.options.nom;
    };

    OutilSupprimerTrou.prototype = new Outil();
    OutilSupprimerTrou.prototype.constructor = OutilSupprimerTrou;
    
    /** Action de l'outil
     * @method
     * @name OutilSupprimerTrou#executer
     */        
    OutilSupprimerTrou.prototype.executer = function()
    {
        var that = this;
        var occ = this.options.couche.obtenirOccurencesSelectionnees();
        if(occ.length !== 1) {
            Aide.afficherMessage("Message", "Vous devez sélectionner une surface.", "OK", "MESSAGE");
            return false;
        }
        this.occ = occ[0];
        
        if(this.occ.lignes.length < 2) {
            Aide.afficherMessage("Message", "Vous devez sélectionner une surface contenant au moins une exclusion.", "OK", "MESSAGE");
            return false;  
        }               
        
        if(typeof this.myWin !== "undefined") {
            this.myWin.show();
            this.MAJListeTrou();
            return true;
        }           
        
        //Définir la couche de l'outil qui servira à afficher un polygone dans le trou
        if(typeof this.coucheTrou === "undefined")
        {
            var couche = Aide.obtenirNavigateur().carte.gestionCouches.obtenirCoucheParId("coucheOutilSupprimerTrou");
            if(typeof couche !== "undefined") {
                this.coucheTrou = couche;
            }
            else{
                this.coucheTrou = new Vecteur({titre: "Exclusion de surface", 
                                                    id:'coucheOutilSupprimerTrou', 
                                                    active:true, 
                                                    visible:false, 
                                                    suppressionPermise:true,
                                                    editable: true,
                                                    geometrieNullePermise: true,
                                                    nom: "coucheoutilSupprimerTrou"});

                Aide.obtenirNavigateur().carte.gestionCouches.ajouterCouche(this.coucheTrou);   
            }
        }        
                
        var asListeTrou = new Ext.data.ArrayStore({
            data: [],
            fields: ['value','display'],
            sortInfo: {
                field: 'value',
                direction: 'ASC'
            }
        });
        this.asListeTrou = asListeTrou;
        
        this.MAJListeTrou();
        
        var multiSelect = {
            width: 186,
            height: 100,
            xtype: 'multiselect',
            msgTarget: 'side',
            fieldLabel: 'Exclusion(s) à réinclure',
            name: 'multiselect',
            id: 'outilSupprimerTrouMultiSelect'+this.nomCouche,
            store: asListeTrou,
            valueField: 'value',
            displayField: 'display',
            listConfig: {
                itemTpl: '<div class="inner-boundlist-item {color}">{numberName}</div>'
            },
            listeners: {
                //Au changement de sélection, vider la couche de travail et défini le polygone selon la sélection du trou
                change: function(elem,indSelection) {
                    that.coucheTrou.enleverTout();
                    that.coucheTrou.ajouterOccurence(new Polygone(that.occ.lignes[indSelection]));
                }
            }
        };     
                 
        var frmSupprimerTrou= new Ext.FormPanel({
                id: "idFormSupprimerTrou"+this.nomCouche,
                width: 350,
                autoHeight: true,
                frame: true,
                bodyStyle: 'padding: 10px 10px 10px 10px;',
                standardSubmit:false,
                labelWidth: 120,
                defaults: {
                    msgTarget: 'side'               
                },
                items:[multiSelect],
                buttons: [
                    {
                        text: 'Réinclure',
                        handler: function(){
                            that.supprimerTrou();
                            that.coucheTrou.enleverTout();
                        }
                    },
                    {
                        text:'Fermer',
                        handler: function(){
                            that.myWin.close();
                            that.myWin = undefined;
                            that.coucheTrou.enleverTout();
                        }
                    }
                ]
            });

        this.myWin = new Ext.Window({
            id     : 'fenetreOutilSupprimerTrou'+this.nomCouche,
            title  : 'Réinclure une exclusion dans une surface',
            autoHeight : true,
            width: 355,
            items  : [frmSupprimerTrou],
            modal  : true
        });

        this.myWin.show();   
    };
    
    /**
     * Supprimer un trou sélectionné
     * @method
     * @name OutilSupprimerTrou#supprimerTrou
     */
    OutilSupprimerTrou.prototype.supprimerTrou = function() { 
        var that = this;

        var strTrou = Ext.getCmp("outilSupprimerTrouMultiSelect"+this.nomCouche).getValue();
        var lstTrou = strTrou.split(",");
        
        $.each(lstTrou, function(ind, indexLigne) {
            that.occ.supprimerLigne(indexLigne);
        });
        this.occ.rafraichir();
        this.MAJListeTrou();    
    };
    
     /**
     * Mettre à jour la liste des trous selon les trous de l'occurrence sélectionnée
     * @method
     * @name OutilSupprimerTrou#MAJListeTrou
     */
    OutilSupprimerTrou.prototype.MAJListeTrou = function() {
        var lstTrou = [];
        $.each(this.occ.lignes, function(index, ligne){
            if(index >0) {
                lstTrou.push([index, "Exclusion #"+index]);
            }
        });
        
        this.asListeTrou.loadData(lstTrou, false);        
    };

    return OutilSupprimerTrou;
    
});