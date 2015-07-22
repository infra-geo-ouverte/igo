<?php

/**
* Defines the contract for group services.
*
*/
interface IGroupService{	
    /**
    * Returns true if the group is user selectable. 
    * 
    * @return boolean defining wether the group is user selectable.
    */
    public function isUserSelectable();

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
    * Returns true if the service allows the creation of new group.
    * 
    * @return A boolean defining wether the service is allowed to create new group.
    */
    public function allowNew();

    /**
    * Returns true if the service allows update of group.
    * 
    * @return boolean defining wether the service is allowed to update group.
    */	
    public function allowUpdate();

    /**
    * Returns true if the service allows to delete group.
    * 
    * @return boolean defining wether the service is allowed to delete group.
    */
    public function allowDelete();

    /**
     * Returns the primary key field name.
     *
     * @return string identifying the primary key field.
     */
    public function getIdentifier();

    /**
     * Returns the name of the Group.
     *
     * @return string identifying the name of the Group.
     */
    public function getName();

    /**
     * Returns a description for the group.
     *
     * @return string describing the group.
     */
    public function getDescription();

    /**
     * Returns an array of string describing the associated layers.
     *
     * @return Array of string describing the associated layers.
     */
    public function getAssociatedLayers($groupingType);
       
    /**
     * Returns a string of the attribute of the grouping type name
     * 
     * @returns String describing the attribute of the grouping type name
     */
    public function getGroupingTypeName();    
    
    /**
     *  Return a string of the layer's attribute
     * 
     * @returns string describing the layer's attribute
     */
    public function getGroupingAttribLayer();
     
    /**
     * Return a string of the WHERE condition to get active service
     * 
     * @returns string of the condition to get active service only
     */
    public function getActiveServiceCondition();
    
    /**
     * Return the identifiant field name.
     * 
     * @return string identifying the identifiant field name.
     */
    public function getIdentifiantName();
       
    /**
     * Return the attribute of the type in the association table
     * 
     * @return string the attribute of the type in the association table
     */
    
    public function getTypeAssociationName();
    
    /**
     * Return an array of types of grouping
     * 
     * @return array of types of grouping
     */
    
    public function getTypes();
    
    /**
     * Returns the description of the grouping
     *
     * @return array containing the fields @see Field. 
     */

    public function getFields();

     /**
     * Gets all the grouping bye the foreign if exist.
     *
     * @return array of grouping.
     */
    public function getGrouping($fkId);

    /**
     * Creates the grouping.
     *
     * @return the result of pg_execute.
     */
    public function createGrouping($grouping, $fkId);

    /**
     * Deletes the grouping.
     *
     * @return the result of pg_execute.
     */
    public function deleteGrouping($grouping);

    /**
     * Duplicate the grouping.
     *
     * @return the result new grouping.
     */
    public function duplicateGrouping($grouping);
    /**
     * Updates the grouping.
     *
     * @return the result of pg_execute.
     */
    public function updateGrouping($grouping);
  
    /**
     * Get the SQL request for the next sequence of the ID key
     * @return the SQL request in string
     */
    public function getSQLNextSequence();
    
    /**
     * Get the procedure to duplicate the grouping
     * @return the data of the duplicated grouping
     */
    public function getDuplicateProcedure();
    
    /**
     * Know if the grouping have associate file
     * @return bool true/false if the grouping have associate file
     */
    public function getHaveAssociateFile();
    
    /**
     * Get the name of the table containing the associate file
     * @return string the name of the table
     */
    public function getAssociateFileTable();
    
    /**
     * Get the name of the procedure to insert file in database
     * @return string the name of the procedure
     */
    public function getAssociateFileInsertProcedure();
    
    /**
     * get the unique id attribute of the associate file table
     * @return string the id attribute
     */
    public function getAssociateFileId();
    
    /**
     * get the unique foreign key attribute of the associate file table
     * @return string the foreign key attribute
     */    
    public function getAssociateFileFk();
    
    /**
     * get the file name attribute of the associate file table
     * @return string the file name attribute
     */    
    public function getAssociateFileName();

    /**
     * get the file blob attribute of the associate file table
     * @return string the file blob attribute
     */    
    public function getAssociateFileBlob();
    
    /**
     * get the size attribute of the associate file table
     * @return string the size attribute
     */    
    public function getAssociateFileSize();

    /**
     * get the mime attribute of the associate file table
     * @return string the mime attribute
     */
    public function getAssociateFileMime();

    /**
     * Returns the description of the associate file fields
     *
     * @return array containing the fields @see Field. 
     */

    public function getAssociateFileFields();
    
    /**
     * Returns the max size for the associate file
     * 
     * @return integer maz size for the associate file or false if no max
     */
    public function getAssocateFileMaxSize();
    
    /**
     * Return if the associate file is valid
     * 
     * @return bool true/false if the associate file is valid
     */
    public function getAssociateFileValidation($uploadfile, $filename, $extension, $size, $mime);
    
    /**
     * Return OCI connexion to patch lob insertion with PDO in Oracle
     * @return OCI connexion or false by default if not necessary
     */
    public function getOraclePatchConnexion();
}


