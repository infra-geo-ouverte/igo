<?php
use Phalcon\Mvc\View;

class CoucheEtClasseController extends ControllerBase {

    public function doAction($id) {
           $igo_geometrie = IgoCouche::find("id=".$id);
        //  $classe_entite_id=$igo_geometrie[0]->classe_entite_id;
         //  $this->view->setVar("classe_entite_id",$classe_entite_id);
           $this->view->setVar("id",$id);
           $this->session->set("couche_id",$id);
    }

}
