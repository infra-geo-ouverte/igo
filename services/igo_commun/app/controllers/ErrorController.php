<?php
class ErrorController extends ControllerBase
{
    public function error404Action() {
   //     $this->view->setRenderLevel(Phalcon\Mvc\View::LEVEL_ACTION_VIEW);
        $this->view->setVar("titre", "Erreur 404");
        $this->response->setHeader('HTTP/1.0 404','Not Found');
        $configuration = $this->getDI()->get("config");
        $configuration->application->baseUri = $configuration->uri->services . "igo_commun/public/";
    }
    
    public function error403Action() {
    //    $this->view->setRenderLevel(Phalcon\Mvc\View::LEVEL_ACTION_VIEW);
        $this->view->setVar("titre", "Erreur 403");
        $this->response->setHeader('HTTP/1.0 403','Forbidden');
        $configuration = $this->getDI()->get("config");
        $configuration->application->baseUri = $configuration->uri->services . "igo_commun/public/";
    }   
 
}
