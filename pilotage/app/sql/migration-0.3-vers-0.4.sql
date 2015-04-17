drop sequence igo_groupe_groupe_id_seq;
CREATE SEQUENCE igo_groupe_groupe_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


DROP TABLE IF EXISTS igo_groupe_groupe cascade;


CREATE TABLE igo_groupe_groupe
(
  id integer NOT NULL DEFAULT nextval('igo_groupe_groupe_id_seq'::regclass),
  groupe_id integer,
  parent_groupe_id integer
);

ALTER SEQUENCE igo_groupe_groupe_id_seq OWNED BY igo_groupe_groupe.id;

CREATE INDEX igo_groupe_groupe_groupe_id_idx ON igo_groupe_groupe USING btree (groupe_id);

delete from igo_groupe_groupe;
INSERT INTO igo_groupe_groupe 
select nextval('igo_groupe_groupe_id_seq'::regclass) as id, groupe_id, parent_groupe_id from igo_vue_groupes_recursif where parent_groupe_id IS NOT NULL

-- Vieille vue inutile
DROP VIEW IF EXISTS igo_vue_profils_pour_groupes;
DROP VIEW igo_vue_permission_profil;

DROP VIEW IF EXISTS igo_vue_contexte_couche_navigateur;
drop VIEW igo_vue_couche;
DROP VIEW IF EXISTS igo_vue_permissions_pour_couches;
DROP VIEW if exists igo_vue_permissions_pour_groupes;
drop VIEW igo_vue_groupes_recursif;


ALTER TABLE igo_couche_contexte ALTER COLUMN layer_a_order TYPE integer USING 0;
ALTER TABLE igo_couche ALTER COLUMN layer_a_order TYPE integer USING 0;



CREATE OR REPLACE VIEW igo_vue_groupes_recursif AS 
 WITH RECURSIVE s(id, nom, groupe_id, grp) AS (
         SELECT g.id,
            g.nom,
            gg_1.parent_groupe_id AS groupe_id,
            g.id::character varying(10)::text AS grp,
            g.nom::character varying(500) AS nom_complet,
            g.est_exclu_arbre
           FROM igo_groupe g
             LEFT JOIN igo_groupe_groupe gg_1 ON gg_1.groupe_id = g.id
        UNION
         SELECT igo_groupe.id,
            igo_groupe.nom,
            s_1.id AS groupe_id,
            (s_1.grp::character varying(10)::text || ' '::text) || igo_groupe.id::character varying(10)::text AS grp,
                CASE igo_groupe.est_exclu_arbre
                    WHEN false THEN (((s_1.nom_complet::text || '/'::text) || igo_groupe.nom::character varying(500)::text))::character varying(500)
                    ELSE s_1.nom_complet
                END AS nom_complet,
            igo_groupe.est_exclu_arbre
           FROM igo_groupe,
            igo_groupe_groupe gg_1
             JOIN s s_1 ON s_1.id = gg_1.parent_groupe_id
          WHERE gg_1.groupe_id = igo_groupe.id
        )
 SELECT s.id AS groupe_id,
    s.nom,
    s.groupe_id AS parent_groupe_id,
    s.nom_complet,
    s.est_exclu_arbre,
    s.grp
   FROM s
  ORDER BY s.grp;



