<?php

class IgoClasseEntiteController extends ControllerBase {

    public function initialize() {
        $this->persistent->parameters = null;
        $phql = "SELECT id, CONCAT(acronyme,\" - \",nom) as  nom FROM  IgoOrganismeResponsable order by acronyme";
        $organisme_desc = $this->modelsManager->executeQuery($phql);
        $this->view->setVar("organisme_desc", $organisme_desc);
        parent::initialize();
    }

}
