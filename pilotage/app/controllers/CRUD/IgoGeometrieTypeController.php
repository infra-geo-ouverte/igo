<?php
class IgoGeometrieTypeController extends ControllerBase
{
    
    
    public function newAction($r_controller = null, $r_action = null, $r_id = null){
     
        $this->tag->setDefault("geometrie_type",  "V");

        parent::newAction($r_controller, $r_action, $r_id);
    }
}
