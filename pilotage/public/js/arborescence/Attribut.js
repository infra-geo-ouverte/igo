/**
 * Classe Attribut représente un attribut de Groupe ou de Couche. Un attribut 
 * désigne l'état de la couche, soit visible, actif, lecture, écriture, export, 
 * etc. Le constructeur est généralement appelé par la classe Attributs.
 */

/**
 * 
 * @param string nomAttribut Nom de l'attribut (ex : "lecture", "analyse", "ecriture", "export", "association"
 * @param bool checked
 * @param bool association L'utilisateur à le droit d'associer (cocher/décocher) cet attribut
 * @returns {Attribut}
 */
function Attribut(nomAttribut, checked, association) {
    
    this.nomAttribut = nomAttribut;
    this.etat = checked ? 'coche' : 'decoche';
    this.association = association;

}

Attribut.prototype.id = '';
Attribut.prototype.parent = ''; //Défini lors de Attributs.ajouterAttribut()
Attribut.prototype.reference = undefined; //référence jQuery

Attribut.prototype.getClassName = function(){
    return 'Attribut';
}

/**
 * 
 * @param {type} etatDuParent "coche", "decoche", "exclu", "partiel" ou "complet"
 */
Attribut.prototype.init = function(etatDuParent){
    
    if(!this.association){

        document.getElementById(this.obtenirId()).setAttribute('disabled', true);
    }

    //La parent est coché
    if (etatDuParent == "coche"){
       
        //L'enfant est exclu
        if(this.nomAttribut == "visible" && this.etat == "decoche" && this.obtenirArbo().estEnModeEdition()){
            
            this.etat = 'exclu';
            this.parent.parent.majClasse();
        }else{
         
            this.etat = 'coche';
        }
      
    //Le parent est exclu
    }else if(etatDuParent == 'exclu' && this.nomAttribut == "visible" && this.obtenirArbo().estEnModeEdition()){
        this.etat = 'exclu';
        this.parent.parent.majClasse();
    }
    
    if(this.estUnAttributDeGroupe()){
        
        //Stocker l'état de l'attributs de tous les enfants(récursivement)
        var etatDesAttributsDesEnfants = [];      
        var enfants = this.parent.parent.enfants;
        for(indiceEnfant in enfants){

            //Initialiser l'attribur enfant et récupérer son résultat
            etatDesAttributsDesEnfants.push(enfants[indiceEnfant].obtenirAttribut(this.nomAttribut).init(this.etat));
        }

        //L'attribut n'est pas coché
        if(!this.estCoche() && !this.estExclu()){

            //Déterminer son état en fonction de celui de ses enfants
            var nbTotal = etatDesAttributsDesEnfants.length;
            var nbCoche = 0;
            var nbPartiel = 0;

            var etat;
            for(ind = 0; ind < nbTotal ; ind++){
                etat = etatDesAttributsDesEnfants[ind];
                if(etat == "coche" || etat == "complet"){
                    nbCoche++;
                }else if(etat == "partiel"){
                    nbPartiel++;
                }

            }
            
            if(nbTotal == nbCoche){
                 this.etat = 'complet';
            }else if(nbCoche > 0 || nbPartiel > 0){
                 this.etat = 'partiel';
            }else{
                 this.etat = 'decoche';

            }
        }
    }
   
    this.majAffichageAttribut();
    return this.etat;
}

/**
 * Récupère une référence jQuery sur l'attribut
 */
Attribut.prototype.obtenirReference = function(){
    if(this.reference == undefined){
       this.reference = $(document.getElementById(this.obtenirId()));
    }
    return this.reference;
}

Attribut.prototype.obtenirId = function(){
    
    if(!this.id){
        this.id = this.parent.parent.id + '_' + this.nomAttribut;
    }
    return this.id;
}

/**
 * Indique si le parent ayant le même attribut est coché
 * @returns {undefined}
 */
Attribut.prototype.parentEstCoche = function(){
    
    //Il n'y a pas de parent
    if(this.parent.parent.parent.estArbo()){
        return false;
    }
    return this.parent.parent.parent.obtenirAttribut(this.nomAttribut).estCoche();
}
 
/*
 * Gère le click sur un attribut
 */
