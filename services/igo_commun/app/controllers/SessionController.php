<?php

class SessionController {

    const ROLE_ADMIN = 'admin';

    /*
     * type : string
     */
    public $identifiant;

    /*
     * type : bool
     */
    public $estAdmin;

    /*
     * type : bool
     */
    public $estPilote;

    /*
     * type : bool
     */
    public $estAnonyme;

    /*
     * type : array[integer]
     */
    public $profils;

    /*
     * type : bool
     */
    public $estAuthentifie;

    /*
     * type : integer
     */
    public $profilActif;

     /*
     * type : string
     */
    public $nom;

     /*
     * type : string
     */
    public $prenom;

    public function __construct() {

        $this->identifiant = null;
        $this->estAdmin = false;
        $this->estPilote = false;
        $this->estAnonyme = false;
        $this->profils = null;
        $this->estAuthentifie = false;
        $this->profilActif = null;
        $this->prenom = null;
        $this->nom = null;
    }
    
    /**
     * Vérifie que les permissions passées en paramètre
     * sont associées à l'usager.
     *
     * @param string Une liste variable d'argument des permissions requises.
     * @return bool Vrai si l'usager a tous les permissions requises.
     */
    public function aPermissions() {
        $permis = true;

        $permissions = func_get_args();
        foreach($permissions as $permission) {
            switch($permission) {
                case SessionController::ROLE_ADMIN:
                    $permis = $this->usager->estAdmin;
                    break;
            }

            if(!$permis) {
                break;
            }
        }

        return $permis;
    }

    public function aProfil($idProfil){
        foreach($this->profils as $profil){
            if($profil['id'] == $idProfil){
                return true;
            }
        }
        return false;
    }
}

?>