<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;

class IgoListeValeur extends \Phalcon\Mvc\Model {

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
     * @var string
     */
    public $date_modif;

    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoAttribut", "liste_valeur_id",  array(
            'reusable' => true
        ));
        $this->hasMany("id", "IgoValeur", "liste_valeur_id",  array(
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
