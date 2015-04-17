<?php

class AuthentificationMSP extends AuthentificationController {
    
    protected $identifiant;
    protected $profils;
    protected $motDePasseValide;
    protected $motDePasseExpire;
    protected $estAdmin;
    protected $estPilote;
    protected $igo_utilisateur;
    
    protected $messageErreur = "";

    public function obtenirMessageErreur(){
        return $this->messageErreur;
    }

    /*
     * Libre au developpeur d'implémenter cette fonction
     * selon ses critères pour l'utilisateur.
     * Retourne : bool
     */
    public function estAdmin() {
        return $this->estAdmin;
    }

    /*
     * Libre au developpeur d'implémenter cette fonction
     * selon ses critères pour l'utilisateur.
     * Retourne : bool
     */
    public function estPilote() {
        return $this->estPilote;
    }
    
    /*
     * Fonction publique permettant l'authentification à un serveur LDAP.
     * Paramètres : identifiant, mot de passe
     * Définit un message d'erreur dans la variable $this->messageErreur
     * $this->messageErreur est utilisé pour afficher un message expliquant
     * pourquoi l'authentification à échouée.
     */
    public function authentification($identifiant, $motDePasse){

        /* On s'authentifie dans le LDAP */
        $this->authentificationLDAP($identifiant, $motDePasse);
    
        if($this->motDePasseExpire){
            $this->messageErreur = "Votre mot de passe est expiré. Veuillez le changer pour avoir accès au système!";
            return false;
        }
        if(!$this->motDePasseValide){
            $this->messageErreur = "L'authentification a échouée.";            
        }

        if($this->motDePasseValide) {
            /* On ajoute l'utilisateur dans la BD */
            $this->igo_utilisateur = IgoUtilisateur::findFirstByNom($identifiant);
            
            //L'utilisateur n'existe pas encore dans IGO
            if(!$this->igo_utilisateur) {
                //Créer l'utilisateur
                $this->igo_utilisateur = $this->creerUtilisateur($identifiant);
            }

            $this->estAdmin = $this->igo_utilisateur->est_admin;
            $this->estPilote = $this->igo_utilisateur->est_pilote;
        }
        
        return $this->motDePasseValide;
    }

    private function creerUtilisateur($identifiant) {
      $igo_utilisateur = new IgoUtilisateur();
      $igo_utilisateur->nom = $identifiant;
      $igo_utilisateur->est_admin = false;
      $igo_utilisateur->est_pilote = false;
      if(!$igo_utilisateur->save()){
           foreach ($igo_utilisateur->getMessages() as $message) {
                $this->flash->error($message);
            }
      }
      return $igo_utilisateur;
    }
  
    public function estAuthentifie(){
        return $this->motDePasseValide;
    }

    /*
     * On prends les profils LDAP, on récupère les profils correspondant
     * dans la table profil et on les ajoute dans la session profil.
     * Ensuite on prends les profils ajoutés dans la BD, associés à un utilisateur
     * On les ajoute ensuite dans le tableau de profil.
     *
     * On retourne ensuite le tableau profil qui sera stocké dans la session.
     */
    public function obtenirProfils(){
      
        $igo_utilisateur_profils = IgoUtilisateurProfil::find("utilisateur_id = {$this->igo_utilisateur->id}");
        $profilsIgo = IgoProfil::find();
        $profils_bd = array();
        $profils_ldap = array();
        
        foreach($profilsIgo as $profil) {
            foreach($igo_utilisateur_profils as $igo_utilisateur_profil) {
                if($profil->id === $igo_utilisateur_profil->profil_id) {
                    array_push($profils_bd, $profil->toArray());
                }
            }
        }

        $profilsIgo->rewind();
      
        foreach($profilsIgo as $profil) {
            foreach($this->profils as $profilLDAP) {
                if($profil->nom === $profilLDAP) {
                    array_push($profils_ldap, $profil->toArray());
                }
            }
        }
          
        return array_merge($profils_bd, $profils_ldap);
    }
  
    public function obtenirIdentifiantUtilisateur(){
        return $this->identifiant;
    }
    
    public function deconnexion(){

    }

    /*
     * Fonction identifiant un utilisateur à un LDAP
     * Cette fonction met à jour la variable $this->profil
     * Retourne true en cas de succes, sinon retourne false.
     */
    private function authentificationLDAP($identifiant, $motDePasse){
    
        $ldapInterne = "ldap.sso.msp.gouv.qc.ca";
        $ldapExterne = "ldapx.sso.msp.gouv.qc.ca";
        $ldapPort = 389;
    
        // Determiner si utilisateur interne ou externe
        if(strlen($identifiant) === 8){
            $ldapHost = $ldapExterne;
        }else{
            $ldapHost = $ldapInterne;
        }
    
        // Se connecter a LDAP
        $ldapconn = ldap_connect( $ldapHost, $ldapPort );
        if(!$ldapconn) {
            //throw new Exception("Could not connect to LDAP");
            return false;
        }
    
        // Bind anonyme a LDAP
        $bind = ldap_bind($ldapconn);
        if (!$bind) {
            //throw new Exception("Could not bind to LDAP");
            return false;            
        }        
    
        // Rechercher nom unique de l'utilisateur
        $organisation = "o=MSP";
        $filter = "(&(cn={$identifiant})(objectclass=person))";
        $searchUser = ldap_search($ldapconn, $organisation, $filter);
        if (!$searchUser) {
            //throw new Exception("Erreur lors de la recherche ldap: LDAP-Error: %s<br>\n" .  ldap_error($ldapconn));			
            return false;
        }
        $userEntries = ldap_get_entries($ldapconn, $searchUser);		
        if(count($userEntries) != 2 || $userEntries["count"] != 1){
            //throw new Exception("Could not find user in ldap.");
            return false;
        }
    
        $this->identifiant = $identifiant;
        $this->profils = isset($userEntries[0]["groupmembership"]) ? $userEntries[0]["groupmembership"] : "";
        
        // Verifier que le mot de passe de l'utilisateur n'est pas expiré
        $now = new DateTime();
        if(isset($userEntries[0]["passwordexpirationtime"])){
            $expirationDateTime = new DateTime($userEntries[0]["passwordexpirationtime"][0]);
        }else{
            $expirationDateTime = $now;
        } 
        $this->motDePasseExpire = ($now > $expirationDateTime);
        if($this->motDePasseExpire){
            $this->motDePasseValide = false;
            return false;
        }
    
        // Valider le mot de passe
        $ldapcon2 = ldap_connect($ldapHost, $ldapPort);
        if(strlen($motDePasse) == 0){
            $ldapbind2 = false;
        }else{
            $ldapbind2 = ldap_bind($ldapcon2, $userEntries[0]["dn"], $motDePasse);
        }
        $this->motDePasseValide = $ldapbind2;
    }
}