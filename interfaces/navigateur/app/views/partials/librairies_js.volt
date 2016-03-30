<?php if(isset($this->config->application->debug) && $this->config->application->debug){ ?>
    {{ view.ajouterJavascript("openlayers/OpenLayers.debug.js", true, true) }}
    {{ view.ajouterJavascript("extjs/adapter/ext/ext-base-debug.js", true, true) }}
    {{ view.ajouterJavascript("extjs/ext-all-debug.js", true, true) }}
    {{ view.ajouterJavascript("libs/GeoExt/GeoExt-build-debug.js", false) }}
    {{ view.ajouterJavascript("jquery/jquery.js", true, true) }}
<?php } else { ?> 
    {{ view.ajouterJavascript("openlayers/OpenLayers.js", true, true) }}
    {{ view.ajouterJavascript("extjs/adapter/ext/ext-base.js", true, true) }}
    {{ view.ajouterJavascript("extjs/ext-all.js", true, true) }}
    {{ view.ajouterJavascript("libs/GeoExt/GeoExt-build.js", false) }}
    {{ view.ajouterJavascript("jquery/jquery.min.js", true, true) }}
<?php } ?>
{{ view.ajouterJavascript("openlayers/lib/OpenLayers/Lang/fr.js", true, true) }}
{{ view.ajouterJavascript("extjs/src/locale/ext-lang-fr_CA.js", true, true) }}
{{ view.ajouterJavascript("libs/jquery/cachedScript.js", false) }}
{{ view.ajouterJavascript("libs/require/lib/require.js", false) }}
{{ view.ajouterJavascript("libs/extension/ie/ieUpgrade.js", false, true) }}
