Fichier XML de configuration
============================
* [Navigateur](#navigateur)
	* [1.Présentation](#presentation)
		* [1.1 Liste des panneaux](#liste-des-panneaux)
			* [1.1.1 Panneau](#panneau)
			* [1.1.1.1 Panneau Accordeon](#panneauaccordeon)
			* [1.1.1.2 Panneau Carte](#panneaucarte)
			* [1.1.1.3 Panneau en tete](#panneauentete)
			* [1.1.1.4 Panneau Info](#panneauinfo)
			* [1.1.1.5 Panneau menu](#panneaumenu)
			* [1.1.1.6 Panneau Onglet](#panneauonglet)
			* [1.1.1.7 Panneau table](#panneautable)
			* [1.1.1.8 Création d'un panneau personnalisé](#creation-panneau-personnalisé)
			* [1.1.2 Élément de panneau accordeon](#element-panneau-accordeon)
			* [1.1.2.1 Arborescence](#arborescence)
			* [1.1.2.2 Impression](#impression)
			* [1.1.2.3 Localisation](#localisation)
			* [1.1.2.3 Google Itinéraire](#googleitineraire---pas-implanté)
			* [1.1.2.3 Google Street View](#googlestreetview---pas-implanté)
			* [1.1.3 Élément de localisation](#Élément-de-localisation)
			* [1.1.3.1 Recherche par adresse](#rechercheadresse)
			* [1.1.3.2 Recherche par borne](#rechercheborne)
			* [1.1.3.3 Recherche par cadastre rénové ](#recherchecadastrereno)
			* [1.1.3.4 Recherche par GPS ](#recherchegps)
			* [1.1.3.5 Rechercher par HQ](#recherchehq)
			* [1.1.3.6 Recherche par lieu](#recherchelieu)
			* [1.1.4 Edition](#edition)
			* [1.1.4.1 Edition Simple](#editionsimple)
			* [1.1.4.2 Edition Multiple](#editionmultiple)
			* [1.1.4.3 PanneauOngletEdition](#panneauongletedition)
			* [1.1.4.4 PanneauEdition](#panneauedition)
		* [1.2 Liste des Outils](#liste-des-outils)
			* [1.2.1 Groupe d'outils](#groupe-outils)
			* [1.2.2 Menu d'outils](#menu-outils)
			* [1.2.3 Outil](#outil)
			* [1.2.3.1 outilAide](#outilaide)
			* [1.2.3.2 outilAjoutWMS](#outilajoutwms)
			* [1.2.3.3 outilAssocierFichier](#outilassocierfichier)
			* [1.2.3.4 outilAnalyseSpatiale](#outilanalysespatiale---non-implanté)
			* [1.2.3.5 outilDeplacement](#outildeplacement)
			* [1.2.3.6 outilDessin](#outildessin)
			* [1.2.3.7 outilExportGPX](#outilexportgpx)
			* [1.2.3.8 outilExportShp](#outilexportshp)
			* [1.2.3.9 outilHistoriqueNavigation](#outilhistoriquenavigation)
			* [1.2.3.10 outilInfo](#outilinfo)
			* [1.2.3.11 outilMesure](#outilmesure)
			* [1.2.3.12 outilDeplacerCentre](#outildeplacercentre)
			* [1.2.3.13 outilPartagerCarte](#outilpartagercarte)
			* [1.2.3.14 outilReporterBogue](#outilreporterbogue)
			* [1.2.3.15 outilZoomEtendueMaximale](#outilzoometenduemaximale)
			* [1.2.3.16 outilZoomPreselection](#outilzoompreselection)
			* [1.2.3.17 outilZoomRectangle](#outilzoomrectangle)
			* [1.2.3.18 outilEdition](#outiledition)
			* [1.2.3.19 outilItineraire](#outilitineraire)
			* [1.2.3.20 outilSelection](#outilselection)
			* [1.2.3.21 Création d'un outil personnalisé](#creation-outil-personnalise)
	* [4 Contexte](#contexte)
	* [5 Liste des couches](#liste-des-couches)
		* [5.1 Groupe de couches](#groupe-de-couches)
		* [5.2 Couche](#couche)
		* [5.2.1 Blanc](#blanc)
		* [5.2.2 Google](#google)
		* [5.2.3 Marqueurs](#marqueurs)
		* [5.2.4 OSM](#osm)
		* [5.2.5 TMS](#tms)
		* [5.2.6 Vecteur](#vecteur)
		* [5.2.7 WMS](#wms)
		* [5.2.8 ArcGIS93Rest](#arcgis93rest)
		* [5.2.9 WFS](#wfs)
	* [6 Actions](#actions)
		* [6.1 Action](#action)
	* [7 Déclencheurs](#déclencheurs)
		* [7.1 Déclencheur](#déclencheur)
* [8 Exemples de fichier de configuration XML](#exemples-de-fichier-de-configuration-xml)
* [8.1 Configuration minimale (avec contexte défini dans le fichier de configuration)](#configuration-minimale-xml)
* [8.2 Configuration minimale (avec contexte chargé à partir de la BD)](#configuration-minimale-bd)
* [8.3 Configuration « Données ouvertes »](#configuration-donnees-ouvertes)
* [8.4 Configuration « FADQ » (ajout de composantes personnalisées)](#configuration-fadq)
* [8.5 Configuration maximale](#configuration-maximale)


Navigateur
==========

*Balise XML : `<navigateur>`*


Représente le navigateur cartographique.


*Attributs*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
| titre | Titre de la fenêtre contenant le navigateur | Non         | Chaîne alphanumérique |               |
| authentification | Permet d'activer le module d'authentification | Non         | booléen |               |
| baseUri | chemin vers le host du site | Non         | Chaîne alphanumérique |               |
| serviceUri | chemin vers les services | Non         | Chaîne alphanumérique |               |
| apiUri | chemin vers l'API de Igo | Non         | Chaîne alphanumérique |               |
| libUri | chemin vers les librairies utilisées par Igo | Non         | Chaîne alphanumérique |               |   |

Presentation
============

*Balise XML : `<presentation>`*

Gestion de la disposition des panneaux et des outils du navigateur
cartographique. Contient la liste des panneaux et des outils.

*Attributs*

Aucun


Liste des panneaux
------------------

*Balise XML : `<panneaux>`*

Liste des panneaux qui apparaîtront lors de l’instanciation du
navigateur cartographique. Contient la déclaration de chacun des
panneaux.

*Attributs*

Aucun


Panneau
-------

*Balise XML : `<panneau>`*

Permet la définition d’un panneau. Dans IGO, Il est possible de créer un
panneau personnalisé, mais plusieurs panneaux prédéfinis sont également
disponibles. En voici la liste : *PanneauAccordeon, PanneauCarte,
PanneauEntete, PanneauInfo, PanneauMenu, PanneauOnglet et PanneauTable*.

*Attributs communs*

|Nom|Description|Obligatoire|Valeurs possibles|Valeur défaut|
|---|-----------|-----------|-----------------|-------------|
|id   |Identifiant du panneau. Est utilisé pour accéder à celui-ci. Doit être unique.|Non|Chaîne alphanumérique|*panneau*|
|titre|Titre du panneau. Est affiché dans l'interface du navigateur.                 |Non|Chaîne alphanumérique|         |
|classe|Nom de la classe qui implémente le panneau.                                  |Non|Les classes prédéfinies sont :  *PanneauAccordeon*, *PanneauCarte*, *PanneauEntete*, *PanneauInfo*, *PanneauMenu*, *PanneauOnglet*, *PanneauTable*  ou Classe personnalisé (voir attribut urlModule)||
|urlModule|Url du fichier Javascript contenant la classe définissant un panneau personnalisé.|Seulement pour les panneaux personnalisés|URL||
|position|Position du panneau par rapport à la carte qui est au centre.|Non|*nord, sud, est, ouest*|*nord*|
|dimension|Hauteur ou largeur du panneau selon sa position (Hauteur pour *Nord/Sud* et Largeur pour *Est/Ouest*). Le panneau occupe tout l'espace disponible dans la dimension non spécifiée.|Non|Nombre entier|*100*|
|minDimension|Hauteur ou largeur (voir attribut dimension) minimale du panneau.|Non|Nombre entier|*100*|
|maxDimension|Hauteur ou largeur (voir attribut dimension) maximale du panneau.|Non|Nombre entier|*750*|
|ouvert|Indique si le panneau est ouvert ou fermé lors de l'affichage initial du navigateur.|Non|Booléen|*true*|


PanneauAccordeon
----------------

Permet la définition d'un panneau appelé à contenir des éléments
accordéons (voir définition).

*Attributs ou valeurs spécifiques*

|Nom|Description|Obligatoire|Valeurs possibles|Valeur défaut|
|---|-----------|-----------|-----------------|-------------|
|id||||*accordeon-panneau*|

*Exemples*

```xml
<panneau classe="PanneauAccordeon">
	<panneau id="panBas" titre="Exemple PanneauAccordeon" classe="PanneauAccordeon" position="sud"
	dimension="200" minDimension="100" maxDimension="300" ouvert="false"/>
</panneau>
```

*Aperçu*

![](media/image1.png)


PanneauCarte
------------

Permet la définition d'un panneau contenant une carte. La définition
d'un panneau de ce type entraîne automatiquement la création d'une
carte. Il est possible de spécifier certains attributs supplémentaires
afin de définir le point central de cette carte ainsi que le niveau de
zoom par défaut de celle-ci. Même s'il est possible de spécifier des
valeurs pour les attributs communs dans la définition d'un PanneauCarte,
il n'est pas recommandé de le faire sauf pour l'identifiant (id).

*Attributs ou valeurs spécifiques*

|Nom		|Description		|Obligatoire	|Valeurs possibles|Valeur défaut|
|---------------|-----------------------|---------------|-----------------|-------------|
|id		|Identifiant du panneau. Est utilisé pour accéder à celui-ci. Doit être unique.|Non|Chaîne alphanumérique|*carte-panneau*|
|titre		|Titre de la carte   	|Non		|Chaîne alphanumérique||
|centre		|Coordonnées en X et en Y du centre de la carte (projection Google) séparées par une virgule ou un point-virgule. Possible de définir le centre dans une autre projection en l'inscrivant dans ce foramt: (x,y;projection). La projection commence par 'EPSG:'.|Non|Nombres décimaux séparés par une virgule ou un point-virgule||
|x		|Coordonnée en X du centre de la carte (projection Google)|Non|Nombre décimal|*-7994004*|
|y		|Coordonnée en Y du centre de la carte (projection Google)|Non|Nombre décimal|*6034079*|
|zoom		|Niveau de zoom de la carte|Non|Nombre entier entre 0 et 19|*7*|

*Exemples*

```xml
<panneau classe="PanneauCarte">
	<panneau id="panCarte" classe="PanneauCarte" titre="Carte"
	x="-7754004" y="5954079" zoom="10"/>
</panneau>

```

*Aperçu*

![](media/image2.png)


PanneauEntete
-------------

Permet la définition d'un panneau appelé à contenir un en-tête
(bandeau).

*Attributs ou valeurs spécifiques*

|Nom		|Description		|Obligatoire	|Valeurs possibles|Valeur défaut|
|---------------|-----------------------|---------------|-----------------|-------------|
|id		|			|		|		  |*info-entete*|
|image		|Image à afficher dans l'en-tête (bandeau).|Non|URL|*images/bandeau\_donnees\_ouv\_goloc.png*|

*Exemples*

```xml
<panneau classe="PanneauEntete">
	<panneau id="panEntete" titre="Exemple PanneauEntete"
	classe="PanneauEntete" position="nord" dimension="115"
	minDimension="115" maxDimension="115" ouvert="true"
	image="images/banniere\_geo.jpg"/>
</panneau>
```

*Aperçu*

![](media/image3.png)


PanneauInfo
-----------

Permet la définition d'un panneau contenant des informations
additionnelles : les coordonnées X et Y de la position de la souris,
l'échelle et la projection de la carte.

*Attributs ou valeurs spécifiques*

|Nom		|Description		|Obligatoire	|Valeurs possibles|Valeur défaut|
|---------------|-----------------------|---------------|-----------------|-------------|
|id		|			|Non|		|*info-panneau*|
|titre		|			|Non|		|*Informations additionnelles*|
|position	|			|Non|		|*sud*|
|dimension	|Hauteur du panneau.	|Non|		|*75*|
|minDimension	|Hauteur minimale du panneau.|Non|		|*75*|
|maxDimension	|Hauteur maximale du panneau.|Non|		|*400*|
|ouvert		|			|Non|		|*false*|
|projection		|Afficher dans la liste les projections comme code EPSG ou leurs nom commun|Non|code, nom|*code*|
|elevation		|Afficher l'altitude à une position dans la carte. (Ajout dans le config.php est nécessaire pour identifié le service api d'élévation)|Non|Booléen		|*false*|

*Exemples*

```xml
<panneau classe="PanneauInfo">
	<panneau id="panInfo" titre="Exemple PanneauInfo" classe="PanneauInfo"
	position="sud" dimension="200" minDimension="100" maxDimension="300"
	ouvert="false" projection="nom" elevation="true" />
</panneau>
```

*Aperçu*

![](media/image4.png)


PanneauMenu
-----------

Permet la définition d'un panneau appelé à contenir un menu. En fait, il
s'agit d'une panneau de type *PanneauAccordeon* (voir définition) dont
la valeur de certains attributs communs sont prédéfinis (position,
titre, dimensions, etc.).

*Attributs ou valeurs spécifiques*

|Nom		|Description		|Obligatoire	|Valeurs possibles|Valeur défaut|
|---------------|-----------------------|---------------|-----------------|-------------|
|id 		|			|	    	|	        |*menu-panneau*|
|titre		|			|		|		|*Menu*|
|position	|			|		|		|*ouest*|
|dimension	|Largeur du panneau.	|		|		|*300*|
|minDimension   |Largeur minimale du panneau.|		|		|*175*|
|maxDimension   |Largeur maximale du panneau.|		| 		|*400*|
|ouvert         |			|		|		|*false*|

*Exemples*

```xml
<panneau classe="PanneauMenu">
	<panneau id="panMenu" titre="Exemple PanneauMenu" classe="PanneauMenu"
	position="ouest" dimension="300" minDimension="300" maxDimension="300"
	ouvert="true"/>
</panneau>
```

*Aperçu*

![](media/image5.png)


PanneauOnglet
-------------

Permet la définition d'un panneau appelé à contenir des onglets.

*Attributs ou valeurs spécifiques*

Aucun

*Exemples*

```xml
<panneau classe="PanneauOnglet">
	<panneau id="panOnglet" titre="Exemple PanneauOnglet"
	classe="PanneauOnglet" position="sud" dimension="200" minDimension="100"
	maxDimension="300" ouvert="false"/>
</panneau>
```

*Aperçu*

![](media/image6.png)


PanneauTable
------------

Permet la définition d'un panneau appelé à contenir un tableau.

*Attributs ou valeurs spécifiques*

|Nom		|Description		|Obligatoire	|Valeurs possibles|Valeur défaut|
|---------------|-----------------------|---------------|-----------------|-------------|
|paginer 		| Permet de paginer le tableau	| Non	    | Booléen	        | *false* |
|paginer_debut	| Permet de commencer la pagination à une page précise	| Non		| Nombre entier		| *0*|
|paginer_limite	| Permet de limiter le nombre d'occurence par page		| Non		| Nombre entier		| *5000*|
|outils_selectionSeulement	| Permet d'activer l'outil d'affichage de sélection seulement	| Non		| Booléen	| *false* |
|outils_auto   | Permet d'activer l'outil de zoom automatique sur la sélection | Non		| Booléen		| *false* |
|outils_contenupage   | Permet d'activer l'outil de d'affichage du contenu de la page seulement | Non	| Booléen	| *false* |

*Exemples*

```xml
<panneau classe="PanneauTable">
	<panneau id="panTable" titre="Exemple PanneauTable"
	classe="PanneauTable" position="sud" dimension="200" minDimension="100"
	maxDimension="300" ouvert="false"/>
</panneau>
```

*Aperçu*

![](media/image7.png)


Creation Panneau personnalisé
----------------------------------

*Exemple*

*Aperçu*


Element panneau accordeon
=========================

*Balise XML: `element-accordeon`*

Permet la définition d’un élément présent dans un panneau prédéfini de
type *PanneauAccordeon*. Dans IGO, il est possible de créer un élément
personnalisé, mais plusieurs éléments prédéfinis sont également
disponibles. En voici la liste : *Arborescence, Impression et
Localisation*.

*Attributs communs*

Aucun


Arborescence
------------

Permet la définition d’un élément contenant l’arborescence (arbre) des
couches disponibles à l’affichage sur la carte.

*Attributs ou valeurs spécifiques*

|Nom		|Description		|Obligatoire	|Valeurs possibles|Valeur défaut|
|---------------|-----------------------|---------------|-----------------|-------------|
|idResultatTable|Identifiant du PanneauTable ou du PanneauOnglet. Ce panneau sera utilisé pour afficher les occurences.|Non|Chaîne alphanumérique| |
|retirerCheckboxPremNiveau| Permet de retirer les checkbox de premier niveau dans l'arborescence | non | true | false |
|identifierSousSelection| Permet de griser les répertoires parents lorsqu'une couche est sélectionnée | non | true| false
|identifierGetInfo| Permet d'ajout l'icône du getInfo à gauche de la couche lorsque celle-ci est cochée et qu'elle contient un getInfo | Non | true | false |

*Exemple*

```xml
 <element-accordeon classe="Arborescence" retirerCheckboxPremNiveau="true" identifierSousSelection="true" identifierGetInfo="true"/>
```

*Aperçu*

![](media/image8.png)


Impression
----------

Permet la définition d’un élément gérant l’impression de la carte
(titre, commentaires, format, format de papier, largeur, hauteur,
affichage de la légende, orientation, unité, etc.).

*Attributs ou valeurs spécifiques*

Aucun

*Exemple*
```xml
<element-accordeon classe="Impression"/>
```

*Aperçu*

![](media/image9.png)


Localisation
------------

Permet la définition d’un élément contenant différents onglets rendant
possible la recherche (localisation) de divers objets.

*Attributs ou valeurs spécifiques*

Aucun

*Exemple*
```xml
<element-accordeon classe="Localisation"/>
```

*Aperçu*

![](media/image10.png)


googleItineraire - Pas implanté
---------------

Menu google routing

*Attributs ou valeurs spécifiques*

Aucun

*Exemple*
```xml
<element-accordeon classe="googleItineraire"/>
```

*Aperçu*


googleStreetView - Pas implanté
----------------

Menu google Street View

*Attributs ou valeurs spécifiques*

Aucun

*Exemple*
```xml
<element-accordeon classe="googleStreetView"/>
```

Élément de localisation
=======================

*Balise XML: `element`*

Permet la définition d’un élément présent dans un élément de panneau
accordéon de type *Localisation*. Dans IGO, il est possible de créer un
élément personnalisé, mais plusieurs éléments prédéfinis sont également
disponibles. En voici la liste :*RechercheAdresse, RechercheBorne,
RechercheCadastreReno, RechercheGPS, RechercheHQ, RechercheLieu*.

*Attributs communs*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|Identifiant de l’élément. Est utilisé pour accéder à celui-ci. Doit être unique.|Non|Chaîne alphanumérique|*recherche*|
|titre	|Titre de l’élément. Est affiché comme titre de l’onglet contenant l’élément.|Non|Chaîne alphanumérique||
|classe	|Nom de la classe qui implémente l’élément.|Oui|Les classes prédéfinies sont :  *RechercheAdresse*, *RechercheBorne*, *RechercheCadastreReno*, *RechercheGPS*, *RechercheHQ*, *RechercheLieu*  ou Classe personnalisée (voir attribut urlModule)|*Recherche*
|urlModule|Url du fichier Javascript contenant la classe définissant un élément personnalisé.|Seulement pour les éléments personnalisés|URL||
|maxEnreg|Nombre maximal de résultats de localisation à afficher|Non|Nombre entier supérieur à 0|*40*|
|epingle|Indique si la case à cocher permettant la localisation d’un résultat de recherche avec une épingle dans la carte doit être affichée ou non.|Non|Booléen|*true*|
|idResultatTable|Identifiant du PanneauTable ou du PanneauOnglet. Ce panneau sera utilisé pour afficher les résultats de la recherche.|Non|Chaîne alphanumérique||
|couchesAssociees | Liste des couches à activer après que la recherche soit lancée | Non | Tableau | |


RechercheAdresse
----------------

Permet la définition d’un élément de localisation d’adresses civiques
(numéro, nom de rue, ville).

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre	|					|		|			|*Adr.*|

*Exemples*
```xml
<element id="eleLoclsAdrs" classe="RechercheAdresse" titre="Adresses"
maxEnreg="20" epingle="false"/>
```

*Aperçu*

![](media/image11.png)


RechercheBorne
--------------

Permet la définition d’un élément de localisation de bornes
kilométriques (routes, voies ferrées, voies maritimes) et de sorties
d’autoroute (numéro, contenu du panneau).

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre	|					|		|			|*Borne*|

*Exemples*
```xml
<element id="eleLoclsBorne" classe="RechercheBorne" titre="Bornes"
maxEnreg="20" epingle="false"/>
```

*Aperçu*

![](media/image12.png)


RechercheCadastreReno
---------------------

Permet la définition d’un élément de localisation de lots dans le
cadastre rénové (numéro).

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*RechercheCadastreReno*|
|titre	|					|		|			|*Cadastre rénové*|

*Exemples*
```xml
<element id="eleLoclsCadstReno" classe="RechercheCadastreReno"
titre="Lots" maxEnreg="20" epingle="false"/>
```
*Aperçu*

![](media/image13.png)


RechercheGPS
------------

Permet la définition d’un élément de localisation de coordonnées GPS.
Plusieurs projections (UTM, MTM, Géographique) et formats (DD, DMD. DMS
et BELL) sont supportées.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre	|					|		|			|*GPS*|

*Exemples*
```xml
<element id="eleLoclsGPS" classe="RechercheGPS" titre="Coord. GPS"
maxEnreg="20" epingle="false"/>
```

*Aperçu*

![](media/image14.png)


RechercheHQ
-----------

Permet la définition d’un élément de localisation de pylônes électriques
(numéro, rang dans une ligne)

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre	|					|		|			|*HQ*|

*Exemples*
```xml
<element id="eleLoclsHQ" classe="RechercheHQ" titre="Hydro-Québec"
maxEnreg="20" epingle="false"/>
```

*Aperçu*

![](media/image15.png)


RechercheLieu
-------------

Permet la définition d’un élément de localisation de lieux (commerces,
lac, etc.).

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre	|					|		|			|*Lieu*|


*Exemples*
```xml
<element id="eleLoclsLieu" classe="RechercheLieu" titre="Lieux"
maxEnreg="20" epingle="false"/>
```

*Aperçu*

![](media/image16.png)

Creation element de localisation personnalise
---------------------------------------------

*Exemple*

*Aperçu*


Edition
=======

EditionSimple
-------------
Permet la définition d'un élément d'édition de données géométriques.

*Attributs ou valeurs spécifiques*

Aucun

*Exemple*

```xml
<element-accordeon classe="EditionSimple" urlModule="edition/public/js/app/menu/editionSimple"/>
```

*Aperçu*

![](media/image34.png)

EditionMultiple
---------------

Permet d'éditer des géométries d'une couche définie dans le service d'édition.
Ce module nécessite l'inclusion du module PanneauOngletEdition

*Attributs ou valeurs spécifiques*

Aucun

*Exemple 1*

```xml
<element-accordeon classe="Edition" urlModule="edition/public/js/app/menu/edition"/>
```

*Aperçu*

![](media/Menu-edition-multiple.png)

PanneauOngletEdition
---------------

Permet d'inclure un ou des panneauEdition

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre|Titre affiché du panneau |Non|Texte|*Éléments géométriques*|

*Exemple 1*

```xml
<element-accordeon classe="PanneauOngletEdition" urlModule="/igo/edition/public/js/app/panneau/panneauOngletEdition"/>
```

*Aperçu*

![](media/PanneauOnglet-edition-multiple.png)

PanneauEdition
---------------

Inclus par PanneauOngletEdition.
Réimplémentation de panneauTable
Permet l'édition des attributs de une ou des géométrie(s) d'un type spécifique (point, ligne, surface) ainsi que la création et la suppression de géométrie.


*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre|Titre affiché du panneau |Oui|Texte||
|colonnes|Descriptif des colonnes |Oui|Tableau||
|donnees|Donnnées à afficher dans le panneau |Oui|Tableau||
|typeGeom|Type de géométrie |Non|point, LineString, polygon| *Point*|
|fermable|Si le panneau peut être fermé |Non|Booléen| *Non*|

*Aperçu*

![](media/Panneau-edition-multiple.png)


Liste des outils
================

*Balise XML : `outils`*

Liste des outils qui seront disponibles lors de l’instanciation du
navigateur cartographique dans la barre d'outils de ce dernier. Contient
la déclaration de chacun des outils. Les outils peuvent être regroupés
en groupe et/ou en menu d'outils.

Groupe outils
---------------

*Balise XML : `groupe-outils`*

Permet la définition d'un groupe d'outils. Chaque groupe d’outils est
entouré d’éléments « séparateur » afin qu’il soit possible de les
distinguer. Possibilité de mettre un attribut de la balise 'Outil'
qu'on veut appliquer à tous les enfants du 'groupe-outils'.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|division|Indique si les éléments « séparateur » doivent être affichés ou non|Non|Booléen|*true*|
|position|Position du groupe d'outils dans la barre d'outils. |Non|*gauche / droite*|*gauche*|

*Exemple*s
```xml
<groupe-outils position="droite">
	<outil classe="OutilMesure" />
</groupe-outils>
<groupe-outils>
	<menu>
		<outil classe="OutilMesure"/>
	</menu>
</groupe-outils>
```


Menu outils
-------------

*Balise XML : `menu`*

Permet la définition d'un menu dans la barre d'outils afin de regrouper
ensemble certains outils de même nature.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre|Titre du menu (affiché dans la barre d’outils).|Non|Chaîne alphanumérique|*Menu*|

*Exemple*
```xml
<menu titre="Test menu">
	<outil classe="OutilMesure"/>
</menu>
```

*Aperçu*


Outil
-----

*Balise XML : `outil`*

Permet la définition d'un outil. Dans IGO, Il est possible de créer un
outil personnalisé, mais plusieurs outils prédéfinis sont également
disponibles. En voici la liste : *OutilAide, OutilAjoutWMS,
OutilAnalyseSpatiale, OutilDeplacement, OutilDessin,
OutilHistoriqueNavigation, OutilInfo, OutilMesure, OutilDeplacerCentre,
OutilPartagerCarte, OutilReporterBug, OutilZoomEtendueMaximale,
OutilZoomPreselection et OutilZoomRectangle*.

*Attributs communs*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|Identifiant de l'outil. Est utilisé pour accéder à celui-ci. Doit être unique.|Non|Chaîne alphanumérique|*outil*|
|classe	|Nom de la classe qui implémente l'outil.	|Non	|Les classes prédéfinies sont :  *OutilAide*, *OutilAjoutWMS*, *OutilAnalyseSpatiale*, *OutilDeplacement*, *OutilDessin*, *OutilHistoriqueNavigation*, *OutilInfo*, *OutilMesure*, *OutilDeplacerCentre*, *OutilPartagerCarte*, *OutilReporterBug*, *OutilZoomEtendueMaximale*, *OutilZoomPreselection*, *OutilZoomRectangle*  ou Classe personnalisée (voir attribut urlModule)|*Outil*|
|urlModule|Url du fichier Javascript contenant la classe définissant un panneau personnalisé.|Seulement pour les panneaux personnalisés|URL||
|icone|Icône de l'outil. Est affiché sur le bouton dans la barre d'outils.|Non|URL ou Classe CSS prédéfinie :  *aide*, *apropos*, *back*, *bug*, *deletefeature*, *drawpoint*, *drawline*, *drawpolygon*, *getinfo*, *measrCircle*, *measrlinear*, *measrpolgn*, *modifyfeature*, *moveto*, *next*, *pan*, *print*, *zoomfull*, *zoomin*, *zoomout*, *zoom-hydro*, *zoom-mrc*, *zoom-mun*, *zoom-reg-adm*|titre|Titre de l'outil. Est affiché à droite du bouton dans la barre d'outils.|Non|Chaîne alphanumérique||
|infobulle|Infobulle de l'outil. Est affiché lorsque le curseur de la souris est placée sur le bouton dans la barre d'outils.|Non|Chaîne alphanumérique||
|visible|Indique si le bouton est visible ou non dans la barre d'outils lors de l'affichage initial du navigateur.|Non|Booléen|*true*|
|actif|Indique si le bouton est actif ou non (grisé) dans la barre d'outils lors de l'affichage initial du navigateur.|Non|Booléen|*true*|


outilAide
---------

Permet la définition d'un outil d'aide. Lorsqu'on clique sur l'outil, un
document ou un site d'aide est affiché.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*aide\_igo*|
|icone	|					|		|			|*aide*|
|infobulle|					|		|			|*Guide d'autoformation*|
|lien	|Lien vers le document ou le site d’aide à afficher lors du clic sur le bouton.|Non|URL|*golocmsp/docs/200\_Guide\_Localisation\_GOLOC\_Public\_Gen\_V02.pdf*|

*Exemple*s
```xml
<outil classe="OutilAide">
<outil id="btnAide" classe="OutilAide" icone="images/toolbar/aide.gif"
titre="Aide" infobulle="Aide" visible="true" actif="true"
lien="http://www.google.ca"/>
```

*Aperçu*

![](media/image17.png)


outilAjoutWMS
-------------

Permet la définition d'un outil d'ajout de couches provenant de services
WMS externes sur la carte. Lorsqu'on clique sur l'outil, une fenêtre
s’ouvre permettant la connexion à un service WMS ainsi que la sélection
des couches à ajouter sur la carte.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*wmsbrowsermsp*|
|icone	|					|		|			|*images/mActionAddLayer.png*|
|titre	|					|		|			|*Ajout de services Web*|
|infobulle|					|		|			|*Outil d'ajout de couches à la carte*|
|urlPreenregistre|Liste d'URL de services WMS préenregistrés disponible dans la fenêtre de l'outil.|Non|Liste d'URL séparées par des virgules|Dans le config.php|
|ajoutUrl|Indique si les urls preenregistrés sont ajoutés à la liste présente dans le fichier « config.php ». Si false, alors les urls preenregistrés du config.php sont remplacés par ceux du XML.|Non|Boolean|true|

*Exemple*s
```xml
<outil classe="OutilAjoutWMS">
<outil id="btnAjoutWMS" classe="OutilAjoutWMS"
icone="images/toolbar/add.png" titre="Ajout de services WMS"
infobulle="Ajout de services WMS" visible="true" actif="true"
urlPreenregistre="http://www.google.ca"/>
```

*Aperçu*

![](media/image18.png)

outilAssocierFichier
-------------

Implémenté pour le module d'édition, cet outil permet d'associer un ou des fichier(s) à un regroupement. Il a été prévu pour être réutilisé à d'autres besoins (Exemple associer un fichier à un élément géométrique)

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|supprimerFichier	|Fonction à appeler lors de la suppression	|Oui|Fonction	||
|associerFichier	|Fonction à appeler lors de l'ajout d'un fichier	|Oui|Fonction	||
|visualiserFichier	|Fonction à appeler lors de la demande de visualisation du fichier	|Oui|Fonction	||
|listerFichier	|Fonction à appeler pour lister les fichiers associés	|Oui|Fonction	||
|champs	|Liste des champs pour construire le store de données des fichiers	|Oui|Tableau	||
|colonnes	|Liste des colonnes pour construire la grille de la liste de fichier	|Oui|Tableau	||


*Aperçu*

![](media/outilAssocierFichierBtn.png)
![](media/outilAssocierFichierPan.png)

outilAnalyseSpatiale - Non implanté
--------------------

Permet la définition d'un outil d'analyse Spatiale

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*wmsbrowsermsp*|

*Exemple*s
```xml

```

*Aperçu*

![]()


outilDeplacement
----------------

Permet la définition d'un outil de déplacement de la carte à l'aide la
souris (pan).

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*idDragPan*|
|icone	|					|		|			|*pan*|
|infobulle|					|		|			|*Déplacement : garder le bouton de gauche de la souris enfoncé et déplacer la carte*|

*Exemple*
```xml
<outil classe="OutilDeplacement">
<outil id="btnDeplacement" classe="OutilDeplacement"
icone="images/toolbar/icon\_pan.png" titre="Déplacer carte"
infobulle="Déplacer carte" visible="true" actif="true"/>
```

*Aperçu*

![](media/image19.png)


outilDessin
-----------


Permet la définition d'un outil d'ajout de dessins et/ou d'annotations
sur la carte. Lorsqu'on clique sur l'outil, une barre d'outils
supplémentaire s'affiche. Celle-ci contient les outils suivants :
«Create point», « Create line», «Create polygon», «Create label»,
«Modifier objet», «Delete all features», «Import KML», «Export KML».

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*idRedLine*|
|icone	|					|		|			|*libs/GeoExt.ux/FeatureEditing/resources/images/silk/pencil.png*|
|infobulle|					|		|			|*Outil de dessin/annotation sur la carte*|

*Exemple*
```xml
<outil classe="OutilDessin">
<outil id="btnDessin" classe="OutilDessin"
icone="images/toolbar/add\_point\_off\_2.png" titre="Dessin/Annotations"
infobulle="Dessin/Annotations" visible="true" actif="true"/>
```

*Aperçu*

![](media/image20.png)

![](media/image21.png)


outilExportCSV
-----------


Permet d'exporter les données d'un panneauTable en fichier csv. Inclus dans le panneauTable.

*Attributs ou valeurs spécifiques*

Aucune


outilExportGPX
-----------


Permet d'exporter une sélection de géométrie vers un fichier GPX

*Attributs ou valeurs spécifiques*

Aucune

*Exemple*
```xml
<outil classe="OutilExportGPX"/>
```

*Aperçu*

![](media/outilExportGPX.png)

outilExportShp
-----------


Permet d'exporter une sélection de géométrie vers un ou des fichier(s) zippé de shapeFile

*Attributs ou valeurs spécifiques*

Aucune

*Exemple*
```xml
<outil classe="OutilExportShp"/>
```

*Aperçu*

![](media/outilExportShapeFile.png)


outilHistoriqueNavigation
-------------------------

Permet la définition d'un outil de navigation dans l'historique des
différentes cartes qui ont été affichées au cours d'une même session
d'utilisation d'IGO.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*idBackHistory (si type = precedent)*, *idNextHistory (si type = suivant)*|
|type	|Type de l'outil. Sert à déterminer si l'outil permet d'avancer ou de reculer dans l'historique.|Oui|*precedent / suivant*||
|icone	|					|		|			|*back (si type = precedent)*, *next (si type = suivant)*|
|infobulle|					|		|			|*Navigation rapide : reculer*, *(si type = precedent)*, *Navigation rapide : (si type = suivant)*|

*Exemple*
```xml
<outil classe="OutilHistoriqueNavigation" type="precedent">
<outil id="btnHistoriqueNavigationSuivant"
classe="OutilHistoriqueNavigation" type="suivant"
icone="images/toolbar/next.png" titre="Avancer" infobulle="Avancer dans
l'historique" visible="true" actif="true"/>
```

*Aperçu*

![](media/image22.png)


outilInfo
--------

Permet la définition d'un outil d'interrogation du contenu de la carte.
Lorsqu'on clique dans la carte après avoir sélectionné cet outil, on
obtient de l'information descriptive à propos de cet endroit.
L'information obtenue dépend des couches présentement affichées sur la
carte.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|						|		|		|*getinfo\_msp*|
|icone	|						|		|		|*getinfo*|
|infobulle|						|		|		|*Information : sélectionner une couche additionnelle dans l'arborescence des couches puis cliquer à l'endroit voulu sur la carte*|

*Exemple*
```xml
<outil classe="OutilInfo">
<outil id="btnInfo" classe="OutilInfo" icone="images/toolbar/info.png"
titre="Informations" infobulle="Informations" visible="true"
actif="true"/>
```

*Aperçu*

![](media/image23.png)

outilmportFichier
--------

Permet d'importer dans la carte des géométries contenu dans des fichiers de type:
bna, csv, dgn, dxf, shp, dbf, shx (prj optionel), gxt, txt, json, geojson, rss, georss, xml, gml, xsd, gmt, gpx, itf, ili (fmt optionel), kml, kmz, tab, map, id, dat, 000 (001-00N optional) ,rt1,vrt
Les shapeFiles doivent être zippés

*Attributs ou valeurs spécifiques*

Aucune

*Exemple*
```xml
<outil classe="OutilImportFichier"/>
```

*Aperçu*

![](media/outilImportFichier.png)
![](media/outilImportFichierPan1.png)
![](media/outilImportFichierPan2.png)


outilMenu
--------------------

Permet la définition d'un sous-menu

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*wmsbrowsermsp*|

*Exemple*s
```xml

```

*Aperçu*

![]()


outilMesure
-----------

Permet la définition d'un outil de mesure. Lorsqu'on clique sur la carte
après avoir sélectionné l'outil, une fenêtre montrant la mesure demandée
(longueur ou périmètre/superficie) s'affiche.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|						|		|		|*mesure\_lineaire (si type = lineaire)*| *mesure\_surface (si type = surface)*|
|type	|Type de l'outil. Sert à déterminer si l'outil permet d'effectuer des mesures linéaires (longueur) ou surfaciques (périmètre/superficie)..|Oui|*lineaire / surface*||
|icone	|						|		|		|*measrlinear (si type = lineaire)*, *measrpolgn (si type = surface)*|
|infobulle|						|		|		|*Outil de mesure linéaire (si type = lineaire)*, *Outil de mesure de surface (si type = surface)*|

*Exemple*s
```xml
<outil classe="OutilMesure" type="lineaire">
<outil id="btnMesureSurface" classe="OutilMesure" type="surface"
icone="images/toolbar/measrpolgn.png" titre="Mesure surface"
infobulle="Mesure surface" visible="true" actif="true"/>
```
*Aperçu*

![](media/image24.png)


outilDeplacerCentre
-------------------

Permet la définition d'un outil d'obtention/modification du point
central de la carte. Lorsqu'on clique sur l'outil, une fenêtre contenant
les coordonnées X et Y du point central de la carte sont affichés
(différentes projections sont disponibles). Ces coordonnées peuvent
également être modifiées afin de déplacer le point central de la carte.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*moveTo*|
|icone	|					|		|			|*moveto*|
|infobulle|					|		|			|*Position du centre de la carte*|

*Exemple*s
```xml
<outil classe="OutilDeplacerCentre">
<outil id="btnRecentrer" classe="OutilDeplacerCentre"
icone="images/toolbar/moveto.png" titre="Recentrer" infobulle="Recentrer
la carte" visible="true" actif="true"/>
```
*Aperçu*

![](media/image25.png)


outilPartagerCarte
------------------

Permet la définition d'un outil de partage de la carte. Lorsqu'on clique
sur cet outil, une fenêtre s'affiche avec un lien permettant de partager
la carte telle qu'elle est affichée à ce moment. Ce lien peut être copié
ou envoyé par courriel.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*btnSaveContext*|
|icone	|					|		|			|*images/mActionFileSave.png*|
|titre	|					|		|			|*Partager la carte*|
|infobulle|					|		|			|*Sauvegarder ou partager cette carte*|

*Exemple*s
```xml
<outil classe="OutilPartagerCarte">
<outil id="btnPartagerCarte" classe="OutilPartagerCarte"
icone="images/toolbar/moveto.png" titre="Partager" infobulle="Partager
la carte" visible="true" actif="true"/>
```

*Aperçu*

![](media/image26.png)


outilRapporterBogue
------------------

Permet la définition d'un outil de soumission d'anomalie. Lorsqu'on
clique sur cet outil, un site de suivi des anomalies (ou tout autre
moyen disponible pour soumettre une anomalie) est affiché.


*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*geomantis\_msp*|
|icone	|					|		|			|*bug*|
|infobulle|					|		|			|*Adresse, lieu introuvable ou bogue dans l'application : soumettre une incohérence*|
|lien	|Lien vers le site de suivi des anomalies à afficher lors du clic sur le bouton.|Non|URL|*http://geoegl.msp.gouv.qc.ca/mantis/login\_page.php*|

*Exemple*s
```xml
<outil classe="OutilRapporterBogue">
<outil id="btnRapporterAnomalie" classe="OutilRapporterBogue"
icone="images/toolbar/bug-small.png" titre="RapporterAnomalie"
infobulle="Rapporter une anomalie" visible="true" actif="true"
lien="http://www.google.ca"/>
```

*Aperçu*

![](media/image27.png)


outilZoomEtendueMaximale
------------------------

Permet la définition d'un outil de recadrage/zoom de la carte sur
l'étendue maximale définie. Par défaut, lorsqu'on clique sur cet outil,
la carte est rafraîchie de manière à ce que le Québec en entier soit
visible sur celle-ci.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*zoom\_qc*|
|icone	|					|		|			|*zoomfull*|
|infobulle|					|		|			|*Zoom sur le Québec en entier*|
|gauche	|Coordonnée X minimale (projection Google)|N		|Nombre décimal		|*-9077974.0862465*|
|droite	|Coordonnée X maximale (projection Google)|N		|Nombre décimal		|*-5988695.1516261*|
|bas	|Coordonnée Y minimale (projection Google)|N		|Nombre décimal		|*5451617.843497*|
|haut	|Coordonnée Y maximale (projection Google)|N		|Nombre décimal		|*7090427.7296376*|

*Exemple*s
```xml
<outil classe="OutilZoomEtendueMaximale">
<outil id="btnZoomEntendueMaximale" classe="OutilZoomEtendueMaximale"
icone="images/toolbar/globe\_search.png" titre="Zoom étendue maximale"
infobulle="Zoom étendue maximale" visible="true" actif="true"
gauche="-7956234.1" droite="-7919506.13" bas="5901107.03"
haut="5925184.68"/>
```

*Aperçu*

![](media/image28.png)


outilZoomPreselection
---------------------

Permet la définition d'un outil de recadrage/zoom de la carte sur une
région (municipalités, MRC, RAGQ, etc.) sélectionnée préalablement à
partir d'une liste.


*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*recherche\_par\_region\_adm\ (si type = region-adm)*, *recherche\_par\_mrc (si type = mrc)*, *recherche\_par\_mun (si type = mun)*, *recherche\_par\_hydro (si type = hydro)*|
|type	|Type de l'outil. Sert à déterminer le type de région à afficher dans la liste.|Oui|*region-adm / mrc / mun / hydro*||
|icone	|					|		|			|*zoom-reg-adm (si type = region-adm)*, *zoom-mrc (si type = mrc)*, *zoom-mun (si type = mun)*, *zoom-hydro (si type = hydro)*|
|titre	|					|		|			|*Par région administrative (si type = region-adm)*, *Par MRC (si type = mrc)*, *Par municipalité (si type = mun)*, *Par hydrographie (si type = hydro)*|
|etiquette| attribut à utiliser pour afficher dans l'étiquette |Non| string |res_nm_reg mrs_nm_reg mus_nm_mun |
|texteForm| Texte à afficher dans le formulaire| Non | string | |
|fieldLabel | Titre du combobox à afficher | Non | String | |
|requestParametre| Nom du service d'obtention des données | Non | string |
|service | url du service | Non | String| |

*Exemple*s
```xml
<outil classe="OutilZoomPreselection" type="mrc"/>
<outil id="btnZoomPreselection" classe="OutilZoomPreselection"
type="mun" icone="images/toolbar/zoom\_mun.png" titre="Zoom
municipalité" infobulle="Zoom municipalité" visible="true"
actif="true"/>
```

```xml
<outil classe="OutilZoomPreselection" type="mrc"/>
<outil id="btnZoomPreselection" classe="OutilZoomPreselection"
type="mun" icone="images/toolbar/zoom\_mun.png" titre="Zoom
municipalité" infobulle="Zoom municipalité" visible="true"
actif="true"/>
```
*Personnalisé:
```xml
 <outil classe="OutilZoomPreselection" type="cs" id="recherche_par_cs" titre="Par centre de services" icone="zoom-mrc" etiquette="desc_fran"
                           texteForm="un centre de services" fieldLabel="Centre de services" requestParametre="obtenirCS" service="/lien_du_service/proxy.php"/>         
```

*Aperçu*

![](media/image29.png)


outilZoomRectangle
------------------

Permet la définition d'un outil de zoom de la carte sur une région ou un
point défini(e) à l'aide de la souris.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|					|		|			|*idZoomBoxIn (si type = avant)*, *idZoomBoxOut (si type = arriere)*
|type	|Type de l'outil. Sert à déterminer si le zoom effectué est vers l'avant (in) ou l'arrière (out).|Oui|*arriere / avant*||
|icone	|					|		|			|*zoomin (si type = avant)*, *zoomout (si type = arriere)*|
|infobulle|					|		|			|*Zoom avant: cliquer sur la carte ou utiliser le bouton gauche de la souris et déplacer pour former un rectangle de zoom (si type = avant)*, *Zoom arrière: cliquer sur la carte ou utiliser le bouton gauche de la souris et déplacer pour former un rectangle de zoom (si type = arriere)*|

*Exemple*
```xml
<outil classe="OutilZoomRectangle" type="avant">
<outil id="btnZoomRectangle" classe="OutilZoomRectangle"
type="arriere" icone="images/toolbar/search\_remove.png" titre="Zoom
arrière" infobulle="Zoom arrière" visible="true" actif="true"/>
```

*Aperçu*

![](media/image30.png)


OutilEdition
-------------

Permet de définir l'outil d'édition de couche.

*Exemple*

*Aperçu*


OutilItineraire
-------------

Permet de définir l'outil d'itinéraire (OSRM).

*Exemple*

*Aperçu*


OutilSelection
-------------

Permet de définir l'outil de sélection des couches vecteurs.

*Exemple*

*Aperçu*


Creation outil personnalise
--------------------------------

*Exemple*

*Aperçu*


Contexte
========

*Balise XML : `contexte`*

Permet de charger un contexte (ensemble de couches correspondant à un
même cas d’utilisation) défini à l’aide de l’outil de pilotage et
sauvegardé dans la base de données d’IGO.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id	|Identifiant unique du contexte. |non|Nombre entier correspondant à un identifiant de contexte de la BD d’IGO.||
|code | Code du contexte. |non| Identifiant alphanumérique de contexte de la BD d’IGO.||
|centre	|Coordonnées en X et en Y du centre de la carte (projection Google) séparées par une virgule ou un point-virgule. Exemple: -71.3,48.3;EPSG:4326|Non|Nombres décimaux séparés par une virgule ou un point-virgule||
|zoom	|Niveau de zoom de la carte| Non |Nombre entier entre 0 et 19||
|projection |Projection d'affichage|Non|Chaîne alphanumérique|*EPSG:3857*|
|niveauZoom|Nombre de niveau |Non|Nombre entier entre 0 et 19|*20*|
|etendueMax|étendue maximale de la carte |Non|En lien avec la projection|*-20037508.34, -20037508.34, 20037508.34, 20037508.34*|
|resolutionMax|résolution maximale de la carte |Non|En lien avec la projection|*Aucune*|
|limiteEtendue|limite de l'étendu de la carte |Non|En lien avec la projection|*-11000000,3397938,-4806248,9512143*|
|resolutions|Liste des résolutions de chaque niveau de zoom |Non|En lien avec projection et niveauZoom|*-Aucune*||

*Exemple*


Liste des couches
=================

*Balise XML : `couches`*

Liste des couches qui seront disponibles pour affichage dans le
navigateur cartographique. Contient la déclaration de chacune des
couches. Les couches peuvent être regroupés en groupe de couches.


Groupe de couches
-----------------

*Balise XML : `groupe-couches`*

Permet la définition d'un groupe de couches. Chaque groupe de couches
possède sa propre branche dans l’arborescence.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 	| Obligatoire 	| Valeurs possibles     | Valeur défaut |
|-------|-----------------------------------------------|---------------|-----------------------|---------------|
|groupe	|Nom du groupe de couches. Est affiché dans l’arborescence.| Non| Chaîne alphanumérique	|		|

*Exemple*
```xml
<groupe-couches groupe="Test"
 couche …
 couche …
 …
groupe-couches/>
```


Couche
------

*Balise XML : `couche`*

Permet la définition d'une couche. IGO permet l’affichage de plusieurs
types de couches différents. En voici la liste : *Blanc, Google,
Marqueurs, OSM, TMS, Vecteur, WMS*.

*Attributs communs*

| Nom   | Description                                 	| Obligatoire 	| Valeurs possibles     | Valeur défaut |
|-------|-----------------------------------------------|---------------|-----------------------|---------------|
|id	| Identifiant de la couche. Est utilisé pour accéder à celle-ci. Doit être unique.| Non| Chaîne alphanumérique| *couche\_ + index*|
|idbd	| Identifiant de la couche dans la BD. Représente le 'id' ou le 'mf\_layer\_name' de la couche| Non | Chaîne alphanumérique | |
|titre	| Titre de la couche. Est affiché dans l’arborescence.| Non   	|Chaîne alphanumérique	|		|
|protocole| Type de la couche				| Oui		|*Blanc*, *Google*, *Marqueurs*, *OSM*, *TMS*, *Vecteur*, *WMS*||
|fond	| Indique si la couche doit être considérée comme un fond de carte|Non|Booléen		| *false*	|
|echelleMin| Échelle minimum à laquelle la couche peut être affichée| Non	| Nombre entier supérieur à 0|	|
|echelleMax| Échelle maximum à laquelle la couche peut être affichée| Non	| Nombre entier supérieur à 0|	|
|groupe	| Groupe auquel appartient la couche dans l’arborescence| Non	| Chaîne alphanumérique	|		|
|visible| Indique si la couche doit être affichée dans l'arborescence| Non| Booléen		| *true*	|
|active | Indique si la couche doit être affichée sur la carte au démarrage du navigateur| Non| Booléen| *false*|
|opacite| Transparence de la couche 			| Non		| Nombre décimal entre 0 et 100| *1*	|
|ordreAffichage| Ordre d'affichage de la couche		| Non		| Nombre entier		| *Valeurs par défaut d’OpenLayers*|
|droit	| Indique les droits de la couche (Copyrights)	| Non		| Chaîne alphanumérique	| 		|
|metadonnee| Lien vers les métadonnées			| Non		| URL			|		|
|ordreArborescence| Ordre d'affichage de la couche dans le groupe de l'arborescence (1 étant le haut du groupe)| Non| Nombre entier|
|estInterrogeable|Indique si le getInfo doit être fait sur cette couche | Non | Booléen | true |

blanc
-----

Permet la définition d'une couche de fond blanche.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 	| Obligatoire 	| Valeurs possibles     | Valeur défaut |
|-------|-----------------------------------------------|---------------|-----------------------|---------------|
|titre	| Titre de la couche				|Non 		| Chaîne alphanumérique	|*Blanc*	|

*Exemples*
```xml
<couche protocole="Blanc"
couche id="idCoucheBlanc" titre="Fond blanc" protocole="Blanc"
fond="true" echelleMin="6000000" echelleMax="1" groupe="Test"
visible="true" active="faux" opacite="100" ordreAffichage="1"/>
<couche idbd="50"/>
<couche idbd="carte_gouv_qc"/>
```


Google
------

Permet la définition d'une couche de fond provenant de Google. Quatre
couches sont disponibles : *terrain, satellite, hybride* et *route*.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 	| Obligatoire 	| Valeurs possibles     | Valeur défaut |
|-------|-----------------------------------------------|---------------|-----------------------|---------------|
|nom	| Nom de la couche				|Non     	|*terrain*, *route*, *satellite*, *hybride*|*route*|
|titre	| Titre de la couche				|Non		|			| *Google*	|

*Exemples*
```xml
<couche protocole="Google"
couche id="idCoucheGoogle" titre="Google (satellite)"
protocole="Google" nom="satellite" fond="true" echelleMin="6000000"
echelleMax="1" groupe="Test" visible="true" active="faux" opacite="100"
ordreAffichage="1"/>
```


Marqueurs
---------

Permet la définition d'une couche de marqueurs.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
| titre	|Titre de la couche			      |   Non	    |Chaîne alphanumérique  |*marqueurs*    |

*Exemples*
```xml
<couche protocole="Marqueurs"
couche id="idCoucheMarqueurs" titre="Test marqueurs"
protocole="Marqueurs" fond="false" echelleMin="6000000" echelleMax="1"
groupe="Test" visible="true" active="faux" opacite="100"
ordreAffichage="1"/>
```


OSM
---

Permet la définition d'une couche de fond provenant d’OpenStreetMap.
Trois couches sont disponibles : *defaut, humanitaire*et*velo*.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     		| Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------------------|---------------|
|nom	|Nom de la couche			      |   Non	    |*defaut*, *humanitaire*, *velo*|*defaut*	|
|titre  |Titre de la couche			      |   Non	    |Chaîne alphanumérique  		|*OpenStreetMap*|

*Exemples*
```xml
<couche protocole="OSM"
couche id="idCoucheOSM" titre="OpenStreetMap (velo)" protocole="OSM"
nom="velo" fond="true" echelleMin="6000000" echelleMax="1" groupe="Test"
visible="true" active="faux" opacite="100" ordreAffichage="1"/>
```


TMS
---

Permet la définition d'une couche provenant d’un service de carte tuilé
(TMS).

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 	| Obligatoire 	| Valeurs possibles    	| Valeur défaut	|
|-------|-----------------------------------------------|---------------|-----------------------|---------------|
|url	|URL du service de carte tuilé		      	|Oui	    	|URL 		    	|  		|
|nom	|Nom de la couche                             	|Oui	    	|Chaîne alphanumérique  |		|
|titre	|           Titre de la couche			|Oui		|Chaîne alphanumérique	|		|
|format	|Format des image (png,jpg)	 			|Non		|Chaîne alphanumérique	|png		|
|impressionUrl|   URL du service à utiliser pour l’impression|   Non	|URL			|		|
|impressionNom|   Nom de la couche pour l’impression	|           Non	|Chaîne alphanumérique	|		|

*Exemples*
```xml
<couche
url="http://spssogl97d.sso.msp.gouv.qc.ca/cgi-wms/mapcache.fcgi/tms/"
nom="carte\_gouv\_qc\_ro@EPSG\_3857" titre="Gouvernement du Québec"
protocole="TMS"
couche id="idCoucheTMS"
url="http://spssogl97d.sso.msp.gouv.qc.ca/cgi-wms/mapcache.fcgi/tms/"
nom="carte\_gouv\_qc\_ro@EPSG\_3857" titre="Gouvernement du Québec"
protocole="TMS" fond="true" echelleMin="6000000" echelleMax="1"
groupe="Test" visible="true" active="faux" opacite="100"
ordreAffichage="1"
format="jpg"
impressionUrl="http://spssogl97d.sso.msp.gouv.qc.ca/cgi-wms/carte\_gouv\_qc.fcgi?"
impressionNom="CARTE\_GOUV\_QC"/>
```


Vecteur
-------

Permet la définition d'une couche de données vectorielles.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|titre	|Titre de la couche 			|Non		|Chaîne alphanumérique 	|*vecteur*|
|editable|Indique si la couche est éditable	|Non		|Booléen    	| *false* |
|supprimable|Indique si les occurences de la couche peuvent être supprimé|Non |Booléen |*false*|
|typeGeometriePermise|Indique les types de géométrie permise lors de l'édition|Non|Point, Ligne, Polygone, MultiLigne, MultiPoint, MultiPolygone||

*Exemples*
```xml
<couche protocole="Vecteur"
couche id="idCoucheVecteur" titre="Test vecteurs" protocole="Vecteur"
fond="false" echelleMin="6000000" echelleMax="1" groupe="Test"
visible="true" active="faux" opacite="100" ordreAffichage="1"/>
```


WMS
---

Permet la définition d'une couche provenant d’un service de carte (WMS).

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|url	|URL du service de carte		|Oui	|URL||
|nom	|Nom de la couche			|Oui	|Chaîne alphanumérique||
|titre	|Titre de la couche			|Non	|Chaîne alphanumérique|*Valeur de l’attribut nom*|
|extraParams|Paramètres supplémentaires à spécifier lors de l’appel au service de carte|Non|Chaîne alphanumérique||
|mapdir	|Chemin du mapfile à utiliser (dans le cas d’un service de carte publié avec MapServer)|Non (sauf dans le cas d’un service de carte publié avec MapServer)|Chaîne alphanumérique||
|impressionURL|URL du service de la carte|Non   |URL||
|mode|Intégrer l'ensemble des couches d'un service WMS|Non  |*getCapabilities*||
|infoFormat | Indique le format voulu pour l' *OutilInfo* qui sera affiché dans la fenêtre de résultats après le clique sur la couche dans la carte | Non| *gml*,*gml311*,*xml*,*html*| *gml*|
|infoEncodage | Indique l'encodage voulu dans la fenêtre de résultats pour l' *OutilInfo* sur la couche | Non| Chaîne alphanumérique| *UTF-8*|
|infoGabarit | Indique l'emplacement du script [Handlebars](https://github.com/wycats/handlebars.js#differences-between-handlebarsjs-and-mustache) avec l'extension *.html* qui sera apliqué dans la fenêtre de résultats sur l' *OutilInfo* après le clique sur la couche dans la carte ([exemple](https://github.com/bosthy/igo/blob/dev/interfaces/navigateur/public/template/handlebars.exemple.html),[ exemple simple](https://github.com/bosthy/igo/blob/dev/interfaces/navigateur/public/template/handlebars.exempleSimple.html)) | Non|  URL|
|infoUrl | Indique un url qui sera remplacer par l'url GetFeaturInfo de l' *OutilInfo* | Non| URL| |
|infoAction | Indique l'emplacement du script qui reçevra le résultats json du GetFeatureInfo de l' *OutilInfo* après le clique sur la couche dans la carte l'affichage sera géré par le script| Non| URL| |
|afficherMessageErreurUtilisateur| Permettre d'afficher un message générique à l'utilisateur quand la couche est en erreur. | Non | "True" | |

*Exemples*
```xml
   <couche protocole="WMS" mode="getCapabilities"
   url="http://geoegl.msp.gouv.qc.ca/cgi-wms/bdga.fcgi?" infoFormat="gml" />
```

```xml
  <couche titre="Région Administrative" protocole="WMS"
   url="http://sigeom.mrn.gouv.qc.ca/SIGEOM_WMS/Request.aspx?" nom="Region_Administrative"
   active="vrai" infoFormat="html"  />
```

```xml
    <couche titre="Stations hydrométriques - Seuil de conséquence (public)" protocole="WMS"
    url="http://geoegl.msp.gouv.qc.ca/cgi-wms/adnInternetV2.fcgi?" nom="adn_station_max_public_v"
    echelleMin="4000000" />
```

```xml
  <couche titre="Structures MTQ" url="http://www.dds.mtq.gouv.qc.ca/dds.aspx"
   nom="strct" protocole="WMS"  fond="false" echelleMin="6000000" echelleMax="1"
   visible="true" active="faux" opacite="100" ordreAffichage="1"/>
```

ArcGIS93Rest
---

Permet la définition d'une couche provenant d’un service rest de ArcGIS.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 	| Obligatoire 	| Valeurs possibles    	| Valeur défaut	|
|-------|-----------------------------------------------|---------------|-----------------------|---------------|
|url	|URL du service      	                	|Oui	    	|URL 		    	|  		|
|nom	|Nom de la couche                             	|Oui	    	|Chaîne alphanumérique  |		|
|titre	|           Titre de la couche			|Oui		|Chaîne alphanumérique	|		|

*Exemples*
```xml
<couche titre="ArcGis93Rest" protocole="ArcGIS93Rest" url="http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StateCityHighway_USA/MapServer/export" nom="0,1,2" />  
```

WFS
---

Permet la définition d'une couche provenant d’un service WFS.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 	| Obligatoire 	| Valeurs possibles    	| Valeur défaut	|
|-------|-----------------------------------------------|---------------|-----------------------|---------------|
|url	|URL du service      	                	|Oui	    	|URL 		    	|  		|
|nom	|Nom de la couche                             	|Oui	    	|Chaîne alphanumérique  |		|
|garderHistorique	|           Permet un historique des événements sur la couche			|Non		|Chaîne alphanumérique	|		|
|projection	|           Projection de la couche			|Non		|Chaîne alphanumérique	|Projection de la carte		|


*Exemples*
```xml
<couche titre="exemple WFS" protocole="WFS" url="http://geoegl.msp.gouv.qc.ca/cgi-wms/dpop.fcgi?" nom="dpop_criminalite_generale_v_s" />  
```

Actions
=======

*Balise XML : `actions`*

Liste des actions qui pourront être exécutés en réponse à certains
événements du navigateur (déclencheurs, outils, etc.). Contient la
déclaration de chacune des actions.


Action
------

*Balise XML : `action`*

Une action est une fonctionnalité du navigateur cartographique exposée
par la façade logicielle.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
id      |    Identifiant de l'action       |                                   Oui   |            Chaîne alphanumérique   ||
source  | Url du fichier Javascript contenant la/les fonctions à exposer |  Oui     |         URL      ||

*Exemples*
```xml
 <actions
 	<action id="acTest"
    		source="/igo\_navigateur/public/libs/testActionOutilsjs.js" />
</actions>
```


Déclencheurs
============

*Balise XML : `declencheurs`*

Liste des déclencheurs permettant d’être avisé lorsqu’un évènement est
exécuté dans le navigateur cartographique sur un objet dont il est
responsable.


Déclencheur
-----------

*Balise XML : `declencheur`*

Permet de définir un instance de déclencheur sur un évènement exécuté
dans le navigateur cartographique. Ce déclencheur peut être déclenché en
respectant certaines conditions en utilisant un filtre.

*Attributs ou valeurs spécifiques*

| Nom   | Description                                 | Obligatoire | Valeurs possibles     | Valeur défaut |
|-------|---------------------------------------------|-------------|-----------------------|---------------|
|id    |      Identifiant du déclencheur   | Non       |        Chaîne alphanumérique        |  *non défini* |
|evenement  | Évènement à surveiller|  Oui |  Chaîne alphanumérique ||
|avant    |   Indique si l’action doit être déclenchée avant l’événement | Non   | Booléen    | *false* |
|objet   |    Référence à l’objet sur lequel l’événement doit être surveillé.|Non   |       Chaîne alphanumérique  |*Igo.nav.evenements*
|@action | Référence à l’id de l’action à exécuter. Au besoin la sous fonction utilisée peut être ajouté à la suite de l'id. |   Oui |Chaîne alphanumérique Exemple: acTestAction acTestAction.fonctionfiltre||
|Filtre| à appliquer pour que le déclencheur fonctionne sur un élément spécifique.|Non |Objet selon {attribut1:'valeur1', attribut2:'valeur2'}  ||


*Exemples*
```xml
<declencheurs
    <declencheur id="testAjouterCouche" evenement="ajouterCouche"
        objet="Igo.nav.carte.gestionCouches"
        action="@actionTestAjouterCouche" />
    <declencheur id="testAjouterOcc" evenement="ajouterOccurence"
            filtre="{id:'couchePoint'}" objet="Igo.nav.evenements"
            action="@actionTestAjouterOcc" />
</declencheurs>
```

*Liste des évènements disponible présentement*:

|Classe|Évènement|
|------|---------|
|Vecteur|selectionnerOccurence deselectionnerOccurence deselectionnerTout ajouterOccurence enleverOccurence zoomerOccurence|
|GestionCouches|ajouterCouche enleverCouche|
|Recherche|appelerServiceRecherche|
|OutilDessin|executerBoutonDessin|

*Cette liste peut être bonifiée selon les besoins.*


Exemples de fichier de configuration XML
========================================


Configuration minimale XML
--------------------------

(avec contexte défini dans le fichier de configuration)

```xml
<navigateur authentification="false" titre="G.O.LOC - Données ouvertes - Gouvernement du Québec">
    <presentation>
           <panneaux>
                <panneau classe="PanneauCarte"  />
            </panneaux>
    </presentation>
    <contexte/>
    <couches>
        <couche id="carte_gouv_qc"/>
    </couches>
</navigateur>
```

![](media/image31.png)

Configuration minimale BD
-------------------------

(avec contexte chargé à partir de la BD)

```xml
<navigateur authentification="false" titre="G.O.LOC - Données ouvertes - Gouvernement du Québec">
    <presentation>
           <panneaux>
                <panneau classe="PanneauCarte" titre="" />
            </panneaux>
    </presentation>
    <contexte id="1"></contexte>
</navigateur>
```


Configuration Donnees ouvertes
------------------------------

```xml
<navigateur authentification="false" titre="G.O.LOC - Données ouvertes - Gouvernement du Québec">
    <presentation>
           <panneaux>
                <panneau classe="PanneauCarte" titre="" />
                 <panneau id="testInfoPanneau" classe="PanneauInfo" />
                 <panneau classe="PanneauEntete" image="/libcommunes/images/bandeau_donnees_ouv_goloc.png"/>

                <panneau classe="PanneauMenu" ouvert="true" >
                    <element-accordeon classe="Arborescence" ouvert="true"/>
                    <element-accordeon classe="Localisation">
                        <element classe="RechercheAdresse"/>
                        <element classe="RechercheLieu"/>
                        <element classe="RechercheGPS"/>
                        <element classe="RechercheBorne"/>
                    </element-accordeon>
                    <element-accordeon classe="Impression" ouvert="true"/>
                </panneau>

            </panneaux>
         <outils>
            <groupe-outils>
                <outil classe="OutilZoomEtendueMaximale"/>
                <outil classe="OutilZoomRectangle" type="avant"/>
                <outil classe="OutilZoomRectangle" type="arriere"/>
                <outil classe="OutilDeplacement"/>
            </groupe-outils>
            <groupe-outils>
                <outil classe="OutilHistoriqueNavigation" type="precedent"/>
                <outil classe="OutilHistoriqueNavigation" type="suivant"/>
            </groupe-outils>
             <groupe-outils>
                <menu titre="Zoom sur une région">
                    <outil classe="OutilZoomPreselection" type="region-adm" titre="Par région administrative"/>
                    <outil classe="OutilZoomPreselection" type="mrc" titre="Par MRC"/>
                    <outil classe="OutilZoomPreselection" type="mun" titre="Par municipalité"/>
                </menu>
            </groupe-outils>
            <groupe-outils>
                <outil classe="OutilMesure" type="lineaire"/>
                <outil classe="OutilMesure" type="surface"/>
            </groupe-outils>
            <groupe-outils>
                <outil classe="OutilInfo" />
            </groupe-outils>
	    <groupe-outils>
                <outil classe="OutilAide"/>
                <outil classe="OutilDeplacerCentre" />
            </groupe-outils>
            <groupe-outils position="droite" division="false">
                <outil classe="OutilAjoutWMS"/>
            </groupe-outils>
            <groupe-outils position="droite">
                <outil classe="OutilPartagerCarte"/>
            </groupe-outils>
        </outils>
    </presentation>
    <contexte id="1" centre="-7994004,6034079" zoom="7"></contexte>
    <couches>
        <groupe-couches groupe="Fond de carte">
            <couche id="geobase"
                    titre="Gouvernement du Québec"
                    url="/cgi-wms/mapcache.fcgi/tms/"
                    nom="carte_gouv_qc_ro@EPSG_3857"
                    fond="true" protocole="TMS"
                    active="vrai"
                    impressionUrl="/cgi-wms/carte_gouv_qc.fcgi?"
                    impressionNom="CARTE_GOUV_QC"
            />
            <couche titre="OpenStreetMap" protocole="OSM"/>
            <couche titre="OpenStreetMap-Humanitaire" protocole="OSM" nom="humanitaire"/>
            <couche titre="Fond blanc" protocole="Blanc"/>
        </groupe-couches>
    </couches>

</navigateur>
```

![](media/image32.png)

Configuration FADQ
-------------------

Contient des ajouts de composantes personnalisées.

```xml
<navigateur titre="G.O.LOC - Données ouvertes - Gouvernement du Québec">
    <presentation>
           <panneaux>
                <panneau classe="PanneauCarte"/>
                <panneau id="panBasPanel" classe="PanneauAccordeon" dimension="400" minDimension="120" position="sud" ouvert="true">
                    <element-accordeon id="panInfoPanel" classe="PanneauInfo"/>
                    <element-accordeon classe="PanneauOngletParcelles" urlModule="public/ModuleExterne/FADQ/PanneauBas/panneauOngletParcelles"/>
                    <element-accordeon classe="PanneauOngletSchema" urlModule="public/ModuleExterne/FADQ/PanneauBas/panneauOngletSchema"/>
                    <element-accordeon classe="PanneauOngletGeometries" urlModule="public/ModuleExterne/FADQ/PanneauBas/panneauOngletGeometries"/>
                    <element-accordeon classe="PanneauRegroupement"/>
                    <element-accordeon classe="PanneauOngletEdition"/>
                </panneau>

                <panneau classe="PanneauMenu" ouvert="true" >
                    <element-accordeon classe="Arborescence" ouvert="true"/>
                    <element-accordeon classe="Localisation">
                        <element classe="RechercheClient" urlModule="public/ModuleExterne/FADQ/Recherche/rechercheClient"/>
                        <element classe="RechercheCadastre" urlModule="public/ModuleExterne/FADQ/Recherche/rechercheCadastre"/>
                        <element titre="Cadastre Rénové" classe="RechercheCadastreReno"/>
                        <element classe="RechercheAdresse"/>
                        <element classe="RechercheLieu"/>
                    </element-accordeon>
                    <element-accordeon classe="Edition"/>
                  <!--  <element-accordeon classe="Impression" ouvert="true"/> -->
                </panneau>
            </panneaux>
         <outils>
           <groupe-outils>
                <outil classe="OutilZoomEtendueMaximale"/>
                <outil classe="OutilZoomRectangle" type="avant"/>
                <outil classe="OutilZoomRectangle" type="arriere"/>
                <outil classe="OutilDeplacement"/>
            </groupe-outils>
            <groupe-outils>
                <outil classe="OutilHistoriqueNavigation" type="precedent"/>
                <outil classe="OutilHistoriqueNavigation" type="suivant"/>
            </groupe-outils>
             <groupe-outils>
                <outil classe="OutilMesure" type="lineaire"/>
                <outil classe="OutilMesure" type="surface"/>
                <outil classe="OutilAnalyseSpatiale" />
                <outil classe="OutilInfo" />
                <outil classe="OutilZoomPreselection" type="region-adm"/>
            </groupe-outils>
            <groupe-outils visible="true">
                <outil classe="OutilAide"/>
                 <outil classe="OutilRapporterBogue" />
                <outil classe="OutilDessin" />
            </groupe-outils>
            <groupe-outils position="droite" visible="true">
                <outil classe="OutilAjoutWMS"/>
          <!--      <outil classe="OutilPartagerCarte"/> -->
            </groupe-outils>
             <groupe-outils position="droite" visible="true">

                <outil id="idOutilSelectionMulti" classe="OutilSelectionMulti"/>
                <!-- ATTENTION AU ID trop long! idOutilZoomerSelection est trop long! -->
                <outil id="idOutilZoomerSel" classe="OutilZoomerSelection"/>
                <outil id="idOutilPression" classe="OutilPression"/>
                <outil id="idOutilAffLibel" classe="OutilAffichageLibelle"/>
                <outil id="idOutilImportShapeFile" classe="OutilImportShapeFile"/>
              <!--  <outil id="idOutilDessinPoint" classe="OutilDessinPoint"/>  -->

                <outil id="idOutilGPSImport" classe="OutilGPSImport" icone="public/ModuleExterne/images/gps_down.png" urlModule="public/ModuleExterne/UX/Outils/GPS/outilGPSImport"/>
                <outil id="idOutilGPSExport" classe="OutilGPSExport" icone="public/ModuleExterne/images/gps_up.png" urlModule="public/ModuleExterne/UX/Outils/GPS/outilGPSExport"/>
                <outil id='buttonExportToShape' classe="OutilFichierShapeFile" icone="public/ModuleExterne/images/icone_export_shp.png" urlModule="public/ModuleExterne/UX/Outils/Fichier/outilFichierShapeFile"/>
          </groupe-outils>
        </outils>
    </presentation>
    <base>
    </base>
    <contexte id="1" mode="l" position="74.012,26.00;EPSG:4326" zoom="7"></contexte>
         <couches>
             <couche titre="Fond blanc" protocole="Blanc" groupe="Fond de carte"/>
            <couche id="SCW" titre="SCW-Toporama" url="http://wms.sst-sw.rncan.gc.ca/wms/toporama_fr?LAYERS=SCW-Toporama"
                    nom="SCW" fond="true" groupe="Fond de carte" protocole="WMS" active="true"/>
            <couche id="cbct" titre="Carte de base du Canada - Transport" url="http://geogratis.gc.ca/cartes/CBCT?"
                    nom="cbct" fond="true" groupe="Fond de carte" protocole="WMS" />
            <couche id="BDTQ" titre="BDTQ" url="http://geoegl.msp.gouv.qc.ca/cgi-wms/bdtq.fcgi"
                    nom="BDTQ" fond="true" groupe="Fond de carte" protocole="WMS" />
        </couches>
        <couches>
            <!--TODO mettre les couches visible="false" -->
            <couche id="couchePoint" titre="Points" protocole="Vecteur" groupe="Couches de traitement" active="true" visible="true"/>
            <couche id="coucheLigne" titre="Lignes" protocole="Vecteur" groupe="Couches de traitement" active="true" visible="true"/>
            <couche id="coucheSurface" titre="Surfaces" protocole="Vecteur" groupe="Couches de traitement" active="true" visible="true"/>
            <couche id="coucheParcelles" titre="Parcelles" protocole="Vecteur" groupe="Couches de traitement" active="true" visible="true"/>
        </couches>
</navigateur>
```

![](media/igo_avec_edition.png)


Configuration maximale
----------------------

```xml
```
