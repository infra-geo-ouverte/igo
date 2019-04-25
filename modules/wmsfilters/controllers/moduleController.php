<?php

	$configModule = $this->getDI()->get('chargeurModules')->obtenirModuleConfig('wmsfilters');

  if(isset($configModule) && isset($configModule->filterView)){
		$this->view->setVar("filterView", $configModule->filterView);
	} else {
		$this->view->setVar("filterView", "filterView");
	}

?>
