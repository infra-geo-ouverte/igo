<?php

use Phalcon\Mvc\Model\Resultset\Simple as Resultset;
use Phalcon\Mvc\View;

class IgoPermissionController extends ControllerBase {

    public function searchAction($parameters = null){
        $this->view->setVar("controller", $this->getControllerName());
        $this->view->setVar("action", $this->getActionName()."/".$this->getParameters());
        parent::searchAction($parameters);
    }
    
    
    public function editwAction($id, $r_controller = null, $r_action = null, $r_id = null) {
        $this->view->setRenderLevel(View::LEVEL_ACTION_VIEW);
        $this->editAction($id, "igo_permission", "editw", $id);
        $this->view->setRenderLevel(View::LEVEL_MAIN_LAYOUT);
    }

    public function editAction($id, $r_controller = null, $r_action = null, $r_id = null) {
        $phql = "SELECT a.id, CONCAT(c.nom,\":\",a.colonne) as nom FROM  IgoGeometrie as g, IgoAttribut as a, IgoClasseEntite as c where  a.geometrie_id=g.id and g.classe_entite_id=c.id order by c.nom, a.colonne";
        $attribut_desc = $this->modelsManager->executeQuery($phql);
        $this->view->setVar("attribut_desc", $attribut_desc);
        parent::editAction($id, $r_controller, $r_action, $r_id);
    }

    public function arbreCouchesAction($profil_id) {
        $this->view->setVar("id", $profil_id);
        // $this->view->setVar("page", $page);
        $this->view->setVar("profil_id", $profil_id);
    }

