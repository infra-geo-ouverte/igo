<?php

class AuthentificationTest extends AuthentificationController {

    protected $identifiant;
    protected $profils;
    protected $motDePasseValide;
    protected $motDePasseExpire;
    protected $messageErreur = [];
    protected $nom;
    protected $prenom;

    public function obtenirMessagesErreur() {
        return $this->messageErreur;
    }

    public function authentification($identifiant, $motDePasse) {
        $this->identifiant = $identifiant;
        return true;
    }

    public function estAuthentifie() {
        return !is_null($this->identifiant);
    }

    public function obtenirProfils() {
        $profils = array();
        $profilsIgo = IgoProfil::find();
        foreach($profilsIgo as $profil) {
            array_push($profils, $profil->toArray());
        }
        return $profils;
    }

    public function estAdmin() {
        return ($this->identifiant == "admin");
    }

    public function estPilote() {
        return ($this->identifiant == "pilote");
    }
    

    public function obtenirIdentifiantUtilisateur() {
        return $this->identifiant;
    }

    public function deconnexion() {
        
    }

    public function obtenirNom(){
        return $this->nom;
    }

    public function obtenirPrenom(){
        return $this->prenom;
    }

}
