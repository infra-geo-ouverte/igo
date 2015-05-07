# VERSION BÊTA

# Infrastructure Géomatique Ouverte (IGO) / Open GIS Infrastructure
### Qu'est-ce qu'IGO ?
Le projet IGO (Infrastructure Géomatique Ouverte) est une communauté de pratique qui regroupe des spécialistes en géomatique issues de plusieurs organismes et ministères du gouvernement du Québec. IGO a vu le jour en 2014 et il se concrétise par des avancées et des valeurs ajoutées remarquables, au plus grand bénéfice de ses utilisateurs, principalement des partenaires du gouvernement. 
Ce projet constitue un travail, entre autres, du gouvernement du Québec sujet aux droits d'auteurs, mais il n'est pas exclusif au gouvernement du Québec. 
D'ailleurs, tous les contributeurs externes au gouvernement du Québec au projet IGO pourront conserver leurs droits d'auteurs en acceptant de les partager selon les mêmes termes de la LICENCE d'IGO. 
***
### What is IGO ?
This IGO (for Open GIS Infrastructure) project involved 6 organisations in Quebec, Canada.
IGO is an evolution of an internal Web GIS project at the government of Quebec and the objective to make it more open, common, modular and based on open source and governance model with multiple organisations outside the government of Quebec.
Since this project is open source, anyone can contribute as lons as they share their work on the same open source licence. 
All contributors in the project will keep their property rights on the project.
***
### Les développements complétés et planifiées d'IGO ?
* Navigateur cartographique : configuration par fichier XML
* Arborescence de couches WMS : configuration par fichier XML & base de données
* Édition en ligne : support des bases de données PostgreSQL et Oracle
* Analyse spatiale : WFS & Zoo Project
* Détermination de parcours : Open Source Routing Machine
* Gestion des métadonnées : GeoNetwork et PostgreSQL
* Localisation : Service web, Rest et SOAP
* IGO avec façade XML (API) s'appuyant sur : JavaScript & Phalcon
* Dépendence d'IGO à OpenLayers 2, GeoExt et UMN MapServer
* IGO avec façade XML (API) est basé sur le Modèle-Vue-Contrôleur
* Adapté au changement de librairies externes (ex. OpenLayers 3, Leaflet).

***
### IGO Development completed and planned:
* Web GIS viewer: XML file config
* Layer tree Manager and security: XML file & database configuration
* Editing tools based on WFS, but as GeoJSON service
* Spatial Analysis Service - WFS & WPS with Zoo project
* Routing Service - OSRM with gov data
* Metadata Service - GeoNetwork - PostgreSQL
* Geocoding Service - as PHP Service - SOAP
* IGO is an API on top of JavaScript & Phalcon
* IGO depends on UMN MapServer
* XML config on top of OpenLayers two, GeoExt 1.0
* Adapted to change backend libraries (OL3, Leaflet)
* Made also for integration in web site/portal as iframe
* IGO is an API based on MVC

# Installation et démarrage de l'environnement de développement

Guide d'installation rapide pour installer et démarrer la machine virtuelle pour tester et/ou développer dans IGO.

## Installation

Cette procédure a été testée avec un système d'exploitation Ubuntu 14.04. Elle permet d'installer Vagrant avec comme provider VirtualBox.

```sh
$ sudo apt-get install virtualbox
$ wget https://dl.bintray.com/mitchellh/vagrant/vagrant_1.7.2_x86_64.deb
$ sudo dpkg -i vagrant_1.7.2_x86_64.deb
$ vagrant plugin install vagrant-r10k
```
* Sur Windows, il suffit de télécharger et installer VirtualBox (https://www.virtualbox.org/wiki/Downloads) et Vagrant (https://dl.bintray.com/mitchellh/vagrant/vagrant_1.7.2.msi) et ensuite le plugin vagrant-r10k (en ligne de commande). Le reste de la procédure pour démarrer la machine virtuelle demeure la même (en ligne de commande Windows).

## Démarrage

À la racine de votre dépôt git (où se trouve le fichier Vagrantfile), exécutez la commande suivante:

```sh
$ vagrant up
```

Cela prendra plusieurs minutes la première fois (téléchargement de l'image ubuntu/trusty64) et environ 2 minutes par la suite.


Documentation Vagrant: **http://docs.vagrantup.com/v2/cli/index.html**

## Accès avec le navigateur web

IGO-Navigateur: **http://localhost:4579/navigateur/**
