<?php

use Phalcon\Mvc\Model\Criteria;
use Phalcon\Paginator\Adapter\Model as Paginator;
use Phalcon\Text;
use Phalcon\Mvc\Model\Resultset\Simple as Resultset;

class IgoGroupeController extends ControllerBase {

    public function associerContexteAction($id, $page = 1) {
        $this->view->setVar("id", $id);
        $this->view->setVar("page", $page);
        $this->view->setVar("contexte_id", $id);
    }

    public function associerContexteEditAction($param) {
        $numberPage = 1;

        if (strpos($param, "&") > 0) { //Ok, Ok, c'est pas joli... il faudra parser.
            $numberPage = substr($param, strpos($param, "&page=") + 6);
            $param = substr($param, 0, strpos($param, "&"));
        }

        if ($this->startsWith($param, "contexte_id")) {
            $contexte_id = intval(substr($param, strrpos($param, "=") + 1));
            // Sauvegarde du formulaire
            $act_id = $id = 0;
            $nouvelleValeur = FALSE; // 
            $a_creer = TRUE; // L'instance de couche contexte doit être créée
            foreach ($_POST as $attribut_id => $valeur) {
                if ($this->endsWith($attribut_id, "_")) {
                    $couche_contexte_id = 0;
                } else {
                    $couche_contexte_id = intval(substr($attribut_id, strrpos($attribut_id, "_") + 1));
                }
                $attribut_id = substr($attribut_id, 0, strrpos($attribut_id, "_"));
                $id = intval(substr($attribut_id, strrpos($attribut_id, "_") + 1));
                $attribut = substr($attribut_id, 0, strrpos($attribut_id, "_"));
                /*
                  var_dump($contexte_id);
                  var_dump($id);
                  var_dump($attribut_id);
                  var_dump($attribut);
                  var_dump($valeur);
                 */
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
                            $igoCouchecontexte->groupe_id = $id;
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
                            . "IgoGroupe.id as groupe_id,"
                            . "nom,"
                            . "IgoGroupe.description,"
                            . "ind_fond_de_carte,"
                            . "est_visible,"
                            . "est_active")
                    ->from('IgoGroupe')
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

    public function newAction($r_controller = null, $r_action = null, $r_id = null) {

        //    $this->definirGroupesPourSelecteur();
        //    $this->definirCouchesPourSelecteur();

        parent::newAction($r_controller, $r_action, $r_id);
    }

    function editAction($id, $r_controller = null, $r_action = null, $r_id = null) {
        $this->definirParentsPourSelecteur($id);
        //$this->definirGroupesPourSelecteur($id);
        $this->definirCouchesPourSelecteur($id);
        
        parent::editAction($id, $r_controller, $r_action, $r_id);
    }

    /**
     * Créé le groupe et lui associe ses enfants
     * @param type $r_controller
     * @param type $r_action
     * @param type $r_id
     */
    public function createAction($r_controller = null, $r_action = null, $r_id = null) {

        if (!$this->request->isPost()) {
            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "index"
            ));
        }
        $igo_groupe = new IgoGroupe();

        $this->assigneFromPost($igo_groupe);
        try {
            if (!$igo_groupe->save()) {
                foreach ($igo_groupe->getMessages() as $message) {
                    $this->flash->error($message);
                }

                return $this->dispatcher->forward(array(
                            "controller" => $this->ctlName,
                            "action" => "new",
                            "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
                ));
            } else {
                $this->flash->success(Text::camelize(str_replace("igo_", "", $this->ctlName)) . " " . $igo_groupe->id . " créé avec succès");
            }
        } catch (\Exception $e) {

            //Réassigner les couches enfants pour l'affichage
            if ('couche' == $specifier) {

                //Couches qu'il ne faut pas réafficher comme enfant du groupe
                $couchesPasEnfantDeGroupe = $this->modelsManager->executeQuery("SELECT c.id AS valeur, c.mf_layer_name AS libelle " .
                        "FROM IgoGroupeCouche AS gc " .
                        "INNER JOIN IgoCouche AS c ON c.id = gc.couche_id " .
                        "WHERE gc.id NOT IN ($ids) " .
                        "ORDER BY c.mf_layer_name"
                );
                //Couches qu'ils faut réafficher comme enfant du groupe
                $couchesEnfantDeGroupe = $this->modelsManager->executeQuery("SELECT c.id AS valeur, c.mf_layer_name AS libelle " .
                        "FROM IgoGroupeCouche AS gc " .
                        "INNER JOIN IgoCouche AS c ON c.id = gc.couche_id " .
                        "WHERE gc.id IN ($ids) "
                );

                $this->view->setVar("couchesPasEnfantDeGroupe", $couchesPasEnfantDeGroupe);
                $this->view->setVar("couchesEnfantDeGroupe", $couchesEnfantDeGroupe);

                $this->definirGroupesPourSelecteur();

                //Réassigner les groupes enfants pour l'affichage
            } elseif ('groupe' == $specifier) {

                //Groupes qu'on peut assigner comme enfant. Ceux qui sont à la racine et qui ne sont pas ses parents
                $groupesPasEnfantDeGroupe = $this->modelsManager->executeQuery("SELECT id AS valeur, nom AS libelle FROM IgoGroupe WHERE id NOT IN :ids: ORDER BY nom", array(
                    'ids' => $ids
                ));

                //Groupes qui sont dans le groupe
                $groupesEnfantDeGroupe = $this->modelsManager->executeQuery("SELECT id AS valeur, nom AS libelle FROM IgoGroupe WHERE id IN :ids: ORDER BY nom", array(
                    'ids' => $ids
                ));

                $this->view->setVar("groupesPasEnfantDeGroupe", $groupesPasEnfantDeGroupe);
                $this->view->setVar("groupesEnfantDeGroupe", $groupesEnfantDeGroupe);

                $this->definirCouchesPourSelecteur();
            }

            $this->flash->error($e->getMessage());
            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "new",
                        "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
            ));
        }

        $specifier = $this->request->getPost('specifier');



        //Nettoyer les id de la liste des enfants à traiter
        if ('couche' == $specifier) {

            $ids = $this->request->getPost('multiselect_couche_valeurs');
        } elseif ('groupe' == $specifier) {
            $ids = $this->request->getPost('multiselect_groupe_valeurs');
        }

        //Nettoyer la liste de ID
        $ids = explode(',', $ids);
        foreach ($ids as $cle => $valeur) {
            $ids[$cle] = intval($valeur);
        }
        $ids = implode(',', $ids);

        $profil_proprietaire_id = intval($this->request->getPost('profil_proprietaire_id'));
        $this->gererAssociationEnfantsGroupeCouche($specifier, $igo_groupe->id, $ids, $profil_proprietaire_id);

        if ($profil_proprietaire_id && !$igo_groupe->groupe_id) {

            //Créer une permission pour le groupe
            $igo_permission = new IgoPermission();
            $igo_permission->profil_id = $profil_proprietaire_id;
            $igo_permission->groupe_id = $igo_groupe->id;
            $igo_permission->est_lecture = true;
            $igo_permission->est_analyse = true;
            $igo_permission->est_ecriture = true;
            $igo_permission->est_export = true;
            $igo_permission->est_association = true;
            if (!$igo_permission->save()) {
                foreach ($igo_permission->getMessages() as $message) {
                    echo $message;
                }
            }
        }

        return $this->dispatcher->forward(array(
                    "controller" => $this->ctlName,
                    "action" => "search"
        ));
    }

    /*
     * Fait enregistrer les enfants du groupe (soit des groupes ou des couches),
     *  puis enregistre les autres champs du formulaire
     */

    function saveAction($r_controller = null, $r_action = null, $r_id = null) {

        try {
            $save = parent::saveAction($r_controller, $r_action, $r_id);
        } catch (Exception $ex) {
            $this->flash->error($e->getMessage());

            return $this->dispatcher->forward(array(
                        "controller" => $this->ctlName,
                        "action" => "new",
                        "param" => (!is_null($r_id)) ? "/" . $r_controller . "/" . $r_action . "/" . $r_id : ""
            ));
        }
        // On récupère le profil propriétaire du groupe ajouté
        $profil_proprietaire_id = $this->request->getPost("profil_proprietaire_id");
        $id = intval($this->request->getPost('id'));

        $this->gererAssociationParentsGroupeCouche($id, $profil_proprietaire_id);
        $this->gererAssociationEnfantsGroupeCouche($id, $profil_proprietaire_id);
        
        $igoVueGroupesRecursifMaterialized = new IgoVueContexteGroupesRecursifMaterialized();
        $igoVueGroupesRecursifMaterialized->refresh();
        
        $igoVueContexteGroupesRecursifMaterialized = new IgoVueContexteGroupesRecursifMaterialized();
        $igoVueContexteGroupesRecursifMaterialized->refresh();

        return $save;
    }

    /**
     * 
     * @param string $type Type d'enfant : 'couche' ou 'groupe'

     * @param int $profil_id Profil propriéraire du groupe
     */
    private function gererAssociationEnfantsGroupeCouche($id, $profil_id) {
        //Détermine si le groupe contient des couches ou des groupes
        $specifier = $this->request->getPost('specifier');
        //Nettoyer les id de la liste des enfants à traiter
        if ('couche' == $specifier) {
            $ids = $this->request->getPost('multiselect_couche_enfant_valeurs');
        } elseif ('groupe' == $specifier) {
            $ids = $this->request->getPost('multiselect_groupe_enfant_valeurs');
        }

        $ids = explode(',', $ids);
        foreach ($ids as $index => $valeur) {
            $valeur = intval($valeur);
            
            if ($valeur) {
                $ids[$index] = $valeur;
            }else{
                unset($ids[$index]);
            }
            
        }
   
        $igo_groupe_couche = new IgoGroupeCouche();

        switch ($specifier) {

            //Le groupe contient des couches
            case 'couche':

                //Supprimer tous les sous-groupes de ce groupe
                $this->modelsManager->executeQuery("DELETE FROM IgoGroupeGroupe WHERE parent_groupe_id = {$id}");
     
                $igo_groupe_couche->enleverCouchesDuGroupe(implode(',', $ids), $id, $profil_id);
                $igo_groupe_couche->ajouterCouchesAuGroupe(implode(',', $ids), $id, $profil_id);

                break;

            //Le groupe contient des groupes
            case 'groupe':

                //Supprimer tous les sous-groupes de ce groupe
                $this->modelsManager->executeQuery("DELETE FROM IgoGroupeGroupe WHERE parent_groupe_id = {$id}");

                //Supprimer toutes les couches de ce groupe
                $igo_groupe_couche->enleverCouchesDuGroupe(0, $id, $profil_id);

                foreach ($ids as $parent_groupe_id) {
                    //echo"INSERT into IgoGroupeGroupe (groupe_id, parent_groupe_id) VALUES ({$parent_groupe_id},{$id})";
                    $this->modelsManager->executeQuery("INSERT into IgoGroupeGroupe (groupe_id, parent_groupe_id) VALUES ({$parent_groupe_id},{$id})");
                }
                break;
            default:

                break;
        }
    }

    /**
     * 
     * @param string $type Type d'enfant : 'couche' ou 'groupe'

     * @param int $profil_id Profil propriéraire du groupe
     */
    private function gererAssociationParentsGroupeCouche($id, $profil_id) {
        //Nettoyer les id de la liste des parents à traiter

        $ids = $this->request->getPost('multiselect_groupe_parent_valeurs');
       
        $ids = explode(',', $ids);
        foreach ($ids as $index => $valeur) {
            $valeur = intval($valeur);

            if ($valeur) {
                $ids[$index] = $valeur;
            }else{
                unset($ids[$index]);
            }
            
        }

        $igo_groupe_couche = new IgoGroupeCouche();

        //Supprimer tous les groupes parents de ce groupe
        $this->modelsManager->executeQuery("DELETE FROM IgoGroupeGroupe WHERE groupe_id = {$id}");
      
        
        foreach ($ids as $parent_groupe_id) {
            
            $igoGroupeGroupe = new IgoGroupeGroupe();
            $igoGroupeGroupe->groupe_id = $id;
            $igoGroupeGroupe->parent_groupe_id = $parent_groupe_id;
            $igoGroupeGroupe->save();

        }
    }

    /**
     * Stocke dans la vue, pour un groupe, les groupes, qui sont 
     * ses parents directs et qui ne sont ses parents
     * @param int $id Groupe courant
     */
    private function definirParentsPourSelecteur($id = 0) {
        $groupe = IgoGroupe::findFirst($id);
        $groupesParentsDeGroupe = array();
        $groupesEnfantsDeGroupe = array();
        $groupesPasParentsDeGroupe = array();
        $groupesPasEnfantsDeGroupe= array();
        
        $estAdmin = $this->session->get("info_utilisateur")->estAdmin;
        if ($estAdmin) {
            foreach ($groupe->parents as $value) {
                $groupesParentsDeGroupe[] = array("id" => $value->id, "valeur" => $value->nom);
            }

            foreach ($groupe->enfants as $value) {
                $groupesEnfantsDeGroupe[] = array("id" => $value->id, "valeur" => $value->nom);
            }

            $sql = "SELECT last(groupe_id) as groupe_id, last(nom) as nom, last(parent_groupe_id) as parent_groupe_id, last(nom_complet) as nom_complet, last(est_exclu_arbre) as est_exclu_arbre"
                    . " from igo_vue_groupes_recursif"
                    . " WHERE groupe_id not in (select groupe_id from igo_vue_groupes_recursif where concat(' ',grp,' ') like '% " . $groupe->id . " %' )"
                    . "  AND groupe_id not in (select groupe_id from igo_groupe_couche)"
                    . "GROUP BY groupe_id";
            $groupes = new IgoVueGroupesRecursif();
            $liste = new Resultset(null, $groupes, $groupes->getReadConnection()->query($sql));


            foreach ($liste as $value) {
                $groupesPasParentsDeGroupe[] = array("id" => $value->groupe_id, "valeur" => $value->nom);
            }
              $sql = "SELECT last(groupe_id) as groupe_id, last(nom) as nom, last(parent_groupe_id) as parent_groupe_id, last(nom_complet) as nom_complet, last(est_exclu_arbre) as est_exclu_arbre"
                    . " from igo_vue_groupes_recursif"
                    . " WHERE groupe_id not in (select groupe_id from igo_vue_groupes_recursif where concat(' ',grp,' ') like '% " . $groupe->id . " %' )"
                    . "GROUP BY groupe_id";
           /*   
           $sql = "SELECT * from igo_vue_groupes_recursif"
                    . " WHERE groupe_id not in (select groupe_id from igo_vue_groupes_recursif where concat('/',nom_complet,'/')like '%/" . $groupe->nom . "/%')"    */         ;
            $groupes = new IgoVueGroupesRecursif();
            $liste = new Resultset(null, $groupes, $groupes->getReadConnection()->query($sql));


            foreach ($liste as $value) {
                $groupesPasEnfantsDeGroupe[] = array("id" => $value->groupe_id, "valeur" => $value->nom);
            }

            //Est un pilote
        } else {
            //TODO
        }

        $this->view->setVar("groupesPasParentsDeGroupe", $groupesPasParentsDeGroupe);
        $this->view->setVar("groupesPasEnfantsDeGroupe", $groupesPasEnfantsDeGroupe);
        $this->view->setVar("groupesParentsDeGroupe", $groupesParentsDeGroupe);
        $this->view->setVar("groupesEnfantsDeGroupe", $groupesEnfantsDeGroupe);
    }

    /**
     * Stocke dans la vue, pour un groupe, les groupes et les couches, qui sont son enfant et qui ne sont pas son enfant
     * @param int $id Groupe courant
     */
    private function definirCouchesPourSelecteur($id = 0) {
        $id = intval($id);
        $couchesEnfantDeGroupe = array();
        $couchesPasEnfantDeGroupe = array();

        $groupe = IgoGroupe::findFirst($id);
        $estAdmin = $this->session->get("info_utilisateur")->estAdmin;
        if ($estAdmin) {
            //Couches qui ne sont pas dans le groupe
            $sql = "SELECT DISTINCT c.id , c.mf_layer_name AS valeur "
                    . "FROM igo_couche AS c "
                    . "LEFT JOIN igo_groupe_couche AS gc ON c.id = gc.couche_id WHERE gc.groupe_id <> {$id} "
                    . "AND NOT EXISTS (SELECT id FROM igo_groupe_couche AS sr_gc WHERE sr_gc.couche_id = c.id AND sr_gc.groupe_id = {$id}) ";

            $igo_groupe = new IgoGroupe();
            $couchesPasEnfantDeGroupe = new Resultset(null, $igo_groupe, $igo_groupe->getReadConnection()->query($sql));
        } else {

            $profils = $this->getDi()->getSession()->get("profils");
            $ids_profil = array();
            foreach ($profils as $profil) {

                $ids_profil[] = $profil["id"];
            }
            $ids_profil = implode(',', $ids_profil);

            //Couches qui ne sont pas dans le groupe
            $sql = "SELECT DISTINCT c.id , c.mf_layer_name AS valeur
                    FROM igo_couche AS c 
                    LEFT JOIN igo_groupe_couche AS gc  ON c.id = gc.couche_id 
                    INNER JOIN IgoVuePermissionsPourCouches AS vpc
                    ON vpc.couche_id = gc.id
                    WHERE gc.groupe_id <> :groupe_id:
                    AND est_association AND profil_id IN ({$ids_profil})";

            $couchesPasEnfantDeGroupe = $this->modelsManager->executeQuery($sql, array(
                'groupe_id' => $id
            ));
        }
        
        $estGroupeDeCouche = $groupe->couches->count();
        $this->view->setVar("estGroupeDeCouche", $estGroupeDeCouche);
       
        //Couches qui sont dans le groupe
        foreach ($groupe->couches as $value) {
            $couchesEnfantDeGroupe[] = array("id" => $value->id, "valeur" => $value->mf_layer_name);
        }

        
        $this->view->setVar("couchesPasEnfantDeGroupe", $couchesPasEnfantDeGroupe);
        $this->view->setVar("couchesEnfantDeGroupe", $couchesEnfantDeGroupe);
    }

}
