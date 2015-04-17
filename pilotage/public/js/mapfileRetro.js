$(document).ready(function(){
	/*---- Load and select ----*/
	$('table#layers a').on('click', function(){
		var tr = $(this).parent().parent().next('tr');
		if(tr.css('display') == 'none'){
			tr.css('display', 'table-row');
		} else{
			tr.css('display', 'none');
		}

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
