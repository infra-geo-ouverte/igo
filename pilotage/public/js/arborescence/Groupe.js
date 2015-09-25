/**
 * Représente un groupe. 
 */

/**
 * Classe groupe
 * @param string id
 * @param string no
 * @param string libelle
 * @param string url
 * @param int ordre
 * @param {} attributs
 * @returns {Couche}
 */
function Groupe(id, no, libelle, url, ordre, attributs) {

    this.id = 'groupe_' + id; //Identifiant unique du champ
    this.no = no; // Ex : tous les groupes Carte de glace ont le même no
    this.libelle = $('<div/>').html(libelle).text();
    this.url = url;
    this.ordre = ordre;
    this.enfants = {};
    this.ajouterAttributs(new Attributs(attributs));
}

Groupe.prototype.nbEnfants = 0;
Groupe.prototype.parent = ''; //Initialisé lors de Groupe.ajouterGroupe()
Groupe.prototype.attributs = null;
Groupe.prototype.reference = undefined; //référence jQuery
Groupe.prototype._estGroupeDeGroupe = undefined; //Contient des groupes ou des couches

Groupe.prototype.getClassName = function(){
    return 'Groupe';
}

/**
 * 
 * @param Attributs attributs
 */
Groupe.prototype.ajouterAttributs = function(attributs){
    this.attributs = attributs;
    this.attributs.parent = this;
}

Groupe.prototype.init = function(){
    
    var arbo = this.obtenirArbo();
    
    for(cle in this.enfants){
        this.enfants[cle].init();
    }
    
    if(arbo.estEnModeEdition()){
                
        //S'assurer que l'ordre d'affichage corresponde à ce qu'on a dans la BD
        this.trier();
    
        this.majEtatOutilsEdition();
        this.majClasse();
        this.rafraichirFleches();
        
         //Décaller l'activation du tri pour accélérer l'affichage initial
        setTimeout(function(that){
            
            //Activer le tri glisser/déposer des enfants de ce groupe
            that.obtenirReference().children('ul').sortable({
               placeholder: "ui-state-highlight",
               axis:'y',
               connectWith:'> ul',
               items: "> li:has(.afficher)",
               cancel:"> li:not(:has(.afficher))",
               cursor:"n-resize",
               handle:'.action-deplacer',
               update:$.proxy(function(event, ui){

                   this.obtenirArbo().estModifie = true;
                   this.majOrdre();    
                   this.trier();

               }, that)
            });
        },0,this);

    }
     
}

/**
 * Récupère une référence jQuery sur le groupe
 */
Groupe.prototype.obtenirReference = function(){
    
    if(this.reference == undefined){
        this.reference = $(document.getElementById(this.id));
    }
    return this.reference;
}

/** 
 * Met à jour l'ordre des enfants en se basant sur leur ordre dans le DOM
 */
Groupe.prototype.majOrdre = function(){
    
    var arbo = this.obtenirArbo();
   
    this.obtenirReference().find(' > ul > li').each($.proxy(Arborescence._majOrdre, arbo));

}

Groupe.prototype.majClasse = function(){
    
    var attributVisible = this.obtenirAttribut('visible');
    if(attributVisible && attributVisible.estExclu()){
        this.obtenirReference().addClass('exclu');
    }else{
        this.obtenirReference().removeClass('exclu');
    }
}

/**
 * Indique si le groupe contient des/un groupe
 * @returns bool
 */
Groupe.prototype.estGroupeDeGroupe = function(){
    
    if(this._estGroupeDeGroupe != undefined){
        return this._estGroupeDeGroupe;
    }
        
    if(this.enfants == 0){
        this._estGroupeDeGroupe = true;

    }else{
        //TODO Vérifier si on peut tester le premier seulement --> [0]...
        for(cle in this.enfants){
            this._estGroupeDeGroupe = this.enfants[cle].estGroupe();
            break;
        }
    }
    
    return this._estGroupeDeGroupe;
    
}

/**
 * Tri les éléments contenus dans le groupe
 */
Groupe.prototype.trier = function(){
    
    if(this.estGroupeDeGroupe()){
        this.obtenirArbo().trierGroupes(this);
    }else{
        this.obtenirArbo().trierCouches(this);
    }
}

Groupe.prototype.obtenirAttributs = function() {
    return this.attributs.attributs;
}

Groupe.prototype.obtenirAttribut = function(nomAttribut) {
    return this.attributs.obtenirAttribut(nomAttribut);
}

