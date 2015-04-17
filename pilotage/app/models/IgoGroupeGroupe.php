<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoGroupeGroupe extends \Phalcon\Mvc\Model {

    public $id;
    public $groupe_id;
    public $parent_groupe_id;

    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->belongsTo("groupe_id", "IgoGroupe", "id", array(
            'reusable' => true,
            'alias' => 'enfant'
        ));
        $this->belongsTo("parent_groupe_id", "IgoGroupe", "id", array(
            'reusable' => true,
            'alias' => 'parent'
        ));
    }

    public function beforeValidation() {

        $this->validate(new PresenceOf(array(
            'field' => 'groupe_id',
            'message' => 'Veuillez choisir un groupe.'
        )));

        $this->validate(new PresenceOf(array(
            'field' => 'parent_groupe_id',
            'message' => 'Veuillez choisir un groupe.'
        )));

        return !$this->validationHasFailed();
    }

    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema . '.igo_groupe_groupe_id_seq';
    }

}
