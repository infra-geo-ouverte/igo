<?php

class Utils{
    
    
    /*
  Permet de trier un array selon $key
 *      */

    static function build_sorter_string($key, $order = 'DESC') {

        //setlocale(LC_COLLATE, 'fr_CA.utf8');
        
        switch ($order) {
            case 'DESC':

                return function ($a, $b) use ($key) {
                   
                    if(is_array($key)){
                        $keyA = '';
                        $keyB = '';
                        foreach($key as $value){
                            $keyA .= $a[$value]." ";
                            $keyB .= $b[$value]." ";
                        }
                    }
                    else{
                        $keyA = $a[$key];
                        $keyB = $b[$key];
                    }
                    
                    $keyA = str_replace('/', ' ', $keyA);
                    $keyB = str_replace('/', ' ', $keyB); 
                    
                    $collator = new Collator("fr");
                    return ($collator->compare($keyA, $keyB));
              
                };

            break;

            case 'ASC':
                return function ($a, $b) use ($key) {
                    
                    if(is_array($key)){
                        $keyA = '';
                        $keyB = '';
                        foreach($key as $value){
                            $keyA .= $a[$value]."/";
                            $keyB .= $b[$value]."/";
                        }
                    }
                    else{
                        $keyA = $a[$key];
                        $keyB = $b[$key];
                    }
                    
                    $keyA = str_replace('/', ' ', $keyA);
                    $keyB = str_replace('/', ' ', $keyB); 
                    
                    $collator = new Collator("fr");
                    //$collator->setStrength(Collator::PRIMARY);
                    return !($collator->compare($keyA, $keyB));
                };

            break;

            default:
                return function ($a, $b) use ($key) {
                    
                    if(is_array($key)){
                        $keyA = '';
                        $keyB = '';
                        foreach($key as $value){
                            $keyA .= $a[$value]."/";
                            $keyB .= $b[$value]."/";
                        }
                    }
                    else{
                        $keyA = $a[$key];
                        $keyB = $b[$key];
                    }
                    
                    $keyA = str_replace('/', ' ', $keyA);
                    $keyB = str_replace('/', ' ', $keyB);                     
                    
                    $collator = new Collator("fr");
                    //$collator->setStrength(Collator::PRIMARY);
                    return ($collator->compare($keyA, $keyB));
                };
            break;
        };
    }


    static function build_sorter_int($key, $order = 'DESC') {
        switch ($order) {

        case 'DESC':

            return function ($a, $b) use ($key) {
                if (intval($a[$key]) < intval($b[$key])) {
                    return -1;
                } else {
                    return 1;
                }
            };

        break;

        case 'ASC':
            return function ($a, $b) use ($key) {
                if (intval($a[$key]) < intval($b[$key])) {
                    return 1;
                } else {
                    return -1;
                }
            };

        break;

        default:
            return function ($a, $b) use ($key) {
                if (intval($a[$key]) < intval($b[$key])) {
                    return -1;
                } else {
                    return 1;
                }
            };
            
        break;
        };
    }
/**
    * issetNotNull
    *  Permet de savoir :
    *		si string : si la variable 'check' est défini ET not null
    *		si array : si le tableau est défini ET possède au moins 1 object
    *     si objet : si l'objet est différend de rien. À AMÉLIORER
    * @param
    *     &$check:	array ou string
    *
    * @return boolean
    */
    static function issetNotNull(&$check)
        {
                if(isset($check)){
                        if(is_array($check)){
                                if(count($check)>0){
                                        return true;
                                }
                                else{
                                        return false;
                                }
                        }
                        else if(is_string($check)){
                                if(trim($check)!=''){
                                        return true;
                                }
                                else{
                                        return false;
                                }
                        }
                        else{
                                if($check != ''){
                                        return true;
                                }
                                else{
                                        return false;
                                }
                        }
                }
                else{
                        return false;
                }
        }
    
    static function printR($leTrucAAfficher,$die=false){
        echo '<pre>';
        print_r($leTrucAAfficher);
       echo '</pre>';
       if($die){
           die();
       }
    }
    
