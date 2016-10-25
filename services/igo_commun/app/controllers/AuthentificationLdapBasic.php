<?php

/**
 * Module d'authentification Ldap qui prend en charge l'entrée
 * des paramètres Basic Authentication si les valeurs du nom
 * d'utilisateur et mot de passe ne sont pas mentionnées.
 *
 * Pour plus d'information:
 * http://php.net/manual/fr/features.http-auth.php
 */
class AuthentificationLdapBasic extends AuthentificationLdap {

    /**
     * Spécialisation de l'authentification ldap en prenant en considération
     * les variables de serveur PHP_AUTH_USER et PHP_AUTH_PW si
     * les nom d'utilisateur et mot de passe sont null.
     * 
     * @param  string $identifiant Le nom d'utilisateur
     * @param  string $motDePasse  Le mot de passe
     * @return bool Vrai si l'authentification a réussie.
     */
    public function authentification($identifiant, $motDePasse) {
        $valide = false;

        if($identifiant === null && $motDePasse === null) {
           if(isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
              $identifiant = trim($_SERVER['PHP_AUTH_USER']);
              $motDePasse = trim($_SERVER['PHP_AUTH_PW']);
           } 
        }

        if($identifiant !== null && $motDePasse !== null) {
          $valide = parent::authentification($identifiant, $motDePasse);
        }

        return $valide;
    }
}