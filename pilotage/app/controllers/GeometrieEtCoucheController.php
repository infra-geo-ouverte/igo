<?php
use Phalcon\Mvc\View;

class GeometrieEtCoucheController extends ControllerBase {

    public function doAction($id) {
           $igo_geometrie = IgoGeometrie::find("id=".$id);
           $classe_entite_id=$igo_geometrie[0]->classe_entite_id;
           $this->view->setVar("classe_entite_id",$classe_entite_id);
           $this->view->setVar("id",$id);
           $this->session->set("geometrie_id",$id);
    }

}
