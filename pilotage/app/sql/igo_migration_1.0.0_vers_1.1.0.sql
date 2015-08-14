-- Pour les vues matérialisées
DROP VIEW IF EXISTS igo_vue_contexte_couche_navigateur;
DROP MATERIALIZED VIEW IF EXISTS igo_vue_contexte_groupes_recursif_materialized;
DROP VIEW IF EXISTS igo_vue_contexte_groupes_recursif;
DROP MATERIALIZED VIEW IF EXISTS igo_vue_groupes_recursif_materialized;
DROP VIEW IF EXISTS igo_vue_groupes_recursif;

CREATE VIEW igo_vue_contexte_groupes_recursif AS 
 WITH RECURSIVE s(id, nom, contexte_id, groupe_id, grp) AS (
         SELECT g.id,
            g.nom,
            cc.contexte_id,
            gg_1.parent_groupe_id AS groupe_id,
            g.id::text AS grp,
                CASE
                    WHEN COALESCE(cc.est_visible, false) AND NOT g.est_exclu_arbre THEN COALESCE(cc.mf_layer_meta_group_title, g.nom)::character varying(500)
                    ELSE ''::character varying(500)
                END AS nom_complet,
            g.est_exclu_arbre
           FROM igo_groupe g
             LEFT JOIN igo_groupe_groupe gg_1 ON gg_1.groupe_id = g.id
             LEFT JOIN igo_couche_contexte cc ON cc.arbre_id::text = g.id::text AND cc.couche_id IS NULL
        UNION
         SELECT igo_groupe.id,
            igo_groupe.nom,
            cc.contexte_id,
            s_1.id AS groupe_id,
            (s_1.grp || '_'::text) || igo_groupe.id::character varying(10)::text AS grp,
                CASE
                    WHEN COALESCE(cc.est_visible, false) AND NOT s_1.est_exclu_arbre THEN (((s_1.nom_complet::text || '/'::text) || COALESCE(cc.mf_layer_meta_group_title, igo_groupe.nom)::character varying(500)::text))::character varying(500)
                    ELSE ''::character varying(500)
                END AS nom_complet,
            igo_groupe.est_exclu_arbre
           FROM igo_groupe,
            igo_groupe_groupe gg_1
             JOIN s s_1 ON s_1.id = gg_1.parent_groupe_id
             LEFT JOIN igo_couche_contexte cc ON s_1.contexte_id = cc.contexte_id AND cc.arbre_id::text = concat(s_1.grp, '_', gg_1.groupe_id) AND cc.couche_id IS NULL
          WHERE gg_1.groupe_id = igo_groupe.id
        )
 SELECT s.id AS groupe_id,
    s.nom,
    s.contexte_id,
    s.groupe_id AS parent_groupe_id,
    btrim(s.nom_complet::text, '/'::text) AS nom_complet,
    s.est_exclu_arbre,
    s.grp
   FROM s
  WHERE NOT (concat(s.contexte_id, s.grp) IN ( SELECT concat(s_1.contexte_id, substr(s_1.grp, strpos(concat(s_1.grp, '_'), '_'::text) + 1)) AS substr
           FROM s s_1)) AND s.contexte_id IS NOT NULL AND NULLIF(s.nom_complet::text, ''::text) IS NOT NULL
  ORDER BY s.grp;

CREATE MATERIALIZED VIEW igo_vue_contexte_groupes_recursif_materialized AS 
    SELECT * FROM igo_vue_contexte_groupes_recursif
WITH DATA;

