<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="icon" href="{{ view.ajouterBaseUri() }}images/quebec/favicon.ico" />
    <title>IGO - {{ titre }}  </title>

    {{ view.ajouterCss("css/connexion.css", false) }}
    {{ view.ajouterCss("css/bootstrap/bootstrap.css", false) }}     
    
    <!--[if lt IE 9]>
        {{ view.ajouterJavascript("js/html5shiv/3.7.2/html5shiv.min.js", false) }}
        {{ view.ajouterJavascript("js/respond/1.4.2/respond.min.js", false) }}
    <![endif]-->
</head>
<body>
<div class="container">
   {{ content() }}   
</div><!-- .container-->
</body>
</html>
