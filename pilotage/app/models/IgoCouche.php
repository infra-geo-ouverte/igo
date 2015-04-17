<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\StringLength;
use Phalcon\Mvc\Model\Validator\Uniqueness;
use Phalcon\Mvc\Model\Validator\PresenceOf;

function ordre_z($a, $b) {
    return $a->mf_class_z_order > $b->mf_class_z_order;
}

class IgoCouche extends \Phalcon\Mvc\Model {

    public $id;
    public $description;
    public $geometrie_id;
    public $est_commune;
    public $est_publique;
    public $vue_validation;
    public $mf_layer_name;
    public $mf_layer_group;
    public $mf_layer_meta_name;
    public $mf_layer_meta_group_title;
    public $mf_layer_meta_title;
    public $mf_layer_filtre;
    public $mf_layer_minscale_denom;
    public $mf_layer_maxscale_denom;
    public $mf_layer_labelitem;
    public $mf_layer_labelminscale_denom;
    public $mf_layer_labelmaxscale_denom;
    public $mf_layer_opacity;
    public $mf_layer_meta_z_order;
    public $layer_a_order;
    public $mf_layer_def;
    public $mf_layer_meta_def;
    public $service_tuile;
    public $fiche_csw_id;
    public $mf_layer_meta_wfs_max_feature;
    public $est_fond_de_carte;
    public $date_modif;
    public $max_zoom_level;
    public $min_zoom_level;
    public $mf_layer_meta_attribution_title;

    function getMapFile() {

        $coucheController = new IgoCoucheController();
        $vue = $coucheController->view;

        $mapfileInclude = '';
        $config = $this->getDI()->getConfig();
        if(isset($config->mapserver->mapfileInclude)){  
            foreach($config->mapserver->mapfileInclude as $chemin){
                $mapfileInclude .=  $this->fopen_file_get_contents($chemin);  
            } 
        }
        $vue->mapfileInclude = $mapfileInclude;
        
        $vue->preview = false;
        $vue->couche = $this->getMapFileArray();
        $vue->setRenderLevel(Phalcon\Mvc\View::LEVEL_LAYOUT);
        $vue->start();
        $vue->render('gestion_couche', 'mapfile'); //Pass a controller/action as parameters if required
        $vue->finish();

        $contenuMapfile = $vue->getContent();

        $vue->setRenderLevel(Phalcon\Mvc\View::LEVEL_MAIN_LAYOUT);

        return $contenuMapfile;
    }

    public function saveContextesMapFile() {
        foreach ($this->IgoVueContexteCoucheNavigateur as $couchecontexte) {
            $couchecontexte->IgoContexte->saveMapFile();
        }
    }

    public function saveMapFile($saveContexte = true) {

        $cacheMapfileDir = $this->getDI()->getConfig()->mapserver->mapfileCacheDir;
        $contenuMapfile = $this->getMapFile();
        $couchesCacheDir = $this->getDI()->getConfig()->mapserver->couchesCacheDir;
        
        $dir = $cacheMapfileDir . $couchesCacheDir;
        if (!file_exists($dir) && !is_dir($dir)) {
            mkdir($dir);
        }

        $cle = $dir . $this->mf_layer_name . ".map";

        file_put_contents($cle, $contenuMapfile);
        if ($saveContexte) {
            $this->saveContextesMapFile();
        }
    }

    public function save($saveMapFile = true, $data = NULL, $whiteList = NULL) {

        $retour = parent::save($data, $whiteList);
        if ($saveMapFile && $this->IgoGeometrie->acces == "L") {
            $this->saveMapFile();
        }
        return $retour;
    }

    public function delete() {
        foreach ($this->IgoCoucheContexte as $groupe) {
            $groupe->delete();
        }
        foreach ($this->IgoPermission as $permission) {
            $permission->delete();
        }
        foreach ($this->IgoClasse as $classe) {
            $classe->delete();
        }
        return parent::delete();
    }

    public function include_items($igo_profil) {
        $include_list = "";
        if ($this->IgoGeometrie->ind_inclusion == "I") {
            foreach ($this->IgoGeometrie->IgoAttribut as $value) {
                if ($value->est_inclu) {
                    $include_list = $include_list . ', "' . $value->colonne . '"';
                }
            }
        }
        if ($include_list <> "") {

            $include_list = substr($include_list, 1);
        } else {
            $include_list = '"all"';
        }

        return '"gml_include_items" ' . $include_list;
    }

