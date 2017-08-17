<?php

namespace Wmsfilters\Controllers;

class ApiController extends \Phalcon\Mvc\Controller {

    public function filter($name = NULL, $store = NULL, $nomCouche = NULL, $filter = NULL)  {


          if($name){
    		        //echo $name;
                //echo $store;
                //echo $filter;

                $config = $this->getDI()->get('chargeurModules')->obtenirModuleConfig('wmsfilters');
                $configIgo = $this->getDI()->get('config');

              
                 // Getting a response instance
              //  $response = new \Phalcon\Http\Response();

                 // Set the content of the response
                //$response->redirect($configIgo->uri->modules . $config->filterServices .  $name . '?store=' . $store  . '&filter=' . $filter );
                header("Location: ". $configIgo->uri->modules . $config->filterServices .  $name . '?store=' . $store. '&nomCouche=' . $nomCouche  . '&filter=' . $filter);
							         exit();

                 // Return the response
                 //return $response;
		} else {
	        $config = $this->getDI()->get('chargeurModules')->obtenirModuleConfig('wmsfilters');
                if($config === false){
	            die("Ce service n'est pas permis.");
	        } else if(!isset($config->filterServices)){
	            die("Configuration absente ou incorrecte");
	        }
	        echo $config->filterServices;
	    }
    }
}
