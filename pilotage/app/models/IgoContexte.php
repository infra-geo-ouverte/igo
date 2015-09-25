<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;
use Phalcon\Mvc\Model\Validator\Regex;
use Phalcon\Mvc\Model\Validator\Uniqueness;

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
    
    /**
     *
     * @var bool
     */
    public $generer_onlineresource;

    /**
     *
     * @var integer
     */
    public $profil_proprietaire_id;
    
    /**
     * 
     * @return bool
     */
    function validation(){
        return !$this->validationHasFailed();
    }
   
    /**
     * Génère le contenu du mapfile
     * @return string
     */
   function getMapFile() {
       
        $contexteController = new IgoContexteController();
        $vue = $contexteController->view;
         
        $contexteController->mapfileAction($this->id);
        $vue->preview = false;  
        $contenuMapfile = $vue->getRender('igo_contexte', 'mapfile', null, function($view) {
            $view->setRenderLevel(Phalcon\Mvc\View::LEVEL_ACTION_VIEW);
        });
        $vue->setRenderLevel(Phalcon\Mvc\View::LEVEL_MAIN_LAYOUT);    
        return $contenuMapfile;
    }

    /**
     * Enregistre le contexte
     * @param bool $saveMapFile Le mapfile doit être généré
     * @param array $data Valeurs à assigner au contexte
     * @param array $whiteList Liste des attributs permis
     * @return Le contexte est sauvegardé
     */
    function save($saveMapFile = true, $data = NULL, $whiteList = NULL){
        $sauvegardeReussie = parent::save($data, $whiteList);
        if($saveMapFile && $sauvegardeReussie){
            $this->saveMapFile();            
        } 
        return $sauvegardeReussie;
    }
    
    /**
     * Chemin complet du mapfile
     * @return string
     */
    function getMapfilePath(){
        $config = $this->getDI()->getConfig();
        return $this->getMapfileDir(). $this->getMapfileFileName();
    }

    /**
     * Répertoire complet du mapfile
     * @return string
     */
    function getMapfileDir(){
        $config = $this->getDI()->getConfig();
        return $config['mapserver']['mapfileCacheDir'] . $config['mapserver']['contextesCacheDir'];
    }

    /**
     * Nom complet du fichier associé au contexte
     * @return string
     */
    function getMapfileFileName(){
        return $this->code .".map";
    }

    /**
     * Le mapfile du contexte est déjà créé
     * @return bool
     */
    function mapfileExists(){
        return file_exists($this->getMapfilePath());
    }

    /**
     * S'assurer que le mapfile du contexte existe
     * @return bool Indique si le mapfile a dû être créer
     */
    function creerMapfileSiExistePas(){

        if(!$this->mapfileExists()){

            //Générer le mapfile...
            $this->saveMapFile();
            return true;
        }
        return false;
    }

    /**
     * 
     */
    function saveMapFile(){

        $contenuMapfile = $this->getMapFile();
        $mapfileDir = $this->getMapfileDir();
        if (!file_exists($mapfileDir) && !is_dir($mapfileDir)) {
            mkdir($mapfileDir);         
        } 
        
        $mapfilePath = $mapfileDir . $this->getMapfileFileName();
        if(!(is_writable($mapfileDir) || (file_exists($mapfilePath) && !is_writable($mapfilePath)))){
            
            echo("Impossible d'écrire le fichier $mapfilePath");
            return;
        }
        
        $contenuMapfile = utf8_decode($contenuMapfile);

        file_put_contents($mapfilePath, $contenuMapfile);
    }
    
    /**
     * Supprime le contexte et ses dépendances
     * @return bool À été supprimé
     */
    function delete(){
        foreach ($this->IgoCoucheContexte as $groupe){

            //TODO Gérer le cas où il y a une erreur lors de la suppression d'un groupe
            $groupe->delete();
        }
        return parent::delete();
    }
    
    /**
     * Initialisation du model, voir Model::initialize()
     */
    function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoCoucheContexte", "contexte_id",  array(
            'reusable' => true
        ));
        
        $this->hasMany("id", "IgoVueContexteCoucheNavigateur", "contexte_id",  array(
            'reusable' => true
        ));

        $this->belongsTo("profil_proprietaire_id", "IgoProfil", "id",  array(
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
    

    /**
     * Champs "séquence" de la table
     * @return string
     */
    function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema . '.igo_contexte_id_seq';
    }
    
    /**
     * Voir Model::beforeValidation()
     * @return bool Est valide
     */
    function beforeValidation(){

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
              
            $this->validate(new Uniqueness(array(
                 "field"   => "code",
                 "message" => "Le code doit être unique."
             )));
       
            $this->validate(new Regex(array(
                'field' => 'code',
                'pattern' => '/^[A-Z0-9]{1,}$/i',
                'message' => 'Le code peut seulement contenir les caractères suivants : a-z, 0-9.'
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

        return !$this->validationHasFailed();
    }

    /**
     *
     * @param string $onlineResource Url du online ressource
     * @param string $ancien Placeholder à remplacer
     * @param string $nouveau Remplacement
     * @return string
     */
    static function remplacerCodeDansOnlineResource($onlineResource, $ancien, $nouveau){
        
        //Trouver où est la dernière occurence
        $position = strpos($onlineResource, $ancien);
        
        //Il faut remplacer
        if(false !== $position){
            $onlineResource = substr_replace($onlineResource, $nouveau, $position, strlen($ancien));
            
        }
        
        return $onlineResource;
        
    }
    /**
     * Créé une copie d'un contexte et de ses dépendances (igo_couche_contexte)
     * @param int $idContexteCible Id du contexte où va la copie
     */
    function dupliquer($idContexteCible){

        //Créer les associations couche/contexte
        $igoCoucheContextes = $this->IgoCoucheContexte;
        $nbCoucheContexte = 0;
        foreach($igoCoucheContextes as $igoCoucheContexte){
            
            $nbCoucheContexte++;

            $igoCoucheContexte->dupliquer($idContexteCible);

        }

    }

}