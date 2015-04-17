<?php

class IgoOrganismeResponsableController extends ControllerBase {

    public function initialize() {
        $this->persistent->parameters = null;
        $phql = "SELECT c.id, CONCAT(c.nom,\" , \",c.prenom) as  nom FROM  IgoContact c, IgoOrganismeResponsable o where o.contact_id=c.id  order by nom";
        $contact_desc = $this->modelsManager->executeQuery($phql);
        $this->view->setVar("contact_desc", $contact_desc);
        parent::initialize();
    }
    public function newAction($r_controller = null, $r_action = null, $r_id = null) {
        $this->persistent->parameters = null;
        $phql = "SELECT c.id, CONCAT(c.nom,\" , \",c.prenom) as  nom FROM  IgoContact c  order by nom";
        $contact_desc = $this->modelsManager->executeQuery($phql);
        $this->view->setVar("contact_desc", $contact_desc);
        parent::newAction($r_controller, $r_action, $r_id);
    }

}
