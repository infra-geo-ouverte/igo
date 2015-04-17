$(document).ready(function(){
    
    //Met à jour la liste des id d'items sélectionné et la taille des 2 listes
    function majSelection(gauche, droite){
        
        majListeSelectionnees(gauche.attr('id'), droite.attr('id'));
        
        ajusterSize(gauche.attr('id'));
        ajusterSize(droite.attr('id'));
        
    }
    
    function majListeSelectionnees(idGauche, idDroite){
        var valeurs = [];
        $('#' + idDroite + ' option').each(function(index, element){
            valeurs.push(element.value);
        });
        
        valeurs = valeurs.join();
        
        var nameInputValeurs = idGauche + '_valeurs';
        $('input[name="'+nameInputValeurs+'"]').val(valeurs);
        
    }
    
    function ajusterSize(id){
        
        var nbItemsMax = 10;
        var select = $('#' + id);
        var nbItems =  select.children('option').length;
        if(nbItems < 2){
            nbItems = 2;
        }
        var nouveanNbItems = nbItems > nbItemsMax ? nbItemsMax : nbItems;
        select.attr('size', nouveanNbItems);
        
    }
    
    $('.multiselect').multiselect({
        afterMoveOneToRight:majSelection,
        afterMoveOneToLeft:majSelection,
        afterMoveAllToRight:majSelection,
        afterMoveAllToLeft:majSelection,
        startUp:majSelection,
        sort: function(d, c) {
                if (d.innerHTML == "NA") {
                    return 1;
                } else {
                    if (c.innerHTML == "NA") {
                        return -1;
                    }
                }
                return (d.innerHTML.toLowerCase() > c.innerHTML.toLowerCase()) ? 1 : -1
            }
    });

});