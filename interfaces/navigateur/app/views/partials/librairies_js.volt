<?php if(isset($this->config->application->debug) && $this->config->application->debug){ ?>
    {{ view.ajouterJavascript("OpenLayers/OpenLayers-2.13.1/OpenLayers.debug.js", true, true) }}
    {{ view.ajouterJavascript("ext/ext-3.4.0/adapter/ext/ext-base-debug.js", true, true) }}
    {{ view.ajouterJavascript("ext/ext-3.4.0/ext-all-debug.js", true, true) }}
    {{ view.ajouterJavascript("libs/GeoExt/GeoExt-build-debug.js", false) }}
    {{ view.ajouterJavascript("libs/jquery/jquery-1.10.2.js", false, true) }}
<?php } else { ?> 
    {{ view.ajouterJavascript("OpenLayers/OpenLayers-2.13.1/OpenLayers.js", true, true) }}
    {{ view.ajouterJavascript("ext/ext-3.4.0/adapter/ext/ext-base.js", true, true) }}
    {{ view.ajouterJavascript("ext/ext-3.4.0/ext-all.js", true, true) }}
    {{ view.ajouterJavascript("libs/GeoExt/GeoExt-build.js", false) }}
    {{ view.ajouterJavascript("libs/jquery/jquery-1.10.2.min.js", false, true) }}
<?php } ?>
{{ view.ajouterJavascript("OpenLayers/OpenLayers-2.13.1/lib/OpenLayers/Lang/fr.js", true, true) }}
{{ view.ajouterJavascript("ext/ext-3.4.0/src/locale/ext-lang-fr_CA.js", true, true) }}
{{ view.ajouterJavascript("libs/jquery/cachedScript.js", false) }}
{{ view.ajouterJavascript("libs/require/lib/require.js", false) }}
{{ view.ajouterJavascript("libs/extension/ie/ieUpgrade.js", false, true) }}

