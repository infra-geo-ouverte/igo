<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;
use Phalcon\Mvc\Model\Validator\Regex;

class IgoContexte extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $mode;

    /**
     *
     * @var string
     */
    public $position;

    /**
     *
     * @var double
     */
    public $zoom;

    /**
     *
     * @var string
     */
    public $code;

    /**
     *
     * @var string
     */
    public $nom;

    /**
     *
     * @var string
     */
    public $description;

        /**
     *
     * @var string
     */
    public $ind_ordre_arbre;
    /**
     *
     * @var string
     */
    public $mf_map_def;

    /**
     *
     * @var integer
     */
    public $mf_map_projection;
    
        /**
     *
     * @var string
     */
    public $mf_map_meta_onlineresource;

    /**
     *
     * @var string
     */
    public $date_modif;

    /**
     *
     * @var string
     */
    public $json;
    
    public $generer_onlineresource;

    /**
     *
     * @var integer
     */
    public $profil_proprietaire_id;
    
   public function validation(){
        return !$this->validationHasFailed();
   }
   
    
   function getMapFile() {
       
        $contexteController= new IgoContexteController();
        $vue=$contexteController->view;
         
        $contexteController->mapfileAction($this->id);
        $vue->preview = false;  
        $contenuMapfile = $vue->getRender('igo_contexte', 'mapfile', null, function($view) {
            $view->setRenderLevel(Phalcon\Mvc\View::LEVEL_ACTION_VIEW);
        });
        $vue->setRenderLevel(Phalcon\Mvc\View::LEVEL_MAIN_LAYOUT);    
        return $contenuMapfile;
    }

    
    public function save($saveMapFile = true, $data = NULL, $whiteList = NULL){
        $retour=parent::save($data, $whiteList);
        if($saveMapFile && $retour){
            $this->saveMapFile();            
        } 
        return $retour;
    }
    
    public function saveMapFile(){
        $cacheMapfileDir = $this->getDI()->getConfig()->mapserver->mapfileCacheDir;
        $contextesCacheDir = $this->getDI()->getConfig()->mapserver->contextesCacheDir;
        $contenuMapfile = $this->getMapFile();
        $dir = $cacheMapfileDir . $contextesCacheDir;
        if (!file_exists($dir) && !is_dir($dir)) {
            mkdir($dir);         
        } 
        
        $cle = $dir . $this->code .".map";
        if(!(is_writable($dir) || (file_exists($cle) && !is_writable($cle)))){
            
            echo("Impossible d'écrire le fichier $cle");
            return;
        }
        
        $contenuMapfile = utf8_decode($contenuMapfile);
        
        file_put_contents($cle, $contenuMapfile);
    }
    
    
    public function delete(){
        foreach ($this->IgoCoucheContexte as $groupe){
            $groupe->delete();
        }
        return parent::delete();
    }
    
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoCoucheContexte", "contexte_id",  array(
            'reusable' => true
        ));
        
        $this->hasMany("id", "IgoVueContexteCoucheNavigateur", "contexte_id",  array(
            'reusable' => true
        ));

        $this->belongsTo("profil_proprietaire_id", "IgoProfil", "id");

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
    

    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema.'.igo_contexte_id_seq';
    }
    
    public function beforeValidation(){

        $this->validate(new PresenceOf(array(
            'field' => 'nom',
            'message' => 'Veuillez indiquer le nom.'
        )));
        
        $this->validate(new PresenceOf(array(
            'field' => 'code',
            'message' => 'Veuillez spécifier le code.'
        )));
         
        $this->validate(new PresenceOf(array(
            'field' => 'mf_map_projection',
            'message' => 'Veuillez spécifier la projection.'
        )));

        $this->validate(new PresenceOf(array(
            'field' => 'mf_map_meta_onlineresource',
            'message' => 'Veuillez spécifier un <i>Online Resource</i>.'
        )));
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Nom',
             'field' => 'nom',
             'max' => 100,
             'min' => 0
        )));

        $this->validate(new IgoStringLength(array(
            'label' => 'Code',
             'field' => 'code',
             'max' => 100,
             'min' => 0
        )));
        
        if($this->code){
              
            $this->validate(new Phalcon\Mvc\Model\Validator\Uniqueness(array(
                 "field"   => "code",
                 "message" => "Le code doit être unique."
             )));
       
            $this->validate(new Regex(array(
                'field' => 'code',
                'pattern' => '/^[A-Z0-9]{1,}$/i',
                'message' => 'Le code peux seulement contenir les caractères suivants : a-z, 0-9.'
            )));
        }
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Description',
            'field' => 'description',
            'max' => 2000,
            'min' => 0
         )));
        
        $this->validate(new Regex(array(
            'field' => 'mode',
            'pattern' => '/^(l|p)$/',
            'message' => 'Vous devez choisir un mode.'
        )));

         
        $this->validate(new IgoStringLength(array(
            'label' => 'Position',
             'field' => 'position',
             'max' => 50,
             'min' => 0
         )));
    
        if($this->zoom){
             $this->validate(new Regex(array(
                'field' => 'zoom',
                'pattern' => '/^1?[0-9]([,.][0-9]{0,2})?$/',
                'message' => 'Zoom est invalide.'
            )));
        }
        
     
        $this->validate(new IgoStringLength(array(
            'label' => 'Mf Map Def',
             'field' => 'mf_map_def',
             'max' => 2000,
             'min' => 0
         )));
 
        $this->validate(new IgoStringLength(array(
            'label' => 'Projection',
             'field' => 'mf_map_projection',
             'max' => 200,
             'min' => 0
         )));
 
        $this->validate(new IgoStringLength(array(
            'label' => 'OnlineResource',
             'field' => 'mf_map_meta_onlineresource',
             'max' => 1000,
             'min' => 0
         )));
  
        $this->validate(new IgoStringLength(array(
            'label' => 'JSON',
             'field' => 'json',
             'max' => 2000,
             'min' => 0
         )));

        $info_u  = $this->getDi()->getSession()->get("info_utilisateur");
        $profils = $this->getDi()->getSession()->get("profils");
        if(!$info_u->estAdmin) {
            if(count($profils) == 0) {
                $this->appendMessage(new \Phalcon\Mvc\Model\Message("Vous n'avez pas de profils.", ''));
                return false;
            }
 
            if(is_null($this->profil_proprietaire_id)) {
                $this->appendMessage(new \Phalcon\Mvc\Model\Message("Veuillez indiquer le profil propriétaire.", ''));
                return false;
            }

        }

        return !$this->validationHasFailed();
    }
}
