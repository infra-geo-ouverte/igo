{{ content() }}
{% if preview%}<pre  ID="copytext" style="text-align: left;">{% endif %}
MAP
    #DEBUG 5
    #INCLUDE "../include/ec/ec_map.map"  
    #INCLUDE "../include/ec/ec_web.map"
    {{ mapfileInclude }}

    NAME "{{ contexte['code'] }}"
    EXTENT -1100000 -23500 1100000 2253500
    WEB
        METADATA
           "wms_title"                  "{{ contexte['code']}}"
           "wms_name"                   "{{ contexte['nom'] }}"
           "wms_abstract"               ""
           "wms_description"            "{{ contexte['description'] }}"
           "wms_keywordlist"            ""
            {% if contexte['generer_onlineresource'] == true %}
           "wms_onlineresource"         "{{ contexte['wms_onlineresource'] }}"
           {% endif %}
        END
    END
    PROJECTION
        {{contexte['mf_map_projection']}}

    END

    LEGEND
        STATUS ON
        KEYSIZE 22 22
		LABEL
			TYPE TRUETYPE
			FONT "arial"
			COLOR 0 0 0
			SIZE 10
			POSITION CL
			OFFSET 0 0
			SHADOWSIZE 2 2
			ANTIALIAS TRUE
		END
    END
    		{{ contexte['mf_map_def']}} 

{% for couche in contexteCouches %}

    {% if couche.ind_data and (couche.est_visible or couche.est_active) %}
            LAYER
                    NAME "{{couche.mf_layer_name}}"
                    TYPE {{couche.IgoCouche.IgoGeometrie.IgoGeometrieType.layer_type}}

                    GROUP "{{couche.mf_layer_group}}"

                   {% if couche.connexion_type is defined %} CONNECTIONTYPE {{couche.connexion_type}}{% endif %}

                   {% if couche.connexion is defined %} CONNECTION "{{couche.connexion}}"   
                    PROCESSING "CLOSE_CONNECTION=DEFER"{% endif %}

                    {% if couche.IgoCouche.IgoGeometrie.mf_layer_data is defined and couche.IgoCouche.IgoGeometrie.mf_layer_data<>""%}DATA "{{ couche.IgoCouche.IgoGeometrie.mf_layer_data}}"{% endif %}

                    {% if couche.mf_layer_minscale_denom|trim<>"" %}MINSCALE  {{ couche.mf_layer_minscale_denom}}{% endif %}

                    {% if couche.mf_layer_maxscale_denom|trim<>"" %}MAXSCALE  {{ couche.mf_layer_maxscale_denom}}{% endif %}

                    {% if couche.mf_layer_labelminscale_denom is defined and couche.mf_layer_labelminscale_denom|trim<>""  %}LABELMINSCALE {{ couche.mf_layer_labelminscale_denom}}{% endif %}

                    {% if couche.mf_layer_labelmaxscale_denom is defined and  couche.mf_layer_labelmaxscale_denom|trim<>"" %}LABELMAXSCALE {{ couche.mf_layer_labelmaxscale_denom}}{% endif %}

                    {% if couche.mf_layer_filter is defined and couche.mf_layer_filter|trim<>"" %}FILTER "{{ couche.mf_layer_filter}}"{% endif %}

                    {% if couche.IgoCouche.IgoGeometrie.mf_layer_projection is defined and couche.IgoCouche.IgoGeometrie.mf_layer_projection|trim<>"" %}

                    PROJECTION
                         {% if 'proj=' in (couche.IgoCouche.IgoGeometrie.mf_layer_projection | trim) %} {{couche.IgoCouche.IgoGeometrie.mf_layer_projection}} {% else %}  "init=epsg:{{couche.IgoCouche.IgoGeometrie.mf_layer_projection}}"   {% endif %}
                    END
                    {% endif  %}

                    METADATA
                            "layer_name_igo" "{{ couche.mf_layer_name_igo}}"
                            "wms_group_title"      "{{ couche.mf_layer_meta_group_title}}"
                            "wms_name"             "{{ couche.mf_layer_meta_name}}"
                            "wms_title"            "{{ couche.mf_layer_meta_title}}"
                            "z_order"              "{{ couche.mf_layer_meta_z_order}}"
                            "msp_classe_meta"      "{{ couche.fiche_csw_id}}"
                            {% if couche.mf_layer_opacity|trim<>"" %}"OPACITY" "{{ couche.mf_layer_opacity}}"{% endif %}

                            {% if couche.IgoCouche.mf_layer_meta_wfs_max_feature is defined and couche.IgoCouche.mf_layer_meta_wfs_max_feature|trim<>"" %}
                            "wfs_maxfeatures" "{{ couche.IgoCouche.mf_layer_meta_wfs_max_feature}}"

                            {% endif  %}
                            {% if couche.IgoCouche.IgoGeometrie.ind_inclusion == "E"%}
                            "gml_include_items" "all"
                            "gml_exclude_items" "{% set firsthit = true %}{% for attribut in couche.IgoCouche.IgoGeometrie.IgoAttribut%}{% if attribut.est_inclu == false%}{% if firsthit==false %},{% else %}{% set firsthit=false %}{% endif %}{{attribut.colonne}}{% endif %}{% endfor %}"
                            {% endif %}
                            {% if couche.IgoCouche.IgoGeometrie.ind_inclusion == "I"%}
                            "gml_exclude_items" "all"
                            "gml_include_items" "{% set firsthit = true %}{% for attribut in couche.IgoCouche.IgoGeometrie.IgoAttribut%}{% if attribut.est_inclu == true%}{% if firsthit==false %},{% else %}{% set firsthit=false %}{% endif %}{{attribut.colonne}}{% endif %}{% endfor %}"
                            {% endif %}
                            {% if couche.IgoCouche.IgoGeometrie.ind_inclusion == "T"%}
                            "gml_include_items" "all"
                            {% endif %}

                            {#{{ couche['include_items']}}#}
                            {#{{ couche['exclude_items']}}#}
                            {{ couche.IgoCouche.mf_layer_meta_def}}

                            {% if couche.IgoCouche.mf_layer_meta_attribution_title is defined and couche.IgoCouche.mf_layer_meta_attribution_title|trim<>"" %}
                            "wms_attribution_title" "{{ couche.IgoCouche.mf_layer_meta_attribution_title }}"
                            {% endif %}			
                    END


                    {{couche.IgoCouche.mf_layer_def}}

                    {% if couche.IgoCouche.mf_layer_labelitem|trim<>"" %}
                    LABELITEM "{{ couche.IgoCouche.mf_layer_labelitem}}"
                    {% endif  %}              
                    {#{{ couche['mf_layer_class_def']}}#}

                    {% for classe in couchesClasses[couche.couche_id] %}
                    {{classe.mf_class_def}}
                    {% endfor %}

            END
    {% endif %}
{% endfor  %}	
END
{% if preview %}</pre>{% endif %}
