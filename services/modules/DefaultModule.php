<?php

namespace IGO\Modules;

use Phalcon\Loader;

class DefaultModule extends IGOModule {
    /**
     * Register a specific autoloader for the module
     */
     public function initialiser() {
        IGOModule::initialiser();

        $di = $this->getDi();
        $configGlobale = $di->get('config');

        $loader = new \Phalcon\Loader();
        $loader->registerNamespaces(
            array(
                $this->obtenirNom(true).'\Controllers' => $this->configuration->get('cheminRacine') . '/controllers',
                $this->obtenirNom(true).'\Models'  => $this->configuration->get('cheminRacine') . '/models',
                $this->obtenirNom(true).'\Apis' => $this->configuration->get('cheminRacine') . '/api',
                $this->obtenirNom(true).'\Logging' => $this->configuration->get('cheminRacine') . '/logging'
            )
        );

        if(file_exists($this->configuration->get('cheminRacine') . '/logging/Logger.php') && isset($configGlobale->repertoireLogs)){
            $di->set($this->obtenirNom().'Logger', function () use ($configGlobale) {
                $clsname = $this->obtenirNom(true).'\Logging\Logger';
                $pathLogFile = $configGlobale->repertoireLogs . $this->obtenirNom() . ".log";
                return new $clsname($pathLogFile, $configGlobale->application->debug);
            });
        }

        $loader->register();
    }


    public function chargerApi($api) {
        if(file_exists($this->configuration->get('cheminRacine') . '/api/Api.php')){
            $clsname = $this->obtenirNom(true)."\Apis\Api";
            $apiCollection = new $clsname($api, $this, $this->obtenirConfiguration());
            $api->mount($apiCollection);
        }
    }
}
