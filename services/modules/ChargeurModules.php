<?php
namespace IGO\Modules;

use Phalcon\Loader;

/**
* Chargeur de modules IGO.
*
* Charge les modules contenus dans le répertoire définit dans la configuration
* 'modules' du fichier de configuration.
*
* Chaque module doit contenir un fichier de configuration 'config/config.php'.
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

		if(!$configGlobal->offsetExists('modules')) {
			return;
		}

		if(!isset($configGlobal->uri->modules)) {
			throw new \Exception('Lorsque le système de modules est utilisé, le paramètre `modules` doit être défini dans la configuraiton `uri`');
		}

		if(!file_exists($configGlobal->modules) || !is_dir($configGlobal->modules)) {
			throw new \Exception('Le répertoire de module `' . $configGlobal->modules . '` n\'existe pas ou n\'est pas un répertoire valide.');
		}

		$repertoireModules = $configGlobal->modules;
		$dossiers = $this->filterDossiersModules($repertoireModules);

	    foreach($dossiers as $nomDossier) {
	        $dossierAbsolu = $repertoireModules . '/' . $nomDossier;

			try {
				$configurationModule = $this->chargerConfiguration($dossierAbsolu);

				if($configurationModule->get('enabled', true)) {

					$uri = $configGlobal->uri->modules . '/' . $nomDossier;
					$this->chargerModule($configurationModule, $nomDossier, $dossierAbsolu, $uri);
				}
			} catch (\Exception $e) {
				die('Erreur lors du chargement du module \'' . $nomDossier . '\': ' . $e->getMessage());
			}
	    }
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
	 * Obtient tous les fichiers javascript demandés d'être inclus
	 * pour chacun des modules chargés.
	 * 
	 * @return array Une liste des fichiers javascripts
	 */
	public function obtenirLibrairiesJavascript() {
		$librairies = array();

		foreach ($this->modules as $module) {
			$librairiesModule = $module->obtenirLibrairiesJavascript();
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

	    if(!file_exists($cheminClasseModule)) {
	    	throw new \Exception('Le fichier Module.php doit être présent à la racine de chaque module.');
	    }

		$nomClasse = '\\' . $configurationModule->get('espaceDeNoms') . '\Module';
		$this->enregistrerEspaceDeNoms($configurationModule->get('espaceDeNoms'), $cheminRacine);

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
		$tableauConfiguration = include  $cheminAbsoluModule . IGOModule::FICHIER_CONFIGURATION;
		$configuration = new \Phalcon\Config($tableauConfiguration);

		$this->verifierConfiguration($configuration);

		return $configuration;
	}

	/**
	 * Vérifie que la configuration du module respecte le bon format.
	 * 
	 * @param  array $configuration La configuration du module
	 * @throws Exception Retourne les exceptions correspondant aux erreurs de validation.
	 */
	private function verifierConfiguration($configuration) {
		$proprietesMandatatoires = array(
			'espaceDeNoms',
			'version'
		);

		foreach ($proprietesMandatatoires as $propriete) {
			if(!$configuration->offsetExists($propriete)) {
				throw new \Exception("La propriété '" . $propriete . "' doit être définie.");
			}
		}
	}
}
