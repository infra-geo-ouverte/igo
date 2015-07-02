### Installation d'une machine virtuelle avec Vagrant depuis Windows

Cette documentation a été testée avec Windows 8.1.

Sur Windows, il suffit de télécharger et installer:

* [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
* [Vagrant](https://dl.bintray.com/mitchellh/vagrant/vagrant_1.7.2.msi)
* [Git for Windows](https://msysgit.github.io/)

le plugin vagrant-r10k: 

```sh
$ vagrant plugin install vagrant-r10k
``` 

Au niveau de la configuration de Git, assurez-vous d'avoir l'option core.autocrlf = input. Pour ce faire, dans Git Bash, faites la commande suivante (à effectuer la première fois seulement): 

```sh
$ git config --global core.autocrlf input
```

#### Démarrage

À la racine de votre dépôt git (où se trouve le fichier Vagrantfile), exécutez la commande suivante **en utilisant Git Bash**:

```sh
$ vagrant up
```

***

### Installation of virtual machine with Vagrant from Windows host

This has been tested on Windows 8.1.

On Windows, you only need to download and install:

* [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
* [Vagrant](https://dl.bintray.com/mitchellh/vagrant/vagrant_1.7.2.msi)
* [Git for Windows](https://msysgit.github.io/)

and vagrant-r10k plugin: 

```sh
$ vagrant plugin install vagrant-r10k
``` 

About Git configuration, be sure to have the option core.autocrlf = input. In Git Bash, execute the following command (first time only): 

```sh
$ git config --global core.autocrlf input
```

#### Start-Up

At the root of your git repository (where is the Vagrantfile), enter following command **using Git Bash**:

```sh
$ vagrant up
```
