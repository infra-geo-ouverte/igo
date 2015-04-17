<?php

use Phalcon\Mvc\Model\Criteria;
use Phalcon\Mvc\View;
use Phalcon\Paginator\Adapter\Model as Paginator;

class MapfileController extends ControllerBase {

    public $cancelURL = 'mapfile/retro';

    /**
     * Index action
     */
    public function indexAction($r_controller = null, $r_action = null, $r_id = null) {
        $this->persistent->parameters = null;
    }

    public function creeAction() {
        
    }

    public function genereAction() {

        $contexte_id = filter_input(INPUT_POST, 'contexte_id');
        if (strlen($contexte_id) == 0) {
            $this->flashSession->error("Veuillez sélectionner un contexte.");
            $previousURL = 'mapfile/cree';
            $response = new \Phalcon\Http\Response();
            return $response->redirect($previousURL);
        }

        $profil_id = filter_input(INPUT_POST, 'profil_id');
        $utilisateur_id = filter_input(INPUT_POST, 'utilisateur_id');
        return $this->dispatcher->forward(array(
                    "controller" => "igo_contexte",
                    "action" => "mapfile",
                    "params" => array($contexte_id, $profil_id, $utilisateur_id)
        ));
    }

    public function retroAction() {
        if ($this->session->get('mapfile')) {
            $this->view->mapfile = $this->session->get('mapfile');
        } else {
            $this->view->mapfile = '/srv/www/geomatique/services/map/wms/gouvouvertqc.map';
        }
    }

    public function loadAction() {
        $request = new \Phalcon\Http\Request();
        $response = new \Phalcon\Http\Response();
        $data = null;

        //Load a mapfile content
        if ($request->isPost() == true) {
            $mapfile = $request->getPost('mapfile', null);
            if ($mapfile) {
                $mapfileParser = new MapfileParser();

                try {
                    $data = $mapfileParser->parseFile(trim($mapfile));
                } catch (Exception $e) {
                    $this->flashSession->error($e->getMessage());
                }

                $this->session->set('mapfile', $mapfile);
                $this->session->set('mapfileData', $data);
            } else {
                $this->flashSession->error("Veuillez identifer un mapfile!");
            }
        } else if ($this->session->get('mapfileData')) {
            $data = $this->session->get('mapfileData');
        }

        //Store the mapfile content into the session
        if ($data) {
            $this->view->setVar("layers", array_merge($data['notDistinctLayers'], $data['distinctLayers']));
            $this->view->setVar("nLayers", $data['nLayers']);
            $this->view->setVar("nNotDistinctLayers", count($data['notDistinctLayers']));
        } else {
            return $response->redirect($this->cancelURL);
        }
    }

    public function selectAction() {
        $request = new \Phalcon\Http\Request();
        $response = new \Phalcon\Http\Response();
        $previousURL = 'mapfile/load';
        $data = null;

        if ($request->isPost() == true) {
            if ($mapfileData = $this->session->get('mapfileData')) {
                $excludes = $request->getPost('exclude', null);
                $excludes = ($excludes ? $excludes : array());

                //Check if all layers are unique after excluding some of them
                $layers = array();
                $layerNames = array();
                foreach ($mapfileData['notDistinctLayers'] as $notDistinctLayer) {
                    if (!array_key_exists($notDistinctLayer['id'], $excludes)) {
                        if (in_array($notDistinctLayer['name'], $layerNames)) {
                            //Some layers are still duplicated so we redirect to the previous page
                            $this->flashSession->error('Des couches sont toujours en double.');
                            return $response->redirect($previousURL);
                        } else {
                            $layers[] = $notDistinctLayer;
                            $layerNames[] = $notDistinctLayer['name'];
                        }
                    }
                }

                foreach ($mapfileData['distinctLayers'] as $distinctLayer) {
                    if (!array_key_exists($distinctLayer['id'], $excludes)) {
                        $layers[] = $distinctLayer;
                    }
                }

                //Identify the layers that exist already and their group
                $existingLayers = array();
                $newLayers = array();
                foreach ($layers as $layer) {
                    $layerQuery = 'mf_layer_name="' . $layer['name'] . '"';
                    $igoLayer = IgoCouche::findFirst($layerQuery);
                    $layer['currentGroup'] = null;
                    $layer['selectClass'] = null;

                    if (!$igoLayer) {
                        $layer['exists'] = false;
                        // Quelques couches n'ont pas de wms_group_title... utiliser le GROUP dans ces rare cas.
                        if (!isset($layer['wms_group_title']) || strlen($layer['wms_group_title']) == 0) {
                            $layer['wms_group_title'] = $layer['group'];
                        }
                        $newLayers[] = $layer;
                    } else {

                        //Trouver le premier
//                        if ($igoLayer->groupe_id) {
//                            $groupQuery = 'id="' . $igoLayer->groupe_id . '"';
//                            $igoGroup = IgoGroupe::findFirst($groupQuery);
//                            $group = $igoGroup->getNomComplet(true);
//                            $layer['currentGroup'] = $group;
//                            if ($layer['wms_group_title'] && $layer['currentGroup'] != $layer['wms_group_title']) {
//                                $layer['selectClass'] = 'danger';
//                            }
//                        }
                        $layer['exists'] = true;
                        $existingLayers[] = $layer;
                    }
                }

                //Find all the possible groups
                $groups = array();
                foreach (IgoGroupe::getNomsComplet(true) as $group) {
                    $groups[] = $group->nom;
                }

                //Store some data into the session
                $data = array(
                    'existingLayers' => $existingLayers,
                    'newLayers' => $newLayers,
                    'groups' => $groups
                );

                $this->session->set('selectData', $data);
            }
        } else if ($this->session->get('selectData')) {
            $data = $this->session->get('selectData');
        }

        if ($data) {
            $this->view->setVar("layers", array_merge($data['newLayers'], $data['existingLayers']));
            $this->view->setVar("nNewLayers", count($data['newLayers']));
            $this->view->setVar("nExistingLayers", count($data['existingLayers']));
            $this->view->setVar("groups", $data['groups']);
        } else {
            return $response->redirect($this->cancelURL);
        }
    }

