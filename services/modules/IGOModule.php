<?php
namespace IGO\Modules;

use Phalcon\Mvc\User\Plugin;

/**
 * Classe abstraite utilisé pour la spécification de module dans IGO.
 *
 * @package IGO\Modules
 */
abstract class IGOModule extends Plugin implements IIGOModule {
	/**
	 * Le chemin vers le fichier contenant la configuration du module.
	 */
	const FICHIER_CONFIGURATION = '/config/config.php';

	/**
	 * Le chemin vers le script de point d'entrée
	 */
	const FICHIER_JAVASCRIPT_PRINCIPAL = '/public/js/module.js';

	/**
	 * Le chemin vers la vue .volt à inclure
	 */
	const FICHIER_VUE_PRINCIPAL = '/views/module.volt';

	/**
	 * Le chemin vers la fonction php à inclure
	 */
	const FICHIER_FONCTION_PRINCIPAL = '/controllers/moduleController.php';

	/**
	 * La configuration du module. Lu à partir de `config/config.php`
	 *
	 * @var array
	 */
	protected $configuration;

	/**
	 * Liste des script Javascript inclus par le module.
	 *
	 * @var array
	 */
	protected $javascript = array();

	/**
	 * Liste des dépendances du module.
	 *
	 * @var array
	 */
	protected $dependances = array();

	/**
	 * Liste des script Javascript inclus par le module.
	 *
	 * @var array
	 */
	protected $vues = array();

	/**
	 * Liste des fonctions php inclus par le module.
	 *
	 * @var array
	 */
	protected $fonctions = array();

	/**
	 * Constructeur par défaut.
	 *
	 * @param object $configuration La configuration du module.
	 */
	public function __construct($configuration) {
		$this->configuration = $configuration;
	}

	/**
	 * {@inheritDoc}
	 */
	public function initialiser() {
		$this->enregistrerJavascript(IGOModule::FICHIER_JAVASCRIPT_PRINCIPAL);
		$this->enregistrerVue(IGOModule::FICHIER_VUE_PRINCIPAL);
		$this->enregistrerFonction(IGOModule::FICHIER_FONCTION_PRINCIPAL);

		$this->initialiserDependances();
	}

