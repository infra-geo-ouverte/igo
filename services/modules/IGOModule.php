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
	const FICHIER_JAVASCRIPT_PRINCIPAL = '/js/module.js';

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
	protected $librairiesJavascript = array();

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
		$this->enregistrerLibrairieJavascript(IGOModule::FICHIER_JAVASCRIPT_PRINCIPAL);
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirLibrairiesJavascript() {
		return $this->librairiesJavascript;
	}

	/**
	 * {@inheritDoc}
	 */
	public function obtenirConfiguration() {
		return $this->configuration;
	}

	/**
	 * Enregistre un script et ajoute automatiquement
	 * la version du module au bout de celle-çi.
	 *
	 * Exemple:
	 * `modules/mon_module/js/modules.js` deviendra
	 * `modules/mon_module/js/modules.js?version=<version>`
	 *
	 * @param  string $cheminFichier Chemin vers le fichier Javascript
	 * @return void
	 */
	protected function enregistrerLibrairieJavascript($cheminFichier) {
		$script = $this->convertirCheminRelatifEnCheminAbsolue($cheminFichier);

		if(file_exists($script)) {
			$uriScript = $this->convertCheminRelatifEnUriRelatif($cheminFichier);
			$uriScript = $this->ajouterVersionUri($uriScript);

			array_push($this->librairiesJavascript, $uriScript);
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
		return $config->modules . '/' . $this->configuration->offsetGet('nomDossierModule') . '/' . $cheminRelatif;
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