Attribut.prototype.click = function() {
    
    var arbo = this.obtenirArbo();
    
    //Indiquer qu'une modification non enregistrée à été faite
    arbo.estModifie = true;
    
    //Détacher du DOM le temps de faire les mises à jour
    var arboTempo = $(document.getElementById(arbo.id)).detach();
    
    switch(this.etat){

        case 'coche':
            
            //On a cliqué sur l'attribut "visible", on n'est pas à la racine, le parent est coché et il a au moins 2 enfants
            if(this.nomAttribut == 'visible' && this.parentEstCoche() && this.parent.parent.parent.nbEnfants > 1){ 
                this.exclure();
                
            //L'attribut était exclu
            }else{
                
                this.deExclure();
            }
            break;
        
        //L'attribut n'était pas coché ou exclu
        case 'decoche':
        case 'partiel':
        case 'complet':
            this.etat = 'coche';
            break;
        
        case 'exclu':
            if(this.parentEstCoche()){
                this.deExclure();
                this.etat = 'coche';
            }else{
                this.deExcluACoche();
            }
            
            break;
    }
    
    this.parent.parent.majClasse();
    
    this.majAffichageAttribut();
    this.parent.parent.majEtatOutilsEdition();
    
    this.changerEtatEnfants();
    this.changerEtatParents();
    
    //Ratacher l'arbo du DOM à la fin des maj
    arboTempo.appendTo('#conteneur-arborescence');

}

/**
 * Met à jour le style d'un attribut en fonction de son état
 * @returns {undefined}
 */
Attribut.prototype.majAffichageAttribut = function(){

    var estArboPermission = (this.obtenirArbo().params.estArboPermission && this.obtenirArbo().params.estArboPermission == true);
    var cch = this.obtenirReference();
    cch.removeClass('check-coche')
            .removeClass('check-decoche')
            .removeClass('check-partiel')
            .removeClass('check-partiel-gris')
            .removeClass('check-complet')
            .removeClass('check-complet-gris')
            .removeClass('check-exclu');
    
    switch(this.etat){
        case 'coche':
            cch.addClass('check-coche').prop('checked', true);

            break;
        case 'decoche':
            cch.addClass('check-decoche').prop('checked', false);

            break;
        case 'partiel':
            cch.addClass('check-partiel');
            if(!estArboPermission && this.parent.parent.estGroupeDeGroupe()){
                cch.addClass('check-partiel-gris');    
            }
            break;
        case 'complet':
            cch.addClass('check-complet');
            if(!estArboPermission && this.parent.parent.estGroupeDeGroupe()){
                cch.addClass('check-complet-gris');    
            }
            break;
        case 'exclu':
            cch.addClass('check-exclu');
            
            if(this.parent.parent.estCouche()){
                this.parent.parent.decocherColonnes();
            }
            break;
    }

}

/**
 * Fait changer l'état de l'attribut du même type, pour les groupes et couches enfants
 * @param bool checked État du parent original qui déclenche le changement
 * @returns {undefined}
 */
Attribut.prototype.changerEtatEnfants = function(){
    
    var conteneurParent = this.parent.parent;
    if(conteneurParent.nbEnfants == 0){
        return;
    }

    if (conteneurParent.estGroupe()){
        
        var enfant, attributEnfant, attributEnfantInput;
        
        var enfants = conteneurParent.enfants;
        for(id in enfants){
            
            enfant = enfants[id];
            
            //Attribut correspondant dans l'enfant
            attributEnfant = enfant.obtenirAttribut(this.nomAttribut);
            attributEnfantInput = attributEnfant.obtenirReference();

            if(this.estDecoche()){
                attributEnfantInput.removeClass("parent-est-coche").prop('checked', false);
                attributEnfant.etat = 'decoche';
            }else if(this.estExclu()){
                attributEnfantInput.removeClass("parent-est-coche").prop('checked', false);
                
            }else{
                attributEnfantInput.addClass("parent-est-coche").prop('checked', true);
                attributEnfant.etat = 'coche';
            }
            
            attributEnfant.majAffichageAttribut();
            attributEnfant.changerEtatEnfants();
           
        }
       
    //On est dans une couche
    }else{
        
        if(this.estDecoche()){
            conteneurParent.decocherColonnes();
          
        }
    }
    
    conteneurParent.majEtatOutilsEdition();
    
    conteneurParent.parent.majOrdre();
    conteneurParent.parent.rafraichirFleches();

}

/**
 * Coche l'élément parent si vous ses enfants sont coché
 * Attention : le parent direct est un groupe ou une couche, ici on s'intéresse 
 * au "grand-parent"
 */
