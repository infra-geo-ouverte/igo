$(document).ready(function(){
	/*---- Load and select ----*/
	$('table#layers a').on('click', function(event){

		var layer_name = $(this).attr('data-layer_name');
		var ligne_sommaire = $('tr[data-utilite="sommaire"][data-layer_name="'+layer_name+'"]');
		var ligne_detail = $('tr[data-utilite="detail"][data-layer_name="'+layer_name+'"]');
		var etat = ligne_sommaire.attr('data-etat');


		if('ferme' == etat){
			//Ouvrir
			ligne_detail.show();
			ligne_sommaire.attr('data-etat', 'ouvert');
		}else{
			//Fermer
			ligne_detail.hide();
			ligne_sommaire.attr('data-etat', 'ferme');
		}

		event.preventDefault();
		return false;
	});

	$('table#layers th.action input[type="checkbox"], table#layers th.action input[type="radio"]').on('click', function(){
		var target = $(this).attr('target');
		var checked = $(this).is(':checked');
		var inputs = $('input[value="' + target + '"]').prop('checked', checked);
	});

	$('table#layers select').on('change', function(){
		var option = $(this).find('option:selected');
		if(option.hasClass('danger')){
			$(this).addClass('danger');
		} else{
			$(this).removeClass('danger');
		}
	}).trigger('change');
	/*-------------------------*/

	/*---- Process ----*/
	$('input[name="contexte"]').on('click', function(){
		var value = $(this).val();
		$(this).parents('form').find('input[type="text"], textarea').prop('disabled', value == 0);
	});

	$('button#finish').on('click', function(){
		$('#progress').css('display', 'block');
	});
	/*-----------------*/
});
