<?php

/**
* Defines the contract for feature services.
*
*/
interface IFeatureService{	
    /**
    * Returns true if the service is user selectable. 
    * When a service is user selectable, it is added to the services drop down component on the client.
    * 
    * @return boolean defining wether the service is user selectable.
    */
    public function isUserSelectable();

    /**
     * Returns the class implementing the ISpatialQueryBuilder for the ConnectionType.
     */
    public function getSpatialQueryBuilder();
    
    /**
    * Returns the name of the view exposing the data.
    * 
    * @return string Defining the name of the view exposing the data.
    */	
    public function getTransactionTableName();

    /**
    * Returns the name of the table containing the data.
    * 
    * @return string Defining the name of the table containing the data.
    */	
    public function getDisplayTableName();

    /**
    * Returns true if the service allows the Snap while editing features.
    * 
    * @return A boolean defining wether the service is allowed to snap features.
    */
    public function allowSnap();

    /**
    * Returns the value of the Pixel TOlerance value allowed by the snap, if the service allows the snap.
    * 
    * @return integer identifying the Tolerance, in the edition.js the default value is 30 pixels.
    */
    public function setSnapTolerance();	

    /**
    * Returns true if the service allows the creation of new features.
    * 
    * @return A boolean defining wether the service is allowed to create new features.
    */
    public function allowNew();

    /**
    * Returns true if the service allows update of features.
    * 
    * @return boolean defining wether the service is allowed to update features.
    */	
    public function allowUpdate();

    /**
    * Returns true if the service allows to delete features.
    * 
    * @return boolean defining wether the service is allowed to delete features.
    */
    public function allowDelete();

    /**
     * Returns the primary key field name.
     *
     * @return string identifying the primary key field.
     */
    public function getIdentifier();

    /**
     * Returns the reference identifier field name.
     * 
     * The reference identifier refers to the identifier. 
     * It is a foreign key to the original entrie so that changes can be related to the original feature.
     *
     * For example, if the pk of the table is no_seq, the reference identifier would be no_seq_ref. 
     * 
     * @return string identifying the reference identifier field.
     */
    public function getReferenceIdentifier();

    /**
     * Returns the name of the service.
     *
     * @return string identifying the name of the service.
     */
    public function getName();

    /**
     * Returns a description for the service.
     *
     * @return string describing the service.
     */
    public function getDescription();

    /**
     * Return the title of the Service
     * 
     * @return string title of the Service
     */
    public function getTitle();
    /**
     * Returns an array of string describing the associated layers.
     *
     * @return Array of string describing the associated layers.
     */
    public function getAssociatedLayers();

    /**
     * Returns the geometry field name.
     *
     * @return string identifying the geometry field name.
     */
    public function getGeometryName();

    /**
     * Returns the geometry type name.
     *
     * Possible values are : point, line, polygon.
     *
     * @return string identifying the geometry type name.
     */
    public function getGeometryType();

    /**
     * Return the statut field name.
     * 
     * @return string identifying the statut field name.
     */
    public function getStatutName();
    
    /**
     * Return the identifiant field name.
     * 
     * @return string identifying the identifiant field name.
     */
    public function getIdentifiantName();
    
    /**
     * Return the justification field name.
     * 
     * @return string identifying the justification field name.
     */    
    public function getJustificationName();
    
    /**
     * Returns the layer minimum scale.
     *
     * @return integer identifying the layer minimum scale.
     */
    public function getMinimumScale();

    /**
     * Returns the layer maximum scale.
     *
     * @return integer identifying the layer maximum scale.
     */	
    public function getMaximumScale();

    /**
     * Returns the layer SRID.
     *
     * @return string describing the layer's SRID.
     */
    public function getSRID();

    /**
     * Describes the fields.
     *
     * @return array containing the fields @see Field. 
     */
    public function getFields($geometry, $fkId);

    /**
     * Gets all the feature within the $polygon.
     *
     * @return array of features.
     */
    public function getFeatures($polygon);

    /**
     * Creates the feature.
     *
     * @return the result of pg_execute.
     */
    public function createFeature($feature);

    /**
     * Deletes the feature.
     *
     * @return the result of pg_execute.
     */
    public function deleteFeature($feature);

    /**
     * Updates the feature.
     *
     * @return the result of pg_execute.
     */
    public function updateFeature($feature);
    
    /**
     * Return the Foreign Key to get the geometries
     * @return the foreign key
     */
    public function getFk();
    
    /**
     * Return the sequence name for the primary key
     * @return the sequence name
     */
    public function getSequenceName();
       
    /**
     * Return the the attribute to be display on the feature
     * @return the label name
     */
    public function getLabelName();
}


