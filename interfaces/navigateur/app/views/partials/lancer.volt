{% include "partials/options.volt" %}
{% include "partials/requireConfig.volt" %}

require(['{{this.url.getBaseUri()}}/js/IGO.js'], function(IgoC){
    new IgoC(options);
});