    public function arbreCouchesEditAction($param) {

        $params = array();
         $deleted=false;
        parse_str($param, $params);

        $profil_id = isset($params['profil_id']) ? $params['profil_id'] : false;


        if (!$profil_id) {
            $this->flash->error("igo_profil non-trouvé");

            return $this->dispatcher->forward(array(
                        "controller" => "igo_profil",
                        "action" => "index"
            ));
        }

        //On récupère les données du formulaire Associer des groupes et des couches
        if (isset($_POST['valeursArbo'])) {
            $valeurs = json_decode($_POST['valeursArbo']);

            //On récupères les données de la rétro d'un mapfile
        } else {
            $valeurs = $_POST;
        }

        //Sauvegarde des items du formulaire
        $igoPermission = false;

        foreach ($valeurs as $name => $valeur) {
            if (!$deleted){
                 $phql = "DELETE FROM IgoPermission WHERE profil_id={$profil_id}";
                 $this->modelsManager->executeQuery($phql);
                 $deleted=true;
                 //var_dump($deleted);
            }
            $couche_id=null;
            $changed = false;
            $type = null;
            $titre = null;


            //Déterminer à quoi on a affaire
            if ('G' == substr($name, 0, 1)) {
                $type = 'groupe';
                $a = explode("_", substr($name, 2));
                $groupe_id = array_pop($a);
            } elseif ('CX' == substr($name, 0, 2)) {
                $type = 'colonne';
                $a = explode("_", substr($name, 2));
                $attribut_id = array_pop($a);
                $couche_id = substr($name, 2, strpos($name, "_") - 2);
            } elseif ('C' == substr($name, 0, 1)) {
                $type = 'couche';
                $couche_id = explode("_", substr($name, 2))[0];
            }
          //if (isset($valeur)&& $valeur!=0){
          //       printf("name: %s,  groupe_id: %s, couche_id: %s, type: %s, valeur: %s<br>", $name,  $groupe_id, $couche_id, $type, $valeur);
         //  }
            //Tenter de récupérer le igo_couche_contexte associé
            switch ($type) {
                case 'groupe':

                    if (!$igoPermission || $igoPermission->groupe_id <> $groupe_id) {
                        $igoPermission = IgoPermission::findFirst("profil_id={$profil_id} AND groupe_id={$groupe_id} AND attribut_id is null");
                    }
                    break;

                case 'colonne':

                    $igoPermission = IgoPermission::findFirst("profil_id={$profil_id} AND attribut_id={$attribut_id}");
                    break;

                case 'couche':
                    if (!$igoPermission || $igoPermission->couche_id <> $couche_id) {
                        $igoPermission = IgoPermission::findFirst("profil_id={$profil_id} AND couche_id={$couche_id} AND attribut_id is null");
                    }
                    break;
            }

            if (!$igoPermission && $valeur) {

                $changed = true;
                $igoPermission = new IgoPermission();
                $igoPermission->profil_id = $profil_id;

                switch ($type) {
                    case 'groupe':

                        $igoPermission->groupe_id = $groupe_id;
                        break;

                    case 'colonne':

                        //$igoGroupeCouche = IgoGroupeCouche::findFirst('id=' . $couche_id);
                       // if (!$igoGroupeCouche) {
                       //     $this->flash->error("La couche ayant le igo_couche.id &laquo; $couche_id &raquo; n'existe pas.");
                      //  }
                        
                         $igoCouche = IgoCouche::findFirst('id=' . $couche_id);
                        if (!$igoCouche) {
                            $this->flash->error("La couche ayant le igo_couche.id &laquo; $couche_id &raquo; n'existe pas.");
                        }

                        $igoPermission->attribut_id = $attribut_id;
                        $igoPermission->couche_id =$couche_id;
                        $igoPermission->est_exclu = null;
                        $igoPermission->couche_id = $couche_id;
                        break;

                    case 'couche':

                      //  $igoGroupeCouche = IgoGroupeCouche::findFirst('id=' . $couche_id);
                     ////   if (!$igoGroupeCouche) {
                    //        $this->flash->error("La couche ayant le igo_couche.id &laquo; $couche_id &raquo; n'existe pas.");
                     //   }

                        $igoCouche = IgoCouche::findFirst('id=' . $couche_id);
                        if (!$igoCouche) {
                            $this->flash->error("La couche ayant le igo_couche.id &laquo; $couche_id &raquo; n'existe pas.");
                        }
                        $igoPermission->couche_id = $couche_id;
                        //$igoPermission->couche_id = $igoGroupeCouche->couche_id;
                        break;
                }
            }

            if ($igoPermission) {

                $valeur = $valeur == '1';

                $attribut = substr($name, 1, 1);
                switch ($attribut) {
                    case "L":
                        //$changed = $changed || ($igoPermission->est_lecture) <> $valeur;
                        $igoPermission->est_lecture = $igoPermission->est_lecture || $valeur;
                        break;
                    case "A":
                       // $changed = $changed || ($igoPermission->est_analyse) <> $valeur;
                        $igoPermission->est_analyse = $igoPermission->est_analyse || $valeur;
                        break;
                    case "E":
                       // $changed = $changed || ($igoPermission->est_ecriture) <> $valeur;
                        $igoPermission->est_ecriture = $igoPermission->est_ecriture || $valeur;
                        break;
                    case "P":
                      //  $changed = $changed || ($igoPermission->est_export) <> $valeur;
                        $igoPermission->est_export = $igoPermission->est_export || $valeur;
                        break;
                    case "S":
                       // $changed = $changed || ($igoPermission->est_association) <> $valeur;
                        $igoPermission->est_association = $igoPermission->est_association ||$valeur;
                        break;
                    case "X":
                       // $changed = $changed || ($igoPermission->est_exclu) <> $valeur;
                        $igoPermission->est_exclu = $igoPermission->est_exclu || $valeur;

                        break;
                }
            }

            if ($valeur) {

                if (!$igoPermission->save()) {

                    foreach ($igoPermission->getMessages() as $message) {
                        $this->flash->error($message);
                    }
                }
            }
        }
     
       /*
        //Supprimer les permissions qui n'ont plus lieu d'être
        $igoPermissions = IgoPermission::find('NOT (COALESCE(est_lecture,false) OR COALESCE(est_analyse,false) OR COALESCE(est_ecriture,false) OR COALESCE(est_export,false) OR COALESCE(est_association,false) OR COALESCE(est_exclu,false))');

        foreach ($igoPermissions as $igoPermission) {
            $igoPermission->delete();
        }*/

        $igo_profil = IgoProfil::findFirstByid($profil_id);
        if (!$igo_profil) {
            $this->flash->error("igo_permission non-trouvé");

            return $this->dispatcher->forward(array(
                        "controller" => "igo_permission",
                        "action" => "index"
            ));
        }
        $this->view->igo_profil = $igo_profil;
        ///****À TESTER ****///

        $profils = $this->session->get("profils");

        $liste_profil_id_utilisateur = array();
        if ($profils) {
            foreach ($profils as $profil) {
                array_push($liste_profil_id_utilisateur, $profil["id"]);
            }
        }

        $liste_profil_id_utilisateur = implode(",", $liste_profil_id_utilisateur);
        if (!$liste_profil_id_utilisateur) {
            $liste_profil_id_utilisateur = 0;
        }
                
                $sql=" select 'G'::character varying(1) AS type,
                    gr.groupe_id as id,
                    gr.nom,
                    gr.nom_complet AS mf_layer_meta_group_title,
                    gr.groupe_id AS groupe_id,
                    NULL::integer AS attribut_id,
                    false AS lecture,
                    false AS analyse_spa,
                    false AS ecriture,
                    false AS export,
                    false AS association,
                    false AS exclu,
                    NULL::text AS colonne,
                    NULL::integer AS couche_id,
                    p.id AS permission_id,
                    true AS association_est_association,
                    gr.grp,
                    (length(grp) - length(replace(grp, '_'::text, ''::text))) as len
                  from igo_vue_groupes_recursif gr
                  LEFT JOIN igo_permission p ON p.groupe_id=gr.groupe_id AND p.profil_id={$profil_id} and p.couche_id IS NULL
                  --LEFT JOIN igo_vue_permissions_pour_groupes pg ON pg.profil_id IN ({$liste_profil_id_utilisateur})
                  WHERE NOT (gr.grp IN ( SELECT substr(grp, strpos(concat(grp, '_'), '_'::text) + 1) AS substr
                                       FROM igo_vue_groupes_recursif)) 
                 UNION
                  select 'C'::character varying(1) AS type,
                    c.id,
                    c.mf_layer_meta_title AS nom,
                    gr.nom_complet AS mf_layer_meta_group_title,
                    gc.groupe_id AS groupe_id,
                    igo_attribut.id AS attribut_id,
                    COALESCE(p.est_lecture, false) AS lecture,
                    COALESCE(p.est_analyse, false) AS analyse_spa,
                    COALESCE(p.est_ecriture, false) AS ecriture,
                    COALESCE(p.est_export, false) AS export,
                    COALESCE(p.est_association, false) AS association,
                    COALESCE(p2.est_exclu, false) AND igo_attribut.id = p2.attribut_id  AS exclu,
                    igo_attribut.colonne AS colonne,
                    c.id AS couche_id,
                    p.id AS permission_id,
                    igo_vue_permissions_pour_couches.est_association AS association_est_association,
                    gr.grp,
                        (length(grp) - length(replace(grp, '_'::text, ''::text))) as len
                     from igo_vue_groupes_recursif gr
                     JOIN igo_groupe_couche gc ON gc.groupe_id=gr.groupe_id
                     JOIN igo_couche c  ON gc.couche_id=c.id
                     JOIN igo_geometrie ON c.geometrie_id = igo_geometrie.id
                     LEFT JOIN igo_attribut ON igo_attribut.geometrie_id = igo_geometrie.id
                     LEFT JOIN igo_permission p ON c.id=p.couche_id AND p.profil_id={$profil_id} and p.attribut_id IS NULL
                     LEFT JOIN igo_permission p2 ON c.id=p.couche_id AND p.profil_id={$profil_id} and p2.attribut_id IS NOT NULL and p2.attribut_id=igo_attribut.id
                     LEFT JOIN igo_vue_permissions_pour_couches ON igo_vue_permissions_pour_couches.couche_id = p.id 
                     WHERE NOT (gr.grp IN ( SELECT substr(grp, strpos(concat(grp, '_'), '_'::text) + 1) AS substr
                                       FROM igo_vue_groupes_recursif)) 
                ORDER BY grp, len,  type DESC";
       //echo $sql;
        $igo_permission = new IgoPermission();

        $igo_permission = new Resultset(null, $igo_permission, $igo_permission->getReadConnection()->query($sql));

        $this->view->setVar("arbre", $igo_permission);
    }

}
