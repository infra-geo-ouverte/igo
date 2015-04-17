<?php

use Phalcon\Mvc\View;

class GestionCoucheController extends ControllerBase {

    public function initialize() {
        $this->persistent->parameters = null;
        $phql = "SELECT id, CONCAT(acronyme,\" - \",nom) as  nom FROM  IgoOrganismeResponsable order by acronyme";
        $organisme_desc = $this->modelsManager->executeQuery($phql);
        $this->view->setVar("organisme_desc", $organisme_desc);
        $phql = "SELECT g.id, CONCAT(e.nom,\":\",t.nom) as  nom FROM  IgoClasseEntite AS e, IgoGeometrie AS g, IgoGeometrieType AS t where  g.classe_entite_id=e.id and g.geometrie_type_id=t.id ORDER BY nom";
        $geometrie_desc = $this->modelsManager->executeQuery($phql);
        $this->view->setVar("geometrie_desc", $geometrie_desc);
        parent::initialize();
    }
    
    public function editionAction($id) {
        $igo_couche = IgoCouche::findFirstByid($id);


        $igo_geometrie = $igo_couche->IgoGeometrie;
        $classe_entite_id = $igo_geometrie->classe_entite_id;
        $connexion_id = $igo_geometrie->IgoConnexion->id;
        //  $this->view->setVar("classe_entite_id",$classe_entite_id);
        $this->view->setVar("id", $id);
        $this->session->set("couche_id", $id);

        $this->view->setVar("connexion_id", $connexion_id);
        $this->view->setVar("classe_entite_id", $classe_entite_id);

        $this->view->setVar("geometrie_id", $igo_geometrie->id);
    }

    public function creationAction($r_controller = null, $r_action = null, $r_id = null) {
        $this->tag->setDefault("acces",  "L");
        parent::newAction($r_controller, $r_action, $r_id);
    }

    public function mapfileAction($id) {
        $mapfileInclude = '';
        if(isset($this->config->mapserver->mapfileInclude)){  
            foreach($this->config->mapserver->mapfileInclude as $chemin){
                $mapfileInclude .=  parent::fopen_file_get_contents($chemin);  
            } 
        }
        $this->view->mapfileInclude = $mapfileInclude;
        $couche = IgoCouche::findFirstByid($id);
        $this->view->couche = $couche->getMapFileArray();
        $this->view->preview = true;
    }

    public function loadMapfileAction($id) {
        $this->tag->setDefault("id", $id);
    }

