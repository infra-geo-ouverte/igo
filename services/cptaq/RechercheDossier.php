<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//$dbconn = pg_connect("host=geo-db-dev.cptaq.local dbname=giptaaq user=giptaaq password=G1ptaaq")

$dbconn = pg_connect("host=svrvcartoprod1 dbname=geobase user=lecture password=lecture")
    or die('Connexion impossible : ' . pg_last_error());

$epsg = $_GET["epsg"];
if (empty($epsg)) {
        die('epsg manquant');
}

 $numero = $_GET["numero"];
if (empty($numero)) {
	pg_close($dbconn);
        die('numero manquant');       
}

//$query =    'SELECT * FROM v_dossier WHERE no_dossier = \'' . $_GET["numero"] . '\'';

$query = 'SELECT foo.gid, st_xmin(box3d(foo.geom)) AS xmin, st_ymin(box3d(foo.geom)) AS ymin, st_xmax(box3d(foo.geom)) AS xmax, st_ymax(box3d(foo.geom)) AS ymax, st_x(st_pointonsurface(foo.geom)) AS ptx, st_y(st_pointonsurface(foo.geom)) AS pty, foo.geometrie, foo.no_dossier, foo.resultat
   FROM ( SELECT st_transform(st_setsrid(demande.the_geom, 32200), \'' .$epsg . '\') AS geom, demande.gid, demande.no_dossier, demande.resultat, st_astext(st_transform(st_setsrid(demande.the_geom, 32200), 3857)) AS geometrie
           FROM demande WHERE no_dossier = \'' .$numero . '\'
UNION ALL 
         SELECT st_transform(st_setsrid(demande_p.the_geom, 32200), \'' .$epsg . '\') AS geom, demande_p.gid, demande_p.no_dossier, demande_p.resultat, st_astext(st_transform(st_setsrid(demande_p.the_geom, 32200), 3857)) AS geometrie
           FROM demande_p  WHERE no_dossier = \'' . $numero . '\'
UNION ALL 
         SELECT st_transform(st_setsrid(article59.the_geom, 32200), \'' .$epsg . '\') AS geom, article59.gid, article59.no_dossier, article59.resultat, st_astext(st_transform(st_setsrid(article59.the_geom, 32200), 3857)) AS geometrie
           FROM article59
            WHERE no_dossier = \'' . $numero . '\' 
          AND article59.en_vigueur::text = \'oui\'::text) foo;';

$result = pg_query($query) or die('Échec requête : ' . pg_last_error());

$html = '';
while ($row = pg_fetch_array($result, null, PGSQL_ASSOC)) {
        $line = $row;
        $html = $html . $line['no_dossier'] .';'. $line['xmin'] .';'. $line['ymin'] .';'. $line['xmax'] .';'. $line['ymax']  .';'.  $line['ptx'].';'. $line['pty'] .';'. $epsg . ';'. $line['resultat'] . ';'. $line['geometrie'] .'ZZZ';
}
pg_free_result($result);
pg_close($dbconn);

?>

<?php echo  $html ?>