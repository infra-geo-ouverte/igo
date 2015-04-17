<?php

function connectionStringToObject($connectionString, $connectionType) {
    $connection = array(
        "type" => $connectionType
    );

    if(in_array($connectionType, array("POSTGIS", "ORACLESPATIAL", "MYSQL"))){
        $optionsPattern = '/(?<=options=)\'.+\'{1}/s';

        foreach(array('host', 'user', 'password', 'dbname', 'port') as $parameter){
            $pattern = '/(?<=' . $parameter . '=)[\w_]+\s*/s';
            if(preg_match($pattern, $connectionString, $value)){
                $connection[$parameter] = trim($value[0]);
            }
        }

        if(preg_match($optionsPattern, $connectionString, $value)){
            $connection['options'] = $value[0];
        }

        $connection['connectionString'] = objectToConnectionString($connection);
    } else{
        //Any other type of connection
        if(strlen($connectionString) > 0){
            //phalcon doesn't escape the double quotes so we can't store the full connection string
        
            $connection['connectionString'] = $connectionString; //$connection['connectionString'] = 'CONNECTION "' . $connectionString . '"';     
        } else{
            $connection['connectionString'] = null;
        }
         
    }

    return $connection;
}

function objectToConnectionString($connection){
    $connectionString = 'host=' . $connection['host'];
    $connectionString .= ' dbname=' . $connection['dbname'];
    $connectionString .= ' user=' . $connection['user'];
    if(array_key_exists('password', $connection)){
        $connectionString .= ' password=' . $connection['password'];
    }
    if(array_key_exists('port', $connection)){
        $connectionString .= ' port=' . $connection['port'];
    }
    if(array_key_exists('options', $connection)){
        $connectionString .= ' options=' . $connection['options'];
    }
    //phalcon doesn't escape the double quotes so we can't store the full connection string
    return $connectionString; //return 'CONNECTION "' . $connectionString . '"';
}

function listFilesInDirectory($directory, $prefix = '') {
    $directory = rtrim($directory, '\\/');
    $files = array();

    foreach (scandir($directory) as $file) {
        if ($file !== '.' and $file !== '..') {
            if (is_dir("$directory/$file")) {
                $files = array_merge($files, listFilesInDirectory("$directory/$file", "$prefix$file/"));
            } else {
                $files[] = $prefix.$file;
            }
        }
    }

    return $files;
}

?>
