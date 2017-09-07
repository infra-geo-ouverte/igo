<?php

if(!function_exists('curl_file_get_contents')){

	/**
	* Utilis� pour remplacer file_get_contents
	* @param string $url Url � lire
	*/
	function curl_file_get_contents($url){
		$curl = curl_init();
		$userAgent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)';

		curl_setopt($curl,CURLOPT_URL,$url); //The URL to fetch. This can also be set when initializing a session with curl_init().
		curl_setopt($curl,CURLOPT_RETURNTRANSFER,TRUE); //TRUE to return the transfer as a string of the return value of curl_exec() instead of outputting it out directly.
		curl_setopt($curl,CURLOPT_CONNECTTIMEOUT,5); //The number of seconds to wait while trying to connect.

		curl_setopt($curl, CURLOPT_USERAGENT, $userAgent); //The contents of the "User-Agent: " header to be used in a HTTP request.
		curl_setopt($curl, CURLOPT_FAILONERROR, TRUE); //To fail silently if the HTTP code returned is greater than or equal to 400.
		curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE); //To follow any "Location: " header that the server sends as part of the HTTP header.
		curl_setopt($curl, CURLOPT_AUTOREFERER, TRUE); //To automatically set the Referer: field in requests where it follows a Location: redirect.
		curl_setopt($curl, CURLOPT_TIMEOUT, 10); //The maximum number of seconds to allow cURL functions to execute.
                
		$contenu = curl_exec($curl);

		if($contenu === false)
		{
			throw new Exception('Erreur Curl : ' . curl_error($curl));
		}

		curl_close($curl);

		return $contenu;
	}
}

if(!function_exists('fopen_file_get_contents')){

	/**
	* Utilis� pour remplacer file_get_contents
	* @param string $cheminFichier Chemin vers le fichier � lire
	*/
	function fopen_file_get_contents($cheminFichier){

		$contenu = '';
		$handle = fopen($cheminFichier, 'r');
		if($handle){
			$contenu = fread($handle, filesize($cheminFichier));
		}
		return $contenu;

	}


}

if(!function_exists('fopen_readfile')){

	/**
	* Utilis� pour remplacer readfile
	* @param string $cheminFichier Chemin vers le fichier � lire
	*/
	function fopen_readfile($cheminFichier){
		echo fopen_file_get_contents($cheminFichier);
	}
}

if(!function_exists('curl_url_exists')){

	function curl_url_exists($url){
	    $curl = curl_init($url);
            curl_setopt($curl, CURLOPT_NOBODY, true);
            $result = curl_exec($curl);
            if ($result === false) { return false; }
            $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);  
            if ($statusCode == 404) {return false;}
            return true;
	}
}


?>
