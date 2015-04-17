<?php



class IgoVueContexteCoucheNavigateur extends \Phalcon\Mvc\Model{

    public $contexte_id;

    public $couche_id;
    
    public $groupe_id;

    public $est_visible;
    
    public $est_active;
    
    public $est_fond_de_carte;
    
    public $mf_layer_name; 
    
    public $mf_layer_meta_name;
    
    public $mf_layer_meta_title;
    
    public $mf_layer_group;
    
    public $mf_layer_meta_def;
    
    public $mf_layer_meta_group_title;
    
    public $mf_layer_meta_z_order;
    
    public $mf_layer_minscale_denom;
    
    public $mf_layer_maxscale_denom;
    
    public $print_option_url;
    
    public $print_option_layer_name;
    
    public $fiche_csw_id;
    
    public $connexion_type;
    
    public $layer_a_order; 
    
    public $mf_layer_opacity;
    
    public $mf_layer_meta_attribution_title;
    
    public $catalogue_csw_url;
    
    public $min_zoom_level;
    
    public $max_zoom_level;
    
    public $connexion;
    
    public $ind_data;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema($this->getDI()->getConfig()->database->schema);

        $this->belongsTo("contexte_id", "IgoContexte", "id",  array(
            'reusable' => true
        ));
        
        $this->belongsTo("couche_id", "IgoCouche", "id", array('reusable' => true));


    }

}
