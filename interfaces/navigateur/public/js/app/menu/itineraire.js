/** 
 * Module pour l'objet {@link Panneau.Itineraire}.
 * @module itineraire
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 * @requires panneauOnglet
 */

require.ajouterConfig({
    scope: "itineraire",
    paths: {
        encodedPolyline: 'libs/extension/OpenLayers/EncodedPolyline',
        autocomplete: 'libs/jquery/extensions/autocomplete/jquery.autocomplete.min'
    }
});
  

define(['aide', 'panneau', 'vecteur', 'point', 'ligne', 'limites', 'occurence', 'style', 'outilItineraire', "hbars!template/itineraire", "css!css/itineraire", "css!css/autocomplete", 'autocomplete', 'encodedPolyline'], function(Aide, Panneau, Vecteur, Point, Ligne, Limites, Occurence, Style, OutilItineraire, Template) {
    /** 
     * Création de l'object Panneau.Itineraire.
     * Objet à ajouter à un panneauMenu.
     * @constructor
     * @name Panneau.Itineraire
     * @class Panneau.Itineraire
     * @alias itineraire:Panneau.Itineraire
     * @extends PanneauOnglet
     * @requires itineraire
     * @param {string} [options.id='itineraire-panneau'] Identifiant du panneau.
     * @param {string} [options.titre="Outil d'itinéraire"] Titre du panneau.
     * @returns {Panneau.Itineraire} Instance de {@link Panneau.Itineraire}
     */
    function Itineraire(options) {
        this.options = options || {};
        this._lastIndexRadio = 0;
        this.defautOptions.titre = "Outil d'itinéraire";
        this.defautOptions.id = 'itineraire-panneau';
        this.defautOptions._layout = 'fit';
    };

    Itineraire.prototype = new Panneau();
    Itineraire.prototype.constructor = Itineraire;


    Itineraire.prototype._init = function() {
        this.defautOptions.items = [{
            html: Template({
                racine: Aide.obtenirCheminRacine()
            })
        }];
        Panneau.prototype._init.call(this);
        
        var that=this;
        var initVecteurs = function(){
            that._panel.removeListener('expand',initVecteurs);
            that.initVecteurs();
        };
        this._panel.on("expand", initVecteurs);   
        
    };
    

    
    Itineraire.prototype.initVecteurs = function() {        
        this.proj4326 = "EPSG:4326";
        this.projCarte = this.carte.obtenirProjection();

        this.formulaire = new Itineraire.Formulaire(this);
        this.trajet = new Itineraire.Trajet(this);
        this.marqueurs = new Itineraire.Marqueurs(this);
        this.instructions = new Itineraire.Instructions(this);
        this.resultatLocalisation = new Itineraire.ResultatLocalisation(this);        
    };




    //=====================================================================

    Itineraire.Instructions = function(_) {
        this._ = _;
        this.$ = {
            resume: $('#resume'),
            alternatifTitre: $('#resume h2'),
            descriptionBody: $('#myTable tbody')
        };             
    };
    

    Itineraire.Instructions.prototype.supprimerResume = function(keepAlternativeSwitch) {
        $('#resume table tbody').empty();
        $('#resume .viaRoute').remove();
        if (!keepAlternativeSwitch) {
            $('#resume h2 .button').remove();
        }
    };
    
    Itineraire.Instructions.prototype.afficherResultatItineraire = function() {
        $('#itineraire').show();
    };

    Itineraire.Instructions.prototype.cacherResultatItineraire = function() {
        $('#itineraire').hide();
    };
    
    Itineraire.Instructions.prototype.formaterDistance = function(rDistance) {
        if (rDistance == 0) {
            return 'None';
        };

        if (rDistance >= 100000) {
            return Math.round(rDistance / 1000) + ' km';
        };

        if (rDistance >= 10000) {
            return Math.round(rDistance / 100) / 10 + ' km';
        };

        if (rDistance >= 100) {
            return Math.round(rDistance / 100) / 10 + ' km';
        };

        return rDistance + ' m';
    };

    Itineraire.Instructions.prototype.formaterDuree = function(rDuree) {
        if (rDuree >= 3600) {
            var hour = parseInt(rDuree / 3600);
            var minute = Math.round(((rDuree / 3600) - hour) * 60);
            return hour + ' h ' + minute + ' min';
        };

        if (rDuree >= 60) {
            return Math.round(rDuree / 60) + ' min';
        };

        return rDuree + ' s';
    };

    Itineraire.Instructions.prototype.afficherResume = function(resume, keepAlternativeSwitch) {
        this.supprimerResume(keepAlternativeSwitch);
        var rDistance = resume.total_distance;
        var rDuree = resume.total_time;
        var rDepart = resume.start_point;
        var rArrivee = resume.end_point;
        if (rDepart == '') {
            rDepart = 'Route inconnue';
        }
        ;
        if (rArrivee == '') {
            rArrivee = 'Route inconnue';
        }
        ;

        rDistance = this.formaterDistance(rDistance);
        rDuree = this.formaterDuree(rDuree);

        $('#depart input').val(rDepart); //todo: dans recherche
        $('#arrive input').val(rArrivee); //todo: dans recherche
        
        $('#resume table tbody').append('<tr><th align="left">Distance: </th><td>' + rDistance + '</td><td></td><th align="left">Durée: </th><td>' + rDuree + '</td><td></td></tr>');
    
        if (this._.marqueurs.depart) {
             this._.marqueurs.depart.definirPropriete('titre', rDepart);
        };
        
        if (this._.marqueurs.arrivee) {
             this._.marqueurs.arrivee.definirPropriete('titre', rArrivee);
        };
    };

    Itineraire.Instructions.prototype.formaterDirection = function(direction) {
        if (direction == 'W') {
            return 'ouest';
        } else if (direction == 'E') {
            return 'est';
        } else if (direction == 'S') {
            return 'sud';
        } else if (direction == 'N') {
            return 'nord';
        } else if (direction == 'NE') {
            return 'nord-est';
        } else if (direction == 'NW') {
            return 'nord-west';
        } else if (direction == 'SE') {
            return 'sud-est';
        } else if (direction == 'SW') {
            return 'sud-ouest';
        } else {
            return 'None';
        };
    };

    Itineraire.Instructions.prototype.formaterInstruction = function(instruction, route, direction) {
        if (direction == 'W') {
            return 'ouest';
        } else if (direction == 'E') {
            return 'est';
        } else if (direction == 'S') {
            return 'sud';
        } else if (direction == 'N') {
            return 'nord';
        } else if (direction == 'NE') {
            return 'nord-est';
        } else if (direction == 'NW') {
            return 'nord-west';
        } else if (direction == 'SE') {
            return 'sud-est';
        } else if (direction == 'SW') {
            return 'sud-ouest';
        } else {
            return 'None';
        };
    };

    Itineraire.Instructions.prototype.formaterInstruction = function(noInstruction, route, direction) {
        var directive = 'None';
        var image;
        if (noInstruction == 0) {
            directive = 'None'; //Pas d'instruction
        } else if (noInstruction == 1) {
            directive = 'Continuez';
            image = 'continue.png';
        } else if (noInstruction == 2) {
            directive = 'Tournez légèrement à droite';
            image = 'slight-right.png';
        } else if (noInstruction == 3) {
            directive = 'Tournez à droite';
            image = 'turn-right.png';
        } else if (noInstruction == 4) {
            directive = 'Tournez fortement à droite';
            image = 'sharp-right.png';
        } else if (noInstruction == 5) {
            directive = 'Faites demi-tour';
            image = 'u-turn.png';
        } else if (noInstruction == 6) {
            directive = 'Tournez légèrement à gauche';
            image = 'slight-left.png';
        } else if (noInstruction == 7) {
            directive = 'Tournez à gauche';
            image = 'turn-left.png';
        } else if (noInstruction == 8) {
            directive = 'Tournez fortement à gauche';
            image = 'sharp-left.png';
        } else if (noInstruction == 9) {
            directive = 'Atteignez le point intermédiare';
            image = 'target.png';
        } else if (noInstruction == 10) {
            directive = 'Direction ' + direction;
            image = 'head.png';
        } else if (noInstruction == 11) {
            directive = 'Entrez dans le rond-point';
            image = 'round-about.png';
        } else if (noInstruction == "11-1") {
            directive = 'Au rond-point, prenez la première sortie';
            image = 'round-about.png';
        } else if (noInstruction == "11-2") {
            directive = 'Au rond-point, prenez la deuxième sortie';
            image = 'round-about.png';
        } else if (noInstruction == "11-3") {
            directive = 'Au rond-point, prenez la troisième sortie';
            image = 'round-about.png';
        } else if (noInstruction == "11-4") {
            directive = 'Au rond-point, prenez la quatrième sortie';
            image = 'round-about.png';
        } else if (noInstruction == "11-5") {
            directive = 'Au rond-point, prenez la cinquième sortie';
            image = 'round-about.png';
        } else if (noInstruction == "11-6") {
            directive = 'Au rond-point, prenez la sixième sortie';
            image = 'round-about.png';
        } else if (noInstruction == 12) {
            directive = 'Quittez le rond-point';
            image = 'round-about.png';
        } else if (noInstruction == 13) {
            directive = 'None'; //Rester dans le rond-point;
        } else if (noInstruction == 14) {
            directive = 'Commencez au bout de la rue';
            image = 'head.png';
        } else if (noInstruction == 15) {
            directive = 'Vous êtes arrivé';
            image = 'target.png';
        } else if (noInstruction == 16) {
            directive = 'Entrez dans le sens interdit';
        } else if (noInstruction == 17) {
            directive = 'Entrez le sens interdit';
        } else if (noInstruction == 128) {
            directive = 'Accès restreint';
        } else {
            directive = 'None';
        };

        if ((route != '') && (directive != 'None' || noInstruction != 15)) {
            directive = directive + ' sur ' + route;
        };
        
        if (image){
            image = Aide.utiliserBaseUri('images/itineraire/'+image);
        }

        return {instruction: directive, image: image};
    };
    

    Itineraire.Instructions.prototype.afficherInstructions = function(instructions, route) {
        var that = this;
        $.each(instructions, function(key, value) {
            var noInstruction = value[0];
            var distance = that.formaterDistance(value[2]);
            var direction = that.formaterDirection(value[6]);
            var instructions = that.formaterInstruction(noInstruction, value[1], direction);
            var instructionText = instructions.instruction;
            var instructionImage = instructions.image;

            var x = route.geometry.components[value[3]].x;
            var y = route.geometry.components[value[3]].y;

            var tr = document.createElement('tr');
            var $tr = $(tr);
            $tr.data("x", x);
            $tr.data("y", y);
            if ((noInstruction == 15) || (noInstruction == 10)) {
                $tr.data("estMarqueurs", true);
            }
            ;

            if (instructionText != 'None') {
                var imageDiv = '';
                if (instructionImage){
                    imageDiv = '<img class="instructionImage" alt="" src="'+instructionImage+'">';
                }
                if (distance == 'None') {
                    $tr.append('<td>' + imageDiv + '</td><td align="right">' + (key + 1) + '. </td><td class="directive">' + instructionText + '</td><td></td>');
                } else {
                    $tr.append('<td>' + imageDiv + '</td><td align="right">' + (key + 1) + '. </td><td class="directive">' + instructionText + '</td><td align="right" style="white-space: nowrap;">' + distance + '</td>');
                }
                that.$.descriptionBody.append(tr);
            }
        });
        this.initEventInstructions();
    };

    Itineraire.Instructions.prototype.initEventInstructions = function() {
        var $directive =  $("#myTable .directive");
        $directive.click(this, this.instructionClick);
        $directive.mouseover(this, this.instructionMouseOver);
        $directive.mouseout(this, this.instructionMouseOut);
    };

    Itineraire.Instructions.prototype.instructionMouseOver = function(e) {
        var that = e.data;
        var $instruction = $(e.target).parent();
        var estMarqueurs = $instruction.data('estMarqueurs');

        if (!estMarqueurs) {
            var x = $instruction.data('x');
            var y = $instruction.data('y');
            var type = 'instruction';
            that._.marqueurs.ajouter(x, y, type, 'instructionMouseover');
        };
    };

    Itineraire.Instructions.prototype.instructionMouseOut = function(e) {
        var that = e.data;
        that._.marqueurs.supprimerParOrigine('instructionMouseover');
    };
    
    Itineraire.Instructions.prototype.instructionClick = function(e) {
        var that = e.data;
        var $instruction = $(e.target).parent();
        var x = $instruction.data('x');
        var y = $instruction.data('y');
        var type = 'instruction';
        var estMarqueurs = $instruction.data('estMarqueurs');

        if (!estMarqueurs) {
            that._.marqueurs.supprimerParType(type);
            that._.marqueurs.ajouter(x, y, type); //todo: titre?
        };
        
        var point = new Point(x,y);  
        that._.carte.definirCentre(point);
        that._.carte.definirZoom(14);
    };

    Itineraire.Instructions.prototype.afficherItineraireDescription = function(json, route, keepAlternativeSwitch, alternatif) {
        this.jsonReponseItineraire = json;
        this.$.descriptionBody.empty();
        this._.resultatLocalisation.cacher();
        this._.instructions.afficherResultatItineraire();

        var route_summary, route_name, route_instructions;
        if (alternatif) {
            route_summary = json.alternative_summaries[0];
            route_name = json.alternative_names[0];
            route_instructions = json.alternative_instructions[0];
        } else {
            route_summary = json.route_summary;
            route_name = json.route_name;
            route_instructions = json.route_instructions;
        };

        this.afficherResume(route_summary, keepAlternativeSwitch);
        this.afficherVia(route_name);
        if (!keepAlternativeSwitch && json.found_alternative) {
            this.afficherItineraireAlternatifSwitch();
        }
        this.afficherInstructions(route_instructions, route);
    };


    Itineraire.Instructions.prototype.afficherVia = function(via) {
        if (via[0] == "" && via[1] == "") {
            return true;
        };

        var string = "<div class='viaRoute'>";
        string += "<b>Via: </b>";

        if (via.length == 2 && via[0] !== "" && via[1] !== "") {
            string += via[0] + ', ' + via[1];
        } else if (via[0] && via[0] !== "") {
            string += via[0];
        } else if (via[1] && via[1] !== "") {
            string += via[1];
        };

        string += "</div>";
        this.$.resume.append(string);
    };

    Itineraire.Instructions.prototype.afficherItineraireAlternatifSwitch = function() {
        this.$.alternatifTitre.prepend("<div class='button button-pressed'>A</div>");
        this.$.alternatifTitre.prepend("<div class='button button-notPressed'>B</div>");

        this.initEventItineraireAlternatif();
    };


    Itineraire.Instructions.prototype.initEventItineraireAlternatif = function() {
        this.$.alternatifTitre.find('div').click(this, this.changerItineraireClique);
        //todo: peut etre interessant de laisser l'afficher l'autre trajet sur un mouseover
        this.$.alternatifTitre.find('div').mouseover(this, this.changerItineraireMouseOver);
        this.$.alternatifTitre.find('div').mouseout(this, this.changerItineraireMouseOut);
    };
    
    Itineraire.Instructions.prototype.changerItineraireClique = function(e) {
        if (e.target.classList[1] === "button-pressed") {
            return true;
        };
        
        var that = (e ? e.data : this);
        var cible = e.target.textContent;
        var pressed = that.$.resume.find('.button-pressed');
        var notPressed = that.$.resume.find('.button-notPressed');

        pressed.removeClass('button-pressed');
        pressed.addClass('button-notPressed');
        notPressed.removeClass('button-notPressed');
        notPressed.addClass('button-pressed');

        that._.marqueurs.supprimerParType('instruction');
        if (cible === "B") {
            var route = that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.alternative_geometries[0]);
            that.afficherItineraireDescription(that.jsonReponseItineraire, route, true, true);
        } else {
            var route = that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.route_geometry);
            that.afficherItineraireDescription(that.jsonReponseItineraire, route, true);
        }
    };

    Itineraire.Instructions.prototype.changerItineraireMouseOver = function(e) {
        if (e.target.classList[1] === "button-pressed") {
            return true;
        };
        
        var that = (e ? e.data : this);
        var cible = e.target.textContent;

        if (cible === "B") {
            var route = that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.alternative_geometries[0]);
        } else {
            var route = that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.route_geometry);
        }
    };
    
    Itineraire.Instructions.prototype.changerItineraireMouseOut = function(e) {
        if (e.target.classList[1] === "button-pressed") {
            return true;
        };
        
        var that = (e ? e.data : this);
        var cible = e.target.textContent;

        if (cible === "A") {
            var route = that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.alternative_geometries[0]);
        } else {
            var route = that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.route_geometry);
        }
    };
    
    //=====================================================================

    //
    Itineraire.Marqueurs = function(_) {
        this._ = _;
        this.depart;
        this.arrivee;
        this.intermediaires = [];
        this.iPixels = 0;
        this.vecteur = new Vecteur({titre: 'marqueursItineraire', active: true, visible:false, selectionnable: false});
        this._.carte.gestionCouches.ajouterCouche(this.vecteur);
        this.initEvent();
    };
    
    //
    Itineraire.Marqueurs.prototype.initEvent = function() {   
        this.initCliqueCarte();
        this.initCliqueMarqueurs();
        this.initDeplacementMarqueurs();
    };

    //
    Itineraire.Marqueurs.prototype.initCliqueCarte = function() {
        var that=this;
        
        //this._.carte.ajouterDeclencheur('clique', this.cliqueCarte, {scope: this});
        //this.activerControles();
        this.outilItineraire = new OutilItineraire({panneauItineraire: this});
        var barreOutils = Aide.obtenirNavigateur().barreOutils;
        barreOutils.ajouterOutil(this.outilItineraire);
        this.outilItineraire.enfoncerBouton();
                
        this._._panel.on("expand", function(){
            that.outilItineraire.enfoncerBouton();
        }); 
        this._._panel.on("collapse", function(){
            that.outilItineraire.releverBouton();
        });
    };

    Itineraire.Marqueurs.prototype.activerControles = function() {
       //Igo.nav.barreOutils._mapContainer.topToolbar.disable();
        //this._.carte.controles.activerDeplacement(); 
        this._.carte.ajouterDeclencheur('clique', this.cliqueCarte, {scope: this});
        this._.carte.controles.activerClique();
        //this.vecteur.controles.activerClique();
        this.vecteur.controles.activerDeplacement({combinaisonClique: true});
    };

    Itineraire.Marqueurs.prototype.desactiverControles = function() {
        this._.carte.enleverDeclencheur('clique', null, this.cliqueCarte);
        //this._.carte.controles.desactiverClique();
       // Igo.nav.barreOutils._mapContainer.topToolbar.enable();
        //this.vecteur.controles.desactiverClique();
        this.vecteur.controles.desactiverDeplacement();
    };

    //
    Itineraire.Marqueurs.prototype.initCliqueMarqueurs = function() {
        this.vecteur.ajouterDeclencheur('occurenceClique', this.marqueursClique, {scope: this});
    };
    
    //
    Itineraire.Marqueurs.prototype.initDeplacementMarqueurs = function() {
        //this.vecteur.controles.activerDeplacement({combinaisonClique: true});
        this.vecteur.ajouterDeclencheur('debutDeplacementOccurence', this.debutDeplacementMarqueurs, {scope: this});
        this.vecteur.ajouterDeclencheur('deplacementOccurence', this.deplacementMarqueurs, {scope: this});
        this.vecteur.ajouterDeclencheur('finDeplacementOccurence', this.finDeplacementMarqueurs, {scope: this});
    };

    Itineraire.Marqueurs.prototype.obtenirIcone = function(type) {
        if (type == 'depart') {
            return Aide.utiliserBaseUri("images/marqueur/marker-green.png");
        } else if (type == 'arrivee') {
            return Aide.utiliserBaseUri("images/marqueur/marker-orange.png");
        } else if (type == 'intermediaire') {
            return Aide.utiliserBaseUri("images/marqueur/marker-blue.png");
        };
        return Aide.utiliserBaseUri("images/marqueur/marker-yellow.png");
    };

    //todo: objet en parametre
    Itineraire.Marqueurs.prototype.ajouter = function(x, y, type, origine, titre) {
        var icon = this.obtenirIcone(type);

        var point = new Point(x, y);
        var propriete = {type: type, origine: origine};
        var style = new Style({icone: icon, iconeLargeur: 20, iconeHauteur: 34, iconeOffsetY: -34});
                
        var occurence = new Occurence(point, propriete, style);
        this.vecteur.ajouterOccurence(occurence);

        if(titre){
            occurence.definirPropriete('titre', titre);
        };
        
        if(!origine){ //mettre un origine?
            if(type == 'arrivee'){
                this.arrivee = occurence;
            } else if (type == 'depart') {
                this.depart = occurence;
            } else if (type == 'intermediaire') {
                this.intermediaires.push(occurence);
            };
        };
        
        return occurence;
    };

    //
    Itineraire.Marqueurs.prototype.cliqueCarte = function(e) {
        var that = e.options.scope;
        if (!that.depart) {
            var feature = that.ajouter(e.point.x, e.point.y, 'depart');
            that._.formulaire.geocodageInverse(e.point, feature, $('#depart input'));
        } else if (!that.arrivee) {
            var feature = that.ajouter(e.point.x, e.point.y, 'arrivee');
            that._.formulaire.geocodageInverse(e.point, feature, $('#arrive input'));
        } else {
            var feature = that.ajouter(e.point.x, e.point.y, 'intermediaire');
            feature.definirPropriete('ordre', that.intermediaires.length); //todo: vérifier si ca marche !
        };

        if (that.arrivee) {
            var points = [];
            points.push(that.depart);
            points = points.concat(that.intermediaires);
            points.push(that.arrivee);
            that._.trajet.trouverItineraire(points);
        };
        //todo controle that.vecteur.controles.activerDeplacement();
    };

    Itineraire.Marqueurs.prototype.changerTypeMarqueurs = function(feature, type) {
        if (!feature) {
            return false;
        };
        //todo mode igo
        feature.definirProprieteStyle('icone', this.obtenirIcone(type));
        feature.definirPropriete('type', type);
        return feature;
    };



    Itineraire.Marqueurs.prototype.marqueursClique = function(e) {
        var occurence = e.occurence;
        var that = e.options.scope;
        
        that.vecteur.controles.desactiverDeplacement();
        //todo controlethat.vecteur.controles.desactiverSelection();
        var type = occurence.obtenirPropriete('type');
        that.supprimerOccurences(occurence);
        that._.formulaire.definirInput(type, '');
        that._.instructions.cacherResultatItineraire();
        that._.formulaire.trouverItineraireClick();
        //todo controlethat.vecteur.controles.activerSelection();
        that.vecteur.controles.activerDeplacement({combinaisonClique: true});
    };

    Itineraire.Marqueurs.prototype.supprimerOccurences = function(occurences) {
        var that=this;
        if(!$.isArray(occurences)){occurences = [occurences];};
        
        $.each(occurences, function(key, value) {
            that.vecteur.enleverOccurence(value);
            var type = value.obtenirPropriete('type');
            if (type === 'depart'){
                that.depart = null;
            } else if (type === 'arrivee'){
                that.arrivee = null;
            } else {
                that.intermediaires.remove(value);
            };
        });
    };
    
    Itineraire.Marqueurs.prototype.snapMarkers = function() { //todo: snapTrajet 
        var that = this;
        var route = this._.trajet.vecteur.obtenirOccurences()[0];

        if (route) {
            if (this.depart) {
                var pDepart = route.points[0];
                this.depart.deplacer(pDepart);
            };
            if (this.arrivee) {
                var pFin = route.points[route.points.length-1];
                this.arrivee.deplacer(pFin);
            };
 
            $.each(this.intermediaires, function(key, value) {
                var dist = -1;
                var nearestPoint;
                $.each(route.points, function(key2, value2) {
                    var newDist = value.distanceDe(value2);
                    if (!nearestPoint || dist > newDist) {
                        dist = newDist;
                        nearestPoint = value2;
                    }
                });
                value.deplacer(nearestPoint);
            });
        }
    };
    

    Itineraire.Marqueurs.prototype.debutDeplacementMarqueurs = function(e) {
        var that = e.options.scope;
        that._.resultatLocalisation.supprimer();
        $('#resume .viaRoute').remove();
        $('#resume h2 .button').remove();
        $('#myTable tbody').text('Votre itinéraire est en cours de calcul');

        var occurence = e.occurence;
        
        if (occurence.obtenirPropriete('type') !== 'instruction') {
            that.supprimerParType('instruction');
            return true;
        }

        var iKey = {};
        if (that.intermediaires.length != 0) {
            $.each(that._.trajet.vecteur.obtenirOccurences()[0].points, function(key, value) {
                $.each(that.intermediaires, function(keyInt, valueInt) {
                    if (!iKey[keyInt] && Math.abs(value.x - valueInt.x) < 0.001 && Math.abs(value.y - valueInt.y) < 0.001) {
                        iKey[keyInt] = key;
                    }
                });
                if (Math.abs(value.x - occurence.x) < 0.001 && Math.abs(value.y - occurence.y) < 0.001) {
                    return false;
                }
            });
        };
        
        occurence = that.changerTypeMarqueurs(occurence, 'intermediaire');
        var lengthIKey = Object.keys(iKey).length;
        occurence.definirPropriete('ordre', lengthIKey + 1);
        for (var i = lengthIKey; i < that.intermediaires.length; i++) {
            that.intermediaires[i]._feature.attributes.ordre += 1;
        };
        that.intermediaires.push(occurence);
        that.intermediaires.sort(that.trierMarqueurs);
    };

    Itineraire.Marqueurs.prototype.deplacementMarqueurs = function(e) {
        var that = e.options.scope;
        
        if (that.iPixels == 10) {         
            if (that.depart && that.arrivee) {
                var points = [];
                points.push(that.depart);
                var points = points.concat(that.intermediaires);
                points.push(that.arrivee);
 
                that._.trajet.trouverItineraire(points, true);
            } else {
                var input = $('#depart input');
                if(e.occurence.obtenirPropriete('type') === 'arrivee'){
                   input = $('#arrive input');
                }
                that._.formulaire.geocodageInverse(e.occurence, e.occurence, input);
            }
            that.iPixels = 0;
        } else {
            that.iPixels++;
        }
    };

    Itineraire.Marqueurs.prototype.trierMarqueurs = function(a, b) {
        var aOrdre = a.obtenirPropriete('ordre') || 0;
        var bOrdre = b.obtenirPropriete('ordre') || 0;
        return ((aOrdre < bOrdre) ? -1 : ((aOrdre > bOrdre) ? 1 : 0));
    };

    Itineraire.Marqueurs.prototype.finDeplacementMarqueurs = function(e) {
        var that = e.options.scope;
        if (that.depart && that.arrivee) {
            that._.formulaire.trouverItineraireClick();
        } else {
            var input = $('#depart input');
            if(e.occurence.obtenirPropriete('type') === 'arrivee'){
               input = $('#arrive input');
            }
            that._.formulaire.geocodageInverse(e.occurence, e.occurence, input);
        }
        

            //todo? fait planter le prochain select...
        //that._.carte._carteOL.setLayerZIndex(that.vecteur._layer, that._.carte._carteOL.Z_INDEX_BASE["Feature"] + 10);
    };
    
    //
    Itineraire.Marqueurs.prototype.supprimerTout = function() {
        this.vecteur.enleverTout();
        this.depart = null;
        this.arrivee = null;
        this.intermediaires = [];
    };

    //
    Itineraire.Marqueurs.prototype.supprimerParType = function(type) {
        var featureToDelete = [];
        $.each(this.vecteur.obtenirOccurences(), function(key, value) {
            if (value.obtenirPropriete('type') === type) {
                featureToDelete.push(value);
            };
        });
        this.supprimerOccurences(featureToDelete);
    };

    //
    Itineraire.Marqueurs.prototype.supprimerParOrigine = function(origine) {
        var featureToDelete = [];
        $.each(this.vecteur.obtenirOccurences(), function(key, value) {
            if (value.obtenirPropriete('origine') === origine) {
                featureToDelete.push(value);
            };
        });
        this.supprimerOccurences(featureToDelete);
    };

    //
    Itineraire.Marqueurs.prototype.cacherParType = function(type) {
        $.each(this.vecteur.obtenirOccurences(), function(key, value) {
            if (value.obtenirPropriete('type') === type) {
                this.vecteur.cacherOccurence(value);
            };
        });
    };

    //
    Itineraire.Marqueurs.prototype.afficherTout = function(type) {
        $.each(this.vecteur.obtenirOccurences(), function(key, value) {
            if (!value.estAffichee()) {
                this.vecteur.afficherOccurence(value);
            };
        });
    };

    //
    Itineraire.Marqueurs.prototype.afficherParType = function(type) {
        $.each(this.vecteur.obtenirOccurences(), function(key, value) {
            if (value.obtenirPropriete('type') === type) {
                this.vecteur.afficherOccurence(value);
            };
        });
    };
    
    //=====================================================================

    Itineraire.Trajet = function(_) {
        this._ = _;
        var styles = {
            'defaut': new Style({
                'limiteEpaisseur': 6,
                'limiteCouleur': '#8FCCD6',
                'limiteOpacite': '0.8'
            }),
            'select': new Style({
                'limiteEpaisseur': 6,
                'limiteCouleur': '#000000',
                'limiteOpacite': '0.8'
            })
        };        
        this.vecteur = new Vecteur({titre:'trajetItineraire', styles: styles, active: true, visible:false, selectionnable: false}); 
        this._.carte.gestionCouches.ajouterCouche(this.vecteur);
    };

    //
    Itineraire.Trajet.prototype.supprimer = function() {
        this.vecteur.enleverTout();
    };
    
    Itineraire.Trajet.prototype.afficherItineraireCarte = function(geometryEncoded) { //todo ajouter
        var route = this.formaterRouteGeometrie(geometryEncoded);
        
        while(isNaN(route.geometry.components[route.geometry.components.length-1].x)){
            route.geometry.components.pop();
        };

        var routeIGO = new Ligne(route.geometry.components); //todo new Ligne
        this.vecteur.creerOccurence(routeIGO);
        this.supprimerAncienTrajet();
        return route;
    };

    Itineraire.Trajet.prototype.trouverItineraire = function(points, rapide) {
        var that = this;
        this.points = points;
        var loc = "";
        $.each(points, function(key, value) {
            var p = value.projeter(that._.projCarte, that._.proj4326);
            if (p.x) {
                //loc = loc + '&loc[]=' + p.y + ',' + p.x;
                loc = loc + '&loc=' + p.y + ',' + p.x;
            } else {
                //loc = loc + '&loc[]=' + p.lat + ',' + p.lon;
                loc = loc + '&loc=' + p.lat + ',' + p.lon;
            }
            ;
        });

        var url;
        var graph = $('#rechercheType select').val(); //todo $variable
        
        if (rapide) {
            url = this._.options.service + "?graph=" + graph + "?output=json&compression=true&z=14" + loc;
            //url = "http://spssogl97d.sso.msp.gouv.qc.ca/Services/itineraire.php?graph=" + graph + "&output=json&compression=true&z=14" + loc;
        } else {
            url = this._.options.service + "?graph=" + graph + "?output=json&compression=true&z=14&instructions=true" + loc;
            //url = "http://spssogl97d.sso.msp.gouv.qc.ca/Services/itineraire.php?graph=" + graph + "&output=json&compression=true&instructions=true" + loc;
        };

        if (!rapide || this.ajaxItineraireComplete != false) {
            this.ajaxItineraireComplete = false;
            $.ajax({
                dataType: 'jsonp',
                //url: Aide.utiliserProxy(url),
                url: url,
                jsonp: "jsonp",
                cache : true,
                //crossDomain: true, //utilisation du proxy
                context: this,
                success: function(response) {
                    that.trouverItineraireSuccess(response, rapide);
                },
                complete: function() {
                    this.ajaxItineraireComplete = true;
                }
            });
        } else {
            //console.log(false);
        }
    };

    Itineraire.Trajet.prototype.trouverItineraireSuccess = function(response, rapide) {
        if (response.status == 207) {
            this.trouverItineraireEchec();
            return false;
        }
        var route = this.afficherItineraireCarte(response.route_geometry);

        if (rapide) {
            this._.instructions.afficherResume(response.route_summary);
        } else {
            this._.instructions.afficherItineraireDescription(response, route);
            this._.marqueurs.snapMarkers();
            //this.vecteur.zoomerOccurences();
        };
    };

    Itineraire.Trajet.prototype.trouverItineraireEchec = function() {
        this._.resultatLocalisation.cacher();
        this._.instructions.afficherResultatItineraire();
        this.supprimer();

        this._.instructions.supprimerResume();
        this._.instructions.$.descriptionBody.text('Ne peux pas trouver de route entre les points'); //mettre dans instructions...
    };


    Itineraire.Trajet.prototype.formaterRouteGeometrie = function(routeEncoded) {
        this.formatEncoded = this.formatEncoded || new OpenLayers.Format.EncodedPolyline();
        var route = this.formatEncoded.read(routeEncoded);
        route.geometry.transform(new OpenLayers.Projection(this._.proj4326), new OpenLayers.Projection(this._.projCarte));
        return route;
    };

    Itineraire.Trajet.prototype.supprimerAncienTrajet = function() {
        while (this.vecteur.obtenirOccurences().length > 1) {
            this.vecteur.enleverOccurence(this.vecteur.obtenirOccurences()[0]);
        };
    };


    //=====================================================================

    //
    Itineraire.Formulaire = function(_) {
        this._ = _;
        this.$ = {
            departInput: $("#depart input"),
            departLoading: $("#depart .loadingItineraireInput"),
            arriveeInput: $("#arrive input"),
            arriveeLoading: $("#arrive .loadingItineraireInput"),
            trouverBouton: $("#trouverItineraire"),
            inverserBouton: $("#inverserItineraire"),
            reinitialiserBouton: $("#reinitialiserItineraire")
        };
        this.initEvent();
    };
    
    //
    Itineraire.Formulaire.prototype.initEvent = function(){
        var that=this;
        this.initAutoComplete();
        
        //mettre les keyup dans resultatLocalisation?
        this.$.departInput.keyup( function(event){
            if (event.keyCode == 13) {
                that.rechercherDepart();
            }
        });

        this.$.arriveeInput.keyup(function(event) {
            if (event.keyCode == 13) {
                that.rechercherArrivee();
            }
        });

        this.$.trouverBouton.click(this, this.trouverItineraireClick);
        this.$.inverserBouton.click(this, this.inverserItineraireClick);
        this.$.reinitialiserBouton.click(this, this.reinitialiserItineraireClick);
    };

    Itineraire.Formulaire.prototype.inverserItineraireClick = function(e) {
        var that = (e ? e.data : this);
        this.blur();
        var textFin = $('#arrive input').val();
        $('#arrive input').val($('#depart input').val());
        $('#depart input').val(textFin);
        that._.resultatLocalisation.cacher();
        that._.marqueurs.supprimerParType('instruction');

        that._.marqueurs.vecteur._layer.features = that._.marqueurs.vecteur._layer.features.reverse();
        that._.marqueurs.intermediaires = that._.marqueurs.intermediaires.reverse();
        var depart, arrivee;
        var iInt = 1;
        if (that._.marqueurs.depart) {
                depart = that._.marqueurs.depart;
                depart.definirPropriete('titre', $('#arrive input').val());
                that._.marqueurs.changerTypeMarqueurs(depart, 'arrivee');
        } 
        if (that._.marqueurs.arrivee) {
                arrivee = that._.marqueurs.arrivee;
                arrivee.definirPropriete('titre', $('#depart input').val());
                that._.marqueurs.changerTypeMarqueurs(arrivee, 'depart');
        }
        $.each(that._.marqueurs.intermediaires, function(key, value) {
            value.definirPropriete('ordre', iInt);
            iInt++;
        });        
        
        that._.marqueurs.depart = arrivee; 
        that._.marqueurs.arrivee = depart;
        
        that.trouverItineraireClick();
    };
    
    //
    Itineraire.Formulaire.prototype.rechercherDepart = function(premierResultat) {
        this._.trajet.supprimer();
        this._.marqueurs.supprimerParType('intermediaire');
        this._.marqueurs.supprimerParType('depart');
        this._.resultatLocalisation.supprimer();

        var text = this.$.departInput.val();
        this.rechercherLieu(text, 'depart', premierResultat);
    };

    //
    Itineraire.Formulaire.prototype.rechercherArrivee = function(premierResultat) {
        this._.trajet.supprimer();
        this._.marqueurs.supprimerParType('intermediaire');
        this._.marqueurs.supprimerParType('arrivee');
        this._.resultatLocalisation.supprimer();

        var text = this.$.arriveeInput.val();
        this.rechercherLieu(text, 'arrivee', premierResultat);
    };

    //
    Itineraire.Formulaire.prototype.trouverItineraireClick = function(e) {
        var that = (e ? e.data : this);
        if (this.blur) {
            this.blur();
        };
        
        var departTitre, arriveeTitre;
        if(that._.marqueurs.depart){
            departTitre = that._.marqueurs.depart.obtenirPropriete('titre');
        };
        
        if(that._.marqueurs.arrivee){
            arriveeTitre = that._.marqueurs.arrivee.obtenirPropriete('titre');
        };
        
        if ((!departTitre && that.$.departInput.val() != "") || (departTitre != that.$.departInput.val())) {
            that.rechercherDepart(true);
            return true;
        };
        
        if ((!arriveeTitre && that.$.arriveeInput.val() != "") || (arriveeTitre != that.$.arriveeInput.val())) {
            that.rechercherArrivee(true);
            return true;
        };
        
        that.lancerRechercheTrajet();
    };
    
    Itineraire.Formulaire.prototype.reinitialiserItineraireClick = function(e) {
        var that = (e ? e.data : this);
        this.blur();
        that._.trajet.supprimer();
        that._.marqueurs.supprimerTout();

        $('#arrive input').val("");
        $('#depart input').val("");

        that._.instructions.cacherResultatItineraire();
        that._.resultatLocalisation.cacher();
    };
    
     
    //
    Itineraire.Formulaire.prototype.lancerRechercheTrajet = function(){
        var depart = this._.marqueurs.depart;
        var arrivee = this._.marqueurs.arrivee;
        var intermediaires = this._.marqueurs.intermediaires;
        if (depart && arrivee) {
            var points = [];
            points.push(depart);
            points = points.concat(intermediaires);
            points.push(arrivee);
            this._.trajet.trouverItineraire(points);
        } else {
            this._.trajet.supprimer();
            this._.instructions.cacherResultatItineraire();
        };
    };
     

   Itineraire.Formulaire.prototype.rechercherLieu = function(texte, type, premierResultat) {
        var limiteResultats = premierResultat? 1 : 15;
        if(texte){
            Aide.afficherMessageChargement({titre: "Itineraire"});
            //var bbox = this._.carte.obtenirLimites().projeter(this._.projCarte, this._.proj4326);
            //var bboxFormated = bbox.gauche + ',' + bbox.bas + ',' + bbox.droite + ',' + bbox.haut;
          // var url = "http://nominatim.openstreetmap.org/search?format=json&accept-language=fr&limit="+limiteResultats+"&q=" + texte + "&viewbox=" + bboxFormated;    
           var url = this._.options.serviceGLO;
           var tjrsProxy = this._.options.cle ? true : false;
           $.ajax({
                url: Aide.utiliserProxy(url, tjrsProxy),
                data: {
                    texte: texte,
                    type: "adresse",
                    epsg_sortie: this._.carte.obtenirProjection().split(":")[1],
                    indDebut: 0,
                    indFin: limiteResultats,
                    format: "JSON",
                    groupe: 1,
                    urlappelant: this._.options.cle ? undefined : this._.options.urlAppelant,
                    _cle: this._.options.cle
                },
                context: this,
                success: function(response) {
                    this.$.departInput.autocomplete().hide();
                    this.$.arriveeInput.autocomplete().hide();
                    this.rechercherLieuSuccess(response, type, premierResultat);
                },
                error: function(e){
                    //afficher message error dans panneau
                    console.log(e.responseText);
                    Aide.cacherMessageChargement();
                }
            });
        }
    };

    //
    Itineraire.Formulaire.prototype.rechercherLieuSuccess = function(response, type, premierResultat) {
        var that = this;
        if (premierResultat){
            var pos;
            var adresse = response.geocoderReponseListe[0];
            if(!adresse){
                console.warn("Pas de résultat");
                Aide.cacherMessageChargement();
                return false;
            }
            var loc = adresse.localisation;
            if(loc.point.x && loc.point.y){
                pos = new Point(loc.point.x, loc.point.y);
            } else if (loc.enveloppe.Xmax){
                var limites = new Limites(loc.enveloppe.Xmin, loc.enveloppe.Ymin, loc.enveloppe.Xmax, loc.enveloppe.Ymax);
                pos = limites.obtenirCentroide();
                pos.limites = limites;
            } else {
                console.warn("Pas de géométrie");
                Aide.cacherMessageChargement();
                return false;
            }
            this._.marqueurs.ajouter(pos.x, pos.y, type, null, adresse.adresseLibre);
            if (type == 'depart') {
                this.$.departInput.val(adresse.adresseLibre);
            } else if (type == 'arrivee') {
                this.$.arriveeInput.val(adresse.adresseLibre);
            }
            this.trouverItineraireClick();
            Aide.cacherMessageChargement();
            return true;
        }

        if(response.geocoderReponseListe.length === 0){
            var tr = document.createElement('tr');
            var $tr = $(tr);
            $tr.append('<td><h3 style="font-size:120%;">' + "Aucun résultat" + '</h3></td>');
            this._.resultatLocalisation.$.resultatBody.append(tr);
        } else {
            $.each(response.geocoderReponseListe, function(key, adresse) {
                var loc = adresse.localisation;
                if(loc.point.x && loc.point.y){
                    pos = new Point(loc.point.x, loc.point.y);
                } else if (loc.enveloppe.Xmax){
                    var limites = new Limites(loc.enveloppe.Xmin, loc.enveloppe.Ymin, loc.enveloppe.Xmax, loc.enveloppe.Ymax);
                    pos = limites.obtenirCentroide();
                    pos.limites = limites;
                } else {
                    console.warn("Pas de géométrie");
                    return true;
                }

                var x = pos.x;
                var y = pos.y;

                var tr = document.createElement('tr');
                var $tr = $(tr);
                $tr.data("x", x);
                $tr.data("y", y);
                $tr.data("type", type);
                $tr.append('<td class="directive">' + adresse.adresseLibre + '</td>');
                that._.resultatLocalisation.$.resultatBody.append(tr);
            });
        }
        this._.instructions.cacherResultatItineraire();
        this._.resultatLocalisation.afficher();
        this._.resultatLocalisation.initEvent();
        Aide.cacherMessageChargement();
    };

 //todo à séparer
    Itineraire.Formulaire.prototype.initAutoComplete = function() {
        var that=this;
        //var bbox = this._.carte.obtenirLimites().projeter(this._.projCarte, this._.proj4326);
        //var bboxFormated = bbox.gauche + ',' + bbox.bas + ',' + bbox.droite + ',' + bbox.haut;
        
        //todo: mettre le service dans les params de Itineraire...
        //todo: à remplacer par le glo v6 lorsque le format json sera supporté
        //var url = Aide.utiliserProxy("http://nominatim.openstreetmap.org/search?format=json&accept-language=fr&limit=5&viewbox=" + bboxFormated);
        var tjrsProxy = this._.options.cle ? true : false;
        var url = Aide.utiliserProxy(this._.options.serviceGLO, tjrsProxy);
        this.$.departInput.autocomplete({
            serviceUrl: url,
            paramName: 'texte',
            dataType: 'json',
            showNoSuggestionNotice: true,
            transformResult: function(response) {
                return {
                    suggestions: $.map(response.geocoderReponseListe, function(dataItem) {
                        return { value: dataItem.adresseLibre, loc: dataItem.localisation};
                    })
                };
            },
            onSearchStart: function (query) {
                that.$.departLoading.show();
                $.extend(query, {
                    type: "adresse",
                    epsg_sortie: that._.carte.obtenirProjection().split(":")[1],
                    indDebut: 0,
                    indFin: 5,
                    format: "JSON",
                    groupe: 1,
                    urlappelant: that._.options.cle ? undefined : that._.options.urlAppelant,
                    _cle: that._.options.cle
                });
            },      
            onSearchComplete: function (query) {
                that.$.departLoading.hide();
            },
            beforeRender: function(container){
                if(!$(this).is(":focus")){
                    container[0].innerHTML= "";
                    setTimeout(function(){ 
                        $(container[0]).hide();
                    }, 1);
                }
            },
            onSelect: function (suggestion) {
                
                if (that._.marqueurs.depart) {
                    if(that._.marqueurs.depart.obtenirPropriete('titre') === that.$.departInput.val()){
                        return;
                    }
                };

                if(that.$.departInput.val()){
                    var pos;
                    var loc = suggestion.loc;
                    if(loc.point.x && loc.point.y){
                        pos = new Point(loc.point.x, loc.point.y);
                    } else if (loc.enveloppe.Xmax){
                        var limites = new Limites(loc.enveloppe.Xmin, loc.enveloppe.Ymin, loc.enveloppe.Xmax, loc.enveloppe.Ymax);
                        pos = limites.obtenirCentroide();
                        pos.limites = limites;
                    } else {
                        console.warn("Pas de géométrie");
                        return true;
                    }
                    
                    var type = 'depart';
                    that._.marqueurs.supprimerParType(type);
                    that._.marqueurs.ajouter(pos.x, pos.y, type, null, that.$.departInput.val());
                    /*that._.carte.definirCentre(point);
                    that._.carte.definirZoom(14);*/
                    that._.formulaire.trouverItineraireClick();
                };
            },
            minChars: 3
        });    
        
        this.$.departInput.focus(function() { $(this).select(); } );
        
        this.$.arriveeInput.autocomplete({
            serviceUrl: url,
            paramName: 'texte',
            dataType: 'json',
            showNoSuggestionNotice: true,
            transformResult: function(response) {
                return {
                    suggestions: $.map(response.geocoderReponseListe, function(dataItem) {
                        return { value: dataItem.adresseLibre, loc: dataItem.localisation};
                    })
                };
            },
            onSearchStart: function (query) {
                that.$.arriveeLoading.show();
                $.extend(query, {
                    type: "adresse",
                    epsg_sortie: that._.carte.obtenirProjection().split(":")[1],
                    indDebut: 0,
                    indFin: 5,
                    format: "JSON",
                    groupe: 1,
                    urlappelant: that._.options.cle ? undefined : that._.options.urlAppelant,
                    _cle: that._.options.cle
                });
            },
            onSearchComplete: function (query) {
                that.$.arriveeLoading.hide();
            },
            beforeRender: function(container){
                if(!$(this).is(":focus")){
                    container[0].innerHTML= "";
                    setTimeout(function(){ 
                        $(container[0]).hide();
                    }, 1);
                }
            },
            onSelect: function (suggestion) {
                if (that._.marqueurs.arrivee) {
                    if(that._.marqueurs.arrivee.obtenirPropriete('titre') === that.$.arriveeInput.val()){
                        return;
                    }
                }

                if(that.$.arriveeInput.val()){
                    var pos;
                    var loc = suggestion.loc;
                    if(loc.point.x && loc.point.y){
                        pos = new Point(loc.point.x, loc.point.y);
                    } else if (loc.enveloppe.Xmax){
                        var limites = new Limites(loc.enveloppe.Xmin, loc.enveloppe.Ymin, loc.enveloppe.Xmax, loc.enveloppe.Ymax);
                        pos = limites.obtenirCentroide();
                        pos.limites = limites;
                    } else {
                        console.warn("Pas de géométrie");
                        return true;
                    }                    var type = 'arrivee';
                    that._.marqueurs.supprimerParType(type);
                    that._.marqueurs.ajouter(pos.x, pos.y, type, null, that.$.departInput.val());
                    /*that._.carte.definirCentre(point);
                    that._.carte.definirZoom(14);*/
                    that._.formulaire.trouverItineraireClick();
                };
            },
            minChars: 3
        });   
        
        this.$.arriveeInput.focus(function() { $(this).select(); } );
    };
    

    Itineraire.Formulaire.prototype.geocodageInverse = function(point, feature, $input) {
        var pos = point.projeter(this._.projCarte, this._.proj4326);
        //todo: à remplacer par le glo v6 lorsque le reverse sera intégré 
        //var url = "http://nominatim.openstreetmap.org/reverse?format=json&accept-language=fr&lat="+pos.lat+"&lon="+pos.lon;          
        //var url = "http://spssogl97d.sso.msp.gouv.qc.ca/Services/itineraire.php?graph=locate&loc=" + pos.lat + "," + pos.lon;
        var url = this._.options.service + "?graph=locate?loc=" + pos.y + "," + pos.x;
        
        $.ajax({
            dataType: 'jsonp',
            //url: Aide.utiliserProxy(url),
            url: url,
            jsonp: "jsonp",
            cache : true,
            //crossDomain: true, //utilisation du proxy
            success: function(response) {
                var json_obj = eval(response);
                if ($input) {
                    $input.val(json_obj.name);
                    feature.definirPropriete('titre', $input.val());
                };
            }
        });
    };
    
    Itineraire.Formulaire.prototype.definirInput = function(type, value) {
        if (type === 'depart') {
            this.$.departInput.val(value);
        } else if (type === 'arrivee') {
            this.$.arriveeInput.val(value);
        };
    };   
    
