# Installation de l'environnement de test

L'environnement de test fonctionne avec **PHPUnit** et **Selenium**. Il permet de tester le navigateur, le pilotage, etc.

Certaines applications et fichiers sont disponible au MSP sous  \\geodoc\projets\160-IGO-Infrastructure géomatique ouverte\Procédures\Outils de développement\selenium et tests. Si les liens ci-dessous ne sont pas fonctionnels, demandez leur une version des fichiers.

## Téléchargement du code du dépôt de test
* Faire un clone, idéallement dans le dossier igo et le nommer tests. On aura donc /igo/tests/

## Installation de Selenium Server
* Créer un dossier c:/selenium/
* Télécharger le serveur **[Selenium](http://repo.jenkins-ci.org/releases/org/seleniumhq/selenium/selenium-server-standalone/2.43.1/selenium-server-standalone-2.43.1.jar)** 
* Copier le fichier .jar dans c:/selenium/
* Télécharger le driver chrome: **[ChromeDriver](http://chromedriver.storage.googleapis.com/2.12/chromedriver_win32.zip)**
* Déarchiver chromedriver_win32.zip puis copier chromedriver.exe dans c:/selenium/
* Télécharger le driver ie: **[IEDriver](http://selenium-release.storage.googleapis.com/2.44/IEDriverServer_Win32_2.44.0.zip)**
* Déarchiver IEDriverServer_Win32.zip puis copier IEDriverServer.exe dans c:/selenium/

## Plugins pour enregistrer les macros
### Firefox
* Installer le **[Selenium IDE:] (http://release.seleniumhq.org/selenium-ide/2.8.0/selenium-ide-2.8.0.xpi))**
* Installer le  Plugin **[Selenium IDE Button](https://addons.mozilla.org/fr/firefox/addon/selenium-ide-button/)**. Il permet d'enregistrer les macros Selenium. 
* Installer le plugin **[Selenium IDE: PHP Formatters](https://addons.mozilla.org/fr/firefox/addon/selenium-ide-php-formatters/)**. Il permet d'exporter les macros en PHP.

## Lancer les tests phpUnit
* A partir d'une fenêtre putty, naviguer vers le répertoire du projet test/phpUnit
* Lancer la commande suivante : php phpunit.phar ./ http://environnement_a_tester.gouv.qc.ca

## Lancer les tests sélénium
### Firefox
* En ligne de commande windows; exécuter la ligne suivante:
java -jar selenium.jar -htmlSuite *firefox http://environnement_a_tester.msp.gouv.qc.ca "chemin_vers_le_testsuite" "chemin_fichier_resultat_html"

### Chrome
* En ligne de commande windows; exécuter la ligne suivante:
java -jar -Dwebdriver.chrome.driver=/chromedriver.exe selenium.jar -htmlSuite *googlechrome http://environnement_a_tester.msp.gouv.qc.ca "chemin_vers_le_testsuite" "chemin_fichier_resultat_html"

### IE
* En ligne de commande windows; exécuter la ligne suivante:
java -jar -Dwebdriver.ie.driver=/IEDriverServer.exe selenium.jar -htmlSuite *iexplore http://environnement_a_tester.msp.gouv.qc.ca "chemin_vers_le_testsuite" "chemin_fichier_resultat_html"

