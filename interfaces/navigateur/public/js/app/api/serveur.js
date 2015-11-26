define(['aide'], function(Aide) {
    var Serveur = function () {
        this._ecouterMessage();
        this._inclurePrototype();
    };

    Serveur.prototype._ecouterMessage = function () {
        if (window.addEventListener) {
            addEventListener("message", function (e) {
                this._traiterMessageRecu(e);
            }.bind(this), false);
        } else {
            attachEvent("onmessage", function (e) {
                this._traiterMessageRecu(e);
            }.bind(this));
        }
    };

    Serveur.prototype._envoyerMessage = function (resultat, e, opt) {
        if(e.data.callback){
            var resultatString = this._stringifyResultat(resultat);
            opt = opt || {};
            if(!resultatString){
                e.source.postMessage({callback: e.data.callback, opt: opt}, e.origin);
            } else {
                e.source.postMessage({resultat: resultatString, callback: e.data.callback, opt: opt}, e.origin);
            }
        }
    };
    
    Serveur.prototype._stringifyResultat = function (resultatObj) {
        var cache = [];
        var resultat;
        try {
            resultat = JSON.stringify(resultatObj, function(key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        return;
                    }
                    cache.push(value);
                }
                return value;
            });
        } catch(error){
            resultat = JSON.stringify(error);
        }
        return resultat;
    };

    Serveur.prototype._verificationOrigine = function (origine) {
        var clients = Aide.obtenirConfigXML("client");
        if(!clients){return false;}
        if(!$.isArray(clients)){clients = [clients];}
        var permis = false;
        $.each(clients, function(key, value){
            var attr = value["@attributes"] || value.attributes;
            if(attr.host && attr.host.indexOf(origine) === 0){
                permis = true;
                return false;
            }
        });
        return permis;
    }
    
    Serveur.prototype._traiterMessageRecu = function (e) {
        var that=this;
        if (this._verificationOrigine(e.origin)) {
            var fct = this._obtenirFonction( e.data.controle );
            var params = [e];
            if(e.data.params){
                params = params.concat(e.data.params);
            }
            var resultat = fct.apply(that, params);
            if(resultat !== undefined){
                this._envoyerMessage(resultat, e);
            } 
        } else {
            this._envoyerMessage({erreur: "Vous n'avez pas les permissions pour cet api."}, e);
        }
    };
    
    Serveur.prototype._obtenirFonction = function (appel) {
        var appelSplit = appel.split(".");
        var fct = appelSplit.pop();
        var obj = this;
        $.each(appelSplit, function(key, value){
            if(!obj){
                return false;
            }
            obj = obj[value];      
        });
        if(obj && typeof obj[fct] === 'function'){
            return obj[fct];
        }
    };

    Serveur.prototype._inclurePrototype = function(){
        this.nav = Aide.obtenirNavigateur(); 
        this.carte = new Serveur.Carte();
        this.evenements = new Serveur.Evenements();
    };
    
    Serveur.prototype.estPret = function(e){
        var that = this;
        var fct = function(){
            that._envoyerMessage(true, e);
        };
        if(this.nav.isReady){
            fct();
        } else {
            this.nav.evenements.ajouterDeclencheur("navigateurInit", fct);
        }
    };

    //-----------------------------------------------------------------

    Serveur.Carte = function(){
        this.controles = new Serveur.Carte.Controles();
        this.couches = new Serveur.Carte.Couches();
    }

    Serveur.Carte.prototype.obtenirCentre = function (e) {
        //return that._envoyerMessage(that.nav.carte.obtenirCentre(), e);
        return this.nav.carte.obtenirCentre();
    };

    Serveur.Carte.prototype.zoomer = function (e, zoom) {
        this.nav.carte.zoomer(zoom);
    };

    Serveur.Carte.Controles = function(){}

    Serveur.Carte.Controles.prototype.activerDessin = function (e, coucheId, type) {
        this.nav.carte.controles.activerDessin(this.nav.carte.gestionCouches.obtenirCoucheParId(coucheId), type);
    };

    Serveur.Carte.Controles.prototype.desactiverDessin = function () {
        this.nav.carte.controles.desactiverDessin();
    };

    Serveur.Carte.Controles.prototype.activerClique = function () {
        this.nav.carte.controles.activerClique();
    };

    Serveur.Carte.Controles.prototype.desactiverClique = function () {
        this.nav.carte.controles.desactiverClique();
    };


    Serveur.Carte.Couches = function(){}

    Serveur.Carte.Couches.prototype.ajouterPoint = function (e, coucheId, point, projection) {
        var that=this;
        require(['point'], function(Point){
            var pointIgo = new Point(point);
            if(projection){
                pointIgo = pointIgo.projeter(projection, that.nav.carte.obtenirProjection());
            }
            that.nav.carte.gestionCouches.obtenirCoucheParId(coucheId).creerOccurence(pointIgo);
        });
    };

    Serveur.Carte.Couches.prototype.ajouterLigne = function (e, coucheId, ligne, projection) {
        var that=this;
        require(['ligne'], function(Ligne){
            var ligneIgo = new Ligne(ligne);
            if(projection){
                ligneIgo = ligneIgo.projeter(projection, that.nav.carte.obtenirProjection());
            }
            that.nav.carte.gestionCouches.obtenirCoucheParId(coucheId).creerOccurence(ligneIgo);
        });
    };

    Serveur.Carte.Couches.prototype.ajouterPolygone = function (e, coucheId, polygone, projection) {
        var that=this;
        require(['polygone'], function(Polygone){
            var polygoneIgo = new Polygone(polygone);
            if(projection){
                polygoneIgo = polygoneIgo.projeter(projection, that.nav.carte.obtenirProjection());
            }
            that.nav.carte.gestionCouches.obtenirCoucheParId(coucheId).creerOccurence(polygoneIgo);
        });
    };

    Serveur.Carte.Couches.prototype.ajouterMarqueur = function (e, coucheId, point, couleur, projection) {
        var that=this;
        require(['point'], function(Point){
            var pointIgo = new Point(point);
            if(projection){
                pointIgo = pointIgo.projeter(projection, that.nav.carte.obtenirProjection());
            }
            that.nav.carte.gestionCouches.obtenirCoucheParId(coucheId).ajouterMarqueur(pointIgo, couleur);
        });
    };

    //-----------------------------------------------------------------

    Serveur.Evenements = function(){}

    Serveur.Evenements.prototype.ajouterDeclencheur = function (e, id, declencheur) {
        var that=this;
        this.nav.evenements.ajouterDeclencheur(declencheur, function(evt){
            that._envoyerMessage(evt, e, {garderCallback: true});
        }, {id: id});
    }
    
    Serveur.Evenements.prototype.enleverDeclencheur = function (e, id, declencheur) {
        this.nav.evenements.enleverDeclencheur(declencheur, id);
    }
    
    return Serveur;
    
});