    public function exclude_items($igo_contexte, $igo_profil) {

        $exclude_list = "";

        if ($this->IgoGeometrie->ind_inclusion == "E") {
            foreach ($this->IgoGeometrie->IgoAttribut as $value) {
                if (!$value->est_inclu) {
                    $exclude_list = $exclude_list . ', ' . $value->colonne;
                }
            }
        }
        $igo_couche_contexte = IgoCoucheContexte::find("couche_id=" . $this->id . "and contexte_id=" . $igo_contexte->id . "and est_exclu");


        foreach ($igo_couche_contexte as $value) {
            $exclude_list = $exclude_list . ', ' . $value->IgoAttribut->colonne;
        }

        if ($igo_profil && (isset($igo_profil->id))) {
                
            $igo_permission = IgoPermission::find("couche_id=" . $this->id . "and profil_id=" . $igo_profil->id . "and est_exclu");
            foreach ($igo_permission as $value) {
                $exclude_list = $exclude_list . ', ' . $value->IgoAttribut->colonne;
            }
        }
        
        if ($exclude_list <> "") {
            $exclude_list = substr($exclude_list, 2);
            return '"gml_exclude_items" "' . $exclude_list . '"';
        } else
            return '';
    }

    public function mf_layer_filter($igo_profil) {

        if (!$igo_profil || (!isset($igo_profil->id))) {
            return $this->mf_layer_filtre;
        }

        $filtre = "";

        $igo_permission = $this->getPermissionProfil($igo_profil->id);
        foreach ($igo_permission as $value) {
            if (!is_null($value["mf_layer_filtre"]) && trim($value["mf_layer_filtre"]) <> "") {
                if ($filtre <> "") {
                    if ((strpos($filtre, " " . $value["mf_layer_filtre"] . " ") == 0) && $value["mf_layer_filtre"] <> $this->mf_layer_filtre) {
                        $filtre = $filtre . "or " . $value["mf_layer_filtre"] . " ";
                    }
                } else {
                    $filtre = $value["mf_layer_filtre"] . " ";
                }
            }
        }

        if (strpos($filtre, " or ") > 0) {
            $filtre = "(" . $filtre . ")";
        }

        if (!is_null($filtre) && trim($filtre) <> "" and !is_null($this->mf_layer_filtre) && trim($this->mf_layer_filtre) <> "") {
            $filtre = $filtre . ' and ';
        }
        $filtre = $filtre . $this->mf_layer_filtre;

        return $filtre;
    }