Attribut.prototype.changerEtatParents = function (){

    //Récupérer le groupe parent de l'attribut
    var parent = this.parent.parent.parent;
    
    //Il n'y a pas de groupe ou couche parent
    if(parent.estArbo()){
        return;
    }
    
    if(this.obtenirReference().prop('disabled')){
        return;
    }
   
    //Récupérer l'attribut dans le groupe parent
    var parentAttribut = parent.obtenirAttribut(this.nomAttribut);
   
    //S'assurer que l'utilisateur a les permissions nécessaires
    if(!parentAttribut.association){
        
        return;
    }
    
    //L'attribut est maintenant exclu, il était donc coché auparavant, et tous les enfants de sont parent ne sont pas décoché
    if(this.estExclu() && parent.enfantsDirectsTousCochesOuCompletOuExclu(this.nomAttribut)){
        //Ne pas modifier l'état du parent
        
    //On vient de cocher un élément dont le parent est exclu
    }else if(parentAttribut.estExclu() && this.estCoche()){
        
       //marquer le parent comme coché
        parentAttribut.etat = 'coche';
        parentAttribut.parent.parent.majClasse();
        parentAttribut.parent.parent.majEtatOutilsEdition();
        
    }else if(parent.auMoinsUnEnfantExclu(this.nomAttribut)){
        //Ne pas modifier l'état du parent
    
    }else if(parentAttribut.etat == 'coche' && parent.enfantsDirectsTousCochesOuCompletOuExclu(this.nomAttribut)){
        
        //Ne pas modifier l'état du parent
        
    //Tous les enfants ayant le même attribut sont coché
    }else if(parent.enfantsDirectsTousCochesOuCompletOuExclu(this.nomAttribut)){

        //Mettre le parent à l'état "tous les enfants sont cochés"
        parentAttribut.etat = 'complet';

    //Au moins un enfant ayant le même attribut est coché
    }else if(parent.enfantCochePartiel(this.nomAttribut)){

        parentAttribut.etat = 'partiel';
      
    //Aucun enfant coché
    }else{
       
        parentAttribut.etat = 'decoche';
    }
    
    parentAttribut.obtenirReference().prop('checked', false);
    
    parentAttribut.majAffichageAttribut();
    parent.majEtatOutilsEdition();
    parent.rafraichirFleches();
    parentAttribut.changerEtatParents();
    
    parent.majOrdre();
    
}

/**
 * @return string Libellé associé à l'attribut
 */
Attribut.prototype.getTitle = function() {
    var title = '';
    switch (this.nomAttribut) {
        case 'visible':
            title = 'Visible';
            break;
        case 'active':
            title = 'Actif';
            break;
        case 'lecture':
            title = 'Lecture';
            break;
        case 'analyse':
            title = 'Analyse';
            break;
        case 'ecriture':
            title = 'Écriture';
            break;
        case 'export':
            title = 'Export';
            break;
        case 'association':
            title = 'Association';
        default:
            break;
    }
    return title;

}

/**
 * 
 * @returns string Séparateur associé au nom de l'attribut
 */
Attribut.prototype.getSeparateur = function() {
    var separateur = '';
    switch (this.nomAttribut) {
        case 'visible':
            separateur = 'V';
            break;
        case 'active':
            separateur = 'A';
            break;
        case 'lecture':
            separateur = 'L';
            break;
        case 'analyse':
            separateur = 'A';
            break;
        case 'ecriture':
            separateur = 'E';
            break;
        case 'export':
            separateur = 'P';
            break;
        case 'association':
            separateur = 'S';
            break;
        default:
            break;
    }
    return separateur;

}

/**
 * Exclu l'attribut et réperture sur les enfants de son groupe/couche
 */
Attribut.prototype.exclure = function(){

    this.etat = 'exclu';
    this.majAffichageAttribut();
    this.parent.parent.majClasse();
    
    //Répercuter l'exclusion jusqu'aux couches
    var parent = this.parent.parent;
    if(parent.estGroupe()){
        var enfants = parent.enfants;
        for(id in enfants){

            enfants[id].obtenirAttribut(this.nomAttribut).exclure();

        }
    }
}

/**
 * Fait passer l'état de exclu à coché
 */
Attribut.prototype.deExcluACoche = function(){
    
    this.etat = 'coche';
    this.majAffichageAttribut();
    this.parent.parent.majClasse();
    
    //Répercuter la déexclusion à tous les enfants
    var parent = this.parent.parent;
    if(parent.estGroupe()){
        var enfants = parent.enfants;
        for(id in enfants){

            enfants[id].obtenirAttribut(this.nomAttribut).deExcluACoche();

        }
    }
}

Attribut.prototype.deExclure = function(){
    this.etat = 'decoche';
    this.parent.parent.obtenirReference().find('li.exclu').removeClass('exclu');
}

//L'item est bien coché
Attribut.prototype.estCoche = function(){
    return this.etat == 'coche';
}

//L'item n'est pas coché
Attribut.prototype.estDecoche = function(){
    return this.etat == 'decoche';
}

//Au moins un enfant de cet item est coché, intermédiaire ou complet
Attribut.prototype.estPartiel = function(){
    return this.etat == 'partiel';
}

//Tous les enfants de cet item sont cochés, itermédiaires ou complets
Attribut.prototype.estComplet = function(){
    return this.etat == 'complet';
}

//L'item est exclu
Attribut.prototype.estExclu = function(){
    return this.etat == 'exclu';
}

Attribut.prototype.estCommun = function(){
    return this.commun;
}

Attribut.prototype.estUnAttributDeGroupe = function(){
    
    return (this.parent.parent.estGroupe());
}

/**
 * Retourne une référence sur l'arbo qui contient l'attribut
 */
Attribut.prototype.obtenirArbo = function(){
    
    return this.parent ? this.parent.obtenirArbo() : '';
}