CREATE OR REPLACE VIEW igo_vue_contexte_couche_navigateur AS 
 WITH a AS (
         SELECT cc.contexte_id,
            cc.couche_id,
            cgr.groupe_id,
            cc.est_visible,
            cc.arbre_id,
            cgr.parent_groupe_id,
            cc.est_active,
            igo_couche.est_fond_de_carte,
                CASE
                    WHEN igo_couche.est_fond_de_carte THEN igo_couche.mf_layer_name::text
                    WHEN cgr.parent_groupe_id IS NULL THEN igo_couche.mf_layer_name::text
                    ELSE concat(igo_couche.mf_layer_name, '_', cgr.parent_groupe_id)
                END AS mf_layer_name,
            igo_couche.mf_layer_name AS mf_layer_name_igo,
            COALESCE(cc.mf_layer_meta_name, igo_couche.mf_layer_meta_name) AS mf_layer_meta_name2,
            igo_couche.mf_layer_meta_name,
            cc.mf_layer_meta_title AS mf_layer_meta_title2,
            COALESCE(NULLIF(cc.mf_layer_meta_group_title::text, ''::text), igo_couche.mf_layer_meta_title::text) AS mf_layer_meta_title,
            cgr.nom_complet AS mf_layer_meta_group_title,
            igo_couche.mf_layer_group,
            igo_couche.mf_layer_meta_def,
            igo_couche.mf_layer_meta_z_order,
            igo_couche.mf_layer_minscale_denom,
            igo_couche.mf_layer_maxscale_denom,
            igo_couche.mf_layer_labelminscale_denom,
            igo_couche.mf_layer_labelmaxscale_denom,
            igo_couche.print_option_url,
            igo_couche.print_option_layer_name,
            igo_couche.fiche_csw_id,
            igo_couche.mf_layer_opacity,
            igo_couche.mf_layer_meta_attribution_title,
            cc.layer_a_order,
            cgr.nom_complet AS nom_groupe,
            igo_couche.geometrie_id,
            cc.ind_fond_de_carte,
            cgr.est_exclu_arbre,
            cgr.grp,
            igo_couche.max_zoom_level,
            igo_couche.min_zoom_level
           FROM igo_couche_contexte cc
             JOIN igo_couche ON cc.couche_id = igo_couche.id
             JOIN igo_vue_contexte_groupes_recursif cgr ON cgr.contexte_id = cc.contexte_id AND cgr.grp = cc.arbre_id::text
          ORDER BY length(cc.arbre_id::text) - length(replace(cc.arbre_id::text, '_'::text, ''::text))
        )
 SELECT a.contexte_id,
    a.couche_id,
    a.groupe_id,
    last(a.est_visible) AS est_visible,
    last(a.est_active) AS est_active,
    last(a.est_fond_de_carte) AS est_fond_de_carte,
    last(a.mf_layer_name) AS mf_layer_name,
    a.mf_layer_name_igo,
    last(a.mf_layer_meta_name) AS mf_layer_meta_name,
    last(a.mf_layer_meta_title) AS mf_layer_meta_title,
    last(a.mf_layer_group) AS mf_layer_group,
    last(a.mf_layer_meta_def) AS mf_layer_meta_def,
    last(COALESCE(a.mf_layer_meta_z_order, igo_geometrie.mf_layer_meta_z_order, igo_geometrie_type.mf_layer_meta_z_order)) AS mf_layer_meta_z_order,
    last(a.mf_layer_minscale_denom) AS mf_layer_minscale_denom,
    last(a.mf_layer_maxscale_denom) AS mf_layer_maxscale_denom,
    last(a.mf_layer_labelminscale_denom) AS mf_layer_labelminscale_denom,
    last(a.mf_layer_labelmaxscale_denom) AS mf_layer_labelmaxscale_denom,
    last(a.print_option_url) AS print_option_url,
    last(a.print_option_layer_name) AS print_option_layer_name,
    last(a.fiche_csw_id) AS fiche_csw_id,
    last(a.mf_layer_opacity) AS mf_layer_opacity,
    last(a.mf_layer_meta_attribution_title) AS mf_layer_meta_attribution_title,
    last(a.layer_a_order) AS layer_a_order,
    last(a.mf_layer_meta_group_title) AS mf_layer_meta_group_title,
    last(igo_connexion_type.connexion_type) AS connexion_type,
    last(igo_catalogue_csw.url) AS catalogue_csw_url,
    last(igo_connexion.connexion) AS connexion,
    last(a.max_zoom_level) AS max_zoom_level,
    last(a.min_zoom_level) AS min_zoom_level,
    last(COALESCE(igo_connexion_type.ind_data, true)) AS ind_data
   FROM a
     JOIN igo_geometrie ON a.geometrie_id = igo_geometrie.id
     JOIN igo_geometrie_type ON igo_geometrie.geometrie_type_id = igo_geometrie_type.id
     LEFT JOIN igo_connexion ON igo_geometrie.connexion_id = igo_connexion.id
     LEFT JOIN igo_connexion_type ON igo_connexion.connexion_type_id = igo_connexion_type.id
     LEFT JOIN igo_classe_entite ON igo_geometrie.classe_entite_id = igo_classe_entite.id
     LEFT JOIN igo_catalogue_csw ON igo_classe_entite.catalogue_csw_id = igo_catalogue_csw.id
  WHERE a.est_visible OR a.est_active
  GROUP BY a.couche_id, a.groupe_id, a.contexte_id, a.arbre_id, a.mf_layer_name_igo
  ORDER BY last(a.layer_a_order);

CREATE VIEW igo_vue_groupes_recursif AS 
 WITH RECURSIVE s(id, nom, groupe_id, grp) AS (
         SELECT g.id,
            g.nom,
            gg_1.parent_groupe_id AS groupe_id,
            g.id::text AS grp,
            g.nom::character varying(500) AS nom_complet,
            g.est_exclu_arbre
           FROM igo_groupe g
             LEFT JOIN igo_groupe_groupe gg_1 ON gg_1.groupe_id = g.id
        UNION
         SELECT igo_groupe.id,
            igo_groupe.nom,
            s_1.id AS groupe_id,
            (s_1.grp || '_'::text) || igo_groupe.id::character varying(10)::text AS grp,
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
  WHERE NOT (s.grp IN ( SELECT substr(s_1.grp, strpos(concat(s_1.grp, '_'), '_'::text) + 1) AS substr
           FROM s s_1))
  ORDER BY s.grp;

CREATE MATERIALIZED VIEW igo_vue_groupes_recursif_materialized AS 
    SELECT * FROM igo_vue_groupes_recursif
WITH DATA;

ALTER SEQUENCE igo.igo_groupe_groupe_id_seq OWNED BY igo.igo_groupe_groupe.id;
ALTER SEQUENCE igo.igo_groupe_id_seq OWNED BY igo.igo_groupe.id;
ALTER TABLE ONLY igo.igo_groupe ALTER COLUMN id SET DEFAULT nextval('igo.igo_groupe_id_seq'::regclass);
