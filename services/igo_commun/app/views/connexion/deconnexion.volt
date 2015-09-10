<div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 bloc-connexion">
    <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 text-center"> 
            <h3>Déconnexion</h3>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 text-center"> 
          Vous êtes maintenant déconnecté.
        </div>
    </div>
    {% if pageRedirection and pageRedirection !== "" %}
    <div class="row">
        <div class="col-xs-12 col-md-12 text-center">
            <span><a href="{{pageRedirection}}">Retour au navigateur</a></span>
            {% if seConnecter and seConnecter !== "" %}
            <span> | </span>
            <span><a href="{{pageRedirection}}?force-auth=true">Se connecter</a></span>
            {% endif  %}
        </div>
    </div>
    {% endif  %}
    {% if pageAccueil %}
    <div class="row">
        <div class="col-xs-12 col-md-12 text-center">
            <p><a href="{{pageAccueil}}">Retour à l'accueil</a></p>
        </div>
    </div>
    {% endif  %}
</div>