    public function processAction() {
        $request = new \Phalcon\Http\Request();
        $response = new \Phalcon\Http\Response();
        $data = null;

        if ($request->isPost() == true) {
            if ($selectData = $this->session->get('selectData')) {
                $actions = $request->getPost('action', null);
                $actions = ($actions ? $actions : array());
                $groups = $request->getPost('group', null);
                $groups = ($groups ? $groups : array());

                //For each layer, check if we should ignore it or insert it (update if it exists already)
                $data = array();
                foreach ($selectData['newLayers'] as &$newLayer) {
                    if (array_key_exists($newLayer['id'], $actions) && $actions[$newLayer['id']] == 'insert') {
                        if (array_key_exists($newLayer['id'], $groups)) {
                            $newLayer['wms_group_title'] = $groups[$newLayer['id']];
                            $newLayer['action'] = $actions[$newLayer['id']];
                        }
                        $data[] = $newLayer;
                    }
                }

                foreach ($selectData['existingLayers'] as &$existingLayer) {
                    if (array_key_exists($existingLayer['id'], $actions) && (
                            $actions[$existingLayer['id']] == 'insert' || $actions[$existingLayer['id']] == 'softinsert')) {

                        if (array_key_exists($existingLayer['id'], $groups)) {
                            $existingLayer['wms_group_title'] = $groups[$existingLayer['id']];
                            $existingLayer['action'] = $actions[$existingLayer['id']];
                        }
                        $data[] = $existingLayer;
                    }
                }

                $this->session->set('selectData', $selectData);
                $this->session->set('processData', $data);
            }
        } else if ($this->session->get('processData')) {
            $data = $this->session->get('processData');
        }

        if (!$data) {
            return $response->redirect($this->cancelURL);
        } else {
            if ($this->session->get('contexteName')) {
                $this->view->setVar("contexteName", $this->session->get('contexteName'));
                $this->session->set('contexteName', null);
            } else {
                $this->view->setVar("contexteName", null);
            }

            if ($this->session->get('contexteCode')) {
                $this->view->setVar("contexteCode", $this->session->get('contexteCode'));
                $this->session->set('contexteCode', null);
            } else {
                $this->view->setVar("contexteCode", null);
            }

            if ($this->session->get('contexteDescription')) {
                $this->view->setVar("contexteDescription", $this->session->get('contexteDescription'));
                $this->session->set('contexteDescription', null);
            } else {
                $this->view->setVar("contexteDescription", null);
            }

            if ($this->session->get('onlineResource')) {
                $this->view->setVar("onlineResource", $this->session->get('onlineResource'));
                $this->session->set('onlineResource', null);
            } else {
                $mapserverConfiguration = $this->getDI()->getConfig()->mapserver;
                $onlineResource = $mapserverConfiguration->mapserver_path . $mapserverConfiguration->executable . $mapserverConfiguration->mapfileCacheDir . $mapserverConfiguration->contextesCacheDir . "{Code}.map";
                $this->view->setVar("onlineResource", $onlineResource);
            }
        }
    }

