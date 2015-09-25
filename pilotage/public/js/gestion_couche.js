/**
 *  Code commun pour new.phtml et edit.phtml
 * 
 * 
 */


 function accesChange(){
    var type = $(this).val();
    $('form div[data-acces-type]').each(function(index, element){
       var ligne = $(element);

       if(ligne.attr('data-acces-type').indexOf(type) != -1){
           ligne.show();
       }else if(ligne.attr('data-acces-type') != ''){
           ligne.hide();
       }
    });

    //S'assurer que les lignes de la section Vue avancée restent masquées
    $('#vue-avancee').triggerHandler('click');
}