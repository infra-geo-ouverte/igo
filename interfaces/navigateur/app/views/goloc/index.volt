{% include "partials/loading.volt" %}
{% include "partials/librairies_js.volt" %}
{% include "partials/librairies_css.volt" %}
<div id='golocInstance' style="height:400px; overflow:hidden;"> </div>
<div id='windowConsole'></div>
 <?php echo $this->getContent(); ?>

    <script>
    var contexteId = "{{contexteId}}";
    var contexteCode = "{{contexteCode}}";
    var configuration = "{{configuration}}";
    var coucheId = "{{couche}}";
    var callbackInitIGO={{callbackInitIGO}};
    
    {% include "partials/lancer.volt" %}
        
        
    </script>