    public function traiteMapfileAction($r_controller = null, $r_action = null, $r_id = null) {
        
        parent::newAction($r_controller, $r_action, $r_id);
        
        if (!$this->request->isPost()) {
            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "index"
            ));
        }

        $this->view->pick("gestion_couche/creation");
        $code = $this->request->getPost("code");
        $code = $this->traiteClass($code);
       
     
        $lignes = explode("\n", $code);
     
        $mf_layer_meta_def = "";
        $mf_layer_def = "";
        $meta = false;
        $projection = false;
       
        foreach ($lignes as $ligne) {
            if ($projection) {
                $this->tag->setDefault('mf_layer_projection', trim($ligne, " '\"\t\n\r"));
                $projection = false;
                continue;
            }
            if (trim($ligne) == "" || trim($ligne) == "LAYER") {
                continue;
            }

            preg_match("/[\s]?(?P<element>[^\s]+)\s+(?P<contenu>[^#\n]*)/i", $ligne, $matches);
            if (!isset($matches['contenu'])) {
                //echo "Pas de match pour $ligne <br>";
                continue;
            } else {
                //printf ("Élément: %s  Contenu: %s <br>",$matches['element'],$matches['contenu']);
            }

            
            switch ($matches['element']) {
                case 'NAME':
                    $this->tag->setDefault('mf_layer_name', trim($matches['contenu'], "'\"\n\r"));
                    $this->tag->setDefault('fiche_csw_id', trim($matches['contenu'], "'\"\n\r"));
                    $catalogue = IgoCatalogueCsw::findFirst();
                    $this->tag->setDefault('catalogue_csw_id', $catalogue->id);
                    $igoClasseEntite = IgoClasseEntite::findFirst("nom='" . trim($matches['contenu'], "'\"\n\r") . "'");
                    if ($igoClasseEntite) {
                        $this->tag->setDefault('classe_entite_id', $igoClasseEntite->id);
                    }
                    break;
                case 'TYPE':
                    $igoGeometrieType = IgoGeometrieType::findFirst("layer_type='" . trim($matches['contenu'], "\n\r") . "'");
                    if($igoGeometrieType){
                        $this->tag->setDefault('geometrie_type_id', $igoGeometrieType->id);
                    }
                    break;
                case 'GROUP':
                    $this->tag->setDefault('mf_layer_group', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case 'CONNECTIONTYPE'://TODO aller chercher la connection
                    $igoConnexionType = IgoConnexionType::findFirst("nom='" . trim($matches['contenu'], "\n\r") . "'");
                    if ($igoConnexionType){
                        $this->tag->setDefault('connexion_type_id', $igoConnexionType->id);
                    }
                    
                    break;
                case 'CONNECTION':
                    $this->tag->setDefault('connexion', trim($matches['contenu'], "'\"\n\r"));
                    // TODO bypasser l'erreur de phql
                    $where="connexion like '" . trim(str_replace("'", "_", trim($matches['contenu'], "'\"\n\r"))) . "'";
                    $igoConnexion = IgoConnexion::findFirst($where);
                    //var_dump($where);
                    if ($igoConnexion) {
                        $this->tag->setDefault('connexion_id', $igoConnexion->id);
                    }
                    break;
                case 'DATA':
                    $this->tag->setDefault('mf_layer_data', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case 'MINSCALE':
                    $this->tag->setDefault('mf_layer_minscale_denom', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case 'MAXSCALE':
                    $this->tag->setDefault('mf_layer_maxscale_denom', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case 'LABELMINSCALE':
                    $this->tag->setDefault('mf_layer_labelminscale_denom', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case 'LABELMAXSCALE':
                    $this->tag->setDefault('mf_layer_labelmaxscale_denom', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case 'OPACITY':
                    $this->tag->setDefault('mf_layer_opacity', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case 'FILTER':
                    $this->tag->setDefault('mf_layer_filter', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case '"wms_group_title"':
                    $this->tag->setDefault('wms_group_title', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case '"wms_name"':
                    $this->tag->setDefault('wms_name', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case '"wms_title"':
                    $this->tag->setDefault('wms_title', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case '"z_order"':
                    $this->tag->setDefault('z_order', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case '"msp_classe_meta"':
                    $this->tag->setDefault('fiche_csw_id', trim($matches['contenu'], "'\"\n\r"));
                    break;
                case 'PROJECTION':
                    $projection = true;
                    break;
                case 'METADATA':
                    $meta = true;
                    break;
                case 'END':
                    $meta = false;
                    break;
                case 'PROCESSING':
                    break;
                default:
                    if ($meta) {
                        $mf_layer_meta_def = $mf_layer_meta_def . "\n" . $ligne;
                    } else {
                        $mf_layer_def = $mf_layer_def . "\n" . $ligne;
                    }
            }
            $this->tag->setDefault('mf_layer_meta_def', trim($mf_layer_meta_def, "'\"\n\r"));
            $this->tag->setDefault('mf_layer_def', trim($mf_layer_def, "'\"\n\r"));
        }
        
    }

    /**
     * Retire la section CLASS[...]END du code. La partie retiré est affectée à mf_class_def
     * @param string $code
     * @return string
     */
    function traiteClass($code) {
      
        $offset = strpos($code, "CLASS");
        if (!$offset) {
            $this->tag->setDefault('mf_class_def', '');
            return $code;
        }

        $offset = 0;
        while ($offset < strlen($code)) {

            $offset += 1;
            if (trim(substr($code, $offset, 6)) == "CLASS") {
                $this->tag->setDefault('mf_class_def', trim(substr($code, $offset, strrpos($code, "END")), "'\"\n\r"));
                return substr($code, 0, $offset) . "\n" . substr($code, strrpos($code, "END"));
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

        $this->tag->setDefault('vue-avancee', $this->request->getPost('vue-avancee'));
        try {
            
            $msg_succes = array();
            
            $manager = new Phalcon\Mvc\Model\Transaction\Manager();
            $transaction = $manager->get();
            
            $igo_geometrie = new IgoGeometrie();
            $igo_geometrie->setTransaction($transaction);
            $this->assigneFromPost($igo_geometrie);
            if(!$igo_geometrie->save()){
                $transaction->rollback(implode('<br> ', $igo_geometrie->getMessages()));
            }
            $msg_succes[] = "Géométrie " . $igo_geometrie->id . " créée avec succès";

             //TODO le code qui suit devrait être dans le model. Il faudra l'ajuster quand on saura quoi faire avec l'Inclusion des attributs
            $igo_connexion = IgoConnexion::findFirstById(intval($this->request->getPost("connexion_id")));
            
            if ($igo_connexion) {
                $msg_succes[] = "Connexion " . $igo_connexion->id . " réutilisée";
                
            }else{
                
                //Ajouter la connexion qu'on va utiliser
                $igo_connexion = new IgoConnexion();
                $igo_connexion->setTransaction($transaction);
                $this->assigneFromPost($igo_connexion);
                
                $connexion_type_id = intval($this->request->getPost("connexion_type_id"));
                if($connexion_type_id){
                    $connexion_type = IgoConnexionType::findFirstById($connexion_type_id);
                    $igo_connexion->connexion_type_id = $connexion_type->id;
                    $igo_connexion->nom = $connexion_type->nom; //TODO à synchroniser avec la rétro
                }
                
                if (!$igo_connexion->save()) {

                    $transaction->rollback(implode('<br> ', $igo_connexion->getMessages()));
                } 
                
                $msg_succes[] = "Connexion " . $igo_connexion->id . " créée avec succès";
            
            }
              
            
            $igo_couche = new IgoCouche();
            $igo_couche->setTransaction($transaction);
            $this->assigneFromPost($igo_couche);
            
            $igo_couche->geometrie_id = $igo_geometrie->id;
            
            if(!$igo_couche->save()) {
                 $transaction->rollback(implode('<br> ', $igo_couche->getMessages()));
            }
            
            $msg_succes[] = "Couche " . $igo_couche->id . " créée avec succès";
            
            $igo_classe = new IgoClasse();
            $igo_classe->setTransaction($transaction);
            $this->assigneFromPost($igo_classe);
            
            if($igo_classe->mf_class_def){
                
                $igo_classe->couche_id = $igo_couche->id;
                if(!$igo_classe->save()) {
                    $transaction->rollback(implode('<br> ', $igo_classe->getMessages()));
                }
                $msg_succes[] = "Classe " . $igo_classe->id . " créée avec succès";
                    
            }

            $transaction->commit();

            foreach($msg_succes as $msg){
                $this->flash->success($msg);
            }
              
            return;
        } catch (\Exception $e) {
            $this->flash->error($e->getMessage());
            return $this->dispatcher->forward(array(
                "controller" => "gestion_couche",
                "action" => "traiteMapfile"
            ));
        }
    }
}
