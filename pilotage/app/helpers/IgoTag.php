<?php

/*
 * http://docs.phalconphp.com/en/latest/reference/tags.html#creating-your-own-helpers
 */

/**
 * Tag (liens) personalisé pour IGO
 */
class IgoTag extends \Phalcon\Tag {
    /*
     *  Fonction qui créé un lien uniquement si l'utilisateur est admin
     */

    public function linkIfAdmin($parameters) {

        $di = \Phalcon\DI::getDefault();

        if ($di->get('session')->get('info_utilisateur')->estAdmin) {
            return $this->linkTo($parameters);
        }
    }

    /*
     *  Fonction qui vérifie si l'utilisateur possède le profil propriétaire
     *  et affiche le lien le cas échéant
     */

    public function linkIfProprietaire($parameters, $proprietaire_id) {

        $di = \Phalcon\DI::getDefault();
        $info_utilisateur = $di->getSession()->get("info_utilisateur");
        $profils = $info_utilisateur->profils;

        // Les admins ont le droits de tout modifier
        if ($info_utilisateur->estAdmin) {
            return $this->linkTo($parameters);
        }

        foreach ($profils as $profil) {

            if ($profil["id"] == $proprietaire_id) {
                return $this->linkTo($parameters);
            }
        }
    }

    /*
     *  Fonction qui créé un bouton de création en fonction du
     *  controlleur dans lequel l'utilisateur se trouve.
     */

    public function createButton($parameters, $controller) {

        $di = \Phalcon\DI::getDefault();

        switch ($controller) {

            // Ici on ajoute les boutons de création que l'on veut
            // autoriser aux pilotes.
            case "igo_groupe":
                return $this->linkTo($parameters);
            case "igo_contexte":
                return $this->linkTo($parameters);
            case "igo_profil":
                return $this->linkTo($parameters);
            case "igo_permission":
                return $this->linkTo($parameters);
            // Sinon on autorise l'accès qu'aux admins
            default:
                if ($di->get('session')->get('info_utilisateur')->estAdmin) {
                    return $this->linkTo($parameters);
                }
                break;
        }
    }

    /**
     * Outil de sélection 
     * Nécessite selecteucGaucheDroite.js
     * @param array $parameters
     */
    static public function selecteurGaucheDroite($parameters) {

        // Converting parameters to array if it is not
        if (!is_array($parameters)) {
            $parameters = array($parameters);
        }

        // Determining attributes "id" and "name"
        if (!isset($parameters['prefixe'])) {
            $parameters['prefixe'] = '';
        }

        if (!isset($parameters["listeDe"])) {
            $parameters["listeDe"] = array();
        }

        if (!$parameters["listeA"]) {
            $parameters["listeA"] = array();
        }

        $prefixe = 'multiselect_' . $parameters['prefixe'];
        $prefixe_droite = 'multiselect_' . $parameters['prefixe'] . '_to';

        $code = '
             <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6"  >
                Actuels<br>
                ' . IgoTag::selecteur($prefixe_droite, $parameters['listeA']) . '<br>
                <button type="button" class="btn btn-default" id="' . $prefixe . '_leftSelected">
                    <span class="glyphicon glyphicon-minus-sign" style="color:red;"></span> Enlever
                </button>

            </div>';
        $code .='<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">

        Potentiels<br>
              ' . IgoTag::selecteur($prefixe, $parameters['listeDe']) . '
                  <br>
                <button type="button" class="btn btn-default" id="' . $prefixe . '_rightSelected">
                    <span class="glyphicon glyphicon-plus-sign" style="color:green;"></span> Ajouter
                </button>

        </div>';

        $code .= '<input type="hidden" id="' . $prefixe . '_valeurs" name="' . $prefixe . '_valeurs">';
        return $code;
    }

    /**
     * 
     * @param string $prefixe
     * @param array $liste
     * @return string
     */
    static private function selecteur($prefixe, $liste) {

        $id = "{$prefixe}";
        $code = "<select id='{$id}' name='{$id}' class='multiselect' size='10'>";

        foreach ($liste as $option) {
            if (is_array($option))
                $code .= "<option value='{$option['id']}'>{$option['valeur']}</option>";
            else
                $code .= "<option value='{$option->id}'>{$option->valeur}</option>";
        }

        $code .="</select>";
        return $code;
    }

}

?>