    public function getMapfileArray($igo_contexte = null, $igo_profil = null) {


        $coucheArray = $this->toArray();

        /**
         * Récupération du lien du contexte
         */
        // $classe_couchecontexte =null;
        if (!is_null($igo_contexte)) {
            foreach ($this->IgoCoucheContexte as $couchecontexte) {
                if ($couchecontexte->contexte_id == $igo_contexte->id) {
                    $classe_couchecontexte = $couchecontexte;
                }
            }
            if (!isset($classe_couchecontexte)) {
                $groupe = $this->IgoGroupe;
                while ($groupe) {
                    if (!is_null($groupe->IgoCoucheContexte) && isset($groupe->IgoCoucheContexte->contexte_id)) {
                        //var_dump($groupe->IgoCoucheContexte);
                        if ($groupe->IgoCoucheContexte->contexte_id == $igo_contexte->id) {
                            $classe_couchecontexte = $groupe->IgoCoucheContexte;
                        }
                    }
                    $groupe = $groupe->IgoGroupe;
                }
            }
        }
        
        // C'est pas clean, mais cette fonction est utilisé de différentes facon
        /*
        if (isset($classe_couchecontexte) && trim($classe_couchecontexte->mf_layer_name) != '') {
            $coucheArray["mf_layer_name"] = $classe_couchecontexte->mf_layer_name;
        }
        */
        
        //$coucheArray["url"] = $this->IgoGeometrie->IgoClasseEntite->IgoCatalogueCsw->url;
        $coucheArray["layer_type"] = $this->IgoGeometrie->IgoGeometrieType->layer_type;
        $coucheArray["acces"] = $this->IgoGeometrie->acces;

        $coucheArray["mf_layer_group"] = (isset($classe_couchecontexte) && trim($classe_couchecontexte->mf_layer_meta_group_title) != '') ? $classe_couchecontexte->mf_layer_meta_group_title : $this->mf_layer_group;

        // Je ne comprend vraiment pas le pourquoi de $classe_couchecontexte....
        //$coucheArray["est_active"] = (isset($classe_couchecontexte) && trim($classe_couchecontexte->est_active) != '') ? $classe_couchecontexte->est_active : $this->est_active;
        //$coucheArray["est_visible"] = (isset($classe_couchecontexte) && trim($classe_couchecontexte->est_visible) != '') ? $classe_couchecontexte->est_visible : $this->est_visible;


        if ($coucheArray["mf_layer_group"] == "") {
            //TODO Écraser avec le getNom de la couche
        }

        if (isset($this->mf_layer_meta_wfs_max_feature)) {
            $coucheArray["wfs_maxfeatures"] = '"wfs_maxfeatures" "' . $this->mf_layer_meta_wfs_max_feature . '"';
        } else {
            $coucheArray["wfs_maxfeatures"] = "";
        }


        if (isset($this->IgoGeometrie->IgoConnexion) && $this->IgoGeometrie->IgoConnexion != null) {
            $coucheArray["connexion_type"] = $this->IgoGeometrie->IgoConnexion->IgoConnexionType->nom;
            $coucheArray["connexion"] = str_replace("\n", "\n\t\t", ltrim($this->IgoGeometrie->IgoConnexion->connexion));
        }

        foreach ($this->IgoGeometrie->IgoAttribut as $attribut) {
            if ($attribut->est_geometrie) {
                $attribut_colonne = $attribut->colonne;
            }
            if ($attribut->est_cle) {
                $attribut_unique = $attribut->colonne;
            }
        }

        $coucheArray["mf_layer_data"] = $this->IgoGeometrie->mf_layer_data;
        if (isset($attribut_colonne)) {
            $coucheArray["mf_layer_data"] = $attribut_colonne . " from " . $this->IgoGeometrie->vue_defaut . " using " . ((isset($attribut_unique)) ? " unique " . $attribut_unique : "") . " srid=" . $this->IgoGeometrie->mf_layer_projection;
        }

        if (!is_null($igo_profil)) {
            
            $coucheArray["mf_layer_filter"] = $this->mf_layer_filter($igo_profil);
        } else {
            $coucheArray["mf_layer_filter"] = $this->mf_layer_filtre;
        }
        
        $mf_layer_projection = trim($this->IgoGeometrie->mf_layer_projection);

        //On a une projection EPSG
        if (is_numeric($mf_layer_projection)) {
         //   $mf_layer_projection = "\"init=epsg:" . $mf_layer_projection . "\"";
            
        //On a une projection avec des paramètres "inline"
        } else if ($mf_layer_projection) {
            
            $mf_layer_projection = str_replace('" ', '\n ', $mf_layer_projection);
            $mf_layer_projection = str_replace('"', "\t\t\t", $mf_layer_projection);
            
        }
        $coucheArray["mf_layer_projection"] = $mf_layer_projection;


        $coucheArray["wms_group_title"] = (isset($classe_couchecontexte) && trim($classe_couchecontexte->mf_layer_meta_group_title) != '') ? $classe_couchecontexte->mf_layer_meta_group_title : (isset($this->mf_layer_meta_group_title) && trim($this->mf_layer_meta_group_title) != '') ? $this->mf_layer_meta_group_title : ($this->IgoGroupe ? $this->IgoGroupe->getNomComplet() : "");
        $coucheArray["wms_group_title"] = trim($coucheArray["wms_group_title"], "/");

        //$coucheArray["wms_name"] = (isset($classe_couchecontexte) && trim($classe_couchecontexte->mf_layer_meta_name) != '') ? $classe_couchecontexte->mf_layer_meta_name : $this->mf_layer_name;
        $coucheArray["wms_name"] = $this->mf_layer_meta_name;
        $coucheArray["mf_layer_name"] = $this->mf_layer_name;
        $coucheArray["wms_title"] = (isset($classe_couchecontexte) && trim($classe_couchecontexte->mf_layer_meta_title) != '') ? $classe_couchecontexte->mf_layer_meta_title : $this->mf_layer_meta_title;

        if (isset($this->est_fond_de_carte) && $this->est_fond_de_carte) {
            $coucheArray["mf_layer_meta_z_order"] = 0;
        } else {
            $coucheArray["mf_layer_meta_z_order"] = (isset($classe_couchecontexte) && trim($classe_couchecontexte->mf_layer_meta_z_order) != '') ? $classe_couchecontexte->mf_layer_meta_z_order : ((trim($this->mf_layer_meta_z_order) != '') ? $this->mf_layer_meta_z_order : $this->IgoGeometrie->IgoGeometrieType->mf_layer_meta_z_order);
        }



        $coucheArray["mf_layer_meta_def"] = str_replace("\n", "\n\t\t\t", ltrim($this->mf_layer_meta_def));

        if (!is_null($igo_profil)) {
            $coucheArray["include_items"] = $this->include_items($igo_profil);
            $coucheArray["exclude_items"] = $this->exclude_items($igo_contexte, $igo_profil);
        }else{
            $coucheArray["include_items"] = '';
            $coucheArray["exclude_items"] = '';
        }

        $classes = $this->IgoClasse;
        $classes = iterator_to_array($classes);
        usort($classes, "ordre_z");
        $coucheArray["mf_layer_class_def"] = "";
        foreach ($classes as $classe) {
            $coucheArray["mf_layer_class_def"] = $coucheArray["mf_layer_class_def"] . "\n" .
                    ((isset($classe_couchecontexte) && trim($classe_couchecontexte->mf_layer_class_def) != '') ? str_replace("\n", "\n\t\t", "\t\t" . ltrim($classe_couchecontexte->mf_layer_class_def)) : str_replace("\n", "\n\t\t", "\t\t" . ltrim($classe->mf_class_def)));
        }
        return $coucheArray;
    }

