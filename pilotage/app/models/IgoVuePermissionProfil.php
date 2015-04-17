<?php
class IgoVuePermissionProfil extends \Phalcon\Mvc\Model
{
    public $profil_id;
    public $couche_id;
    public $groupe_id;
    public $est_lecture;
    public $est_analyse;
    public $est_ecriture;
    public $est_export;
    
        /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema($this->getDI()->getConfig()->database->schema);

    }

    /**
     * Independent Column Mapping.
     */
    public function columnMap()
    {
        return array(
            'profil_id' => 'profil_id', 
            'couche_id' => 'couche_id',
            'groupe_id' => 'groupe_id',
            'est_lecture' => 'est_lecture',
            'est_analyse' => 'est_analyse',
            'est_ecriture' => 'est_ecriture',
            'est_export' => 'est_export'
        );
    }
}

