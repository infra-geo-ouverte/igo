//require: extjs, carte.js, message.js, point.js, limite.js

define(['outil', 'point', 'occurence', 'style', 'aide', 'vecteur', 'browserDetect'], function(Outil, Point, Occurence, Style, Aide, Vecteur, BrowserDetect) {
    function OutilSaaq(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            id:'saaqOutil',
            icone: Aide.utiliserBaseUri('images/toolbar/localisateur.png'),
            infobulle: 'Positionner un véhicule',
            service: Aide.utiliserBaseUri('../services/saaq/getVehicules.php'),
            serviceGLO: undefined
        });
    };

    OutilSaaq.prototype = new Outil();
    OutilSaaq.prototype.constructor = OutilSaaq;

    OutilSaaq.prototype._init = function(){
        Outil.prototype._init.call(this);
        this.executer();
    };
    
    OutilSaaq.prototype.creerFormWindow = function(){
        var comboBox;
        var that = this;
            
//        this.store = new Ext.data.JsonStore({
//            url: Aide.utiliserProxy(this.options.service),
//            root:'resultat',
//            fields:['nommobile'],
//            sortInfo: { field: 'nommobile', direction: 'ASC'},
//            autoLoad:true
//        });

        comboBox = new Ext.form.TextField({ //ComboBox
            id:'combo_'+id,
            name:'combo',
            fieldLabel: 'Modem',
            allowBlank:false,
            emptyText:'Entrer le modem',
            //store: this.store,
            displayField:'nommobile',
            valueField:'nommobile',
            forceSelection:false,
            mode:'local',
            selectOnFocus:true,
            width:250,
            scope:this,
            listeners: {
                specialkey: function(field, e){
                    if (e.getKey() == e.ENTER) {
                        that.submitForm(comboBox);
                    }
                }
            }
        }); 
            
        //this.store.on('exception', this.gestionErreurStore);
	
        var button_ok = new Ext.Button({
            id:'button_ok'+id,
            type:'button',
            width:50,
            text:'Afficher',
            scope:this,
            handler: function(){this.submitForm(comboBox);}
        });
	
        var button_newPosition = new Ext.Button({
            id:'button_newPosition'+id,
            type:'button',
            width:50,
            text:'Demander une nouvelle position',
            scope:this,
            handler: function(){this.demanderNouvellePosition(comboBox, 'nouvelle');}
        });
       
        var panneau = new Ext.form.FormPanel({
            id:'form_recherche_'+id,
            padding:'5 5 5 5',
            frame:true,
            autoWidth:true,
            width:'auto',
            labelAlign:'top',
            items:[comboBox],
            buttons:[button_newPosition, button_ok]
        });
		
        this.window_recherche = new Ext.Window({
            title:'Afficher un véhicule SAAQ',
            width:300,
            closeAction:'hide',
            resizable:true,
            minimizable:false,
            plain:true,
            bodyStyle:'padding5px',
            items:[panneau]
        });
    };
    
    
    OutilSaaq.prototype.executer =  function () {
	if(!this.window_recherche){
            this.creerFormWindow();
	} else {
            //this.store.reload();
        }
        this.window_recherche.show();
    };


    OutilSaaq.prototype.demanderNouvellePosition = function(comboBox, rechercheNouvelle) {
        var code = comboBox.getValue().toUpperCase();
        if(code === ""){
            var message = "Le nom du modem est obligatoire";
            comboBox.markInvalid(message);
            Aide.afficherMessage({titre: 'Avertissement', message: message});
            return false;
        } else if(code.indexOf(' ') !== -1){
            var message = "Le nom du modem ne doit pas avoir d'espace";
            comboBox.markInvalid(message);
            Aide.afficherMessage({titre: 'Avertissement', message: message});
            return false;
        };
        var that = this;
        if(code){
            that._cancelDemande = false;
            Aide.afficherMessageChargement({
                message: 'Demande en cours, elle peut durer plusieurs minutes, veuiller patientez...', 
                boutons: {cancel:'Annuler la demande'},
                callback: function(bouton){
                    if(bouton == 'cancel'){
                        clearTimeout(that.timer);
                        that.nouvellePositionRequete(code, 'annuler');
                    }
                }
            });
           /* var date = new Date();  
            var year = date.getFullYear();
            var month = parseInt(date.getMonth())+1;
            month = month > 9 ? month : '0'+month; 
            var day = date.getDate() > 9 ? date.getDate() : '0'+date.getDate(); 
            var dateString = year + '-' + month + '-' + day + ' ' + date.toLocaleTimeString();*/
        
            this.nouvellePositionRequete(code, rechercheNouvelle);
            this.cacherForm();
            comboBox.setValue("");
            comboBox.clearInvalid();
        }	
    };
    
    
    OutilSaaq.prototype.nouvellePositionRequete = function(code, rechercheNouvelle){
        $.ajax({
            url: Aide.utiliserProxy(this.options.service),
            data: {
                nom: code,
                recherche: rechercheNouvelle
            },
            cache: false,
            async:false,
            context:this,
            success: function(data){this.nouvellePosition(data, code)},
            dataType:'json',
            error:function(){ Aide.afficherMessage({titre: 'Avertissement', message: 'Une erreur est survenue durant la demande d\'une nouvelle position'});}
        });
    }
    
    OutilSaaq.prototype.nouvellePosition = function(data, code) {
        var that = this;
        if(data.etat.code == 1 || data.etat.code == 2){
            var messageAttente = "Demande en cours";
            if(data.etat.positionListeAttente && data.etat.positionListeAttente !== 1){
                messageAttente = "Position dans la liste d'attente: "+data.etat.positionListeAttente;
            }
            Ext.MessageBox.updateProgress(undefined, messageAttente);
            that.timer = setTimeout(function(){
                that.nouvellePositionRequete(code, 'attendre');
            }, 5000);
            return true;
        } else if(data.etat.code !== 0 && data.etat.code !== 3){
            var message = data.etat.code;
            var messageCode = data.etat.code.trim(" ");
            if(messageCode == "ERR01006"){
                message = "Nom du modem ("+data.etat.mobile+") invalide";
            } else if(messageCode == "ERR01012"){
                message = "Le serveur LAV ne répond pas";
            } else if(messageCode == "ERR01014"){
                message = "Modem '"+data.etat.mobile+"' inexistant";
            } else if(messageCode == "ERR01016"){
                message = "Demande de géoposition déjà en cours";
            } else if(messageCode == "NON-DISPONIBLE"){
                message = "Demande de nouvelle position non-disponible pour le modem '"+data.etat.mobile+"'";
            } else if(messageCode == "Expiration RAFMOB"){
                message = "Délai de réponse expiré pour le modem '"+data.etat.mobile+"'";
            }
            Aide.afficherMessage({titre: 'Avertissement', message: data.etat.code + ": " + message});
        } else {
            Aide.cacherMessageChargement();
        }
        if(data.resultat.length !== 0){
            that.afficherVehicule(data);
        }
        
    };

    OutilSaaq.prototype.submitForm = function(comboBox) {
        var code = comboBox.getValue().toUpperCase();
        if(code === ""){
            var message = "Le nom du modem est obligatoire";
            comboBox.markInvalid(message);
            Aide.afficherMessage({titre: 'Avertissement', message: message});
            return false;
        } else if(code.indexOf(' ') !== -1){
            var message = "Le nom du modem ne doit pas avoir d'espace";
            comboBox.markInvalid(message);
            Aide.afficherMessage({titre: 'Avertissement', message: message});
            return false;
        };
        if(code){
            $.ajax({
                url: Aide.utiliserProxy(this.options.service),
                data: {
                    nom: code
                },
                cache: false,
                async:false,
                context:this,
                success:this.afficherVehicule,
                dataType:'json',
                error:function(){ Aide.afficherMessage({titre: 'Avertissement', message: 'Impossible d\'obtenir les positions du modem'});}
            });

            this.cacherForm();
            comboBox.setValue("");
            comboBox.clearInvalid();
        }	
    };
        
        
    OutilSaaq.prototype.cacherForm = function() {
	this.window_recherche.hide();
    };
    
    OutilSaaq.prototype.creerCouche = function() {
        var style=new Style({
            etiquette: '${ordre}' /*'${heure}:${minute}'*/, 
            icone: Aide.utiliserBaseUri('images/marqueur/fleche-bleue.svg'), 
            iconeHauteur:32, 
            iconeLargeur:32, 
            rotation:"${direction}", 
            etiquetteCouleur:'#2291E1', 
            etiquetteOffsetY: '15' , 
            filtres: [{
                    titre:'Dernière position',
                    filtre: "[ordre]==1",
                    style: {
                        icone: Aide.utiliserBaseUri('images/marqueur/fleche-rouge.svg'),
                        etiquetteCouleur: 'red' 
                    }
                },
                {
                    titre: 'Autre',
                    style:{}
                }
            ]

        });
        
        if(BrowserDetect.browser === 'Explorer' && BrowserDetect.version < 9){
            style=new Style({
                etiquette: '${ordre}' /*'${heure}:${minute}'*/, 
                etiquetteCouleur:'#2291E1', 
                etiquetteOffsetY: '15' , 
                couleur: '#2291E1',
                filtres: [{
                        titre:'Dernière position',
                        filtre: "[ordre]==1",
                        style: {
                            couleur: 'red',
                            etiquetteCouleur: 'red' 
                        }
                    },
                    {
                        titre: 'Autre',
                        style:{}
                    }
                ]

            });
        }

        
        this.vecteurSaaq = new Vecteur({titre: 'Saaq-Vehicule', active: true, styles: style});
        this.carte.gestionCouches.ajouterCouche(this.vecteurSaaq);
        this.initEvenementCouche();
        
        this.creerWindowInfo();
    };
    
    OutilSaaq.prototype.creerWindowInfo = function(){
        var that=this;
        var id = Aide.obtenirNavigateur().obtenirPanneauxParType('PanneauCarte')[0].obtenirId();
        var $carte = $("#"+id); 
        this.windowInfoLeft = $carte.position().left + $carte.width() - 230 - 5;
        this.windowInfoTop = $carte.position().top + $carte.height() - 5;
        
        this.windowInfo = new Ext.Window({        
            id: 'saaqWindowInfo',
            title: 'Saaq',                
            width: 230,                
            //height: 114,    
            x: that.windowInfoLeft,  
            y: that.windowInfoTop,
            closeAction: 'hide',               
            minimizable: false,                
            resizable: false,               
            autoHeight: true,
            plain:true,                
            bodyStyle:'padding:5px;',
            html: 'Aucune Info'
        });

    }
    
    OutilSaaq.prototype.initEvenementCouche = function() { 
        //this.vecteurSaaq.ajouterDeclencheur('occurenceSurvol', this.occurenceSaaqSurvol, {scope: this});
        //this.vecteurSaaq.ajouterDeclencheur('occurenceSurvolFin', this.occurenceSaaqSurvolFin, {scope: this});
        this.vecteurSaaq.ajouterDeclencheur('occurenceClique', this.occurenceSaaqClique, {scope: this});  
    };
    
    OutilSaaq.prototype.occurenceSaaqSurvol = function(e) { 
        var p = e.occurence.obtenirProprietes();
        var jour = p.jour.length == 1 ? '0' + p.jour : p.jour;
        var mois = p.mois.length == 1 ? '0' + p.mois : p.mois;
        var minute = p.minute.length == 1 ? '0' + p.minute : p.minute;
        var seconde = p.seconde.length == 1 ? '0' + p.seconde : p.seconde;
        var html = '';
        html += "<h2>"+p.nommobile+"</h2>";
        html += "<p>Date: "+jour+"/"+mois+"/"+p.annee+"</p>";
        html += "<p>Heure: "+p.heure+":"+minute+":"+seconde+"</p>";

        e.occurence.ouvrirInfobulle({html: html, aFermerBouton: false});
    };
    
    OutilSaaq.prototype.occurenceSaaqSurvolFin = function(e) { 
        e.occurence.fermerInfobulle();
    };
    
    OutilSaaq.prototype.occurenceSaaqClique = function(e) { 
        var that = e.options.scope;
        
        var p = e.occurence.obtenirProprietes();
        
        if(!p.geocodage){
            that.obtenirAdresse(p.lon+" "+p.lat, e.occurence);
        } else {
            that.ouvrirInfoWindow(p);
        }
    };
    
    OutilSaaq.prototype.ouvrirInfoWindow = function(p) { 
        var html = '';
        var titre;
        var jour = p.jour.length == 1 ? '0' + p.jour : p.jour;
        var mois = p.mois.length == 1 ? '0' + p.mois : p.mois;
        var minute = p.minute.length == 1 ? '0' + p.minute : p.minute;
        var seconde = p.seconde.length == 1 ? '0' + p.seconde : p.seconde;
        var direction;
        if(p.direction >= 22.5 && p.direction < 67.5) {
            direction = "Nord-Est";
        } else if(p.direction >= 67.5 && p.direction < 112.5) {
            direction = "Est";
        } else if(p.direction >= 112.5 && p.direction < 157.5) {
            direction = "Sud-Est";
        } else if(p.direction >= 157.5 && p.direction < 202.5) {
            direction = "Sud";
        } else if(p.direction >= 202.5 && p.direction < 247.5) {
            direction = "Sud-Ouest";
        } else if(p.direction >= 247.5 && p.direction < 292.5) {
            direction = "Ouest";
        } else if(p.direction >= 292.5 && p.direction < 337.5) {
            direction = "Nord-Ouest";
        } else {
            direction = "Nord";
        }

        html = '';
        html += "<p>Date: "+jour+"/"+mois+"/"+p.annee+"</p>";
        html += "<p>Heure: "+p.heure+":"+minute+":"+seconde+"</p>";
        html += "<p>Position: "+p.lon.substr(0,8)+", "+p.lat.substr(0,7)+"</p>";
        html += "<p>Vitesse: "+p.vitesse.split('.')[0]+" km/h</p>";
        html += "<p>Direction: "+direction+"</p>";
        html += "<p>No. secteur: "+p.secteur_geo+"</p>";
        //html += "<p>Géocodage: "+"<a class='saaqGeocodageLink' href='javascript:void(0)'>Obtenir</a>"+"</p>";
        html += "<hr>";
        
        var noCiviq, nomRue, ville, codePostal;
        noCiviq = nomRue = ville = codePostal = 'Chargement...';
        var titreAdresse = '<h4>Adresse</h4>';
        if(p.geocodage){
            if (p.geocodage === 'Indisponible'){
                noCiviq = nomRue = ville = codePostal = 'GLO est indisponible';
            } else if(p.geocodage.distance > 200) {
                noCiviq = nomRue = ville = codePostal = 'Inconnu';
            } else {
                noCiviq = p.geocodage.noCiviq;
                nomRue = p.geocodage.nomRue;
                ville = p.geocodage.placeListe[0].nom;
                codePostal = p.geocodage.CP.codePostal;
                if(p.geocodage.distance > 100){
                    titreAdresse = "<h4>Adresse approximative</h4>";
                    noCiviq = '<font color="red">' + noCiviq + '</font>';
                    nomRue = '<font color="red">' + nomRue + '</font>';
                    ville = '<font color="red">' + ville + '</font>';
                    codePostal = '<font color="red">' + codePostal + '</font>';
                };
            }
        } 
        html += "<h4>"+titreAdresse+"</h4>";
        html += "<p>No.: "+noCiviq+"</p>";
        html += "<p>Rue: "+nomRue+"</p>";
        html += "<p>Ville: "+ville+"</p>";
        html += "<p>Code Postal: "+codePostal+"</p>";
        
        var value1, value2, value3, value4, titreInfo, label1, label2, label3, label4;
        if (p.repere_distance) {
            titreInfo = '<h4>Repère</h4>';
            label1 = 'No. Route: ';
            label2 = 'Route: ';
            label3 = 'Km: ';
            label4 = 'Municipalité: ';  
            value1 = p.repere_noroute.substr(p.repere_noroute.search(/[1-9]/));
            value2 = p.repere_nomroute;
            value3 = p.repere_affiche_km;
            value4 = p.repere_municipalite;
            html += "<hr>";
            html += "<h4>"+titreInfo+"</h4>";
            html += "<p>"+label1+value1+"</p>";
            html += "<p>"+label2+value2+"</p>";
            html += "<p>"+label3+value3+"</p>";
            html += "<p>"+label4+value4+"</p>";
        } 
        if (p.sortie_distance) {
            titreInfo = '<h4>Sortie</h4>';
            label1 = 'No. Route: ';
            label2 = 'No. Sortie: ';
            label3 = 'Panneau: ';
            label4 = 'Muncipalite: ';
            value1 = p.sortie_noroute.substr(p.sortie_noroute.search(/[1-9]/));
            value2 = p.sortie_no;
            value3 = p.sortie_message_pan;
            value4 = p.sortie_municipalite;
            html += "<hr>";
            html += "<h4>"+titreInfo+"</h4>";
            html += "<p>"+label1+value1+"</p>";
            html += "<p>"+label2+value2+"</p>";
            //html += "<p>"+label3+value3+"</p>";
            html += "<p>"+label4+value4+"</p>";
        }

        titre = p.nommobile;

        var windowConstruit = false;
        if(this.windowInfo.body){
            this.windowInfo.body.update(html);
            this.windowInfo.setTitle(titre);
            windowConstruit = true;
        } else {
            this.windowInfo.html = html;
            this.windowInfo.title = titre;
            //this.windowInfo.show(); 
            //$('#saaqWindowInfo').on('click', '.saaqGeocodageLink', function(e){console.log(e); return false});
        }
        var left, top;
        if(this.windowInfo.isVisible() && windowConstruit){
            left = this.windowInfo.getPosition()[0];
            top = this.windowInfo.getPosition()[1] + this.windowInfoLastHeight - this.windowInfo.getHeight();
        } else {
            this.windowInfo.show();
            left = this.windowInfoLeft;
            top = this.windowInfoTop - this.windowInfo.getHeight(); 
        }
        this.windowInfoLastHeight = this.windowInfo.getHeight();
        this.windowInfo.setPosition([left,top]);
    };
    
    OutilSaaq.prototype.creerVehicule = function(key, geom, propriete) { 
        propriete.ordre = key+1;
        if(propriete.minute.length == 1){propriete.minute='0'+propriete.minute};
        var vehicule = new Occurence(geom, propriete);
        this.vecteurSaaq.ajouterOccurence(vehicule);
        if(key === 0){
            this.obtenirAdresse(propriete.lon+" "+propriete.lat, vehicule);
        }
    };
    
    OutilSaaq.prototype.obtenirAdresse = function(coord, occurence){ 
        //todo: changer le host
        this.ouvrirInfoWindow(occurence.obtenirProprietes());
        var that=this;
        $.ajax({
            url: Aide.utiliserProxy(this.options.serviceGLO),
            data: {
                type: "REVERSE",
                epsg_sortie: 32198,
                indDebut: 0,
                indFin: 0,
                groupe: 1,
                urlappelant: "/geomsp/",
                texte: coord,
                format: "json",
                _cle: 'glo'
            },
            //crossDomain: true, //utilisation du proxy
            async:false,
            context:this,
            success: function(e){
                if(e.nombreResultat !== 0){
                    occurence.definirPropriete('geocodage', e.geocoderReponseListe[0]);
                }
                that.ouvrirInfoWindow(occurence.obtenirProprietes());
                Aide.cacherMessageChargement();
            },
            dataType:'json',
            error:function(){ 
                occurence.definirPropriete('geocodage', 'Indisponible');
                that.ouvrirInfoWindow(occurence.obtenirProprietes());
                Aide.cacherMessageChargement();
              //  Aide.afficherMessage({titre: 'Erreur', message: 'GLO est indisponible', icone: 'erreur'});
            }
        });
    };

    OutilSaaq.prototype.afficherVehicule = function(data) {
        var that=this;
        if(!this.vecteurSaaq){
            this.creerCouche();
        } else {
            this.vecteurSaaq.enleverTout();
        }
        
        if(data.resultat.length === 0){
            Aide.afficherMessage({titre: 'Avertissement', message: "Aucun résultat trouvé"});
            return true;
        }
        
        data.resultat.sort(this.trierVehicule);

        $.each(data.resultat.reverse(), function(key, value){
            var geom = new Point(value.lon, value.lat, 'EPSG:4326').projeter(that.carte.obtenirProjection());
            that.creerVehicule(key, geom, value);
        });
        
        this.vecteurSaaq.zoomerOccurences(null, 15);

        if(data.etat.fonctionnel === 0){
            var message = "Attention: Aucune nouvelle donnée a été reçue depuis un certain temps";
            Aide.afficherMessage({titre: 'Avertissement', message: message});    
        }
    };


    OutilSaaq.prototype.trierVehicule = function SortByName(a, b){
      var aName = a.id;
      var bName = b.id; 
      return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }
    
    return OutilSaaq;
    
});

