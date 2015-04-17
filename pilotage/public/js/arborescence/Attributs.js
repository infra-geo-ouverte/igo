/**
 * Représente une liste d'attributs.
 */

/**
 * Construit la liste d'attributs en fonction du nom et de leur état
 * @param {} attributs ex : {'visible':true, 'active':false}
 */
function Attributs(attributs) {

    this.attributs = {};

    for (nomAttribut in attributs) {
        this.ajouterAttribut(new Attribut(nomAttribut, attributs[nomAttribut]['valeur'], attributs[nomAttribut]['association']));
    }
}

Attributs.prototype.parent = ''; //Défini lors de Couche.ajouterAttributs()
Attributs.prototype.nbAttributs = 0;

Attributs.prototype.init = function(){
    var attribut;
    var etat;
    for(nomAttribut in this.attributs){
        attribut = this.attributs[nomAttribut];
        etat = attribut.init('decoche');
        attribut.etat = etat;

    }

}

Attributs.prototype.ajouterAttribut = function(attribut){
    attribut.parent = this;
    this.attributs[attribut.nomAttribut] = attribut;
    this.nbAttributs++;
}

/*
 * Permet d'accéder à un attribut sans faire attributs.attributs[nomAttribut]
 * @param string nomAttribut
 * @returns <Attribut>
 */
Attributs.prototype.obtenirAttribut = function(nomAttribut) {
    return this.attributs[nomAttribut] != undefined ? this.attributs[nomAttribut] : false;
}

/**
 * Nombre d'attributs activés, soit coché, intermédiaire ou complet
 * @returns int
 */
Attributs.prototype.nbAttributsActives = function() {
    var nbCoche = 0;
    var attribut;
    for (id in this.attributs) {
        attribut = this.attributs[id];
        if (id != 'commune' && (attribut.estCoche() || attribut.estPartiel() || attribut.estComplet())) {
            nbCoche++;
        }
    }
    return nbCoche;
}

/**
 * Retourne une référence sur l'arbo qui contient l'attribut
 */
Attributs.prototype.obtenirArbo = function(){
    
    return this.parent ? this.parent.obtenirArbo() : '';
}