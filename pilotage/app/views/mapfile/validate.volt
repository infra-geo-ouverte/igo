<div class="retro-wizard">
	<form class="form-horizontal" action="{{url('mapfile/save')}}" method="post">
		<div class="wizard-nav">
			<a class="btn btn-primary" href="{{url('mapfile/display')}}">Précédent</a>
			<button type="submit" class="btn btn-primary">Suivant</button> 
		</div>

		{% if nNewLayers == 1 %}
			<h1>{{nNewLayers}} nouvelle couche a été trouvée.</h1>
		{% else %}
			<h1>{{nNewLayers}} nouvelles couches ont été trouvées.</h1>
		{% endif %}

		{% if nExistingLayers == 1 %}
			<h3>{{nExistingLayers}} nouvelle couche existe déjà.</h3>
		{% else %}
			<h3>{{nExistingLayers}} couches existent déjà.</h3>
		{% endif %}

		<table id="layers" class="table table-striped table-bordered">

		    <thead>
		        <tr>
		            <th>Nom</th>
		            <th class="action">
		            	Insérer / Remplacer<input name="checkall" type="radio" target="insert">
		            </th>
		            <th class="action">
		            	Ignorer<input name="checkall" type="radio" target="ignore">
		            </th>
		        </tr>
		    </thead>

		    <tbody>
				{% for layer in layers %}
					{% if layer['exists'] %}
						<tr class="danger">
					{% else %}
						<tr>
					{% endif %}
							<td>
								<a href="#">{{layer['name']}}</a>
							</td>
							<td class="action">
								{% if !layer['exists'] %}
									<input type="radio" name="action[{{layer['id']}}]" value="insert" checked>
								{% else %}
									<input type="radio" name="action[{{layer['id']}}]" value="insert">
								{% endif %}
							</td>
							<td class="action">
								{% if layer['exists'] %}
									<input type="radio" name="action[{{layer['id']}}]" value="ignore" checked>
								{% else %}
									<input type="radio" name="action[{{layer['id']}}]" value="ignore">
								{% endif %}
							</td>
						</tr>

					<tr style="display:none;">
						<td colspan=3>
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