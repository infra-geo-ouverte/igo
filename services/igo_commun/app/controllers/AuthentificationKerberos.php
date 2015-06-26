<?php

class AuthentificationKerberos extends AuthentificationController {

    protected $identifiant;
    protected $profils;
    protected $motDePasseValide;
    protected $motDePasseExpire;
    protected $estAdmin;
    protected $estPilote;
    protected $igo_utilisateur;
    protected $messageErreur = "Erreur d'authentification";

    public function obtenirMessageErreur() {
        return $this->messageErreur;
    }

    public function authentification($identifiant, $motDePasse) {
        
        if(isset($_SERVER['PHP_AUTH_USER'])) {
            $this->identifiant = stristr($_SERVER['PHP_AUTH_USER'], "@", true);
     /*       $igo_utilisateur = new IgoUtilisateur();
            
            $igo_utilisateur->nom = $this->identifiant;
            $igo_utilisateur->est_admin = false;
            $igo_utilisateur->est_pilote = false;
            
            $this->igo_utilisateur = $igo_utilisateur;*/
            $this->estAdmin = true;
            $this->estPilote = false;
            $this->estAnonyme = false;
            $this->estAuthentifie = true;
            $this->profils = "";
            $this->profilActif = "";
            $this->motDePasseExpire = false;
            $this->motDePasseValide = true;
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

}
