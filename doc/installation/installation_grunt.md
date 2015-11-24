# Installation des prérequis
## Requis 

#### Modules Apache
- rewrite <br />  

#### Phalcon - version 1.3.2
https://github.com/phalcon/cphalcon/tree/phalcon-v1.3.2

#### Modules de PHP
- php5-intl 
- php5-curl 


#### Python 2.7
https://www.python.org/downloads/

#### Git (avec clé ssh)
https://git-scm.com/download/  
https://help.github.com/articles/generating-ssh-keys/

#### NodeJS
https://nodejs.org

#### Bower et Grunt
```
npm install -g bower 
npm install -g grunt-cli
```

# Installation de IGO
```
cd /var/www/html/ 
git clone https://github.com/infra-geo-ouverte/igo.git  
cd igo 
```

# Installer les modules nodeJS
```
npm install
```

#Préparer le dossier IGO
```
grunt init
```

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

#Problèmes connus
Si le ssh est bloqué: <br /> 
git config --global url.https://.insteadOf git:// <br /> 
<br /> 
Si le port est bloqué, ajouter dans ~/.ssh/config: <br /> 
Host github.com <br /> 
    Hostname ssh.github.com <br /> 
    Port 443
