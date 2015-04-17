/**
 * Gère le comportement et l'affichage de l'outil css-treeview.
 */

/**
* Ouvrir toute l'arboresence
* @returns {undefined}
*/
function ouvrirArborescence(){
    var terme = $('#terme').val();

    _ouvrirArborescence(arbo.obtenirElements(), terme);

    return false;

}

/**
* 
* @param {type} items Items à parcourir
* @param {type} terme Terme à considérer
*/
function _ouvrirArborescence(items, terme){

    var item;
    for(cle in items){
        item = items[cle];
        if(doitEtreOuvert(item, terme)){
            ouvrirItem(item);
        }
        //si a des enfants
        if(item.nbEnfants > 0){
            _ouvrirArborescence(item.enfants, terme);
        } 
    }
}

/**
* Ouvrir les items cochés de l'arborescence
*/
function ouvrirArborescenceCoche(){

    var items = arbo.obtenirElements();
    _ouvrirArborescenceCoche(items);

}

/**
* Ouvrir les items cochés de l'arborescence
* @param {type} items Items à parcourir
*/
function _ouvrirArborescenceCoche(items){
    
    var item;
    for(cle in items){
        item = items[cle];
       
        //C'est un groupe ou une couche, et l'item est coché ou bien un enfant est coché
        if(item.attributs && item.attributs.nbAttributsActives() > 0){
            ouvrirItem(item);
        }
        
        //si a des enfants
        if(item.nbEnfants > 0){
            _ouvrirArborescenceCoche(item.enfants);
        } 
    }
}

/**
 * TODO Remplacer par une fonction ouvrirParent() ?
 * Ouvre le dossier et ouvre tous les ancêtres
 * @param jQuery item Item à ouvrir
 */
function ouvrirItem(item){

    //TODO Remplacer par item.ouvrir(), soir Couche.ouvrir() et Groupe.ouvrir() ??
    //ouvrir l'item
    $('#arborescence input[data-expander-pour-id="' + item.id + '"]').prop('checked', 'checked');

    if(item.parent && item.parent.estArbo()){
        ouvrirItem(item.parent);
    }
}

/**
 * Fermer toute l'arborescence
 */
function fermerArborescence(){
    $('#arborescence .expander').each(function(){
        $(this).prop('checked', false);
    });

}

function selectionnerCommun(){
    _selectionnerCommun(arbo.obtenirElements());

    return false;
}

function _selectionnerCommun(items){
    var item;
    var commune;
    for(cle in items){
        item = items[cle];
        commune = item.attributs.obtenirAttribut('commune');
        if(commune && commune.estCoche()){
            selectionnerItem(item);
        }
        //si a des enfants
         if(item.nbEnfants > 0 && item.estGroupe()){
             _selectionnerCommun(item.enfants);
         } 
    }
}

function selectionnerItem(item){
    //ouvrir l'item
    $('#' + item.id + '_visible').click();
    if(item.parent){
        ouvrirItem(item.parent);
    }
}

/**
 * Indique si un dossier doit être ouvert
 * @param {type} item
 * @param {type} terme
 * @returns {Boolean}
 */
function doitEtreOuvert(item, terme){

    //On veut que le texte spécifié soit présent
    if(terme){

        //Indiquer si le texte est présent
        return item.contientLeTerme(terme);

    }
    
    return true;
}

/**
 * Initialise l'affichage et l'état de l'arborescence
 * @returns {undefined}
 */
function initComposantesArbo(){
    
    //Initialiser l'état pour ceux qui sont déjà coché
    $("#ouvrirArborescence").on('click', ouvrirArborescence);
    $("#fermerArborescence").on('click', fermerArborescence);
    $("#selectionnerCommun").on('click', selectionnerCommun);
    $("#terme").on('keypress', function(event){
        if ( event.which == 13 ) {
            $("#ouvrirArborescence").click();
        }

    }); 
  
}