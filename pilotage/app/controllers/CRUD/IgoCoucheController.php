<?php

use Phalcon\Mvc\Model\Criteria;
use Phalcon\Paginator\Adapter\Model as Paginator;

class IgoCoucheController extends ControllerBase {

     public function searchAction($parameters = null) {
         
         
         parent::searchAction($parameters);
     }
    
    /**
     * Index action
     */
    public function indexAction($r_controller = null, $r_action = null, $r_id = null) {
        $this->persistent->parameters = null;

        $this->setGeometrieDesc();
        parent::indexAction($r_controller, $r_action, $r_id);
    }

    public function associerContexteAction($id, $page = 1) {
        $this->view->setVar("id", $id);
        $this->view->setVar("page", $page);
        $this->view->setVar("contexte_id", $id);
    }

    public function associerContexteEditAction($param) {
        $numberPage = 1;

        if (strpos($param, "&") > 0) { //Ok, Ok, c'est pas joli... il faudra parser. voir arbreCouchesEditAction
            $numberPage = substr($param, strpos($param, "&page=") + 6);
            $param = substr($param, 0, strpos($param, "&"));
        }

        if ($this->startsWith($param, "contexte_id")) {
            $contexte_id = intval(substr($param, strrpos($param, "=") + 1));
            // Sauvegarde du formulaire
            $act_id = $id = 0;
            $nouvelleValeur = FALSE; // 
            $a_creer = TRUE; // L'instance de couche contexte doit être créee
            foreach ($_POST as $attribut_id => $valeur) {
                if ($this->endsWith($attribut_id, "_")) {
                    $couche_contexte_id = 0;
                } else {
                    $couche_contexte_id = intval(substr($attribut_id, strrpos($attribut_id, "_") + 1));
                }
                $attribut_id = substr($attribut_id, 0, strrpos($attribut_id, "_"));
                $id = intval(substr($attribut_id, strrpos($attribut_id, "_") + 1));
                $attribut = substr($attribut_id, 0, strrpos($attribut_id, "_"));

                if ($id > 0) { //C'est un attribut
                    if ($act_id <> $id) { //une autre ligne
                        if ($act_id <> 0 && $nouvelleValeur) {

                            $igoCouchecontexte->save();
                            if (!($igoCouchecontexte->est_visible || $igoCouchecontexte->est_active)) {
                                $igoCouchecontexte->delete();
                            }
                        }
                        $nouvelleValeur = FALSE;
                        $a_creer = TRUE;
                    }
                    if ($a_creer) {
                        if ($couche_contexte_id == 0) {
                            $igoCouchecontexte = new IgoCoucheContexte();
                            //$igoCouche=IgoCouche::findFirst("id=" . $id);
                            $igoCouchecontexte->contexte_id = $contexte_id;
                            $igoCouchecontexte->couche_id = $id;
                        } else {
                            $igoCouchecontexte = IgoCoucheContexte::findFirst("id=" . $couche_contexte_id);
                        }
                        $nouvelleValeur = $igoCouchecontexte->est_visible || $igoCouchecontexte->est_active;
                        $igoCouchecontexte->est_visible = FALSE;
                        $igoCouchecontexte->est_active = FALSE;
                        $a_creer = FALSE;
                    }

                    if (isset($valeur) && $valeur <> 0 && trim($valeur) <> "" && !is_null($valeur) && $valeur <> FALSE) {
                        $nouvelleValeur = TRUE;
                    }


                    $act_id = $id;
                    $igoCouchecontexte->$attribut = $valeur;
                }
            }
            if ($act_id <> 0 && $nouvelleValeur) {
                $igoCouchecontexte->save();
                if (!($igoCouchecontexte->est_visible || $igoCouchecontexte->est_active)) {
                    $igoCouchecontexte->delete();
                }
            }
            $this->flash->notice("Changements sauvegardés");

            //Requête 
            $phql = $this->modelsManager->createBuilder()
                    ->columns("IgoCoucheContexte.id as id,"
                            . "type,"
                            . "IgoCouche.id as couche_id,"
                            . "IgoCouche.description,"
                            . "classe_entite_id,"
                            . "geometrie_type_id,"
                            . "est_fond_de_carte,"
                            . "est_visible,"
                            . "est_active,"
                            . "ind_fond_de_carte,"
                            . "IgoCoucheContexte.mf_layer_meta_name,"
                            . "IgoCoucheContexte.mf_layer_meta_title,"
                            . "IgoCoucheContexte.mf_layer_meta_group_title,"
                            . "mf_layer_class_def")
                    ->from('IgoCouche')
                    ->join('IgoGeometrie')
                    ->leftjoin('IgoCoucheContexte')
                    ->where("IgoCoucheContexte." . $param . " OR  IgoCoucheContexte.contexte_id IS NULL")
                    ->orderBy('contexte_id');
        }


        $paginator = new Phalcon\Paginator\Adapter\QueryBuilder(array(
            "builder" => $phql,
            "limit" => 10,
            "page" => $numberPage
        ));

        $this->view->page = $paginator->getPaginate();
    }

