<?php

use Phalcon\Mvc\Model\Resultset\Simple as Resultset;
use Phalcon\Mvc\Model\Behavior\Timestampable;
use Phalcon\Mvc\Model\Validator\PresenceOf;

class IgoGroupe extends \Phalcon\Mvc\Model {


    public $id;
    public $nom;
    public $description;
    public $est_exclu_arbre;
    public $date_modif;
    public $profil_proprietaire_id;

    /*
     * https://wiki.postgresql.org/wiki/First/last_(aggregate)
     */

    public static function getNomsComplet($sansexclusion = false) {
        if ($sansexclusion) {

            $sql = "      WITH RECURSIVE s(id, nom, groupe_id, est_exclu_arbre) AS
                            ( SELECT g.id,  CAST(nom as VARCHAR(500)) as nom, gg.groupe_id,est_exclu_arbre
                      FROM igo_groupe g LEFT JOIN igo_groupe_groupe gg ON g.id=gg.groupe_id
                           UNION SELECT g.id, 
                            CAST( s.nom||'/'||g.nom as VARCHAR(500)),
                       gg.groupe_id, g.est_exclu_arbre FROM igo_groupe g,  s
                        INNER JOIN igo_groupe_groupe gg ON s.id=gg.groupe_id
                         WHERE s.id = gg.parent_groupe_id )
                       SELECT id, last(nom) as nom, last(groupe_id) as groupe_id  
                            FROM s group by id ORDER BY nom;";
        } else {
            
            $sql = "      WITH RECURSIVE s(id, nom, groupe_id, est_exclu_arbre) AS
                            ( SELECT g.id,  CAST(nom as VARCHAR(500)) as nom, gg.groupe_id,est_exclu_arbre
                      FROM igo_groupe g LEFT JOIN igo_groupe_groupe gg ON g.id=gg.groupe_id
                           UNION SELECT g.id, "
                    . "         CASE WHEN NOT s.est_exclu_arbre AND NOT g.est_exclu_arbre THEN CAST( s.nom||'/'||g.nom as VARCHAR(500))"
                    . "              WHEN s.est_exclu_arbre AND NOT g.est_exclu_arbre  THEN  CAST(g.nom as VARCHAR(500))  "
                    . "              WHEN NOT s.est_exclu_arbre AND g.est_exclu_arbre  THEN  CAST(s.nom as VARCHAR(500))  "
                    . "              ELSE  CAST('' as VARCHAR(500))  "
                    . "         END,   
                       gg.groupe_id, g.est_exclu_arbre FROM igo_groupe g,  s
                        INNER JOIN igo_groupe_groupe gg ON s.id=gg.groupe_id
                         WHERE s.id = gg.parent_groupe_id )
                       SELECT id, last(nom) as nom, last(groupe_id) as groupe_id  
                            FROM s group by id ORDER BY nom;";
        }
        $igo_groupe = new IgoGroupe();

        $igo_groupe = new Resultset(null, $igo_groupe, $igo_groupe->getReadConnection()->query($sql));

        return $igo_groupe;
    }

    public function getNomComplet($sansexclusion = false) {
        if ($sansexclusion) {

            $sql = "        WITH RECURSIVE s(id, nom, groupe_id, est_exclu_arbre) AS"
                    . "        ( SELECT id,  CAST(nom as VARCHAR(500)) as nom, groupe_id,est_exclu_arbre"
                    . "  FROM igo_groupe"
                    . "       UNION SELECT g.id, "
                    . "        CAST( s.nom||'/'||g.nom as VARCHAR(500)),"
                    . "   g.groupe_id, g.est_exclu_arbre FROM igo_groupe g,  s, igo_groupe_groupe gg "
                    . "     WHERE s.id = gg.parent_groupe_id and gg.groupe_id= g.id) "
                    . "   SELECT id, last(nom) as nom, last(groupe_id) as groupe_id  "
                    . "        FROM s where id=" . $this->id . " group by id ORDER BY nom;";
        } else {
            $sql = "    WITH RECURSIVE s(id, nom, groupe_id, est_exclu_arbre) AS"
                    . "    ( SELECT id,  CAST(nom as VARCHAR(500)) as nom, groupe_id,est_exclu_arbre "
                    . "         FROM igo_groupe"
                    . "      UNION SELECT g.id,"
                    . "         CASE WHEN NOT s.est_exclu_arbre AND NOT g.est_exclu_arbre THEN CAST( s.nom||'/'||g.nom as VARCHAR(500))"
                    . "              WHEN s.est_exclu_arbre AND NOT g.est_exclu_arbre  THEN  CAST(g.nom as VARCHAR(500))  "
                    . "              WHEN NOT s.est_exclu_arbre AND g.est_exclu_arbre  THEN  CAST(s.nom as VARCHAR(500))  "
                    . "              ELSE  CAST('' as VARCHAR(500))  "
                    . "         END,   "
                    . "         g.groupe_id, g.est_exclu_arbre FROM igo_groupe g,  s, igo_groupe_groupe gg "
                    . "              WHERE s.id = gg.parent_groupe_id and gg.groupe_id= g.id) "
                    . "     SELECT id, last(nom) as nom, last(groupe_id) as groupe_id, bool_or(est_exclu_arbre) "
                    . "              FROM s where id=" . $this->id . " group by id ORDER BY nom;";
        }
        $igo_groupe = new IgoGroupe();

        $igo_groupe = new Resultset(null, $igo_groupe, $igo_groupe->getReadConnection()->query($sql));

        return $igo_groupe[0]->nom;
    }

