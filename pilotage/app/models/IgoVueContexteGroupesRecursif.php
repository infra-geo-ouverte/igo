<?php

use Phalcon\Mvc\Model\Query;
class IgoVueContexteGroupesRecursif extends \Phalcon\Mvc\Model {


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
 
}