    public function getPermissionProfil($profil_id) {
        $igo_permission = IgoPermission::find("couche_id=" . $this->id . "and profil_id=" . $profil_id)->toArray();

        $groupe = $this->IgoGroupe;
        while ($groupe) {
            $igo_permission = array_merge($igo_permission, IgoPermission::find("groupe_id=" . $groupe->id . "and profil_id=" . $profil_id)->toArray());
            $groupe = $groupe->IgoGroupe;
        }
        return $igo_permission;
    }

    public function getCouche($profil_id = null, $utilisateur_id = null) {
        if ((is_null($profil_id) || trim($profil_id) == "") && (is_null($utilisateur_id) || trim($utilisateur_id) == "")) {
            $sql = " SELECT c.*, true as est_visible, false as est_active, true as est_lecture, true as est_ecriture, true as est_analyse, true as est_export" .
                    " FROM  igo_couche c where c.id={$this->id}; ";
        } else if (!is_null($profil_id) && trim($profil_id) <> "") {
            $sql = "SELECT c.*, true as est_visible, false as est_active,est_lecture or est_publique as est_lecture, est_ecriture, est_analyse, est_export"
                    . " FROM  igo_couche c LEFT JOIN igo_permission p ON  c.id=p.couche_id and p.profil_id=" . $profil_id . " where c.id={$this->id} ";
        } else {

            $sql = " SELECT c.*, est_visible, est_active, est_lecture or est_publique as est_lecture, est_ecriture, est_analyse, est_export"
                    . " FROM igo_couche c LEFT JOIN igo_permission p, igo_utilisateur_profil up ON c.id=p.couche_id and and p.profil_id=up.profil_id and up.utilisateur_id=" . $utilisateur_id . ""
                    . " where c.id={$this->id}";
        }

        $igo_couche = new IgoCouche();
        $igo_couche = new Resultset(null, $igo_couche, $igo_couche->getReadConnection()->query($sql));

        return $igo_couche;
    }

    /**
     * Initialize method for model.
     */
    public function initialize() {
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
        $this->belongsTo("groupe_couche_id", "IgoGroupeCouche", "id", array(
            'reusable' => true
        ));
        
        $this->belongsTo("groupe_id", "IgoGroupe", "id", array(
            'reusable' => true
        ));

        $this->addBehavior(new Timestampable(array(
            'beforeCreate' => array(
                'field' => 'date_modif',
                'format' => 'Y-m-d H:i:s'
            ),
            'beforeUpdate' => array(
                'field' => 'date_modif',
                'format' => 'Y-m-d H:i:s'
            )
        )));
    }
        
