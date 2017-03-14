<?php

namespace Wmsfilters\Apis;

use Phalcon\Mvc\Micro\Collection as MicroCollection;

class Api extends MicroCollection {
    public function __construct($api, $module, $config) {
    	$controllerStr = "\\".$module->obtenirNom(true)."\Controllers\ApiController";
        $this->setHandler(new $controllerStr());
        $this->setPrefix('/'.$module->obtenirNom());
        $this->get('/filter', 'filter');
        $this->get('/filter/{name}', 'filter');
        $this->get('/filter/{name}/{store}', 'filter');
        $this->get('/filter/{name}/{store}/{filter}', 'filter');
    }
}
