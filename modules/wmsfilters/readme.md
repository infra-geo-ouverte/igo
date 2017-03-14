### Module IGO: WmsFilters
Module IGO: WmsFilters

Ajouter l'option de menu contextuel pour filtrer les couches WMS où filtre="true" a été identifié.
Toutes les couches indiquées dans le fichier de contexte par l'attribut filter seront disponible pour filtrer.

Un menu contextuel sur la couche nous permet d'ouvrir une fenêtre pour définir les filtres des couches.
Une option sur l'aborescence est disponible pour identifier la couche comme "filtrable". L'icône de filtre passe au rouge lorsqu'un filtre est appliqué.

Prérequis déjà utilisé par les modules d'IGO tel que celui de l'impression

#### Installation

Placer ce module nommé wmsfilters dossier module tel
qu'indiqué dans le fichier config.php  ex: \$baseModulesDir = \$baseDir . 'modules/'

Ajuster votre fichier config.php:

     'modules' => array(
       'wmsfilters' => array(
         'filterView'  => $baseModulesDir . 'wmsfilters/views/' ,
         'filterServices'   =>  'wmsfilters/public/services/',
         'filterApi'   =>  'api/wmsfilters/filter/' 
         ) 
      )
		

Ajouter l'outil  <outil classe="OutilFiltrer" /> dans votre XML de contexte

Ajouter le tag  filter="true"  sur les couches à filtrer ou sur votre appel getCapabilities

Ajouter le tag  identifierFiltre="true" sur la classe Arborescence si vous désirez identifier les couches qui permettre le filtre (s'active seulement lorsque la couche est cochée)

Définition XML du WMS Filter (module WmsFilters)
-----------------------------------

Permet la définition d'une couche provenant d’un service de carte (WMS).

*Attributs ou valeurs spécifiques à **couche** WMS*

| Nom              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Obligatoire                                                        | Valeurs possibles                                                                  | Valeur défaut              |          |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------|----------------------------|----------|
| url              | URL du service de carte                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Oui                                                                | URL                                                                                |                            |          |
| nom              | Nom de la couche                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Oui                                                                | Chaîne alphanumérique                                                              |                            |          |
| titre            | Titre de la couche                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Non                                                                | Chaîne alphanumérique                                                              | *Valeur de l’attribut nom* |          |
| filter      | Paramètres supplémentaires à spécifier lors de l’appel au service de carte                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Oui                                                                | *true,false*                                                               |                            |          |                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Non                                                                | Chaîne alphanumérique                                                                |                            |          |


*Exemples*

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ xml
     <couche titre="Repère kilométrique" protocole="WMS" 
     url="https://ws.mapserver.unit.mtq.min.intra/mapserver/mapserv.fcgi?map=/var/local/systemes/mapserver/mapfiles/externes/test_ma/tbosWFS.map"  
     nom="repere_km"  filter="true"/> 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


*Attributs ou valeurs spécifiques **wmsfilters** WMS*

| Nom              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Obligatoire                                                        | Valeurs possibles                                                                  | Valeur défaut              |          |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------|----------------------------|----------|
                                                                               |                            |          |
| nom              | Nom de la couche unique dans le navigateur                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Oui                                                                | Chaîne alphanumérique                                                              |                            |          |
| backend            | Appel php pour obtenir la list de valeurs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Oui                                                                | Non du scripte                                                              |  |
| frontend            | Appel php pour obtenir la list de valeurs (enfant)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Non                                                                | Non du scripte                                                              |  |
| attribut            | Attribut du filtre                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Oui                                                                | Chaîne alphanumérique                                                              |  |
| defaut            | Valeur par défaut de l'attribut                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Oui                                                                | Chaîne alphanumérique                                                              |  |
| texte            | Titre de l'attribut visible dans le panneau                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Non                                                                | Chaîne alphanumérique                                                              | *Valeur de l’attribut* |         |
| child      | Paramètres optionel pour gestion des listes liées                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Non                                                                | Chaîne alphanumérique                                                               |                            |          |
| childtexte      | Titre de l'attribut (enfant) visible dans le panneau                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Non                                                                | Chaîne alphanumérique                                                                |                            |          |



*Exemples wmsfilters à placer après declencheurs et avant requetespatiale*

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ xml

 	<wmsfilters>
        <layer nom="repere_km" backend="exemple.php" frontend="">
           <filtre attribut="nommun" defaut="Laval" texte="Nom de municipalité" />
       </layer>
       <layer nom="cs_google" backend="wmsfilter_back.php" frontend="wmsfilter_front.php">
           <filtre attribut="codnivhie1" defaut="53" texte="Dir. général" />
           <filtre attribut="codnivhie2" defaut="85" texte="Dir. térritorial" child="codnivhie3" childtexte="Centre service"  />
       </layer>
 	</wmsfilters> 
 

     <wmsfilters>
        <layer nom="LOCTS_PARC_AGRI_AN_COUR" backend="exemple.php" frontend="">
           <filtre attribut="no_diag" defaut="" texte="Numéro de diagramme" />
       </layer>
       <layer nom="LOCVMS_PARC_AGRI_PROD_AN_PREC" backend="lexemple.php" frontend="">
           <filtre attribut="procod" defaut="" texte="Code de production" />
           <filtre attribut="indi_parc_drai" defaut="" texte="Type de draînage" />
           <filtre attribut="pgmcod" defaut="" texte="Code de programme" />
       </layer>
 </wmsfilters> 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~