/* 
 * Code pour /gestion_couche/creation.phtml, igo_permission/new, igo_permission/edit, igo_couche_contexte/new et igo_couche_contexte/edit
    TODO Mettre ce code dans un fichier plus générique puisqu'il sert à plusieurs endroits
 **/

function afficher(valeur){
    $('[data-toggle*="'+valeur+'"]').show();
    $('[data-toggle*="'+valeur+'"] input, '
      + '[data-toggle*="'+valeur+'"] select, '
      + '[data-toggle*="'+valeur+'"] textarea').removeAttr('disabled');
}
function cacher(valeur){
    $('[data-toggle*="'+valeur+'"]').hide();
}

function desactiver(valeur){
    $('[data-toggle*="'+valeur+'"] input, '
      + '[data-toggle*="'+valeur+'"] select, '
      + '[data-toggle*="'+valeur+'"] textarea').attr('disabled', 'disabled');
}

function changeGeometrie(geometrie_type){
    cacher('vectoriel');
    cacher('query');
    cacher('chart');
    cacher('raster');
    desactiver('vectoriel');
    desactiver('query');
    desactiver('chart');
    desactiver('raster');
    if(geometrie_type=='Query'){  
        afficher('query');
        $('#connexion_type_id_query').triggerHandler('change');
    }else if(geometrie_type=='Chart'){ 
        afficher('chart');	  
        $('#connexion_type_id_chart').triggerHandler('change');
    }else if(geometrie_type=='Raster'){                
        afficher('raster');	
        $('#connexion_type_id_raster').triggerHandler('change');
    } else {              
        afficher('vectoriel');
        $('#connexion_type_id_vertoriel').triggerHandler('change');
    }
}

function changeConnexion(connexion_type){
   $('#connexion_type_id').val(connexion_type);
    var pos=connexion_type_id.indexOf(connexion_type);
    //alert(pos);
     if (connexion_type_data[pos]){
        // alert("affiche");
         afficher('data');
     } else{
        // alert("cache");
         cacher('data');
    }
     if (connexion_type_vue[pos]){
         afficher('vue');
     } else{
         cacher('vue');
    }
     if (connexion_type_projection[pos]){
         afficher('projection');
     } else{
         cacher('projection');
    }
}
$(function(){
    //TODO cibler avec la classe pour sélectionner seulement les pages ou c'est pertinent
    $("body input[name='specifier']").change(function(){
     
        var selection = $(this).attr('id');
        if(selection == "specifier_couche" && this.checked){
            afficher("specifier_couche");
            cacher("specifier_groupe_couche");
            desactiver("specifier_groupe_couche");
        }else{
            afficher("specifier_groupe_couche");
            cacher("specifier_couche");
            desactiver("specifier_couche");
        }
    });
    
   $("body input[name='specifier']:checked").triggerHandler('change');
   
});
