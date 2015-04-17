/**
 *
 */

/**
 * @params objet {
 *      edition:bool //Activer les foncticl
 * @returns {Arborescence}
 */
function Arborescence(params) {

    var defaults = {
        edition:false
    };

    this.params  = $.extend( {}, defaults, params );

    this.enfants = {};

    this.contenuAAfficher = [];

    this.groupes = new ListeElement();
    this.couches = new ListeElement();
    this.attributs = new ListeElement();
    this.colonnes = new ListeElement();

}

Arborescence.prototype.id = 'arborescence';
Arborescence.prototype.nbEnfants = 0;
Arborescence.prototype.estModifie = false;
Arborescence.prototype.reference = undefined;

/*
 * Initialise le contenu de l'arborescence et l'affichage
 */
Arborescence.prototype.init = function (){

    var enfants = this.obtenirElements();

    //Initialisation des attributs dans tout l'arbre
    for(indiceEnfant in enfants){
        this.enfants[indiceEnfant].attributs.init();

    }

    //Initialisation des groupes à la racine de l'arborescence
    for(cle in enfants){

        enfants[cle].init();

    }

    if(this.estEnModeEdition()){

        //S'assurer que l'ordre d'affichage corresponde à ce qu'on a dans la BD
        this.trier();

        //Réinitialiser l'Ordre
        this.majOrdre();

        var _modifierTitreClick = function(params){

            params.data.arbo.estModifie = true;

            var id = this.getAttribute('data-id');
            var item = params.data.arbo.obtenirElementAmeliore(id);

            var nouveauLibelle = prompt('Entrer le nouveau nom', item.libelle);

            if(null != nouveauLibelle && '' != nouveauLibelle){

                item.definirLibelle(nouveauLibelle);

            }

        };
        
        //Click sur le bouton modifier le titre des groupes et des couches
        this.obtenirReference().find('.modifier-titre').on("click", null, {arbo:this}, _modifierTitreClick);

        var _monterClick = function(params){

            params.data.arbo.estModifie = true;

            var id = this.getAttribute('data-id');
            var item = params.data.arbo.obtenirElementAmeliore(id);

            //Inverser l'ordre avec le précécent si possible
            var itemPrecedant = item.precedant();
            if(itemPrecedant){
                item.echangerOrdre(itemPrecedant);
            }

        };
        
        //Click sur le bouton monter des groupes et des couches
        this.obtenirReference().find('.action-monter').on("click", null, {arbo:this}, _monterClick);

        var _descendreClick = function(params){

            params.data.arbo.estModifie = true;

            //Récupérer l'objet correspondant à l'item
            var id = $(this).attr('data-id');
            var item = params.data.arbo.obtenirElementAmeliore(id);

            //Inverser l'ordre avec le suivant si possible
            var itemSuivant = item.suivant();
            if(itemSuivant){
                item.echangerOrdre(itemSuivant);
            }

        };
        
        //Click sur le bouton descendre des groupes et des couches
        this.obtenirReference().find('.action-descendre').on("click", null, {arbo:this}, _descendreClick);

        //Décaller l'activation du tri pour accélérer l'affichage initial
        setTimeout(function(that){
            //Activer le tri glisser/déposer des groupes à la racine de l'arborescence
            that.obtenirReference().children('ul').sortable({
                 placeholder: "ui-state-highlight",
                 axis:'y',
                 connectWith:'> ul',
                 items: "> li:has(.afficher)",
                 cancel:"> li:not(:has(.afficher))",
                 cursor:"n-resize",
                 handle:'.action-deplacer',
                 update:$.proxy(function(event, ui){

                     this.estModifie = true;
                     this.majOrdre();
                     this.trier();
                 }, that)
            });
        },0,this);
      

    }
    
    function _click(params){
           
        var that = this;
        Arborescence.debutPatienter();
        //Déclencher le click de l'objet correspondant
        setTimeout(function(){
            
            params.data.arbo.clickElement(that.id);
            Arborescence.finPatienter();
        }, 0);
    }
    
    //Gestion du click sur les attributs et initialisation des tooltips
    this.obtenirReference().find('input.check:not(.expander)').on("click", null, {arbo:this},  _click).tooltip();

    this.obtenirReference().find('.action, .lien-groupe, .lien-couche, label').tooltip();
    
    $(window).on("beforeunload", null, {arbo:this}, function(params){

        if(params.data.arbo.estModifie){
            return 'Des modifications sont non enregistrées. Si vous quittez cette page, ces modifications seront perdues.';

        }

    });

    $('#enregistrer').on("click", null, {arbo:this}, function(){
       //Désactiver la vérification "Est-ce qu'on va perdre des données si on quitte la page"
       arbo.estModifie = false;
    });
    
}

