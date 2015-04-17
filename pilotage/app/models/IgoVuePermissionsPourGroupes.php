<?php
class IgoVuePermissionsPourGroupes extends \Phalcon\Mvc\Model{
    
    public $groupe_id;
    public $profil_id;
    public $est_lecture;
    public $est_analyse;
    public $est_ecriture;
    public $est_export;
    public $est_association;
    
    /**
     * Initialize method for model.
     */
    public function initialize(){
        $this->setSchema($this->getDI()->getConfig()->database->schema);

    }

    /**
     * Independent Column Mapping.
     */
    public function columnMap(){
        return array(
            'groupe_id' => 'groupe_id',
            'profil_id' => 'profil_id', 
            'est_lecture' => 'est_lecture',
            'est_analyse' => 'est_analyse',
            'est_ecriture' => 'est_ecriture',
            'est_export' => 'est_export',
            'est_association' => 'est_association'
        );
    }
}

