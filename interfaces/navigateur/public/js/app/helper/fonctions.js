/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([], function() {

    function Fonctions(){

    };

    Fonctions.afficherProprietes = function(occurences){
        var tabs = new Ext.TabPanel({
            activeTab: 0,
            enableTabScroll: true,
            height :490
        });
        var oResultWindow = new Ext.Window({
            id: 'occurencesResultatsWindow',
            title    : 'Résultats de la requête',
            width    : 600,
            height   : 600,
            border : false,
            modal: true,
            plain    : true,
            closable : true,
            resizable : true,
            autoScroll: true,
            constrain: true,
            layout:'fit',
            items: [tabs]
        });

        var aColumns = [];
        aColumns.push({header: 'Item', sortable: true, dataIndex: 'Item', width: 50});
        aColumns.push({header: 'Objet', sortable: false, dataIndex: 'Objet', hidden:true, width: 50});
        aColumns.push({header: 'Attribut', sortable: false, dataIndex: 'Attribut', width: 150});
        aColumns.push({id: 'Valeur', header: 'Valeur', sortable: false, dataIndex: 'Valeur',
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                metaData.css = 'multilineColumn'; return value;
            }
        });

        var RecordTemplate = Ext.data.Record.create([{name:'Item'}, {name:'Objet'}, {name:'Attribut'}, {name:'Valeur'}]);

        var aoStores={};
        var monGridPanel={};
        $.each(occurences, function(key, occurence){
            var id = occurence.vecteur.obtenirId();
            if(!aoStores[id]){
                aoStores[id] = new Ext.data.GroupingStore({
                        fields: ['Item', 'Objet', 'Attribut', 'Valeur'],
                        sortInfo: {field: 'Item', direction: 'DESC'},
                        groupOnSort: true,
                        remoteGroup: false,
                        groupField: 'Item'
                    }
                );
            };

            var proprietes = occurence.obtenirProprietes();
            if($.isEmptyObject(proprietes)){
                var newRecord = new RecordTemplate({Item: occurence.id, Objet: undefined, Attribut: 'Propriétés', Valeur: 'Aucune'});
                aoStores[id].add(newRecord);
            }
            $.each(proprietes, function(attribut, valeur){
                var newRecord;
                if($.isPlainObject(valeur) || $.isArray(valeur)){
                    newRecord = new RecordTemplate({Item: occurence.id, Objet: valeur, Attribut: attribut, Valeur: "+"});
                } else {
                    newRecord = new RecordTemplate({Item: occurence.id, Objet: undefined, Attribut: attribut, Valeur: valeur});
                }
                aoStores[id].add(newRecord);
            });

            if(!monGridPanel[id]){
                monGridPanel[id] = new Ext.grid.GridPanel({
                    title: occurence.vecteur.obtenirTitre(),
                    store: aoStores[id],
                    columns:aColumns,
                    stripeRows: true,
                    autoExpandColumn: 'Valeur',
                    height:500,
                    disableSelection : false,
                    trackMouseOver : false,
                    enableHdMenu : false,
                    view: new Ext.grid.GroupingView({
                        scrollOffset: 30,
                        hideGroupedColumn: true,
                        startCollapsed: false,
                        getRowClass: function(record, index, rowParams) {
                            var classe = '';
                            if(record.data.Objet){
                                classe = 'cursor-pointer ';
                            }
                            if( record.get('Item') % 2.0 == 0.0 ){
                                return classe+'background-bleupale-row';
                            }
                            return classe+'background-white-row';
                        }
                    })	
                });
            }
        });
        $.each(monGridPanel, function(key, gridPanel){
            tabs.add(gridPanel);

            gridPanel.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
                if(sm.getCount() !== 1 || !r.data.Objet){
                    sm.selectRange();
                    return false;
                }
                if(r.data.Valeur == '+') {
                    r.data.Valeur='-';
                    r.commit();
                    $.each(r.data.Objet, function(attribut, valeur){
                        var newRecord;
                        if($.isPlainObject(valeur) || $.isArray(valeur)){
                            newRecord = new RecordTemplate({Item: r.data.Item, Objet: valeur, Attribut: r.data.Attribut + '.' + attribut, Valeur: "+"});
                        } else {
                            newRecord = new RecordTemplate({Item: r.data.Item, Objet: undefined, Attribut: r.data.Attribut + '.' + attribut, Valeur: valeur});
                        }

                        gridPanel.store.insert(rowIdx+1, newRecord)
                    });         
                } else {
                    r.data.Valeur='+';
                    r.commit();
                    $.each(gridPanel.store.getRange(), function(recordKey, record){
                        if(record.data.Item !== r.data.Item){return true};
                        if(record.data.Attribut.match('^'+r.data.Attribut+'.')){
                            gridPanel.store.remove(record);
                        }
                    });
                }
                sm.selectRange();
            });
        });

        oResultWindow.show();
        
    };
    
    Fonctions.createDateFromIsoString = function(isoDateString){		
	var date = new Date();
	var strArray = isoDateString.split("-");
	switch(strArray.length){
            case 0:
                alert("Le format de la date pour cette couche n'est pas supporté.");
                break;
            case 1:
                date.setUTCFullYear(strArray[0]);
                break;
            case 2:
                date.setUTCFullYear(strArray[0]);
                date.setUTCMonth(strArray[1] - 1);
            break;
            case 3:     
                if(strArray[2].split("T")[1]){
                    date.setUTCHours(strArray[2].split("T")[1].split(":")[0]);
                }
                date.setUTCDate(strArray[2].split("T")[0]);
                date.setUTCMonth(strArray[1] - 1);
                date.setUTCFullYear(strArray[0]);
                break;
	}
        
	return date;
    };    
    
    Fonctions.rgbToHex = function(r, g, b){
        var componentToHex = function(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };
    
    Fonctions.convertirMesure = function(mesure, uniteDepart, uniteConvertie){
        if(!mesure || !uniteDepart || !uniteConvertie){return 0;}
        
        var metresParUniteDepart = this.obtenirMetresParUnite(uniteDepart);
        var metresParUniteConvertie = this.obtenirMetresParUnite(uniteConvertie);
        
        if(!metresParUniteDepart || !metresParUniteConvertie){return 0;}

        return mesure*metresParUniteDepart/metresParUniteConvertie;
    };
    
    Fonctions.obtenirMetresParUnite = function(unite){
        var metres;
        switch(unite) {
            case 'm':
            case 'mètre':    
                metres = 1;
                break;    
            case 'km':
            case 'kilomètre':    
                metres = 1000;
                break; 
            case 'pied':
                metres = 0.304799999536704;
                break;         
            case 'mile':
                metres = 1609.3440;
                break;  
            case 'm²':
            case 'mètre²':    
                metres = 1;
                break;    
            case 'km²':
            case 'kilomètre²':    
                metres = 1000000;
                break; 
            case 'pied²':
                metres = 0.09290304;
                break;         
            case 'mile²':
                metres = 2589988.110336;
                break;  
            case 'acre':
                metres = 4046.85642; 
                break;  
            case 'hectare':
                metres = 10000; 
                break;  
        }
        return metres;
    };
    
    return Fonctions;
    
});