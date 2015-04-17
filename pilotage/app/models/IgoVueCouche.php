<?php




class IgoVueCouche extends \Phalcon\Mvc\Model
{
    public $id;
    public $description;
    public $geometrie_id;
    public $groupe_id;
    public $vue_validation;
    public $mf_layer_name;
    public $mf_layer_group;
    public $mf_layer_meta_name;
    public $mf_layer_filtre;
    public $mf_layer_minscale_denom;
    public $mf_layer_maxscale_denom;
    public $mf_layer_labelminscale_denom;
    public $mf_layer_labelmaxscale_denom;
    public $mf_layer_def;
    public $mf_layer_meta_def;
    public $service_tuile;
    public $catalogue_csw_id;
    public $fiche_csw_id;
    public $mf_layer_meta_wfs_max_feature;
    public $est_fond_de_carte;
    public $mf_layer_opacity;
    public $mf_layer_meta_title;
    public $mf_layer_meta_group_title;
    public $mf_layer_labelitem;
    public $mf_layer_meta_z_order;
    public $print_option_url;
    public $print_option_layer_name;
    public $est_commune;
    public $est_publique;
    public $layer_a_order;
    public $classe_entite_id;
    public $geometrie_type_id;
    public $vue_defaut;
    public $date_chargement;
    public $connexion_id;
    public $echelle_prod;
    public $remarque_geometrie;
    public $ind_inclusion;
    public $mf_layer_data;
    public $mf_layer_projection;
    public $acces;
    public $nom_classe_entite;
    public $description_classe_entite;
    public $source_entite_id;
    public $classification_id;
    public $organisme_responsable_id;
    public $contact_id;
    public $remarque_classe_entite;
    public $nom_connexion;
    public $connexion;
    public $connexion_type_id;
    public $nom_connexion_type;
    public $connexion_type;
    public $nom_geometrie_type;
    public $layer_type;
    public $geometrie_type;
    public $max_zoom_level;
    public $min_zoom_level;
     
    /**
     * Initialize method for model.
     */
    public function initialize()
    {
    $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoCoucheContexte", "couche_id", array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoVueContexteCoucheNavigateur", "couche_id", array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoPermission", "couche_id", array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoClasse", "couche_id", array(
            'reusable' => true
        ));
        $this->belongsTo("geometrie_id", "IgoGeometrie", "id", array(
            'reusable' => true
        ));
        $this->belongsTo("groupe_id", "IgoGroupe", "id", array(
            'reusable' => true
        ));

    }

    
}
