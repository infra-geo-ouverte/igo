Titre du projet : **Environnement de développement IGO sur Windows 7**

 

Document de travail en réalisation

Version 1.0

Date de dernière mise à jour : 2015-06-01

 

Vue d’ensemble - Environnement de développement sur Windows 7
=============================================================

### Configurations

-   Windows 7 64 bits

### Ordonnancement du processus d’installation

1.  Installation de WampServer (64 Bits & PHP 5.5) 2.5

2.  Installation de Java

3.  Installation de NetBeans 8.0 HTML5 & PHP

4.  Installation de Phalcon 1.3.1 - Windows x64 for PHP 5.5.0 (VC11)

5.  Installation de Git

6.  Obtenir le code de GitLab

Procédures d’installation
=========================

Installation de WampServer
--------------------------

### Pré-requis

-   Aucun

### Procédures d’installation

#### Télécharger WampServer (64 bits & PHP 5.5) 2.5

<http://www.wampserver.com/>

![](<MarkdownImage/image1.png>)

#### Installler WampServer

![](<MarkdownImage/image2.png>)

![](<MarkdownImage/image3.png>)

![](<MarkdownImage/image4.png>)

![](<MarkdownImage/image5.png>)

![](<MarkdownImage/image6.png>)

![](<MarkdownImage/image7.png>)

![](<MarkdownImage/image8.png>)

![](<MarkdownImage/image9.png>)

**Facultatif :** Désactiver le service de MySql puisque pas utilisé.

Panneaux de configuration - Outils d’administration – Services

![](<MarkdownImage/image10.png>)

**Facultatif pour poste avec IIS :** Ouvrir le fichier de configuration de
apache.

![](<MarkdownImage/image11.png>)

#### Éditer le fichier de configuration du serveur apache pour fonctionner sur le port 8080 puisque IIS fonctionne sur le port 80.

![](<MarkdownImage/image12.png>)

### Éditer le fichier de configuration du serveur apache pour ajouter les alias nécessaires à IGO.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Alias /api "C:/wamp/www/igo/interfaces/navigateur/api"
    Alias /librairie "C:/wamp/www/igo/librairie"    
    Alias /pilotage "C:/wamp/www/igo/pilotage"
    Alias /navigateur "C:/wamp/www/igo/interfaces/navigateur"
     
     <Directory "C:/wamp/www/igo/interfaces/navigateur/api">
      <IfModule mod_rewrite.c>
          RewriteEngine On
          RewriteCond %{RQUEST_FILENAME} !-f
          RewriteRule ^(.*)$ index.php?_url=/$1 [QSA,L]
        </IfModule>
     </Directory>
     
  
    <Directory C:/wamp/www/igo/interfaces/navigateur/>
    <IfModule mod_rewrite.c>
            RewriteEngine on
            RewriteRule  ^$ public/    [L]
            RewriteRule  (.*) public/$1 [L]
    </IfModule>
    </Directory>

    <Directory C:/wamp/www/igo/interfaces/navigateur/public/>
        AddDefaultCharset UTF-8
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteRule ^(.*)$ index.php?_url=/$1 [QSA,L]
        </IfModule>
    </Directory>
    
   <Directory C:/wamp/www/igo/pilotage/>
    <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteRule  ^$ public/    [L]
            RewriteRule  (.*) public/$1 [L]
    </IfModule>
    php_value max_input_vars 2000
    </Directory>

    <Directory C:/wamp/www/igo/pilotage/public/>
        AddDefaultCharset UTF-8
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteRule ^(.*)$ index.php?_url=/$1 [QSA,L]
        </IfModule>
    </Directory>
     
 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

#### Faire un restart All Services

![](<MarkdownImage/image13.png>)

#### Tester que le serveur fonction en accèdant à la page <http://localhost:8080/>

![](<MarkdownImage/image14.png>)

#### Ajouter répertoire de PHP « C:\\wamp\\bin\\php\\php5.5.12 » à la variable d’environnement « Path »

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Références :

<http://php.net//manual/fr/install.windows.extensions.php>

<http://php.net/manual/en/ldap.installation.php>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

![](<MarkdownImage/image15.png>)

#### Activer le module rewrite dans Apache :

![](<MarkdownImage/image16.png>)

#### Activer le driver pour postgis dans PHP :

![](<MarkdownImage/image17.png>)

 

Installation de Java
--------------------

#### Pré-requis

-   Aucun

