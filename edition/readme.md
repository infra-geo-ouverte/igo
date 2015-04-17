# Edition en ligne

Les services d'édition IGO sont réalisés à travers une implémentation PHP basé sur Phalcon. Les services d'éditions respectent un interface PHP, l'implémentation de cet interface permet de rapidement créer de nouveau services d'édition et de les rendre disponible à l'utilisateur. L'implémentation en PHP des services permet l'implantation de règles d'affaires propres à chacun des services d'une manière standardisée.

## Implémentation PHP

Les services d'édition doivent implémenter l'interface IFeatureService, cependant il est plus simple de créer un nouveau service d'édition en héritant de la classe SimpleFeatureService.

L'exemple le plus simple de service d'édition est disponible [ici] (app/services/exemple/PointFeatureService.php).

Afin d'implémenter différentes règles d'affaires selon la géométrie sélectionnée par l'utilisateur, il suffit d'implanter ces règles dans la fonction getFields. Il est aussi possible d'implanter des règles plus complexes en redéfinissant les fonctions createFeature, deleteFeature, updateFeature.

Le fichier de configuration PHP de IGO doit contenir une liste de services, cette liste de service spécifie les classes à charger par le service d'édition:
* exemple: 

```php
        'services' => array(
        'PointFeatureService'
    )
```

Le fichier [loader.php] (app/config/loader.php) du service d'édition doit être modifier afin de charger les classes des services d'édition. Par défaut, toutes les classes définits dans le dossier /app/services seront chargées.

Le fichier [services.php] (app/config/services.php) du service d'édition doit être modifier afin de spécifier les paramètres de connexion à la base de données pour les tables d'édition. Par défaut, le fichier services.php utilisera les paramètres définits dans la section data du fichier de configuration de IGO:

* exemple: *

```php
    'data' => array(
        'adapter'     => '<type de base de donnée>', // Oracle,Postgresql
        'host'        => '<hôte de la base de données>',
        'username'    => '<nom utilisateur de la base de données>',
        'password'    => '<mot de passe de la base de données>',
        'dbname'      => '<nom de la base de données>',
        'schema'      => '<nom du schéma de la base de données>',
        'modelsMetadata' => '<type de cache de métadonnées>' // valeurs possibles de configuration : Apc, Xcache, Off
    ),
```
## Configuration XML
Le paneau d'édition simple peut-être ajouté à l'interface utilisateur en ajoutant cette ligne dans le fichier de configuration xml:

* exemple:
 

```xml
<element-accordeon classe="EditionSimple" urlModule="edition/public/js/app/menu/editionSimple"/>
```