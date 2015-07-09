define(['point', 'aide'], function(Point, Aide) {
  
    function ContexteMenu(options){
        this.options = options || {};   
        this.init();
    };
    
    ContexteMenu.prototype.init = function(){
        var that=this;
        this.fonctionsConstruction = [];
        this.$selecteur = this.options.selecteur ? $(this.options.selecteur) : $(this.options.cible);
        this.contexteMenu = new Ext.menu.Menu({  
            items: []
        });

        this.$selecteur.bind('contextmenu', this.options.cible, function(e){
            var estConstruit = that.construire(e);
            if(estConstruit){
                that.contexteMenu.showAt([e.clientX, e.clientY]);
            }
            e.preventDefault();
        });
    };
    
    ContexteMenu.prototype.obtenirInformation = function(e){
        return {};
    };
    
    ContexteMenu.prototype.construire = function(e){
        this.contexteMenu.removeAll();
       /* try {
            if(this.contexteMenu.el){
                this.contexteMenu.removeAll();
            }
        } catch(error){
            //$('.x-menu-list').remove();
            this.contexteMenu.destroy();
            this.contexteMenu = new Ext.menu.Menu({  
                items: []
            });
        }*/
        
        var info = this.obtenirInformation(e);
        if(!info){return false;};
        info.scope = this;

        var that=this;
        $.each(this.fonctionsConstruction, function(key, fn){
            var resultat = fn(info);
            if(resultat) {
                if (!resultat.keysMenu){
                    that.contexteMenu.add(resultat);
                    return true;
                }
                var menu = that.contexteMenu;
                try{
                    $.each(resultat.keysMenu, function(key, valueKey){
                        menu = menu.items.map[valueKey].menu;
                    });
                    menu.add(resultat.submenu);
                } catch(e){console.warn(e);};
            }
        });
        return true;
    };
    
    ContexteMenu.prototype.ajouterFonctionsConstruction = function(fn){
        this.fonctionsConstruction.push(fn);
    };
    
    ContexteMenu.prototype.ajouter = function(args){ 
        var id = args.id;
        var titre = args.titre || "Pas de titre";
        var action = args.action;
        var condition = args.condition;
        var position = args.position;
        var evenement = args.evenement;
        var rendu = args.rendu;
        
        var fnConstruction = function(args) {
            if(!$.isFunction(condition) || condition(args)){
                var splitId = id.split('.');
                var lastId = splitId[splitId.length-1];
                splitId.pop();
                
                var submenu;
                if(action){ 
                    submenu  = {
                        id: lastId,
                        text: titre,
                        handler: function(){action(args);}
                    };
                }  else if (rendu && evenement) {
                    submenu  = {
                        id: lastId,
                        text: titre,
                        menu: {
                            items: {
                                html: rendu,
                                listeners: {
                                    afterrender:  function(){evenement(args);}
                                 },
                                handler: function () { return false;}  
                            }
                        }
                    };
                  }  else  {
                    submenu  = {
                        id: lastId,
                        text: titre,
                        menu: {
                            items: []
                        }
                    };
                }              
                return {submenu: submenu, keysMenu: splitId};
            }
        };
        if(position){
            this.fonctionsConstruction.splice(position, 0, fnConstruction);
        } else {
            this.fonctionsConstruction.push(fnConstruction);
        }
    };
                
    return ContexteMenu;
    
});