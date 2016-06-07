if(!require.estDansConfig("fileUploadField")){    
    require.ajouterConfig({
        paths: {
                fileUploadField: 'libs/Ext.ux/FileUploadField/FileUploadField',
                fileUploadFieldCss: 'libs/Ext.ux/FileUploadField/FileUploadField'
        },
        shim: {
            fileUploadField: {
                deps: ['css!fileUploadFieldCss']
            }
        }
    });
}

define(['aide', 'outil', 'fileUploadField'], function(Aide, Outil) {

    function OutilAssocierFichier(options) {
        this.options = options || {};
        this.contexteParentSupprimerFichier = this.options.supprimerFichier;
        this.contexteParentAssocierFichier = this.options.associerFichier;
        this.contexteParentVisualiserFichier = this.options.visualiserFichier;
        this.contexteParentListerFichiers = this.options.listerFichiers;
        this.contexteParentMettreAjourCompteur = this.options.mettreAjourCompteur;
        this.defautOptions.titre = "Associer des fichiers";
        this.defautOptions.champs || [{name:'id'}, {name:'nom_phys_docu'}, {name:'timb_maj'}];
        this.defautOptions.executer = this.afficherFenetre;
        this.defautOptions.colonnes = [{header: 'Nom', sortable: true, dataIndex: "nom_phys_docu", width:90},
                                      {header: 'Dernière modification', sortable: true, dataIndex: "timb_maj", width:90}];
    };

    OutilAssocierFichier.prototype = new Outil();
    OutilAssocierFichier.prototype.constructor = OutilAssocierFichier;
       
    OutilAssocierFichier.prototype.creerFenetreAssocFichier = function(){
        
        var that = this;
        
        var storeFichier = new Ext.data.JsonStore({
            data: [],
            fields: that.options.champs || that.defautOptions.champs
        });

        this.gridAssocierFichier = new Ext.grid.GridPanel({
            region: "center",
            layout: "fit",
            id: "gridAssocierFichier",
            cls: "gridAssocierFichier",
            autoHeight: true,
            viewConfig: {forceFit: true},
            store: storeFichier,
            cm: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true
                },
                columns: that.options.colonnes || that.defautOptions.colonnes
            })
        });

        var filesContainer = new Ext.Container({
            layout: "fit",
            style: "overflow-y:auto",
            autoDestroy: false,
            width: 390,
            height: 95,
            cls: "uploadForm",
            plain: false,
            items: [this.gridAssocierFichier],
            closable: false,
            html: "<div style=\"position:absolute;top:115px;left:25px;\" id=\"uploadForm\"></div>"
        });

        var buttonTelecharger = new Ext.Button({
            width: 80,
            cls: "fileButton",
            text: "Télécharger",
            listeners : {
                click : function(){
                    
                    var fichier = that.gridAssocierFichier.getSelectionModel().getSelected().data;
                    
                    that.visualiserFichier(fichier);
                }
            }
        });

        var buttonSupprimer = new Ext.Button({
            width: 80,
            cls: "fileButton btnSuppFile",
            text: "Supprimer",
            listeners : {
                click : function(){
                    try{
                        var fichier = that.gridAssocierFichier.getSelectionModel().getSelected().data;

                        Aide.afficherMessage({titre: "Supprimer", 
                            message: "Désirez-vous supprimer le document?",
                            boutons: "OUINON",
                            icone:"QUESTION",
                            action :function(btn) {
                            if (btn == 'yes') {
                                that.supprimerFichier.bind(that, fichier).call();
                            }
                        }
                    });
                    } catch(e){}
                }
            }
        });

        var buttonQuitter = new Ext.Button({
            width: 80,
            cls: "fileButton",
            text: "Quitter",
            listeners : {
                click : function(){
                     that.fenetreAssocFichier.hide();
                     that.contexteParentMettreAjourCompteur(that.obtenirNombreFichier());
                }
            }
        });        
        
        var buttonsContainer = new Ext.Container({
            style: "position: relative; float:right",
            cls: "uploadForm",
            width: 80,
            items: [buttonTelecharger,
                {
                    xtype :'fileuploadfield',
                    inputType :'file',
                    id: 'uploadOutilAssocierFichier',
                    buttonOnly : true,
                    buttonText: "&nbsp; &nbsp; &nbsp; Ajouter&nbsp; &nbsp; &nbsp;&nbsp;", //width 80?
                    cls: "fileButton",
                    listeners : {
                        fileselected : function(e,name) {
                            
                            var fichier = e.fileInput.dom.files[0];

                            if (fichier) {
    
                                var extension = fichier.name.split(".")[fichier.name.split(".").length-1];
                                
                                var nom = fichier.name;
                                
                                var taille = fichier.size;
                                
                                var mime = fichier.type;
                                
                                that.associerFichier(fichier, nom, extension, taille, mime);
                            }
                            else{
                                Aide.afficherMessage("Message", "S.V.P. Sélectionner un fichier.", "OK", "MESSAGE"); 
                            }
                            
                            //Permet de réinialiser le panneau afin de permettre la resélection du même fichier.
                            this.reset();
                        }
                    }
                },
                buttonSupprimer,
                buttonQuitter
            ]
        });

        var formFichierAssoc = new Ext.FormPanel({
            buttonAlign: 'center',
            frame: true,
            cls: "uploadForm",
            fileUpload: true,
            formId: "frmUploadFichierSchema",
            items: [buttonsContainer,
                filesContainer
            ]
        });       
        
        this.fenetreAssocFichier = new Ext.Window({
            width: 500,
            height: 150,
            plain: true,
            resizable: false,
            hidden: true,
            layout: 'fit',
            modal: true,
            border: false,
            closable: false,
            items: [formFichierAssoc]
        });
    };
    
    
    OutilAssocierFichier.prototype.afficherFenetre = function(){
        if(!this.fenetreAssocFichier) {
            this.creerFenetreAssocFichier();
        }
        
        this.listerFichiers();
        
        this.fenetreAssocFichier.show();
    };
    
    OutilAssocierFichier.prototype.listerFichiers = function(){
       
        this.contexteParentListerFichiers(this.callBackListerFichiersSucess.bind(this), this.callBackListerFichiersErreur.bind(this));
    };
    
    OutilAssocierFichier.prototype.callBackListerFichiersSucess = function(data){
       
       this.gridAssocierFichier.getStore().loadData(data);
        
    };
    
    OutilAssocierFichier.prototype.callBackListerFichiersErreur = function(data){
       
        console.log("Impossible de lister les fichiers");
        
    };
    
    OutilAssocierFichier.prototype.associerFichier = function(fichier, nom, extension, taille, mime){
       
        this.contexteParentAssocierFichier(fichier, nom, extension, taille, mime, this.listerFichiers.bind(this));
    };
   
    OutilAssocierFichier.prototype.supprimerFichier = function(fichier){
      
        this.contexteParentSupprimerFichier(fichier, this.listerFichiers.bind(this));
    };
    
    OutilAssocierFichier.prototype.visualiserFichier = function(fichier){
                 
        this.contexteParentVisualiserFichier(fichier);
    };    
    
    OutilAssocierFichier.prototype.obtenirNombreFichier = function(){
        return this.gridAssocierFichier.getStore().getTotalCount();
    };
       
    return OutilAssocierFichier;
    
});