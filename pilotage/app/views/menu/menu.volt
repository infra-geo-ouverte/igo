<!-- Nav tabs -->
<ul class="nav nav-tabs">
    <li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          Contextes <span class="caret"></span>
        </a>
    <ul class="dropdown-menu">
        <li class="enabled">{{ link_to("igo_contexte/search","Contextes" )}}</li> 
        <li class="enabled">{{ link_to("igo_contexte/regenerer","Regénérer les contextes" )}}</li> 
        <!--li class="enabled">{{ link_to("igo_couche_contexte/search","Liste des associations contextes/couches" )}}</li--> 
    </ul>
    </li>
    {% if this.getDI().get('session').get('info_utilisateur').estAdmin %}
    <!--li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          Service <span class="caret"></span>
        </a>
        <ul class="dropdown-menu">
            <li class="disabled">{{ link_to("igo_service/search","Services" )}}</li> 
        </ul>
    </li-->
  {% endif %}  
    <li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          Permissions<span class="caret"></span>
        </a>
        <ul class="dropdown-menu">
            <li class="enabled">{{ link_to("igo_profil/search","Profils" )}}</li> 
            {% if this.getDI().get('session').get('info_utilisateur').estAdmin %}
            <li class="enabled">{{ link_to("igo_utilisateur/search","Utilisateurs" )}}</li> 
            <li class="enabled">{{ link_to("igo_utilisateur_profil/search","Liste des associations utilisateur/profil" )}}</li> 
            {% endif %}
            <!--li class="enabled">{{ link_to("igo_permission/search","Liste des permissions sur les couches" )}}</li--> 
            <!--li class="enabled">{{ link_to("igo_service_profil/search","Liste des permissions sur les services" )}}</li--> 
        </ul>
    </li>
    <li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          Pilotage <span class="caret"></span><!-- Style pilotage (CRUD)-->
        </a>
        <ul class="dropdown-menu"> 
            <li class="enabled">{{ link_to("igo_groupe/search","Groupes" )}}</li> 
            <li class="enabled">{{ link_to("igo_source_entite/search","Sources d'entitée" )}}</li> 
            <li class="enabled">{{ link_to("igo_catalogue_csw/search","Catalogues" )}}</li> 
            <li class="enabled">{{ link_to("igo_organisme_responsable/search","Organismes responsables" )}}</li> 
            <li class="enabled">{{ link_to("igo_contact/search","Contacts" )}}</li> 
            <li class="enabled">{{ link_to("igo_classification/search","Classifications" )}}</li> 
            <li class="enabled">{{ link_to("igo_geometrie_type/search","Types de géométrie" )}}</li> 
            {% if this.getDI().get('session').get('info_utilisateur').estAdmin %}
                <li class="enabled">{{ link_to("igo_connexion/search","Connexions" )}}</li>
                <li class="enabled">{{ link_to("igo_connexion_type/search","Types de connexion" )}}</li> 
            {% endif %}
        </ul>
    </li>
    {% if this.getDI().get('session').get('info_utilisateur').estAdmin %}
    <li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          Mapfile <span class="caret"></span>
        </a>
        <ul class="dropdown-menu">
            <li class="enabled">{{ link_to("mapfile/cree","Visionnement d'un Mapfile" )}}</li> 
            <li class="enabled">{{ link_to("mapfile/retro","Rétroingénierie d'un Mapfile" )}}</li> 
            <li class="disabled"><!--{{ link_to("gestion_couche/loadMapfile","Rétroingénierie d'un layer" )}}--><a>Rétroingénierie d'un layer</a></li>

        </ul>
    </li>
    {% endif %}
    <li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          À propos <span class="caret"></span>
        </a>
        <ul class="dropdown-menu">
            <li class="enabled">{{ link_to("menu/info","Version 0.4m" )}}</li>  
        </ul>
    </li>
    <li class="enabled">{{ link_to("connexion/deconnexion","Déconnexion" )}}</li>  
</ul>