CREATE OR REPLACE VIEW igo_vue_couche AS 
 SELECT c.id,
    c.description,
    c.geometrie_id,
    c.vue_validation,
    c.mf_layer_name,
    c.mf_layer_group,
    c.mf_layer_meta_name,
    c.mf_layer_filtre,
    c.mf_layer_minscale_denom,
    c.mf_layer_maxscale_denom,
    c.mf_layer_labelminscale_denom,
    c.mf_layer_labelmaxscale_denom,
    c.mf_layer_def,
    c.mf_layer_meta_def,
    c.service_tuile,
    e.catalogue_csw_id,
    c.fiche_csw_id,
    c.mf_layer_meta_wfs_max_feature,
    c.est_fond_de_carte,
    c.mf_layer_opacity,
    c.mf_layer_meta_title,
    c.mf_layer_meta_group_title,
    c.mf_layer_labelitem,
    COALESCE(c.mf_layer_meta_z_order, g.mf_layer_meta_z_order, gt.mf_layer_meta_z_order) AS mf_layer_meta_z_order,
    c.print_option_url,
    c.print_option_layer_name,
    c.est_commune,
    c.est_publique,
    c.layer_a_order,
    c.max_zoom_level,
    c.min_zoom_level,
    g.classe_entite_id,
    g.geometrie_type_id,
    g.vue_defaut,
    g.date_chargement,
    g.connexion_id,
    g.echelle_prod,
    g.remarque AS remarque_geometrie,
    g.ind_inclusion,
    g.mf_layer_data,
    g.mf_layer_projection,
    g.acces,
    e.nom AS nom_classe_entite,
    e.description AS description_classe_entite,
    e.source_entite_id,
    e.classification_id,
    e.organisme_responsable_id,
    e.contact_id,
    e.remarque AS remarque_classe_entite,
    x.nom AS nom_connexion,
    x.connexion,
    x.connexion_type_id,
    t.nom AS nom_connexion_type,
    t.connexion_type,
    gt.nom AS nom_geometrie_type,
    gt.layer_type,
    gt.geometrie_type
   FROM igo_couche c,
    igo_classe_entite e,
    igo_geometrie g
   LEFT JOIN igo_connexion x ON g.connexion_id = x.id
   LEFT JOIN igo_connexion_type t ON x.connexion_type_id = t.id
   LEFT JOIN igo_geometrie_type gt ON g.geometrie_type_id = gt.id
  WHERE c.geometrie_id = g.id AND g.classe_entite_id = e.id;




CREATE OR REPLACE VIEW igo_vue_permissions_pour_groupes AS 
 WITH RECURSIVE permission_groupe(groupe_id, profil_id, est_lecture, est_analyse, est_ecriture, est_export, est_association) AS (
         SELECT igo_groupe.id AS groupe_id,
            igo_permission.profil_id,
            igo_permission.est_lecture,
            igo_permission.est_analyse,
            igo_permission.est_ecriture,
            igo_permission.est_export,
            igo_permission.est_association
           FROM igo_groupe
              JOIN igo_permission ON igo_groupe.id = igo_permission.groupe_id
        UNION
         SELECT igo_groupe.id AS groupe_id,
            permission_groupe.profil_id,
            permission_groupe.est_lecture OR igo_permission.est_lecture OR permission_groupe.est_association OR igo_permission.est_association AS est_lecture,
            permission_groupe.est_analyse OR igo_permission.est_analyse OR permission_groupe.est_association OR igo_permission.est_association AS est_analyse,
            permission_groupe.est_ecriture OR igo_permission.est_ecriture OR permission_groupe.est_association OR igo_permission.est_association AS est_ecriture,
            permission_groupe.est_export OR igo_permission.est_export OR permission_groupe.est_association OR igo_permission.est_association AS est_export,
            permission_groupe.est_association OR igo_permission.est_association OR permission_groupe.est_association OR igo_permission.est_association AS est_association
           FROM igo_groupe,
            igo_groupe_groupe gg_1
             JOIN permission_groupe  ON permission_groupe.groupe_id = gg_1.parent_groupe_id
             LEFT JOIN igo_permission ON gg_1.id = igo_permission.groupe_id
          WHERE gg_1.groupe_id = igo_groupe.id

  
        )
 SELECT permission_groupe.groupe_id,
    permission_groupe.profil_id,
    permission_groupe.est_lecture,
    permission_groupe.est_analyse,
    permission_groupe.est_ecriture,
    permission_groupe.est_export,
    permission_groupe.est_association
   FROM permission_groupe;



