define(['contexteMenu', 'aide', 'fonctions'], function(ContexteMenu, Aide, Fonctions) {
  
    function ContexteMenuTable(options){
        this.options = options || {};   
        this.carte = this.options.panneauTable.carte;
        this.init();
    };
    
    ContexteMenuTable.prototype = new ContexteMenu();
    ContexteMenuTable.prototype.constructor = ContexteMenuTable;
    
    ContexteMenuTable.prototype.init = function(){
        ContexteMenu.prototype.init.call(this);
        
        this.ajouterFonctionsConstruction(this.initOccurencesSubmenu);
        this.ajouterFonctionsConstruction(this.initFermerSubmenu);
    };
    
    ContexteMenuTable.prototype.obtenirInformation = function(e){
        var rowHtml;
        var $target = $(e.target);
        rowHtml = $target.parentsUntil(this.$selecteur, 'div.x-grid3-row');
        var index = this.options.panneauTable.obtenirIndexParEnregistrementHtml(rowHtml[0]);
        if(index === 'undefined' || index === false){
            return false;
        }
        var enregistrement = this.options.panneauTable.obtenirEnregistrementParIndex(index);
        if(!enregistrement.json.obtenirTypeClasse || enregistrement.json.obtenirTypeClasse() !== 'Occurence'){
            return false;
        }
        var occurence = enregistrement.json;
        
        if(!Aide.obtenirNavigateur().obtenirCtrl()) {
            occurence.vecteur.deselectionnerTout();
        }
        this.options.panneauTable.selectionnerParIndex(index, undefined, false);
        
        return {
            occurence: occurence
        };
    };
    

    ContexteMenuTable.prototype.initOccurencesSubmenu = function(args){
        var that=args.scope;

        var menu = [];

        menu.push({
            //id: 'occurencesInfo',
            text: 'Plus d\'info',
            handler: function(){
                Fonctions.afficherProprietes([args.occurence]);
            }
        });        

        menu.push({
           // id: 'occurenceZoomer',
            text: "Zoomer",
            handler: function(){
                var min = Math.max(that.carte.obtenirZoom(), 15);
                args.occurence.vecteur.zoomerOccurence(args.occurence, min);
            }
        });
        
        if(args.occurence.vecteur.options.selectionnable && args.occurence.vecteur.options.supprimable !== false && args.occurence.obtenirTypeClasse() !== 'Cluster' && args.occurence.vecteur.options.protege !== true){
            menu.push({
               // id: 'occurenceSupprimer',
                text: "Supprimer",
                handler: function(){
                    args.occurence.vecteur.enleverOccurence(args.occurence);
                }
            });
        }

        if(args.occurence.type === 'Ligne'){
            menu.push('-');
            menu.push({
             //   id: 'occurenceLongueur',
                text: "Longueur",
                handler: function(){
                    var longueur = args.occurence.obtenirLongueur();
                    Aide.afficherMessage('Longueur', longueur + ' ' + that.carte._carteOL.getUnits());
                }
            }); 
        } else if(args.occurence.type === 'Polygone'){
            menu.push('-');
            menu.push({
               // id: 'occurencePerimetre',
                text: "Périmètre",
                handler: function(){
                    var perimetre = args.occurence.obtenirPerimetre();
                    Aide.afficherMessage('Périmètre', perimetre + ' ' + that.carte._carteOL.getUnits());
                }
            },{
               // id: 'occurenceSuperficie',
                text: "Superficie",
                handler: function(){
                    var superficie = args.occurence.obtenirSuperficie();
                    Aide.afficherMessage('Superficie', superficie + ' ' + that.carte._carteOL.getUnits() + "²");
                }
            }); 
        }
              
        return menu;
    };    

    ContexteMenuTable.prototype.initFermerSubmenu = function(args){ 
        return {
            //id: 'arborescenceClose',
            text : 'Fermer'
        };
    };
    
    return ContexteMenuTable;
    
});
