<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;

class IgoAttribut extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var integer
     */
    public $geometrie_id;

    /**
     *
     * @var string
     */
    public $colonne;

    /**
     *
     * @var string
     */
    public $alias;

    /**
     *
     * @var string
     */
    public $description;

    /**
     *
     * @var string
     */
    public $est_cle;

    /**
     *
     * @var string
     */
    public $est_nom;

    /**
     *
     * @var string
     */
    public $est_description;

    /**
     *
     * @var string
     */
    public $est_filtre;

    /**
     *
     * @var string
     */
    public $est_geométrie;

    /**
     *
     * @var string
     */
    public $est_inclu;

    /**
     *
     * @var integer
     */
    public $liste_valeur_id;

    /**
     *
     * @var string
     */
    public $date_modif;
    
    public function save($saveMapFile = true, $data = NULL, $whiteList = NULL){
        $retour=parent::save($data, $whiteList);
        if($saveMapFile && $this->IgoGeometrie->acces=="L"){
            foreach ($this->IgoGeometrie->IgoCouche as $couche){
                 $couche->saveMapFile();
            }
        }
        return $retour;
    }
    
    public function delete(){
        foreach ($this->IgoListeValeur as $liste){
            $liste->delete();
        }
        return parent::delete();
    }
    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->belongsTo("geometrie_id", "IgoGeometrie", "id", NULL);
        $this->belongsTo("liste_valeur_id", "IgoListeValeur", "id", NULL);
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
        return $this->getDI()->getConfig()->database->schema.'.igo_attribut_id_seq';
    }
}
