<?php

/**
 * Classe utilitaire permettant de générer l'arborescence JavaScript des pages 
 * "Associer des profils et des couches" et "Associer des groupes et des couches"
 */
class Arborescence{
    
    /**
    * 
    * @param string $grp Liste des id de tous les parents et du groupe, dans l'ordre de l'arborescence.
    * @return array Liste 
    */
   static function extraireListeGroupes($grp){
       return explode('_', $grp); 
   }


   static function construireIdUnique($grp){

       return implode('_', $grp);
   }

   static function idUniquePourGroupeParent($grp){
    $tab = Arborescence::extraireListeGroupes($grp);
    array_pop($tab);
    return Arborescence::construireIdUnique($tab);
}

   static function idUniquePourGroupe($grp){

       //Pour le groupe, c'est tout sauf le dernier entier
       $tab = Arborescence::extraireListeGroupes($grp);
       return Arborescence::construireIdUnique($tab);

   }
}