/** 
 * Module pour l'objet {@link Outil.OutilExportCSV}.
 * @module outilAide
 * @requires outil 
 * @requires aide 
 * @author Michael Lane, FADQ
 * @version 1.0
 */
define(['outil', 'aide'], function(Outil, Aide) {
    /** 
     * Création de l'object Outil.OutilExportCSV.
     * Pour la liste complète des paramètres, voir {@link Outil}
     * @constructor
     * @name Outil.OutilExportCSV
     * @class Outil.OutilExportCSV
     * @alias outilAide:Outil.OutilExportCSV
     * @extends Outil
     * @requires outilExportCSV
     * @param {string} [options.id='aide_igo##'] Identifiant du bouton. Si absent, XX est un nombre généré.
     * @param {string} [options.icone='aide'] Icone du bouton. Lien vers l'image ou une classe CSS
     * @param {string} [options.infobulle='Guide d'auto-formation'] Description (tooltip) du bouton
     * @param {string} [options.lien] Lien vers l'aide. Si absent, lien vers l'aide du MSP.
     * @returns {Outil.OutilExportCSV} Instance de {@link Outil.OutilExportCSV}
    */
    function OutilExportCSV(options){
        this.options = options || {};
        this.defautOptions = $.extend({}, this.defautOptions, {
            icone: 'export-csv',
            id: 'export-csv_igo',
            infobulle: "Exporter les données en CSV"
        });
    };
    
    OutilExportCSV.prototype = new Outil();
    OutilExportCSV.prototype.constructor = OutilExportCSV;
 
 
    /** 
    * Action de l'outil.
    * Exporter les données de la table en CSV
    * @method
    * @name Outil.OutilExportCSV#executer
    */
    OutilExportCSV.prototype.executer =  function () {
       
        var colonnes = this.options.colonnes;
        var donnees = this.options.donnees;
        
        var tabTitre = Array();
        var tabAttribut = Array();
        var tabDonnees = Array();
        
        var attributFloat = Array();
        
        $.each(colonnes, function(ind, col){
            tabTitre.push(col.titre);
            
            //TODO exclure les colonnes non visible ("isHidden" n'est pas implémenté dans extjs 3.4)
            tabAttribut.push(col.propriete);

            if(col.type == "float"){
                attributFloat.push(col.propriete);
            }           
        });
        
        tabDonnees.push(tabTitre);
        
        $.each(donnees, function(ind, occu){           
            var ligne = Array();
            $.each(tabAttribut, function(index, attribut){
                
                //Remplacer le point par une virgule pour les float
                if(attributFloat.indexOf(attribut) == -1){                
                    ligne.push(occu.proprietes[attribut]);
                }
                else {
                    ligne.push(occu.proprietes[attribut].replace(".",","));
                }
            });
            tabDonnees.push(ligne);   
        });

        var csvContent = "";
        tabDonnees.forEach(function(infoArray, index){

           dataString = infoArray.join(";");           
           csvContent += index < tabDonnees.length ? dataString+ "\n" : dataString;

        });
        
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", "data:text/csv;charset=utf-8,\uFEFF" + encodedUri);
        link.setAttribute("download", "export "+this.options.titreFichier+".csv");

        link.click(); // This will download the data file named "my_data.csv".
        

    };

    return OutilExportCSV;
    
});