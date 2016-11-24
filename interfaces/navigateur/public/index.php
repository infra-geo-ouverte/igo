<?php
use IGO\Modules;

error_reporting(E_ALL);

try {

    $config = include __DIR__ . "/../app/config/config.php";
    include __DIR__ . "/../app/config/loader.php";
    include __DIR__ . "/../app/config/services.php";
    $application = new \Phalcon\Mvc\Application($di);

    //TODO
    //faire un module pour la retro-compatibilité, pour ce genre de code.
    if(isset($config->application->authentification->nomProfilAnonyme)){
      $config->application->authentification->profilAnonyme = array('nom'=>$config->application->authentification->nomProfilAnonyme);

    }

    //retro-compatibilité de l'authentification multiple
    if(isset($config->application->authentification->module)){
    if(!is_array(isset($config->application->authentification->module))){
      switch($config->application->authentification->module){
        case 'AuthentificationLdapBasic':
        case 'AuthentificationLdap':
          $config->application->authentification->module = array($config->application->authentification->module => array(
                                                                 'config'=> $config->application->authentification->ldap));
          break;
        case 'AuthentificationBd':
          $config->application->authentification->module = array($config->application->authentification->module => array(
                                                                 'config'=> $config->application->authentification->bd));
          break;
        case 'AuthentificationExterne':
          $config->application->authentification->module = array($config->application->authentification->module => array(
                                                                 'config'=> array()));
          break;
      }
    }
}
 	$application->registerModules($di->get('chargeurModules')->obtenirDefinitionModules());
    echo $application->handle()->getContent();

} catch (\Exception $e) {
    echo $e->getMessage();
}