#### Procédures d’installation

**Facultatif** : L’installation de NetBeans demande d’avoir au minimum la
version 7 de Java.

Télécharger Java version 7 minimum puisque NetBeans a besoin d’avoir cette
version au minimale.

<http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html>

![](<MarkdownImage/image18.png>)

#### Installer Java

![](<MarkdownImage/image19.png>)

![](<MarkdownImage/image20.png>)

![](<MarkdownImage/image21.png>)

![](<MarkdownImage/image22.png>)

![](<MarkdownImage/image23.png>)

![](<MarkdownImage/image24.png>)

 

Installation de NetBeans
------------------------

#### Pré-requis

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Windows 7 64 bits

Java version 7 minimum
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

#### Procédures d’installation

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Télécharger NetBeans 8.0 HTML5 & PHP

<https://netbeans.org/>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

![](<MarkdownImage/image25.png>)

#### Installer NetBeans

![](<MarkdownImage/image26.png>)

![](<MarkdownImage/image27.png>)

![](<MarkdownImage/image28.png>)

![](<MarkdownImage/image29.png>)

![](<MarkdownImage/image30.png>)

![](<MarkdownImage/image31.png>)

 

Installation de Phalcon
-----------------------

#### Pré-requis

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Aucun
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

#### Procédures d’installation

 

Télécharger Phalcon 1.3.1 - Windows x64 for PHP 5.5.0 (VC11)

<http://www.phalconphp.com/en/download/windows>

![](<MarkdownImage/image32.png>)

Dézipper le fichier téléchargé et copier le fichier php\_phalcon.dll dans le
répertoire C:\\wamp\\bin\\php\\php5.5.12\\ext

![](<MarkdownImage/image33.png>)

Ouvrir le fichier php.ini.

![](<MarkdownImage/image34.png>)

Éditer le fichier php.ini pour ajouter l’extension Phalcon

![](<MarkdownImage/image35.png>)

Faire un restart All Services

![](<MarkdownImage/image36.png>)

Vérifier que Phalcon est installé

![](<MarkdownImage/image37.png>)

 

Installation de Git
-------------------

#### Pré-requis

Aucun

#### Procédures d’installation

Télécharger Git

<http://www.git-scm.com/>

Installer Git

![](<MarkdownImage/image38.png>)

![](<MarkdownImage/image39.png>)

![](<MarkdownImage/image40.png>)

Prendre les composantes par défaut

![](<MarkdownImage/image41.png>)

![](<MarkdownImage/image42.png>)

![](<MarkdownImage/image43.png>)

![](<MarkdownImage/image44.png>)

![](<MarkdownImage/image45.png>)

![](<MarkdownImage/image46.png>)

 

Obtenir le code de GitHub  et GitLab
------------------------------------

#### Pré-requis

Avoir fait les installations précédentes.

#### Procédures d’installation

Aller dans le répertoire C:\\wamp\\www

Aller dans le répertoire C:\\wamp\\www et faire Git Bash dans le menu
contextuel :

![](<MarkdownImage/image47.png>)

**Obtenir le code de l’application de igo**

**Le dépôt officiel est disponible ici :**
<https://github.com/infra-geo-ouverte/igo/>

Si vous n’avez pas de compte GitHub  faite la demande auprès :
<https://github.com/join>

Faire la ligne de commande suivante pour créer le répertoire pilotage et obtenir
le code de GitHub :

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
git clone https://github.com/infra-geo-ouverte/igo.git
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

![](<MarkdownImage/image48.png>)

 

 

![](<MarkdownImage/image49.png>)

Si c’est le code de la branche « master », changer la branche de « master » pour
« dev » avec la ligne de commande suivante :

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
git checkout dev
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

![](<MarkdownImage/image50.png>)

**Obtenir le code des librairies**

Aller dans le répertoire C:\\wamp\\www\\igo et faire Git Bash dans le menu
contextuel :

Faire la ligne de commande suivante pour créer le répertoire navigateur et
obtenir le code de GitLab :

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
git clone https://github.com/infra-geo-ouverte/igo-lib.git librairie
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

![](<MarkdownImage/image51.png>)

Faire la ligne commande suivante et vérifier que c’est le code de la branche de
« dev » et non « master » entre parenthèses :

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
cd librairie
git checkout dev

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Configuration du projet navigateur
----------------------------------

#### Pré-requis

Avoir le code du projet navigateur.

#### Procédures d’installation

