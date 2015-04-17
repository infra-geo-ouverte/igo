<?php
class IgoClasseController extends ControllerBase
{
    public function newAction($r_controller = null, $r_action = null, $r_id = null) {
       if ($this->session->has("couche_id")){
           $this->tag->setDefault("couche_id",$this->session->get("couche_id"));
       }
       parent::newAction($r_controller, $r_action, $r_id );
    }
    
}
