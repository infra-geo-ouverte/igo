<?php
use Phalcon\Mvc\View;

class ProfilEtUtilisateurController extends ControllerBase {

    public function doAction($id) {
           $this->session->set("profil_id",$id);
           $this->view->setVar("id",$id);
    }

}
