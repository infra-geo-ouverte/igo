
<!DOCTYPE html>

<html>
    <head>

        <script type="text/javascript" src="/pilotage/js/jquery-1.11.0.js"></script>
        <script type="text/javascript" src="/pilotage/js/bootstrap.js"></script>
        <script type="text/javascript" src="/pilotage/js/moment.js"></script>
        <script type="text/javascript" src="/pilotage/js/bootstrap-datetimepicker.js"></script>
        <script type="text/javascript" src="/pilotage/js/bootstrap-datetimepicker.fr.js"></script>

        <link rel="stylesheet" type="text/css" href="/pilotage/css/bootstrap.css" />
        <link rel="stylesheet" type="text/css" href="/pilotage/css/bootstrap-theme.min.css" />
        <link rel="stylesheet" type="text/css" href="/pilotage/css/bootstrap.override.css" />

        <link rel="stylesheet" type="text/css" href="/pilotage/css/mapfile.css" />
        <link rel="stylesheet" type="text/css" href="/pilotage/css/arborescence/tree.css" />
        <link rel="stylesheet" type="text/css" href="/pilotage/css/datepicker.css" />

        <title> IGO - Gestion des métadonnées</title>
    </head>
    <body>
        <div class="container">
            <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12 col xs12">
                    <a href="/pilotage/"><img src="/pilotage/img/banniere_geo.jpg" /></a>


                    <!-- Nav tabs -->
                    <ul class="nav nav-tabs">

                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                Classes entitée <span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li class="enabled"><a href="/pilotage/gestion_couche/creation">Création rapide</a></li>
                                <li class="enabled"><a href="/pilotage/igo_classe_entite/search">Classes entité</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_geometrie/search">Géométries</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_couche/search">Couches</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_groupe/search">Groupes de couches</a></li> 
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                Contexte <span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li class="enabled"><a href="/pilotage/igo_contexte/search">Contextes</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_couche_contexte/search">Liste des associations contextes/couches</a></li> 
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                Service <span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li class="enabled"><a href="/pilotage/igo_service/search">Services</a></li> 
                            </ul>
                        </li>

                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                Permissions<span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li class="enabled"><a href="/pilotage/igo_profil/search">Profils</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_utilisateur/search">Utilisateurs</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_utilisateur_profil/search">Liste des associations utilisateur/profil</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_permission/search">Liste des permissions sur les couches</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_service_profil/search">Liste des permissions sur les services</a></li> 
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                Pilotage <span class="caret"></span><!-- Style pilotage (CRUD)-->
                            </a>
                            <ul class="dropdown-menu"> 
                                <li class="enabled"><a href="/pilotage/igo_source_entite/search">Sources d'entitée</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_catalogue_csw/search">Catalogues</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_organisme_responsable/search">Organismes responsables</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_contact/search">Contacts</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_classification/search">Classifications</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_geometrie_type/search">Types de géométrie</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_connexion/search">Connexions</a></li> 
                                <li class="enabled"><a href="/pilotage/igo_connexion_type/search">Types de connexion</a></li> 
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                Mapfile <span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li class="enabled"><a href="/pilotage/mapfile/cree">Création d'un mapfile</a></li> 
                                <li class="enabled"><a href="/pilotage/mapfile/retro">Rétroingénierie d'un mapfile</a></li> 
                                <li class="enabled"><a href="/pilotage/gestion_couche/loadMapfile">Rétroingénierie d'un layer</a></li> 
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                À propos <span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li class="enabled"><a href="/pilotage/menu/info">Version 0.65</a></li>  
                            </ul>
                        </li>

                    </ul>

                </div>
            </div>
            <div align="center">


                <table width="100%">
                    <tr>
                        <td align="left">
                            <a href="/pilotage/igo_classe_entite/index/igo_classe_entite/search/"><button type='button' class='btn btn-default glyphicon glyphicon-search'><span>Rechercher</span></button></a>        </td>
                        <td align="center">
                        </td>
                        <td align="right">
                            <a href="/pilotage/igo_classe_entite/new/igo_classe_entite/search/"><button type='button' class='btn btn-default glyphicon glyphicon-plus'><span>Créer</span></button></a><br>
                        </td>
                    <tr>
                </table><style>
                    .catalogue-csw{
                        overflow:hidden; 
                        white-space:nowrap; 
                        text-overflow:ellipsis; 
                        width:130px; 
                        max-width:100px;
                    }
                </style>

                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th><a href="/pilotage/igo_classe_entite/search?order=id">Classe entité<span class='glyphicon glyphicon-resize-vertical'></span></a></th>
                                <th><a href="/pilotage/igo_classe_entite/search?order=nom">Nom <span class='glyphicon glyphicon-resize-vertical'></span></a></th>
                                <th><a href="/pilotage/igo_classe_entite/search?order=description">Description <span class='glyphicon glyphicon-resize-vertical'></span></a></th>
                                <th>Classification</th>
                                <th>Organisme responsable</th>
                                <th>Contact</th>
                                <th>Catalogue CSW</th>
                                <th><a href="/pilotage/igo_classe_entite/search?order=date_modif">Date de modification <span class='glyphicon glyphicon-resize-vertical'></span></a></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Geobase</td>
                                <td>Carte de base du gouvernement</td>
                                <td>Carte de référence de la couverture terrestre                    </td>
                                <td>Ministère de la Sécurité Publique du Québec                    </td>
                                <td>Gignac, Nicolas                    </td>
                                <td></td>
                                <td></td>
                                <td><a href="/pilotage/igo_classe_entite/edit/1/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/1/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/1">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Google</td>
                                <td></td>
                                <td>Carte de référence de la couverture terrestre                    </td>
                                <td>Korem                    </td>
                                <td>Gignac, Nicolas                    </td>
                                <td></td>
                                <td></td>
                                <td><a href="/pilotage/igo_classe_entite/edit/2/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/2/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/2">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Fond Blanc</td>
                                <td>Fond de carte blanc</td>
                                <td>Carte de référence de la couverture terrestre                    </td>
                                <td>Ministère de la Sécurité Publique du Québec                    </td>
                                <td>Gignac, Nicolas                    </td>
                                <td></td>
                                <td></td>
                                <td><a href="/pilotage/igo_classe_entite/edit/3/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/3/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/3">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>adn_station_max_public_v</td>
                                <td></td>
                                <td>                    </td>
                                <td>                    </td>
                                <td>                    </td>
                                <td class="catalogue-csw" title="http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw"> http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw                                            <td>2014-06-25 08:49:21</td>
                                <td><a href="/pilotage/igo_classe_entite/edit/4/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/4/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/4">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>adn_bassin_n1_public_v</td>
                                <td></td>
                                <td>                    </td>
                                <td>                    </td>
                                <td>                    </td>
                                <td class="catalogue-csw" title="http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw"> http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw                                            <td>2014-06-25 08:49:21</td>
                                <td><a href="/pilotage/igo_classe_entite/edit/5/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/5/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/5">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>adn_reg_admin_public_v</td>
                                <td></td>
                                <td>                    </td>
                                <td>                    </td>
                                <td>                    </td>
                                <td class="catalogue-csw" title="http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw"> http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw                                            <td>2014-06-25 08:49:21</td>
                                <td><a href="/pilotage/igo_classe_entite/edit/6/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/6/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/6">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>Liste des directions régionales MSP - Points                                                        </td>
                                <td>Liste des directions régionales MSP - Points                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </td>
                                <td>                    </td>
                                <td>Ministère de la Sécurité Publique du Québec                    </td>
                                <td>                    </td>
                                <td class="catalogue-csw" title="http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw"> http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw                                            <td>2014-06-25 08:49:21</td>
                                <td><a href="/pilotage/igo_classe_entite/edit/7/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/7/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/7">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>Organismes de Sauvetage                                                                             </td>
                                <td>Liste des organismes de sauvetage identifié pour les besoins de MUSE.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           </td>
                                <td>                    </td>
                                <td>Ministère de la Sécurité Publique du Québec                    </td>
                                <td>                    </td>
                                <td class="catalogue-csw" title="http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw"> http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw                                            <td>2014-06-25 08:49:21</td>
                                <td><a href="/pilotage/igo_classe_entite/edit/8/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/8/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/8">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>9</td>
                                <td>Pinces de désincarcération privées                                                                  </td>
                                <td>Pinces de désincarcération qui n'appartiennent pas à un service incendie.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       </td>
                                <td>                    </td>
                                <td>Ministère de la Sécurité Publique du Québec                    </td>
                                <td>                    </td>
                                <td class="catalogue-csw" title="http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw"> http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw                                            <td>2014-06-25 08:49:21</td>
                                <td><a href="/pilotage/igo_classe_entite/edit/9/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/9/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/9">Géométries</a></td>
                            </tr>
                            <tr>
                                <td>10</td>
                                <td>Pinces de désincarcération publiques                                                                </td>
                                <td>Pinces de désincarcération qui appartiennent à un service incendie.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             </td>
                                <td>                    </td>
                                <td>Ministère de la Sécurité Publique du Québec                    </td>
                                <td>                    </td>
                                <td class="catalogue-csw" title="http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw"> http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw                                            <td>2014-06-25 08:49:21</td>
                                <td><a href="/pilotage/igo_classe_entite/edit/10/igo_classe_entite/search/">Editer</a></td>
                                <td><a href="/pilotage/igo_classe_entite/delete/10/igo_classe_entite/search/">Détruire</a></td>
                                <td><a href="/pilotage/classe_entite_et_geometrie/do/10">Géométries</a></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <ul class="pager">
                    <li class="disabled"><a href="/pilotage/igo_classe_entite/search?page=1">Premier</a></li>
                    <li class="disabled"><a href="/pilotage/igo_classe_entite/search?page=1">Précédent</a></li>
                    <li>page 1 de 15</li>
                    <li class=""><a href="/pilotage/igo_classe_entite/search?page=2">Suivant</a></li>
                    <li class=""><a href="/pilotage/igo_classe_entite/search?page=15">Dernier</a></li>
                </ul>
            </div>   
        </div>
    </body>
</html>
