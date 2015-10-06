{% include "partials/loading.volt" %}
{% include "partials/librairies_js.volt" %}
{% include "partials/librairies_css.volt" %}
<div id='igoInstance' style="height:400px; overflow:hidden;"> </div>
<div id='windowConsole'></div>
 <?php echo $this->getContent(); ?>

    <script>
    (function(){
	    var coucheId = "{{couche}}";
	    var configuration = "{{configuration}}";
	    var contexteId = null;
	    var contexteCode = null;
    
    	{% include "partials/lancer.volt" %}
	})();
    </script>