CREATE OR REPLACE VIEW igo_vue_permissions_pour_couches AS 
 SELECT igo_groupe_couche.couche_id,
    igo_groupe_couche.groupe_id,
    igo_vue_permissions_pour_groupes.profil_id,
    igo_vue_permissions_pour_groupes.est_lecture OR igo_couche.est_publique OR igo_permission.est_lecture OR igo_vue_permissions_pour_groupes.est_association OR igo_permission.est_association AS est_lecture,
    igo_vue_permissions_pour_groupes.est_analyse OR igo_permission.est_analyse OR igo_vue_permissions_pour_groupes.est_association OR igo_permission.est_association AS est_analyse,
    igo_vue_permissions_pour_groupes.est_ecriture OR igo_permission.est_ecriture OR igo_vue_permissions_pour_groupes.est_association OR igo_permission.est_association AS est_ecriture,
    igo_vue_permissions_pour_groupes.est_export OR igo_permission.est_export OR igo_vue_permissions_pour_groupes.est_association OR igo_permission.est_association AS est_export,
    igo_vue_permissions_pour_groupes.est_association OR igo_permission.est_association OR igo_vue_permissions_pour_groupes.est_association OR igo_permission.est_association AS est_association
   FROM igo_groupe_couche
     JOIN igo_couche ON igo_groupe_couche.couche_id = igo_couche.id
     LEFT JOIN igo_vue_permissions_pour_groupes ON igo_groupe_couche.groupe_id = igo_vue_permissions_pour_groupes.groupe_id
     LEFT JOIN igo_permission ON igo_groupe_couche.id = igo_permission.groupe_couche_id;

--

