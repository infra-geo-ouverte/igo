<div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 bloc-connexion">
    <form method='post' action="{{accesUri}}">
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 text-center"> 
                <h3>{{titre}}</h3>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 text-center"> 
                <select name="profil" size="1">
                 {% for profil in session.info_utilisateur.profils %}
                    <option value="{{profil["id"]}}">{{profil["libelle"]}}</option>
                {% endfor  %}
                </select>
            </div>
        </div>    
        <div class="row">
            <div class="col-xs-12 col-md-12 text-center">
                {% if accesTotalUri and accesTotalUri !== "" %}
                    <input class="btn btn-primary" type="submit" formaction="{{accesTotalUri}}" value="Tous les profils" />
                {% endif  %}
                <input class="btn btn-primary" type="submit" value="Se connecter" />
            </div>
        </div>    
    </form>
</div>
