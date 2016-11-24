<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
The X-UA-Compatible meta element must be the first meta element in the head section.
-->
<html>
    <head>
        <title>{{titre}}</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">        
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width"> 
        <link rel="icon" href="{{ view.ajouterBaseUri() }}images/quebec/favicon.ico" />
    </head>
    <body>  
    {{ content() }}

	{% for module in modulesVues %}

	        <?php include($module); ?>

	{% endfor  %}
    </body>
</html>