Groupe.prototype.ajouterGroupe = function(groupe) {
    
    var arbo = this.obtenirArbo();
    
    groupe.parent = this;
    this.enfants[groupe.id] = groupe;
    this.nbEnfants++;
    
    groupe.ajusterOrdre();
    arbo.groupes.ajouterElement(groupe);
        
    arbo.ajouterAttributsALaListe(groupe.obtenirAttributs());

}

Groupe.prototype.ajouterCouche = function(couche) {
    
    var arbo = this.obtenirArbo();
    couche.parent = this;
    this.enfants[couche.id] = couche;
    this.nbEnfants++;
    
    couche.ajusterOrdre();
    arbo.couches.ajouterElement(couche);

    arbo.ajouterAttributsALaListe(couche.obtenirAttributs());
   
}

Groupe.prototype.obtenirLibelle = function(){
    return this.libelle;
}

Groupe.prototype.definirLibelle = function(libelle){
    var arbo = this.obtenirArbo();
    
    this.libelle = libelle;
    
    var libelleEchappe = $('<div/>').text(libelle).html();
    arbo.obtenirReference().find('#GT' + this.no).val(libelleEchappe);
    arbo.obtenirReference().find('#libelle_' + this.id).html(libelleEchappe);

}

//TODO le contenu de cette fonction devrait peut être aller ailleurs. Le code qui masque est où?
Groupe.prototype.rafraichirFleches = function(){
    
    var arbo = this.obtenirArbo();
    var liste = this.obtenirReference().find('> ul > li');

    //Cacher les flèches des items non activées
    liste.children('.masquer.action-monter').hide();
    liste.children('.masquer.action-descendre').hide();
    liste.children('.masquer.action-deplacer').hide();

    //Afficher la flèche monter de tous les activés, sauf le premier
    liste.children('.afficher.action-monter').show().first().hide();

    //Afficher la flèche descendre de tous les activés, sauf le dernier
    liste.children('.afficher.action-descendre').show().last().hide();

}

