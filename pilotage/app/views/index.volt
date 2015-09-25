<!DOCTYPE html>
<html>
    <head>

        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="icon" href="{{ view.ajouterBaseUri() }}images/quebec/favicon.ico" />
        
        {{ javascript_include("js/jquery-1.11.0.js") }}
        {{ javascript_include("/igo/librairie/jquery-ui/jquery-ui.min.js", false) }}
        {{ javascript_include("js/bootstrap.js") }}
        {{ javascript_include("js/moment.js") }}
        {{ javascript_include("js/bootstrap-datetimepicker.js") }}
        {{ javascript_include("js/bootstrap-datetimepicker.fr.js") }}

        {{ javascript_include("js/main.js") }}

        {{ stylesheet_link("css/bootstrap.css") }}
        {{ stylesheet_link("css/bootstrap-theme.min.css") }}
        {{ stylesheet_link("css/bootstrap.override.css") }}

        {{ stylesheet_link("css/main.css") }}
        {{ stylesheet_link("css/mapfile.css") }}
        {{ stylesheet_link("css/arborescence/tree.css") }}
        {{ stylesheet_link("css/datepicker.css") }}

        <title> IGO - Gestion des métadonnées</title>
    </head>
    <body class="action-<?php echo $this->dispatcher->getActionName();?> <?php echo $this->view->getControllerName();?>">
        <div class="container">
            <div id="entete" >
                <!--div class="col-lg-12 col-md-12 col-sm-12 col xs12"-->
                    <a href="{{ url("") }}">{{ image("img/banniere_geo.jpg") }}</a>
                    {% include "menu/menu.volt" %}
                <!--/div-->       
            </div> 
                <?php $this->flash->output(); ?>
            {{ content() }}   
        </div>
        <script>
            $(document).ready(function () {
                if (window.name == "iframe") {
                    $("#entete").remove()
                }
            }
            );

        </script>
    </body>
</html>
