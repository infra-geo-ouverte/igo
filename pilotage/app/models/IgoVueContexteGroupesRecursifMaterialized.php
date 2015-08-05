<?php

use Phalcon\Mvc\Model\Query;
class IgoVueContexteGroupesRecursifMaterialized extends \Phalcon\Mvc\Model {


    public $groupe_id;

    public $nom;
    
    public $contexte_id;

    public $parent_groupe_id;

    public $nom_complet;

    public $est_exclu_arbre;

    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        

    }
    
    public function refresh(){
        
        $this->getDI()->get('db')->execute('REFRESH MATERIALIZED VIEW igo_vue_contexte_groupes_recursif_materialized');
        
        // #recette métadata
        // Décommenter les lignes suivantes, allez dans le pilotage et modifiez un Groupe.
        //$m = ($this->getModelsMetaData()->readMetaData($this));
        //echo 'Contenu pour le $m de metaData de IgoVueContexteGroupesRecursifMaterialized.php<br>';
        //echo '<textarea>'. json_encode($m).'</textarea>';
        //die();
        // #fin recette métadata

    }
    
    /**
     * Spécifier explicitement les métadata parce que Phalcon ne supporte pas 
     * les vues matérialisées
     * @return onject
     */
    public function metaData(){
 
      // Nécessaire parce que Phalcon a de la misère avec les vues matérialisées
      // La valeur de $m peut être générée en suivant la #recette métadata
      $m = '{"0":["groupe_id","nom","contexte_id","parent_groupe_id","nom_complet","est_exclu_arbre","grp"],"1":[],"2":["groupe_id","nom","contexte_id","parent_groupe_id","nom_complet","est_exclu_arbre","grp"],"3":[],"4":{"groupe_id":0,"nom":2,"contexte_id":0,"parent_groupe_id":0,"nom_complet":6,"est_exclu_arbre":8,"grp":6},"5":{"groupe_id":true,"contexte_id":true,"parent_groupe_id":true},"8":false,"9":{"groupe_id":1,"nom":2,"contexte_id":1,"parent_groupe_id":1,"nom_complet":2,"est_exclu_arbre":5,"grp":2},"10":[],"11":[]}';
      return json_decode($m, true);
        
    }
}
