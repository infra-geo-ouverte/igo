<?php
use Phalcon\Mvc\View;

class UtilisateurEtProfilController extends ControllerBase {

    public function doAction($id) {
           $this->session->set("utilisateur_id",$id);
           $this->view->setVar("id",$id);
    }

}