//------------------------------------------

    //
    Itineraire.ResultatLocalisation = function(_){
        this._ = _;
        this.$ = {
            resultatDiv:  $('#resultatRecherche'),
            resultatBody:  $('#resultatRecherche table tbody')
        };
    };

    //
    Itineraire.ResultatLocalisation.prototype.initEvent = function() {
        this.$.resultatBody.find(".directive").click(this, this.clique);
        this.$.resultatBody.find(".directive").mouseover(this, this.mouseOver);
        this.$.resultatBody.find(".directive").mouseout(this, this.mouseOut);
    };

    //
    Itineraire.ResultatLocalisation.prototype.clique = function(e) {
        var that = e.data;
        var $instruction = $(e.target).parent();
        var x = $instruction.data('x');
        var y = $instruction.data('y');
        var type = $instruction.data('type');       

        that._.formulaire.definirInput(type, e.target.textContent);   
        that._.marqueurs.supprimerParType(type);
        that._.marqueurs.ajouter(x, y, type, null, e.target.textContent);
        
        var point = new Point(x,y);    
        that._.carte.definirCentre(point);
        that._.carte.definirZoom(14);
    };

    //
    Itineraire.ResultatLocalisation.prototype.mouseOver = function(e) {
        var that = e.data;
        var $instruction = $(e.target).parent();
        var x = $instruction.data('x');
        var y = $instruction.data('y');
        var type = $instruction.data('type');

        that._.marqueurs.cacherParType(type);
        that._.marqueurs.ajouter(x, y, type, 'rechercheMouseover');
    };

    //
    Itineraire.ResultatLocalisation.prototype.mouseOut = function(e) {
        var that = e.data;
        that._.marqueurs.supprimerParOrigine('rechercheMouseover');
        that._.marqueurs.afficherTout();
    };
    
    //
    Itineraire.ResultatLocalisation.prototype.supprimer = function() {
        this.$.resultatBody.empty();
    };

    //
    Itineraire.ResultatLocalisation.prototype.cacher = function() {
        this.$.resultatDiv.hide();
    };

    //
    Itineraire.ResultatLocalisation.prototype.afficher = function() {
        this.$.resultatDiv.show();
    };


    return Itineraire;
});
