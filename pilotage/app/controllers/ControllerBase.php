<?php

use Phalcon\Mvc\View;
use Phalcon\Mvc\Controller;
use Phalcon\Text;
use Phalcon\Db\Column;
use Phalcon\Mvc\Model\Criteria;
use Phalcon\Paginator\Adapter\Model as Paginator;

class ControllerBase extends Controller {

    public $ctlName;
    public $classe;
    public $r_parameters;

    public function initialize() {
        $this->view->setVar("r_controller", $this->getControllerName());
        $this->view->setVar("controller", $this->getCtlName());
        $this->view->setVar("action", $this->getActionName());
        $parameters=$this->getParameters();
        preg_match('/\d?\/\w+\/\w+[\/\d]?(?P<r_parameters>\/[^\d]+.+)/i', $parameters, $matches);
        $r_parameters= isset ($matches['r_parameters'])?$matches['r_parameters']: ""; 
        
        $this->view->setVar("parameters", $parameters);
        $this->ctlName = Text::uncamelize(str_replace("Controller", "", get_class($this)));
        $this->classe = Text::camelize($this->ctlName);
        $this->r_parameters =  (isset($_POST['r_parameters'])) ? $_POST['r_parameters'] : $r_parameters;
    }

    public function indexAction($r_controller = null, $r_action = null, $r_id = null) {
        $parameters = $this->persistent->parameters;
        if (is_array($parameters)) {
            foreach ($parameters as $parameter => $val) {
                if ($parameter == "bind") {
                    foreach ($val as $key => $value) {
                        $this->tag->setDefault($key, trim($value, "%"));
                    }
                }
            }
        }

        $retour = "";
        if (!is_null($r_id)) {
            $retour = $r_controller . "/" . $r_action . "/" . $r_id;
        }

        $this->view->setVar("retour", $retour);
    }

    public function searchAllAction($parameters = null) {
        $this->persistent->parameters = null;
        $this->searchAction($parameters);

        $this->view->pick($this->ctlName . "/search");
    }

    public function searchAction($parameters = null) {

        $this->view->setVar("filter", $parameters);

        $this->ctlName = Text::uncamelize(str_replace("Controller", "", get_class($this)));
        $this->classe = Text::camelize($this->ctlName);


        $numberPage = $this->request->getQuery("page", "int");

        if (is_null($numberPage)) {
            $numberPage = $this->persistent->numberpage;
        }

        if (!is_null($numberPage)) {
            $this->persistent->numberpage = $numberPage;
        }


        $parameters = $this->getSearchParameters($parameters, $this->classe);
        $order = $this->request->getQuery("order", "string");
        $this->view->order = $order ? $order : "id";

        $criteres = "";

        if (is_array($parameters)) {
            foreach ($parameters as $parameter => $val) {
                if ($parameter == "conditions") {
                    $parameters["conditions"] = str_replace("LIKE", "ILIKE", $parameters["conditions"]); // pg seulement
                } else if ($parameter == "bind") {
                    foreach ($val as $key => $value) {
                        $criteres.= ", " . $key . "=" . $value;
                    }
                }
            }
        }
        if ($criteres <> "") {
            $criteres = substr($criteres, 2);
            $this->view->setVar("criteres", $criteres);
        }
        $classe = $this->classe;
        try {
            $objets = $classe::find($parameters);

        } catch (\Exception $e) {
            $this->flash->error($e->getMessage());
            $objets=new $classe();
        }

        if (count($objets) == 0) {
            $this->flash->notice("Aucun enregistrement de " . Text::camelize(str_replace("igo_", "", $this->ctlName)));
        }
        $paginator = new Paginator(array(
            "data" => $objets,
            "limit" => 10,
            "page" => $numberPage
        ));
        // Hack pour régler le bug de phalcon https://github.com/phalcon/cphalcon/issues/2301
        $paginate = $paginator->getPaginate();
        if($paginate->next == $paginate->current){
            $paginate->next = $paginate->next+1;
        }
        
        //Nettoyer les objets qu'on retourne à la vue
        foreach($paginate->items as $index => $objet){
          
           //Nettoyer tous les attributs
           $attributs = get_object_vars($objet);
           foreach($attributs as $nomAttribut => $valeurAttribut){
          
              $paginate->items[$index]->{$nomAttribut} = $this->escaper->escapeHtml($valeurAttribut);
           }
            
        }
        $this->view->page = $paginate;

    }

