jQuery(document).ready(function($){

    //TODO S'assurer que ces fonctionalités n'aient pas d'impact sur le reste de la page
    var STATUT_A_JOUR = '<span class="glyphicon glyphicon-ok color-green"></span> <span class="label label-success">À jour</span>';
    var STATUT_ERREUR = '<span class="glyphicon glyphicon-remove color-red"></span> <span class="label label-danger" data-toggle="tooltip" title="MSG_ERREUR">Voir l\'erreur</span>';
    var STATUT_EN_COURS = '<span class="glyphicon glyphicon-refresh color-green"></span> <span class="label label-warning">En cours</span>';

    var nbContextes = $('tr[data-igoContexte-id]').length;
    var nbContextexRegeneres;

    function regenerer(){

        var contextes = $('tr[data-igoContexte-id]');
        nbContextexRegeneres = 0;
        majTexteNbContextesRegeneres();

        $('#btn-regenerer').attr('disabled', 'disabled');
        $('[data-placeholder="status"]').html('');
       
        regenererUnContexte(contextes);
    
    }

    function majTooltip(){
        $('section table [data-toggle="tooltip"]').tooltip({placement:'right'});
    }

    function majTexteNbContextesRegeneres(){
        var pluriel = nbContextexRegeneres > 1 ? 's' : '';
        var plurielTotal = nbContextes > 1 ? 's' : '';
         majStatutGlobal('<div class="alert alert-info"><span class="glyphicon glyphicon-exclamation-sign color-blue"></span> Traitement en cours... <span id="nb-a-jour">' + nbContextexRegeneres + '</span> contexte'+pluriel+' sur ' + nbContextes + ' de regénéré'+plurielTotal+'.</div>')
    }

    function majStatutGlobal(html){
        $('#statut-regeneration').html(html);
    }

    function setStatutContexte(contexte, status){
        contexte.find("span[data-placeholder='status']").html(status);
    }

    function setStatutContexteEnErreur(contexte, erreur){
        setStatutContexte(contexte, STATUT_ERREUR.replace('MSG_ERREUR', erreur));
        majTooltip();
    }

    function majDateMaj(contexteId, laDate){

        $('[data-igocontexte-id="'+contexteId+'"] [data-placeholder="data_maj"]').html(laDate);
    }

    function regenererUnContexte(contextes){

        if(contextes.length == 0){

            //Afficher les messages de fin
            majStatutGlobal('<div class="alert alert-success"><span class="glyphicon glyphicon-ok color-green"></span> Traitement terminé.</div>');
            $('#btn-regenerer').removeAttr('disabled');
            return;
        }
        
        //Récupérer le contexte à regénérer
        var contexte = contextes[0];
        contexte = $(contexte);

        //Enlever le contexte de la liste
        contextes = contextes.slice(1);

        var contexteId = contexte.attr('data-igoContexte-id');
        contexte.find("span[data-placeholder='status']").html(STATUT_EN_COURS);

        //Lancer la regénération du contexte
        $.ajax({
              url: "regenerer/",
              method: 'post',
              async:true,
              data:{'id':contexteId}
            }).done(function(data, textStatus, jqXHR) {
    
                if(data && data.date_maj){
                    majDateMaj(contexteId, data.date_maj);
                }
                //Afficher le message correspondant
                setStatutContexte(contexte, STATUT_A_JOUR);
                nbContextexRegeneres++;
                majTexteNbContextesRegeneres();
                regenererUnContexte(contextes);


            }).fail(function(data){
                var msgErreur = 'Erreur...';
                var responseText = data.responseText ? JSON.parse(data.responseText) : false;
                if(responseText && responseText.erreur){
                    msgErreur = responseText.erreur;
                }
                setStatutContexteEnErreur(contexte, msgErreur);
                //Passer au suivant
                regenererUnContexte(contextes);
            
            });
        }

    $('#btn-regenerer').click(regenerer);

});