    public function saveAction($r_controller = null, $r_action = null, $r_id = null) {
        set_time_limit(180);
        ini_set('memory_limit', '512M');

        $request = new \Phalcon\Http\Request();
        $response = new \Phalcon\Http\Response();
        $previousURL = 'mapfile/process';

        if ($request->isPost() == true) {
            if ($layers = $this->session->get('processData')) {
                //Check if a context shoud be created
                $contexte = $request->getPost('contexte', null);
                $igoContexte = null;
                if ($contexte && $contexte == 1) {
                    $contexteName = $request->getPost('name', null);
                    $contexteCode = $request->getPost('code', null);
                    $contexteDescription = $request->getPost('description', null);
                    $onlineResource = $request->getPost('onlineResource', null);

                    $missingParameter = false;
                    if (!$contexteName || strlen(trim($contexteName)) == 0) {
                        $this->flashSession->error('Veuillez entrer un nom de contexte.');
                        $missingParameter = true;
                    }

                    if (!$contexteCode || strlen(trim($contexteCode)) == 0) {
                        $this->flashSession->error('Veuillez entrer un code de contexte.');
                        $missingParameter = true;
                    }

                    if (!$contexteDescription || strlen(trim($contexteDescription)) == 0) {
                        $this->flashSession->error('Veuillez entrer une description du contexte.');
                        $missingParameter = true;
                    }

                    if (!$onlineResource || strlen(trim($onlineResource)) == 0) {
                        $this->flashSession->error('Veuillez entré la resource en ligne.');
                        $missingParameter = true;
                    }

                    $this->session->set('contexteName', $contexteName);
                    $this->session->set('contexteCode', $contexteCode);
                    $this->session->set('contexteDescription', $contexteDescription);
                    $this->session->set('onlineResource', $onlineResource);

                    if ($missingParameter) {

                        return $response->redirect($previousURL);
                    }

                    $mapServerConfig = $this->getDI()->getConfig()->mapserver;
                    $fileName = $mapServerConfig->mapfileCacheDir . $mapServerConfig->contextesCacheDir . trim($contexteCode) . ".map";
                    if (file_exists($fileName)) {
                        $this->flash->error("le fichier {$fileName} existe déjà!");
                        return $this->dispatcher->forward(array(
                                    "controller" => $this->ctlName,
                                    "action" => "new",
                                    "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
                        ));
                    }

                    $igoContexte = new IgoContexte();

                    $mapfileData = $this->session->get('mapfileData');

// Online Resource for generated mapfile will be initialised by default to the mapserv.fcgi path and the generated mapfile path.
//                   $onlineResource = $mapfileData['map']['wms_onlineresource'];
//                   if (strpos(strtolower($onlineResource), strtolower($this->view->host)) !== false) {
//                       $igoContexte->mf_map_meta_onlineresource = $onlineResource;
//                   } else {
//                       if ($onlineResource && $onlineResource != '') {
//                           $contexteDescription .= ' (' . $onlineResource . ')';
//                       }
//                   }
                    //$mapserverConfiguration = $this->getDI()->getConfig()->mapserver;
                    //$onlineResource = $mapserverConfiguration->host . $mapserverConfiguration->mapserver_path . "?" . $mapserverConfiguration->mapfileCacheDir . $contexteCode . ".map";
                    $onlineResource = trim($onlineResource);
                    // contains {Code}.map 
                    if (strpos($onlineResource, '{Code}') !== FALSE)
                        if ($onlineResource) {
                            $onlineResource = str_replace("{Code}", $contexteCode, $onlineResource);
                        }

                    $igoContexte->mf_map_meta_onlineresource = $onlineResource;
                    //$igoContexte->mf_map_meta_onlineresource = trim($onlineResource);
                    $igoContexte->mf_map_projection = $mapfileData['map']['projection'];
                    $igoContexte->nom = trim($contexteName);
                    $igoContexte->code = trim($contexteCode);
                    $igoContexte->description = trim($contexteDescription);
                    $igoContexte->mode = "l";
                    $igoContexte->generer_onlineresource = true;
                }

                //Save the layers (and optionally a context)
                $mapfileParser = new MapfileParser();
                $data = $mapfileParser->formatSaveData($layers, $this->view->host, $this->view->host_alias);
                try {
                    $this->save($data, $igoContexte);
                    $this->flashSession->success('Sauvegarde effectuée avec succès!');
                } catch (Exception $e) {
                    $this->flashSession->error($e->getMessage());
                    return $response->redirect($previousURL);
                }

                //Clear session
                $this->session->set('mapfile', null);
                $this->session->set('mapfileData', null);
                $this->session->set('selectData', null);
                $this->session->set('processData', null);
                $this->session->set('contexteName', null);
                $this->session->set('contexteCode', null);
                $this->session->set('contexteDescription', null);
                $this->session->set('onlineResource', null);
            } else {
                return $response->redirect($this->cancelURL);
            }
        } else {
            return $response->redirect($this->cancelURL);
        }
    }

    private function getConnection($connectionString, $connectionType) {
        $connectionQuery = '';
        if ($connectionString) {
            $connectionQuery .= 'connexion LIKE "' . $connectionString . '%"';
        } else {
            $connectionQuery .= 'connexion IS NULL ';
        }
        $igoConnexionType = IgoConnexionType::findFirst("connexion_type = '$connectionType'");
        
         if (!$igoConnexionType) {
            die("Type de connection inconnu: ".$connectionType);
             
         }
        
        $connexionTypeId = $igoConnexionType->id;
        $connexionTypeNom = $igoConnexionType->nom;

        if ($igoConnexionType) {
            $connectionQuery .= ' AND connexion_type_id=' . $connexionTypeId ;
        } 

        //If connection doesn't exist, create it
        $igoConnection = IgoConnexion::findFirst($connectionQuery);
        if (!$igoConnection) {
            $igoConnection = new IgoConnexion();
            // $igoConnection->setTransaction($transaction);
            $igoConnection->connexion = $connectionString;
            $igoConnection->connexion_type_id = $connexionTypeId;
 
            if ($igoConnection->save(false) == false) {
                foreach ($igoConnection->getMessages() as $message) {
                    throw new Exception($message);
                }
                //$transaction->rollback();
                $this->db->rollback();
            } else {
                $igoConnection->nom = $connexionTypeNom . ' ' . $igoConnection->id;
                $igoConnection->save(false);
            }
        } else {
            if ($igoConnection->nom == "" || $igoConnection->nom == null) {
                //  $igoConnection->setTransaction($transaction);
                $igoConnection->nom = $connexionTypeNom . ' ' . $igoConnection->id;
                $igoConnection->connexion_type_id = $connexionTypeId;
               
                $igoConnection->save(false);
            }
        }
        return $igoConnection;
    }

