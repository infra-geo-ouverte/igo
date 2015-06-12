require.ajouterConfig({
    paths: {
      IGODatePicker: "libs/extension/Extjs/IGODatePicker"
    }
});

define(['fonctions', 'IGODatePicker'], function(Fonctions, IGODatePicker) {
    var DateTimeIntervalPicker = Ext.extend(Ext.Component, {
        // Prototype Defaults, can be overridden by user's config object
        startDate: new Date(),
        endDate: new Date(),
        active : false,
        mapServerTimeString : '',
        label : 'Date',
        allowIntervals : true,
        minStartDate : null,
        maxEndDate : null,
        precision: 'seconde',

        //returns the Map Server Formatted time filter. 
        getValue: function(){
            var retStr = null;
            var y1 = (this.startDate.getUTCFullYear()).toString();
            var m1 = '';
            if (this.startDate.getUTCMonth() < 9) {
                    m1 = '0' + (this.startDate.getUTCMonth() + 1).toString();
            } else {
                    m1 = (this.startDate.getUTCMonth() + 1).toString();
            }
            var d1 = '';
            if (this.startDate.getUTCDate() < 10) {
                    d1 = '0' + this.startDate.getUTCDate().toString();
            } else {
                    d1 = this.startDate.getUTCDate().toString();
            }
            var h1 = '';
            if (this.startDate.getUTCHours() < 10) {
                    h1 = '0' + (this.startDate.getUTCHours()).toString();
            } else {
                    h1 = (this.startDate.getUTCHours()).toString();
            }
            switch (this.precision){
                case 'seconde':
                    var startDateMapServerString = y1 + '-' + m1 + '-' + d1 + 'T' + h1 + ':00:00';
                break;
                case 'minute':
                    var startDateMapServerString = y1 + '-' + m1 + '-' + d1 + 'T' + h1 + ':00';
                break;
                case 'heure':
                    var startDateMapServerString = y1 + '-' + m1 + '-' + d1 + 'T' + h1;
                break;
                case 'jour':
                    var startDateMapServerString = y1 + '-' + m1 + '-' + d1;
                break;
                case 'mois':
                    var startDateMapServerString = y1 + '-' + m1;
                break;
                case 'annee':
                    var startDateMapServerString = y1;
                break;
                default:
                    var startDateMapServerString = y1 + '-' + m1 + '-' + d1 + 'T' + h1 + ':00:00Z';
            }

            if(this.allowIntervals){
                var y2 = (this.endDate.getUTCFullYear()).toString();
                var m2 = '';
                if (this.endDate.getUTCMonth() < 9) {
                    m2 = '0' + (this.endDate.getUTCMonth() + 1).toString();
                } else {
                    m2 = (this.endDate.getUTCMonth() + 1).toString();
                }
                var d2 = '';
                if (this.endDate.getUTCDate() < 10) {
                    d2 = '0' + this.endDate.getUTCDate().toString();
                } else {
                    d2 = this.endDate.getUTCDate().toString();
                }
                var h2 = '';
                if (this.endDate.getUTCHours() < 10) {
                    h2 = '0' + (this.endDate.getUTCHours()).toString();
                } else {
                    h2 = (this.endDate.getUTCHours()).toString();
                }
                //var endDateMapServerString = y2 + '-' + m2 + '-' + d2 + 'T' + h2 + ':00:00Z';

                switch (this.precision){
                    case 'seconde':
                        var endDateMapServerString = y2 + '-' + m2 + '-' + d2 + 'T' + h2 + ':00:00';
                    break;
                    case 'minute':
                        var endDateMapServerString = y2 + '-' + m2 + '-' + d2 + 'T' + h2 + ':00';
                    break;
                    case 'heure':
                        var endDateMapServerString = y2 + '-' + m2 + '-' + d2 + 'T' + h2;
                    break;
                    case 'jour':
                        var endDateMapServerString = y2 + '-' + m2 + '-' + d2 ;
                    break;
                    case 'mois':
                        var endDateMapServerString = y2 + '-' + m2 ;
                    break;
                    case 'annee':
                        var endDateMapServerString = y2 ;
                    break; 
                    default:
                        var endDateMapServerString = y2 + '-' + m2 + '-' + d2 + 'T' + h2 + ':00:00Z';
                }

                var retStr = startDateMapServerString + '/' + endDateMapServerString;
            }
            else{
                var retStr = startDateMapServerString;
            }

                return retStr;
            },

        initComponent: function(){
            // Called during component initialization

            // Config object has already been applied to 'this' so properties can 
            // be overriden here or new properties (e.g. items, tools, buttons) 
            // can be added, eg:
            Ext.apply(this, {
                //propA: 3
            });


            // Before parent code

            // Call parent (required)
            DateTimeIntervalPicker.superclass.initComponent.apply(this, arguments); 

            // After parent code
            // e.g. install event handlers on rendered component
            this.addEvents(
                /**
                 * @event select
                 * Fires when a date is selected
                 * @param {DatePicker} this DatePicker
                 * @param {Date} date The selected date
                 */
                'intervalChanged'
            );

            if(this.handler){
                this.on('intervalChanged', this.handler,  this.scope || this);
            }           
            this.label = 'Date ';

            // If the time filter is already setted, read the value into a Date object.
            if(this.layer.params['TIME'] != undefined && this.layer.params['TIME'] != ''){
                this.mapServerTimeString = this.layer.params['TIME'];
            }

            // Only time format currently supported: YYYY-MM-DDTHH
            if (undefined != this.mapServerTimeString && '' != this.mapServerTimeString){															

                // Split startdtg and enddtg.
                var mapServerFormatIntervalStrArray = this.mapServerTimeString.split("/");
                var startfilterdtg = Fonctions.createDateFromIsoString(mapServerFormatIntervalStrArray[0]);						
                var endfilterdtg = new Date();
                if(this.allowIntervals && mapServerFormatIntervalStrArray[1] != undefined){				
                    endfilterdtg = Fonctions.createDateFromIsoString(mapServerFormatIntervalStrArray[1]);
                }

                // Set the start and end date on the DateTimeIntervalPicker.
                this.startDate = startfilterdtg;			
                this.endDate = endfilterdtg;
                if(this.allowIntervals){
                    // 	Set the label on the menu item.
                    this.label = 'Date : ' + startfilterdtg.toLocaleDateString() + " - " + endfilterdtg.toLocaleDateString();
                }else{
                    this.label = 'Date : ' + startfilterdtg.toLocaleDateString();
                }					
                this.active = true;
            }
        },    

        sameDate: function(date1, date2){
            return (date1.getFullYear() - date2.getFullYear() == 0 
                    && date1.getMonth() - date2.getMonth() == 0 
                    && date1.getDate() - date2.getDate() == 0)
        },

        // Override other inherited methods 
        onRender: function(container, position){   	
            // Before parent code

            // Call parent (required)
            DateTimeIntervalPicker.superclass.onRender.apply(this, arguments);

            // After parent code

            // Creation du template html avec les div des composantes.

            var html = null;
            if(this.allowIntervals){
                if(this.ajoutDivHeure()){
                    html = "<div id='dtgDiv1'></div><div id='hd'>Heure Debut (UTC):</div><div id='slider1'></div><div id='dtgDiv2'></div><div id='hf'>Heure Fin (UTC):</div><div id='slider2'></div><div id='enableDiv'></div>";
                }
                else{
                    html = "<div id='dtgDiv1'></div><div id='slider1'></div><div id='dtgDiv2'></div><div id='slider2'></div><div id='enableDiv'></div>";
                }
            }
            else{
                if(this.ajoutDivHeure){
                    html = "<div id='dtgDiv1'></div><div id='hd'>Heure (UTC):</div><div id='slider1'></div><div id='searchDayDiv'></div><div id='searchNightDiv'></div><div id='enableDiv'></div>";
                }
                else{
                    html = "<div id='dtgDiv1'></div><div id='searchDayDiv'></div><div id='searchNightDiv'></div><div id='enableDiv'></div>";
                }
            }

            // Creation du Div pour le component.
            var el = document.createElement('div');
            el.className = 'x-date-picker';
            el.innerHTML = html;
            container.dom.insertBefore(el, position);
            // Creation des composantes ExtJS.  
            var dtg1 = new IGODatePicker({
                renderTo: 'dtgDiv1' 
            });

            dtg1.setValue(this.startDate);
            dtg1.setMaxDate(this.endDate);

            if(this.minStartDate != null){
                dtg1.setMinDate(this.minStartDate);
            }
            if(!this.allowIntervals){
                dtg1.setMaxDate(this.maxEndDate);
            }

            var startHourNumberField = new Ext.form.NumberField({
                id: 'startHour',
                fieldLabel: 'Heure (UTC)',
                name: 'Start Hour',
                renderTo: 'slider1',
                decimalPrecision:1,
                value: this.startDate.getHours(),
                minValue:0,
                maxValue:23,
                hidden: !this.ajoutDivHeure()
            });

            if(this.allowIntervals){
                var endHourNumberField = new Ext.form.NumberField({
                    id: 'endHour',
                    fieldLabel: 'Heure (UTC)',
                    name: 'End Hour',
                    renderTo: 'slider2',
                    decimalPrecision:1,
                    value: this.endDate.getHours(),
                    minValue:0,
                    maxValue:23,
                    hidden: !this.ajoutDivHeure()
                });
            }

            if(this.allowIntervals){

                var dtg2 = new IGODatePicker({
                    renderTo: 'dtgDiv2' 
                });

                dtg2.setValue(this.endDate);
                dtg2.setMinDate(this.startDate);

                if(this.maxEndDate != null){
                   dtg2.setMaxDate(this.maxEndDate);
                }            
            }

            var enableCheckbox = new Ext.form.Checkbox({
                id: 'enableCheckBox',
                renderTo: 'enableDiv',
                boxLabel : 'Activer le filtre'
            });

            if(!this.active){
                dtg1.setDisabled(true);
                if(this.allowIntervals){
                    dtg2.setDisabled(true);
                    endHourNumberField.setDisabled(true);	
                }
                startHourNumberField.setDisabled(true);				
            }
            enableCheckbox.setValue(this.active);

            var me = this;

            if(!this.allowIntervals){
                // Enforce according to new values.		
                if(me.sameDate(me.maxEndDate, dtg1.getValue())){
                    // Same day, therefore enforce maxTime.
                    if(startHourNumberField.getValue() > me.maxEndDate.getHours()){
                        startHourNumberField.setValue(me.maxEndDate.getHours());
                    }
                    startHourNumberField.setMaxValue(me.maxEndDate.getHours());
                }
                else{startHourNumberField.setMaxValue(23);}
                if(me.sameDate(me.minStartDate, dtg1.getValue())){
                    // Same day, therefore enforce minTime.
                    startHourNumberField.setMinValue(me.minStartDate.getHours());
                    if(startHourNumberField.getValue() < me.minStartDate.getHours()){
                        startHourNumberField.setValue(me.minStartDate.getHours());
                    }				
                }
                else{startHourNumberField.setMinValue(0);}
            }

            enableCheckbox.on('check', function(e){
                var enableComponents = enableCheckbox.getValue();
                dtg1.setDisabled(!enableComponents);
                if(me.allowIntervals){				
                    dtg2.setDisabled(!enableComponents);
                    endHourNumberField.setDisabled(!enableComponents);
                }
                startHourNumberField.setDisabled(!enableComponents);			
                me.active = enableComponents;
                me.fireEvent('intervalChanged', me);
            });

            // Logique... Le DTG fin ne peut etre plus petit que le dtg debut.
            dtg1.on('select', function(e, date) {
                if(me.allowIntervals){				
                    dtg2.setMinDate(date);
                    if((dtg1.getValue() - dtg2.getValue()) == 0 && startHourNumberField.getValue() > endHourNumberField.getValue()){
                        startHourNumberField.setValue(endHourNumberField.getValue());
                    }
                }
                else{
                    // First Reset max and min values to prevent issues.
                    startHourNumberField.setMinValue(0);
                    startHourNumberField.setMaxValue(23);
                    // Then enforce min time and max time on the time picker according to maxEndTime and minStartTime.
                    if(me.sameDate(me.maxEndDate, dtg1.getValue())){
                        // Same day, therefore enforce maxTime.					
                        if(startHourNumberField.getValue() > me.maxEndDate.getHours()){
                            startHourNumberField.setValue(me.maxEndDate.getHours());
                        }
                        startHourNumberField.setMaxValue(me.maxEndDate.getHours());
                    }
                    else{startHourNumberField.setMaxValue(23);}
                    if(me.sameDate(me.minStartDate, dtg1.getValue())){
                        // Same day, therefore enforce minTime.								
                        if(startHourNumberField.getValue() < me.minStartDate.getHours()){
                            startHourNumberField.setValue(me.minStartDate.getHours());
                        }
                        startHourNumberField.setMinValue(me.minStartDate.getHours());
                    }
                    else{startHourNumberField.setMinValue(0);}
                }
                me.startDate.setDate(dtg1.getValue().getDate());
                me.startDate.setMonth(dtg1.getValue().getMonth());
                me.startDate.setFullYear(dtg1.getValue().getFullYear());
                //me.startDate = dtg1.getValue();
                me.fireEvent('intervalChanged', me);			
            });

            startHourNumberField.on('change', function(field, newValue) {
                document.getElementById("hd").innerHTML = "Heure Debut (UTC): " + newValue.toString() + "H";
                if(me.allowIntervals){
                    if((dtg1.getValue() - dtg2.getValue()) == 0 && endHourNumberField.getValue() < newValue){
                        endHourNumberField.setValue(newValue);
                    }	
                }
                me.startDate.setHours(newValue);
                me.fireEvent('intervalChanged', me);		
            });

            if(this.allowIntervals){
                dtg2.on('select', function(e, date) {
                    dtg1.setMaxDate(date);
                    if((dtg1.getValue() - dtg2.getValue()) == 0 && startHourNumberField.getValue() > endHourNumberField.getValue()){
                        endHourNumberField.setValue(startHourNumberField.getValue());
                    }
                    me.endDate.setDate(dtg2.getValue().getDate());
                    me.endDate.setMonth(dtg2.getValue().getMonth());
                    me.endDate.setFullYear(dtg2.getValue().getFullYear());
                    me.fireEvent('intervalChanged', me);
                });		
            }

            if(me.allowIntervals){
                endHourNumberField.on('change', function(field, newValue) {
                    document.getElementById("hf").innerHTML = "Heure Fin (UTC): " + newValue.toString() + "H"; 
                    if((dtg1.getValue() - dtg2.getValue()) == 0 && startHourNumberField.getValue() > endHourNumberField){
                        startHourNumberField.setValue(newValue);
                    }
                    me.endDate.setHours(newValue);
                    me.fireEvent('intervalChanged', me);
                });
            }

            // Register to the intervalChanged event.
            this.on('intervalChanged', function(e){
                // Merge the time param on the layer.
                if(e.active){
                    e.layer.mergeNewParams({'time':e.getValue()});
                }
                else{
                    delete e.layer.params.TIME;
                    e.layer.redraw();
                }
            });
        },

        ajoutDivHeure: function(){
            if(this.precision == 'seconde' || this.precision == 'minute' || this.precision == 'heure'){
                return true;
            }
            else{
                return false;
            }
        }


    });

    // register xtype to allow for lazy initialization
    Ext.reg('datetimeinvervalpicker', DateTimeIntervalPicker);
    
    return DateTimeIntervalPicker;
});