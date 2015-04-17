/*define(['aide'], function(Aide) {
    //encore utilliser?
    $.ajaxPrefilter( function( options ) {
        if ( options.crossDomain ) {
          //options.data = 'url='+escape(options.url+'?'+options.data);
          options.url = Aide.obtenirProxy()+'?URL='+options.url;              
          options.crossDomain = false;
        }
    });
});*/