Groupe.prototype.suivant = function(){
    
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

Groupe.prototype.precedant = function(){
    
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

Groupe.prototype.echangerOrdre = function(autre){
    
    //Échanger l'ordre des deux groupes
    var ordre = this.ordre;
    this.definirOrdre(autre.ordre);
    autre.definirOrdre(ordre);
    
    this.obtenirArbo().trierGroupes(this.parent);
    
}

Groupe.prototype.definirOrdre = function(ordre){
    this.ordre = ordre;
    this.getOrdreInput().val(ordre);
}

Groupe.prototype.getOrdreInput = function(){
    return $(document.getElementById('GO' + this.no));

}

Groupe.prototype.afficher = function() {
    
    var arbo = this.obtenirArbo();
    
    arbo.ecrire('<li id="' + this.id + '">'
    + '<input type="checkbox" class="expander" data-expander-pour-id="' + this.id + '"><span class="expander"></span>');
    this.afficherAttributs();
    if (this.url) {

        arbo.ecrire('<a href="' + this.url + '" title="Modifier le groupe" class="lien-groupe">');
    }
    arbo.ecrire('<span id="libelle_' + this.id + '" class="libelle libelle-groupe">' + this.libelle + '</span>');
    if (this.url) {
        
        arbo.ecrire('</a>');
    }
    
    if(this.obtenirArbo().estEnModeEdition()){
            
        //Icône d'édition
        arbo.ecrire(['<span class="glyphicon glyphicon-edit action modifier-titre" data-id="', this.id, '" title="Modifier le Mf layer meta title"></span>'
        , '<input type="hidden" data-utilite="titre" class="input-titre" name="GT', this.no, '" id="GT', this.no, '" value="' , this.libelle , '">'
        , '<span class="glyphicon glyphicon-arrow-up action action-monter" data-id="' , this.id , '" title="Monter"></span>'
        , '<span class="glyphicon glyphicon-arrow-down action action-descendre" data-id="' , this.id , '"  title="Descendre"></span>'
        , '<span class="glyphicon glyphicon-resize-vertical action action-deplacer" data-id="' + this.id , '"  title="Glisser/déposer vers le haut/bas"></span>'
        , '<input type="hidden" data-utilite="ordre" class="input-ordre" name="GO' , this.no , '" id="GO' , this.no , '" value="' , this.ordre , '">'].join(''));
    }
        
    if (this.nbEnfants > 0) {
        arbo.ecrire('<ul class="css-treeview">');
        for (id in this.enfants) {
            this.enfants[id].afficher();
        }
        arbo.ecrire('</ul>');
    }
    arbo.ecrire('</li>');
}

Groupe.prototype.afficherAttributs = function() {

    var attribut, checked, id, title, name;
    var arbo = this.obtenirArbo();
    
    for (nomAttribut in this.obtenirAttributs()) {
        attribut = this.obtenirAttribut(nomAttribut);
        checked = '';
        id = this.id + '_' + nomAttribut;
        title = attribut.getTitle();
        name = 'G' + attribut.getSeparateur() + this.no;
        
        if (attribut.estCoche()) {
            checked = 'checked';
        }
        
        arbo.ecrire(['<span class="wrap wrap-', nomAttribut , '">'
       , '<input type="hidden" name="', name, '" value="0">'
       , '<input type="checkbox" id="', id, '" name="', name, '" data-id="', this.id, '" data-attribut="', nomAttribut, '" class="check ', nomAttribut, '"', checked, ' value="1">'
       , '<label for="', id, '" title="', title, '" data-toggle="tooltip" data-placement="top"></label>'
       , '</span>'].join(''));
       
    }
}

/**
 * Indique si tous les enfants directs (groupes ou couches) d'un 
 * groupe sont cochés, complets ou exclus, pour un attribut donné
 * @param string nomAttribut Nom de l'attribut à vérifier
 */
Groupe.prototype.enfantsDirectsTousCochesOuCompletOuExclu = function(nomAttribut) {

    if (this.nbEnfants > 0) {

        var element;
        var attribut;
        for (id in this.enfants) {

            element = this.enfants[id];
            attribut = element.obtenirAttribut(nomAttribut);
            
            //N'est pas coché ou complet
            if (!(attribut.estCoche() || attribut.estComplet() || attribut.estExclu()) ) {
                return false;
            }
        }
    }
    return true;
}

Groupe.prototype.auMoinsUnEnfantExclu = function(nomAttribut){
    
    if (this.nbEnfants > 0) {

        var element;
        var attribut;
        for (id in this.enfants) {

            element = this.enfants[id];
            attribut = element.obtenirAttribut(nomAttribut);
            
            //N'est pas coché ou complet
            if (attribut.estExclu()) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Indique si tous les enfants directs (groupes ou couches) d'un 
 * groupe sont coché, pour un attribut donné
 * @param string nomAttribut Nom de l'attribut à vérifier
 */
Groupe.prototype.enfantCochePartiel = function(nomAttribut) {

    if (this.nbEnfants > 0) {
        
        var element;
        for (id in this.enfants) {

            element = this.enfants[id];
            if (element.obtenirAttribut(nomAttribut).estCoche() || element.obtenirAttribut(nomAttribut).estComplet() || element.obtenirAttribut(nomAttribut).estPartiel()) {
                return true;
            }
           
        }
    }
    return false;
}

/**
 * S'assurer que l'ordre du groupe n'est pas déjà utilisé par un autre
 * @returns {undefined}
 */
Groupe.prototype.ajusterOrdre = function(){
    
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

Groupe.prototype.ordreDejaUtilise = function(){

    for(cle in this.parent.enfants){
        if(this.ordre == this.parent.enfants[cle]){
            return true;
        }
    }
    return false;
}

Groupe.prototype.ordreMax = function(){
    
    var max = 1;
    var enfants = this.parent.enfants;
    for(cle in enfants){
        if(enfants[cle].ordre > max){
            max = enfants[cle].ordre;
        }
    }
    return max;
}

//Indique si le terme est contenu dans l'iten ou dans un des enfants
Groupe.prototype.contientLeTerme = function(terme) {
    var contient = indexOfRegExp(this.libelle, terme);

    if (!contient) {

        if (this.nbEnfants > 0) {

            //Vérifier dans les enfants
            for (idEnfant in this.enfants) {
                contient = this.enfants[idEnfant].contientLeTerme(terme);

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
Groupe.prototype.majEtatOutilsEdition = function(){
    
    var arbo = this.obtenirArbo();
    
    if(arbo.estEnModeEdition()){
        
        var id = this.id;
        var activer = this.attributs.nbAttributsActives() > 0;
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
            
        }
        
        item.children('#GT' + this.no).val(libelle);
        item.children('#GO' + this.no).val(ordre);
        
    }
}

Groupe.prototype.estALaRacine = function(){
    
    return this.parent.estArbo();
}

Groupe.prototype.estCouche = function(){
    return false;
}

Groupe.prototype.estGroupe = function(){
    return true;
}

Groupe.prototype.estArbo = function(){
    return false;
}

/**
 * Retourne une référence sur l'arbo qui contient le groupe
 */
Groupe.prototype.obtenirArbo = function(){
    
    return this.parent ? this.parent.obtenirArbo() : '';
}