    public function specifie_parent($groupID) {

       // echo " " . $this->id . "->" . $groupID;
        if (is_null($groupID)) {
            return;
        }
        $groupe_groupe = IgoGroupeGroupe::findFirst("groupe_id ={$this->id} and parent_groupe_id={$groupID}");
        if (!$groupe_groupe) {
            $groupe_groupe = new IgoGroupeGroupe();
           
            $groupe_groupe->groupe_id = $this->id;
            $groupe_groupe->parent_groupe_id = $groupID;
            if ($groupe_groupe->save() == false) {
                foreach ($groupe_groupe->getMessages() as $message) {
                    throw new Exception($message);
                }
            }
        }
    }

    /**
     * Initialize method for model.
     */
    public function initialize() {
        $this->setSchema($this->getDI()->getConfig()->database->schema);
        $this->hasMany("id", "IgoCoucheContexte", "groupe_id", array(
            'reusable' => true
        ));
        
        $this->hasManyToMany(
            "id", "IgoGroupeGroupe", "parent_groupe_id",
            "groupe_id", "IgoGroupe", "id", array(
            'reusable' => true,
            'alias' => 'enfants'
        ));
   
        $this->hasManyToMany(
            "id", "IgoGroupeGroupe", "groupe_id",
            "parent_groupe_id", "IgoGroupe", "id", array(
            'reusable' => true,
            'alias' => 'parents'
        ));
        
        $this->hasManyToMany(
            "id", "IgoGroupeCouche", "groupe_id",
            "couche_id", "IgoCouche", "id", array(
            'reusable' => true,
            'alias' => 'couches'
        ));
        

        $this->belongsTo("profil_proprietaire_id", "IgoProfil", "id");

        $this->addBehavior(new Timestampable(array(
            'beforeCreate' => array(
                'field' => 'date_modif',
                'format' => 'Y-m-d H:i:s'
            ),
            'beforeUpdate' => array(
                'field' => 'date_modif',
                'format' => 'Y-m-d H:i:s'
            )
        )));
    }

    public function beforeValidation() {

        $this->validate(new PresenceOf(array(
            'field' => 'nom',
            'message' => 'Veuillez indiquer le nom.'
        )));

        $this->validate(new IgoStringLength(array(
            'label' => 'Nom',
            'field' => 'nom',
            'max' => 100,
            'min' => 0
        )));


        $this->validate(new IgoStringLength(array(
            'label' => 'Description',
            'field' => 'description',
            'max' => 2000,
            'min' => 0
        )));

        $info_u = $this->getDi()->getSession()->get("info_utilisateur");
        $profils = $this->getDi()->getSession()->get("profils");
        if (!$info_u->estAdmin) {
            if (count($profils) == 0) {
                $this->appendMessage(new \Phalcon\Mvc\Model\Message("Vous n'avez pas de profils.", ''));
                return false;
            }

            if (is_null($this->profil_proprietaire_id)) {
                $this->appendMessage(new \Phalcon\Mvc\Model\Message("Veuillez indiquer le profil propriétaire.", ''));
                return false;
            }
        }

        return !$this->validationHasFailed();
    }

    /**
     * This is necessary otherwise phalcon doesn't find the sequence name
     */
    public function getSequenceName() {
        return $this->getDI()->getConfig()->database->schema . '.igo_groupe_id_seq';
    }

    /**
     * Récupère le groupe parent le plus haut dans l'arborescence
     * @param int $id Id du groupe pour lequel on cherche le parent
     */
    public static function getPlusHautParent($id) {
        // TODO  à reviser puisque plusieurs racines
        // 
        //Récupérer le groupe
        $igoGroupe = IgoGroupe::findFirstById($id);
        if (!$igoGroupe) {
            return false;
        }

        //On a trouvé le groupe le plus en haut dans l'arborescence
        if (!$igoGroupe->groupe_id) {
            return $igoGroupe;
        }

        return IgoGroupe::getPlusHautParent($igoGroupe->groupe_id);
    }

    public function delete(){
        foreach ($this->IgoCoucheContexte as $groupe){
            $groupe->delete();
        }
        return parent::delete();
    }
    
    // Retourne tous les groupes associables
    public static function findEstAssociable($params = null) {

        $profils = \Phalcon\DI::getDefault()->getSession()->get("info_utilisateur")->profils;
        $profil_ids = array();

        foreach ($profils as $profil) {
            array_push($profil_ids, $profil["id"]);
        }

        $profil_ids = implode(",", $profil_ids);
        $sql = "SELECT DISTINCT igo_vue_permissions_pour_groupes.groupe_id AS id, " .
                " igo_groupe.nom AS nom " .
                "FROM igo_vue_permissions_pour_groupes " .
                "INNER JOIN igo_groupe ON igo_groupe.id = igo_vue_permissions_pour_groupes.groupe_id " .
                "WHERE igo_vue_permissions_pour_groupes.profil_id IN ($profil_ids) AND igo_vue_permissions_pour_groupes.est_association ";
        $igo_groupe = new IgoGroupe();

        return new \Phalcon\Mvc\Model\Resultset\Simple(null, $igo_groupe, $igo_groupe->getReadConnection()->query($sql, $params));
    }

}