	/**
	 * Initialise les configurations d'inter-dépendance entre modules.
	 */
	private function initialiserDependances() {
		$this->dependances = array();

		if($this->configuration->offsetExists('dependances')) {
			$this->dependances = $this->configuration->offsetGet('dependances')->toArray();

			foreach ($this->dependances as $dependance) {
				if(!is_string($dependance)) {
					throw new \Exception(print_r($dependance, true) . " n'est pas une valeur de dépendance valide. La définition d'une dépendance d'un module doit être de type 'string'.");
				}
			}
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirNom($capitale=false) {
		$nom = $this->configuration->offsetGet('nomDossierModule');
		if($capitale === true){
			$nom = ucfirst($nom);
		}
		return $nom;
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirJavascript() {
		return $this->javascript;
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirVues() {
		return $this->vues;
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirFonctions() {
		return $this->fonctions;
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirConfiguration() {
		return $this->configuration;
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirDependances() {
		return $this->dependances;
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirServices($interface) {
		$services = array();

		if($this->configuration->get('services')) {
			$dossierServices = $this->configuration->get('services');

			if(!file_exists($dossierServices) || !is_dir($dossierServices)) {
				throw new \Exception('Le répertoire de services `' . $dossierServices . '` n\'existe pas ou n\'est pas un répertoire valide.');
			}

			$moduleServices = $this->chargerServices($interface, $dossierServices);
			$services = array_merge($services, $moduleServices);
		}

		return $services;
	}

	/**
	 * Obtient tous les instances des services définit par le module.
	 *
	 * @param string $interface L'interface dont doit implémenté les services.
	 * @param string $dossierServices Dossier dans lequel sont contenues les classes de service.
	 * @return void
	 */
	protected function chargerServices($interface, $dossierServices) {
		$services = array();
		$fichiers = scandir($dossierServices);

		foreach($fichiers as $fichier) {
			$fichierServicePotentiel = $dossierServices . '/' . $fichier;
			$informationFichier = pathinfo($fichier);

			if($fichier{0} !== '.' && $informationFichier['extension'] === 'php') {
		        $definitionClasse = include_once $fichierServicePotentiel;

		        $nomClasse = '\\' . $this->configuration->get('espaceDeNoms') . '\\Services\\' . $informationFichier['filename'];

		        if(is_subclass_of($nomClasse, $interface)) {
		        	array_push($services, $nomClasse);
				}
	        }
	    }

	    return $services;
	}

	/**
	 * Enregistre un javascript à inclure 
	 *
	 * @param  string $cheminFichier Chemin vers le fichier Javascript
	 * @return void
	 */
	protected function enregistrerJavascript($cheminFichier) {
		$script = $this->convertirCheminRelatifEnCheminAbsolue($cheminFichier);

		if(file_exists($script)) {
			array_push($this->javascript, $script);
		}
	}

	/**
	 * Enregistre une vue .volt à inclure 
	 *
	 * @param  string $cheminFichier Chemin vers le fichier volt
	 * @return void
	 */
	protected function enregistrerVue($cheminFichier) {
		$script = $this->convertirCheminRelatifEnCheminAbsolue($cheminFichier);

		if(file_exists($script)) {
			array_push($this->vues, $script);
		}
	}

	/**
	 * Enregistre une function php à exécuter avant de traiter la vue.
	 *
	 * @param  string $cheminFichier Chemin vers le fichier php
	 * @return void
	 */
	protected function enregistrerFonction($cheminFichier) {
		$script = $this->convertirCheminRelatifEnCheminAbsolue($cheminFichier);

		if(file_exists($script)) {
			array_push($this->fonctions, $script);
		}
	}

	/**
	 * Ajouter un paramètre de requête `version` à l'uri spécifiéé
	 *
	 * @param  string $uriScript L'uri auquel ajouter la version.
	 * @return string L'uri avec le paramètre `version` ajouté.
	 */
	protected function ajouterVersionUri($uriScript) {
		$composantesUri = parse_url($uriScript);
		$requeteUri = isset($composantesUri['query']) ?  $composantesUri['query'] : '';
		parse_str($requeteUri, $composantesRequeteUri);
		$composantesRequeteUri['version'] = $this->configuration['version'];
		$uriAvecVersion = $composantesUri['path'] . '?' . http_build_query($composantesRequeteUri);

		return $uriAvecVersion;
	}

	/**
	 * Converti un chemin relatif du module en chemin absolu du système d'exploitation.
	 *
	 * Exemple:
	 * `js/module.js` deviendra `/opt/igo/www/modules/<nom-du-module>/js/modules.js`
	 *
	 * @param  string $cheminRelatif Chemin relatif à partir de la racine du dossier du module.
	 * @return string Un chemin converti à partir du dossier racine du système d'exploitation.
	 */
	protected function convertirCheminRelatifEnCheminAbsolue($cheminRelatif) {
		$config = $this->getDi()->get('config');
		return $config->application->modules . '/' . $this->configuration->offsetGet('nomDossierModule') . '/' . $cheminRelatif;
	}

	/**
	 * Converti un chemin relatif du module en uri relatif de l'application web.
	 *
	 * Exemple:
	 * `js/module.js` deviendra `/modules/<nom-du-module>/js/modules.js`
	 *
	 * @param  string $cheminRelatif Chemin relatif à partir de la racine du dossier du module.
	 * @return string Un uri relatif
	 */
	protected function convertCheminRelatifEnUriRelatif($cheminRelatif) {
		$config = $this->getDi()->get('config');
		return $config->uri->modules . '/' . $this->configuration->offsetGet('nomDossierModule') . '/' . $cheminRelatif;
	}
}
