define(['panneau'], function(Panneau) {
    function GoogleStreetView(options){
        this.options = options || {};
    };
    
    GoogleStreetView.prototype = new Panneau();
    GoogleStreetView.prototype.constructor = GoogleStreetView;
    
    GoogleStreetView.prototype._init = function(){
        this._panel = {						
            title: 'Google Street View', 
            id: 'Google_StreetV_panneau',
            hidden: false,
            border: true,
            width: 200,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            autoScroll: true,
            items:[this.getContentPanel()]
        };
    };
    
    GoogleStreetView.prototype.getAide = function() {
        return  "<br>1->Zoomer sur le secteur avec ou sans l'outil de localisation.<br>"+
                "2->Cliquer sur le bouton LIEU à voir puis sur le lieu choisi.<br>"+
                "3->Cliquer sur LANCER StreetView pour voir le lieu à l’échelle de la rue :<br>"+
                "le résultat apparaîtra dans la fenêtre de Google Street View.<br><br>"+
                "***Si l'écran est gris, c’est que le secteur n'est pas disponible dans Google Street View.***<br>";
    };
    
    GoogleStreetView.prototype.ol_streetview = function(){
        //on va récupérer les derniers points de l'usager user...
        var streetview = 'http://maps.google.com/maps?q=&layer=c&cbll='+Y_lieu_iti1+','+X_lieu_iti1+'&cbp=11,0,0,0,0';

        oClickCtrl.deactivate();
        activateNavigationControl();

         Ext.Msg.alert("Fonction Google Street View.",
                       "**ATTENTION** Cette vue provient de Google Street View, donc il n'utilise pas les données gouvernementales. Cette fonction est fournie en support, doit être utilisée avec précaution et n'est pas un outil officiel en mesures d'urgence du MSP.");

        window.open(streetview, "Google_StreetView", 'resizable=yes,scrollbars=yes,toolbar=yes,status=yes');
    };
    
    GoogleStreetView.prototype.getContentPanel = function() {
        return new Ext.FormPanel({
            labelWidth: 100,
            frame:true,
            border: false,
            bodyStyle:'padding:5px 5px 0',
            width: 300,
            scope:this,
            items: [        
                {
                    hideLabel: true,
                    html: "<b>Zoomer à l'échelle de la rue</b>",
                    id: 'txtSTV3',
                    height: 13,       
                    width: 288   
                }, {    
                    html: this.getAide(),
                    id: 'resul7_google_itin'
                }, {    
                    id: 'resul5_google_itin'
                }, {
                    html: '<br>',      
                    id: 'aide_iti3'
                }
            ],
            buttons: [
                {
                    text: 'LIEU à voir',
                    tooltip: 'Lieu à voir',
                    minWidth: '5',
                    maxWidth: '10',
                    style: {
                        marginBottom: '5px'
                    },
                    handler: function(){
                        ol_ajouterlieu1();
                    }
                }, {
                    text: "LANCER StreetView",
                    tooltip: "Voir à l'échelle de la rue",
                    minWidth: '5',
                    maxWidth: '10',
                    style: {
                        marginBottom: '5px'
                    },
                    handler: function(){
                         this.ol_streetview();
                         oClickCtrl.deactivate();
                    }
                }
            ]
        });
    };

    return GoogleStreetView;
    
});