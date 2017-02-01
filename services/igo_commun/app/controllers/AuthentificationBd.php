<?php
use Phalcon\Db\Column as Column;

class AuthentificationBd extends AuthentificationController {

    protected $identifiant;
    protected $profils;
    protected $motDePasseValide;
    protected $bdconnexion;
    protected $motDePasseExpire;
    protected $estAdmin;
    protected $estPilote;
    protected $igo_utilisateur;
    protected $prenom;
    protected $nom;
    protected $messagesErreur = [];

    public function obtenirMessagesErreur () {
        return $this->messagesErreur;
    }

    /*
     * Libre au developpeur d'implémenter cette fonction
     * selon ses critères pour l'utilisateur.
     * Retourne : bool
     */

    public function estAdmin () {
        return $this->estAdmin;
    }

    /*
     * Libre au developpeur d'implémenter cette fonction
     * selon ses critères pour l'utilisateur.
     * Retourne : bool
     */

    public function estPilote () {
        return $this->estPilote;
    }

    /*
     * Fonction publique permettant l'authentification à un serveur BD.
     * Paramètres : identifiant, mot de passe
     * Définit un message d'erreur dans la variable $this->messagesErreur
     * $this->messagesErreur est utilisé pour afficher un message expliquant
     * pourquoi l'authentification à échouée.
     */

    public function authentification ($identifiant, $motDePasse) {
        // On force miniscule pour éviter de créer des comptes pour chaque orthographe.
        $identifiant = strtolower ($identifiant);

        /* On s'authentifie dans le BD */
        $this->authentifierBD ($identifiant, $motDePasse);

        if ($this->motDePasseExpire) {
            $this->messagesErreur[] = "Votre mot de passe est expiré. Veuillez le changer pour avoir accès au système!";
            return false;
        }
        if (!$this->motDePasseValide) {
            $this->messagesErreur[] = "L'authentification par base de données à échouée.";
        }

        if ($this->motDePasseValide) {
            /* On ajoute l'utilisateur dans la BD */
            $this->igo_utilisateur = IgoUtilisateur::findFirstByNom ($identifiant);

            //L'utilisateur n'existe pas encore dans IGO
            if (!$this->igo_utilisateur) {
                //Créer l'utilisateur
                $this->igo_utilisateur = $this->creerUtilisateur ($identifiant);
            }

            $this->estAdmin = $this->igo_utilisateur->est_admin;
            $this->estPilote = $this->igo_utilisateur->est_pilote;
        }

        return $this->motDePasseValide;
    }

    private function creerUtilisateur ($identifiant) {
        $igo_utilisateur = new IgoUtilisateur();
        $igo_utilisateur->nom = $identifiant;
        $igo_utilisateur->est_admin = false;
        $igo_utilisateur->est_pilote = false;
        if (!$igo_utilisateur->save ()) {
            foreach ($igo_utilisateur->getMessages () as $message) {
                $this->flash->error ($message);
            }
        }
        return $igo_utilisateur;
    }

    public function estAuthentifie () {
        return $this->motDePasseValide;
    }

    /*
     * On prends les profils BD, on récupère les profils correspondant
     * dans la table profil et on les ajoute dans la session profil.
     * Ensuite on prends les profils ajoutés dans la BD, associés à un utilisateur
     * On les ajoute ensuite dans le tableau de profil.
     *
     * On retourne ensuite le tableau profil qui sera stocké dans la session.
     * @return ???
     */

    public function obtenirProfils () {

        $igo_utilisateur_profils = IgoUtilisateurProfil::find ("utilisateur_id = {$this->igo_utilisateur->id}");
        $profilsIgo = IgoProfil::find ();

        $profils_bd = array ();
        $profils_obd = array();

        foreach ($profilsIgo as $profil) {
            foreach ($igo_utilisateur_profils as $igo_utilisateur_profil) {
                if ($profil->id === $igo_utilisateur_profil->profil_id) {
                    array_push ($profils_bd, $profil->toArray ());
                }
            }
        }

        $profilsIgo->rewind ();

        foreach ($profilsIgo as $profil) {
            foreach ($this->profils as $profilBD) {
                if ($profil->nom === $profilBD) {
                    array_push ($profils_obd, $profil->toArray ());
                }
            }
        }

        return array_merge ($profils_bd, $profils_obd);
    }

    public function obtenirIdentifiantUtilisateur () {
        return $this->identifiant;
    }

    public function deconnexion () {

    }

    /**
     *
     * @param string $bdHost
     * @param string $bdPort
     * @param string $identifiant CN
     * @param string $mdp
     * @param string $organisation Ex : o=MSP
     */
    private function tenterAuthentificationBD ($bdHost, $bdPort, $identifiant, $mdp, $organisation) {

        $configuration = $this->getDI ()->get ("config");
        $crypt = $this->getDI ()->get ("crypt");

        $bdconnexion = $this->getDI ()->get ("db");

        $sql = "SELECT client_id::text,  user_id::text,  private_key::text FROM  public.vg_utilisateur WHERE user_id = '{$identifiant}' ";

        if($configuration->application->debug == true){
            error_log($sql);
        }

        $result = $bdconnexion->query($sql);
        $result->setFetchMode(\Phalcon\Db::FETCH_ASSOC);
        if(!$result){
            throw new Exception('Database error');
        }


        while ($r = $result->fetch ()) {
            if ($r['user_id'] == $identifiant) {
                if (empty ($r['private_key'])) {
                    $this->motDePasseValide = false;
                } else if (!empty ($r['private_key'])) {
                    $chaine = $crypt->decryptBase64 (urldecode ($r['private_key']));
                }
                if ($mdp == ltrim (trim ($chaine))) {
                    $this->motDePasseValide = true;
                    $this->identifiant = $identifiant;
                }  else {
                     $this->motDePasseValide = false;
                     $this->messagesErreur[] = "L'authentification à échouée mot de passe invalide."; 
                     //TODO sortir moin violent s.v.p
                     throw new Exception("L'authentification à échouée mot de passe invalide");
                     return $this->messageErreur;
                }
            }
        }


        if (strlen ($mdp) == 0) {
             $this->motDePasseValide = false;
        }

        if ($this->motDePasseValide) {
            $this->messagesErreur = [];
        }

        return true;
    }



     private function getConnection(){
        if(!$this->connection){
            $this->connection = $this->getDi()->get("db");
        }
        return $this->connection;
    }
    /*
     * Fonction identifiant un utilisateur à un BD
     * Cette fonction met à jour la variable $this->profil
     * Retourne true en cas de succes, sinon retourne false.
     */

    private function authentifierBD ($identifiant, $motDePasse) {

      $configuration = $this->getDI()->get("config")->application->authentification->
                          module->{get_class($this->getDI()->get("authentificationModule"))}->config;

        $bdHosts = [];

        if (isset ($configuration->interne)) {
            $bdHosts[] = $configuration->interne;
        }

        if (isset ($configuration->externe)) {
            $bdHosts[] = $bdExterne = $configuration->externe;
        }

        if (isset ($configuration->host)) {
            $bdHosts[] = $configuration->host;
        }

        $bdPort = $configuration->port;

        $organisation = $configuration->organisation;

        $authentificationAReussie = false;

        foreach ($bdHosts as $bdHost) {
            if ($this->tenterAuthentificationBD ($bdHost, $bdPort, $identifiant, $motDePasse, $organisation)) {
                break;
            }
        }
    }

    public function obtenirNom () {
        return $this->nom;
    }

    public function obtenirPrenom () {
        return $this->prenom;
    }

}
