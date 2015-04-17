<?php

use Phalcon\Mvc\Model\Criteria;
use Phalcon\Paginator\Adapter\Model as Paginator;

class MenuController extends ControllerBase {

    /**
     * Index action
     */
    public function indexAction($r_controller = null, $r_action = null, $r_id = null) {
        $this->persistent->parameters = null;
        $baseUri = $this->url->getBaseUri();
        $this->tag->setDefault("baseUri", $baseUri);
    }

    public function infoAction($r_controller = null, $r_action = null, $r_id = null) {
        $this->persistent->parameters = null;
        $this->tag->setDefault("info", phpinfo());
    }

}
