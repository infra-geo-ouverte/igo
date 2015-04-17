<?php

use Phalcon\Mvc\Model\Resultset\Simple as Resultset;
use Phalcon\Mvc\View;

class IgoCoucheContexteController extends ControllerBase {

    public function editwAction($id, $r_controller = null, $r_action = null, $r_id = null) {
        $this->view->setRenderLevel(View::LEVEL_ACTION_VIEW);
        $this->editAction($id, "igo_couche_contexte", "editw", $id);
        //$this->view->setRenderLevel(View::LEVEL_MAIN_LAYOUT);
    }

    public function editAction($id, $r_controller = null, $r_action = null, $r_id = null) {

        $coucheContexte = IgoCoucheContexte::findFirst($id);
        $estGroupeDeCouche = $coucheContexte && $coucheContexte->couche_id;
        $this->view->setVar("estGroupeDeCouche", $estGroupeDeCouche);

        $phql = "SELECT a.id, CONCAT(c.nom,\":\",a.colonne) as nom FROM  IgoGeometrie as g, IgoAttribut as a, IgoClasseEntite as c where  a.geometrie_id=g.id and g.classe_entite_id=c.id order by c.nom, a.colonne";
        $attribut_desc = $this->modelsManager->executeQuery($phql);
        $this->view->setVar("attribut_desc", $attribut_desc);
        parent::editAction($id, $r_controller, $r_action, $r_id);
    }

    public function arbreCouchesAction($contexte_id) {


        $this->view->setVar("id", $contexte_id);
        // $this->view->setVar("page", $page);
        $this->view->setVar("contexte_id", $contexte_id);
    }

