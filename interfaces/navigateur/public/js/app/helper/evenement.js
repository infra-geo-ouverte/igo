/** 
 * Module pour l'objet {@link Evenement}.
 * @module evenement
 * @requires aide 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['aide'], function(Aide) {
    var compteur=0;
    /** 
     * Création de l'object Evenement.
     * @constructor
     * @name Evenement
     * @class Evenement
     * @alias evenement:Evenement
     * @requires evenement
     * @returns {Evenement} Instance de {@link Evenement}
     * @property {Dictionnaire} declencheurs Dictionnaire des événements
    */
    function Evenement(){

    }

    Evenement.prototype = {

        constructor: Evenement,

        /** 
        * Ajouter un declencheur sur un événement
        * @method 
        * @param {String} type Nom de l'événement
        * @param {Fonction} action Fonction à exécuter lorsque l'événement est détecté
        * @param {Dictionnaire} [options] Options de l'événement
        * @param {Boolean} [options.avant=false] Indique si l'action est exécutée avant ou après l'événement
        * @param {String} [options.id] Identifiant de l'événement
        * @param {Object} [options.filtre] Appliquer un filtre à l'élément. 
        * L'action sera exécutée seulement si la/les condition(s) du filtre est/sont respectée(s)
        * Le filtre se défini comme un objet selon "{attribut1=valeur1, attribut2=valeur2}"
        * @name Evenement#ajouterDeclencheur
        * @returns {Evenement} this
        */
        ajouterDeclencheur: function(type, action, options){
            options = options || {};
            var id = options.id;
            if (!id) {
                compteur++;
                id = 'declencheur' + compteur;
            };

            this.declencheurs = this.declencheurs || {};
            
            if (typeof this.declencheurs[type] == "undefined"){
                this.declencheurs[type] = [];
            }
            
            if(options.avant){
                options.avant = Aide.toBoolean(options.avant);    
            }
            
            if (typeof(action) !== "function"){
                action = new Function("e", "return " + action + ";");
            };
            
            var declencheurObj = {id:id, action:action, options:options};
            this.declencheurs[type].push(declencheurObj);
            
            return this;
        },

        /** 
        * Exécuter les Declencheurs liés à l'élément
        * @method 
        * @param {Dictionnaire} event Paramètre envoyé au Declencheur
        * @param {String} event.type Nom de l'événement
        * @param {Boolean} [event.avant=false] Indique si l'action est exécutée avant ou après l'événement
        * @param {} [event.target=@this] Cible
        * @param {Boolean} [checkGlobal=true] Regarder les événements globaux?
        * @name Evenement#declencher
        */
        declencher: function(event, checkGlobal){
            if (typeof event == "string"){
                event = { type: event };
            }
            
            if (!event.target){
                event.target = this;
            }

            if (!event.type){
                throw new Error("La propriété 'type' de l'événement est manquant.");
            }

            if (this.declencheurs && this.declencheurs[event.type] instanceof Array){
                var declencheurs = this.declencheurs[event.type].slice();
                for (var i=0, len=declencheurs.length; i < len; i++){
                    if(!declencheurs[i]){break};
                    if(event.avant === undefined || event.avant === declencheurs[i].options.avant || (declencheurs[i].options.avant === undefined && event.avant === false)){
                        var options = declencheurs[i].options;
                        
                        //Si un filtre est défini
                        if(options.filtre){
                            
                            var respecteFiltre = true;
                            
                            //Vérifier si l'élément respecte l'objet de filtre selon les attributs/valeurs
                            $.each(options.filtre, function(attribut, valeur){
                                
                                //Si l'attribut de l'objet appelant ne respecte pas la valeur du filtre
                                if(event.target[attribut] != valeur)
                                {
                                    respecteFiltre = false;
                                    return false; //arrêter la boucle each
                                }
                            });                      
                        }
                        
                        //Si on respecte le filtre ou aucun filtre n'est défini, on appelle le déclencheur
                        if(respecteFiltre == true || !options.filtre) {
                            var scope = options.scope || this;
                            event.options = options;
                            declencheurs[i].action.call(scope, event);
                        }
                    }
                }
            }
            
            if (checkGlobal !== false){
                var nav = Aide.obtenirNavigateur();
                if(nav && nav.evenements){
                    nav.evenements.declencher(event, false);
                }
            }
        },

        /**
        * Obtenir le type de la classe
        * @method
        * @name Evenement#obtenirTypeClasse
        * @returns {String} Type de la classe
        */
        obtenirTypeClasse: function(){
            return this.constructor.toString().match(/function ([A-Z]{1}[a-zA-Z]*)/)[1];
        },
    
        /** 
        * Retirer un ou des Declencheurs. </br>
        * Si pas de type, tous les Declencheurs de l'objet seront supprimés. </br>
        * Si seulement le type, tous les Declencheurs de ce type seront supprimés. </br>
        * Si le type et l'id, tous les Declencheurs de ce type ayant l'id seront supprimés. </br>
        * Si le type et l'action, tous les Declencheurs de ce type ayant l'action seront supprimés.
        * @method 
        * @param {String} [type] Nom de l'événement
        * @param {String} [id] Identifiant de l'événement
        * @param {Fonction} [action] Action de l'événement
        * @name Evenement#enleverDeclencheur
        */
        enleverDeclencheur: function(type, id, action){
            if($.isFunction(id)){
                action = id;
                id = undefined;
            }
            if(!type){
                this.declencheurs={}; 
                return;
            };
            if (this.declencheurs && this.declencheurs[type] instanceof Array){
                if(!action && !id){
                    delete this.declencheurs[type];
                    return;
                };
                var declencheurs = this.declencheurs[type];
                if(!id){
                    for (var i=0, len=declencheurs.length; i < len; i++){
                        if(!declencheurs[i]){break};
                        if (declencheurs[i].action === action){
                            declencheurs.splice(i, 1);
                            i--;
                            //break;
                        }
                    }
                    return;
                };
                for (var i=0, len=declencheurs.length; i < len; i++){
                    if(!declencheurs[i]){break};
                    if (declencheurs[i].id === id){
                        declencheurs.splice(i, 1);
                        i--;
                        //break;
                    }
                }
            }
        },
          
        obtenirDeclencheur: function(type, id, action){
            if(!type){
                return [];
            };
            if (this.declencheurs && this.declencheurs[type] instanceof Array){
                if(!action && !id){ 
                    return this.declencheurs[type] || [];
                };
                var declencheurs = this.declencheurs[type];
                var listeDeclencheurs = [];
                if(!id){
                    for (var i=0, len=declencheurs.length; i < len; i++){
                        if (declencheurs[i].action === action){
                            listeDeclencheurs.push(declencheurs[i]);
                        }
                    }
                    return listeDeclencheurs;
                };
                
                for (var i=0, len=declencheurs.length; i < len; i++){
                    if (declencheurs[i].id === id){
                        listeDeclencheurs.push(declencheurs[i]);
                    }
                }
                return listeDeclencheurs;
            }
            
            return [];
        }
    };
    
    return Evenement;
});
