<?php

class IndexController extends ControllerBase
{

    public function indexAction()
    {
        $this->dispatcher->forward(array(
            "controller" => "igo",
            "action" => "index"
        ));
    }

}

