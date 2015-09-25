$(function(){
    
    $('*[data-confirmation="supprimer"]').click(function(){
        return confirm("Voulez-vous vraiment effectuer la suppression?");
    });
});