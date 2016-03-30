var Igo = {};

/*
 * opt.src = lien vers le iframe
 * opt.div = id de la div qui inclura le iframe
 */
Igo.client = function (opt) {
    if (!opt) {
        console.log("Options obligatoires pour Igo.iframe");
        return false;
    }
    this._opt = opt;
    this._callback = {};
    this._creerIframe();
    this._ecouterMessage();
    this._inclurePrototype();
};

Igo.client.prototype._creerIframe = function () {
    var igoDiv = document.getElementById(this._opt.div);

    this._iframe = document.createElement("iframe");
    this._iframe.src = this._opt.src;
    this._iframe.width = "100%";
    this._iframe.height = "100%";
    this._iframe.frameBorder = "0";

    igoDiv.appendChild(this._iframe);
};

Igo.client.prototype._ecouterMessage = function () {
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

Igo.client.prototype._envoyerMessage = function (message, params, callback) {
    var randomKey;
    if (callback) {
        randomKey = Math.floor(Math.random() * 1000000);
        this._callback[randomKey] = callback;
    }
    var win = this._iframe.contentWindow;
    win.postMessage({
        controle: message, 
        params: params,
        callback: randomKey
    }, this._opt.src);
};

Igo.client.prototype._traiterMessageRecu = function (event) {
    if (this._opt.src.indexOf(event.origin) === 0) {
        var fn = this._callback[event.data.callback];
        if(!fn){return false;}
        if (event.data.resultat) {
            fn(JSON.parse(event.data.resultat));
        } else {
            fn();
        }
        if(!event.data.opt.garderCallback){
            delete this._callback[event.data.callback];
        }
    }
};

Igo.client.prototype._inclurePrototype = function(){
    this.carte = new Igo.client.Carte(this);
    this.evenements = new Igo.client.Evenements(this);
};

Igo.client.prototype.estPret = function(callback){
    this._envoyerMessage("estPret", undefined, callback);
};

//-----------------------------------------------------------------

Igo.client.Carte = function(client){
    this._client = client;
    this.controles = new Igo.client.Carte.Controles(this._client);
    this.couches = new Igo.client.Carte.Couches(this._client);
}

Igo.client.Carte.prototype.obtenirCentre = function (callback) {
    this._client._envoyerMessage("carte.obtenirCentre", undefined, callback);
};

Igo.client.Carte.prototype.zoomer = function (zoom) {
    this._client._envoyerMessage("carte.zoomer", [zoom]);
};

Igo.client.Carte.Controles = function(client){
    this._client = client;
};

Igo.client.Carte.Controles.prototype.activerDessin = function (coucheId, type) {
    // id: "dessinCouche"
    //type: point, cercle, polygone, ligne
    this._client._envoyerMessage("carte.controles.activerDessin", [coucheId, type]);
};

Igo.client.Carte.Controles.prototype.desactiverDessin = function () {
    this._client._envoyerMessage("carte.controles.desactiverDessin");
};

Igo.client.Carte.Controles.prototype.activerClique = function () {
    this._client._envoyerMessage("carte.controles.activerClique");
};

Igo.client.Carte.Controles.prototype.desactiverClique = function () {
    this._client._envoyerMessage("carte.controles.desactiverClique");
};


Igo.client.Carte.Couches = function(client){
    this._client = client;
}

Igo.client.Carte.Couches.prototype.ajouterPoint = function (coucheId, point, projection) {
    this._client._envoyerMessage("carte.couches.ajouterPoint", [coucheId, point, projection]);
};

Igo.client.Carte.Couches.prototype.ajouterLigne = function (coucheId, ligne, projection) {
    this._client._envoyerMessage("carte.couches.ajouterLigne", [coucheId, ligne, projection]);
};

Igo.client.Carte.Couches.prototype.ajouterPolygone = function (coucheId, polygone, projection) {
    this._client._envoyerMessage("carte.couches.ajouterPolygone", [coucheId, polygone, projection]);
};

Igo.client.Carte.Couches.prototype.ajouterMarqueur = function (coucheId, point, couleur, projection) {
    this._client._envoyerMessage("carte.couches.ajouterMarqueur", [coucheId, point, couleur, projection]);
};

//-----------------------------------------------------------------

Igo.client.Evenements = function(client){
    this._client = client;
};


Igo.client.Evenements.prototype.ajouterDeclencheur = function (id, declencheur, callback) {
    //declencheur: limitesModifiees, occurenceClique, clique
    this._client._envoyerMessage("evenements.ajouterDeclencheur", [id, declencheur], callback);
};

Igo.client.Evenements.prototype.enleverDeclencheur = function (id, declencheur) {
    //declencheur: limitesModifiees, occurenceClique, clique
    this._client._envoyerMessage("evenements.enleverDeclencheur", [id, declencheur]);
};