/**
 * Déclenche l'affichage du contenu de l'arborescence
 */
Arborescence.prototype.afficher = function(){
     
    //Faire générer le HMTL requis
    this.ecrire('<ul class="css-treeview">');
    for(id in this.enfants){
        this.enfants[id].afficher();
    }
    this.ecrire('</ul>');

    //Afficher l'arborescence dans la page
    this.obtenirReference().html(this.contenuAAfficher.join('\n'));
    this.contenuAAfficher = [];

    this.init();

}

/**
 * Le mode édition permet d'activer l'édition du libellé d'un groupe/couche et
 * de changer leur ordre dans l'arborescence
 * @returns bool
 */
Arborescence.prototype.estEnModeEdition = function(){

    return this.params.edition;
}

Arborescence.prototype.getClassName = function(){

    return 'Arborescence';
}

/**
 * Met à jour l'ordre des groupes enfants en se basant sur leur ordre dans le DOM
 */
Arborescence.prototype.majOrdre = function(){

    this.obtenirReference().find(' > ul > li').each($.proxy(Arborescence._majOrdre, this));
  
}

Arborescence._majOrdre = function(index, valeur){
    if($(valeur).has('.check-coche, .check-complet, .check-partiel')){
        var item = this.obtenirElementAmeliore(valeur.id);
        item.definirOrdre(index + 1);
    }else{
        item.definirOrdre(0);
    };
}

Arborescence.prototype.obtenirElements = function() {
    return this.enfants;
}

//TODO Mettre un vrai commentaire pour cette fonction
Arborescence.prototype.clickElement = function(idElement) {
    
    //On a cliqué une colonne
    if(idElement.substring(0,7) == "colonne"){
        var colonne = this.obtenirElementAmeliore(idElement);

        //Permuter l'état de la colonne sur laquelle on a cliqué
        colonne.click();
        if(this.obtenirArbo().params.estArboPermission && this.obtenirArbo().params.estArboPermission == true){
            colonne.majEtatColonnesAvecLeMemeId();
        }
        return;
    }

    this._clickElement(this.enfants, idElement);

}

//TODO Mettre un commentaire pour cette fonction
Arborescence.prototype._clickElement = function(elements, idElement) {
    var element;

    for (id in elements) {
        element = elements[id];

        //On a trouvé l'élément cherché
        if (element.id == idElement) {
             element.click();
             return true;
        }

        //Chercher dans les enfants si possible
        if(element.nbEnfants > 0) {

            //Chercher parmis les enfants
             if (this._clickElement(element.enfants, idElement)){
                return true;
             }
        }

        //Chercher dans les attributs si possible (c'est un groupe ou une couche)
        if(element.attributs && element.attributs.nbAttributs > 0) {

            var spl = idElement.split('_');
            var type_attribut; //attribur de couche ou de groupe spl0
            var nomAttribut = spl[spl.length-1];
            var attribut = element.obtenirAttribut(nomAttribut);
            if(!attribut){
                continue;
            }

            var elementSousId = spl.shift() + spl.shift() + '_' + spl.pop();

            var estArboPermission = (this.obtenirArbo().params.estArboPermission && this.obtenirArbo().params.estArboPermission == true);

            spl = attribut.obtenirId().split('_');
            type_attribut = spl.shift();

            //On est dans l'arbo des permission et c'est un attribut de couche qu'on a cliqué
            if(estArboPermission && attribut.parent.parent.estCouche() ){

                //L'attribut correspond (ou est le double) de celui qu'on a cliqué
                if(type_attribut + spl.shift() + '_' + spl.pop() == elementSousId){

                    attribut.click();

                }
            } else if (attribut.obtenirId() == idElement) {
                    attribut.click();
                    return true;

            }

        }
    }
}

