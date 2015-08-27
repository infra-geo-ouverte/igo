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
	const FICHIER_FONCTION_PRINCIPAL = '/php/module.php';

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
	public function obtenirServices($type) {
		$services = array();

		if($this->configuration->get('services')) {
			$dossierServices = $this->configuration->get('services');

			if(!file_exists($dossierServices) || !is_dir($dossierServices)) {
				throw new \Exception('Le répertoire de services `' . $dossierServices . '` n\'existe pas ou n\'est pas un répertoire valide.');
			}

			$classeServices = $this->chargerServices($dossierServices);
		}

		return $services;
	}

	/**
	 * Obtient tous les instances des services définit par le module.
	 *
	 * @param  string $dossierServices Dossier dans lequel sont contenues les classes de service.
	 * @return void
	 */
	protected function chargerServices($dossierServices) {
		$services = array();
		$fichiers = scandir($dossierServices);

		foreach($fichiers as $fichier) {
			$fichierServicePotentiel = $dossierServices . '/' . $fichiers;
			if($fichier{0} !== '.' && is_file($fichier) && pathinfo($fichier)['extension'] === 'php') {
		        $definitionClasse = include $fichierServicePotentiel;

		        var_dump($definitionClasse); die;
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