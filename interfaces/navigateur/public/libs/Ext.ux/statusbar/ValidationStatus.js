/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/**
 * @class Ext.ux.ValidationStatus
 * A {@link Ext.StatusBar} plugin that provides automatic error notification when the
 * associated form contains validation errors.
 * @extends Ext.Component
 * @constructor
 * Creates a new ValiationStatus plugin
 * @param {Object} config A config object
 */
Ext.ux.ValidationStatus = Ext.extend(Ext.Component, {
    /**
     * @cfg {String} errorIconCls
     * The {@link #iconCls} value to be applied to the status message when there is a
     * validation error. Defaults to <tt>'x-status-error'</tt>.
     */
    errorIconCls : 'x-status-error',
    /**
     * @cfg {String} errorListCls
     * The css class to be used for the error list when there are validation errors.
     * Defaults to <tt>'x-status-error-list'</tt>.
     */
    errorListCls : 'x-status-error-list',
    /**
     * @cfg {String} validIconCls
     * The {@link #iconCls} value to be applied to the status message when the form
     * validates. Defaults to <tt>'x-status-valid'</tt>.
     */
    validIconCls : 'x-status-valid',
    
    /**
     * @cfg {String} showText
     * The {@link #text} value to be applied when there is a form validation error.
     * Defaults to <tt>'The form has errors (click for details...)'</tt>.
     */
    showText : 'The form has errors (click for details...)',
    /**
     * @cfg {String} showText
     * The {@link #text} value to display when the error list is displayed.
     * Defaults to <tt>'Click again to hide the error list'</tt>.
     */
    hideText : 'Click again to hide the error list',
    /**
     * @cfg {String} submitText
     * The {@link #text} value to be applied when the form is being submitted.
     * Defaults to <tt>'Saving...'</tt>.
     */
    submitText : 'Saving...',
    
    // private
    init : function(sb){
        sb.on('render', function(){
            this.statusBar = sb;
            this.monitor = true;
            this.errors = new Ext.util.MixedCollection();
            this.listAlign = (sb.statusAlign=='right' ? 'br-tr?' : 'bl-tl?');
            
            if(this.form){
                this.form = Ext.getCmp(this.form).getForm();
                this.startMonitoring();
                this.form.on('beforeaction', function(f, action){
                    if(action.type == 'submit'){
                        // Ignore monitoring while submitting otherwise the field validation
                        // events cause the status message to reset too early
                        this.monitor = false;
                    }
                }, this);
                var startMonitor = function(){
                    this.monitor = true;
                };
                this.form.on('actioncomplete', startMonitor, this);
                this.form.on('actionfailed', startMonitor, this);
            }
        }, this, {single:true});
        sb.on({
            scope: this,
            afterlayout:{
                single: true,
                fn: function(){
                    // Grab the statusEl after the first layout.
                    sb.statusEl.getEl().on('click', this.onStatusClick, this, {buffer:200});
                } 
            }, 
            beforedestroy:{
                single: true,
                fn: this.onDestroy
            } 
        });
    },
    
    // private
    startMonitoring : function(){
        this.form.items.each(function(f){
            f.on('invalid', this.onFieldValidation, this);
            f.on('valid', this.onFieldValidation, this);
        }, this);
    },
    
    // private
    stopMonitoring : function(){
        this.form.items.each(function(f){
            f.un('invalid', this.onFieldValidation, this);
            f.un('valid', this.onFieldValidation, this);
        }, this);
    },
    
    // private
    onDestroy : function(){
        this.stopMonitoring();
        this.statusBar.statusEl.un('click', this.onStatusClick, this);
        Ext.ux.ValidationStatus.superclass.onDestroy.call(this);
    },
    
    // private
    onFieldValidation : function(f, msg){
        if(!this.monitor){
            return false;
        }
        if(msg){
            this.errors.add(f.id, {field:f, msg:msg});
        }else{
            this.errors.removeKey(f.id);
        }
        this.updateErrorList();
        if(this.errors.getCount() > 0){
            if(this.statusBar.getText() != this.showText){
                this.statusBar.setStatus({text:this.showText, iconCls:this.errorIconCls});
            }
        }else{
            this.statusBar.clearStatus().setIcon(this.validIconCls);
        }
    },
    
    // private
    updateErrorList : function(){
        if(this.errors.getCount() > 0){
	        var msg = '<ul>';
	        this.errors.each(function(err){
	            msg += ('<li id="x-err-'+ err.field.id +'"><a href="#">' + err.msg + '</a></li>');
	        }, this);
	        this.getMsgEl().update(msg+'</ul>');
        }else{
            this.getMsgEl().update('');
        }
    },
    
    // private
    getMsgEl : function(){
        if(!this.msgEl){
            this.msgEl = Ext.DomHelper.append(Ext.getBody(), {
                cls: this.errorListCls+' x-hide-offsets'
            }, true);
            
            this.msgEl.on('click', function(e){
                var t = e.getTarget('li', 10, true);
                if(t){
                    Ext.getCmp(t.id.split('x-err-')[1]).focus();
                    this.hideErrors();
                }
            }, this, {stopEvent:true}); // prevent anchor click navigation
        }
        return this.msgEl;
    },
    
    // private
    showErrors : function(){
        this.updateErrorList();
        this.getMsgEl().alignTo(this.statusBar.getEl(), this.listAlign).slideIn('b', {duration:0.3, easing:'easeOut'});
        this.statusBar.setText(this.hideText);
        this.form.getEl().on('click', this.hideErrors, this, {single:true}); // hide if the user clicks directly into the form
    },
    
    // private
    hideErrors : function(){
        var el = this.getMsgEl();
        if(el.isVisible()){
	        el.slideOut('b', {duration:0.2, easing:'easeIn'});
	        this.statusBar.setText(this.showText);
        }
        this.form.getEl().un('click', this.hideErrors, this);
    },
    
    // private
    onStatusClick : function(){
        if(this.getMsgEl().isVisible()){
            this.hideErrors();
        }else if(this.errors.getCount() > 0){
            this.showErrors();
        }
    }
});