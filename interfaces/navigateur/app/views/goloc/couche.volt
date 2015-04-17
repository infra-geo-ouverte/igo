{% include "partials/loading.volt" %}
{% include "partials/librairies_js.volt" %}
{% include "partials/librairies_css.volt" %}
<div id='golocInstance' style="height:400px; overflow:hidden;"> </div>
<div id='windowConsole'></div>
 <?php echo $this->getContent(); ?>

    <script>
        
    var coucheId = "{{couche}}";
    var configuration = "{{configuration}}";
    var contexteId = null;
    var contexteCode = null;
    var callbackInitIGO={{callbackInitIGO}};
    
    {% include "partials/lancer.volt" %}
    </script>
