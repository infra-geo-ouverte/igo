<?php

class AuthentificationExterne extends AuthentificationController {

    protected $identifiant;
    protected $profils;
    protected $motDePasseValide;
    protected $motDePasseExpire;
    protected $estAdmin;
    protected $estPilote;
    protected $igo_utilisateur;
    protected $nom;
    protected $prenom;
    protected $messageErreur = ["Erreur d'authentification"];

    public function obtenirMessagesErreur() {
        return $this->messageErreur;
    }

    public function authentification($identifiant, $motDePasse) {
        
        if(isset($_SERVER['PHP_AUTH_USER'])) {
            $this->identifiant = stristr($_SERVER['PHP_AUTH_USER'], "@", true);
            $this->estAdmin = false;
            $this->estPilote = false;
            $this->estAnonyme = false;
            $this->estAuthentifie = true;
            $this->profils = "";
            $this->profilActif = "";
            $this->motDePasseExpire = false;
            $this->motDePasseValide = true;
            $this->prenom = stristr($_SERVER['PHP_AUTH_USER'], "@", true);
            $this->nom = '';
            return true;
        }else{
            return false;
        }
    }

    public function estAuthentifie() {
        return !is_null($this->identifiant);
    }

    public function obtenirProfils() {
        $profils = null;
        
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
        return $this->nom;
    }

}