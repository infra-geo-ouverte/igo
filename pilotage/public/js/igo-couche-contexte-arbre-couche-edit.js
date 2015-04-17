$(document).ready(function(){
    $('#ouvrirArborescence, #fermerArborescence, #selectionnerCommun').tooltip();

    $('form#formArbo').submit(function(event){
        
        $('#valeursArbo').val(arbo.getJSON());

    });
     $('.conteneur-legende span').tooltip();
});