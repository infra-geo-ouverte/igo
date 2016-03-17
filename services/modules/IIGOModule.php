<?php
namespace IGO\Modules;

use Phalcon\Mvc\ModuleDefinitionInterface;

/**
 * Interface définit la structure d'un module IGO.
 *
 * @package IGO\Modules
 */
interface IIGOModule {
	/**
	 * Initialise le module.
	 *
	 * @return void
	 */
	public function initialiser();

	/**
	 * Obtient le nom du module.
	 *
	 * @return string
	 */
	public function obtenirNom($capitale=false);

	/**
	 * Ajoute les fonctionnalitées supplémentaires à l'api IGO.
	 *
	 * @return void
	 */
	public function chargerApi($api);

	/**
	 * Retour la liste de toutes les vues inclus par le module.
	 *
	 * @return array
	 */
	public function obtenirVues();

	/**
	 * Retour la liste de toutes les fonctions php inclus par le module.
	 *
	 * @return array
	 */
	public function obtenirFonctions();

	/**
	 * Retour la liste de tous les librairies Javascript inclus par le module.
	 *
	 * @return array
	 */
	public function obtenirJavascript();

	/**
	 * Obtient la configuration du module.
	 *
	 * @return array
	 */
	public function obtenirConfiguration();

	/**
	 * Obtient la liste des dépendances du module.
	 *
	 * @return array
	 */
	public function obtenirDependances();

    /**
	 * Retour la liste de tous les services inclus par le module qui implémente l'interface spécifiée
	 *
	 * @param  string $interface L'interface dont doit implémenter les classes de services à être obtenue
	 * @return array
	 */
	public function obtenirServices($interface);
}
