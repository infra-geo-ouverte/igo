define(['outil', 'aide', 'style'], function(Outil, Aide, Style) {
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
                infobulle: 'Zoom auto sur la sélection',

           });
        }  else if (this.options.type === 'contenupage' && this.options.panneauTable.options.paginer === true){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'contenupage',
                xtype:'menucheckitem',
                titre: 'Afficher le contenu de la page seulement',
                infobulle: 'Affiche seulement le contenu de la page active.',

           });
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

    OutilTableSelection.prototype.executer =  function (lancementManuel) {

        lancementManuel = typeof lancementManuel === "undefined"?false:true;

        if (this.options.type === 'efface'){
            this.options.couche.deselectionnerTout();
        } else if (this.options.type === 'inverse'){
             this.options.couche.selectionnerInverse();
        } else if (this.options.type === 'complet'){
            this.options.couche.selectionnerTout();
        } else if (this.options.type === 'zoom'){
            this.options.couche.zoomerOccurences(this.options.couche.obtenirOccurencesSelectionnees());
        } else if (this.options.type === 'auto'){
            if((!lancementManuel && !this._bouton.checked) || (lancementManuel && this._bouton.checked)){
                this.options.couche.ajouterDeclencheur('vecteurOccurenceSelectionnee', function(e){
                    e.target.zoomerOccurence(e.occurence);
                }, {scope: this, id:'occurenceCliqueTableSelection'});
            }else{
                this.options.couche.enleverDeclencheur('vecteurOccurenceSelectionnee', 'occurenceCliqueTableSelection',function(e){
                    e.target.zoomerOccurence(e.occurence);
                });
            }

        }  else if (this.options.type === 'contenupage'){
            
            //filtre 
            var contenuPageSeulement = function(occurence){
                if(occurence.vecteur.panneauTable.obtenirIndexParOccurence(occurence) == -1){
                    return true;
                }
                else{
                    return false;
                }  
            };

            var bidon = function(b){return true};

            if((!lancementManuel && !this._bouton.checked) || (lancementManuel && this._bouton.checked)){
                              
                //ne pas permettre l'option d'afficher seulement la sélection
                $.each(this.parent.obtenirOutils(), function(index,value){
                    if(value.options.type === 'selectionSeulement'){
                        value._bouton.setChecked(false);
                        value._bouton.disable();
                    }
                });
               
                $.each(this.options.couche.obtenirStyles(), function(index, value){
                    
                    value.ajouterFiltre({filtre: bidon, 
                                            style:{},
                                            titre: 'Défaut'           
                                        });

                    value.ajouterFiltre({filtre: contenuPageSeulement, 
                                            style:{visible: false},
                                            titre: 'Page Seulement'
                                        });
                })
            }
            else{

                $.each(this.options.couche.obtenirStyles(), function(index, value){
                    value.enleverFiltre(contenuPageSeulement);
                    value.enleverFiltre(bidon);
                });
                
                $.each(this.parent.obtenirOutils(), function(index,value){
                    if(value.options.type === 'selectionSeulement'){
                        value._bouton.enable();
                    }
                });

                this.options.couche.afficherTout();
            }

        } else if (this.options.type === 'selectionSeulement'){

            //filtre 
            var selectionSeulement = function(occurence){
                if(occurence.estSelectionnee()){
                    return false;
                }
                else{
                    return true;
                }    
            }

            var bidon = function(a){return true};

            if((!lancementManuel && !this._bouton.checked) || (lancementManuel && this._bouton.checked)){
                 this.options.couche.declencher({ type: "occurenceClique", occurence:this.options.couche.obtenirOccurencesSelectionnees()});

                //ne pas permettre l'option d'afficher seulement le contenu de la page
                $.each(this.parent.obtenirOutils(), function(index,value){
                    if(value.options.type === 'contenupage'){
                        value._bouton.disable();
                        value._bouton.setChecked(false);
                    }
                });
                
                $.each(this.options.couche.obtenirStyles(), function(index, value){

                      value.ajouterFiltre({filtre: bidon, 
                                            style:{},
                                            titre: 'Défaut' 
                                        });


                    value.ajouterFiltre({filtre: selectionSeulement, 
                                           style:{visible: false},
                                             titre: 'Sélection Seulement'
                                        });
                })
            }
            else{
                $.each(this.parent.obtenirOutils(), function(index,value){
                    if(value.options.type === 'contenupage'){
                        value._bouton.enable();
                    }
                });

                $.each(this.options.couche.obtenirStyles(), function(index, value){
                    value.enleverFiltre(selectionSeulement);
                    value.enleverFiltre(bidon);
                });

                this.options.couche.afficherTout();
            }
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