Ouvrir le fichier de configuration du navigateur « config.php » du répertoire
« C:\\wamp\\www\\igo\\interfaces\\navigateur\\app\\config » :

![](<MarkdownImage/image52.png>)

Modifier la ligne "../../../config/config.php" si nécessaire :

![](<MarkdownImage/image53.png>)

Copier à partir d’un exemple disponible dans le dossier
« C:\\wamp\\www\\igo\\config »

Ensuite renommer le fichier de configuration du navigateur « config.php »

![](<MarkdownImage/image54.png>)

Modifier 'Postgresql', 'host', 'user', 'password', 'dbname' par les informations
de connexion de votre base de données Postgresql IGO pour votre poste :

![](<MarkdownImage/image55.png>)

Modifier la section 'uri' afin d'accéder le bon dossier sur votre poste :

![](<MarkdownImage/image56.png>)

Ouvrir l’url IGO : <http://localhost:8080/navigateur/>

![](<MarkdownImage/image57.png>)

 

Créer les projets navigateur, pilotage et services NetBeans
-----------------------------------------------------------

#### Pré-requis

Avoir fait les installations précédentes.

#### Procédures d’installation

Ouvrir NetBeans et créer le projet navigateur :

![](<MarkdownImage/image58.png>)

![](<MarkdownImage/image59.png>)

![](<MarkdownImage/image60.png>)

![](<MarkdownImage/image61.png>)

Choisir le bon port.

Refaire les mêmes étapes pour le pilotage et les services.

 

Configuration optionnelle background scanning
---------------------------------------------

#### Pré-requis

Avoir fait les installations précédentes.

#### Procédures d’installation

Pour le problème de « background scannig » qui gèle l’IDE de NetBeans.

Modifier le fichier de configuration « C:\\Program Files\\NetBeans
8.0\\etc\\netbeans.conf » et ajouter les paramètres suivant à
« netbeans\_default\_options= » :

+------------------------------------------+
| netbeans\_default\_options="-J-client    |
| -J-Xss2m -J-Xmx512m -J-XX:PermSize=128m  |
| -J-Dapple.laf.useScreenMenuBar=true      |
| -J-Dapple.awt.graphics.UseQuartz=true    |
| -J-Dsun.java2d.noddraw=true              |
| -J-Dsun.java2d.dpiaware=true             |
| -J-Dsun.zip.disableMemoryMapping=true    |
| -J-XX:+UseConcMarkSweepGC                |
| -J-XX:+CMSClassUnloadingEnabled          |
| -J-XX:+CMSPermGenSweepingEnabled         |
| -J-Djava.net.preferIPv4Stack=true"       |
+------------------------------------------+

 

Référence :

<http://wiki.netbeans.org/FaqScanningAndIndexingPerformanceHints>

![](<MarkdownImage/image62.png>)

![](<MarkdownImage/image63.png>)

 

Configuration activation du debbuger pour NetBeans
--------------------------------------------------

#### Pré-requis

Avoir fait les installations précédentes.

#### Procédures d’installation

Ouvrir le fichier php.ini

![](<MarkdownImage/image64.png>)

 

Éditer le fichier php.ini pour activer le debbuger :

Référence :

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<http://wiki.netbeans.org/HowToConfigureXDebug#Steps>

; XDEBUG Extension

zend\_extension =
"c:/wamp/bin/php/php5.5.12/zend\_ext/php\_xdebug-2.2.5-5.5-vc11-x86\_64.dll"

;

[xdebug]

xdebug.remote\_enable = off

xdebug.profiler\_enable = off

xdebug.profiler\_enable\_trigger = off

xdebug.profiler\_output\_name = cachegrind.out.%t.%p

xdebug.profiler\_output\_dir = "c:/wamp/tmp"

xdebug.show\_local\_vars=0

 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Faire un restart All Services

![](<MarkdownImage/image65.png>)

 

Installation de pgAdmin
-----------------------

#### Pré-requis

Aucun

#### Procédures d’installation

Télécharger pgAdmin v1.18.1

<http://www.pgadmin.org/download/windows.php>

 

![](<MarkdownImage/image66.png>)

Installer pgAdmin

![](<MarkdownImage/image67.png>)

![](<MarkdownImage/image68.png>)

![](<MarkdownImage/image69.png>)

![](<MarkdownImage/image70.png>)

![](<MarkdownImage/image71.png>)

![](<MarkdownImage/image72.png>)

 

 
-
