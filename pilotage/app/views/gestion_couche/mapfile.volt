{{ content() }}
{% if preview%}<pre  ID="copytext" style="text-align: left;">{% endif %}
#DEBUG 5
MAP
    #INCLUDE "../include/ec/ec_map.map"
    #INCLUDE "../include/ec/ec_web.map"
    {{ mapfileInclude }}
    NAME "{{ couche['mf_layer_name'] }}"
    EXTENT -1100000 -23500 1100000 2253500
    WEB
        METADATA
           "wms_title"                  "{{ couche['mf_layer_meta_title']}}"
           "wms_name"                   "{{ couche['mf_layer_meta_name']}}"
           "wms_abstract"               ""
           "wms_description"            ""
           "wms_keywordlist"            ""
           "wms_onlineresource"         ""
        END
    END
    PROJECTION
                {% if 'proj=' in (couche['mf_layer_projection']| trim) %}{{couche['mf_layer_projection']}}{% else %}"init=epsg:{{couche['mf_layer_projection']}}"{% endif %}

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
    LAYER
            #INCLUDE "../include/ec/ec_getfeature.map"
            NAME '{{ couche['mf_layer_name']}}'
            TYPE {{couche['layer_type']}}

            GROUP "{{ couche['mf_layer_group']}}"

           {% if couche['connexion_type'] is defined %} CONNECTIONTYPE {{couche['connexion_type']}}{% endif %}

           {% if couche['connexion'] is defined %} CONNECTION "{{couche['connexion']}}"   
            PROCESSING "CLOSE_CONNECTION=DEFER"{% endif %}

            {% if couche['mf_layer_data'] is defined and couche['mf_layer_data']<>""%}DATA "{{ couche['mf_layer_data']}}"{% endif %}

            {% if couche['mf_layer_minscale_denom']|trim<>"" %}MINSCALE  {{ couche['mf_layer_minscale_denom']}}{% endif %}

            {% if couche['mf_layer_maxscale_denom']|trim<>"" %}MAXSCALE  {{ couche['mf_layer_maxscale_denom']}}{% endif %}

            {% if couche['mf_layer_labelminscale_denom']|trim<>"" %}LABELMINSCALE {{ couche['mf_layer_labelminscale_denom']}}{% endif %}

            {% if couche['mf_layer_labelmaxscale_denom']|trim<>"" %}LABELMAXSCALE {{ couche['mf_layer_labelmaxscale_denom']}}{% endif %}

            {% if couche['mf_layer_opacity']|trim<>"" %}OPACITY {{ couche['mf_layer_opacity']}}{% endif %}             

            {% if couche['mf_layer_filter']|trim<>"" %}FILTER "{{ couche['mf_layer_filter']}}"{% endif %}

            {% if couche['mf_layer_projection']|trim<>"" %}

            PROJECTION
                    {% if 'proj=' in (couche['mf_layer_projection']| trim) %} {{couche['mf_layer_projection']}} {% else %}  "init=epsg:{{couche['mf_layer_projection']}}"   {% endif %}

            END
            {% endif  %}

            METADATA
                    #INCLUDE  "../include/ec/ec_meta_layer.map"   
                    "wms_group_title"      "{{ couche['mf_layer_meta_group_title']}}" 
                    "wms_name"             "{{ couche['mf_layer_name']}}"
                    "wms_title"            "{{ couche['mf_layer_meta_title']}}"                        
                    "z_order"              "{{ couche['mf_layer_meta_z_order']}}"                        

                    {{ couche['mf_layer_meta_def']}}

            END

            {{ couche['mf_layer_def']}}

            {{ couche['mf_layer_class_def']}}

    END
END
{% if preview %}</pre>{% endif %}