   /**
   * EcrireContenu
   *
	 * @access public
	 *
	 * @return : rien
	 */
    static function EcrireContenu($p_fichier, $p_contenu,  $source = false){

        $path = dirname(__file__).'/../../../../../../partage/log/'.$p_fichier;

	$handle666 = fopen($path,'a');

	if($source){
		if (is_array($p_contenu) && is_array(current($p_contenu))){
			//EcrireContenu($p_fichier, current($p_contenu));
			//foreach($p_contenu as $keys => $value){
			//	EcrireContenu($p_fichier, next($p_contenu));
			//}
                        fwrite($handle666, print_r($p_contenu, true));
		}
		elseif(is_array($p_contenu)){
			fwrite($handle666, 'DEBUT ARRAY :'."\n");
			foreach($p_contenu as $keys => $value){
				Utils::EcrireContenu($p_fichier,$p_contenu[$keys]);
			}
			fwrite($handle666, 'FIN ARRAY :'."\n");
		}
		elseif(is_object($p_contenu)){
			fwrite($handle666, 'OBJECT :'."\n");
			$xml = Utils::ObjectToXml($p_contenu, 'obj');
			fwrite($handle666, $xml."\n");
		}
		elseif(is_bool($p_contenu)){
				fwrite($handle666, 'BOOLEAN :'."\n");
			if($p_contenu){
				fwrite($handle666, 'TRUE'."\n");
			}
			else{
				fwrite($handle666, 'FALSE'."\n");
			}
		}
		elseif(is_string($p_contenu)){
			fwrite($handle666, 'STRING :'."\n");
			fwrite($handle666, $p_contenu . "\n");
		}
		elseif(is_numeric($p_contenu)){
			fwrite($handle666, 'NUMERIC :'."\n");
			fwrite($handle666, $p_contenu . "\n");
		}
		else{
			fwrite($handle666, 'AUTRE :'."\n");
			fwrite($handle666, $p_contenu . "\n");
		}
	}
	else{
		if (is_array($p_contenu) && is_array(current($p_contenu))){
			Utils::EcrireContenu($p_fichier, current($p_contenu));
			foreach($p_contenu as $keys => $value){
				Utils::EcrireContenu($p_fichier, next($p_contenu));
			}
		}
		elseif(is_array($p_contenu)){
			foreach($p_contenu as $keys => $value){
				Utils::EcrireContenu($p_fichier,$p_contenu[$keys]);
			}
		}
		elseif(is_object($p_contenu)){
			$xml = Utils::ObjectToXml($p_contenu, 'obj');
			fwrite($handle666, $xml."\n");
		}
		elseif(is_bool($p_contenu)){
			if($p_contenu){
				fwrite($handle666, 'TRUE'."\n");
			}
			else{
				fwrite($handle666, 'FALSE'."\n");
			}
		}
		elseif(is_string($p_contenu)){
			fwrite($handle666, $p_contenu . "\n");
		}
		elseif(is_numeric($p_contenu)){
			fwrite($handle666, $p_contenu . "\n");
		}
		else{
			fwrite($handle666, $p_contenu . "\n");
		}
	}
	fclose($handle666);
    }
    
    /**
   * ObjectToXml
   *
	 * @access public
	 *
	 * @return : l'objet PHP en xml
	 */
    static function ObjectToXml($obj, $from){

            $Xml = '';
            foreach($obj as $key => $val){
                    if(is_object($val)){
                            if($from == 'array'){
                                    $Xml .= '<borneDetail>';
                                    $Xml .= ObjectToXml($val, 'obj');
                                    $Xml .= '</borneDetail>';
                            }
                            else{
                                    $Xml .= '<'.$key.'>';
                                    $Xml .= ObjectToXml($val, 'obj');
                                    $Xml .= '</'.$key.'>';
                            }
                    }
                    else{
                            if(is_array($val)){
                                    $Xml .= '<'.$key.'>';
                                    $Xml .= ObjectToXml($val, 'array');
                                    $Xml .= '</'.$key.'>';
                            }
                            else{
                                    $Xml .= '<'.$key.'>'.$val.'</'.$key.'>';
                            }
                    }
            }
            return $Xml;
    }
    
    /**
    * Utilisé pour remplacer readfile
    * @param string $cheminFichier Chemin vers le fichier à lire
    */
    static function fopen_readfile($cheminFichier){
            echo fopen_file_get_contents($cheminFichier);
    }
    
    /**
    * Utilisé pour remplacer file_get_contents
    * @param string $cheminFichier Chemin vers le fichier à lire
    */
    static function fopen_file_get_contents($cheminFichier){
            $contenu = '';
            $handle = fopen($cheminFichier, 'r');
            if($handle){
                    $contenu = fread($handle, filesize($cheminFichier));
            }
            return $contenu;
    }
    
    /**
    * Utilisé pour remplacer file_get_contents
    * @param string $url Url à lire
    */
    static function curl_file_get_contents($url,$connectout=5,$timeout=10){
            $curl = curl_init();
            $userAgent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)';

            curl_setopt($curl,CURLOPT_URL,$url); //The URL to fetch. This can also be set when initializing a session with curl_init().
            curl_setopt($curl,CURLOPT_RETURNTRANSFER,TRUE); //TRUE to return the transfer as a string of the return value of curl_exec() instead of outputting it out directly.
            curl_setopt($curl,CURLOPT_CONNECTTIMEOUT,$connectout); //The number of seconds to wait while trying to connect.	

            curl_setopt($curl, CURLOPT_USERAGENT, $userAgent); //The contents of the "User-Agent: " header to be used in a HTTP request.
            curl_setopt($curl, CURLOPT_FAILONERROR, TRUE); //To fail silently if the HTTP code returned is greater than or equal to 400.
            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE); //To follow any "Location: " header that the server sends as part of the HTTP header.
            curl_setopt($curl, CURLOPT_AUTOREFERER, TRUE); //To automatically set the Referer: field in requests where it follows a Location: redirect.
            curl_setopt($curl, CURLOPT_TIMEOUT, $timeout); //The maximum number of seconds to allow cURL functions to execute.	

            $contenu = curl_exec($curl);
            curl_close($curl);
            return $contenu;
    }
    
    /**
     * Remplace les lettres avec accent par leur équivalent sans accent, dans une chaine de caractères.
     *
     * @link http://stackoverflow.com/questions/27680624/compare-two-string-and-ignore-but-not-replace-accents-php
     * @param  string $string La chaine de caractères.
     * @return string La chaine de caractères avec les accents enlevés.
     */
    static function enleverAccents($chaine) {
        return strtolower(trim(preg_replace('~[^0-9a-z]+~i', '-', preg_replace('~&([a-z]{1,2})(acute|cedil|circ|grave|lig|orn|ring|slash|th|tilde|uml);~i', '$1', htmlentities($chaine, ENT_QUOTES, 'UTF-8'))), ' '));
    }
}
