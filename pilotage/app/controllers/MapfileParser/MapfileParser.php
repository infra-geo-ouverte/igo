<?php

include('core/init.inc.php');

class MapfileParser {

    /**
     * Returns all layers found in all mapfiles of a directory
     *
     *  $directory [string] : directory path
     */
    public function parseDirectory($directory) {
        $files = listFilesInDirectory($directory);

        $layers = array();
        foreach ($files as $file) {
            if (substr($file, -4) == '.map') {
                //create a map object
                try {
                    $oMap = new MapObj("$directory/$file");
                } catch (Exception $e) {
                    $error = ms_getErrorObj();
                    throw new Exception($error->message);
                    exit;
                }

                $map = new Map($oMap);

                $layers = array_merge($layers, $map->parseLayers());
            }
        }

        return $this->formatParsingOutput($layers);
    }

    function fopen_file_get_contents($cheminFichier) {
        $contenu = '';
        $handle = fopen($cheminFichier, 'r');
        if ($handle) {
            $contenu = fread($handle, filesize($cheminFichier));
        }
        return $contenu;
    }

    /**
     * Returns all layers found in a mapfile
     *
     *  $file [string] : file path
     */
    public function parseFile($file) {
        if (is_file($file)) {
            if (substr($file, -4) == '.map') {
                //create a map object
                try {
                    $projLib = getenv("PROJ_LIB");
                    $mapFileContent = $this->fopen_file_get_contents($file);
                    $mapFileContent = str_replace("MAP\r\n", "MAP\r\nCONFIG PROJ_LIB {$projLib}\r\n", $mapFileContent);
                    $oMap = ms_newMapObjFromString($mapFileContent, dirname($file));
                } catch (Exception $e) {
                    $error = ms_getErrorObj();
                    throw new Exception($error->message);
                    exit;
                }
                $map = new Map($oMap);

                $m = array();

                $mapMetaData = array(
                    "wms_onlineresource"
                );

                $mapParameters = array(
                    "projection"
                );
                
                foreach ($mapMetaData as $metaData) {
                    $m[$metaData] = $map->getMeta($metaData);
                }
             
                foreach ($mapParameters as $parameter) {
                    $m[$parameter] = $map->getParam($parameter);
                }

                $layers = $map->parseLayers();

                return $this->formatParsingOutput($m, $layers);
            } else {
                throw new Exception("Le fichier spécifié n'est pas un mapfile valide.");
            }
        } else {
            throw new Exception("Le fichier n'existe pas.");
        }
    }

    /**
     * Splits an array of layer into arrays
     *  of distinct layers and not distinct layers.
     *  Distinct layers do not share the same name.   
     *
     *  $layers [array] : an array of layers with the 'name' property
     */
    private function formatParsingOutput($map, $layers) {

        $distinctNames = array();
        $notDistinctNames = array();

        foreach ($layers as $layer) {
            if (!in_array($layer['name'], $distinctNames)) {
                $distinctNames[] = $layer['name'];
            } else {
                $notDistinctNames[] = $layer['name'];
            }
        }

        $notDistinctLayers = array();
        $distinctLayers = array();

        $i = 1;
        foreach ($layers as $layer) {
            $layer['id'] = $i;

            if (in_array($layer['name'], $notDistinctNames)) {
                $layer['distinct'] = false;
                $notDistinctLayers[] = $layer;
            } else {
                $layer['distinct'] = true;
                $distinctLayers[] = $layer;
            }
            $i++;
        }

        return array(
            "distinctLayers" => $distinctLayers,
            "notDistinctLayers" => $notDistinctLayers,
            "nLayers" => count($distinctLayers) + count($notDistinctLayers),
            "map" => $map
        );
    }

    /**
     * Splits an array of layer into an
     *  array of connexion each with it's
     *  corresponding layers   
     *
     *  $layers [array] : an array of layers
     */
    public function formatSaveData($layers, $host = null, $hostAlias = null) {
        $distinctConnections = array();
        $data = array();

        foreach ($layers as $layer) {
            //Get a list of all the distinct connections in the parsed layers
            //Convert the connection string to an object with all the connection parameters
            //We can't simply compare the connexion string since the parameters can be ordered
            //differently
            $layer['location'] = 'L';
            $connection=null; // À vérifier....
            
            //error_log("LayerName: " . $layer['name'] . " LayerConnection: " . $layer['connection'] . " LayerConnectionType: " . $layer['connectiontype']);
            if ($layer['connection'] && $layer['connectiontype']) {
                $connection = connectionStringToObject($layer['connection'], $layer['connectiontype']);

                //Check if layer is internal or external
                if ($host and $hostAlias) {
                    if (array_key_exists('host', $connection)) {
                        if (strtolower($connection['host']) != strtolower($hostAlias)) {
                            $layer['location'] = 'D';
                        }
                    } else {
                        if (array_key_exists('connectionString', $connection)) {
                            if (strpos(strtolower($connection['connectionString']), strtolower($host)) === false) {
                                $layer['location'] = 'D';
                            }
                        }
                    }
                }

                $i = 0;
                $match = false;

                foreach ($distinctConnections as $distinctConnection) {
                    
                    $match = true;
                    //Compare all the connection parameters (host, user, password...)
                    foreach ($connection as $connectionParameter => $parameterValue) {
                        //error_log("param: " . $connectionParameter . " paramvalue: ". $parameterValue);
                        if ($match == true && $distinctConnection != null) {
                            if (array_key_exists($connectionParameter, $distinctConnection)) {
                                if ($parameterValue != $distinctConnection[$connectionParameter]) {
                                    $match = false;
                                }
                            } else {
                                $match = false;
                            }
                        } else {
                            break;
                        }
                    }

                    //If a match is found, stop and add the layer to the data array
                    if ($match == true) {
                        //error_log("Adding layer {$layer['name']} to connection {$data[$i]['connection']['connectionString']}");
                        $data[$i]['layers'][] = $layer;
                        break;
                    }

                    $i++;
                }

                //If no match is found, add the layer connection to the distinct connections and add it the data array
                if ($match == false) {
                    //error_log("adding layer {$layer['name']} to connection {$connection['connectionString']}");
                    $distinctConnections[] = $connection;
                    $data[] = array(
                        'connection' => $connection,
                        'layers' => array($layer)
                    );
                }
            } else {
                // TODO : On passe ici pour les shapefiles... Est-ce normal?
                //error_log("else... Layer->Connection:{$layer['connection']} & Layer->ConnectionType:{$layer['connectiontype']}");
                if(isset($connection)){
                    $distinctConnections[] = $connection;
                }
                
                $data[] = array(
                    'connection' => null,
                    'layers' => array($layer)
                );
            }
        }

        return $data;
    }

}
