# Installation d'un environnement de développement
## Requis 
Installer une machine virtuelle avec ubuntu 14.04

### Installation des packages linux
**Obtenir les privilèges de root**
sudo su root

**Mettre à jour le système**
apt-get update

#### Installer Apache
apt-get install apache2   <br />  

**Activer le module cgi**   <br />  
a2enmod cgi    <br />  
a2enmod rewrite   <br />  

#### Installer MapServer (testé seulement avec la version 6.4.1)
apt-get install cgi-mapserver=6.4.1-2 mapserver-bin=6.4.1-2 gdal-bin

#### Installer le compilateur gcc
apt-get install gcc make libpcre3-dev 

#### Installer le support de PHP
apt-get install php5 php5-dev php5-mapscript php5-pgsql php5-intl php5-curl 

#### installer postgresql postgis
apt-get install postgresql-9.3-postgis-2.1

#### changer le mot de passe de postgres
sudo -u postgres psql postgres    <br />  
**Tapper:** \password postgres    <br />  
**Tapper:** \q 


#### créer une base de données spatiale
sudo su postgres   <br />   
createdb "nom_de_la_bd"   <br />
createlang plpgsql "nom_de_la_bd"   <br />   
cd /usr/share/postgresql/9.3/contrib/postgis-2.1/   <br />   
psql -d postgres -f postgis.sql   <br />  
psql -d postgres -f postgis_comments.sql   <br />  
psql -d postgres -f spatial_ref_sys.sql   <br />  
exit   <br /> 
cd ~

#### Installer le client git
apt-get install git

#### Installation de Phalcon
git clone --depth=1 git://github.com/phalcon/cphalcon.git   <br />  
cd cphalcon/build   <br />  
./install   <br />  
**Ajouter un fichier nommé 30-phalcon.ini dans /etc/php.d/:** extension=phalcon.so   <br />  
echo extension=phalcon.so >> /etc/php5/apache2/conf.d/30-phalcon.ini   <br />  
**retourner à l'utilisateur normal:igo**

# Installation des librairies
## Clone des librairies
cd /var/www/html   <br />  
git clone https://github.com/infra-geo-ouverte/igo-lib.git librairie

# Installation de IGO
## Clone des services
cd /var/www/html   <br />  
git clone https://github.com/infra-geo-ouverte/igo.git  <br />  
chmod 775 /var/www/html/igo/interfaces/navigateur/app/cache  
chmod 775 /var/www/html/igo/pilotage/app/cache  
** Remplacer apache par l'usager de votre serveur Web  
chgrp apache /var/www/html/igo/interfaces/navigateur/app/cache  
chgrp apache /var/www/html/igo/pilotage/app/cache  

## Configurer IGO  
Configurer le fichier igo/config/config.php

Modifier les deux valeurs de l'array uri suivantes:

'navigateur' => "/navigateur/"
'librairie' => "/librairie/"

## Modification de la configuration d'Apache
gedit /etc/apache2/sites-available/000-default.conf

** Ajouter le code suivant à l'intérieur du VirtualHost, sauvegarder, quitter**


```
Alias /pilotage "/var/www/html/igo/pilotage/"
<Directory /var/www/html/igo/pilotage/>
    <IfModule mod_rewrite.c>
        	RewriteEngine On
	        RewriteRule  ^$ public/    [L]
	        RewriteRule  (.*) public/$1 [L]
	</IfModule>
	php_value max_input_vars 2000
</Directory>

<Directory /var/www/html/igo/pilotage/public/>
	AddDefaultCharset UTF-8
	<IfModule mod_rewrite.c>
	    RewriteEngine On
	    RewriteCond %{REQUEST_FILENAME} !-d
	    RewriteCond %{REQUEST_FILENAME} !-f
	    RewriteRule ^(.*)$ index.php?_url=/$1 [QSA,L]
	</IfModule>
</Directory>

Alias /navigateur/ "/var/www/html/igo/interfaces/navigateur/"
<Directory /var/www/html/igo/interfaces/navigateur/>
	<IfModule mod_rewrite.c>
	        RewriteEngine on
	        RewriteRule  ^$ public/    [L]
	        RewriteRule  (.*) public/$1 [L]
	</IfModule>
</Directory>

<Directory /var/www/html/igo/interfaces/navigateur/public/>
	AddDefaultCharset UTF-8
	<IfModule mod_rewrite.c>
	    RewriteEngine On
	    RewriteCond %{REQUEST_FILENAME} !-d
	    RewriteCond %{REQUEST_FILENAME} !-f
	    RewriteRule ^(.*)$ index.php?_url=/$1 [QSA,L]
	</IfModule>
</Directory>

Alias /api/ "/var/www/html/igo/interfaces/navigateur/api/"
<Directory /var/www/html/igo/interfaces/navigateur/api/>
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^(.*)$ index.php?_url=/$1 [QSA,L]
</IfModule>
</Directory>

```

# Appliquer les modifications
**Redémarer Apache**  <br />  
service apache2 restart

## Création des tables de pilotage
sudo su postgres   <br />  
psql -f /srv/www/http/igo/pilotage/app/sql/creation_de_tables.sql  <br />  

## Appliquer les modifications suivantes pour utiliser le navigateur en mode anonyme (sans pilotage)
https://gitlab.forge.gouv.qc.ca/geomatique/igo/wikis/liste-erreurs#class-39-igoprofil-39-not-found

# Installer l'IDE Netbeans
apt-get install netbeans

## Configuration de NetBeans
Démarer netbeans.  <br />  
Dans l'onglet My NetBeans; cliquer sur Install Plugins  <br />  
Dans l'onglet settings, cocher toutes les options  <br />  
Dans l'onglet updates, cliquer sur reload, et mettre à jour tous les updates  <br />  
Dans l'onglet Available Plugins, installer le plugin PHP  <br />  
File->New Project
 - PHP
 - /var/www/html/igo

# Configurer XDebug (Pas testé)
apt-get install php5-xdebug  <br />  
sudo gedit /etc/php5/apache2/conf.d/20-xdebug.ini

**Changer les lignes suivantes**   <br />  
zend_extension=xdebug.so  <br />  
xdebug.remote_enable=1  <br />  
xdebug.remote_port=9000  <br />  
xdebug.profiler_enable=1  <br />  
xdebug.profiler_output_dir=/dev/null
