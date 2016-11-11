<div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 bloc-connexion">
    <div class="row">
        {% if erreurs is iterable %}
          {% for erreur in erreurs %}
          <div class="alert alert-danger text-center col-xs-12 col-md-10 col-md-offset-1 col-lg-10 col-lg-offset-1 login_error" role="alert">{{erreur}}</div>
          {% endfor %}
        {%endif%}
    </div>
    <form method='post' action="{{roleUri}}">
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 text-center"> 
                <h3>Authentification</h3>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12 col-sm-5 col-md-5 text-right"> 
                <label for="username">Code utilisateur</label>
            </div>
            <div class="col-xs-12 col-sm-7 col-md-7  text-left"> 
                <input value="" name="username" id="username" class="form-control" maxlength="50" type="text"  />
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12 col-sm-5 col-md-5 text-right">
                <label for="password" class="login_label">Mot de passe</label>
            </div>
            <div class="col-xs-12 col-sm-7 col-md-7  text-left"> 
                <input name="password" id="password" class="form-control" maxlength="50" type="password" autocomplete="off"  />
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 text-center">
                <input class="btn btn-primary" type="submit" value="Se connecter" />
            </div>
        </div>
        <input type='hidden' name='submitted' id='submitted' value='1' />
    </form>              
</div>
{% if permettreAccesAnonyme == true %} 
<div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 bloc-connexion">
   <div class="row top-buffer-1">   
       <div id="login-title" class="col-xs-12 col-md-10 col-md-offset-1 text-center"><p><b>Ou accéder au site en tant qu'invité</b></p></div>
   </div>
   <div class="row">
       <div class="col-xs-12 col-md-12 text-center">
           <form method='post' action="{{anonymeUri}}">
               <input class="btn btn-primary"  type="submit" value="Se connecter en tant qu'invité" />
           </form>
        </div>
   </div>
</div>
{% endif  %}
