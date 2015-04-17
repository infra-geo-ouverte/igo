<?php $this->partial("commun/titre", array("titre" =>"Rétroingénierie d'un mapfile - étape 2 de 4")) ?>

<div class="retro-wizard">
	<form action="{{url('mapfile/select')}}" method="post">
		<div class="wizard-nav">
			<a class="btn btn-primary" href="{{url('mapfile/retro')}}">Précédent</a>
			<button type="submit" class="btn btn-primary">Suivant</button> 
		</div>

		{% if nLayers == 1 %}
			<h1>{{nLayers}} nouvelle couche a été trouvée.</h1>
		{% else %}
			<h1>{{nLayers}} couches ont été trouvées.</h1>
		{% endif %}

		<h3>{{nNotDistinctLayers}} couches sont en double.</h3>

		<table id="layers" class="table table-striped table-bordered">

		    <thead>
		        <tr>
		            <th>Nom</th>
		            <th class="action">
		            	Exclure<input name="checkall" type="checkbox" target="exclude">
		            </th>
		        </tr>
		    </thead>

		    <tbody>
				{% for layer in layers %}
					{% if !layer['distinct'] %}
						<tr class="danger">
					{% else %}
						<tr>
					{% endif %}
							<td>
								<a href="#">{{layer['name']}}</a>
							</td>
							<td class="action">
								<input type="checkbox" name="exclude[{{layer['id']}}]" value="exclude">
							</td>
						</tr>

					<tr style="display:none;">
						<td colspan=2>
							<p>
								<label>Name</label> : {{layer['name']}}
							</p>

							<p>
								<label>Group</label> : {{layer['group']}}
							</p>

							<p>
								<label>Échelle min.</label> : {{layer['minscaledenom']}}
							</p>

							<p>
								<label>Échelle max.</label> : {{layer['maxscaledenom']}}
							</p>

							<p>
								<label>Label échelle min.</label> : {{layer['labelminscaledenom']}}
							</p>

							<p>
								<label>Label échelle max.</label> : {{layer['labelmaxscaledenom']}}
							</p>

							<p>
								<label>Type</label> : {{layer['type']}}
							</p>

							<p>
								<label>Projection</label> : {{layer['projection']}}
							</p>

							<p>
								<label>Connexion</label> : {{layer['connection']}}
							</p>

							<p>
								<label>Type de connexion</label> : {{layer['connectiontype']}}
							</p>

							<p>
								<label>Data</label> : {{layer['data']}}
							</p>

							<p>
								<label>Filter</label> : {{layer['filter']}}
							</p>

							<p>
								<label>Définition de la couche</label>
								<pre>{{layer['layer_def']}}</pre>
							</p>

							<p>
								<label>Définition des métadonnées</label>
								<pre>{{layer['meta_def']}}</pre>
							</p>

							<p>
								<label>Classes</label>
								{% for class in layer['classes'] %}
									<pre>{{class}}</pre>
								{% endfor %}
							</p>
						</td>
					</tr>
				{% endfor %}
			</tbody>

		</table>
	</form>
</div>

{{ javascript_include("js/mapfileRetro.js") }}
