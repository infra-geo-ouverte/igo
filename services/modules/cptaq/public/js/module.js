/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//require.config({
//	paths: {
//		'outilDemo': Configuration.uri.modules + '/demo/public/js/outilDemo'
//	}
//});
//
//this.ajouterCallback(function(e){
//	require(['outilDemo'], function(OutilDemo){
//		var demo = new OutilDemo();
//	});
//});

require.config({
    paths: {
        'outilSelectionMultiplePG': Configuration.uri.modules + 'cptaq/public/js/outilSelectionMultiplePG',
        'rechercheMatricule': Configuration.uri.modules + 'cptaq/public/js/rechercheMatricule',
        'rechercheDossier': Configuration.uri.modules + 'cptaq/public/js/rechercheDossier'
    }
});
