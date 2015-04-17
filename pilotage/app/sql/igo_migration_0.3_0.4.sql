
create or replace view igo_vue_contexte_couche_navigateur as
SELECT a.contexte_id,
    a.id AS couche_id,
    a.groupe_id,
    a.est_visible,
    a.est_active,
        CASE a.est_fond_de_carte
            WHEN a.ind_fond_de_carte = 'D'::bpchar THEN a.est_fond_de_carte
            ELSE a.ind_fond_de_carte = 'O'::bpchar
        END AS est_fond_de_carte,
    a.mf_layer_name,
    COALESCE(a.mf_layer_meta_name, a.mf_layer_meta_name2) AS mf_layer_meta_name,
    COALESCE(a.mf_layer_meta_title, a.mf_layer_meta_title2) AS mf_layer_meta_title,
    a.mf_layer_group,
    COALESCE(a.mf_layer_meta_z_order, igo_geometrie.mf_layer_meta_z_order, igo_geometrie_type.mf_layer_meta_z_order) AS mf_layer_meta_z_order,
    a.mf_layer_minscale_denom,
    a.mf_layer_maxscale_denom,
    a.print_option_url,
    a.print_option_layer_name,
    a.fiche_csw_id,
    a.mf_layer_opacity,
    COALESCE(a.layer_a_order, a.layer_a_order2) AS layer_a_order,
    a.nom AS mf_layer_meta_group_title,
    igo_connexion_type.connexion_type,
    igo_catalogue_csw.url AS catalogue_csw_url,
    igo_connexion.connexion,
    a.max_zoom_level,
    a.min_zoom_level,
    a.mf_layer_meta_def
   FROM (        (         SELECT igo_couche_contexte.contexte_id,
                            igo_couche.id,
                            igo_vue_groupes_recursif.groupe_id,
                            igo_couche_contexte.est_visible,
                            igo_couche_contexte.est_active,
                            igo_couche.est_fond_de_carte,
                            igo_couche.mf_layer_name,
                            igo_couche_contexte.mf_layer_meta_name AS mf_layer_meta_name2,
                            igo_couche.mf_layer_meta_name,
                            igo_couche_contexte.mf_layer_meta_title AS mf_layer_meta_title2,
                            igo_couche.mf_layer_meta_title,
                            igo_couche.mf_layer_group,
                            igo_couche.mf_layer_meta_z_order,
                            igo_couche.mf_layer_minscale_denom,
                            igo_couche.mf_layer_maxscale_denom,
                            igo_couche.print_option_url,
                            igo_couche.print_option_layer_name,
                            igo_couche.fiche_csw_id,
                            igo_couche.mf_layer_opacity,
                            igo_couche_contexte.layer_a_order AS layer_a_order2,
                            igo_couche.layer_a_order,
                            igo_vue_groupes_recursif.nom,
                            igo_couche.geometrie_id,
                            igo_couche_contexte.ind_fond_de_carte,
                            igo_vue_groupes_recursif.est_exclu_arbre,
                            igo_couche.max_zoom_level,
                            igo_couche.min_zoom_level,
                            igo_couche.mf_layer_meta_def
                           FROM igo_couche_contexte
                      JOIN igo_couche ON igo_couche_contexte.couche_id = igo_couche.id
                 JOIN igo_groupe_couche ON igo_couche.id = igo_groupe_couche.couche_id
            JOIN igo_vue_groupes_recursif ON igo_vue_groupes_recursif.groupe_id = igo_groupe_couche.groupe_id AND igo_vue_groupes_recursif.parent_groupe_id IS NULL
                UNION            
                 SELECT igo_couche_contexte.contexte_id,
                    igo_couche.id,
                    igo_vue_groupes_recursif.groupe_id,
                    igo_couche_contexte.est_visible,
                    igo_couche_contexte.est_active,
                    igo_couche.est_fond_de_carte,
                    igo_couche.mf_layer_name,
                    igo_couche_contexte.mf_layer_meta_name AS mf_layer_meta_name2,
                    igo_couche.mf_layer_meta_name,
                    igo_couche_contexte.mf_layer_meta_title AS mf_layer_meta_title2,
                    igo_couche.mf_layer_meta_title,
                    igo_couche.mf_layer_group,
                    igo_couche.mf_layer_meta_z_order,
                    igo_couche.mf_layer_minscale_denom,
                    igo_couche.mf_layer_maxscale_denom,
                    igo_couche.print_option_url,
                    igo_couche.print_option_layer_name,
                    igo_couche.fiche_csw_id,
                    igo_couche.mf_layer_opacity,
                    igo_couche_contexte.layer_a_order AS layer_a_order2,
                    igo_couche.layer_a_order,
                    CASE WHEN igo_vue_groupes_recursif.parent_groupe_id is not null THEN igo_couche_contexte.mf_layer_meta_title||'/'||igo_vue_groupes_recursif.nom
                    ELSE igo_vue_groupes_recursif.nom END as nom,
                    igo_couche.geometrie_id,
                    igo_couche_contexte.ind_fond_de_carte,
                    igo_vue_groupes_recursif.est_exclu_arbre,
                    igo_couche.max_zoom_level,
                    igo_couche.min_zoom_level,
                    igo_couche.mf_layer_meta_def
                   FROM igo_couche_contexte
              JOIN igo_vue_groupes_recursif ON igo_couche_contexte.couche_id IS NULL 
		AND ((igo_couche_contexte.groupe_id = igo_vue_groupes_recursif.parent_groupe_id) OR 
			(igo_couche_contexte.groupe_id = igo_vue_groupes_recursif.groupe_id))
         JOIN igo_groupe_couche ON igo_vue_groupes_recursif.groupe_id = igo_groupe_couche.groupe_id
    JOIN igo_couche ON igo_groupe_couche.couche_id = igo_couche.id)) a
   JOIN igo_geometrie ON a.geometrie_id = igo_geometrie.id
   JOIN igo_geometrie_type ON igo_geometrie.geometrie_type_id = igo_geometrie_type.id
   LEFT JOIN igo_connexion ON igo_geometrie.connexion_id = igo_connexion.id
   LEFT JOIN igo_connexion_type ON igo_connexion.connexion_type_id = igo_connexion_type.id
   LEFT JOIN igo_classe_entite ON igo_geometrie.classe_entite_id = igo_classe_entite.id
   LEFT JOIN igo_catalogue_csw ON igo_classe_entite.catalogue_csw_id = igo_catalogue_csw.id 
   WHERE NOT a.est_exclu_arbre;