/**
 * Trouver un élément groupe ou couche
 * @param object groupe ou couche
 * @param string id de l'élément à trouver
 */
Arborescence.prototype.obtenirElement = function(idElement) {

    return this._obtenirElement(this.enfants, idElement);

}

Arborescence.prototype.obtenirElementAmeliore = function(idElement){

    //Déterminer à quoi on a affaire
    var typeElement = '';
    if(idElement.substring(0,7) == "colonne"){
        typeElement = 'colonne';
    }else if(idElement.substring(0,6) == "couche"){
        typeElement = 'couche';

    }else if(idElement.substring(0,6) == "groupe"){
        typeElement = 'groupe';
    }else{
        alert("C'est un attribut?");
    }

    switch(typeElement){
        case 'colonne':
            return this.obtenirColonne(idElement);
        case 'couche':
            return this.obtenirCouche(idElement);
        case 'groupe':
            return this.obtenirGroupe(idElement);
        case 'attribut':
            return this.obtenirAttribut(idElement);
        default:
            break;
    }
    
    return false;

}

Arborescence.prototype.obtenirColonne = function(id){
    return this.colonnes.obtenirElement(id);
}


Arborescence.prototype.obtenirCouche = function(id){
    return this.couches.obtenirElement(id);
}

Arborescence.prototype.obtenirGroupe = function(id){
    return this.groupes.obtenirElement(id);

}

Arborescence.prototype.obtenirAttribut = function(id){
    return this.attributs.obtenirElement(id);
}

/*
 * Récupère une référence sur un élément
 * @param object elements Éléments à fouiller
 * @param string idElement Id de l'élément qu'on cherche
 */
Arborescence.prototype._obtenirElement = function(elements, idElement) {

    var elementTrouve = false;
    var element;
    for (id in elements) {
        element = elements[id];

        //On a trouvé l'élément cherché
        if (element.id == idElement) {
            return element;
        }

        //Chercher dans les enfants si possible
        if(element.nbEnfants > 0) {

            //Chercher parmis les enfants
            elementTrouve = this._obtenirElement(element.enfants, idElement);

        }

        //Chercher dans les attributs si possible
        if(!elementTrouve && element.attributs && element.attributs.nbAttributs > 0) {

            //Chercher parmis les attributs
            var attributs = element.attributs.attributs;
            var attribut;
            for(nomAttribut in attributs){
                attribut = attributs[nomAttribut];
                if(attribut.obtenirId() == idElement){
                    elementTrouve = attribut;
                }
            }
        }

        if (elementTrouve) {
            return elementTrouve;
        }
    }

    //on a pas trouvé l'élément
    return elementTrouve;

}

Arborescence.prototype.ajouterGroupe = function(groupe) {

    groupe.parent = this;
    this.enfants[groupe.id] = groupe;
    this.nbEnfants++;

    groupe.ajusterOrdre();

    this.groupes.ajouterElement(groupe);
    
    this.ajouterAttributsALaListe(groupe.obtenirAttributs());

}

Arborescence.prototype.ajouterAttributsALaListe = function(attributs){
    for(ind in attributs){
        this.attributs.ajouterElement(attributs[ind]);
    }
}

Arborescence.prototype.ordreMax = function(){

    var max = 1;
    var enfant;
    //parcourir le parent et trouver le ordre max
    for(cle in this.enfants){
        enfant = this.enfants[cle];
        if(enfant.ordre > max){
            max = enfant.ordre;
        }
    }
    return max;
}

/**
 * Ajuster l'affichage des flêches monter/descendre
 */