    /**
     * Displayes the creation form
     */
    public function newAction($r_controller = null, $r_action = null, $r_id = null) {

        parent::newAction($r_controller, $r_action, $r_id);
        /*
       $igo_couche = IgoCouche::findFirstByid($id);
            if (!$igo_couche) {
                $this->flash->error("Couche $id non-trouvée");
            } else {
                $this->tag->setDefault("acces", $igo_couche->IgoGeometrie->acces);
            }*/
        $this->setGeometrieDesc();
        if ($this->session->has("geometrie_id")) {
            $geometrie_id=$this->session->get("geometrie_id");
            $this->tag->setDefault("geometrie_id", $geometrie_id);
            $igo_geometrie = IgoGeometrie::findFirstByid($geometrie_id);
            $this->tag->setDefault("acces",$igo_geometrie->acces);
        }
    }

    /**
     * Edits a igo_couche
     *
     * @param string $id
     */
    public function editAction($id=null, $r_controller = null, $r_action = null, $r_id = null) {
        
        
        if ($this->request->isPost() && (!isset($id) || !is_numeric($id))) {
            $id = $this->request->getPost("id");
        }
        
        parent::editAction($id, $r_controller, $r_action, $r_id);
                
        $igo_couche = IgoCouche::findFirstByid($id);
        
        if (!$igo_couche) {
            $this->flash->error("Couche $id non-trouvée");
        } else {
            $this->tag->setDefault("acces", $igo_couche->IgoGeometrie->acces);
        }

        $this->setGeometrieDesc();
    }
    
    public function saveAction($r_controller = null, $r_action = null, $r_id = null){
        
        $this->setGeometrieDesc();
        parent::saveAction($r_controller, $r_action, $r_id);
        
    }

    function ficheAction($id, $r_controller = null, $r_action = null, $r_id = null) {
        $retour = "";
        if (!is_null($r_id)) {
            $retour = $r_controller . "/" . $r_action . "/" . $r_id . $this->r_parameters;
        }
        $this->view->setVar("retour", $retour);


        if (!$this->request->isPost()) {

            $igo_couche = IgoCouche::findFirstByid($id);
            if (!$igo_couche) {
                $this->flash->error("Couche $id non-trouvée");

                return $this->dispatcher->forward(array(
                            "controller" => $this->ctlName,
                            "action" => "index"
                ));
            }
            if (!isset($igo_couche->IgoGeometrie->IgoClasseEntite->IgoCatalogueCsw)) {
                $this->view->setVar("fiche","Catalogue non-trouvé");
                return;
            }
            $catalogue = $igo_couche->IgoGeometrie->IgoClasseEntite->IgoCatalogueCsw->url;
            $fiche_csw_id = $igo_couche->fiche_csw_id;
            if (trim($fiche_csw_id) == "") {
                $fiche_csw_id = $igo_couche->mf_layer_name; //TODO devrait être fait par la réingénierie. Préséence à msp_class_meta
            }
            $url = "http://" . $catalogue . "?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecordById&outputSchema=csw:IsoRecord&ID={$fiche_csw_id}&elementSetName=full";
            try{
                $xml = parent::curl_file_get_contents($url);
                $this->view->setVar("fiche",$this->transform($xml, file_get_contents("xml/bs_full.xsl")));
            } catch (Exception $e){
                $this->view->setVar("fiche","Erreur lors de l'accès au catalogue");
            }
        }
    }
/*
    public function saveAction($r_controller = null, $r_action = null, $r_id = null) {
        parent::saveAction($r_controller, $r_action, $r_id);
        $couche_id = $this->request->getPost("id");
        $couche = IgoCouche::findFirstById($couche_id);
        if (!$couche) {
            throw new Exception("Couche inexistante");
        }
        $couche->save();
        
         
    }*/
    
    function transform($xml, $xsl) {
        $xslt = new XSLTProcessor();
        $xslt->importStylesheet(new SimpleXMLElement($xsl));
        return $xslt->transformToXml(new SimpleXMLElement($xml));
    }
    
    function setGeometrieDesc(){
        $phql = "SELECT g.id, CONCAT(e.nom,\":\",t.nom) as  nom FROM  IgoClasseEntite AS e, IgoGeometrie AS g, IgoGeometrieType AS t where  g.classe_entite_id=e.id and g.geometrie_type_id=t.id ORDER BY nom";
        $geometrie_desc = $this->modelsManager->executeQuery($phql);
        $this->view->setVar("geometrie_desc", $geometrie_desc); 
    }

}
