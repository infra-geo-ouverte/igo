# Installation des prérequis
## Requis 

#### Modules Apache
- rewrite <br />  

#### Phalcon - version 1.3.2
https://github.com/phalcon/cphalcon/tree/phalcon-v1.3.2

#### Modules de PHP
- php5-intl 
- php5-curl 


# Installation de IGO
cd /var/www/html/  <br />  
git clone https://github.com/infra-geo-ouverte/igo.git  <br />  

** Changer le groupe de ces dossiers par l'usager de votre serveur Web  <br />
chgrp www-data /var/www/html/igo/interfaces/navigateur/app/cache  <br />
chgrp www-data /var/www/html/igo/pilotage/app/cache  

** Donner le droit d'écriture à ces dossiers  <br />
chmod 775 /var/www/html/igo/interfaces/navigateur/app/cache  <br />
chmod 775 /var/www/html/igo/pilotage/app/cache  <br />

## Cloner les librairies
cd igo <br /> 
git clone https://github.com/infra-geo-ouverte/igo-lib.git librairie


## Configurer IGO  
cp config/config.exempleSimple.php config/config.php  <br /> 
Modifier le fichier config/config.php


## Modification de la configuration d'Apache
```
Alias /igo_navigateur/ "/var/www/html/igo/interfaces/navigateur/"
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
