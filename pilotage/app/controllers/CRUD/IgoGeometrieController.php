<?php
class IgoGeometrieController extends ControllerBase {

    public function newAction($r_controller = null, $r_action = null, $r_id = null) {
        if ($this->session->has("classe_entite_id")) {
            $this->tag->setDefault("classe_entite_id", $this->session->get("classe_entite_id"));
        }
        
        $this->tag->setDefault("acces", "L");
        
        parent::newAction($r_controller, $r_action, $r_id);
    }

}
