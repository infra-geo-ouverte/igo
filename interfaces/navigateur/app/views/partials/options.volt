var options = {
    uri: {
        navigateur: "{{this.url.getBaseUri()}}"
    },
    version: "{{this.config.application.version}}",
    utilisateur: "{{utilisateur}}",
    profil: "{{profil}}",
    nbProfil: {{nbProfil}},
    callbackInitIGO: {{callbackInitIGO}},
    contexteId: contexteId,
    contexteCode: contexteCode,
    configuration: configuration,
    coucheId: coucheId
};

{% if this.config.application.debug is defined %}
    options.debug = <?php echo var_export($this->config->application->debug) ?>;
{% endif %}

{% if avertissement is defined %}
    options.messageAvertissement = "{{avertissement|escape}}";
{% endif %}


options.modulesFct = [];
{% for module in modulesJS %}
    options.modulesFct.push(function(Configuration, Aide){
        //saut de ligne
        <?php include($module); ?>
        //saut de ligne
    });
{% endfor  %}

options.configClient = <?php echo json_encode($configClient)?>;