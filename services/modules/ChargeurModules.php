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
	public $modules = array();

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
				if($this->verifierModulePermission($nomDossier, true)) {
					$uri = $configGlobal->uri->modules . '/' . $nomDossier;
					$this->chargerModule($configurationModule, $nomDossier, $dossierAbsolu, $uri);
				}
			} catch (\Exception $e) {
				die('Erreur lors du chargement du module \'' . $nomDossier . '\': ' . $e->getMessage());
			}
	    }

	    $this->verifierDependancesModules();
	}

	/**
	 * Vérifier que chaque module à tous les autres modules également
	 * chargés dont il dépend.
	 */
	private function verifierDependancesModules() {
		foreach ($this->modules as $module) {
			$dependances = $module->obtenirDependances();

			foreach ($dependances as $dependance) {
				if(!array_key_exists($dependance, $this->definitionModules)) {
					throw new \Exception("Le module " . $module->obtenirNom() . " dépend du module " . $dependance);
				}
			}
		}
	}

	public function verifierModulePermission($espaceDeNoms, $estNomDossier=false) {
		return $this->obtenirModuleConfig($espaceDeNoms, $estNomDossier) !== false;		
	}

	public function obtenirModuleConfig($espaceDeNoms, $estNomDossier=false) {
		$configGlobal = $this->getDi()->get('config');
		$session = $this->getDi()->getSession();

		if($estNomDossier === true){
			$repertoireModules = $configGlobal->application->modules;
			$dossierAbsolu = $repertoireModules . '/' . $espaceDeNoms;
			$configModule = $this->chargerConfiguration($dossierAbsolu);
			if($configModule){
				//Module désactivé
				if(!$configModule->get('enabled', true)) {
					return false;
				}	
				if($configModule->get('espaceDeNoms', true) !== true){
					$espaceDeNoms = $configModule->get('espaceDeNoms', true);	
				}
			}	
		}


		//Pas connecté
		if(!isset($session->info_utilisateur)){
			return false;
		}

		$permis = null;
		$permisXml = false;
		
		//XML
		$configXml = $this->getDi()->getView()->configXml;
		if(isset($configXml) && isset($configXml->modules) &&
			count($configXml->modules->xpath($espaceDeNoms)) !== 0){
			$actif = $configXml->modules->xpath($espaceDeNoms)[0]->attributes()['actif'] == 'true';
			if($actif == false){
				return false;
			} else if ($actif == true){
				$permisXml = true;
			}
		}


		if(isset($configGlobal->permissions)){
			//utilisateur
			if ($session->info_utilisateur->estAuthentifie && isset($configGlobal->permissions[$session->info_utilisateur->identifiant])){
				$identifiant = $configGlobal->permissions[$session->info_utilisateur->identifiant];
				if(isset($identifiant->modules) && isset($identifiant->modules[$espaceDeNoms])){
					$permis = $identifiant->modules[$espaceDeNoms];		
					if($permis === false || is_object($permis)){
						return $permis;
					} 
				}
			}
			//Profils
			if(isset($session->info_utilisateur->profils)){
		        foreach ($session->info_utilisateur->profils as $key => $value) {
                    if(is_array($value)){
                        $idValue = $value["id"];
                        $profil = $value["libelle"];
                    } else {
                        $idValue = $value->id;
                        $profil = $value->libelle;
                    }
		            if(!isset($session->info_utilisateur->profilActif) || $idValue == $session->info_utilisateur->profilActif){
		                if(isset($profil) && isset($configGlobal->permissions[$profil])){
		                    $modules = $configGlobal->permissions[$profil]->modules;
		                    if(isset($modules[$espaceDeNoms])){
								if(is_object($modules[$espaceDeNoms])){
									return $modules[$espaceDeNoms];
								} else if ($modules[$espaceDeNoms] === true){
									$permis = true;
								} else if ($modules[$espaceDeNoms] === false && $permis === null){
									$permis = false;
								}							
							}
		                }
		            }
		        }
		        if($permis === false){
		        	return false;
		        }
			}

			//Par défaut
			if(is_null($permis) && isset($configGlobal->permissions['*'])){
				$identifiant = $configGlobal->permissions['*'];
				if(isset($identifiant->modules) && isset($identifiant->modules[$espaceDeNoms])){
					$permis = $identifiant->modules[$espaceDeNoms];		
					if($permis === false || is_object($permis)){
						return $permis;
					} 
				}
			}
		}

		//anonyme
		if(isset($configGlobal->modules[$espaceDeNoms])){
			if(is_object($configGlobal->modules[$espaceDeNoms])){
				return $configGlobal->modules[$espaceDeNoms];
			} else if ($permis === true || $permisXml === true){
				return true;
			} else {
				return $configGlobal->modules[$espaceDeNoms];
			}
		}

		return true; // par defaut
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
	 * Obtient tous les fichiers javascript demandés d'être inclus
	 * pour chacun des modules chargés.
	 * 
	 * @return array Une liste des fichiers javascripts
	 */
	public function obtenirVues() {
		$vues = array();

		foreach ($this->modules as $module) {
			$vueModule = $module->obtenirVues();
			$vues = array_merge($vues, $vueModule);
		}

		return $vues;
	}

	/**
	 * Obtient toutes les fonctions php demandés d'être inclus
	 * pour chacun des modules chargés.
	 * 
	 * @return array Une liste des fichiers javascripts
	 */
	public function obtenirFonctions() {
		$vues = array();

		foreach ($this->modules as $module) {
			$vueModule = $module->obtenirFonctions();
			$vues = array_merge($vues, $vueModule);
		}

		return $vues;
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

