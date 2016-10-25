<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$layer = $_GET["layer"];
if (empty($layer)) {
	pg_close($dbconn);
        die('layer manquant');
}

//$dbconn = pg_connect("host=geo-db-dev.cptaq.local dbname=adresse_quebec user=demeter password=D3m3t3r")
//$dbconn = pg_connect("host=10.17.2.41 dbname=geobase user=lecture password=lecture")

if ($layer <> 'v_adresse_igo') {
    $dbconn = pg_connect("host=svrvcartoprod1 dbname=geobase user=lecture password=lecture") 
    or die('Connexion impossible : ' . pg_last_error());
} else {
    $dbconn = pg_connect("host=geo-db.cptaq.local dbname=adresse_quebec user=demeter password=D3m3t3r") 
    or die('Connexion impossible : ' . pg_last_error());    
}


$epsg = $_GET["epsg"];
if (empty($epsg)) {
        die('epsg manquant');
}

$bbox = $_GET["bbox"];
if (empty($bbox)) {
	pg_close($dbconn);
        die('bbox manquant');
}

$titre = $_GET["titre"];
if (empty($titre)) {
	pg_close($dbconn);
        die('titre manquant');
}
$query =    'SELECT gid,
             ST_xmin(box3d(geom)) As xmin,
             ST_ymin(box3d(geom)) As ymin,
             ST_xmax(box3d(geom)) As xmax,
             ST_ymax(box3d(geom)) As ymax,
	     ST_X(ST_PointOnSurface(geom)) As ptx,
	     ST_Y(ST_PointOnSurface(geom)) As pty,
             ST_asText(geom) as geometrie,
             valeur1, 
             valeur2,
             \'' . $titre . '\' as valeur3

             FROM (SELECT the_geom as geom, gid, valeur1, valeur2 
             FROM (select * FROM  ' . $layer . ' where the_geom && ST_SetSRID(ST_Envelope(\'LINESTRING(' .  $bbox . ')\'::geometry),3857)) as foo2
             WHERE ST_Intersects (the_geom, ST_SetSRID(ST_Envelope(\'LINESTRING(' .  $bbox . ')\'::geometry),3857))) as foo';

//             Avec ST_MakeEnvelope
//             WHERE ST_Intersects (ST_SetSRID(the_geom,32200) , ST_Transform(ST_MakeEnvelope(' . $bbox . ',' . $epsg . '),32200))) as foo';  

$result = pg_query($query) or die('Échec requête : ' . pg_last_error());

$html = '';
while ($row = pg_fetch_array($result, null, PGSQL_ASSOC)) {
        $line = $row;
        $html = $html . $line['gid'] .';'. $line['xmin'] .';'. $line['ymin'] .';'. $line['xmax'] .';'. $line['ymax']  .';'.  
                        $line['ptx'].';'. $line['pty'] . ';' . $line['geometrie'] .';'. $epsg . ';'. $line['valeur1'] . ';' . 
                        $line['valeur2'] .  ';' . $line['valeur3'] .'ZZZ';
}
pg_free_result($result);
pg_close($dbconn);

?>

<?php echo  $html ?>