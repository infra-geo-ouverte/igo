<?php
use Phalcon\Mvc\View;

class ClasseEntiteEtGeometrieController extends ControllerBase {

    public function doAction($id) {
           $this->session->set("classe_entite_id",$id);
           $this->view->setVar("id",$id);
    }

}
