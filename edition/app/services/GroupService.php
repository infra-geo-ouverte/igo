<?php
/**
* Represents a GroupService.
*
* Provides generic implementation for group. 
* Provides connection to database, user identifier, authentication.
* 
* For example: Bornes d'incendies associés a une position géographique.
* @see IGroupService
*/
abstract class GroupService implements IGroupService, \Phalcon\DI\InjectionAwareInterface{
    
    private $di = null;
    
    private $escaped = false;
    
    private $connection = null;

    public function setDi($di){
        $this->di = $di;
    }
    
    public function getDi(){
        return $this->di;
    }
            
    public function reset(){
        $this->escaped = false;
    }
    
    /** 
    * Returns the connection to the database.
    *
    * @return resource representing the connection to the database.
    */	
    protected function getConnection(){
        if($this->connection == null){
            $this->connection = $this->getDi()->get("connexion");
        }
        return $this->connection;
    }
    
    /** 
    * Provides default implementation for IsAuthenticated()
    */
    public function isAuthenticated(){
        return $this->getDI()->getSession()->has("info_utilisateur");
    }

    /** 
    * Provides default implementation for GetAuthenticationErrorMessage()
    */
    public function getAuthenticationErrorMessage(){	
        return array("result" => "error", "error" => "Vous n'êtes pas identifié par le système.");
    }

    /** 
    * Provides default implementation for GetUserId()
    */
    public function getUserId(){
        if(!$this->getDI()->getSession()->has("info_utilisateur")){
            throw new Exception("Problème avec l'identifiant de l'utilisateur.");
        }
                
        return $this->getDI()->getSession()->get("info_utilisateur")->identifiant;
    }

    /** 
    * Provides default implementation for IsUserSelectable()
    */
    public function isUserSelectable(){
        return true;
    }

    /** 
    * Escape the value of all the fields.
    * @warning this function modifies the value of the $grouping.
    * @todo modify this function to return a clone of the original feature with escaped values.
    */
    protected function EscapeFields($grouping){	
        if(!$this->escaped){
            // Escape les valeurs pour pouvoir utiliser la valeur dans la bd.
            // Petite passe d'accès dynamique aux propriétés de la $grouping dynamique provenant du json_decode.
            $connection = $this->getConnection();
            $fields = $this->getFields(null);
            foreach($fields as $field){
                $name = $field->propriete;		
                $grouping->$name = $field->Escape($connection, $grouping->$name);
            }	        
            $this->escaped = true;
        }
    }
    
    /**
     * Fonction retournant les valeurs et les colonnes à utiliser pour les bindings
     * @param object $grouping L'objet feature contenant ses attributs
     * @return array (array $tabValue: tableau des valeurs pour le binding
     *                string $strCol: string contenant les champs à mettre à jour
     */
    protected function bindFields($grouping){
        $strCol = "";
        $strBind = "";
        $tabValue = array(); 
        $columnTypes = array();
        
        $fields = $this->getFields(null);
        
        foreach($fields as $field){
            
            if(!$field->editable && !$field->obligatoire)
               continue;

            $name = $field->propriete;
            
            if($strCol == "") {
                $strCol ="$name";
                $strBind = "?";
            }
            else {
                $strCol .= ", $name"; 
                $strBind .= ", ?";
            }

            array_push($tabValue, $grouping[$name]); 
            array_push($columnTypes, $field->getType());
        }
        
        return array($tabValue, $strCol, $columnTypes, $strBind);
    }
    
     /**
     * Fonction retournant les valeurs et les colonnes à utiliser pour les bindings
     * @param object $grouping L'objet feature contenant ses attributs
     * @return array (array $tabValue: tableau des valeurs pour le binding
     *                string $strCol: string contenant les champs à mettre à jour
     */
    protected function UpdateFields($grouping){
        $strCol = "";
        $tabValue = array(); 
        $columnTypes = array();
        
        $fields = $this->getFields(null);
        
        foreach($fields as $field){
            
            if(!$field->editable && !$field->obligatoire)
               continue;

            $name = $field->propriete;
            
            if($strCol == "") {
                $strCol ="$name =?"; 
            }
            else {
                $strCol .= ", $name=?"; 
            }

            array_push($tabValue, $grouping[$name]); 
            array_push($columnTypes, $field->getType());
        }
        
        return array($tabValue, $strCol, $columnTypes);
    }
    
    /**
     * Créer la string contenant le nombre de binding à utiliser dans la requête selon le nombre de valeur
     * @param array $tabValue Le tableau contenant les valeurs du binding
     * @return string $strBinding La string contenant le nombre correspondant de binding selon le nombre de valeur
     */
    protected function getStringBinding($tabValue){
        
        $nbBinding = count($tabValue);
        $strBinding = "";
        while($nbBinding != 0)
        {
            if($strBinding == "")
                $strBinding = "?";
            else
                $strBinding .= ", ?";

            $nbBinding--;
        }
        
        return $strBinding;
    }

    /** 
    * Construit la partie des champs de la requête. En ignorant les champs !editable && !mandatory.
    * example: x,y,z 
    * ...
    * @return string containing editable && mandatory names of the fields separated with coma.
    */
    protected function CreateSqlFieldsSection(){
        $fields = $this->getFields(null);
        $fields_sql = "";
        for($i = 0; $i < count($fields); $i++){
            if(!$fields[$i]->editable && !$fields[$i]->obligatoire){
                continue;			
            }
            if(empty($fields_sql)){
                $fields_sql .= $fields[$i]->propriete;
            }else{
                 $fields_sql .= "," . $fields[$i]->propriete;
            }
        }
        return $fields_sql;
    }

    /** 
    * Construit la partie des champs de la requête. 
    * example: x,y,z 
    * ...
    * @return string containing all the names of the fields separated with coma.
    */
    protected function CreateSqlSelectFieldsSection(){
        $fields = $this->getFields(null);
        $fields_sql = "";
        for($i = 0; $i < count($fields); $i++){	
            if($i < count($fields) - 1){
                $fields_sql .= $fields[$i]->propriete . ",";
            }else{
                $fields_sql .= $fields[$i]->propriete;
            }
        }
        return $fields_sql;
    }
    
    
    protected function GetErrorMessage($grouping){
        $fields = $this->getFields($grouping);
        foreach($fields as $field){
            $fieldName = $field->propriete;
            if(!property_exists($grouping, $fieldName)){
                return array("result" => "failure", "error" => $fieldName . " n'est pas défini");
            }
            if(!$field->IsValid($grouping->$fieldName)){			
                $errorMessage = $field->GetInvalidErrorMessage();
                return array("result" => "failure", "error" => $errorMessage);
            }			
        }	
    }
}