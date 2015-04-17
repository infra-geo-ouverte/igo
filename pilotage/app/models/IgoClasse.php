<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;

class IgoClasse extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var integer
     */
    public $couche_id;

    /**
     *
     * @var string
     */
    public $mf_class_def;

        /**
     *
     * @var integer
     */
    public $mf_class_z_order; 
    

    /**
     *
     * @var string
     */
    
    
    public $date_modif;

    public function save($saveMapFile = true, $data = NULL, $whiteList = NULL){
        $retour=parent::save($data, $whiteList);
        if($saveMapFile && $this->IgoCouche->IgoGeometrie->acces=="L"){
           $this->IgoCouche->save();
        }
        return $retour;
    }
    
    
    
    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->belongsTo("couche_id", "IgoCouche", "id",  array(
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
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema.'.igo_classe_id_seq';
    }

}
