<?php
use Phalcon\Mvc\View;

class ProfilEtPermissionController extends ControllerBase {

    public function doAction($id) {
           $this->view->setVar("id",$id);
           $this->session->set("profil_id",$id);
    }

}
