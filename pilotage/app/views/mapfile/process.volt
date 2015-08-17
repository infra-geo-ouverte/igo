<?php $this->partial("commun/titre", array("titre" =>"Rétroingénierie d'un mapfile - étape 4 de 4")) ?>

<div class="retro-wizard">
	<form class="form-horizontal" action="{{url('mapfile/save')}}" method="post">
		<div class="wizard-nav">
			<a class="btn btn-primary" href="{{url('mapfile/select')}}">Précédent</a>
			<button id="finish" type="submit" class="btn btn-primary">Terminer</button> 
		</div>

		<h1>Contexte</h1>

		<div class="form-group">
			<label class="control-label col-sm-6" for="creer_contexte">Souhaitez-vous ajouter un contexte?</label>
			<div class="col-sm-1 radio">
				<label for="contexte-1">Oui</label> 
				<input class="form-control" type="radio" name="creer_contexte" id="contexte-1" value="1" checked/>
			</div>
			<div class="col-sm-1 radio">
				<label for="contexte-0">Non</label> 
				<input class="form-control" type="radio" name="creer_contexte" id="contexte-0" value="0"/>
			</div> 
		</div>

		<div class="form-group">
			<label class="control-label col-sm-4" for="name">Nom<span class="glyphicon glyphicon-asterisk oblig"></span></label>
			<div class="col-sm-4">
				<input class="form-control" type="text" id="name" name="name" value="{{contexteName}}"/>
			</div> 

		</div>

		<div class="form-group">
			<label class="control-label col-sm-4" for="code">Code<span class="glyphicon glyphicon-asterisk oblig"></span></label>
			<div class="col-sm-4">
				<input class="form-control" type="text" id="code" name="code" value="{{contexteCode}}"/>
			</div> 
		</div>

		<div class="form-group">
			<label class="control-label col-sm-4" for="description">Description<span class="glyphicon glyphicon-asterisk oblig"></span></label>
			<div class="col-sm-4">
				<textarea class="form-control" type="text" id="description" name="description">{{contexteDescription}}</textarea>
			</div> 
		</div>

		<div class="form-group">
			<label class="control-label col-sm-4" for="onlineResource">OnlineResource<span class="glyphicon glyphicon-asterisk oblig"></span></label>
			<div class="col-sm-4">
				<input class="form-control" type="text" id="onlineResource" name="onlineResource" value="{{onlineResource}}"/>
			</div> 
		</div>

	</form>
</div>

<div id="progress" class="col-sm-offset-4 col-sm-4" style="display:none;">
	<div class="progress progress-striped active">
	  	<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
	</div>
</div>

{{ javascript_include("js/mapfileRetro.js") }}
