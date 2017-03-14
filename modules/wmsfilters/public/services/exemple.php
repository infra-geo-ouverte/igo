<?php
header ("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header ("Last-Modified: " . gmdate ("D, d M Y H:i:s") . " GMT");
header ("Cache-Control: no-cache, must-revalidate");
header ("Pragma: no-cache");
header ('Content-type: application/json; charset=utf-8');
header ("Access-Control-Allow-Origin: http://navigateur.igo.unit.mtq.min.intra");
header ("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$store = $_REQUEST["store"];


switch ($store)
{
	case "procod":
	
		die (printf ("%s", json_encode([["0", "Tout"],    
			["APA",	"avoine"],                                                   
			["PAT",	"pâturage"],                                      
			["FBA",	"Foin option besoin alimentaire"],                                        
			["MGR",	"Maîs-grain"],
			["SOY",	"Soya"]])));
	break;
	
	case "indi_parc_drai":
		die (printf ("%s", json_encode([["0", "Tout"],    
			["O",	"drainée"],                                                   
			["N",	"non drainée"],                                      
			["","inconnue"]])));
	break;	
	
	case "pgmcod":
		die (printf ("%s", json_encode([["0", "Tout"],    	
		["AHF","Aménagement habitats fauniques en milieu agricole"],                
		["API","Apiculture"],                                        
		["CMA","Légumes de cultures maraîchères"],                                  
		["COL","Système collectif"],                                 
		["LDT","Légumes de transformation"],                                        
		["PDT","Pommes de terre"],                                                                                     
		["PFR","Petits fruits"]])));
	break;
			
}

?>