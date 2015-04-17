<?php
use Phalcon\Mvc\View;

class ContexteEtCoucheController extends ControllerBase {

    public function doAction($id) {
           $this->view->setVar("id",$id);
           $this->session->set("contexte_id",$id);
    }

}
