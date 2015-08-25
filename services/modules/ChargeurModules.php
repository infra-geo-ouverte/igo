<?php
namespace IGO\Modules;

use Phalcon\Loader;

/**
* Chargeur de modules IGO.
*
* Charge les modules contenus dans le répertoire définit dans la configuration
* 'modules' du fichier de configuration.
*
* Chaque module doit contenir un fichier de configuration 'app/config/config.php'.
* Voici un exemple de fichier de configuration de module contenant les propriétés
* minimales à définir.
*
* <code>
* return array(
*	'espaceDeNoms' => 'Exemple'
* );
* </code>
*
* @package IGO\Module
*/
class ChargeurModules extends \Phalcon\DI\Injectable {
	/**
	 * Contient tous les instance de module chargé en mémoire.
	 * 
	 * @var array
	 */
	private $modules = array();

	/**
	 * Contient tous les définitions de module `Phalcon` permettant le
	 * support du mode MVC de `Phalcon`
	 * 
	 * @var array
	 */
	private $definitionModules = array();

	/**
	 *  le constructeur par défaut.
	 */
	public function __construct() {

	}

	/**
	 * Initialise le chargement des modules à partir du répertoire
	 * défini par `repertoireModules`.
	 *
	 * @return void
	 */
	public function initialiser() {
		$configGlobal = $this->getDi()->get('config');
		$session = $this->getDi()->getSession();

		if(!$configGlobal->application->offsetExists('modules')) {
			return;
		}

		if(!isset($configGlobal->uri->modules)) {
			throw new \Exception('Lorsque le système de modules est utilisé, le paramètre `modules` doit être défini dans la configuraiton `uri`');
		}

		if(!file_exists($configGlobal->application->modules) || !is_dir($configGlobal->application->modules)) {
			throw new \Exception('Le répertoire de module `' . $configGlobal->modules . '` n\'existe pas ou n\'est pas un répertoire valide.');
		}

		$repertoireModules = $configGlobal->application->modules;
		$dossiers = $this->filterDossiersModules($repertoireModules);

	    foreach($dossiers as $nomDossier) {
	        $dossierAbsolu = $repertoireModules . '/' . $nomDossier;

			try {
				$configurationModule = $this->chargerConfiguration($dossierAbsolu);
				
				if($this->verifierModulePermission($configGlobal, $configurationModule, $session, $nomDossier)) {
					$uri = $configGlobal->uri->modules . '/' . $nomDossier;
					$this->chargerModule($configurationModule, $nomDossier, $dossierAbsolu, $uri);
				}
			} catch (\Exception $e) {
				die('Erreur lors du chargement du module \'' . $nomDossier . '\': ' . $e->getMessage());
			}
	    }
	}

	private function verifierModulePermission($configGlobal, $configModule, $session, $nomDossier) {
		if(!$configModule->get('enabled', true)) {
			return false;
		}

		$espaceDeNoms = $configModule->get('espaceDeNoms', true);
		$espaceDeNoms = $espaceDeNoms != 1 ? $espaceDeNoms : $nomDossier;

		$permis = true;
		if(isset($configGlobal->modules[$espaceDeNoms]) && $configGlobal->modules[$espaceDeNoms] === false){
			$permis = false;
		}

		if(!isset($session['info_utilisateur'])){
			return false;
		} else if ($session['info_utilisateur']->estAuthentifie){
			if(isset($configGlobal->profilsDroit[$session['info_utilisateur']->identifiant])){
				$identifiant = $configGlobal->profilsDroit[$session['info_utilisateur']->identifiant];
				if(isset($identifiant->modules) && isset($identifiant->modules[$espaceDeNoms])){
					return $identifiant->modules[$espaceDeNoms];		
				}
			}

			//profils
            foreach ($session['info_utilisateur']->profils as $key => $value) {
                if(is_array($value)){
                    $idValue = $value["id"];
                    $profil = $value["libelle"];
                } else {
                    $idValue = $value->id;
                    $profil = $value->libelle;
                }
                if(!isset($session['info_utilisateur']->profilActif) || $idValue == $session['info_utilisateur']->profilActif){
                    if(isset($profil) && isset($configGlobal->profilsDroit[$profil])){
                        $modules = $configGlobal->profilsDroit[$profil]->modules;
                        if(isset($modules[$espaceDeNoms])){
							$permis = $modules[$espaceDeNoms];	
							break;	
						}
                    }
                }
            }

		} else if ($session['info_utilisateur']->estAnonyme && isset($configGlobal->profilsDroit['Anonyme'])){
			$modules = $configGlobal->profilsDroit['Anonyme']->modules;
			if(isset($modules[$espaceDeNoms])){
				return $modules[$espaceDeNoms];
			}
		}

		return $permis;
	}

	/**
	 * Filtre les dossiers qui contiennent potentiellement des modules à charger.
	 * 
	 * @param  string $dossierModules Le dossier racine où sont localisé les modules.
	 * @return array Une liste des dossiers qui contiennent potentiellement des modules.
	 */
	private function filterDossiersModules($dossierModules) {
		$dossiers = array();
		$fichiers = scandir($dossierModules);

		foreach($fichiers as $fichier) {
	        $dossierPotentiel = $dossierModules . '/' . $fichier;

	        if($fichier{0} !== '.' && is_dir($dossierPotentiel)) {
				array_push($dossiers, $fichier);
	        }
	    }

	    return $dossiers;
	}

