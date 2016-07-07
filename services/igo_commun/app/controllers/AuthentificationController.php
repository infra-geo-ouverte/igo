<?php
use Phalcon\Mvc\Controller;

abstract class AuthentificationController extends Controller{

    /*
     * Fonction retournant le dernier message d'erreur à afficher 
     * en cas d'erreur lors de l'authentification.
     */
    abstract public function obtenirMessagesErreur();        

    /*
     * Fonction publique permettant l'authentification à un serveur LDAP.
     * Paramètres : identifiant, mot de passe
     * Définit un message d'erreur dans la variable $this->messageErreur
     * $this->messageErreur est utilisé pour afficher un message expliquant
     * pourquoi l'authentification à échouée.
     */
    abstract public function authentification($identifiant, $motDePasse);

    /*
     * On prends les profils LDAP, on récupère les profils correspondant
     * dans la table profil et on les ajoute dans la session profil.
     * Ensuite on prends les profils ajoutés dans la BD, associés à un utilisateur
     * On les ajoute ensuite dans le tableau de profil.
     *
     * On retourne ensuite le tableau profil qui sera stocké dans la session.
     */
    abstract public function obtenirProfils();

    /*
     * Fonction appellée après la déconnexion de l'application.
     * A implémenter si le développeur désire faire des actions après déconnexion.
     * Laisser vide le cas contraire.
     */
    abstract public function deconnexion();

    /*
     * Libre au developpeur d'implémenter cette fonction
     * selon ses critères pour l'utilisateur.
     * Retourne : bool
     */
    abstract public function estAdmin();

    /*
     * Libre au developpeur d'implémenter cette fonction
     * selon ses critères pour l'utilisateur.
     * Retourne : bool
     */
    abstract public function estPilote();

    /*
     * Libre au developpeur d'implémenter cette fonction
     * selon ses critères pour l'utilisateur.
     * Retourne : String
     */
    abstract public function obtenirPrenom();

    /*
     * Libre au developpeur d'implémenter cette fonction
     * selon ses critères pour l'utilisateur.
     * Retourne : String
     */
    abstract public function obtenirNom();
            
}