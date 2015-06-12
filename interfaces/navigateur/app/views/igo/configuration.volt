{% include "partials/loading.volt" %}
{% include "partials/librairies_js.volt" %}
{% include "partials/librairies_css.volt" %}
<div id='igoInstance' style="height:400px; overflow:hidden;"> </div>
<div id='windowConsole'></div>
 <?php echo $this->getContent(); ?>

    <script>
    var contexteId = [];
    var contexteCode = [];
    <?php
    foreach ($contexteId as $key => $value) {
        echo "contexteId.push('$value'); \n";
    }
    foreach ($contexteCode as $key => $value) {
        echo "contexteCode.push('$value'); \n";
    }
    ?>
    
    var configuration = "{{configuration}}";
    var coucheId = "{{couche}}";
    var callbackInitIGO={{callbackInitIGO}};
    
    {% include "partials/lancer.volt" %}
        
    </script>
