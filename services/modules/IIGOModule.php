<?php
namespace IGO\Modules;

use Phalcon\Mvc\ModuleDefinitionInterface;

/**
 * Interface définit la structure d'un module IGO.
 *
 * @package IGO\Modules
 */
interface IIGOModule extends ModuleDefinitionInterface {
	/**
	 * Initialise le module.
	 * 
	 * @return void
	 */
	public function initialiser();

	/**
	 * Ajoute les fonctionnalitées supplémentaires à l'api IGO.
	 * 
	 * @return void
	 */
	public function chargerApi($api);

	/**
	 * Retour la liste de tous les librairies Javascript inclus par le module.
	 * 
	 * @return array
	 */
	public function obtenirLibrairiesJavascript();

	/**
	 * Obtient la configuration du module.
	 * 
	 * @return array
	 */
	public function obtenirConfiguration();
}