    public function arbreCouchesEditAction($param = null) {
        //var_dump($this->udate());
        $deleted=false;
        $params = array();
        parse_str($param, $params);
        $contexte_id = isset($params['contexte_id']) ? $params['contexte_id'] : $this->request->get('contexte_id');

        if (!$contexte_id) {
            $this->flash->error("igo_contexte non-trouvé");

            return $this->dispatcher->forward(array(
                        "controller" => "igo_contexte",
                        "action" => "index"
            ));
        }

        //On récupére les données du formulaire Associer des groupes et des couches
        if (isset($_POST['valeursArbo'])) {
            $valeurs = json_decode($_POST['valeursArbo']);

            //On récupéres les données de la rétro d'un mapfile
        } else {
            $valeurs = $_POST;
        }

       
       

        //Sauvegarde des items du formulaire
        $igoCoucheContexte = false;

        foreach ($valeurs as $name => $valeur) {
            if (!$deleted){
                 $phql = "DELETE FROM IgoCoucheContexte WHERE contexte_id={$contexte_id}";
                 $this->modelsManager->executeQuery($phql);
                 $deleted=true;
                 //var_dump($deleted);
            }
            $arbre_id = null;
            $couche_id = null;
            $changed = false;
            $type = null;
            $titre = null;
            $ordre = 0;
            if ('T' == substr($name, 1, 1)) {
                $titre = $valeur;
            }
            if ('O' == substr($name, 1, 1)) {
                $ordre = $valeur;
            }

            //Déterminer à quoi on a affaire
            if ('G' == substr($name, 0, 1)) {
                $type = 'groupe';
                $a = explode("_", substr($name, 2));
                array_shift($a);
                $arbre_id=implode('_',$a);
                $groupe_id = array_pop($a);
            } elseif ('CX' == substr($name, 0, 2)) {
                $type = 'colonne';
                $a = explode("_", substr($name, 2));
                $attribut_id = array_pop($a);
                array_shift($a);
                $arbre_id=implode('_',$a);
                $couche_id = substr($name, 2, strpos($name, "_") - 2);
            } elseif ('C' == substr($name, 0, 1)) {
                $type = 'couche';
                $a = explode("_", substr($name, 2));
                array_shift($a);
                $arbre_id=implode('_',$a);
                $couche_id = explode("_", substr($name, 2))[0];
            }
           if (isset($valeur)&& $valeur!=0){
                  // printf("name: %s, arbre_id: %s, groupe_id: %s, couche_id: %s, type: %s, valeur: %s<br>", $name, $arbre_id, $groupe_id, $couche_id, $type, $valeur);
           }
            //Tenter de récupérer le igo_couche_contexte associé
            switch ($type) {
                case 'groupe':
                   // echo "1";
                    if (!$igoCoucheContexte || $igoCoucheContexte->arbre_id <> $arbre_id || $igoCoucheContexte->couche_id <> null || $igoCoucheContexte->attribut_id <> null) {
                       // echo "-1R";
                        $igoCoucheContexte=null;
                        //$igoCoucheContexte = IgoCoucheContexte::findFirst("contexte_id={$contexte_id} AND groupe_id={$groupe_id} AND couche_id IS NULL AND attribut_id is null");
                        //  var_dump($igoCoucheContexte);
                    }
                    break;

                case 'colonne':
                  //   echo "3";
                    if (!$igoCoucheContexte || $igoCoucheContexte->arbre_id <> $arbre_id || $igoCoucheContexte->couche_id <> $couche_id || $igoCoucheContexte->attribut_id <> $attribut_id) {
                     //   echo "-3R";
                           $igoCoucheContexte=null;
                        //$igoCoucheContexte = IgoCoucheContexte::findFirst("contexte_id={$contexte_id} AND groupe_id={$groupe_id} AND attribut_id={$attribut_id} AND couche_id={$couche_id}");
                    }
                    break;

                case 'couche':
                   // echo "2";
                    if (!$igoCoucheContexte || $igoCoucheContexte->arbre_id <> $arbre_id || $igoCoucheContexte->couche_id <> $couche_id || $igoCoucheContexte->attribut_id <> null) {
                      //  echo "-2R";
                           $igoCoucheContexte=null;
                        //$igoCoucheContexte = IgoCoucheContexte::findFirst("contexte_id={$contexte_id} AND groupe_id={$groupe_id} AND couche_id={$couche_id} AND attribut_id is null");
                        //var_dump("contexte_id={$contexte_id} AND groupe_id={$groupe_id} AND couche_id={$couche_id} AND attribut_id is null");
                    }
                    break;
            }

            //On n'a pas trouvé le igo_couche_contexte associé
            if (!$igoCoucheContexte && $valeur) {
                //echo "***Création***";
                $changed = true;
                $igoCoucheContexte = new IgoCoucheContexte();
                $igoCoucheContexte->contexte_id = $contexte_id;

                //Initialiser les champs du contexte
                switch ($type) {
                    case 'groupe':

                        $igoGroupe = IgoGroupe::findFirst("id=" . $groupe_id);
                        if (!$igoGroupe) {

                            $this->flash->error("Le groupe &laquo; $groupe_id &raquo; n'existe pas.");
                        }
                        $igoCoucheContexte->groupe_id = $groupe_id;
                         $igoCoucheContexte->arbre_id = $arbre_id;
                        $igoCoucheContexte->ind_fond_de_carte = 'D';
                        $igoCoucheContexte->mf_layer_meta_name = $igoGroupe->nom;
                        $igoCoucheContexte->mf_layer_meta_title = $igoGroupe->nom;
                        if (!is_null($titre) && "" != $titre) {
                            $igoCoucheContexte->mf_layer_meta_group_title = $titre;
                        }
                        if (!is_null($ordre)) {
                            $igoCoucheContexte->layer_a_order = $ordre;
                        }

                        $igoCoucheContexte->mf_layer_meta_z_order = $igoGroupe->mf_layer_meta_z_order;
                        break;

                    case 'colonne':

                        $igoCoucheContexte->couche_id = $couche_id;
                        $igoCoucheContexte->groupe_id = $groupe_id;
                        $igoCoucheContexte->arbre_id = $arbre_id;
                        $igoCoucheContexte->attribut_id = $attribut_id;
                        $igoCoucheContexte->ind_fond_de_carte = 'D';
                        //$igoCoucheContexte->couche_id = $couche_id;

                        break;

                    case 'couche':
                        $igoCouche = IgoCouche::findFirst('id=' . $couche_id);
                        if (!$igoCouche) {
                            $this->flash->error("La couche ayant le igo_couche.id &laquo; $couche_id &raquo; n'existe pas.");
                        }
                        $igoCoucheContexte->groupe_id = $groupe_id;
                        $igoCoucheContexte->couche_id = $couche_id;
                        $igoCoucheContexte->arbre_id = $arbre_id;
                        $igoCoucheContexte->ind_fond_de_carte = 'D';
                        $igoCoucheContexte->mf_layer_meta_name = $igoCouche->mf_layer_meta_name;
                        $igoCoucheContexte->mf_layer_meta_title = $igoCouche->mf_layer_meta_title;
                        $igoCoucheContexte->mf_layer_meta_z_order = $igoCouche->mf_layer_meta_z_order;
                        if (!is_null($titre)) {
                            $igoCoucheContexte->mf_layer_meta_group_title = $titre;
                            $igoCoucheContexte->mf_layer_meta_title = $titre;
                        }
                        if (!is_null($ordre)) {
                            $igoCoucheContexte->layer_a_order = $ordre;
                        }

                        break;
                }
            }

            if ($igoCoucheContexte) {
                //Modifier la valeur de l'attribut
                $valeur = $valeur == '1';

                $attribut = substr($name, 1, 1);
                switch ($attribut) {
                    case "V":
                        $changed = $changed || ($igoCoucheContexte->est_visible) <> $valeur;
                        $igoCoucheContexte->est_visible = $valeur;

                        break;
                    case "A":
                        $changed = $changed || ($igoCoucheContexte->est_active) <> $valeur;
                        $igoCoucheContexte->est_active = $valeur;
                        break;
                    case "X":
                        $changed = $changed || ($igoCoucheContexte->est_exclu) <> $valeur;
                        $igoCoucheContexte->est_exclu = $valeur;
                        break;
                    case "T":
                        if (!is_null($titre) && "" != $titre) {
                            $changed = $changed || $igoCoucheContexte->mf_layer_meta_group_title <> $titre;
                            $igoCoucheContexte->mf_layer_meta_group_title = $titre;
                        }
                        break;
                    case "O":
                        if (!is_null($ordre)) {
                            $changed = $changed || $igoCoucheContexte->layer_a_order <> $ordre;
                            $igoCoucheContexte->layer_a_order = $ordre;
                        }
                        break;
                }
            }

            if ($changed) {

                if (!$igoCoucheContexte->save()) {

                    foreach ($igoCoucheContexte->getMessages() as $message) {
                        $this->flash->error($message);
                    }
                }
            }
        }

        $contexteController = new IgoContexteController();
        $contexteController->saveMapFile($contexte_id);

        $igo_contexte = IgoContexte::findFirstByid($contexte_id);
        if (!$igo_contexte) {
            $this->flash->error("igo_contexte non-trouvé");

            return $this->dispatcher->forward(array(
                        "controller" => "igo_contexte",
                        "action" => "index"
            ));
        }

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
    cc.mf_layer_meta_group_title AS mf_layer_meta_group_title,
    gr.groupe_id AS groupe_id,
    NULL::integer AS attribut_id,
    COALESCE(cc.est_visible, false) AS visible,
    COALESCE(cc.est_active, false) AS active,
    COALESCE(cc.est_exclu, false) AS exclu,
    NULL::text AS colonne,
    NULL::boolean AS est_commune,
    NULL::integer AS couche_id,
    cc.id AS couche_contexte_id,
    cc.layer_a_order AS layer_a_order,
    true AS association_est_association,
    COALESCE(cc.arbre_id, gr.grp) as grp,
    (length(grp) - length(replace(grp, '_'::text, ''::text))) as len
  from igo_vue_groupes_recursif gr
  LEFT JOIN igo_couche_contexte cc ON cc.arbre_id=grp AND cc.contexte_id={$contexte_id} and cc.couche_id IS NULL
  --LEFT JOIN igo_vue_permissions_pour_groupes pg ON pg.profil_id IN ({$liste_profil_id_utilisateur})
 UNION
  select 'C'::character varying(1) AS type,
    c.id,
    c.mf_layer_meta_title AS nom,
    cc.mf_layer_meta_group_title AS mf_layer_meta_group_title,
    gc.groupe_id AS groupe_id,
    igo_attribut.id AS attribut_id,
     COALESCE(cc.est_visible,false) AND cc.arbre_id = gr.grp AS visible,
     COALESCE(cc.est_active,false) AND cc.arbre_id = gr.grp AS active,
     COALESCE(cc2.est_exclu,false) AND igo_attribut.id = cc2.attribut_id  AS exclu,
    igo_attribut.colonne AS colonne,
    c.est_commune AS est_commune,
    c.id AS couche_id,
    cc.id AS couche_contexte_id,
    COALESCE(NULLIF(cc.layer_a_order, 0), c.layer_a_order) AS layer_a_order,
    igo_vue_permissions_pour_couches.est_association AS association_est_association,
    COALESCE(cc.arbre_id, gr.grp) as grp,
        (length(grp) - length(replace(grp, '_'::text, ''::text))) as len
     from igo_vue_groupes_recursif gr
     JOIN igo_groupe_couche gc ON gc.groupe_id=gr.groupe_id
     JOIN igo_couche c  ON gc.couche_id=c.id
     JOIN igo_geometrie ON c.geometrie_id = igo_geometrie.id
     LEFT JOIN igo_attribut ON igo_attribut.geometrie_id = igo_geometrie.id
     LEFT JOIN igo_couche_contexte cc ON c.id=cc.couche_id AND cc.contexte_id={$contexte_id} and  cc.arbre_id=grp and cc.attribut_id IS NULL
     LEFT JOIN igo_couche_contexte cc2 ON c.id=cc.couche_id AND cc.contexte_id={$contexte_id} and  cc.arbre_id=grp and cc2.attribut_id IS NOT NULL and cc2.attribut_id=igo_attribut.id
     LEFT JOIN igo_vue_permissions_pour_couches ON igo_vue_permissions_pour_couches.couche_id = cc.id 
ORDER BY grp, len,  type DESC, layer_a_order";
       //echo $sql;
        $igo_groupe = new IgoGroupe();

        $igo_groupe = new Resultset(null, $igo_groupe, $igo_groupe->getReadConnection()->query($sql));
        //$igo_groupe=$this->modelsManager->executeQuery($sql);

        $this->view->setVar("arbre", $igo_groupe);
       //  var_dump($this->udate());
    }
}
