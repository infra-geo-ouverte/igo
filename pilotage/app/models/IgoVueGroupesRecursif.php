<?php
use Phalcon\Mvc\Model\Query;
class IgoVueGroupesRecursif extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $groupe_id;

    /**
     *
     * @var string
     */
    public $nom;

    /**
     *
     * @var integer
     */
    public $parent_groupe_id;

    /**
     *
     * @var string
     */
    public $nom_complet;

    /**
     *
     * @var string
     */
    public $est_exclu_arbre;

    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        
        // Recette pour obtenir les médatada ($m)    
        // Décommenter les lignes suivantes et accéder l'arborescence d'un 
        // profil dans le pilotage
        $m = ($this->getModelsMetaData()->readMetaData($this));
        echo json_encode($m);
        die();
    }
    
    public function refresh(){
        
        $this->getDI()->get('db')->execute('REFRESH MATERIALIZED VIEW igo_vue_groupes_recursif') ;

    }
    
     /**
     * Spécifier explicitement les métadata parce que Phalcon ne supporte pas 
     * les vues matérialisées
     * @return onject
     */
    public function metaData(){
      // Nécessaire parce que phalcon a de la misère avec les vues matérialisées
      $m = '{"0":["groupe_id","nom","parent_groupe_id","nom_complet","est_exclu_arbre","grp"],"1":[],"2":["groupe_id","nom","parent_groupe_id","nom_complet","est_exclu_arbre","grp"],"3":[],"4":{"groupe_id":0,"nom":2,"parent_groupe_id":0,"nom_complet":2,"est_exclu_arbre":8,"grp":6},"5":{"groupe_id":true,"parent_groupe_id":true},"8":false,"9":{"groupe_id":1,"nom":2,"parent_groupe_id":1,"nom_complet":2,"est_exclu_arbre":5,"grp":2},"10":[],"11":[]}';
      return json_decode($m, true);    
    }

}
