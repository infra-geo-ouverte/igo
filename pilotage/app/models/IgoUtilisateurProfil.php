<?php

use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoUtilisateurProfil extends \Phalcon\Mvc\Model
{
    public $id;
    /**
     *
     * @var integer
     */
    public $profil_id;
     
    /**
     *
     * @var integer
     */
    public $utilisateur_id;
     
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
        $this->belongsTo("profil_id", "IgoProfil", "id",  array(
            'reusable' => true
        ));
        $this->belongsTo("utilisateur_id", "IgoUtilisateur", "id",  array(
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
            'field' => 'profil_id',
            'message' => 'Veuillez indiquer le profil.'
        )));
       
        $this->validate(new PresenceOf(array(
            'field' => 'utilisateur_id',
            'message' => 'Veuillez indiquer l\'utilisateur'
        )));

        return !$this->validationHasFailed();   
    }

    /*
     *  Fonction retournant les profils de l'utilisateur courant.
     *  Utile dans les cas de création/édition et affichage filtré.
     */
    public static function findProfilsByUser($params = null) {
      $di = \Phalcon\DI::getDefault();

      $utilisateur_id = $di->get("session")->get("info_utilisateur")->id;

      $sql = "SELECT igo_profil.id, igo_profil.libelle FROM igo_utilisateur_profil "
      	. "INNER JOIN igo_profil ON (igo_profil.id = igo_utilisateur_profil.profil_id) "
	. "WHERE igo_utilisateur_profil.utilisateur_id = $utilisateur_id ";
	//. "AND (igo_profil.id = igo_utilisateur_profil.profil_id)";

      $igo_utilisateur_profil = new IgoUtilisateurProfil();

      return new \Phalcon\Mvc\Model\Resultset\Simple(null,
						     $igo_utilisateur_profil,
						     $igo_utilisateur_profil->getReadConnection()->query($sql)
						     );
    }
}
