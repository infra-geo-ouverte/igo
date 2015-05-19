DROP VIEW IF EXISTS igo_vue_contexte_couche_navigateur;
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