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
       
    }
    
}
