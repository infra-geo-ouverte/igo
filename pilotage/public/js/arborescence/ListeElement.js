function ListeElement(){
    
    this.index = [];
}

//Stocke un élément
ListeElement.prototype.ajouterElement = function(element){
    
    var hash;
    if(element.getClassName() == "Attribut"){
        hash = this.obtenirHash(element.parent.parent.id);
    }else{
        hash = this.obtenirHash(element.id);
    }
 
    if(this.index[hash] == undefined){
        this.index[hash] = [];
    }

    this.index[hash].push(element);
}

//Retourne un élément
ListeElement.prototype.obtenirElement = function(id){
   
   var hash = this.index[this.obtenirHash(id)];
   for(ind in hash){
       if(hash[ind].id == id){
           return hash[ind];
       }
   }
   return false;
    
}

ListeElement.prototype.obtenirHash = function(str){
    var hash = 0;
    if (str.length == 0){
        return hash;
    }
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);       
        hash = ((hash<<5)-hash)+char; 
        hash = hash & hash;
    }
    return hash;

}