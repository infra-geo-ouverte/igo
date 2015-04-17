<?php



class IgoVueContexte extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $contexte_id;
     
    /**
     *
     * @var integer
     */
    public $id;
     
    /**
     *
     * @var string
     */
    public $description;
     
    /**
     *
     * @var integer
     */
    public $geometrie_id;
     
    /**
     *
     * @var integer
     */
    public $groupe_id;
     
    /**
     *
     * @var string
     */
    public $vue_validation;
     
    /**
     *
     * @var string
     */
    public $mf_layer_name;
     
    /**
     *
     * @var string
     */
    public $mf_layer_group;
     
    /**
     *
     * @var string
     */
    public $mf_layer_meta_name;
     
    /**
     *
     * @var string
     */
    public $est_visible;
     
    /**
     *
     * @var string
     */
    public $est_active;
     
    /**
     *
     * @var string
     */
    public $mf_layer_filtre;
     
    /**
     *
     * @var integer
     */
    public $mf_layer_minscale_denom;
     
    /**
     *
     * @var integer
     */
    public $mf_layer_maxscale_denom;
     
    /**
     *
     * @var integer
     */
    public $mf_layer_labelminscale_denom;
     
    /**
     *
     * @var integer
     */
    public $mf_layer_labelmaxscale_denom;
     
    /**
     *
     * @var string
     */
    public $mf_layer_def;
     
    /**
     *
     * @var string
     */
    public $mf_layer_meta_def;
     
    /**
     *
     * @var string
     */
    public $mf_layer_class_def;
     
    /**
     *
     * @var string
     */
    public $service_tuile;
     
    /**
     *
     * @var integer
     */
    public $catalogue_csw_id;
     
    /**
     *
     * @var string
     */
    public $fiche_csw_id;
     
    /**
     *
     * @var integer
     */
    public $mf_layer_meta_wfs_max_feature;
     
    /**
     *
     * @var string
     */
    public $est_fond_de_carte;
     
    /**
     *
     * @var integer
     */
    public $mf_layer_opacity;
     
    /**
     *
     * @var string
     */
    public $mf_layer_meta_title;
     
    /**
     *
     * @var string
     */
    public $mf_layer_meta_group_title;
     
    /**
     *
     * @var string
     */
    public $mf_layer_labelitem;
     
    /**
     *
     * @var integer
     */
    public $mf_layer_meta_z_order;
     
    /**
     *
     * @var string
     */
    public $print_option_url;
     
    /**
     *
     * @var string
     */
    public $print_option_layer_name;
     
    /**
     *
     * @var string
     */
    public $est_commune;
     
    /**
     *
     * @var string
     */
    public $est_publique;
     
    /**
     *
     * @var integer
     */
    public $layer_a_order;
     
    /**
     *
     * @var integer
     */
    public $classe_entite_id;
     
    /**
     *
     * @var integer
     */
    public $geometrie_type_id;
     
    /**
     *
     * @var string
     */
    public $vue_defaut;
     
    /**
     *
     * @var string
     */
    public $date_chargement;
     
    /**
     *
     * @var integer
     */
    public $connexion_id;
     
    /**
     *
     * @var string
     */
    public $echelle_prod;
     
    /**
     *
     * @var string
     */
    public $remarque_geometrie;
     
    /**
     *
     * @var string
     */
    public $ind_inclusion;
     
    /**
     *
     * @var string
     */
    public $mf_layer_data;
     
    /**
     *
     * @var string
     */
    public $mf_layer_projection;
     
    /**
     *
     * @var string
     */
    public $acces;
     
    /**
     *
     * @var string
     */
    public $nom_classe_entite;
     
    /**
     *
     * @var string
     */
    public $description_classe_entite;
     
    /**
     *
     * @var integer
     */
    public $source_entite_id;
     
    /**
     *
     * @var integer
     */
    public $classification_id;
     
    /**
     *
     * @var integer
     */
    public $organisme_responsable_id;
     
    /**
     *
     * @var integer
     */
    public $contact_id;
     
    /**
     *
     * @var string
     */
    public $remarque_classe_entite;
     
    /**
     *
     * @var string
     */
    public $nom_connexion;
     
    /**
     *
     * @var string
     */
    public $connexion;
     
    /**
     *
     * @var integer
     */
    public $connexion_type_id;
     
    /**
     *
     * @var string
     */
    public $nom_connexion_type;
     
    /**
     *
     * @var string
     */
    public $connexion_type;
     
    /**
     *
     * @var string
     */
    public $nom_geometrie_type;
     
    /**
     *
     * @var string
     */
    public $layer_type;
     
    /**
     *
     * @var string
     */
    public $geometrie_type;
     
    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema($this->getDI()->getConfig()->database->schema);

        $this->belongsTo("contexte_id", "IgoContexte", "id",  array(
            'reusable' => true
        ));

    }

    /**
     * Independent Column Mapping.
     */
    public function columnMap()
    {
        return array(
            'contexte_id' => 'contexte_id', 
            'id' => 'id', 
            'description' => 'description', 
            'geometrie_id' => 'geometrie_id', 
            'groupe_id' => 'groupe_id', 
            'vue_validation' => 'vue_validation', 
            'mf_layer_name' => 'mf_layer_name', 
            'mf_layer_group' => 'mf_layer_group', 
            'mf_layer_meta_name' => 'mf_layer_meta_name', 
            'est_visible' => 'est_visible', 
            'est_active' => 'est_active', 
            'mf_layer_filtre' => 'mf_layer_filtre', 
            'mf_layer_minscale_denom' => 'mf_layer_minscale_denom', 
            'mf_layer_maxscale_denom' => 'mf_layer_maxscale_denom', 
            'mf_layer_labelminscale_denom' => 'mf_layer_labelminscale_denom', 
            'mf_layer_labelmaxscale_denom' => 'mf_layer_labelmaxscale_denom', 
            'mf_layer_def' => 'mf_layer_def', 
            'mf_layer_meta_def' => 'mf_layer_meta_def', 
            'mf_layer_class_def' => 'mf_layer_class_def', 
            'service_tuile' => 'service_tuile', 
            'catalogue_csw_id' => 'catalogue_csw_id', 
            'fiche_csw_id' => 'fiche_csw_id', 
            'mf_layer_meta_wfs_max_feature' => 'mf_layer_meta_wfs_max_feature', 
            'est_fond_de_carte' => 'est_fond_de_carte', 
            'mf_layer_opacity' => 'mf_layer_opacity', 
            'mf_layer_meta_title' => 'mf_layer_meta_title', 
            'mf_layer_meta_group_title' => 'mf_layer_meta_group_title', 
            'mf_layer_labelitem' => 'mf_layer_labelitem', 
            'mf_layer_meta_z_order' => 'mf_layer_meta_z_order', 
            'print_option_url' => 'print_option_url', 
            'print_option_layer_name' => 'print_option_layer_name', 
            'est_commune' => 'est_commune', 
            'est_publique' => 'est_publique', 
            'layer_a_order' => 'layer_a_order', 
            'classe_entite_id' => 'classe_entite_id', 
            'geometrie_type_id' => 'geometrie_type_id', 
            'vue_defaut' => 'vue_defaut', 
            'date_chargement' => 'date_chargement', 
            'connexion_id' => 'connexion_id', 
            'echelle_prod' => 'echelle_prod', 
            'remarque_geometrie' => 'remarque_geometrie', 
            'ind_inclusion' => 'ind_inclusion', 
            'mf_layer_data' => 'mf_layer_data', 
            'mf_layer_projection' => 'mf_layer_projection', 
            'acces' => 'acces', 
            'nom_classe_entite' => 'nom_classe_entite', 
            'description_classe_entite' => 'description_classe_entite', 
            'source_entite_id' => 'source_entite_id', 
            'classification_id' => 'classification_id', 
            'organisme_responsable_id' => 'organisme_responsable_id', 
            'contact_id' => 'contact_id', 
            'remarque_classe_entite' => 'remarque_classe_entite', 
            'nom_connexion' => 'nom_connexion', 
            'connexion' => 'connexion', 
            'connexion_type_id' => 'connexion_type_id', 
            'nom_connexion_type' => 'nom_connexion_type', 
            'connexion_type' => 'connexion_type', 
            'nom_geometrie_type' => 'nom_geometrie_type', 
            'layer_type' => 'layer_type', 
            'geometrie_type' => 'geometrie_type'
        );
    }

}
