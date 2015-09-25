<?php $this->partial("commun/titre", array("titre" =>"Rétroingénierie d'un mapfile - étape 1 de 4")) ?>

<div class="retro-wizard">
	<form class="form-horizontal" action="{{url('mapfile/load')}}" method="post">
		<div class="wizard-nav">
			<a class="btn btn-primary" href="#" disabled>Précédent</a>
			<button type="submit" class="btn btn-primary">Suivant</button> 
		</div>

		<div class="form-group">
			<label class="control-label col-sm-3" for="mapfile">Mapfile<span class="glyphicon glyphicon-asterisk oblig"></span></label>
			<div class="col-sm-6">
				<input class="form-control" type="text" id="mapfile" name="mapfile" value="{{mapfile}}"/>
			</div> 
		</div>
	</form>
</div>