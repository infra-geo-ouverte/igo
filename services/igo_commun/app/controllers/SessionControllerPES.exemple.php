<?php
/**
 * ***************FICHIER EXEMPLE*****************
 * Auteur: Michael Lane, FADQ
 * Cette classe doit être créée si vous désirez définir votre session avec les informations d'une session d'une autre application.
 * L'exemple qui suit permet de retrouver les informations d'une session ouverte sur le même domaine qu'Igo. La session de l'exemple est
 * stockée dans une base de données et les informations se retournées par un service web. Ce service web prend en paramètre le ID de session
 * qui est stocké dans le cookie sous le même domaine qu'Igo.
 * Vous pouvez ajouter les variables désirées dans la session, dans ce cas-ci, un numeroClient a été ajouté
 */
class SessionControllerPES extends SessionController {

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
     * type : bool
     */
    public $persistant;
    
    /*
     * type: string
     */
    public $numeroClient;

    public function __construct() {
		
		//Inclusion des fichiers qui permet d'appeler le service web
        require_once($_SERVER["DOCUMENT_ROOT"] . "/acces_services/autoloader_as.php");
        require_once($_SERVER["DOCUMENT_ROOT"] . "/entites_contrats/autoloader_ec.php");
        
        //Obtenir les informations de la session PES
        $ASInformationsSession = new \FADQ\AccesExterne\Session\ASInformationsSession();
        $informationsSession = $ASInformationsSession->obtenirInformationsSession($_COOKIE["PHPSESSID"]);
        
        //Copier les informations de la session PES vers la session Igo
        if($informationsSession && $informationsSession->codeUsager) {
            $this->identifiant = $informationsSession->codeUsager;
            $this->numeroClient = $informationsSession->numeroClient;
        }
        else
        {
            $this->identifiant = null;
        }        
        
        $this->estAdmin = false;
        $this->estPilote = false;
        $this->estAnonyme = false;
        $this->profils = null;
        $this->estAuthentifie = true;
        $this->profilActif = null;
        $this->persistant = true;       
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