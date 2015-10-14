# Infrastructure géomatique ouverte (IGO) / Open GIS Infrastructure
***

### Qu'est-ce qu'[IGO](http://igouverte.org/)?
IGO est une solution Web gratuite en géomatique. Consultez le site Web d'IGO pour en savoir davantage: [http://igouverte.org/](http://igouverte.org/).
Elle permet de tirer profit d’une multitude de données géographiques grâce à une interface cartographique accessible par un navigateur Web.
Les membres du public en géomatique et du Web qui soumettent des contributions conservent leurs droits d'auteur s'ils partagent leur code source selon la [LICENCE LiLiQ-R de type LGPL](LICENCE.txt).
IGO est un produit du gouvernement du Québec (Canada) et issu d’un travail collaboratif basé sur la philosophie des logiciels libres et ouverts (« open source »). Vous pouvez voir un exemple de l'interface d'IGO-Navigateur en action sur le site des données ouvertes du gouvernement du Québec et un exemple de son XML pour une configuration de base : [http://igouverte.org/demo/](http://igouverte.org/demo/).

***
### What is [IGO](http://igouverte.org/english/)?
IGO (for Open GIS Infrastructure) is a free Web Geospatial solution developed in Quebec, Canada. See this Web site for more information: [http://igouverte.org/english/](http://igouverte.org/english/).
IGO has multiple features, such as Web GIS viewer, layer tree Manager and many more at [http://igouverte.org/english/](http://igouverte.org/english/).
Since this project is open source, anyone can contribute as long as they share their work on the same open source [LICENCE LGPL-Style](LICENSE_ENGLISH.txt). All contributors in IGO keep their property rights. You can see an example here on this Open Data web viewer of the government of Quebec: [http://geoegl.msp.gouv.qc.ca/gouvouvert/](http://geoegl.msp.gouv.qc.ca/gouvouvert/).

***

---
## Table des matières

- [Installation recommandée](#installation-et-démarrage)
- [Autres installations](http://igouverte.org/installation/)
- [Documentation](http://igouverte.org/documentation/)
- [Modules et technologies](#modulesservices-et-technologies-)
- [Contribuer](#contribuer)


***

---
## Table of Contents

- [Installation](#installation-and-start-up)
- [Documentation (mostly in French)](http://igouverte.org/documentation/)
- [Development](#igo-development-completed-andor-planned)
- [Contribution](#contribution)


### Installation et démarrage

Guide d'installation rapide pour installer et démarrer une machine virtuelle préconfigurée pour tester et/ou développer dans IGO.

#### Installation

Cette procédure a été testée avec un système d'exploitation *Ubuntu 14.04*. Elle permet d'installer Vagrant avec comme provider VirtualBox.

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

IGO-Navigateur (en se connectant en tant qu'invité): **http://localhost:4579/navigateur/**
***
### Installation and start-up

Quick installation and start-up guide to install and start a VM to test and/or develop in IGO.

#### Installation

These steps has been tested with *Ubuntu 14.04*. It allows to install Vagrant with VirtualBox as a provider.

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

You can now access the IGO-Viewer!

Vagrant Documentation: **http://docs.vagrantup.com/v2/cli/index.html**

#### Navigator Web Access

IGO-Navigator (to connect as guest, click on "en tant qu'invité"): **http://localhost:4579/navigateur/**

***

### Modules/services et technologies :
- [Modules et services supportés ou en développement](http://igouverte.org/documentation/module/)
- [Technologies intégrées et utilisées par la communauté IGO](http://igouverte.org/documentation/techno/)

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
Nous sommes bien heureux que vous pensiez contribuer à IGO! Avant de le faire, nous vous encourageons à lire le guide de [contribution](http://igouverte.org/contribuer/), la [LICENCE](LICENCE.txt) et la [FAQ](http://igouverte.org/faq/). Si vous avez d'autres questions, n'hésitez pas à communiquer avec nous à l'adresse suivante : info(a)igouverte.org ou à vous inscrire à la liste [courriel](http://listes.securitepublique.gouv.qc.ca/sympa/info/igo-publique).

***
### Contribution
If you have any question and want to contribute, contact the main email of IGO: info(a)igouverte.org or subscribe to the mailing-list (http://listes.securitepublique.gouv.qc.ca/sympa/info/igo-publique) mainly in French, but do not hesitate to ask questions in English, most of the IGO Team is bilingual. The documentation and API-XML is mainly in French, but if there is a demand, the project can be translate if needed, just contact us for more information at: info(a)igouverte.org
