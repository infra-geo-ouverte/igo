/* 
 * Auteur : Nicolas Brisebois-Tétreault
 * Description : Associe un lien avec un input de formulaire. Quand on clique sur le lien, le url est mis à jour avec le value du input.
 * 
 * Exemple d'utilisation : 
 * <input id='monInput'>
 * <a id="monLien" href="" data-suivilien-href="page.php?id={valeur}">mon lien</a>
 * <script>$('#monLien').suiviLien({idInput:'monInput'});</script>
 * 
 * Inspiré de : https://github.com/jquery-boilerplate/jquery-boilerplate
 */


// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "suiviLien",
				defaults = {
				idInput: ""
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {
				init: function () {
						// Place initialization logic here
						// You already have access to the DOM element and
						// the options via the instance, e.g. this.element
						// and this.settings
						// you can add more functions like the one below and
						// call them like so: this.yourOtherFunction(this.element, this.settings).
						
                        //Vérifier si le input existe
                       var id = this.settings.idInput;
                       if('' == id){
                           alert("Vous devez spécifier le id du champ à associer.");
                           return;
                       }
                       var input = $('#' + id);
                       if(undefined == input){
                           alert("Le champ id=" + id + " ne semble pas exister.");
                           return;
                       }
                       
                       /**
                        * Met à jour le href du lien associé
                        * @param element Lien cliqué
                        * @param id Id du input
                        */
                       $(this.element).mousedown({objet:this,id:id}, function(event){
                           var input = event.data.objet.getInput();
                           var valeur = input.val();
                           var lien = $('#' + event.data.objet.element.id);
                           var url = lien.data('suivilien-href');
                           url = url.replace('{valeur}', valeur);
                           lien.attr('href', url);
                           
                       });
                    
				}
		});
                
        Plugin.prototype.getInput = function() {
            return $('#' + this.settings.idInput);
        };     
        
		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});

				// chain jQuery functions
				return this;
		};

})( jQuery, window, document );