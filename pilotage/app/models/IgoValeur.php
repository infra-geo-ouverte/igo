<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;

class IgoValeur extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $description;

    /**
     *
     * @var integer
     */
    public $liste_valeur_id;

    /**
     *
     * @var string
     */
    public $valeur;

    /**
     *
     * @var string
     */
    public $date_modif;

    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->belongsTo("liste_valeur_id", "IgoListeValeur", "id",  array(
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

}
