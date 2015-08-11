# Change log de la version 1.1.0
## Modification au fichier de configuration
* Le chemin par défaut pour la rétro-ingénierie d'un mapfile (pilotage) doit maintenant être spécifié dans le fichier de config. [Voir explication](https://github.com/infra-geo-ouverte/igo/pull/15#issuecomment-118038285)

## Migration de la BD
* Utiliser le fichier igo/pilotage/app/sql/igo/igo_migration_1.0.0_vers_1.1.0.sql
* Il est nécessaire de redémarer le serveur Apache pour s'assurer que la cache des métadonnées se vide.
