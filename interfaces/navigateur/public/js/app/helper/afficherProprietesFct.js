$(document).on('click', '#infoResultatsWindows .toggleItem', function (ev) {
    var that = $(this);
    ev.stopPropagation();
    ev.preventDefault();
    $(that).next().toggle('fast', function () {
        if ($(that).parent().hasClass('x-grid-group-collapsed')) {
            $(that).parent().removeClass('x-grid-group-collapsed');
        } else {
            $(that).parent().addClass('x-grid-group-collapsed');
        }
    });
});

$(document).on('click', '#infoResultatsWindows .infoObjetMore', function (e) {
    var $this = $(this);
    e.stopPropagation();
    e.preventDefault();

    var valeur = $this.find(".x-grid3-col-Valeur");
    if(valeur.text() === "-"){
        valeur.text("+");
    } else {
        valeur.text("-");
    }

    var key = $this.find(".x-grid3-cell-first").text().trim();
    var regexOuvrir = new RegExp("^"+key.replace(".", "\\.")+"\\.\\d+$");
    var regexContinuer = new RegExp("^"+key.replace(".", "\\.")+"\\.\\d+\\.");
    var $next = $this;
    var continuer = true;
    do {
        $next = $next.next();
        var keyNext = $next.find(".x-grid3-cell-first").text().trim();
   
        if(keyNext && keyNext.match(regexOuvrir)) {
            if($next.find(".x-grid3-col-Valeur").text() === "-"){
                $next.click();
            }
            $next.toggle('fast');
        } else if (!keyNext.match(regexContinuer)) {
            continuer = false;
        } 
    } while (continuer);
});