Arborescence.prototype.rafraichirFleches = function(){

    var liste = this.obtenirReference().find(' > ul > li');

    //Cacher les flèches des items non activées
    liste.children('.masquer.action-monter').hide();
    liste.children('.masquer.action-descendre').hide();
    liste.children('.masquer.action-deplacer').hide();

    //Afficher la flèche monter de tous les activés, sauf le premier
    liste.children('.afficher.action-monter').show().first().hide();

    //Afficher la flèche descendre de tous les activés, sauf le dernier
    liste.children('.afficher.action-descendre').show().last().hide();

    liste.children('.afficher.action-deplacer').show();

}

/**
 * Tri les items en fonction de la valeur de leur ordre
 */
Arborescence.prototype.fonctionDeTri = function(a, b){

    //Les items ayant un ordre "0" sont envoyé en fin de liste
    var valeurA = parseInt($(a).children('.input-ordre').val());
    if(valeurA == 0){
        return 1;
    }
    var valeurB = parseInt($(b).children('.input-ordre').val());
    if(valeurB == 0){
        return -1;
    }

    //Trier en ordre croisant
    return valeurA - valeurB;
}

Arborescence.prototype.trier = function(){
    this.trierGroupes(this);
}

/**
 * Trier les groupes
 * @param Groupe item Groupe de couches à trier
 */
Arborescence.prototype.trierGroupes = function(item){

    var parent, liste;

    if(item.estArbo()){
        parent = this.obtenirReference().children('ul');
    }else{
        parent = this.obtenirReference().find('#' + item.id).children('ul');
    }
    liste = parent.children('li');

    liste.sort(this.fonctionDeTri);

    liste.appendTo(parent);
    item.rafraichirFleches();

}

/**
 * Tri les couches
 * @param Groupe item Groupe de couches
 */
Arborescence.prototype.trierCouches = function(item){

    var parent = this.obtenirReference().find('#' + item.id).children('ul');
    var liste = parent.children('li');

    liste.sort(this.fonctionDeTri);

    liste.appendTo(parent);
    item.rafraichirFleches();
}

Arborescence.prototype.estGroupe = function(){
    return false;
}

Arborescence.prototype.estArbo = function(){
    return true;
}

Arborescence.prototype.obtenirArbo = function(){

    return this;
}

/**
 * Récupère une référence jQuery sur l'arborescence
 * @returns
 */
Arborescence.prototype.obtenirReference = function(){
    if(this.reference == undefined){
        this.reference = $(document.getElementById(this.id));
    }
    return this.reference;
}

/**
 * Ajoute du contenu au HTML qui va construire l'arborescence
 */
Arborescence.prototype.ecrire = function(texte){
    this.contenuAAfficher.push(texte);
}

/**
 * Tous les champs contenus dans l'arborescence
 * @returns {undefined}
 */
Arborescence.prototype.getJSON = function(){

    //Générer un ordre de tri total pour toutes les couches et les groupes
    this.obtenirReference().find('li').has('.check-coche, .check-complet, .check-partiel, .check-exclu').each($.proxy(function(index, valeur){

        var item = this.obtenirElementAmeliore(valeur.id);
        item.definirOrdre(index + 1);
    }, this));

    var data = {};
    this.obtenirReference().find('input[name]').each($.proxy(function(index, element){

        //Dans le formulaire, pour le même name, on a un input[type=checkbox]
        //avec un value à 0 et un autre à 1. Si aucun est coché, on veut que la
        //valeur soit 0. Si celui qui a value=1 est coché, on veut 1.

        //C'est le cch par défaut, ou la cch de l'attribut est cochée
        if(element.value == 0 || (element.checked)){
            data[element.name] = element.value;
        }

        //Inclure l'élément titre et ordre au besoin
        if(this.estEnModeEdition()){
            
            var utilite = element.getAttribute('data-utilite');
            if(('ordre' == utilite || 'titre' == utilite)){

                data[element.name] = element.value;

            }

        }

    }, this));

    return JSON.stringify(data);

}

Arborescence.debutPatienter = function(){
    $('body').addClass('wait');
    
}

Arborescence.finPatienter = function(){
    $('body').removeClass('wait');
}