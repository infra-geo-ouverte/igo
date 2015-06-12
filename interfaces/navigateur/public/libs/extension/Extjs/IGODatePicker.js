define([], function() {
    return Ext.extend(Ext.DatePicker,{
        // private
        onMonthClick : function(e, t){
            e.stopEvent();
            var el = new Ext.Element(t), pn;
            if(el.is('button.x-date-mp-cancel')){
                this.hideMonthPicker();
            }
            else if(el.is('button.x-date-mp-ok')){
                var d = new Date(this.mpSelYear, this.mpSelMonth, (this.activeDate || this.value).getDate());
                if(d.getMonth() != this.mpSelMonth){
                    // 'fix' the JS rolling date conversion if needed
                    d = new Date(this.mpSelYear, this.mpSelMonth, 1).getLastDateOfMonth();
                }
                this.setValue(d);
                this.hideMonthPicker();
                            this.fireEvent('select', this, d);
            }
            else if((pn = el.up('td.x-date-mp-month', 2))){
                this.mpMonths.removeClass('x-date-mp-sel');
                pn.addClass('x-date-mp-sel');
                this.mpSelMonth = pn.dom.xmonth;
            }
            else if((pn = el.up('td.x-date-mp-year', 2))){
                this.mpYears.removeClass('x-date-mp-sel');
                pn.addClass('x-date-mp-sel');
                this.mpSelYear = pn.dom.xyear;
            }
            else if(el.is('a.x-date-mp-prev')){
                this.updateMPYear(this.mpyear-10);
            }
            else if(el.is('a.x-date-mp-next')){
                this.updateMPYear(this.mpyear+10);
            }
        },

        // private
        onMonthDblClick : function(e, t){
            e.stopEvent();
            var el = new Ext.Element(t), pn;
            var d = new Date(this.mpSelYear, this.mpSelMonth, (this.activeDate || this.value).getDate());
            if(d.getMonth() != this.mpSelMonth){
                // 'fix' the JS rolling date conversion if needed
                d = new Date(this.mpSelYear, this.mpSelMonth, 1).getLastDateOfMonth();
            }
            this.setValue(d);
            this.hideMonthPicker();
            this.fireEvent('select', this, d);
        }
    });
});