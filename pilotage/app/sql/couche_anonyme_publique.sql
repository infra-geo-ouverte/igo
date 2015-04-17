update igo_couche set est_publique=true where id in(
select couche_id from igo_vue_permissions_pour_couches where profil_id IN(select id from igo_profil where libelle= 'Anonyme'))