	/**
	 * Charge tout les définitions d'api de tous les modules chargés.
	 * 
	 * @param  object $api Une instance d'une application `Phalcon Micro Application`.
	 * @return void
	 */
	public function chargerApis($api) {
		foreach ($this->modules as $module) {
			$module->chargerApi($api);
		}
	}

	/**
	 * Obtient tous la liste de définition des modules
	 * 
	 * @return array Une liste des définitions des modules
	 */
	public function obtenirDefinitionModules() {
		return $this->definitionModules;
	}

	/**
	 * Obtient tous les services d'un certain type.
	 * 
	 * @return array Une liste des services défini avec le tyoe donné.
	 */
	public function obtenirServices($type) {
		$services = array();

		try {
			foreach ($this->modules as $module) {
				$servicesModule = $module->obtenirServices($type);
				$services = array_merge($services, $servicesModule);
			}
		} catch (\Exception $e) {
			die('Erreur lors du chargement des services du module \'' . $module->obtenirNom() . '\': ' . $e->getMessage());
		}

		return $services;
	}

	/**
	 * Obtient tous les fichiers javascript demandés d'être inclus
	 * pour chacun des modules chargés.
	 * 
	 * @return array Une liste des fichiers javascripts
	 */
	public function obtenirJavascript() {
		$librairies = array();

		foreach ($this->modules as $module) {
			$librairiesModule = $module->obtenirJavascript();
			$librairies = array_merge($librairies, $librairiesModule);
		}

		return $librairies;
	}

	/**
	 * Charge un module.
	 *
	 * @param  object $configurationModule La configuraiton du module à charger.
	 * @param  string $nomDossierModule Le nom du dossier où est contenu le module.
	 * @param  string $cheminRacine Le chemin complet vers le module.
	 * @param  string $uri Le uri
	 * 
	 * @return void
	 */
	private function chargerModule($configurationModule, $nomDossierModule, $cheminRacine, $uri) {
	    $cheminClasseModule = $cheminRacine . '/Module.php';

	    if(file_exists($cheminClasseModule)) {
	    	$nomClasse = '\\' . $configurationModule->get('espaceDeNoms') . '\Module';
	    	$this->enregistrerEspaceDeNoms($configurationModule->get('espaceDeNoms'), $cheminRacine);
	    } else {
	    	$nomClasse = '\IGO\Modules\DefaultModule';
	    }

		$configurationModule->offsetSet('cheminRacine', $cheminRacine);
		$configurationModule->offsetSet('uri', $uri);
		$configurationModule->offsetSet('nomDossierModule', $nomDossierModule);

		$module = new $nomClasse($configurationModule);
		$module->initialiser();

		$this->enregistrerModule($module, $nomDossierModule, $nomClasse, $cheminClasseModule);
	}

	/**
	 * Enregistre un module et sa définition.
	 * 
	 * @param  object $module Une instance de module.
	 * @param  string $nomModule Le nom du module.
	 * @param  string $nomClasse Le nom de la classe principal du module.
	 * @param  string $cheminClasseModule Le chemin complet vers le fichier de la classe du module.
	 *
	 * @return void
	 */
	private function enregistrerModule($module, $nomModule, $nomClasse, $cheminClasseModule) {
		if(array_key_exists($nomModule, $this->definitionModules)) {
			throw new \Exception('Un module portant le nom de ' . $nomModule . ' existe déjà');
		}

		$this->definitionModules[$nomModule] = array(
			'className' => $nomClasse,
			'path' => $cheminClasseModule
		);

		array_push($this->modules, $module);
	}

	/**
	 * Enregistre l'espace de nom pour être capable d'instancier des classes
	 * contenues dans celui-çi.
	 * 
	 * @param  string $espaceDeNoms Le nom de l'espace de noms. Exemple: `\MonModule`.
	 * @param  string $dossier Le dossier où sont contenu les classes de l'espace de noms.
	 *
	 * @return void
	 */
	private function enregistrerEspaceDeNoms($espaceDeNoms, $dossier) {
		$loader = new \Phalcon\Loader();

		$loader->registerNamespaces(
			array(
				$espaceDeNoms => $dossier
			)
		);

		$loader->register();
	}

	/**
	 * Charge la configuration d'un module.
	 * 
	 * @param  string $cheminAbsoluModule Le chemin complet vers le dossier d'un module
	 * @return object La configuration du module
	 */
	private function chargerConfiguration($cheminAbsoluModule) {
		$configurationArray = array();
		if(file_exists($cheminAbsoluModule . IGOModule::FICHIER_CONFIGURATION)) {
			$configurationArray = include  $cheminAbsoluModule . IGOModule::FICHIER_CONFIGURATION;
		};
		$configuration = new \Phalcon\Config($configurationArray);
		return $configuration;
	}
}
