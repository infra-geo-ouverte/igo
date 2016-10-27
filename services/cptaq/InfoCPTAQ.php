<?php header('Content-Type: text/html; charset=UTF-8');

$layername = $_GET["layername"];
if (empty($layername)) {
        die('layername manquant');
}
        
$dbconn = pg_connect("host=svrvcartoprod1 dbname=geobase user=lecture password=lecture")
    or die('Connexion impossible : ' . pg_last_error());

$query = 'SELECT * FROM source where id = \'' . $layername . '\''; 
$result = pg_query($query) or die('Échec requête : ' . pg_last_error());
$line = pg_fetch_array($result, null, PGSQL_ASSOC);

$html = '<table border="0"cellspacing="10">';
$html .= '<th colspan="2"><h3>Description de la couche</h3></th>';
$html .= '<tr><td class="col1">Nom: </td><td>' .$line['nom'] . '</td></tr>';
$html .= '<tr><td class="col1">Producteur: </td><td>' .$line['producteur'] . '</td></tr>';
$html .= '<tr><td class="col1">WWW: </td><td><a href="' .$line['www'] . '"target="_blank">' .$line['www'] . '</a></td></tr>';
$html .= '<tr><td class="col1">Mise à jour: </td><td>' .$line['miseajour'] . '</td></tr>';
$html .= '<tr><td class="col1">Échelle d\'affichage: </td><td>' .$line['echelle'] . '</td></tr>';
$html .= '<tr><td class="col1">Notes: </td><td>' .$line['notes'] . '</td></tr>';
$html .= '</table>';

pg_free_result($result);
pg_close($dbconn);

?>

<?php echo  $html ?>

