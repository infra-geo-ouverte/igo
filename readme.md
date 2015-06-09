# VERSION BÊTA

# Infrastructure Géomatique Ouverte (IGO) / Open GIS Infrastructure

### Qu'est-ce qu'IGO ?
Le projet IGO (Infrastructure Géomatique Ouverte) est une communauté de pratique qui regroupe des spécialistes en géomatique issus de plusieurs organismes et ministères du gouvernement du Québec. IGO a vu le jour en 2014 et il se concrétise par des avancées et des valeurs ajoutées remarquables, au plus grand bénéfice de ses utilisateurs, principalement des partenaires du gouvernement. 
Ce projet constitue un travail, entre autres, du gouvernement du Québec sujet aux droits d'auteurs, mais il n'est pas exclusif au gouvernement du Québec. 
D'ailleurs, tous les contributeurs externes au gouvernement du Québec au projet IGO pourront conserver leurs droits d'auteurs en acceptant de les partager selon les mêmes termes de la [LICENCE](LICENCE.txt) d'IGO. 
***
### What is IGO ?
This IGO (for Open GIS Infrastructure) project involved 6 organisations in Quebec, Canada.
IGO is an evolution of an internal Web GIS project at the government of Quebec and the objective to make it more open, common, modular and based on open source and governance model with multiple organisations outside the government of Quebec.
Since this project is open source, anyone can contribute as long as they share their work on the same open source [LICENCE LGPL-Style](LICENSE_ENGLISH.txt). 
All contributors in the project will keep their property rights on the project.

***
### Installation et démarrage

Guide d'installation rapide pour installer et démarrer une machine virtuelle préconfigurée pour tester et/ou développer dans IGO.

#### Installation

Cette procédure a été testée avec un système d'exploitation Ubuntu 14.04. Elle permet d'installer Vagrant avec comme provider VirtualBox.

> **Note pour les utilisateurs de Windows**

> La documentation pour l'installation sous Windows avec Vagrant est disponible [ici](doc/installation/windowsInstall.md).

Entrez les commandes suivantes dans un terminal:

```sh
$ sudo apt-get install virtualbox
$ wget https://dl.bintray.com/mitchellh/vagrant/vagrant_1.7.2_x86_64.deb
$ sudo dpkg -i vagrant_1.7.2_x86_64.deb
$ vagrant plugin install vagrant-r10k
```

#### Démarrage

À la racine de votre dépôt git (où se trouve le fichier Vagrantfile), exécutez la commande suivante:

```sh
$ vagrant up
```

Cela prendra plusieurs minutes la première fois (téléchargement de l'image ubuntu/trusty64) et environ 2 minutes par la suite.

Vous pouvez maintenant accéder au IGO-Navigateur!

Documentation Vagrant: **http://docs.vagrantup.com/v2/cli/index.html**

#### Accès avec le navigateur web

IGO-Navigateur: **http://localhost:4579/navigateur/**
***
### Installation and start-up

Quick installation and start-up guide to install and start a VM to test and/or develop in IGO.

#### Installation

These steps has been tested with Ubuntu 14.04. It allows to install Vagrant with VirtualBox as a provider.

> **Note for Windows users**

> Windows documentation to install IGO with Vagrant is available [here](doc/installation/windowsInstall.md).

```sh
$ sudo apt-get install virtualbox
$ wget https://dl.bintray.com/mitchellh/vagrant/vagrant_1.7.2_x86_64.deb
$ sudo dpkg -i vagrant_1.7.2_x86_64.deb
$ vagrant plugin install vagrant-r10k
```

#### Start-Up

At the root of your git repository (where is the Vagrantfile), enter following command:

```sh
$ vagrant up
```

It will take a few time for the first start-up (mostly because of ubuntu/trusty64 box download) and about 2 minutes thereafter.

You can now access the IGO-Navigator!

Vagrant Documentation: **http://docs.vagrantup.com/v2/cli/index.html**

#### Navigator Web Access

IGO-Navigator: **http://localhost:4579/navigateur/**
***
### Les développements complétés et planifiés d'IGO :
* Navigateur cartographique : configuration par fichier XML sans avoir à connaitre un langage de programmation
* Arborescence de couches WMS : configuration par fichier XML & base de données
* Édition en ligne : support des bases de données PostgreSQL et Oracle
* Analyse spatiale : WFS & Zoo Project
* Détermination de parcours : Open Source Routing Machine
* Gestion des métadonnées : GeoNetwork et PostgreSQL
* Localisation : Service web, Rest et SOAP
* IGO avec façade XML (API) s'appuyant sur du code : JavaScript & PHP dans Phalcon
* Projets libres connexes et ré-utilisés au sein d'IGO : [OpenLayers 2](https://github.com/openlayers/openlayers), [ExtJS](http://docs.sencha.com/extjs/3.4.0/), [GeoExt](http://geoext.org/downloads.html),  [JQuery](https://github.com/jquery/jquery) et [UMN MapServer](https://github.com/mapserver/mapserver)
* IGO avec façade XML (API) est basé sur le Modèle-Vue-Contrôleur
* Adapté au changement de librairies externes futurs (ex. OpenLayers 3, Leaflet).

***
### IGO Development completed and/or planned:
* Web GIS viewer: XML file config
* Layer tree Manager and security: XML file & database configuration
* Editing tools based on WFS, but as GeoJSON service
* Spatial Analysis Service - WFS & WPS with Zoo project
* Routing Service - OSRM with gov data
* Metadata Service - GeoNetwork - PostgreSQL
* Geocoding Service - as PHP Service - SOAP
* IGO is an API on top of JavaScript & Phalcon
* External projects and used by IGO: [OpenLayers 2](https://github.com/openlayers/openlayers), [ExtJS](http://docs.sencha.com/extjs/3.4.0/), [GeoExt](http://geoext.org/downloads.html),  [JQuery](https://github.com/jquery/jquery) and [UMN MapServer](https://github.com/mapserver/mapserver)
* Adapted to change future backend libraries (OL3, Leaflet)
* Made also for integration in web site/portal as iframe
* IGO is an API based on MVC

***
### Contribuer
Nous sommes bien content que vous pensiez contribuer à IGO ! Avant de le faire, nous vous encourageons à lire le guide de contribution, la LICENCE et la FAQ qui sont tous dans ce même dépôt. Si vous avez d'autres questions, n'hésitez pas à écrier à IGO à ce courriel : info(a)igouverte.org ou à la liste courriel http://listes.securitepublique.gouv.qc.ca/sympa/info/igo-publique.

***
### Contribution
If you have any question and want to contribute, contact the main email of the project: info(a)igouverte.org or subscribe to the mailing-list (http://listes.securitepublique.gouv.qc.ca/sympa/info/igo-publique) mainly in French, but do not hesitate to ask questions in English, most of the IGO Team is bilingual. The documentation and API-XML is mainly in French, but if there is a demand, the project can be translate if needed, just contact us for more information at: info(a)igouverte.org
