<?php $this->partial("commun/titre", array("titre" =>"Rétroingénierie d'un mapfile - étape 3 de 4")) ?>

<div class="retro-wizard">
	<form class="form-horizontal" action="{{url('mapfile/process')}}" method="post">
		<div class="wizard-nav">
			<a class="btn btn-primary" href="{{url('mapfile/load')}}">Précédent</a>
			<button type="submit" class="btn btn-primary">Suivant</button> 
		</div>

		{% if nNewLayers == 1 %}
			<h1>{{nNewLayers}} nouvelle couche a été trouvée.</h1>
		{% else %}
			<h1>{{nNewLayers}} nouvelles couches ont été trouvées.</h1>
		{% endif %}

		{% if nExistingLayers == 1 %}
			<h3>{{nExistingLayers}} nouvelle couche existe déjà dans la base de données.</h3>
		{% else %}
			<h3>{{nExistingLayers}} couches existent déjà dans la base de données.</h3>
		{% endif %}

		<table id="layers" class="table table-striped table-bordered">

		    <thead>
		        <tr>
		            <th>Nom</th>
		            <th>Groupe</th>
		            <th class="action">
		            	Insérer / Remplacer<input name="checkall" type="radio" target="insert">
		            </th>
		            <th class="action">
		            	Conserver<input name="checkall" type="radio" target="softinsert">
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
							<td>
								<select class="{{layer['selectClass']}} form-control" name="group[{{layer['id']}}]">

									{% if layer['currentGroup'] and layer['wms_group_title'] != layer['currentGroup'] %}
										<option class="danger" value="{{layer['wms_group_title']}}" selected>{{layer['wms_group_title']}}</option>
									{% else %}
										<option value="{{layer['wms_group_title']}}" selected>{{layer['wms_group_title']}}</option>
									{% endif %}

									{% for group in groups %}
										{% if group != layer['wms_group_title'] or !layer['wms_group_title'] %}
											{% if layer['currentGroup'] and group != layer['currentGroup'] %}
												<option class="danger" value="{{group}}">{{group}}</option>
											{% else %}
												<option value="{{group}}">{{group}}</option>
											{% endif %}
										{% endif %}
									{% endfor %}
								</select>
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
									<input type="radio" name="action[{{layer['id']}}]" value="softinsert" checked>
								{% else %}
									<input type="radio" name="action[{{layer['id']}}]" value="softinsert">
								{% endif %}
							</td>
							<td class="action">
								<input type="radio" name="action[{{layer['id']}}]" value="ignore">
							</td>
						</tr>

					<tr style="display:none;">
						<td colspan=4>
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
