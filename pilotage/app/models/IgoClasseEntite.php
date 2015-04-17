<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoClasseEntite extends \Phalcon\Mvc\Model {

    /**
     *
     * @var integer
     */
    public $id;

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
     * @var integer
     */
    public $source_entite_id;

    /**
     *
     * @var integer
     */
    public $classification_id;

    /**
     *
     * @var integer
     */
    public $organisme_responsable_id;

    /**
     *
     * @var integer
     */
    public $contact_id;

    /**
     *
     * @var string
     */
    public $remarque;

    /**
     *
     * @var integer
     */
    public $catalogue_csw_id;

    /**
     *
     * @var string
     */
    public $date_modif;
    
    public function delete(){
        foreach ($this->IgoGeometrie as $geometrie){
            $geometrie->delete();
        }

        return parent::delete();
    }
    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoGeometrie", "classe_entite_id",  array(
            'reusable' => true
        ));
        $this->belongsTo("catalogue_csw_id", "IgoCatalogueCsw", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("classification_id", "IgoClassification", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("contact_id", "IgoContact", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("organisme_responsable_id", "IgoOrganismeResponsable", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("source_entite_id", "IgoSourceEntite", "id",  array(
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
     
    public function beforeValidation(){
        
        $this->validate(new PresenceOf(array(
            'field' => 'nom',
            'message' => 'Veuillez indiquer le nom.'
        )));
                
        $this->validate(new IgoStringLength(array(
            'label' => 'Nom',
             'field' => 'nom',
             'max' => 200,
             'min' => 0
         )));
        
        
        $this->validate(new IgoStringLength(array(
            'label' => 'Description dd',
            'field' => 'description',
            'max' => 2000,
            'min' => 0
         )));
       
        $this->validate(new IgoStringLength(array(
            'label' => 'Remarque',
             'field' => 'remarque',
             'max' => 2000,
             'min' => 0
         )));
 
        return !$this->validationHasFailed();
    
    }
    
    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema.'.igo_classe_entite_id_seq';
    }

}
