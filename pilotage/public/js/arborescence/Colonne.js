/**
 * Colonne représente un champ de BD. Est rataché à une Couche
 */

/**
 * 
 * @param {type} id Ex : 12_13_19
 * @param string libelle Nom du champ
 * @param bool estCochee Est exclus
 * @returns {Colonne}
 */
function Colonne(id, libelle, estCochee) {
    this.id = 'colonne_' + id;
    this.name  = 'C' + 'X' + id;
    this.libelle = libelle;
    this.estCochee = estCochee;
    
    var spl = id.split('_');
    this.idDeLaColonne = spl[spl.length-1]; //Ex : 19

}

Colonne.prototype.parent = ''; //Initialisé lors de Couche.ajouterColonne()
Colonne.prototype.reference = undefined;

Colonne.prototype.getClassName = function(){
    return 'Colonne';
}

/**
 * 
 */
Colonne.prototype.init = function(){
    
    this.updateInput();
    this.updateLabel();

}

Colonne.prototype.click = function(){
    
    //Récupérer l'état actuelle se sa cch
    var cch = this.obtenirReference();
    var cchEstCoche = cch.prop('checked');

    if(cchEstCoche && (this.getCoucheParent().nbAttributsActives() == 0)){
        
        //Annuler l'exclusion
        cch.prop('checked', false);
        alert("Il faut d'abord associer la couche avant d'en exclure une colonne.");
        return;
    }

    this.estCochee = cchEstCoche;
    this.updateLabel();
    
}

Colonne.prototype.updateInput = function(){
    
    this.obtenirReference().prop('checked', this.estCochee);
}

Colonne.prototype.updateLabel = function(){
    var label = this.getLabel();
    if(this.estCochee){
        label.css('text-decoration', 'line-through');
    }else{
        label.css('text-decoration', '');
    }
}

Colonne.prototype.getCoucheParent = function(){
    
    return this.parent;
    
}

Colonne.prototype.getLabel = function(){
    var arbo = this.obtenirArbo();
    return arbo.obtenirReference().find('label[for="' + this.id + '"]'); 
}

/**
 * Récupère une référence jQuery sur la colonne
 */
Colonne.prototype.obtenirReference = function(){
    if(this.reference == undefined){
        this.reference = $(document.getElementById(this.id));
    }
    return this.reference;
}

Colonne.prototype.decocher = function(){
    
    var input = this.obtenirReference();
    if(input.prop('checked')){
        input.click();  
    }
    
}

/**
 * Ajoute le contenu de la colonne au HTML qui va construire l'arborescence
 */
Colonne.prototype.afficher = function() {
    
    var checked = this.estCochee ? "checked" : '';
    var arbo = this.obtenirArbo();
    arbo.ecrire(['<li>'
   , '<input type="hidden" name="', this.name, '" value="0">'
   , '<input id="', this.id, '" name="', this.name, '" ', checked, ' type="checkbox" value="1" class="exclu check" data-toggle="tooltip" data-placement="top" title="Exclure ce champ">'
   , '<label for="', this.id, '" data-toggle="tooltip" data-placement="top" title="Exclure ce champ">'
   , this.libelle
   , '</label>'
   , '</li>'].join(''));
    
}

/**
 * Indique si le terme est contenu la colonne
 * @param string terme
 * @returns bool
 */
Colonne.prototype.contientLeTerme = function(terme) {
    return indexOfRegExp(this.libelle, terme);
}

/**
 * Retourne une référence sur l'arbo qui contient la colonne
 */
Colonne.prototype.obtenirArbo = function(){
    return this.parent ? this.parent.obtenirArbo() : false;
}



/**
 * Fait ajuster l'état des colonnes ayant le même id
 */
Colonne.prototype.majEtatColonnesAvecLeMemeId = function(){
    
    var colonnes = this.obtenirArbo().colonnes;
    var colonne;
    
    for(indColonne in colonnes){
        
        colonne = colonnes[indColonne];

        //La colonne correspond et ce n'est pas celle qu'on a cliqués originalement
        if(this.idDeLaColonne == colonne.idDeLaColonne && this.id != colonne.id){

            //La colonne peut être cochée
            if(colonne.parent.estActive()){
                var inputColonne = colonne.obtenirReference()
                inputColonne.prop('checked', this.estCochee);
                colonne.click();
            }
        } 
        
    }

    
}

