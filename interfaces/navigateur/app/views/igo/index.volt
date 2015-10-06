{% include "partials/loading.volt" %}
{% include "partials/librairies_js.volt" %}
{% include "partials/librairies_css.volt" %}
<div id='igoInstance' style="height:400px; overflow:hidden;"> </div>
<div id='windowConsole'></div>
 <?php echo $this->getContent(); ?>

    <script>
    (function(){
        var contexteId = [];
        var contexteCode = [];
        {% for tempCId in contexteId %}
            contexteId.push('{{tempCId}}');
        {% endfor  %}
        {% for tempCCode in contexteCode %}
            contexteCode.push('{{tempCCode}}');
        {% endfor  %}
        
        var configuration = "{{configuration}}";
        var coucheId = "{{couche}}";
        
        {% include "partials/lancer.volt" %}
    })();
    </script>