    /**
     * Save all layers and their depending classes in the database
     *  of distinct layers and not distinct layers.
     *  Distinct layers do not share the same name.   
     *
     *  $layers [array] : an array of layers
     *  
     * TODO: This function became huge overtime. It could be split
     *  into multiple functions but it's not an easy task and I lacked
     *  time to do it.
     *  
     */
    private function save($data, $igoContexte = null) {
        $this->db->begin();

        // $manager = new Phalcon\Mvc\Model\Transaction\Manager();
        //$transaction = $manager->get();
        //Create a contexte if IgoContexte is defined
        if ($igoContexte) {
            //$igoContexte->setTransaction($transaction);
            if ($igoContexte->save(false) == false) {
                foreach ($igoContexte->getMessages() as $message) {
                    throw new Exception($message);
                }
                //  $transaction->rollback();
                $this->db->rollback();
                $igoContexte = null;
            }
        }

        //Create an associative array of all the possible geometry types
        //This way, we dont need to issue a sql request for each layer
        $geometryTypes = array();
        $allGeometryTypes = IgoGeometrieType::find();
        foreach ($allGeometryTypes as $geometryType) {
            $multi = strpos(strtolower($geometryType->nom), 'multi');
            if ($multi === false) {
                $geometryTypes[$geometryType->layer_type] = $geometryType->id;
            }
        }

        //Create an empty array that will be used to store the group IDs
        $groups = array();
        $layerIndex = 1;
        try {
            $igoCouches = array();
            foreach ($data as $d) {
                $igoConnection = null;
                if ($d['connection'] and isset($d['connection']['connectionString']) and isset($d['connection']['type'])) {
                    $igoConnection = $this->getConnection($d['connection']['connectionString'], $d['connection']['type']);
                    //Check if connexion exists already in the database
                }

                //echo "connexion: "."<br>";
                //var_dump($d);
                foreach ($d['layers'] as $layer) {
                    echo "nom: " . $layer['name'] . "<br>";
                    //var_dump($layer);

                    if (isset($layer['connection']) and isset($layer['connectiontype']) and !""==trim($layer['connection']) and !""==trim($layer['connectiontype'])) {
                        $igoConnection = $this->getConnection($layer['connection'], $layer['connectiontype']);

                        //Check if connexion exists already in the database
                    }
                    $groupeCoucheId = null;
                    $groupID = null;
                    $layer['currentGroup'] = null;


                    //If geometry type doesn't exist, create it
                    if (!array_key_exists($layer['type'], $geometryTypes)) {
                        $igoGeometryType = new IgoGeometrieType();
                        //$igoGeometryType->setTransaction($transaction);
                        $igoGeometryType->layer_type = $layer['type'];
                        $igoGeometryType->nom = $layer['type'];
                        if ($igoGeometryType->save() == false) {
                            foreach ($igoGeometryType->getMessages() as $message) {
                                throw new Exception($message);
                            }
                            //$transaction->rollback();
                            $this->db->rollback();
                        } else {
                            //Store the new geometry type id in an array and refer to it
                            //for the following layers with the same geometry type
                            $geometryTypes[$layer['type']] = $igoGeometryType->id;
                        }
                    }

                    $layerQuery = 'mf_layer_name="' . $layer['name'] . '"';
                    $igoLayer = IgoCouche::findFirst($layerQuery);
                    $layerSaveSuccessful = false;

                    if ($layer['action'] == 'insert') {
                        if ($igoLayer) {
                            //If a layer with the same name exists already
                            //Find its geometry                        
                            if ($igoLayer->geometrie_id) {
                                $geometryQuery = 'id="' . $igoLayer->geometrie_id . '"';
                                $igoGeometry = IgoGeometrie::findFirst($geometryQuery);
                            } else {
                                $igoGeometry = new IgoGeometrie();
                            }

                            //Find it's classe d'entité
                            if ($igoGeometry && $igoGeometry->classe_entite_id) {
                                $classeEntiteQuery = 'id="' . $igoGeometry->classe_entite_id . '"';
                                $igoClasseEntite = IgoClasseEntite::findFirst($classeEntiteQuery);
                            } else {
                                $igoClasseEntite = null;
                            }

                            //Find its classes
                            if ($igoLayer->id) {
                                $classesQuery = 'couche_id="' . $igoLayer->id . '"';
                                $igoClasses = IgoClasse::find($classesQuery);
                            } else {
                                $igoClasses = null;
                            }

                            //Reassign the currentGroup to the layer in case it changed in the database meanwhile
                            //if ($igoLayer->groupe_id) {
                            //    $groupQuery = 'id="' . $igoLayer->groupe_id . '"';
                            //    $igoGroup = IgoGroupe::findFirst($groupQuery);
                            //    $layer['currentGroup'] = $igoGroup->getNomComplet(true);
                            //}
                        } else {
                            //If a layer with the same name doesn't exist
                            //Create a new layer
                            $igoLayer = new IgoCouche();

                            //Create a new geometry
                            $igoGeometry = new IgoGeometrie();

                            //Set some variables to null
                            $igoClasseEntite = null;
                            $igoClasses = null;
                        }

                        $groupID = null;
                        if ($layer['wms_group_title']) {
                            //Create a new group only if no context are to be created or if the layer has no group already
                            if (!$igoContexte || !$layer['currentGroup']) {
                                //Find all the sub-groups
                                $groupNames = preg_split("/\//", $layer['wms_group_title']);
                                $fullGroupName = '';
                                $parent_groupe_id = null;
                                foreach ($groupNames as $groupName) {
                                    //Build the full group name by appending the group name to the previous
                                    //full name. The full group name is used to store the ids of the 
                                    //groups parsed already (but not yet commited) in order to create them only once
                                    //Exemple of two diffrent groups:
                                    //Vigilance/Inondation != MTQ/Inondation
                                    $fullGroupName .= '/' . $groupName;

                                    //Check if the group has been parsed already (from another layer) and retrieve its ID
                                    $found = false;

                                    foreach ($groups as $group) {
                                        if ($group['name'] == $fullGroupName) {
                                            $groupID = $group['id'];
                                            $found = true;

                                            break;
                                        }
                                    }

                                    //If the groups has not been created already, create it
                                    if (!$found) {
                                        //Check if this group exists in the database already

                                        $igoGroup = IgoGroupe::findFirst('nom="' . $groupName . '"');

                                        if ($igoGroup) {
                                            //If it exists already, retrieve it's id
                                            $groupID = $igoGroup->id;
                                        } else {
                                            //If it doesn't exist, create it and retrieve it's id
                                            $igoGroup = new IgoGroupe();
                                            // $igoGroup->setTransaction($transaction);
                                            $igoGroup->nom = $groupName;
                                            $igoGroup->est_exclu_arbre = 'FALSE';
                                            //$igoGroup->groupe_id = $groupID;
                                            // $igoGroup->specifie_parent($groupID);
                                            if ($igoGroup->save() == false) {
                                                foreach ($igoGroup->getMessages() as $message) {
                                                    throw new Exception($message);
                                                }
                                                // $transaction->rollback();
                                                $this->db->rollback();
                                            } else {
                                                $groupID = $igoGroup->id;
                                            }
                                        }

                                        $igoGroup->specifie_parent($parent_groupe_id);
                                        //Store the id of the newly created group in the groups array
                                        $groups[] = array(
                                            'name' => $fullGroupName,
                                            'id' => $groupID
                                        );
                                    }
                                    $parent_groupe_id = $groupID;
                                }
                            }
                        }

                        //This array is used to define a couche_contexte for each excluded attribute
                        $excludedAttributes = array();
                        if (!$igoClasseEntite) {
                            //If the classe d'entité doesn't exist, create a new one
                            $igoClasseEntite = new IgoClasseEntite();

                            //Else, set the classe d'entité name to the layer name
                            $igoClasseEntite->nom = $layer['name'];
                            // TODO : presentement on prend le premier catalogue du bord. Il faudra penser à une meilleure solution.
                            $igoCatalogueCsw = IgoCatalogueCsw::findFirst();
                            if ($igoCatalogueCsw) {
                                $igoClasseEntite->catalogue_csw_id = $igoCatalogueCsw->id;
                            }

                            // $igoClasseEntite->setTransaction($transaction);
                            if ($igoClasseEntite->save() == false) {
                                foreach ($igoClasseEntite->getMessages() as $message) {
                                    throw new Exception($message);
                                }
                                /// $transaction->rollback();
                                $this->db->rollback();
                            }
                        } //if (!$igoClasseEntite) {
                        //Update or set the geometry attributes
                        // $igoGeometry->setTransaction($transaction);
                        $igoGeometry->mf_layer_projection = $layer['projection'];
                        $igoGeometry->mf_layer_data = $layer['data'];
                        $igoGeometry->connexion_id = ($igoConnection ? $igoConnection->id : $igoGeometry->connexion_id);
                        $igoGeometry->geometrie_type_id = $geometryTypes[$layer['type']];
                        $igoGeometry->classe_entite_id = $igoClasseEntite->id;
                        $igoGeometry->vue_defaut = $layer['vue_defaut'];
                        $igoGeometry->acces = "L";
                        // Définir l'indice d'inclusion...
                        $indice_inclusion = "T"; // T=Tous, E=Exclusion I=Inclusion
                        foreach ($layer['attributes'] as $attribute) {
                            if ($attribute['est_inclu']) {
                                $indice_inclusion = "I";
                                break;
                            } else {
                                $indice_inclusion = "E";
                                break;
                            }
                        }
                        $igoGeometry->ind_inclusion = $indice_inclusion;


                        if ($igoGeometry->save(false) == false) {
                            $this->db->rollback();
                            foreach ($igoGeometry->getMessages() as $message) {
                                throw new Exception($message);
                            }
                            //$transaction->rollback();
                           
                        }

                        //Insert or update attributes                        
                        foreach ($layer['attributes'] as $attribute) {
                            $attributeQuery = 'geometrie_id="' . $igoGeometry->id . '" AND colonne="' . $attribute['colonne'] . '"';
                            $igoAttribute = IgoAttribut::findFirst($attributeQuery);
                            $update = false;

                            if (!$igoAttribute) {
                                $igoAttribute = new IgoAttribut();
                                $update = true;
                            } else if ($igoAttribute && !$igoContexte) {
                                $update = true;
                            }

                            if ($update) {
                                //  $igoAttribute->setTransaction($transaction);
                                $igoAttribute->colonne = $attribute['colonne'];
                                $igoAttribute->est_cle = ($attribute['est_cle'] ? 'TRUE' : 'FALSE');
                                $igoAttribute->est_inclu = ($attribute['est_inclu'] ? 'TRUE' : 'FALSE');
                                $igoAttribute->geometrie_id = $igoGeometry->id;

                                if ($igoAttribute->save(false) == false) {
                                    foreach ($igoAttribute->getMessages() as $message) {
                                        throw new Exception($message);
                                    }
                                    $this->db->rollback();
                                    // $transaction->rollback();
                                } /* else{
                                  //Add the attribute id to the excluded attributes array
                                  if($igoContexte && !$attribute['est_inclu']){
                                  $excludedAttributes[] = $igoAttribute->id;
                                  }
                                  } */
                            } else {
                                if ($igoContexte && !$attribute['est_inclu']) {
                                    if ($igoAttribute->est_inclu == 'TRUE') {
                                        $excludedAttributes[] = $igoAttribute->id;
                                    }
                                }
                            }
                        }

                        // Création ou mise à jour de la couche
                        //$igoLayer->setTransaction($transaction);
                        $igoLayer->type = $layer['location'];
                        $igoLayer->geometrie_id = $igoGeometry->id;
                        $igoLayer->mf_layer_name = $layer['name'];
                        $igoLayer->mf_layer_group = $layer['group'];
                        $igoLayer->mf_layer_meta_name = $layer['wms_name'];
                        $igoLayer->mf_layer_meta_attribution_title = $layer['wms_attribution_title'];
                        $igoLayer->mf_layer_meta_title = $layer['wms_title'];
                        $igoLayer->mf_layer_meta_group_title = $layer['wms_group_title'];
                        $igoLayer->mf_layer_filtre = $layer['filter'];
                        $igoLayer->mf_layer_opacity = $layer['opacity'];
                        $igoLayer->mf_layer_minscale_denom = ($layer['minscaledenom'] == -1 ? null : $layer['minscaledenom']);
                        $igoLayer->mf_layer_maxscale_denom = ($layer['maxscaledenom'] == -1 ? null : $layer['maxscaledenom']);
                        $igoLayer->mf_layer_labelitem = $layer['labelitem'];
                        $igoLayer->mf_layer_labelminscale_denom = ($layer['labelminscaledenom'] == -1 ? null : $layer['labelminscaledenom']);
                        $igoLayer->mf_layer_labelmaxscale_denom = ($layer['labelmaxscaledenom'] == -1 ? null : $layer['labelmaxscaledenom']);
                        $igoLayer->mf_layer_def = $layer['layer_def'];
                        $igoLayer->mf_layer_meta_def = $layer['meta_def'];

                        if (isset($layer['wfs_maxfeatures']) && is_numeric($layer['wfs_maxfeatures'])) {
                            $igoLayer->mf_layer_meta_wfs_max_feature = $layer['wfs_maxfeatures'];
                        }

                        // Assignation du champ fiche_csw_id tel que décrit dans issue 39
                        $igoLayer->fiche_csw_id = $layer['name'];
                        if (isset($layer['msp_classe_meta'])) {
                            $igoLayer->fiche_csw_id = $layer['msp_classe_meta'];
                        }

                        //Check if some attributes should be overwritten in igoCoucheContexte
                        $coucheContexteName = null;
                        if ($igoContexte && $igoLayer->mf_layer_meta_name && $igoLayer->mf_layer_meta_name != $layer['wms_name']) {
                            $coucheContexteName = $layer['wms_name'];
                        } else {
                            $igoLayer->mf_layer_meta_name = (isset($layer['wms_name']) ? $layer['wms_name'] : $layer['name']);
                        }

                        $coucheContexteTitle = null;
                        if ($igoContexte && $igoLayer->mf_layer_meta_title && $igoLayer->mf_layer_meta_title != $layer['wms_title']) {
                            $coucheContexteTitle = $layer['wms_title'];
                        } else {
                            $igoLayer->mf_layer_meta_title = $layer['wms_title'];
                        }

                        $coucheContexteFilter = null;
                        if ($igoContexte && $igoLayer->mf_layer_filtre && $igoLayer->mf_layer_filtre != $layer['filter']) {
                            $coucheContexteFilter = $layer['filter'];
                        } else {
                            $igoLayer->mf_layer_filtre = $layer['filter'];
                        }
                        //If the new group is different than the current group, assign the new group the the context instead
                        //of changing the group itself
                        if ($layer['currentGroup'] && ($layer['currentGroup'] != $layer['wms_group_title'])) {
                            $igoCoucheContexte->mf_layer_meta_group_title = $layer['wms_group_title'];
                        }

                        if ($igoLayer->save(false) == false) {
                            foreach ($igoLayer->getMessages() as $message) {
                                throw new Exception($message);
                            }
                            $this->db->rollback();
                            // $transaction->rollback();
                        } else {
                            $layerSaveSuccessful = true;
                            //If the layer has some classes defined already, delete them and re-insert them
                            //We need to delete them and re-insert since it is not possible to update them
                            //(they don't have a name on which we can query)
                            if ($igoClasses) {
                                foreach ($igoClasses as $igoClass) {
                                    //  $igoClass->setTransaction($transaction);
                                    if ($igoClass->delete() == false) {
                                        foreach ($igoClass->getMessages() as $message) {
                                            throw new Exception($message);
                                        }
                                    }
                                }
                            }

                            //Save each classes and assign them a z order
                            $i = 0;
                            foreach ($layer['classes'] as $class) {
                                $igoClass = new IgoClasse();
                                // $igoClass->setTransaction($transaction);
                                $igoClass->mf_class_def = $class;
                                $igoClass->couche_id = $igoLayer->id;
                                $igoClass->mf_class_z_order = $i;
                                $igoClass->save(false);

                                if ($igoLayer->save(false) == false) {
                                    foreach ($igoClass->getMessages() as $message) {
                                        throw new Exception($message);
                                    }
                                    $this->db->rollback();
                                    //$transaction->rollback();
                                }

                                $i++;
                            }
                            if ($groupID) {
                                $igoGroupeCouche = IgoGroupeCouche::findFirst('couche_id=' . $igoLayer->id . ' AND groupe_id=' . $groupID);
                                if (!$igoGroupeCouche) {
                                    $igoGroupeCouche = new IgoGroupeCouche ();
                                    $igoGroupeCouche->groupe_id = $groupID;
                                    $igoGroupeCouche->couche_id = $igoLayer->id;
                                    //$igoGroupeCouche->setTransaction($transaction);
                                    $igoGroupeCouche->save();
                                }
                            } else {
                                echo("La couche {$layer['name']} est dans aucun groupe.<br>");
                            }

                            /*
                              if (!$igoContexte || !$layer['currentGroup']) {
                              $igoGroupeCouche = new IgoGroupeCouche ();
                              $igoGroupeCouche->groupe_id = $groupID;
                              $igoGroupeCouche->couche_id = $igoLayer->id;
                              //$igoGroupeCouche->setTransaction($transaction);
                              if ($igoGroupeCouche->save() == false) {
                              if (!is_null($groupID)) {
                              $igoGroupeCouche = IgoGroupeCouche::findFirst('couche_id=' . $igoLayer->id . ' AND groupe_id=' . $groupID);
                              $groupeCoucheId = $igoGroupeCouche->id;
                              } else {
                              $groupeCoucheId = null;
                              }
                              if (!$igoGroupeCouche) {
                              echo("La couche $igoLayer->nom est dans aucun groupe.");
                              }
                              } else {
                              $groupeCoucheId = $igoGroupeCouche->id;
                              }
                              } else {
                              $igoGroupeCouche = IgoGroupeCouche::findFirst('couche_id=' . $igoLayer->id . ' AND groupe_id=' . $groupID);
                              if (!$igoGroupeCouche) {
                              echo("La couche $igoLayer->nom est dans aucun groupe.");
                              }
                              $groupeCoucheId = $igoGroupeCouche->id;
                              } */
                        }
                    } //if ($layer['action'] == 'insert') {
                    /*
                      if ($layer['action'] == 'softinsert') {
                      //on a besoin du $groupeCoucheId
                      //Récupére le première groupe où est le layer
                      $igoGroupeCouche = IgoGroupeCouche::findFirst('couche_id=' . $igoLayer->id);
                      if (!$igoGroupeCouche) {
                      echo("La couche $igoLayer->nom  est dans aucun groupe.");
                      } else {
                      $groupeCoucheId = $igoGroupeCouche->id;
                      }
                      } */

                    //Conserver = softinsert, Insérer/remplacer = insert
                    if ($layer['action'] == 'softinsert' || ($layer['action'] == 'insert' && $layerSaveSuccessful == true)) {
                        if (!isset($excludedAttributees)) {
                            $excludedAttributes = array();
                        }
                        if ($igoContexte) {
                            //If no attributes are excluded, append a null value to the excluded attributes
                            //array. This way a couche_contexte with no excluded attribute will be created
                            if (count($excludedAttributes) == 0) {
                                $excludedAttributes[] = null;
                            }

                            foreach ($excludedAttributes as $excludedAttribute) {
                                $igoCoucheContexte = new IgoCoucheContexte();
                                // $igoCoucheContexte->setTransaction($transaction);
                                $igoCoucheContexte->contexte_id = $igoContexte->id;
                                $igoCoucheContexte->couche_id = $igoLayer->id;
                                $igoCoucheContexte->layer_a_order = $layerIndex++;


                                $nomComplet = str_replace("'", "_", $layer['wms_group_title']);


                                while (!empty($nomComplet)) {
                                    // Fix pour que le groupe existe la première fois. 
                                    $igoVueGroupesRecursif = IgoVueGroupesRecursif::findFirst("nom_complet like '%" . $nomComplet . "'");
                                    $groupe_id = $igoVueGroupesRecursif ? $igoVueGroupesRecursif->groupe_id : $groupID;
                                    //echo $nomComplet.'('.$groupe_id.')';
                                    if ($groupe_id && $igoVueGroupesRecursif) {
                                        //echo "->ok";
                                        $arbre = str_replace(' ', '_', $igoVueGroupesRecursif->grp);
                                        $igoCoucheContexteGroupe = IgoCoucheContexte::findFirst("contexte_id=$igoContexte->id and couche_id IS NULL and arbre_id='$arbre'");
                                        if (!$igoCoucheContexteGroupe) {
                                            //echo "->crée";
                                            $igoCoucheContexteGroupe = new IgoCoucheContexte();
                                            //  $igoCoucheContexteGroupe->setTransaction($transaction);
                                            $igoCoucheContexteGroupe->contexte_id = $igoContexte->id;
                                            $igoCoucheContexteGroupe->couche_id = null;
                                            $igoCoucheContexteGroupe->groupe_id = $groupe_id;
                                            $igoCoucheContexteGroupe->arbre_id = $arbre;
                                            $igoCoucheContexteGroupe->mf_layer_meta_name = $igoVueGroupesRecursif->nom;
                                            $igoCoucheContexteGroupe->mf_layer_meta_title = $igoVueGroupesRecursif->nom_complet;
                                            $a = explode("/", $igoVueGroupesRecursif->nom_complet);
                                            $s = array_pop($a);
                                            $igoCoucheContexteGroupe->mf_layer_meta_title = $s;
                                            $igoCoucheContexteGroupe->mf_layer_meta_group_title = $s;
                                            $igoCoucheContexteGroupe->layer_a_order = $layerIndex++;
                                            $igoCoucheContexteGroupe->est_visible = 'TRUE';
                                            $igoCoucheContexteGroupe->ind_fond_de_carte = 'D';
                                            $igoCoucheContexteGroupe->save();
                                        }
                                    }
                                    //echo '<br>';
                                    $t = explode('/', $nomComplet);
                                    array_pop($t);
                                    $nomComplet = implode('/', $t);
                                }

                                $igoCoucheContexte->groupe_id = $groupe_id;
                                $igoVueGroupesRecursif = IgoVueGroupesRecursif::findFirst("nom_complet like '%" . str_replace("'", "_", $layer['wms_group_title']) . "'");
                                $igoCoucheContexte->arbre_id = $igoVueGroupesRecursif ? str_replace(' ', '_', $igoVueGroupesRecursif->grp) : $groupe_id;
                                $igoCoucheContexte->mf_layer_meta_name = $layer['wms_name'];

                                $igoCoucheContexte->mf_layer_meta_title = $layer['wms_title'];

                                $a = explode("/", $layer['wms_title']);
                                $s = array_pop($a);
                                $igoCoucheContexte->mf_layer_meta_title = $s;
                                $igoCoucheContexte->mf_layer_meta_group_title = $s;
                                $igoCoucheContexte->mf_layer_meta_z_order = $layer['zIndex'];

                                $igoCoucheContexte->est_visible = 'TRUE';
                                $igoCoucheContexte->ind_fond_de_carte = 'D';


                                //Check if some attributes should be overwritten in igoCoucheContexte
                                $coucheContexteName = null;
                                if ($igoContexte && $igoLayer->mf_layer_meta_name && $igoLayer->mf_layer_meta_name != $layer['wms_name']) {
                                    $coucheContexteName = $layer['wms_name'];
                                } else {
                                    $igoLayer->mf_layer_meta_name = ($layer['wms_name'] ? $layer['wms_name'] : $layer['name']);
                                }

                                $coucheContexteTitle = null;
                                if ($igoContexte && $igoLayer->mf_layer_meta_title && $igoLayer->mf_layer_meta_title != $layer['wms_title']) {
                                    $coucheContexteTitle = $layer['wms_title'];
                                } else {
                                    $igoLayer->mf_layer_meta_title = $layer['wms_title'];
                                }

                                $coucheContexteFilter = null;
                                if ($igoContexte && $igoLayer->mf_layer_filtre && $igoLayer->mf_layer_filtre != $layer['filter']) {
                                    $coucheContexteFilter = $layer['filter'];
                                } else {
                                    $igoLayer->mf_layer_filtre = $layer['filter'];
                                }

                                if ($coucheContexteName) {
                                    $igoCoucheContexte->mf_layer_meta_name = $coucheContexteName;
                                }

                                if ($coucheContexteTitle) {
                                    $igoCoucheContexte->mf_layer_meta_title = $coucheContexteTitle;
                                }

                                if ($coucheContexteFilter) {
                                    $igoCoucheContexte->mf_layer_filtre = $coucheContexteFilter;
                                }

                                if ($excludedAttribute) {
                                    $igoCoucheContexte->attribut_id = $excludedAttribute;
                                    $igoCoucheContexte->est_exclu = 'TRUE';
                                }
                                //If the new group is different than the current group, assign the new group the the context instead
                                //of changing the group itself
                                if ($layer['currentGroup'] && ($layer['currentGroup'] != $layer['wms_group_title'])) {
                                    $igoCoucheContexte->mf_layer_meta_group_title = $layer['wms_group_title'];
                                }

                                if ($igoCoucheContexte->save() == false) {
                                    foreach ($igoCoucheContexte->getMessages() as $message) {
                                        throw new Exception($message);
                                    }
                                    //$transaction->rollback();
                                    $this->db->rollback();
                                }
                            }
                        }
                    }
                    $igoCouches[] = $igoLayer;
                }
            }

            // $transaction->commit();
            $this->db->commit();
            if ($igoContexte !== null) {
                $igoContexte->saveMapFile();
            }
            foreach ($igoCouches as $igoCouche) {
                $igoCouche->saveMapFile(false);
            }
        } catch (Exception $e) {
            error_log(json_encode($e));
            throw $e;
        }
    }

}