CREATE OR REPLACE VIEW igo_vue_contexte_couche_navigateur AS 
 WITH a AS (
         SELECT cc.contexte_id,
            cc.couche_id,
            igo_vue_groupes_recursif.groupe_id,
            cc.est_visible,
            cc.arbre_id,
            igo_vue_groupes_recursif.parent_groupe_id,
            cc.est_active,
            igo_couche.est_fond_de_carte,
                CASE
                    WHEN igo_couche.est_fond_de_carte THEN igo_couche.mf_layer_name::text
                    ELSE concat(igo_couche.mf_layer_name, '_', igo_vue_groupes_recursif.groupe_id)
                END AS mf_layer_name,
            COALESCE(cc.mf_layer_meta_name, igo_couche.mf_layer_meta_name) AS mf_layer_meta_name2,
            igo_couche.mf_layer_meta_name,
            cc.mf_layer_meta_title AS mf_layer_meta_title2,
            COALESCE(NULLIF(cc.mf_layer_meta_group_title::text, ''::text), igo_couche.mf_layer_meta_title::text) AS mf_layer_meta_title,
            cg2.mf_layer_meta_group_title,
            igo_couche.mf_layer_group,
            igo_couche.mf_layer_meta_def,
            igo_couche.mf_layer_meta_z_order,
            igo_couche.mf_layer_minscale_denom,
            igo_couche.mf_layer_maxscale_denom,
            igo_couche.print_option_url,
            igo_couche.print_option_layer_name,
            igo_couche.fiche_csw_id,
            igo_couche.mf_layer_opacity,
            igo_couche.mf_layer_meta_attribution_title,
            cc.layer_a_order,
                CASE
                    WHEN cg2.est_visible THEN
                    CASE
                        WHEN NULLIF(cg2.mf_layer_meta_group_title::text, ''::text) IS NOT NULL THEN concat(cg2.mf_layer_meta_group_title::text, substr(igo_vue_groupes_recursif.nom_complet::text, strpos(concat(igo_vue_groupes_recursif.nom_complet::text, '/'), '/'::text)))::character varying::text
                        ELSE igo_vue_groupes_recursif.nom_complet::text
                    END
                    ELSE regexp_replace(igo_vue_groupes_recursif.nom_complet::text, '^.*/'::text, ''::text)
                END AS nom_groupe,
            igo_couche.geometrie_id,
            cc.ind_fond_de_carte,
            igo_vue_groupes_recursif.est_exclu_arbre,
            igo_vue_groupes_recursif.grp,
            igo_couche.max_zoom_level,
            igo_couche.min_zoom_level
           FROM igo_couche_contexte cc
             JOIN igo_groupe_couche ON igo_groupe_couche.couche_id = cc.couche_id
             JOIN igo_couche_contexte ccg ON ccg.couche_id IS NULL AND ccg.groupe_id = igo_groupe_couche.groupe_id AND ccg.contexte_id = cc.contexte_id
             JOIN igo_couche ON cc.couche_id = igo_couche.id
             JOIN igo_vue_groupes_recursif ON igo_vue_groupes_recursif.groupe_id = ccg.groupe_id
             JOIN igo_couche_contexte cg2 ON substr(concat(igo_vue_groupes_recursif.grp, ' '), 0, strpos(concat(igo_vue_groupes_recursif.grp, ' '), ' '::text))::integer = cg2.groupe_id AND cg2.contexte_id = cc.contexte_id AND cg2.couche_id IS NULL AND ccg.arbre_id::text = cc.arbre_id::text AND concat('_', cc.arbre_id, '_') ~~ concat('%_', igo_vue_groupes_recursif.parent_groupe_id, '_%')
        ), c AS (
         SELECT a_1.contexte_id,
            a_1.couche_id,
            a_1.groupe_id,
            a_1.est_visible,
            a_1.arbre_id,
            a_1.parent_groupe_id,
            a_1.est_active,
            a_1.est_fond_de_carte,
            a_1.mf_layer_name,
            a_1.mf_layer_meta_name2,
            a_1.mf_layer_meta_name,
            a_1.mf_layer_meta_title2,
            a_1.mf_layer_meta_title,
            a_1.mf_layer_meta_group_title,
            a_1.mf_layer_group,
            a_1.mf_layer_meta_def,
            a_1.mf_layer_meta_z_order,
            a_1.mf_layer_minscale_denom,
            a_1.mf_layer_maxscale_denom,
            a_1.print_option_url,
            a_1.print_option_layer_name,
            a_1.fiche_csw_id,
            a_1.mf_layer_opacity,
            a_1.mf_layer_meta_attribution_title,
            a_1.layer_a_order,
            a_1.nom_groupe,
            a_1.geometrie_id,
            a_1.ind_fond_de_carte,
            a_1.est_exclu_arbre,
            a_1.grp,
            a_1.max_zoom_level,
            a_1.min_zoom_level,
            length(replace(a_1.nom_groupe, '/'::text, '//'::text)) - length(a_1.nom_groupe) AS ordre
           FROM a a_1
          ORDER BY a_1.couche_id, length(replace(a_1.nom_groupe, '/'::text, '//'::text)) - length(a_1.nom_groupe), a_1.arbre_id
        ), b AS (
         SELECT last(a_1.contexte_id) AS contexte_id,
            last(a_1.couche_id) AS couche_id,
            last(a_1.groupe_id) AS groupe_id,
            last(a_1.geometrie_id) AS geometrie_id,
            last(a_1.est_visible) AS est_visible,
            last(a_1.est_active) AS est_active,
            last(
                CASE a_1.est_fond_de_carte
                    WHEN a_1.ind_fond_de_carte = 'D'::bpchar THEN a_1.est_fond_de_carte
                    ELSE a_1.ind_fond_de_carte = 'O'::bpchar
                END) AS est_fond_de_carte,
            a_1.mf_layer_name,
            last(COALESCE(NULLIF(a_1.mf_layer_meta_name::text, ''::text), a_1.mf_layer_meta_name2::text)) AS mf_layer_meta_name,
            last(COALESCE(NULLIF(a_1.mf_layer_meta_title, ''::text), a_1.mf_layer_meta_title2::text)) AS mf_layer_meta_title,
            last(a_1.mf_layer_group) AS mf_layer_group,
            last(a_1.mf_layer_meta_def) AS mf_layer_meta_def,
            last(a_1.mf_layer_meta_z_order) AS mf_layer_meta_z_order,
            last(a_1.mf_layer_minscale_denom) AS mf_layer_minscale_denom,
            last(a_1.mf_layer_maxscale_denom) AS mf_layer_maxscale_denom,
            last(a_1.print_option_url) AS print_option_url,
            last(a_1.print_option_layer_name) AS print_option_layer_name,
            last(a_1.fiche_csw_id) AS fiche_csw_id,
            last(a_1.mf_layer_opacity) AS mf_layer_opacity,
            last(a_1.mf_layer_meta_attribution_title) AS mf_layer_meta_attribution_title,
            last(a_1.layer_a_order) AS layer_a_order,
            last(a_1.nom_groupe::character varying) AS mf_layer_meta_group_title,
            last(a_1.max_zoom_level) AS max_zoom_level,
            last(a_1.min_zoom_level) AS min_zoom_level
           FROM c a_1
          GROUP BY a_1.contexte_id, a_1.mf_layer_name, a_1.arbre_id
        )
 SELECT DISTINCT a.contexte_id,
    a.couche_id,
    a.groupe_id,
    a.est_visible,
    a.est_active,
    a.est_fond_de_carte,
    a.mf_layer_name,
    a.mf_layer_meta_name,
    a.mf_layer_meta_title,
    a.mf_layer_group,
    a.mf_layer_meta_def,
    COALESCE(a.mf_layer_meta_z_order, igo_geometrie.mf_layer_meta_z_order, igo_geometrie_type.mf_layer_meta_z_order) AS mf_layer_meta_z_order,
    a.mf_layer_minscale_denom,
    a.mf_layer_maxscale_denom,
    a.print_option_url,
    a.print_option_layer_name,
    a.fiche_csw_id,
    a.mf_layer_opacity,
    a.mf_layer_meta_attribution_title,
    a.layer_a_order,
    a.mf_layer_meta_group_title,
    igo_connexion_type.connexion_type,
    igo_catalogue_csw.url AS catalogue_csw_url,
    igo_connexion.connexion,
    a.max_zoom_level,
    a.min_zoom_level,
    igo_connexion_type.ind_data
   FROM b a
     JOIN igo_geometrie ON a.geometrie_id = igo_geometrie.id
     JOIN igo_geometrie_type ON igo_geometrie.geometrie_type_id = igo_geometrie_type.id
     LEFT JOIN igo_connexion ON igo_geometrie.connexion_id = igo_connexion.id
     LEFT JOIN igo_connexion_type ON igo_connexion.connexion_type_id = igo_connexion_type.id
     LEFT JOIN igo_classe_entite ON igo_geometrie.classe_entite_id = igo_classe_entite.id
     LEFT JOIN igo_catalogue_csw ON igo_classe_entite.catalogue_csw_id = igo_catalogue_csw.id
  WHERE a.est_visible OR a.est_active
  ORDER BY a.layer_a_order;