    public function getSearchParameters($parameters, $className) {
        if (is_null($parameters) || (!is_array($parameters) && is_callable($parameters))) {
            $criteres = array();
            foreach (get_class_vars($className) as $prop => $val) {
                if ($this->dispatcher->getParam($prop)) {
                    $criteres[$prop] = $this->dispatcher->getParam($prop);
                }
                if($this->request->getQuery($prop, "int")){
                    $criteres[$prop] = $this->request->getQuery($prop, "int");
                }
                
                
            }
            if (0 < count($criteres)) {
                $query = Criteria::fromInput($this->di, $className, $criteres);
                $this->persistent->parameters = $query->getParams();
            }

            if ($this->request->isPost()) {
                $query = Criteria::fromInput($this->di, $className, $_POST);
                $this->persistent->parameters = $query->getParams();
            }
            $parameters = $this->persistent->parameters;
            if (!is_array($parameters)) {
                $parameters = array();
            }
            $order = null;
            if (isset($parameters["order"]))
                $order = $parameters["order"];
            if (is_null($order)) {
                $order = $this->request->getQuery("order");
            }
            if (is_null($order)) {
                $order = $this->persistent->order;
            }

            if (!is_null($order)) {
                $this->persistent->order = $order;
            } else {
                $order = "id";
            }

            $parameters["order"] = $order;
        }
        

        return $parameters;
    }

    public function newAction($r_controller = null, $r_action = null, $r_id = null) {
        $retour = "";
        if (!is_null($r_action)) {
            $retour = $r_controller . "/" . $r_action . "/" . $r_id;
        }
        
        $parameters = $this->persistent->parameters;
        if (is_array($parameters)) {
            foreach ($parameters as $parameter => $val) {
                if ($parameter == "bind") {
                    foreach ($val as $key => $value) {
                        $this->tag->setDefault($key,$value);
                    }
                }
            }
        } 
        $this->view->setVar("retour", $retour);
    }

    public function editAction($id, $r_controller = null, $r_action = null, $r_id = null) {                    
        $retour = "";
        if (!is_null($r_action)) {
            $retour = $r_controller . "/" . $r_action . "/" . $r_id . $this->r_parameters;
        }
        $this->view->setVar("retour", $retour);

        if (!$this->request->isPost()) {
            $classe = $this->classe;
            $objets = $classe::findFirstByid($id);
            if (!$objets) {
                $this->flash->error(Text::camelize(str_replace("igo_", "", $this->ctlName)) . " non-trouvé");

                return $this->dispatcher->forward(array(
                            "controller" => $this->ctlName,
                            "action" => "index"
                ));
            }

            foreach (get_class_vars(get_class($objets)) as $prop => $val) {
                $this->tag->setDefault($prop, $objets->$prop);
            }
        }
    }

