require(['aide'], function (Aide) {

    module('Aide',{
        setup: function() {
        }
    });
    
    test('_obtenirTermeAnglais ', function() {
        strictEqual(Aide._obtenirTermeAnglais('droite'), 'east', 'succeed !');
        strictEqual(Aide._obtenirTermeAnglais('ouest'), 'west', 'succeed !');
        strictEqual(Aide._obtenirTermeAnglais('nord'), 'north', 'succeed !');
        strictEqual(Aide._obtenirTermeAnglais('bas'), 'south', 'succeed !');
    });
    
});