ALTER TABLE igo_utilisateur ADD CONSTRAINT igo_utilisateur_nom_unique UNIQUE  (nom);
ALTER TABLE igo_utilisateur ADD CONSTRAINT igo_profil_nom_unique UNIQUE (nom);

ALTER TABLE igo_couche ADD COLUMN mf_layer_meta_attribution_title CHARACTER VARYING(5000);
ALTER TABLE igo_couche_contexte DROP COLUMN groupe_couohe_id;
ALTER TABLE igo_permission DROP COLUMN groupe_couohe_id;
ALTER TABLE igo_couche_contexte ADD COLUMN arbre_id CHARACTER VARYING(50);

update igo_couche_contexte cc set groupe_id=gc.groupe_id FROM igo_groupe_couche gc WHERE gc.couche_id=cc.couche_id;

--delete from igo_couche_contexte where couche_id is null;

-- Ajouter les groupes manquants
INSERT INTO igo_couche_contexte (contexte_id,
  couche_id,
  groupe_id,
  est_visible,
  est_active,
  ind_fond_de_carte,
  mf_layer_meta_name,
  mf_layer_meta_title,
  mf_layer_meta_group_title,
  mf_layer_class_def,
  date_modif,
  est_exclu,
  attribut_id,
  mf_layer_meta_z_order,
  mf_layer_filtre,
  layer_a_order,
  arbre_id)
select 
  contexte_id ,
  null as couche_id,
  igo_couche_contexte.groupe_id ,
  bool_or(est_visible) as  est_visible,
  bool_or(est_active) as est_active,
  last(ind_fond_de_carte) as ind_fond_de_carte ,
  last(igo_groupe.nom) as mf_layer_meta_name,
  null as mf_layer_meta_title ,
  null as mf_layer_meta_group_title,
  null as mf_layer_class_def,
  last(igo_couche_contexte.date_modif) as date_modif ,
  null as est_exclu,
  null as attribut_id ,
  null as mf_layer_meta_z_order ,
  null as mf_layer_filtre,
  max(layer_a_order) as layer_a_order ,
  last(replace(igo_vue_groupes_recursif.grp,' ','_')) as arbre_id   from igo_couche_contexte 
  JOIN igo_groupe ON igo_couche_contexte.groupe_id=igo_groupe.id 
  JOIN igo_vue_groupes_recursif ON igo_couche_contexte.groupe_id=igo_vue_groupes_recursif.groupe_id 
  group by contexte_id,igo_couche_contexte.groupe_id

-- Ajouter arbre_id
update igo_couche_contexte cc set arbre_id=replace(g.grp,' ','_') FROM igo_vue_groupes_recursif g WHERE g.groupe_id=cc.groupe_id;