    public function createAction($r_controller = null, $r_action = null, $r_id = null) {
        if (!$this->request->isPost()) {
            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "index"
            ));
        }

        $objet = new $this->classe();

        $this->assigneFromPost($objet);
        try {
            if (!$objet->save()) {
                foreach ($objet->getMessages() as $message) {
                    $this->flash->error($message);
                }

                return $this->dispatcher->forward(array(
                            "controller" => $this->ctlName,
                            "action" => "new",
                            "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
                ));
            } else {
                $this->flash->success(Text::camelize(str_replace("igo_", "", $this->ctlName)) . " " . $objet->id . " créé avec succès");
                //               $query = Criteria::fromInput($this->di, $this->classe, array("id" => $objet->id));
                //               $this->persistent->parameters = $query->getParams();
            }
        } catch (\Exception $e) {
            $this->flash->error($e->getMessage());
            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "new",
                        "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
            ));
        }

        if ($r_action == "search") {
            return $this->dispatcher->forward(array(
                        "controller" => $r_controller,
                        "action" => $r_action,
                        "params" => array("id" => $objet->id)
            ));
        }
        if (!is_null($r_action)) {
            $last = rtrim($r_controller . "/" . $r_action . "/" . $r_id, "/") . "/";
            $this->r_parameters = ltrim($this->r_parameters, "1234567890/");
            $this->r_parameters = str_replace($last, "", $this->r_parameters);
            return $this->response->redirect($last . $this->r_parameters);
        }

        return $this->dispatcher->forward(array(
                    "controller" => $this->ctlName,
                    "action" => "search"
        ));
    }

    /**
     * Saves a igo_couche edited
     *
     */
    public function saveAction($r_controller = null, $r_action = null, $r_id = null) {

        // $this->ctlName = Text::uncamelize(str_replace("Controller", "", get_class($this)));
        // $this->classe = Text::camelize($this->ctlName);

        if (!$this->request->isPost()) {
            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "index"
            ));
        }

        $id = $this->request->getPost("id");
        $classe = $this->classe;
        $objet = $classe::findFirstByid($id);
        if (!$objet) {
            $this->flash->error($this->ctlName . " n'existe pas " . $id);

            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "index"
            ));
        }
        $this->assigneFromPost($objet);


        try {
            if (!$objet->save()) {
                foreach ($objet->getMessages() as $message) {
                    $this->flash->error($message);
                }
                 $this->view->setVar("retour", $retour);
                $last = rtrim($r_controller . "/" . $r_action . "/" . $r_id, "/") ;
                return $this->response->redirect($this->ctlName."/edit/".$id."/".$last);
            } else {
                $this->flash->success(Text::camelize(str_replace("igo_", "", $this->ctlName)) . " " . $objet->id . " modifié avec succès");
            }
        } catch (\Exception $e) {
            $this->flash->error($e->getMessage());
            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "edit",
                        "param" => (!is_null($r_action)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
            ));
        }

        if (!is_null($r_action)) {
            $last = rtrim($r_controller . "/" . $r_action . "/" . $r_id, "/") . "/";
            $this->r_parameters = ltrim($this->r_parameters, "1234567890/");
            $this->r_parameters = str_replace($last, "", $this->r_parameters);
            return $this->response->redirect($last . $this->r_parameters);
        }

        return $this->dispatcher->forward(array(
                    "controller" => $this->ctlName,
                    "action" => "index"
        ));
    }

    public function deleteAction($id, $r_controller = null, $r_action = null, $r_id = null) {

        $classe = $this->classe;
        $objet = $classe::findFirstByid($id);
        if (!$objet) {
            $this->flash->error($this->ctlName . " non-trouvé");

            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "index"
            ));
        }
        try {
            if (!$objet->delete()) {

                foreach ($objet->getMessages() as $message) {

                    $this->flash->error($message);
                }
                return $this->dispatcher->forward(array(
                            "controller" => $r_controller,
                            "action" => $r_action,
                            "params" => array($r_id)
                ));
            } else {
                $this->flash->success(Text::camelize(str_replace("igo_", "", $this->ctlName)) . " " . $id . " détruit avec succès");
            }
        } catch (\Exception $e) {
            $message=$e->getMessage();
            if (strpos($message,"23503")>0){            
               $message="Cet enregistrement est utilisé dans une autre table";
            }
            $this->flash->error($message);

        }
        if (!is_null($r_action)) {
            $last = rtrim($r_controller . "/" . $r_action . "/" . $r_id, "/") . "/";
            $this->r_parameters = ltrim($this->r_parameters, "1234567890/");
            $this->r_parameters = str_replace($last, "", $this->r_parameters);
            return $this->response->redirect($last . $this->r_parameters);
        }


        return $this->dispatcher->forward(array(
                    "controller" => $this->ctlName,
                    "action" => "search",
                    "params" => array()
        ));
    }


    function startsWith($haystack, $needle, $case = true) {
        if ($case)
            return strpos($haystack, $needle, 0) === 0;

        return stripos($haystack, $needle, 0) === 0;
    }

    function endsWith($haystack, $needle, $case = true) {
        $expectedPosition = strlen($haystack) - strlen($needle);

        if ($case)
            return strrpos($haystack, $needle, 0) === $expectedPosition;

        return strripos($haystack, $needle, 0) === $expectedPosition;
    }

    function getCtlName() {
        return Text::uncamelize(str_replace("Controller", "", get_class($this)));
    }

    function getControllerName() {
        return $this->dispatcher->getControllerName();
    }

    function getActionName() {
        $actionName = $this->dispatcher->getActionName();
        return $actionName;
    }

    function getParameters() {
        $parameters = "";
        foreach ($this->dispatcher->getParams() as $parameter => $valeur) {
            $parameters.="/" . $valeur;
        }
        return ltrim($parameters, "/");
    }

    public function NullAsFalse($arg) {
        return intval($arg) == null ? false : $arg;
    }
    
    public function zeroAsNull($arg) {
        return intval($arg) == 0 ? null : $arg;
    }
    function assigneFromPost($objet) {
        $metaData = $objet->getModelsMetaData();
        $dataTypes = $metaData->getDataTypes($objet);
        foreach (get_class_vars(get_class($objet)) as $prop => $val) {
            if ($dataTypes[$prop] == Column::TYPE_INTEGER || $dataTypes[$prop] == Column::TYPE_DATETIME) {
                $objet->$prop = $this->zeroAsNull($this->request->getPost($prop));
            } else if ($dataTypes[$prop] == Column::TYPE_BOOLEAN) {
                $objet->$prop = $this->NullAsFalse($this->request->getPost($prop));
            } else {
                $objet->$prop = $this->request->getPost($prop);
            }
        }
    }
    function fopen_file_get_contents($cheminFichier) {
        $contenu = '';
        $handle = fopen($cheminFichier, 'r');
        if ($handle) {
            $contenu = fread($handle, filesize($cheminFichier));
        }
        return $contenu;
    }
    
    function curl_file_get_contents($url){
        $url = urldecode($url);
        $curl = curl_init();
        $userAgent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)';

        curl_setopt($curl, CURLOPT_URL, $url); //The URL to fetch. This can also be set when initializing a session with curl_init().
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE); //TRUE to return the transfer as a string of the return value of curl_exec() instead of outputting it out directly.
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 50); //The number of seconds to wait while trying to connect.

        curl_setopt($curl, CURLOPT_USERAGENT, $userAgent); //The contents of the "User-Agent: " header to be used in a HTTP request.
        curl_setopt($curl, CURLOPT_FAILONERROR, TRUE); //To fail silently if the HTTP code returned is greater than or equal to 400.
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE); //To follow any "Location: " header that the server sends as part of the HTTP header.
        curl_setopt($curl, CURLOPT_AUTOREFERER, TRUE); //To automatically set the Referer: field in requests where it follows a Location: redirect.
        curl_setopt($curl, CURLOPT_TIMEOUT, 10); //The maximum number of seconds to allow cURL functions to execute.

        $contenu = curl_exec($curl);

        if($contenu === false)
        {
            error_log("error in curl_file_get_contents");
            error_log(curl_error($curl));
            return 'Erreur Curl : ' . curl_error($curl);
        }

        curl_close($curl);

        return $contenu;
    }
        
    function succesAjax($msg = ''){
        $reponse = new stdClass();
        $reponse->statut = 'succes';
        $reponse->message = $msg;
        $this->response->send();
        die(json_encode($reponse)); 
    }
    
    function erreurAjax($msg){
        $reponse = new stdClass();
        $reponse->statut = 'erreur';
        $reponse->message = $msg;
        $this->response->send();
        die(json_encode($reponse)); 
            
    }

}


