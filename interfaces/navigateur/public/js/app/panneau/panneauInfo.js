/** 
 * Module pour l'objet {@link Panneau.PanneauInfo}.
 * @module panneauInfo
 * @requires panneau 
 * @author Marc-André Barbeau, MSP
 * @version 1.0
 */
define(['panneau', 'point', 'aide'], function(Panneau, Point, Aide) {
     /** 
     * Création de l'object Panneau.PanneauInfo.
     * Pour la liste complète des paramètres, voir {@link Panneau}
     * @constructor
     * @name Panneau.PanneauInfo
     * @class Panneau.PanneauInfo
     * @alias panneauInfo:Panneau.PanneauInfo
     * @extends Panneau
     * @requires panneauInfo
     * @param {string} [options.id='info-panneau'] Identifiant du panneau.
     * @param {string} [options.position='sud'] Position du navigateur. Choix possibles: nord, sud, ouest, est
     * @param {string} [options.titre='Informations additionnelles'] Titre du Panneau
     * @param {Entier} [options.dimension=75] Dimension du panneau. Largeur si positionné à l'ouest ou à l'est. Hauteur pour le nord et le sud.
     * @param {Boolean} [options.ouvert=false] Ouvert à l'ouverture
     * @returns {Panneau.PanneauInfo} Instance de {@link Panneau.PanneauInfo}
    */
    function PanneauInfo(options){
        
        this.options = options || {};
        this._timeUpdateCtrl=0;
        this.projectionAffichage = this.options.projection || 'libelle';
        
        if (this.options.projection == 'code'){
            this.projectionAffichage = 'libelle';
        }
           
        var firstExpand=true;
      
        var epsgArray = new Array();
        
        for(var index in Proj4js.defs){
            if (Proj4js.defs.hasOwnProperty(index)) {
                
                var units = Proj4js.defs[index].match(/units=(\S*)/);
                var title = Proj4js.defs[index].match(/title=(\S*)/);
                
                var libelle = units!==null?index+'('+units[1]+')':index;
                var nom = title!==null?title[1]:index;
                
                epsgArray.push([index, libelle, nom]);
            }
        }
            
        var projStore = new Ext.data.ArrayStore({id:0,
            fields: ['code', 'libelle', 'nom'],
            data: epsgArray
        });
   
        this.defautOptions.items = [/*{
            id: 'currentTimeComponent',
            title: 'Heure'
        },*/{
            id: 'currentMousePositionComponent',
            title: 'Position souris',
            items:[{
                    ctCls: 'x-form-field infoPosition'
            }]
        },{
            id: 'currentMousePositionElevation',
            title: 'Élevation',
            items:[{
                    ctCls: 'x-form-field infoPosition'
            }]
        },{
            id: 'currentScaleComponent',
            title: 'Échelle',
             items:[{       
                   ctCls: 'x-form-field infoPosition'
            }]
        },{
            id: 'currentProjectionComponent',
            title: 'Projection',
            items:[{
                id: 'currentProjectionComboBox',
                tpl: '<tpl for="."><div ext:qtip="{libelle}.{nom}" class="x-combo-list-item" style="text-align:center;">{' + this.projectionAffichage + '}</div></tpl>',
                xtype: 'combo',
                store: projStore ,
                valueField: 'code',
                displayField: this.projectionAffichage,
                typeAhead: true,
                triggerAction: 'all',
                selectOnFocus:true,
                lazyRender : true,
                mode:'local',
                editable:false,
                forceSelection:true,
                style: { 'text-align':'center'},
                listeners: {
                    select : function(combo, record, index){
                        var projDemande = combo.getValue();
                        Igo.nav.carte.definirProjectionAffichage(projDemande);                                                  
                    }
                }
            }]
        }]; 
        this.defautOptions.defaults = {
            split: true,
            height: 50,
            width: 200,
            minSize: 100,
            maxSize: 200,
            margins: '0 0 0 0'
        };
           
        this.defautOptions.position = 'sud';
        this.defautOptions.id = 'info-panneau';
        this.defautOptions.titre = 'Informations additionnelles';
        this.defautOptions.dimension = 75;
        this.defautOptions.minDimension = 75;
        this.defautOptions.maxDimension = 400;
        this.defautOptions.ouvert = false;
        this.defautOptions.elevation = false;
        this.defautOptions.listeners = {
            expand: function(panneau) {
                if (firstExpand){
                    firstExpand=false;
                    panneau.scope.initialiserEchelle();
                    panneau.scope.initialiserPositionPointeur();
                    panneau.scope.afficherProjectionAffichage();
                }  
                  panneau.scope.initialiserPositionElevation();
                //panneau.scope.activerHorloge();
            },
            collapse: function(panneau) {
                panneau.scope.desactiverPositionElevation();
                //panneau.scope.desactiverHorloge();
            },
            afterrender: function(panneau) {
                if (Aide.toBoolean(panneau.scope.options.ouvert)) {
                    setTimeout(function(){
                        firstExpand=false;
                        panneau.scope.initialiserEchelle();
                        panneau.scope.initialiserPositionPointeur();
                        panneau.scope.afficherProjectionAffichage();
                        panneau.scope.initialiserPositionElevation();
                    }, 1);
                }
            }
        };

    };

    PanneauInfo.prototype = new Panneau();
    PanneauInfo.prototype.constructor = PanneauInfo;
    

    PanneauInfo.prototype._init = function() {
        Panneau.prototype._init.call(this);
    }

    /** 
     * Afficher l'heure dans le panneau
     * @method 
     * @private
     * @param {String} [heure] Heure à afficher
     * @name PanneauInfo#afficherHorloge
    */
    PanneauInfo.prototype.afficherHorloge = function(heure) {
        if (!this._currentTimeBody){
            var body = this._getPanel().get('currentTimeComponent').body; 
            if (body){
                this._currentTimeBody = body.dom;
            } else {
                return;
            };
        }
        heure = heure || this.obtenirHeure();
        this._currentTimeBody.innerHTML = heure;
    };
    
    /** 
     * Afficher la projection dans le panneau
     * @method 
     * @private
     * @name PanneauInfo#afficherProjection
    */
    PanneauInfo.prototype.afficherProjectionAffichage = function() {
        var combobox = this._getPanel().get("currentProjectionComponent")
                                .getComponent("currentProjectionComboBox");
        combobox.setValue(this.carte.obtenirProjectionAffichage());         
    };
    
    /** 
     * Obtenir l'heure actuelle formatée
     * @method 
     * @private
     * @name PanneauInfo#obtenirHeure
     * @returns {String} Heure formatée
    */
    PanneauInfo.prototype.obtenirHeure = function() {
        var currentDate = new Date();
        var currentHour = this.prefixerHeure(currentDate.getHours());
        var currentMinute = this.prefixerHeure(currentDate.getMinutes());
        var currentSecond = this.prefixerHeure(currentDate.getSeconds());  
        return currentHour + ':' + currentMinute + ':' + currentSecond;
    };
    
    /** 
     * Préfixe l'heure avec un 0 si requis.
     * @method 
     * @private
     * @param {String} t Heure à formater
     * @name PanneauInfo#prefixerHeure
     * @returns {String} Heure avec 2 chiffres
    */
    PanneauInfo.prototype.prefixerHeure = function(t){
        if (Number(t)<10){
            return "0"+t;
        }else{
            return t;
        }
    };
    
    /** 
     * Activer la mise à jour de l'heure à chaque seconde
     * @method 
     * @private
     * @name PanneauInfo#activerHorloge
    */
    PanneauInfo.prototype.activerHorloge = function(){
        var that = this;
        that.afficherHorloge();
        this._timeUpdateCtrl = setInterval(function(){that.afficherHorloge()},1000);
    };
    
    /** 
     * Désactiver la mise à jour de l'heure
     * @method 
     * @private
     * @name PanneauInfo#desactiverHorloge
    */
    PanneauInfo.prototype.desactiverHorloge = function(){
        clearInterval(this._timeUpdateCtrl);
        this.afficherHorloge(' ');
    };
    
    /** 
     * Activer la mise à jour du niveau de zoom de la carte
     * @method 
     * @private
     * @name PanneauInfo#initialiserEchelle
    */
    PanneauInfo.prototype.initialiserEchelle = function(){
        var body = this._getPanel().get('currentScaleComponent').body; 
        if (body){
            var currentScaleBody = body.dom;
            this.carte._getCarte().addControl(new OpenLayers.Control.Scale(currentScaleBody));
        };
    };

    /** 
     * Activer la mise à jour de la position de la souris sur la carte
     * @method 
     * @private
     * @name PanneauInfo#initialiserPositionPointeur
    */
    PanneauInfo.prototype.initialiserPositionPointeur = function(){
        var body = this._getPanel().get('currentMousePositionComponent').body; 
        if (body){
            var currentMousePositionBody = body.dom;
            this.carte._getCarte().addControl(new OpenLayers.Control.MousePosition({
                div: currentMousePositionBody,
                numDigits: 6
            }));
        };
        
        
    };
    
     /** 
     * Activer le declencheur pauseSurvolCarte sur la carte
     * @method 
     * @private
     * @name PanneauInfo#initialiserPositionElevation
    */
    PanneauInfo.prototype.initialiserPositionElevation = function(){
        if (this.options.elevation){
            this.carte.ajouterDeclencheur('pauseSurvolCarte', this.obtenirElevation, {scope: this.carte, id:"afficherElevation"});
        } else {
            this._getPanel().get("currentMousePositionElevation").setVisible(false);
        }
    };
    
       /** 
     * Desactiver le declencheur pauseSurvolCarte sur la carte
     * @method 
     * @private
     * @name PanneauInfo#desactiverPositionElevation
    */
    PanneauInfo.prototype.desactiverPositionElevation = function(){  
        if (this.options.elevation){
            this.carte.enleverDeclencheur('pauseSurvolCarte', this.obtenirElevation);
        }
    };
  
    
      /** 
     * Appel un servcie API Elevation et retourne l'information 
     * dans le panneauInfo (Élevation) 
     * @method 
     * @private
     * @name PanneauInfo#obtenirElevation
    */
    PanneauInfo.prototype.obtenirElevation = function(e) {
               
         //Valider que le service est défini dans le fichier de configuration
        if(Aide.obtenirConfig('PanneauInfo').urlServiceElevation === undefined) {
             Aide.afficherMessage("Erreur", "Vous devez ajouter un service d'API Élevation de Ressources naturelles Canada pour cet outil dans votre fichier de configuration.");
             return false;
        }
            var geomt = new Point(e.x, e.y);
            geomt = geomt.projeter('EPSG:4326');
                $.get(Aide.utiliserProxy(decodeURIComponent(Aide.obtenirConfig('PanneauInfo').urlServiceElevation + '?lat=' + geomt.y + '&lon=' + geomt.x )), null, function (data, textStatus) {
                    if (data.length > 0) {
                       var elev = JSON.parse(data);
                        var panneauInfo;
                        var nav = Aide.obtenirNavigateur();
                        panneauInfo = nav.obtenirPanneauxParType('PanneauInfo')[0];
                        
                        if (panneauInfo){
                            $('#currentMousePositionElevation').find('.infoPosition').html('Altitude: ' + elev.altitude + '(m)');
                        }
                        clearTimeout(Aide.obtenirNavigateur().carte._timerEvenementPauseSurvol);
                    } else {
                        clearTimeout(Aide.obtenirNavigateur().carte._timerEvenementPauseSurvol);
                    }
                }, 'html'); 
    };

    return PanneauInfo;
    
});