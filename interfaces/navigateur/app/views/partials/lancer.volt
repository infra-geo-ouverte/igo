{% include "partials/options.volt" %}
{% include "partials/requireConfig.volt" %}

require(['public/js/IGO.js'], function(IgoC){
    new IgoC(options);
});
