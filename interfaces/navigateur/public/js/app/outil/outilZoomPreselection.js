define(['outil', 'limites','aide', 'style', 'occurence', 'vecteur'], function(Outil, Limites, Aide, Style, Occurence, Vecteur) {
    function OutilZoomPreselection(options){
        this.options = options || {};
        if (this.options.type === 'region-adm'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'recherche_par_region_adm',
                titre: 'Par région administrative',
                icone: 'zoom-reg-adm',
                texteForm: 'une région administrative',
                fieldLabel: 'Région administrative',
                requestParametre: 'GetListeRegionAdm'
            });
        } else if (this.options.type === 'mrc'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'recherche_par_mrc',
                titre: 'Par MRC',
                icone: 'zoom-mrc',
                texteForm: 'une MRC',
                fieldLabel: 'MRC',
                requestParametre: 'GetListeMrc'
            });
        } else if (this.options.type === 'mun'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'recherche_par_mun',
                titre: 'Par municipalité',
                icone: 'zoom-mun',
                texteForm: 'une municipalité',
                fieldLabel: 'Municipalité',
                requestParametre: 'GetListeMun'
            });
        } else if (this.options.type === 'hydro'){
            this.defautOptions = $.extend({},this.defautOptions, {
                id: 'recherche_par_hydro',
                titre: 'Par hydrographie',
                icone: 'zoom-hydro',
                texteForm: "l'hydrographie",
                fieldLabel: 'Hydrographie',
                requestParametre: 'search_hydronyme'
            });
        } else if (this.options.type !== undefined){
            this.defautOptions = $.extend({},this.defautOptions);
        } else {
            throw new Error("OutilZoomPreselection a besoin d'un type");
        }

        this.defautOptions.executer = this.afficherFormRecherche;
    };

    OutilZoomPreselection.prototype = new Outil();
    OutilZoomPreselection.prototype.constructor = OutilZoomPreselection;


    OutilZoomPreselection.prototype.submitForm = function(comboBox) {
        if (this.options.type==='hydro'){
            if(this.selection){
                this.goHydro(this.selection.st_xmax, this.selection.st_ymin,  this.selection.st_xmin,  this.selection.st_ymax, this.selection.x, this.selection.y, this.selection.reg_admin);
                this.cacherFormRecherche();
            }
            return;
        }
        var epsg = this.carte.obtenirProjection().split(':')[1];
        var code = comboBox.getValue();
        if(code){
            $.ajax({
                url: Aide.utiliserProxy(this.options.service),
                data: {
                    request:'GetCoordonnees',
                    type: this.options.type.replace('-','_'),
                    id:code,
                    epsg:epsg
                },
                //crossDomain: true, //utilisation du proxy
                async:false,
                context:this,
                success:this.coordonneesZoomSuccess,
                dataType:'json',
                error:function(){alert("error...");}
            });

            this.cacherFormRecherche();
        }
        comboBox.setValue("");
        comboBox.clearInvalid();
    };


    OutilZoomPreselection.prototype.creerFormRecherche = function() {
        //Magasin de données pour les MRC
        var url_coordonnees = Aide.utiliserProxy(this.options.service+'&request='+this.options.requestParametre);
        var store, comboBox;
        this.selection; //pour hydro

        var id = this.obtenirId();
        var texteForm=this.options.texteForm;
        var fieldLabel=this.options.fieldLabel;

        if (this.options.type==='hydro'){
            store = new Ext.data.JsonStore({
                    root:'data',
                    fields:[
                        {name:'affichage', type:'string'},
                        {name:'hydronyme', type:'string'},
                        {name:'ogc_fid', type:'numeric'},
                        {name:'st_xmin', type:'numeric'},
                        {name:'st_ymin', type:'numeric'},
                        {name:'st_xmax', type:'numeric'},
                        {name:'st_ymax', type:'numeric'},
                        {name:'st_x', type:'numeric'},
                        {name:'st_y', type:'numeric'},
                        {name:'bassin_n1', type:'string'},
                        {name:'reg_admin', type:'string'}
                    ],
                    url: url_coordonnees
            });
            var that=this;
            comboBox = new Ext.form.ComboBox({
                    id:'combo_'+id,
                    name:'combo',
                    fieldLabel: fieldLabel,
                    typeAhead: false,
                    typeAheadDelay: 2000,
                    triggerAction: 'all',
                    allowBlank:false,
                    width:400,
                    height:75,
                    emptyText:'Entrer le nom d\'une rivière ou d\'un lac',
                    store:store,
                    displayField:'affichage',
                    valueField:'ogc_fid',
                    forceSelection:true,
                    selectOnFocus:true,
                    anchor:'95%',
                    listeners: {
                        select:function(combo, record, index) {
                            that.selection = record.data;
                            this.setValue(record.get('ogc_fid'));
                        },
                        beforeQuery:function(combo){
                            if(combo.query.indexOf(',') > 0){
                                combo.query = combo.query.substring(0,combo.query.indexOf(','));
                            }
                        }
                    }

		});

        } else {
            store = new Ext.data.JsonStore({
                url:url_coordonnees, //+$.camelCase('GetListe-'+this.options.type),
                root:'data',
                fields:['code', 'nom'],
                autoLoad:true
            });

            comboBox = new Ext.form.ComboBox({
                id:'combo_'+id,
                name:'combo',
                fieldLabel: fieldLabel,
                allowBlank:false,
                emptyText:'Sélectionner '+ texteForm,
                store:store,
                displayField:'nom',
                valueField:'code',
                forceSelection:true,
                mode:'local',
                selectOnFocus:true,
                width:250,
                scope:this,
                listeners: {
                    specialkey: function(field, e){
                        if (e.getKey() == e.ENTER) {
                            this.scope.submitForm(comboBox);
                        }
                    }
                }
            });
        }
        store.on('exception', this.gestionErreurStore, this);

        var button_ok = new Ext.Button({
            id:'button_ok'+id,
            type:'button',
            width:50,
            text:'Zoomer',
            scope:this,
            handler: function(){
                this.submitForm(comboBox);
            }
        });

        var panneau = new Ext.form.FormPanel({
            id:'form_recherche_'+id,
            padding:'5 5 5 5',
            frame:true,
            autoWidth:true,
            width:'auto',
            labelAlign:'top',
            items:[comboBox],
            buttons:[button_ok],
            listeners: {
                afterrender: function(field) {
                    comboBox.focus(false, 250);
                }
            }
        });

        this.window_recherche = new Ext.Window({
            title:'Zoom sur '+ texteForm,
            width:300,
            closeAction:'hide',
            resizable:true,
            minimizable:false,
            plain:true,
            //bodyStyle:'padding: 5px',
            items:[panneau]
        });
    };

    OutilZoomPreselection.prototype.goHydro = function (xmin, ymin, xmax, ymax, x, y, no_reg_admin){
        var limites = new Limites(xmax, ymin, xmin, ymax, 'EPSG:32198'); //todo: le résultat en x est inversé...
        var limitesProj = limites.projeter('EPSG:3857');
        this.carte.zoomer(limitesProj);
    }

    OutilZoomPreselection.prototype.afficherFormRecherche = function() {
        //Vérifier que la fenêtre n'est pas déjà créé
	if(!this.window_recherche){
            this.creerFormRecherche();
	}
	this.window_recherche.show();
    };

    OutilZoomPreselection.prototype.cacherFormRecherche = function() {
	this.window_recherche.hide();
    };

    OutilZoomPreselection.prototype.gestionErreurStore = function(http_proxy, type, action, options, response){
        var reponse = response.responseText;
        if(response.status === 404){
            reponse = "Service introuvable.";
        }
        Aide.afficherMessage("Outil indisponible", "L'utilisation de l'outil 'zoom présélection' n'est pas permise.<br>" + reponse);
        this.cacherFormRecherche();
        this.window_recherche = undefined;
        this.desactiver();
    };

    OutilZoomPreselection.prototype.coordonneesZoomSuccess= function(data){
        if(data["success"]){
            var coordonnees = data["data"][0];

            var proprieteOccurence = {};
            for(var propriete in coordonnees){
                if (coordonnees.hasOwnProperty(propriete)) {
                    proprieteOccurence[propriete] = coordonnees[propriete];
                }
            }
            proprieteOccurence['regle']="true";
            var etiquette = proprieteOccurence.res_nm_reg||proprieteOccurence.mrs_nm_reg||proprieteOccurence.mus_nm_mun || proprieteOccurence[this.options.etiquette];

            var style = new Style({
                etiquette:etiquette,
                couleur:'#2e8cd6',
                limiteCouleur: '#2e8cd6',
                opacite:0.05
            });

            var styleSelectionne = new Style({
                etiquette:etiquette,
                couleur:'#2e8cd6',
                limiteCouleur: '#2e8cd6',
                limiteEpaisseur: 2,
                opacite:0.3
            });

            var regle= new Style({
                etiquette:etiquette,
                filtres: [{
                        titre:etiquette,
                        filtre:"[regle]=='true'",
                        style: style
                    }
                ]
            });

            var regleSelectionnee= new Style({
                etiquette:etiquette,
                filtres: [{
                        titre:etiquette,
                        filtre:"[regle]=='true'",
                        style: styleSelectionne
                    }
                ]
            });

            var wkt = new OpenLayers.Format.WKT();
            var featureOL = wkt.read(coordonnees.geom);

            var occurence = new Occurence(featureOL.geometry, proprieteOccurence);

            var couche = this.carte.gestionCouches.obtenirCouchesParTitre('Géométrie - Outil Zoom');

            if(couche.length > 0){
                couche = couche[0];
                couche.enleverTout();
                couche.definirStyle(regle);
                couche.definirStyle(regleSelectionnee, 'select');
                this.ajouterOccurence(couche, occurence);
            }
            else{
                var that = this;
                var couche = new Vecteur({active: true, suppressionPermise: true, titre:'Géométrie - Outil Zoom',
                                                        styles:{defaut:regle, select: regleSelectionnee}});

                this.carte.gestionCouches.ajouterCouche(couche);
                that.ajouterOccurence(couche, occurence);
                //this.carte.gestionCouches.ajouterCouche(couche, {callback: function(){that.ajouterOccurence(couche, occurence)}});
            }



        }else{
            alert(data["errors"]);
        }
    };

    OutilZoomPreselection.prototype.ajouterOccurence= function(couche, occurence){
        couche.ajouterOccurence(occurence);
        occurence.afficher();
        couche.zoomerOccurences();
    }

    return OutilZoomPreselection;

});
