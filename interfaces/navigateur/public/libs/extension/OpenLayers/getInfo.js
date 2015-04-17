/*
Modifier par Steve Toutant
15 décembre 2010
Améliorer la présentation du résultat du GetFeatureInfo
- Utilisation d'un GroupingStore au lieu d'un SimpleStore
- Utilisation d'un Ext.grid.GroupingView pour grouper les items
- Présentation dans un tabPanel

Les modifications sont faites dans la fonction showResult
*/

/**
 * @requires OpenLayers OpenLayers/Handler/Click.js
 */

/**
 * Class: OpenLayers.Control.GetInfo
 *
 * Inherits From:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.GetInfo = OpenLayers.Class(OpenLayers.Control, {
    /**
     * Property: queryablelayers
     *
     * {Array(String)} Layers that are queryable with GetFeatureInfo requests
     */
    queryablelayertypes : ["OpenLayers.Layer.WMS"],

    /**
     * Property: layers
     * {<Openlayer.Layer>} Array of layers ready to be queryed.  Automatically
     *                     updated/reseted.
     */
    layerstoquery: null,

    /**
     * Property: queries
     * {Integer} Number of current query results received.
     */
    queries: 0,

    /**
     * Property: errors
     * {Integer} Number of errors received.
     */
    errors: 0,

    /**
     * APIProperty: features
     * {Array(<OpenLayers.Feature.Vector>)} 
     */
    features: null,

    /**
     * Property: waitwindow
     * {Ext.Window} A ext window displayed while waiting for a response
     */
    waitmessage: null,

    /**
     * Property: waitoptions
     * {Object} The options given to the waiting message
     */
    waitoptions: null,

    /**
     * Constructor: OpenLayers.Control.GetInfo
     * Create a new GetInfo control.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     control.
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.layerstoquery = [];
        this.features = [];

        // Handler.Click
        var callbacks = {
          click: this.onClick
        };
        var options = {
          delay: 0
        };
        this.handler = new OpenLayers.Handler.Click(this, callbacks, options);

        this.waitoptions = {
           msg: 'Chargement de votre requête, patientez un moment...',
           progressText: 'Chargement...',
           width:300,
           wait:true,
           waitConfig: {interval:200}
        };
    },

    /**
     * Function: onClick
     *
     * Function called when the map is clicked.  It loops through the map 
     * layers and populate this.layerstoquery with current visible layers using
     * the getQueryableLayers method.  Then, each layer builds its request url
     * and sends it. 
     * 
     * On success, this.getFeatures is called.
     * On error, this.onError is called.
     *
     * Parameters:
     * evt - browser event
     */
    onClick: function(evt) {
        this.layerstoquery = this.getQueryableLayers();

        if(this.layerstoquery.length == 0){
            // TODO : this is HARDCODED
            var szErrMsg = "Veuillez sélectionner au moins une couche avant d'effectuer une requête.";
            Igo.Aide.afficherMessage("Erreur", szErrMsg, "OK", "ERROR");
            return;
        }

        // load each query
        this.waitmessage = Ext.MessageBox.show(this.waitoptions);
		var array_url = new Array();
		var array_response = new Array();
		//possible d'avoir plus d'un layerstoquery ?? 
		
		for(var j=0; j<this.layerstoquery.length; j++){
			var oLayerToQuery = this.layerstoquery[j];
			for (var i=0; i<this.layerstoquery[j].queryLayers.length; i++) {
	            var szURL =  oLayerToQuery.layer.getFullRequestString({
	                  REQUEST: "GetFeatureInfo",
	                  EXCEPTIONS: "application/vnd.ogc.se_xml",
	                  VERSION: "1.0.0",
	                  SRS: this.map.getProjection(),
	                  BBOX: this.map.getExtent().toBBOX(),
	                  QUERY_LAYERS: oLayerToQuery.queryLayers[i],
	                  X: evt.xy.x,
	                  Y: evt.xy.y,
	                  // TODO : INFO_FORMAT and FEATURE_COUNT are HARDCODED
	                  INFO_FORMAT: 'gml; charset=iso-8859-1',
	                  FEATURE_COUNT: 1000,
	                  WIDTH: this.map.size.w,
	                  HEIGHT: this.map.size.h
                        });

                        if(szURL.lastIndexOf("/", 0) === 0){
                            //szURL = Igo.Aide.obtenirHote() + szURL;
                        }
                        //var proxy= Igo.Aide.obtenirProxy()+'?url=';  
                        //console.log(szURL);
                        array_url.push(Igo.Aide.utiliserProxy(decodeURIComponent(szURL)));
                        //array_url.push( szURL);
                    }
		}
	
		this.loopThrough(0,array_url, array_response, this);
    },

    /**
     * Function: getFeatures
     *
     * Push the returned features in the AJAX response to this.features array.
     * At the same time, increment the number of responses received.  If current
     * response is the last expected response, show the results.
     *
     * Parameters:
     * response - AJAX response
     */
    getFeatures: function(array_response)
	{
		var array_doc = new Array(); 
        var oFormat = new OpenLayers.Format.WMSGetFeatureInfo();
		var total = array_response.length;
		
		//IE: utilisation de responseXML
		//Autres: utilisation de responseText et DOMParser
		for(i=0;i<total;i++){
			if (window.ActiveXObject){
				var oFeatures = oFormat.read_msGMLOutput(array_response[i]);
			} else {
				var parser=new DOMParser();
				var doc=parser.parseFromString(array_response[i],'text/xml');
				array_doc[array_doc.length] = doc;
				var oFeatures = oFormat.read_msGMLOutput(doc);
			}
			
			this.features = this.features.concat(oFeatures);
			this.queries++;
		}
  
		this.showResult();
    },

    /**
     * Function: resetQueryData
     *
     * Reset properties to their initial values to be ready for a new query.
     */
    resetQueryData: function() {
        this.layerstoquery = [];
        this.features = [];
        this.queries = 0;
        this.errors = 0;
    },

    /**
     * Method: showResult
     * 
     * As soon as the last query result is received and treated, this function
     * is called.  
     * 
     * If no features were returned, it only displays a "no features found"
     * message and exits, plus if one or more error were found, this will also
     * be displayed.
     *
     * If features were returned, for each feature type, the function creates
     * a Ext.DataStore it then applies to a Ext.Grid.  Each Grid are added to 
     * a Ext.Window.  That window is then displayed on screen.  On closing, it
     * is destroyed and the features and query results are reseted.
     *
     * The feature type can be determined by the "type" property of the feature,
     * which is equal to the name of the server-side layer it belongs to.  Since
     * features from the same server-side layer share common attributes, they
     * share the same grid.
     */
    showResult: function(){
        // if no records were found
        if(this.features.length == 0){
            this.waitmessage.hide();
            // TODO : this is HARDCODED
            var szErrMsg = "Aucun enregistrement n'a été trouvé.";
            var szErrTitle = "Aucun enregistrement trouvé";
            var szIcon = "INFO";
            
            if(this.errors == 1){
                szErrMsg += "  De plus, "+this.errors+
                            " erreur est survenue.";
                szErrTitle += " et erreur";
                szIcon = "ERROR";
            } else if (this.errors > 1){
                szErrMsg += "  De plus, "+this.errors+
                            " erreurs sont survenues.";
                szErrTitle += " et erreurs";
                szIcon = "ERROR";
            }
            Igo.Aide.afficherMessage(szErrTitle, szErrMsg, "OK", szIcon);
            //alert("no records found");

            this.resetQueryData();
            return;
        }
		
		// Stores creation Steve Toutant
        var aoStores = {}, aoColumns = {}, nStores = 0, aNbItem = [];
		for(var i=0; i<this.features.length; i++)
		{
            var oFeature = this.features[i];
            var szType = oFeature.type;
			var aColumns = [];

            // if store already exists, no need to create it
            if( !aoStores[szType] )
			{
				//aoStores[szType] = new Ext.data.SimpleStore({fields: ['Couche', 'Item', 'Attribut', 'Valeur']});
				aoStores[szType] = new Ext.data.GroupingStore(
					{
						fields: [/*'Couche',*/ 'Item', 'Attribut', 'Valeur'],
						sortInfo: {field: 'Item', direction: 'DESC'},
						groupOnSort: true,
						remoteGroup: false,
						groupField: 'Item'
					}
				);
				
				aNbItem[szType] = 0;
				aColumns.push({header: 'Item', sortable: true, dataIndex: 'Item', width: 50});
				aColumns.push({header: 'Attribut', sortable: false, dataIndex: 'Attribut', width: 150});
				aColumns.push(
					{id: 'Valeur', header: 'Valeur', sortable: false, dataIndex: 'Valeur',
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							metaData.css = 'multilineColumn'; return value;
						}
					});
				
				aoColumns[szType] = aColumns;
				nStores++;
			}
		}

		// record adding in corresponding store
		var RecordTemplate = Ext.data.Record.create([/*{name:'Couche'}, */{name:'Item'}, {name:'Attribut'}, {name:'Valeur'}]);
        for (var i=0; i<this.features.length; i++)
		{
			var oFeature = this.features[i];
            var szType = oFeature.type;
			aNbItem[szType]++;//numéro unique Couche-feature
			
			for(var szAttribute in oFeature.attributes)
			{
				var newRecord = new RecordTemplate({/*Couche: szType, */Item: aNbItem[szType], Attribut: szAttribute, Valeur: oFeature.attributes[szAttribute]});
				aoStores[szType].add(newRecord);
            }
        }

        // grid height calculation
        var nGridHeight;
        if(nStores > 2){
            nGridHeight = 200;
        } else {
            nGridHeight = 570 / nStores;
        }

        // grids creation
        var aoGrids = {};
        for (var szType in aoStores)
		{
            var gridTitle = '';
			if (aNbItem[szType] == 1)
				gridTitle = szType + ' (' + aNbItem[szType] + ' item)';
			else
				gridTitle = szType + ' (' + aNbItem[szType] + ' items)';
				
			aoGrids[szType] = new Ext.grid.GridPanel({
			store: aoStores[szType],
			columns: aoColumns[szType],
			title: gridTitle,
			stripeRows: true,
			autoExpandColumn: 'Valeur',
			height:500,
			disableSelection : true,
			trackMouseOver : false,
			enableHdMenu : false,
			view: new Ext.grid.GroupingView(
			{
				scrollOffset: 30,
				//forceFit: true,
				hideGroupedColumn: true,
				//enableNoGroups: true, // Pas nécessaire si enableHdMenu : false,
				//enableGroupingMenu : false, // Pas nécessaire si enableHdMenu : false,
				startCollapsed: false,
				getRowClass: function(record, index, rowParams) 
				{
					if( record.get('Item') % 2.0 == 0.0 )//si pair
							return 'background-bleupale-row';
					else
							return 'background-white-row';
				}
			})			
		});
        }

        var tabs = new Ext.TabPanel(
		{	activeTab: 0
			//,autoHeight: true
			,enableTabScroll: true
			,height :490
		});
		
		
		var oResultWindow = new Ext.Window(
			{
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
		

		for (var szType in aoStores)
		{
            tabs.add(aoGrids[szType]);
        }

		oResultWindow.add(tabs);
		
        this.waitmessage.hide();

        if(this.errors > 0){
            // TODO this is HARDCODED
            var szErrMsg = this.errors+" erreur";
            var szErrTitle = "Erreur";
            if(this.errors == 1){
                szErrMsg += " est survenue.";
            } else {
                szErrMsg += "s sont survenues.";
                szErrTitle += "s";
            }
            //showMsg(szErrTitle, szErrMsg);
            Igo.Aide.afficherMessage(szErrTitle, szErrMsg, "OK", "ERROR");
            //alert("error");
        }

        oResultWindow.show();
        this.resetQueryData();
    },

    /**
     * Method: onError
     * Called when an error occurs with the AJAX request
     *
     * Parameters:
     * response - {AJAX response}
     */
    onError: function(response){
        this.queries++;
        this.errors++;
        if(this.queries == this.layerstoquery.length){
            this.showResult();
        }
    },

    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        this.handler.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * Method: activate
     * Explicitly activates a control and it's associated
     * handlers if one has been set.  Controls can be
     * deactivated by calling the deactivate() method.
     * 
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function () {
        if (this.active) {
            return false;
        }
        this.handler.activate();
        this.active = true;
        this.events.triggerEvent("activate");
        return true;
    },

    /**
     * Method: deactivate
     * Deactivates a control and it's associated handlers if any.  Unselect all
     * selected features.
     * 
     * Returns:
     * {Boolean} True if the control was effectively deactivated or false
     *           if the control was already inactive.
     */
    deactivate: function () {
        if (this.active) {
            this.handler.deactivate();
            this.active = false;
            this.events.triggerEvent("deactivate");
            return true;
        }
        return false;
    },

    /**
     * Method: getQueryableLayers
     * Loops through all map layers and get the ones that are visibles and
     * queryables.  Layers that have the same 'url' are not added beyond the
     * first, but their 'layers' param value are merged together.
     *
     * The layer must have the property 'queryable: true' to be considered
     * queryable.
     *
     * The elements pushed to the array returned are hashtables containing the
     * following properties :
     *  - layer : queryable layer object
     *  - queryLayers : array of server-side layer name used for the
     *                  'query_layers' parameter GetFeatureInfo request.  Layers
     *                  having the same url have their queryLayers all pushed in
     *                  the same 'queryLayers' array.
     * 
     * Returns:
     * {Array} Array of hashtable objects containing the mentioned above
     *         elements.
	 *
	 * Steve Toutant 13 déc. 2013
	 * Modifier fonction 
	 * - queryLayers : Ils peuvent avoir la même url (meme mapfile) mais pas les même paramètres
     */
    getQueryableLayers: function(){
        var queryableLayers = [];
    
        for (var i=0, len=this.map.layers.length; i<len; i++) {
            var layer = this.map.layers[i];

            if (OpenLayers.Util.indexOf(
                   this.queryablelayertypes, layer.CLASS_NAME) != -1 &&
                layer.getVisibility() &&
                (layer.isBaseLayer || layer.inRange) &&
                layer.queryable
            ) {
				/*
                sameURL = false;
                for (var j=0, jlen=queryableLayers.length; j<jlen; j++) {
                    if (queryableLayers[j].layer.url == layer.url) {
                        queryableLayers[j].queryLayers.push(
                            layer.params.LAYERS
                        );
                        sameURL = true;
                        break;
                    }
                }
    
                if (!sameURL ) {
                    queryableLayers.push({
                        'layer': layer,
                        'queryLayers': [layer.params.LAYERS]
                    });
                }
				*/
/*				
Steve Toutant 13 décembre 2012
Le code ci dessus fonctionne juste si toutes les couches queryable ont les même paramètres.
Car seul les paramèetres du 1er layer sont utilisés
Si un layer utilise la substitution de variable 
ex: FILTER (annee = '%annee%' AND contaminant = '%contaminant%' )
les paramètres annees et contaminant pourraient ne pas être utilisés et le layer n'Apparait pas dans le getinfo

queryableLayers: Ils peuvent avoir la même url (meme mapfile) mais pas les même paramètres
*/				
				queryableLayers.push({
                        'layer': layer,
                        'queryLayers': [layer.params.LAYERS]
                    });
            }
        }
    
        return queryableLayers;
    },
	
	createRequestObject: function(){
			var tmpXmlHttpObject;
			if (window.XMLHttpRequest) {
				tmpXmlHttpObject = new XMLHttpRequest();
			} 
			else if (window.ActiveXObject) {
				tmpXmlHttpObject = new ActiveXObject("Microsoft.XMLHTTP");
			}
			return tmpXmlHttpObject;
	},
		
	/**
     * Method: loopThrough
	 *
	 * Bouclue lançcant 1 à 1 les call AJAX.
     * Crée un Array (array_response) et lorsque tout les calls sont terminés
	 * envoie le Array à getFeatures()
	 *
	 * le premier call a loopThrough devrait ressembler à ca : 
	 * 		this.loopThrough(0,array_url, array_response, this);
	 * 		
	 * où array_response contient rien 
     * 
     *  - i : indice du array_url
     *  - array_url : Array contenant les adresses 
	 *  - array_response : Array contenant les réponses
	 *  - getinfo_this : le getinfo appelant
     * 
     * Returns: RIEN
 	 *
     */
	loopThrough: function(i,array_url,array_response, getinfo_this){
						
			if (array_url[i]){
				
				var http = this.createRequestObject();	
				
				if (http.overrideMimeType){
					http.overrideMimeType("text/xml", encoding='ISO-8859-1');
				}
				
				http.open('get', array_url[i],true);
				http.send(null);
				http.onreadystatechange = function(){
					if(http.readyState == 4){
						if(window.ActiveXObject)
						{array_response[array_response.length] = this.responseXML;}
						else{array_response[array_response.length] = this.responseText;}
						
						i++;
						if (array_url[i]){
							getinfo_this.loopThrough(i,array_url,array_response, getinfo_this);
						}
						else{
							getinfo_this.getFeatures(array_response);
						}
								
					}
				}
			}
	},

    CLASS_NAME: "OpenLayers.Control.GetInfo"
});
