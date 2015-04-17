define(['panneau'], function(Panneau) {
    function GoogleItineraire(options){
        this.options = options || {};
    };
    
    GoogleItineraire.prototype = new Panneau();
    GoogleItineraire.prototype.constructor = GoogleItineraire;
    
    GoogleItineraire.prototype._init = function(){
        this._panel = {						
            title: 'Itinéraire de Google', 
            id: 'Google_iti_panneau',
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
    
    GoogleItineraire.prototype.getAide = function() {
        return  "1->Zoomer sur le secteur de départ avec ou sans l'outil de localisation.<br>"+
                "2->Cliquer sur le bouton Lieu 1 puis sur le lieu de départ sur la carte.<br>"+
                "3->Zoomer sur le secteur d'arrivée avec ou sans l'outil de localisation.<br>"+
                "4->Cliquer sur le bouton Lieu 2 puis sur le lieu d'arrivée sur la carte.<br>"+
                "5->Cliquer sur Lancer itinéraire pour afficher le résultat dans la fenêtre de Google Maps.<br>";
    };
    

    GoogleItineraire.prototype.getContentPanel = function() {
        return new Ext.FormPanel({
            labelWidth: 100,
            frame:true,
            border: false,
            bodyStyle:'padding:5px 5px 0',
            scope:this,
            items: [        {
                hideLabel: true,
                html: '<b>Générer un itinéraire Google Maps</b>',
                id: 'txtDemo2',
                height: 13,       
                width: 288   
            },
                    {    
                    id: 'resul1_google_itin'
                    },
                    {    
                    id: 'resul2_google_itin'
                    },
                    {
                    html: this.getAide(),    
                    id: 'aide_iti'
                    }
            ],
            buttons: [
                {
                text: 'Lieu 1',
                tooltip: 'Lieu 1',
                minWidth: '5',
                maxWidth: '10',
                style: {
                    marginBottom: '5px'
                },
                handler: function(){
                    ol_ajouterlieu1();
                }
                },
                 {
                text: 'Lieu 2',
                tooltip: 'Lieu 2',
                minWidth: '5',
                maxWidth: '10',
                style: {
                    marginBottom: '5px'
                },
                handler: function(){
                     ol_ajouterlieu2();
                }
                },
                 {
                text: 'Lancer itinéraire',
                tooltip: 'Lancer itinéraire',
                minWidth: '5',
                maxWidth: '10',
                style: {
                    marginBottom: '5px'
                },
                handler: function(){
                     ol_ajouter_itineraire();
                     oClickCtrl.deactivate();
                }
                },
                {
                    text: 'Google-Trafic',
                    tooltip: 'Ajouter/Enlever Google-Trafic',
                    minWidth: '5',
                    maxWidth: '10',
                    style: {
                        marginBottom: '5px'
                    },
                    handler: function(){
                            ol_ajoutertrafic();
                    }
                    }
              ]

        });
    };

    return GoogleItineraire;
    
});