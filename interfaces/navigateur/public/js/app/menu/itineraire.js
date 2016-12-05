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


define(['aide', 'panneau', 'vecteur', 'point', 'ligne', 'limites', 'occurence', 'style', 'outilItineraire', 'analyseurGeoJSON', "hbars!template/itineraire", "css!css/itineraire", "css!css/autocomplete", 'autocomplete', 'encodedPolyline'], function(Aide, Panneau, Vecteur, Point, Ligne, Limites, Occurence, Style, OutilItineraire, AnalyseurGeoJSON, Template) {
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

    Itineraire.Instructions.prototype.afficherResume = function(resume, waypoints, keepAlternativeSwitch) {
        this.supprimerResume(keepAlternativeSwitch);
        var rDistance = resume.distance;
        var rDuree = resume.duration;
        var rDepart = waypoints[0].name;
        var rArrivee = waypoints[waypoints.length-1].name;
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
        if (direction >= 337 || direction < 23) {
            return 'nord';
        } else if (direction < 67) {
            return 'nord-est';
        } else if (direction < 113) {
            return 'est';
        } else if (direction < 157) {
            return 'sud-est';
        } else if (direction < 203) {
            return 'sud';
        } else if (direction < 247) {
            return 'sud-ouest';
        } else if (direction < 293) {
            return 'ouest';
        } else if (direction < 337) {
            return 'nord-ouest';
        } else {
            return 'None' ;
        }
    };

    Itineraire.Instructions.prototype.formaterModifier = function(modifier) {
        if (modifier === "uturn") {
            return 'demi-tour';
        } else if (modifier === "sharp right") {
            return 'fortement à droite';
        } else if (modifier === "right") {
            return 'à droite';
        } else if (modifier === "slight right") {
            return 'légèrement à droite';
        } else if (modifier === "sharp left") {
            return 'fortement à gauche';
        } else if (modifier === "left") {
            return 'à gauche';
        } else if (modifier === "slight left") {
            return 'légèrement à gauche';
        } else if (modifier === "straight") {
            return 'tout droit';
        } else {
            return modifier ;
        }
    };


    Itineraire.Instructions.prototype.formaterInstruction = function(type, modifier, route, direction, position, last, opt) {
        var directive = 'None';
        var image;

        if (modifier === "demi-tour") {
            image = 'u-turn.png';
        } else if (modifier === "fortement à droite") {
            image = 'sharp-right.png';
        } else if (modifier === "à droite") {
            image = 'turn-right.png';
        } else if (modifier === "légèrement à droite") {
            image = 'slight-right.png';
        } else if (modifier === "fortement à gauche") {
            image = 'sharp-left.png';
        } else if (modifier === "à gauche") {
            image = 'turn-left.png';
        } else if (modifier === "légèrement à gauche") {
            image = 'slight-left.png';
        } else if (modifier === "tout droit") {
            image = 'continue.png';
        }

        if (type === 'turn') {
            if (modifier === "tout droit") {
              directive = 'Continuer sur ' + route;
            } else if (modifier === "demi-tour") {
              directive = 'Faire demi-tour sur ' + route;
            } else {
              directive = 'Tourner ' + modifier + " sur " + route;
            }
        } else if (type === 'new name') {
            directive = 'Continuer sur ' + route;
            image = 'continue.png';
        } else if (type === 'depart') {
            if(position == 0 ) {
                directive = 'Aller en direction ' + direction + " sur " + route;
            }
            image = 'head.png';
        } else if (type === 'arrive') {
            if (last) {
              directive = 'Vous êtes arrivé';
            } else {
              directive = 'Atteignez le point intermédiare sur ' + route;
            }
            image = 'target.png';
        } else if (type === 'merge') {
            directive = 'Continuer sur ' + route;
            image = 'continue.png';
        } else if (type === 'on ramp') {
            directive = 'Prendre l\'entrée d\'autoroute ' + modifier;
        } else if (type === 'off ramp') {
            directive = 'Prendre la sortie d\'autoroute';
            if (modifier.search("gauche") >= 0) {
                directive = directive + " à gauche";
            } else if (modifier.search("droite") >= 0) {
                directive = directive + " à droite";
            }
        } else if (type === 'fork') {
            if (modifier.search("gauche") >= 0) {
                directive = "Garder la gauche sur " + route;
            } else if (modifier.search("droite") >= 0) {
                directive = "Garder la droite sur " + route;
            } else {
                directive = "Continuer sur " + route;
            }
        } else if (type === 'end of road') {
            directive = 'À la fin de la route, tourner ' + modifier + " sur " + route;
        } else if (type === 'use lane') {
            directive = 'Prendre la voie de ... ';
        } else if (type === 'continue') {
            directive = 'Continuer sur ' + route;
            image = 'continue.png';
        } else if (type === 'roundabout') {
            directive = 'Au rond-point, prendre la ' + opt.exit;
            directive += opt.exit === 1 ? 're' : 'e';
            directive += ' sortie vers ' + route;
            image = 'round-about.png';
        } else if (type === 'rotary') {
            directive = 'Rond-point rotary....';
            image = 'round-about.png';
        } else if (type === 'roundabout turn') {
            directive = 'Rond-point, prendre la ...';
            image = 'round-about.png';
        } else if (type === 'notification') {
            directive = 'notification ....';
        } else {
            directive = '???';
        }

        // directive = directive + "<br><br>" +type+ " - " + modifier + " - " + direction + " - " + route;


        if (image){
            image = Aide.utiliserBaseUri('images/itineraire/'+image);
        }

        return {instruction: directive, image: image};
    };


    Itineraire.Instructions.prototype.afficherInstructions = function(instructions, route) {
        var that = this;
        var steps = [];
        $.each(instructions.legs, function(key, value) {
          steps = steps.concat(value.steps);
        });
        var nbSteps = steps.length;
        $.each(steps, function(key, value) {
            var noInstruction = value.maneuver.type;
            var typeInstruction = value.maneuver.type;
            var modifier = that.formaterModifier(value.maneuver.modifier);
            var distance = that.formaterDistance(value.distance);
            var direction = that.formaterDirection(value.maneuver.bearing_after);
            var instructions = that.formaterInstruction(typeInstruction, modifier, value.name, direction, key, key+1 == nbSteps, value.maneuver);
            var instructionText = instructions.instruction;
            var instructionImage = instructions.image;

            var point = new Point(value.maneuver.location[0], value.maneuver.location[1], 'EPSG:4326').projeter(that._.carte.obtenirProjection());
            var x = point.x;
            var y = point.y;

            var tr = document.createElement('tr');
            var $tr = $(tr);
            $tr.data("x", x);
            $tr.data("y", y);
            if ((noInstruction == 15) || (noInstruction == 10)) {
                $tr.data("estMarqueurs", true);
            }


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
        }

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
            route_summary = json.routes[1];
            route_name = json.routes[1];
            route_instructions = json.routes[1];
        } else {
            route_summary = json.routes[0];
            route_name = json.routes[0];
            route_instructions = json.routes[0];
        };

        this.afficherResume(route_summary, json.waypoints, keepAlternativeSwitch);
        this.afficherVia(route_name);
        if (!keepAlternativeSwitch && json.routes[1]) {
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
            var route = that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.routes[1].geometry);
            that.afficherItineraireDescription(that.jsonReponseItineraire, route, true, true);
        } else {
            var route = that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.routes[0].geometry);
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
            that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.routes[1].geometry);
        } else {
            that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.routes[0].geometry);
        }
    };

    Itineraire.Instructions.prototype.changerItineraireMouseOut = function(e) {
        if (e.target.classList[1] === "button-pressed") {
            return true;
        };

        var that = (e ? e.data : this);
        var cible = e.target.textContent;

        if (cible === "A") {
            that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.routes[1].geometry);
        } else {
            that._.trajet.afficherItineraireCarte(that.jsonReponseItineraire.routes[0].geometry);
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
        this.initSurvolMarqueurs();
        this.initDeplacementMarqueurs();

    };

    Itineraire.Marqueurs.prototype.initSurvolMarqueurs = function() {
        if(this._.options.infobulleSurvol){
            this.vecteur.ajouterDeclencheur('occurenceSurvol', function(e){
                e.occurence.ouvrirInfobulle({html:e.occurence.proprietes.titre, aFermerBouton: false});
            },
            {scope: this});
            this.vecteur.ajouterDeclencheur('occurenceSurvolFin', function(e){
                e.occurence.fermerInfobulle();
            },
            {scope: this});
        }
    }

    Itineraire.Marqueurs.prototype.initCliqueCarte = function() {
        var that=this;

        //this._.carte.ajouterDeclencheur('clique', this.cliqueCarte, {scope: this});
        //this.activerControles();
        this.outilItineraire = new OutilItineraire({panneauItineraire: this});
        var barreOutils = Aide.obtenirNavigateur().barreOutils;
        barreOutils.ajouterOutil(this.outilItineraire);
        this.outilItineraire.enfoncer();

        this._._panel.on("expand", function(){
            that.outilItineraire.enfoncer();
        });
        this._._panel.on("collapse", function(){
            that.outilItineraire.relever();
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
            this.desactiverControles();
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
            this.activerControles();
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
        this.ecouterEvenements();
    };

    //
    Itineraire.Trajet.prototype.supprimer = function() {
        this.vecteur.enleverTout();
    };

    Itineraire.Trajet.prototype.ecouterEvenements = function(){
        // this._.carte.ajouterDeclencheur('zoomEnd', this.zoomEndEvent, {scope: this});
    };

    Itineraire.Trajet.prototype.zoomEndEvent = function(){
        if(!this._.marqueurs){
            return false;
        }
        var depart = this._.marqueurs.depart;
        var arrivee = this._.marqueurs.arrivee;
        var intermediaires = this._.marqueurs.intermediaires;
        if (depart && arrivee) {
            var points = [];
            points.push(depart);
            points = points.concat(intermediaires);
            points.push(arrivee);
            this.trouverItineraire(points, true, true);
        };
    };

    Itineraire.Trajet.prototype.afficherItineraireCarte = function(geometryEncoded) { //todo ajouter
        var route = this.formaterRouteGeometrie(geometryEncoded);
        this.vecteur.ajouterOccurence(route);
        this.supprimerAncienTrajet();
        return route;
    };

    Itineraire.Trajet.prototype.trouverItineraire = function(points, sansInstructions, sansModifierInstructions) {
        var that = this;
        this.points = points;
        var loc = "";
        $.each(points, function(key, value) {
            var p = value.projeter(that._.projCarte, that._.proj4326);
            if (loc) {
                loc = loc + ';';
            }
            if (p.x) {
                loc = loc + p.x + ',' + p.y;
            } else {
                loc = loc + p.lon + ',' + p.lat;
            }
        });

        var url = this._.options.service;
        var graph = $('#rechercheType select').val(); //todo $variable
		if (graph !== 'voiture') {
			url += '/' + graph;
        }

        if (sansInstructions) {
            url += "/route/v1/driving/" + loc + "?overview=full&alternatives=true&steps=false&geometries=geojson";
        } else {
            url += "/route/v1/driving/" + loc + "?overview=full&annotations=true&alternatives=true&steps=true&geometries=geojson";
        };

        if (!sansInstructions || this.ajaxItineraireComplete != false) {
            this.ajaxItineraireComplete = false;
            $.ajax({
                dataType: 'json',
                url: url,
                cache : true,
                context: this,
                success: function(response) {
                    // console.log(response);
                    that.trouverItineraireSuccess(response, sansInstructions, sansModifierInstructions);
                },
                complete: function() {
                    this.ajaxItineraireComplete = true;
                }
            });
        } else {
            //console.log(false);
        }
    };

    Itineraire.Trajet.prototype.trouverItineraireSuccess = function(response, sansInstructions, sansModifierInstructions) {
        if (response.status == 207) {
            this.trouverItineraireEchec();
            return false;
        }
        var route;
        if(sansModifierInstructions && response.routes.length > 1){
            // alternative route
            this.afficherItineraireCarte(response.routes[1].geometry);
            return true;
        } else {
            route = this.afficherItineraireCarte(response.routes[0].geometry);
        }

        if (sansInstructions) {
            this._.instructions.afficherResume(response.routes[0], response.waypoints);
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
        routeEncoded = $.isArray(routeEncoded) ? routeEncoded[0] : routeEncoded;
        this.formatEncoded = this.formatEncoded || new AnalyseurGeoJSON();
        var route = this.formatEncoded.lire(routeEncoded)[0];
        route = route.projeter('EPSG:4326', this._.carte.obtenirProjection());
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

          $.ajax({
               url: this._.options.iCherche,
               dataType: 'jsonp',
               data: {
                   q: texte,
                   type: 'region_administrative,mrc,municipalite,route,adresse',
                   nb: 10,
                   callback: "JSONP_CALLBACK"
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
            var adresse = response.hits.hits[0];
            if(!adresse){
                console.warn("Pas de résultat");
                Aide.cacherMessageChargement();
                return false;
            }
            var loc = adresse._source.extent.coordinates;
            if (loc){
                var limites = new Limites(loc[0][0], loc[0][1], loc[1][0], loc[1][1], 'EPSG:4326');
                limites = limites.projeter(that._.carte.obtenirProjection());
                pos = limites.obtenirCentroide();
                pos.limites = limites;
            } else {
                console.warn("Pas de géométrie");
                Aide.cacherMessageChargement();
                return false;
            }
            this._.marqueurs.ajouter(pos.x, pos.y, type, null, adresse._source.recherche);
            if (type == 'depart') {
                this.$.departInput.val(adresse._source.recherche);
            } else if (type == 'arrivee') {
                this.$.arriveeInput.val(adresse._source.recherche);
            }
            this.trouverItineraireClick();
            Aide.cacherMessageChargement();
            return true;
        }

        if(response.hits.hits.length === 0){
            var tr = document.createElement('tr');
            var $tr = $(tr);
            $tr.append('<td><h3 style="font-size:120%;">' + "Aucun résultat" + '</h3></td>');
            this._.resultatLocalisation.$.resultatBody.append(tr);
        } else {
            $.each(response.hits.hits, function(key, adresse) {
                var loc = adresse._source.extent.coordinates;
                if (loc){
                    var limites = new Limites(loc[0][0], loc[0][1], loc[1][0], loc[1][1], 'EPSG:4326');
                    limites = limites.projeter(that._.carte.obtenirProjection());
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
                $tr.append('<td class="directive">' + adresse._source.recherche + '</td>');
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
        this.$.departInput.autocomplete({
            serviceUrl: that._.options.iCherche,
            paramName: 'q',
            dataType: 'jsonp',
            showNoSuggestionNotice: true,
            preserveInput: true,
            transformResult: function(response) {
                return {
                    suggestions: $.map(response.hits.hits, function(dataItem) {
                        var label = dataItem._source.recherche;
                        if (dataItem.highlight.suggest) {
                          label = dataItem.highlight.suggest[0];
                        } else if (dataItem.highlight.recherche) {
                          label = dataItem.highlight.recherche[0];
                        }
                        return { value: label, recherche: dataItem._source.recherche, loc: dataItem._source.extent.coordinates};
                    })
                };
            },
            onSearchStart: function (query) {
                that.$.departLoading.show();
                $.extend(query, {
                  type: 'region_administrative,mrc,municipalite,route,adresse',
                  nb: 10,
                  callback: "JSONP_CALLBACK"
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
                that.$.departInput.val(suggestion.recherche);
                if (that._.marqueurs.depart) {
                    if(that._.marqueurs.depart.obtenirPropriete('titre') === that.$.departInput.val()){
                        return;
                    }
                };

                if(that.$.departInput.val()){
                    var pos;
                    var loc = suggestion.loc;
                    if (loc){
                        var limites = new Limites(loc[0][0], loc[0][1], loc[1][0], loc[1][1], 'EPSG:4326');
                        limites = limites.projeter(that._.carte.obtenirProjection());
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
          serviceUrl: that._.options.iCherche,
          paramName: 'q',
          dataType: 'jsonp',
          showNoSuggestionNotice: true,
          preserveInput: true,
          transformResult: function(response) {
              return {
                  suggestions: $.map(response.hits.hits, function(dataItem) {
                      var label = dataItem._source.recherche;
                      if (dataItem.highlight.suggest) {
                        label = dataItem.highlight.suggest[0];
                      } else if (dataItem.highlight.recherche) {
                        label = dataItem.highlight.recherche[0];
                      }
                      return { value: label, recherche: dataItem._source.recherche, loc: dataItem._source.extent.coordinates};
                  })
              };
          },
          onSearchStart: function (query) {
              that.$.departLoading.show();
              $.extend(query, {
                type: 'region_administrative,mrc,municipalite,route,adresse',
                nb: 10,
                callback: "JSONP_CALLBACK"
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
              that.$.arriveeInput.val(suggestion.recherche);
                if (that._.marqueurs.arrivee) {
                    if(that._.marqueurs.arrivee.obtenirPropriete('titre') === that.$.arriveeInput.val()){
                        return;
                    }
                }

                if(that.$.arriveeInput.val()){
                    var pos;
                    var loc = suggestion.loc;
                    if (loc){
                        var limites = new Limites(loc[0][0], loc[0][1], loc[1][0], loc[1][1], 'EPSG:4326');
                        limites = limites.projeter(that._.carte.obtenirProjection());
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
    }

    Itineraire.Formulaire.prototype.geocodageInverse = function(point, feature, $input) {
        var pos = point.projeter(this._.projCarte, this._.proj4326);
        //todo: à remplacer par le glo v6 lorsque le reverse sera intégré
        //var url = "http://nominatim.openstreetmap.org/reverse?format=json&accept-language=fr&lat="+pos.lat+"&lon="+pos.lon;
        //var url = "http://spssogl97d.sso.msp.gouv.qc.ca/Services/itineraire.php?graph=locate&loc=" + pos.lat + "," + pos.lon;
        var url = this._.options.service + "/nearest/v1/driving/" + pos.x + ',' + pos.y + "?number=1" ;

        $.ajax({
            dataType: 'json',
            url: url,
            cache : true,
            success: function(response) {
                if ($input && response.waypoints.length) {
                    $input.val(response.waypoints[0].name);
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
