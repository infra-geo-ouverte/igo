<?php echo $this->getContent(); ?>

var config={};
<?php
foreach ($configClient as $key => $value) {
    if (is_object($value)){
        $codeJS = "{";
        $attributs = "";
        foreach ($value as $nom => $attribut) {
            if(is_bool($attribut)){
                $attributs .= $nom.":".var_export($attribut,true).",";
            } else if ($attribut=="true" || $attribut=="false"){
                $attributs .= $nom.":".$attribut.",";    
            } 
            else if (is_object($attribut)){ 
                $attributs .= $nom.": new Array(";
                foreach($attribut as $nom2 => $attribut2){
                    $attributs .= "'".$attribut2."',";
                }
                $attributs = substr($attributs, 0, -1);
                $attributs .= "),";
            }
            else if ($attribut!=""){
                $attributs .= $nom.":\"".$attribut."\",";
            }
        }
        $codeJS .= substr($attributs, 0, -1);
        $codeJS .= "}";
        
        echo "config['{$key}'] = {$codeJS};\n";
    }else {
        echo "config['{$key}'] = \"{$value}\";\n";
    }   
}
?>
Igo.Aide.definirConfig(config);