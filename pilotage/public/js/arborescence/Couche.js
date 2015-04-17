/**
 * Représente une couche. Couche contient généralement des colonnes (Colonne) 
 * et est contenu dans un Groupe
 */

/**
 * Classe couche
 * @param string id
 * @param string libelle
 * @param string url
 * @param int ordre
 * @param {} attributs
 * @returns {Couche}
 */
function Couche(id, libelle, url, ordre, attributs) {

    this.id = 'couche_' + id;
    this.no = id;
    this.libelle = $('<div/>').html(libelle).text();
    this.url = url;
    this.ordre = ordre;
    this.enfants = {};
    this.ajouterAttributs(new Attributs(attributs));
    
}

Couche.prototype.nbEnfants = 0;
Couche.prototype.parent = '';
Couche.prototype.attributs = null;
Couche.prototype.reference = undefined; //référence jQuery

Couche.prototype.init = function(){
    
    //Initialiser les colonnes
   for(cle in this.enfants){

        this.enfants[cle].init();

    }
    
    this.majEtatOutilsEdition();
    this.majClasse();

}

Couche.prototype.obtenirReference = function(){
    
    if(this.reference == undefined){
        this.reference = $(document.getElementById(this.id));
    }
    return this.reference;
}

/**
 * 
 * @param Attributs attributs
 */
Couche.prototype.ajouterAttributs = function(attributs){
    
    this.attributs = attributs;
    this.attributs.parent = this;
   
}

Couche.prototype.getClassName = function(){
    return 'Couche';
}

Couche.prototype.obtenirLibelle = function(){
    return this.libelle;
}

Couche.prototype.definirLibelle = function(libelle){
   
    var arbo = this.obtenirArbo();
    this.libelle = libelle;
    
    var libelleEchappe = $('<div/>').text(libelle).html();
    arbo.obtenirReference().find('#CT' + this.no + '').val(libelleEchappe);
    arbo.obtenirReference().find('#libelle_' + this.id).html(libelleEchappe);

}

/**
 * Place la couche et ses équivalent dans le bon ordre
 */
Couche.prototype.trier = function(){
    var arbo = this.obtenirArbo();
    var parent = this.obtenirReference().parent();
    var liste = parent.children('li');
    
    liste.sort(arbo.fonctionDeTri);
    
    liste.appendTo(parent);

    this.parent.rafraichirFleches();
    
}

/*
 * Retourne la couche suivante dans la liste en se basant sur l'ordre
 * @returns {Couche}
 */
Couche.prototype.suivant = function(){
    
    var parent = this.parent;
    var suivant = false;
    
    var autre;
    for(cle in parent.enfants){
        autre = parent.enfants[cle];
        if(this.ordre < autre.ordre && (!suivant || autre.ordre < suivant.ordre)){
            
            suivant = autre;
        }

    }
    return suivant;
    
}

/*
 * Retourne la couche précédante dans la liste en se basant sur l'ordre
 * @returns {Couche}
 */
Couche.prototype.precedant = function(){
    
    var parent = this.parent;
    var precedant = false;
    
    var autre;
    for(cle in parent.enfants){
        autre = parent.enfants[cle];
        if(this.ordre > autre.ordre && (!precedant || autre.ordre > precedant.ordre)){
            
            precedant = autre;
        }

    }
    return precedant;
    
}

/**
 * Échange l'ordre de deux couches
 */
Couche.prototype.echangerOrdre = function(autre){
    
    //Échanger l'ordre des deux groupes
    var ordre = this.ordre;
    this.definirOrdre(autre.ordre);
    autre.definirOrdre(ordre);
    
    this.obtenirArbo().trierCouches(this.parent);
    
}

Couche.prototype.majClasse = function(){
    
    var attributVisible = this.obtenirAttribut('visible');
    if(attributVisible && attributVisible.estExclu()){
        this.obtenirReference().addClass('exclu');
    }else{
        this.obtenirReference().removeClass('exclu');
    }
}

Couche.prototype.afficher = function() {
    
    var arbo = this.obtenirArbo();
    
    arbo.ecrire('<li id="' + this.id + '">'
    + '<input type="checkbox" class="expander" data-expander-pour-id="' + this.id + '"><span class="expander"></span>');
    this.afficherAttributs();
    if (this.url) {
        arbo.ecrire('<a href="' + this.url + '" title="Modifier la couche" class="lien-couche" target="_blank">');
    }
    arbo.ecrire('<span id="libelle_' + this.id + '" class="libelle libelle-couche">' + this.libelle + '</span>');
    if (this.url) {
        arbo.ecrire('</a>');
    }
    
    if(arbo.estEnModeEdition()){
            
        //Icône d'édition
        arbo.ecrire(['<span class="glyphicon glyphicon-edit action modifier-titre" data-id="', this.id, '" title="Modifier le Mf layer meta title"></span>'
       , '<input type="hidden" data-utilite="titre" class="input-titre" name="CT', this.no, '" id="CT', this.no, '" value="', this.libelle, '">'
       , '<span class="glyphicon glyphicon-arrow-up action action-monter" data-id="', this.id, '" title="Monter"></span>'
       , '<span class="glyphicon glyphicon-arrow-down action action-descendre" data-id="', this.id, '"  title="Descendre"></span>'
       , '<span class="glyphicon glyphicon-resize-vertical action action-deplacer" data-id="', this.id, '"  title="Glisser/déposer vers le haut/bas"></span>'
       , '<input type="hidden" data-utilite="ordre" class="input-ordre" name="CO', this.no, '" id="CO', this.no, '" value="', this.ordre, '">'].join(''));
        
    }

    if (this.nbEnfants > 0) {
        arbo.ecrire('<ul class="css-treeview">');
        var colonne;
        for (nomColonne in this.enfants) {
            colonne = this.enfants[nomColonne];
            colonne.afficher();

        }
        arbo.ecrire('</ul>');
    }
    arbo.ecrire('</li>');
    
}