    public function beforeValidation(){
        
        $this->validate(new PresenceOf(array(
            'field' => 'geometrie_id',
            'message' => 'Veuillez sélectionner une géométrie.'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Description',
            'field' => 'description',
            'max' => 2000,
            'min' => 0
        )));
            
        $this->validate(new PresenceOf(array(
            'field' => 'mf_layer_name',
            'message' => 'Veuillez indiquer le nom de code.'
        )));
                
        $this->validate(new IgoStringLength(array(
            'label' => 'Nom de code',
            'field' => 'mf_layer_name',
            'max' => 150,
            'min' => 0
        )));

        $this->validate(new IgoStringLength(array(
            'label' => 'Titre',
            'field' => 'mf_layer_meta_title',
            'max' => 150,
            'min' => 0
        )));

        $this->validate(new IgoStringLength(array(
            'label' => 'Code de groupe',
            'field' => 'mf_layer_group',
            'max' => 300,
            'min' => 0
        )));    
        
        //mf_layer_meta_title peut ne pas être unique...
             
        $this->validate(new PresenceOf(array(
            'field' => 'mf_layer_meta_title',
            'message' => 'Veuillez indiquer le titre.'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Titre',
            'field' => 'mf_layer_meta_title',
            'max' => 150,
            'min' => 0
        )));
                        
        $this->validate(new IgoStringLength(array(
            'label' => 'Code de groupe',
            'field' => 'mf_layer_group',
            'max' => 300,
            'min' => 0
        )));
                                    
        $this->validate(new IgoStringLength(array(
            'label' => 'mf_layer_meta_name',
            'field' => 'mf_layer_meta_name',
            'max' => 150,
            'min' => 0
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Condition d\'affichage',
            'field' => 'mf_layer_filtre',
            'max' => 1000,
            'min' => 0
        ))); 

        $this->validate(new IgoEntier(array(
            'label' => 'Ordre Z',
            'field' => 'mf_layer_meta_z_order'
        )));   
        
        
        $this->validate(new IgoEntier(array(
            'label' => 'Échelle minimale d\'affichage',
            'field' => 'mf_layer_minscale_denom'
        )));       
        
        $this->validate(new IgoEntier(array(
            'label' => 'Échelle maximale d\'affichage',
            'field' => 'mf_layer_maxscale_denom'
        )));       
        
        $this->validate(new IgoEntier(array(
            'label' => 'Échelle minimale d\'affichage des étiquettes',
            'field' => 'mf_layer_labelminscale_denom'
        )));        
        $this->validate(new IgoEntier(array(
            'label' => 'Échelle maximale d\'affichage des étiquettes',
            'field' => 'mf_layer_labelmaxscale_denom'
        )));    
        
        $this->validate(new IgoEntier(array(
            'label' => 'Opacité',
            'field' => 'mf_layer_opacity'
        )));      
        $this->validate(new IgoEntier(array(
            'label' => 'Nombre maximale d\'éléments WFS',
            'field' => 'mf_layer_meta_wfs_max_feature'
        )));
        
                                      
        $this->validate(new IgoStringLength(array(
            'label' => 'Mf Of Layer Of Meta Of Def',
            'field' => 'mf_layer_meta_def',
            'max' => 2000,
            'min' => 0
        )));
                                  
        $this->validate(new IgoStringLength(array(
            'label' => 'Mf Of Layer Of Def',
            'field' => 'mf_layer_def',
            'max' => 2000,
            'min' => 0
        )));
                                    
        $this->validate(new IgoStringLength(array(
            'label' => 'Service de tuile',
            'field' => 'service_tuile',
            'max' => 500,
            'min' => 0
        )));
                          
        //TODO utiliser un regex
        $this->validate(new IgoStringLength(array(
            'label' => 'Id de fiche de métadonnées (catalogue CSW)',
            'field' => 'fiche_csw_id',
            'max' => 50,
            'min' => 0
        )));
    
                                    
        $this->validate(new IgoStringLength(array(
            'label' => 'Hiérarchie et/ou titre du groupe(obligatoire si on a un code de groupe)',
            'field' => 'mf_layer_meta_group_title',
            'max' => 200,
            'min' => 0
        )));
                                    
        $this->validate(new IgoStringLength(array(
            'label' => 'Nom de l\'attribut d\'affichage des étiquettes',
            'field' => 'mf_layer_labelitem',
            'max' => 200,
            'min' => 0
        )));
                                    
        $this->validate(new IgoStringLength(array(
            'label' => 'mf_layer_meta_name',
            'field' => 'print_option_url',
            'max' => 200,
            'min' => 0
        )));
                                    
        $this->validate(new IgoStringLength(array(
            'label' => 'mf_layer_meta_name',
            'field' => 'print_option_layer_name',
            'max' => 100,
            'min' => 0
        )));
        
       $this->validate(new IgoEntier(array(
            'label' => 'Niveau de zoom maximum',
            'field' => 'max_zoom_level'
        ))); 
          
        $this->validate(new IgoEntier(array(
            'label' => 'Niveau de zoom minimum',
            'field' => 'min_zoom_level'
        ))); 
                        
        $this->validate(new IgoStringLength(array(
            'label' => 'Attribution',
            'field' => 'mf_layer_meta_attribution_title',
            'max' => 5000,
            'min' => 0
        )));
        
        if($this->max_zoom_level < $this->min_zoom_level){
             $this->appendMessage(
                 new Phalcon\Mvc\Model\Message('Veuillez vérifier les minimums et maximums de niveau de zoom.<br>'
                     . 'Le maximum doit être plus grand que le minimum', '')
             );
        }
      //  var_dump($this->validationHasFailed());die;
        return !$this->validationHasFailed();
    }

