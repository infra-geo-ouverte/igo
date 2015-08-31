<?php

use Phalcon\Forms\Form;
use Phalcon\Forms\Element\Select;
use Phalcon\Validation\Validator\PresenceOf;

class ContextePermissionProfilForm extends Form{
    
    public function initialize(){
        
        //TODO Valider que idContexte et idProfil sont des int ?
        
        //TODO Ajouter la validation pour les pilotes : vérifier si ils ont le 
        //droit sur le profil et le contexte indiqué
        //TODO Alimenter la liste de contexte et de profil avec seuls ceux 
        //auxquels le pilote a accès. Les administrateurs ont accès à tout.
        $contexte = new Select(
                    'idContexte', 
                    IgoContexte::find(array("order" => "nom")), 
                    array(
                        "using" => array("id", "nom"),
                        "emptyText" => "Choisir...",
                        "useEmpty" => true,
                        "class" => "form-control"
                    )
            );
        $contexte->addValidator(new PresenceOf(array(
            'message' => 'Veuillez sélectionner un contexte.'
            )));
        $this->add($contexte);
        
        
        $profil = new Select(
                    'idProfil', 
                    IgoProfil::find(array("order" => "libelle")),
                    array( 
                        "using" => array("id", "libelle"),
                        "emptyText" => "Choisir...",
                        "useEmpty" => true,
                        "class" => "form-control"
                    )        
            );
        $profil->addValidator(new PresenceOf(array(
            'message' => 'Veuillez sélectionner un profil.'
            )));
        $this->add($profil);
    }
}
?>