/**
 * Permet d'accéder aux attributs sans devoir faire this.attributs.attributs
 */
Couche.prototype.obtenirAttributs = function() {

    return this.attributs.attributs;
}

Couche.prototype.afficherAttributs = function() {

    var attributs = this.obtenirAttributs();
    var attribut, checked, id, title, separateurAttribut, name;
    var arbo = this.obtenirArbo();
    for (nomAttribut in attributs) {
        
        if (nomAttribut != 'commune'){
            
            attribut = this.obtenirAttribut(nomAttribut);
            checked = attribut.estCoche() ? 'checked' : '';
            id = this.id + '_' + nomAttribut;
            title = attribut.getTitle();
            separateurAttribut = attribut.getSeparateur();
            name = 'C' + separateurAttribut + this.no;

            arbo.ecrire(['<span class="wrap wrap-' , nomAttribut , '">' ,
            '<input type="hidden" name="', name, '" value="0">',
            '<input type="checkbox" id="', id, '" name="', name, '" data-id="', this.id, '" data-attribut="', nomAttribut, '" class="check ', nomAttribut, '"', checked, ' value="1">'+
            '<label for="', id, '" data-toggle="tooltip" data-placement="top" title="', title, '"></label>',
            '</span>'].join(''));
        }
    }
}

Couche.prototype.ajouterColonne = function(colonne) {
     
    colonne.parent = this;
    this.enfants[colonne.libelle] = colonne;
    this.nbEnfants++;
    
    this.obtenirArbo().colonnes.ajouterElement(colonne);

}

Couche.prototype.ajusterOrdre = function(){
    
    if(!this.obtenirArbo().estEnModeEdition()){
        return;
    }
    
    if(this.ordre == 0){
        return;
    }
    
    if(this.ordreDejaUtilise()){
        this.ordre = this.ordreMax() + 1;
    }
}

Couche.prototype.ordreDejaUtilise = function(){

    var enfants = this.parent.enfants;
    for(cle in enfants){
        if(this.ordre == enfants[cle]){
            return true;
        }
    }
    return false;
}

Couche.prototype.ordreMax = function(){
    
    var max = 1;
    var enfants = this.parent.enfants;
    for(cle in enfants){
        if(enfants[cle].ordre > max){
            max = enfants[cle].ordre;
        }
    }
    return max;
}

Couche.prototype.definirOrdre = function(ordre){
    this.ordre = ordre;
    this.getOrdreInput().val(ordre);
}

Couche.prototype.getOrdreInput = function(ordre){

    return $(document.getElementById('CO' + this.no));
    
}

/**
 * Indique si le terme est contenu dans l'iten ou dans un des enfants
 */
Couche.prototype.contientLeTerme = function(terme) {
    var contient = indexOfRegExp(this.libelle, terme);

    if (!contient) {

        if (this.nbEnfants > 0) {

            //Vérifier dans les enfants
            for (idColonne in this.enfants) {
                contient = this.enfants[idColonne].contientLeTerme(terme);

                if (contient) {
                    return contient;
                }
            }
        }
    }

    return contient;
}

/**
 * Ajuste l'état des boutons et des inputs lié au groupe ou à la couche de l'attribut
*/
Couche.prototype.majEtatOutilsEdition = function(){
    
    var arbo = this.obtenirArbo();
    
    if(arbo.estEnModeEdition()){
        
        var id = this.id;
        var activer = this.nbAttributsActives() > 0;
        var item = this.obtenirReference();
        
        //Libellé et ordre signifiant "rien"
        var libelle = '';
        var ordre = 0;
        
        if(activer){
            
           libelle = $('<div/>').text(this.libelle).html();
           ordre = this.ordre;
           item.children('.action').addClass('afficher').removeClass('masquer').show();
        }else{
            item.children('.action').addClass('masquer').removeClass('afficher').hide();
            this.ordre = 0;
        }
        
        item.children('#CT' + this.no).val(libelle);
        item.children('#CO' + this.no).val(ordre);
        
    }
}

Couche.prototype.decocherColonnes = function(){
    
    var colonnes = this.enfants;
    for(id in colonnes){

        //Il n'est pas possible d'exclure une colonne qui fait partie d'une couche pas dans le contexte
        colonnes[id].decocher();

    }
}

Couche.prototype.obtenirAttribut = function(nomAttribut) {
    return this.attributs.obtenirAttribut(nomAttribut);
}

Couche.prototype.nbAttributsActives = function(){
    
    return this.attributs.nbAttributsActives();
}

Couche.prototype.estActive = function(){
    return this.nbAttributsActives() > 0;
}

/**
 * Indique si la couche est à la racine
 * @return bool Devrait toujours retourner faux
 */
Couche.prototype.estALaRacine = function(){
    
    return this.parent.estArbo();
}

Couche.prototype.estCouche = function(){
    return true;
}

Couche.prototype.estGroupe = function(){
    return false;
}

Couche.prototype.estArbo = function(){
    return false;
}

Couche.prototype.obtenirArbo = function(){
    
    return this.parent ? this.parent.obtenirArbo() : '';
}