    public function validation() {

        $validation = new Phalcon\Validation();
//echo "test";die;
        $validation->setFilters('mf_layer_name', 'trim');
        $validation->setFilters('mf_layer_meta_title', 'trim');
        $validation->setFilters('mf_layer_group', 'trim');
        $validation->setFilters('mf_layer_meta_group_title', 'trim');
        $validation->setFilters('fiche_csw_id', 'trim');
        $validation->setFilters('mf_class_def', 'trim');
        $validation->setFilters('mf_layer_labelitem', 'trim');
        $validation->setFilters('mf_layer_def', 'trim');
        $validation->setFilters('mf_layer_meta_def', 'trim');
        $validation->setFilters('mf_layer_filtre', 'trim');
        $validation->setFilters('vue_validation', 'trim');
        $validation->setFilters('description', 'trim');     
        
        
    }

    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema . '.igo_couche_id_seq';
    }
    
    //TODO Rendre cette fonctionalité disponible pour tous les models
    public static function findByRawSql($conditions, $params=null){
        // A raw SQL statement
        $sql = "SELECT * FROM igo_couche WHERE $conditions";

        // Base model
        $igoCouche = new IgoCouche();

        // Execute the query
        return new Phalcon\Mvc\Model\Resultset\Simple(null, $igoCouche, $igoCouche->getReadConnection()->query($sql, $params));
    }
    
    /**
     * Retourne toutes les couches associables
     */
    public static function findEstAssociable($params = null) {
    
        $profils = \Phalcon\DI::getDefault()->getSession()->get("info_utilisateur")->profils;
        $profil_ids = array();
        
        foreach($profils as $profil) {
            array_push($profil_ids, $profil["id"]);
        }

        $profil_ids = implode(",", $profil_ids);
        $sql = "SELECT DISTINCT igo_vue_permissions_pour_couches.couche_id AS id, igo_couche.mf_layer_name AS nom "
             ." FROM igo_vue_permissions_pour_couches "
             ." INNER JOIN igo_groupe_couche ON igo_groupe_couche.id = igo_vue_permissions_pour_couches.couche_id "
             ." INNER JOIN igo_couche ON igo_couche.id = igo_groupe_couche.couche_id "
             ." WHERE igo_vue_permissions_pour_couches.profil_id IN ({$profil_ids}) AND igo_vue_permissions_pour_couches.est_association";
        $igo_couche = new IgoCouche();

        return new \Phalcon\Mvc\Model\Resultset\Simple(null,
                                                       $igo_couche,
                                                       $igo_couche->getReadConnection()->query($sql, $params));
    }
    
    public function fopen_file_get_contents($cheminFichier) {
        $contenu = '';
        $handle = fopen($cheminFichier, 'r');
        if ($handle) {
            $contenu = fread($handle, filesize($cheminFichier));
        }
        return $contenu;
    }

}
