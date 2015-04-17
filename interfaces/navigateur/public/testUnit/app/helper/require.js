require(['requireAide'], function () {

    module('RequireAide',{
        setup: function() {
        }
    });
    
    test('ajouterConfig ', function() {
        require.ajouterConfig({
            relativePath:'rel/',
            paths:{
                test:'testjs'
            }
        });
        require.ajouterConfig({
            baseUrl: '/base/',
            relativePath:'rel/',
            paths:{
                test:'existeDeja',
                test2:'test2js'
            }
        });
        strictEqual(require.s.contexts._.config.paths.test, '/igo/interfaces/navigateur/rel/testjs', 'succeed !');
        strictEqual(require.s.contexts._.config.paths.test2, '/base/rel/test2js', 'succeed !');
    });
    
});