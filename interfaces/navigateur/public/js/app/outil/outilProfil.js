define(['outil', 'outilMenu', 'aide'], function(Outil, OutilMenu, Aide) {

    function OutilProfil(options){
        this.options = options || {};
        
        this.defautOptions = $.extend({}, 
            this.defautOptions, 
            {
                titre: 'Profil',
                id: 'outilProfil',
                infobulle: "Gestion du compte"
            },
            Aide.obtenirProfil()
        );
    };
    
    OutilProfil.prototype = new OutilMenu();
    OutilProfil.prototype.constructor = OutilProfil;

    OutilProfil.prototype._init = function(){
        OutilMenu.prototype._init.call(this); 

        var outils=[];
        if(this.options.nbProfils > 1){
            var titreProfil = 'Changer de profil';
            if(this.options.profil === ""){
                titreProfil = "Voir en tant que ...";
            }
            outils.push(new Outil({
                titre: titreProfil, 
                action: function(){
                    var url = Aide.utiliserBaseUri("connexion/role");
                    window.location.replace(url + "?force-profil=true");
                }
            }));
        }
        
        var contextes = Aide.obtenirConfigXML("contexte");
        if($.isArray(contextes)){
            var contexteOutils = [];
            $.each(contextes, function(key, value){  
                var contexteAttributs = value["@attributes"] || value["attributs"] || {};
                contexteOutils.push(new Outil({
                    titre: contexteAttributs.titre || contexteAttributs.id || contexteAttributs.code || '['+key+']',
                    icone: key === 0 ? "crochet" : undefined,
                    action: function(){
                        $.each(this.parent.listeOutils, function(key2, item){
                            item.changerIcone();
                        });
                        this.changerIcone("crochet");
                        Aide.obtenirNavigateur().analyseur.chargerContexte(key);
                    }
                }));
            });
            outils.push(new OutilMenu({
                titre:'Changer de contexte', 
                outils: contexteOutils
            }));
        }
        
        outils.push(new Outil({
            titre:'Déconnexion', 
            action: function(){
                var url = Aide.utiliserBaseUri("connexion/deconnexion");
                window.location.replace(url);
            }
        })); 

        this.ajouterOutils(outils); 
    };

    return OutilProfil;
    
});