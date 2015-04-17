<?php

class SessionController {

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

    public function __construct() {

        $this->identifiant = null;
        $this->estAdmin = false;
        $this->estPilote = false;
        $this->estAnonyme = false;
        $this->profils = null;
        $this->estAuthentifie = false;
        $this->profilActif = null;
    }
}

?>